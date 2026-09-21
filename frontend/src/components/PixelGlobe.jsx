import React, { useRef, useEffect, useState } from 'react';
import { GEOGRAPHY_REALMS } from '../data/geographyRealms';
import { retroAudio } from '../audio/retroAudio';
import { Compass, Pause, Play, Globe2 } from 'lucide-react';

const GLOBE_VIEW_SCALE = 2;
const GLOBE_RADIUS = 175 * GLOBE_VIEW_SCALE;
const GLOBE_CANVAS_W = 520 * GLOBE_VIEW_SCALE;
const GLOBE_CANVAS_H = 440 * GLOBE_VIEW_SCALE;

const GLOBE_LABEL_PASS = 16;

const GLOBE_LABELS = [
  { name: 'NORTH AMERICA', lat: 48, lng: -100 },
  { name: 'SOUTH AMERICA', lat: -16, lng: -60 },
  { name: 'AFRICA', lat: 8, lng: 20 },
  { name: 'EUROPE', lat: 54, lng: 18 },
  { name: 'ASIA', lat: 40, lng: 90 },
  { name: 'AUSTRALIA', lat: -25, lng: 134 },
  { name: 'ATLANTIC', lat: 24, lng: -38 },
  { name: 'INDIAN OCEAN', lat: -16, lng: 78 },
  { name: 'PACIFIC', lat: 8, lng: -145 },
  { name: 'PACIFIC', lat: 18, lng: 168 }
];

function latLngToVec(latDeg, lngDeg) {
  const lat = (latDeg * Math.PI) / 180;
  const lng = (lngDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return [cosLat * Math.sin(lng), Math.sin(lat), cosLat * Math.cos(lng)];
}

function drawHaloLabel(ctx, text, x, y, fill, font, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = font;
  ctx.letterSpacing = '1px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(text);
  const boxW = metrics.width + 24;
  const boxH = 36;
  const bx = Math.round(x - boxW / 2);
  const by = Math.round(y - boxH / 2);
  ctx.fillStyle = 'rgba(4, 10, 24, 0.88)';
  ctx.fillRect(bx, by, Math.round(boxW), boxH);
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.28)';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 0.5, Math.round(boxW) - 1, boxH - 1);
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(4, 10, 24, 0.95)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function canvasPointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function mulMat(A, B) {
  return [
    A[0] * B[0] + A[1] * B[3] + A[2] * B[6],
    A[0] * B[1] + A[1] * B[4] + A[2] * B[7],
    A[0] * B[2] + A[1] * B[5] + A[2] * B[8],
    A[3] * B[0] + A[4] * B[3] + A[5] * B[6],
    A[3] * B[1] + A[4] * B[4] + A[5] * B[7],
    A[3] * B[2] + A[4] * B[5] + A[5] * B[8],
    A[6] * B[0] + A[7] * B[3] + A[8] * B[6],
    A[6] * B[1] + A[7] * B[4] + A[8] * B[7],
    A[6] * B[2] + A[7] * B[5] + A[8] * B[8]
  ];
}

function applyMat(M, x, y, z) {
  return [
    M[0] * x + M[1] * y + M[2] * z,
    M[3] * x + M[4] * y + M[5] * z,
    M[6] * x + M[7] * y + M[8] * z
  ];
}

function rotX(a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

function rotY(a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

function rotAxisAngle(ax, ay, az, angle) {
  const len = Math.hypot(ax, ay, az) || 1;
  ax /= len;
  ay /= len;
  az /= len;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  return [
    t * ax * ax + c, t * ax * ay - s * az, t * ax * az + s * ay,
    t * ax * ay + s * az, t * ay * ay + c, t * ay * az - s * ax,
    t * ax * az - s * ay, t * ay * az + s * ax, t * az * az + c
  ];
}

function orthonormalize(M) {
  let x0 = M[0];
  let x1 = M[3];
  let x2 = M[6];
  const xLen = Math.hypot(x0, x1, x2) || 1;
  x0 /= xLen;
  x1 /= xLen;
  x2 /= xLen;
  let y0 = M[1];
  let y1 = M[4];
  let y2 = M[7];
  const d = x0 * y0 + x1 * y1 + x2 * y2;
  y0 -= x0 * d;
  y1 -= x1 * d;
  y2 -= x2 * d;
  const yLen = Math.hypot(y0, y1, y2) || 1;
  y0 /= yLen;
  y1 /= yLen;
  y2 /= yLen;
  return [
    x0, y0, x1 * y2 - x2 * y1,
    x1, y1, x2 * y0 - x0 * y2,
    x2, y2, x0 * y1 - x1 * y0
  ];
}

function projectToSphere(x, y, cx, cy, radius) {
  let dx = (x - cx) / radius;
  let dy = (cy - y) / radius;
  const d2 = dx * dx + dy * dy;
  if (d2 > 1) {
    const inv = 1 / Math.sqrt(d2);
    return [dx * inv, dy * inv, 0];
  }
  return [dx, dy, Math.sqrt(1 - d2)];
}

function initialGlobeRotation() {
  return mulMat(rotX(0.18), rotY(-0.35));
}

export default function PixelGlobe({ onSelectRealm, activeRealmId }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpinning, setIsSpinning] = useState(true);
  const [spinSpeed, setSpinSpeed] = useState(0.0012); // Smooth, gentle rotation speed
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);
  const [hoveredRealm, setHoveredRealm] = useState(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  const rotationRef = useRef(initialGlobeRotation());
  const isSpinningRef = useRef(true);
  const spinSpeedRef = useRef(0.0012);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const isMouseOverCanvasRef = useRef(false);
  const hoveredRealmRef = useRef(null);
  const textureDataRef = useRef(null);
  const warpRef = useRef(null);
  const dragDistanceRef = useRef(0);
  const pinTooltipRef = useRef(null);

  // Sync refs with state
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useEffect(() => {
    spinSpeedRef.current = spinSpeed;
  }, [spinSpeed]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    isMouseOverCanvasRef.current = isMouseOverCanvas;
  }, [isMouseOverCanvas]);

  // Load the AI pixel-art equirectangular globe skin
  useEffect(() => {
    const img = new Image();
    img.src = `/world_globe_skin.jpg?v=${GLOBE_LABEL_PASS}`;
    img.onload = () => {
      const offCanvas = document.createElement('canvas');
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d');
      offCtx.imageSmoothingEnabled = false;
      offCtx.drawImage(img, 0, 0, w, h);
      const imgData = offCtx.getImageData(0, 0, w, h);
      textureDataRef.current = {
        data: imgData.data,
        width: w,
        height: h
      };
      setTextureLoaded(true);
    };
  }, []);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let tick = 0;

    const render = () => {
      tick++;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = GLOBE_RADIUS;

      // Check if mouse is hovering over globe
      const lastMouse = lastMouseRef.current;
      const distToCenter = Math.hypot(lastMouse.x - cx, lastMouse.y - cy);
      const isHoveringGlobe = isMouseOverCanvasRef.current && distToCenter <= radius * 1.15;

      // Gentle auto-rotation with hover slowdown
      if (isSpinningRef.current && !isDraggingRef.current) {
        let effectiveSpeed = spinSpeedRef.current;
        if (hoveredRealmRef.current) {
          effectiveSpeed = 0.0001;
        } else if (isHoveringGlobe) {
          effectiveSpeed = spinSpeedRef.current * 0.25;
        }

        rotationRef.current = mulMat(rotationRef.current, rotY(effectiveSpeed));
      }

      // 1. Starry Space Background
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, width, height);

      // Distant twinkle stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 97.3) % width;
        const sy = (i * 181.7) % height;
        if (Math.hypot(sx - cx, sy - cy) > radius + 12) {
          const sz = (i % 5 === 0) ? 2 : 1;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), sz, sz);
        }
      }

      // 2. Outer Atmospheric Glow (Radial Gradient)
      const atmGlow = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.18);
      atmGlow.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      atmGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      atmGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = atmGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // 3. Spherical Texture Mapping
      if (textureDataRef.current) {
        const { data: texData, width: texW, height: texH } = textureDataRef.current;
        const outputImgData = ctx.createImageData(width, height);
        const outData = outputImgData.data;

        const R = rotationRef.current;
        const Rt = [R[0], R[3], R[6], R[1], R[4], R[7], R[2], R[5], R[8]];

        const startX = Math.max(0, Math.floor(cx - radius));
        const endX = Math.min(width, Math.ceil(cx + radius));
        const startY = Math.max(0, Math.floor(cy - radius));
        const endY = Math.min(height, Math.ceil(cy + radius));

        const radiusSq = radius * radius;
        // Directional Sun vector from upper-left-front
        const lx = -0.38;
        const ly = 0.45;
        const lz = 0.81;

        for (let y = startY; y < endY; y += 1) {
          const dy = y - cy;
          const dySq = dy * dy;
          const ny = -dy / radius;

          for (let x = startX; x < endX; x += 1) {
            const dx = x - cx;
            const distSq = dx * dx + dySq;

            if (distSq <= radiusSq) {
              const nx = dx / radius;
              const nz = Math.sqrt(Math.max(0, 1 - (nx * nx + ny * ny)));

              const [gx, gy, gz] = applyMat(Rt, nx, ny, nz);
              const lat = Math.asin(Math.max(-1, Math.min(1, gy)));
              const lng = Math.atan2(gx, gz);

              // Normalized UV texture coords
              // Equirectangular maps put u=0 at 180°W, not Greenwich
              const u = (((lng / (Math.PI * 2)) + 1.5) % 1 + 1) % 1;
              const v = Math.max(0, Math.min(1, 0.5 - lat / Math.PI));

              const tx = Math.floor(u * (texW - 1));
              const ty = Math.floor(v * (texH - 1));
              const texIdx = (ty * texW + tx) * 4;

              let r = texData[texIdx];
              let g = texData[texIdx + 1];
              let b = texData[texIdx + 2];

              // Fixed-scene sunlight so the globe rolls under the lamp
              const dot = nx * lx + ny * ly + nz * lz;
              const lightIntensity = Math.max(0.28, Math.min(1.12, 0.62 + dot * 0.5));

              r = Math.floor(r * lightIntensity);
              g = Math.floor(g * lightIntensity);
              b = Math.floor(b * lightIntensity);

              const rim = 1 - nz;
              if (rim > 0.84) {
                r = Math.min(255, Math.floor(r * 0.82 + 18));
                g = Math.min(255, Math.floor(g * 0.9 + 40));
                b = Math.min(255, Math.floor(b * 0.9 + 70));
              }

              const pIdx = (y * width + x) * 4;
              outData[pIdx] = r;
              outData[pIdx + 1] = g;
              outData[pIdx + 2] = b;
              outData[pIdx + 3] = 255;
            }
          }
        }

        ctx.putImageData(outputImgData, 0, 0);
      } else {
        // Fallback smooth deep ocean globe while texture prepares
        ctx.fillStyle = '#0369a1';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Lat / lng grid that rolls with the globe
      const globeR = rotationRef.current;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 1;
      const strokeSphereCurve = (points) => {
        ctx.beginPath();
        let drawing = false;
        for (const [gx, gy, gz] of points) {
          const [vx, vy, vz] = applyMat(globeR, gx, gy, gz);
          if (vz > 0.04) {
            const px = cx + vx * radius;
            const py = cy - vy * radius;
            if (drawing) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
            drawing = true;
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      };
      for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
        const lat = (latDeg * Math.PI) / 180;
        const cosLat = Math.cos(lat);
        const sinLat = Math.sin(lat);
        const pts = [];
        for (let i = 0; i <= 72; i++) {
          const lng = (i / 72) * Math.PI * 2;
          pts.push([cosLat * Math.sin(lng), sinLat, cosLat * Math.cos(lng)]);
        }
        strokeSphereCurve(pts);
      }
      for (let lngDeg = 0; lngDeg < 180; lngDeg += 30) {
        const lng = (lngDeg * Math.PI) / 180;
        const pts = [];
        for (let i = 0; i <= 48; i++) {
          const lat = -Math.PI / 2 + (i / 48) * Math.PI;
          const cosLat = Math.cos(lat);
          pts.push([cosLat * Math.sin(lng), Math.sin(lat), cosLat * Math.cos(lng)]);
        }
        strokeSphereCurve(pts);
      }

      const pinMarks = [];
      GEOGRAPHY_REALMS.forEach((realm) => {
        const [gx, gy, gz] = latLngToVec(realm.coords.lat, realm.coords.lng);
        const [vx, vy, vz] = applyMat(globeR, gx, gy, gz);
        if (vz <= 0.08) return;
        pinMarks.push({
          realm,
          vx,
          vy,
          vz,
          px: Math.floor(cx + vx * radius),
          py: Math.floor(cy - vy * radius)
        });
      });

      GLOBE_LABELS.forEach((label) => {
        const [gx, gy, gz] = latLngToVec(label.lat, label.lng);
        const [vx, vy, vz] = applyMat(globeR, gx, gy, gz);
        if (vz < 0.5) return;
        const lx = cx + vx * radius;
        const ly = cy - vy * radius;
        const coversPin = pinMarks.some((pin) => pin.vz > 0.2 && Math.hypot(pin.px - lx, pin.py - ly) < 56);
        if (coversPin) return;
        const longName = label.name.length > 10;
        drawHaloLabel(
          ctx,
          label.name,
          lx,
          ly,
          '#fff7ed',
          longName ? '800 26px Outfit, sans-serif' : '800 30px Outfit, sans-serif',
          Math.min(1, Math.max(0.82, (vz - 0.45) / 0.4))
        );
      });

      let currentHover = null;
      let hoverPx = 0;
      let hoverPy = 0;
      let hoverDist = 30;
      pinMarks.forEach((pin) => {
        const { realm, px, py, vz } = pin;
        const isFront = vz > 0.2;
        const dist = Math.hypot(lastMouse.x - px, lastMouse.y - py);
        if (!isDraggingRef.current && isMouseOverCanvasRef.current && isFront && dist < hoverDist) {
          currentHover = realm;
          hoverPx = px;
          hoverPy = py;
          hoverDist = dist;
        }

        const isHovered = hoveredRealmRef.current?.id === realm.id || currentHover?.id === realm.id;
        const isActive = activeRealmId === realm.id;
        const pulse = Math.sin(tick * 0.1) * (isHovered ? 1.1 : 1.4);

        if (isHovered) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.beginPath();
          ctx.arc(px, py, 20, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = isHovered || isActive ? '#fbbf24' : realm.themeColor;
        ctx.lineWidth = isHovered ? 2.5 : 2;
        ctx.beginPath();
        ctx.arc(px, py, (isHovered ? 11 : 8) + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isHovered || isActive ? '#fff7ed' : realm.themeColor;
        ctx.fillRect(px - 3, py - 3, 6, 6);
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 3.5, py - 3.5, 7, 7);
      });

      if (currentHover?.id !== hoveredRealmRef.current?.id) {
        hoveredRealmRef.current = currentHover;
        setHoveredRealm(currentHover);
      }

      const tip = pinTooltipRef.current;
      if (tip) {
        if (currentHover && !isDraggingRef.current) {
          const scaleX = canvas.clientWidth / canvas.width;
          const scaleY = canvas.clientHeight / canvas.height;
          const cssX = hoverPx * scaleX;
          const cssY = hoverPy * scaleY;
          const tipW = tip.offsetWidth || 180;
          const tipH = tip.offsetHeight || 56;
          const pad = 10;
          const placeAbove = cssY > tipH + 22;
          let left = cssX - tipW / 2;
          left = Math.max(pad, Math.min(left, canvas.clientWidth - tipW - pad));
          const top = placeAbove ? cssY - tipH - 16 : cssY + 16;
          tip.style.opacity = '1';
          tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
          tip.dataset.edge = placeAbove ? 'above' : 'below';
        } else {
          tip.style.opacity = '0';
        }
      }

      // 6. Warp Zoom Transition
      if (warpRef.current) {
        warpRef.current.progress += 0.08;
        const progress = Math.min(1, warpRef.current.progress);
        ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
        ctx.fillRect(0, 0, width, height);
        if (progress >= 1 && !warpRef.current.fired) {
          warpRef.current.fired = true;
          const target = warpRef.current.realm;
          warpRef.current = null;
          onSelectRealm(target);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [textureLoaded, activeRealmId, onSelectRealm, GLOBE_LABEL_PASS]);

  const startWarp = (realm) => {
    if (!realm || warpRef.current) return;
    retroAudio.playWarp();
    warpRef.current = { realm, progress: 0, fired: false };
  };

  // Mouse drag handlers
  const applyTrackballDrag = (fromX, fromY, toX, toY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const a = projectToSphere(fromX, fromY, cx, cy, GLOBE_RADIUS);
    const b = projectToSphere(toX, toY, cx, cy, GLOBE_RADIUS);
    const axisX = a[1] * b[2] - a[2] * b[1];
    const axisY = a[2] * b[0] - a[0] * b[2];
    const axisZ = a[0] * b[1] - a[1] * b[0];
    if (Math.hypot(axisX, axisY, axisZ) < 1e-8) return;
    const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    const angle = Math.acos(dot);
    if (angle < 1e-5) return;
    rotationRef.current = orthonormalize(
      mulMat(rotAxisAngle(axisX, axisY, axisZ, angle), rotationRef.current)
    );
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // synthetic / untrusted events may not support capture
    }
    isDraggingRef.current = true;
    setIsDragging(true);
    setHoveredRealm(null);
    hoveredRealmRef.current = null;
    dragDistanceRef.current = 0;
    const { x, y } = canvasPointFromEvent(canvasRef.current, e);
    lastMouseRef.current = { x, y, prevX: x, prevY: y };
  };

  const handlePointerMove = (e) => {
    const { x, y } = canvasPointFromEvent(canvasRef.current, e);
    if (isDraggingRef.current) {
      const prevX = lastMouseRef.current.x ?? x;
      const prevY = lastMouseRef.current.y ?? y;
      dragDistanceRef.current += Math.abs(x - prevX) + Math.abs(y - prevY);
      applyTrackballDrag(prevX, prevY, x, y);
    }
    lastMouseRef.current = { x, y, prevX: lastMouseRef.current.x, prevY: lastMouseRef.current.y };
  };

  const endDrag = (e) => {
    try {
      if (e?.currentTarget?.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleCanvasClick = () => {
    if (dragDistanceRef.current > 8) return;
    if (hoveredRealm && !warpRef.current) {
      startWarp(hoveredRealm);
    }
  };

  const handleQuickWarp = (realm) => {
    startWarp(realm);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-5xl">
      {/* Globe Top HUD Controls */}
      <div className="w-full flex items-center justify-between mb-2 sm:mb-3 px-1 sm:px-2 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Globe2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
          <span className="font-pixel text-[9px] sm:text-xs text-cyan-300">16-BIT PLANETARY GLOBE</span>
        </div>

        {/* Spin Speed Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsSpinning(!isSpinning)}
            className={`btn-pixel text-[8px] sm:text-[10px] py-1 px-2 sm:px-3 flex items-center gap-1 ${isSpinning ? 'btn-pixel-primary' : ''}`}
            title="Toggle Spin / Pause"
          >
            {isSpinning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isSpinning ? 'PAUSE' : 'SPIN'}</span>
          </button>

          <button
            onClick={() => setSpinSpeed(s => s === 0.0006 ? 0.0012 : 0.0006)}
            className="btn-pixel text-[8px] sm:text-[9px] py-1 px-1.5 sm:px-2.5"
            title="Toggle Slow / Normal Speed"
          >
            {spinSpeed === 0.0006 ? 'SLOW' : 'FAST'}
          </button>
        </div>
      </div>

      {/* Main Pixel Canvas Box */}
      <div className="relative pixel-box pixel-box-cyan rounded-lg overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-1 sm:p-2 w-fit mx-auto">
        <div className="relative">
        <canvas
          ref={canvasRef}
          width={GLOBE_CANVAS_W}
          height={GLOBE_CANVAS_H}
          className={`globe-canvas select-none ${isDragging ? 'cursor-grabbing' : hoveredRealm ? 'cursor-pointer' : 'cursor-grab'}`}
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerEnter={() => setIsMouseOverCanvas(true)}
          onPointerLeave={() => {
            if (!isDraggingRef.current) {
              setIsMouseOverCanvas(false);
              hoveredRealmRef.current = null;
              setHoveredRealm(null);
            }
          }}
          onClick={handleCanvasClick}
          onContextMenu={(e) => e.preventDefault()}
        />

        <div
          ref={pinTooltipRef}
          className={`globe-pin-tooltip ${hoveredRealm && !isDragging ? 'is-on' : ''}`}
          aria-hidden={!hoveredRealm}
        >
          {hoveredRealm && (
            <>
              <span className="globe-pin-tooltip-avatar">{hoveredRealm.npc.avatar}</span>
              <div className="globe-pin-tooltip-copy">
                <div className="globe-pin-tooltip-name">{hoveredRealm.name}</div>
                <div className="globe-pin-tooltip-meta">
                  {hoveredRealm.region}
                  <span>CLICK TO ENTER</span>
                </div>
              </div>
            </>
          )}
        </div>
        </div>

      </div>

      {/* Subtle Hint Bar Underneath Canvas */}
      <div className="mt-2 text-center text-[9px] sm:text-[10px] font-mono text-cyan-400/90 bg-slate-900/90 px-3 py-1.5 border border-cyan-500/30 rounded flex items-center justify-center gap-1.5 max-w-sm">
        <span className="text-amber-400 font-pixel text-[8px] animate-pulse">●</span>
        <span>DRAG TO ROLL GLOBE • CLICK TO EXPLORE</span>
      </div>

      {/* Available Geographical Waypoints Bar */}
      <div className="w-full max-w-5xl mt-3 sm:mt-4">
        <div className="font-pixel text-[9px] sm:text-[10px] text-slate-400 mb-2 flex items-center gap-2 px-1">
          <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>AVAILABLE GEOGRAPHICAL WAYPOINTS ({GEOGRAPHY_REALMS.length}):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {GEOGRAPHY_REALMS.map(realm => {
            const isActive = activeRealmId === realm.id;
            return (
              <button
                key={realm.id}
                onClick={() => handleQuickWarp(realm)}
                className={`waypoint-card ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{realm.npc.avatar}</span>
                  <span className="font-mono text-[9px] text-cyan-400 uppercase">{realm.region}</span>
                </div>
                <div className="font-pixel text-[8px] text-slate-100 line-clamp-2 leading-tight">
                  {realm.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
