import React, { useEffect, useRef, useState } from 'react';
import { Atom, Orbit, Pause, Play } from 'lucide-react';
import { PHYSICS_REALMS } from '../data/physicsRealms';
import { retroAudio } from '../audio/retroAudio';

const ATOM_VIEW_SCALE = 2;
const ATOM_RADIUS = 175 * ATOM_VIEW_SCALE;
const ATOM_CANVAS_W = 520 * ATOM_VIEW_SCALE;
const ATOM_CANVAS_H = 440 * ATOM_VIEW_SCALE;

const NUCLEUS_PARTICLES = [
  [-2, -1, 'p'], [-1, -2, 'n'], [0, -2, 'p'], [1, -2, 'n'],
  [-2, 0, 'n'], [-1, -1, 'p'], [0, -1, 'n'], [1, -1, 'p'], [2, -1, 'n'],
  [-2, 1, 'p'], [-1, 0, 'n'], [0, 0, 'p'], [1, 0, 'n'], [2, 0, 'p'],
  [-1, 1, 'p'], [0, 1, 'n'], [1, 1, 'p'], [2, 1, 'n'],
  [-1, 2, 'n'], [0, 2, 'p'], [1, 2, 'n']
];

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

function initialAtomRotation() {
  return mulMat(rotX(0.18), rotY(-0.35));
}

function orbitTransform(index, total) {
  const turn = (index / Math.max(1, total)) * Math.PI * 2;
  const tilt = -0.95 + (index % 4) * 0.62;
  return mulMat(rotY(turn), rotX(tilt));
}

function orbitRadius(index, total) {
  const spread = total <= 1 ? 0 : index / (total - 1);
  return 0.7 + spread * 0.27;
}

function electronAngle(index, tick) {
  const direction = index % 2 === 0 ? 1 : -1;
  const speed = 0.007 + (index % 4) * 0.0012;
  const offset = index * 2.399963229728653;
  return offset + tick * speed * direction;
}

function drawRealmLabel(ctx, realm, x, y, depth, index) {
  const label = realm.name.toUpperCase();
  const offsetX = index % 2 === 0 ? 16 : -16;
  const align = index % 2 === 0 ? 'left' : 'right';
  ctx.save();
  ctx.globalAlpha = Math.max(0.38, Math.min(0.9, 0.55 + depth * 0.32));
  ctx.font = '700 16px "Press Start 2P", monospace';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(4, 7, 17, 0.95)';
  ctx.strokeText(label, x + offsetX, y);
  ctx.fillStyle = realm.themeColor;
  ctx.fillText(label, x + offsetX, y);
  ctx.restore();
}

export default function PhysicsAtom({ onSelectRealm, activeRealmId }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpinning, setIsSpinning] = useState(true);
  const [spinSpeed, setSpinSpeed] = useState(0.0012);
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);
  const [hoveredRealm, setHoveredRealm] = useState(null);

  const rotationRef = useRef(initialAtomRotation());
  const isSpinningRef = useRef(true);
  const spinSpeedRef = useRef(0.0012);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const isMouseOverCanvasRef = useRef(false);
  const hoveredRealmRef = useRef(null);
  const warpRef = useRef(null);
  const dragDistanceRef = useRef(0);
  const pinTooltipRef = useRef(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let animationFrameId;
    let tick = 0;

    const render = () => {
      tick++;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = ATOM_RADIUS;
      const lastMouse = lastMouseRef.current;
      const distToCenter = Math.hypot(lastMouse.x - cx, lastMouse.y - cy);
      const isHoveringAtom = isMouseOverCanvasRef.current && distToCenter <= radius * 1.16;

      if (isSpinningRef.current && !isDraggingRef.current) {
        let effectiveSpeed = spinSpeedRef.current;
        if (hoveredRealmRef.current) {
          effectiveSpeed = 0.0001;
        } else if (isHoveringAtom) {
          effectiveSpeed = spinSpeedRef.current * 0.25;
        }
        rotationRef.current = mulMat(rotationRef.current, rotY(effectiveSpeed));
      }

      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 97.3) % width;
        const sy = (i * 181.7) % height;
        if (Math.hypot(sx - cx, sy - cy) > radius * 0.34) {
          const sz = i % 5 === 0 ? 2 : 1;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), sz, sz);
        }
      }

      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius * 1.08);
      outerGlow.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
      outerGlow.addColorStop(0.24, 'rgba(6, 182, 212, 0.14)');
      outerGlow.addColorStop(0.72, 'rgba(56, 189, 248, 0.045)');
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
      ctx.fill();

      const atomR = rotationRef.current;
      const orbitData = PHYSICS_REALMS.map((realm, index) => {
        const localR = orbitTransform(index, PHYSICS_REALMS.length);
        const combinedR = mulMat(atomR, localR);
        const ringRadius = orbitRadius(index, PHYSICS_REALMS.length);
        const points = [];
        for (let step = 0; step <= 96; step++) {
          const angle = (step / 96) * Math.PI * 2;
          const [vx, vy, vz] = applyMat(combinedR, Math.cos(angle) * ringRadius, 0, Math.sin(angle) * ringRadius);
          points.push({
            px: cx + vx * radius,
            py: cy - vy * radius,
            vz
          });
        }
        const angle = electronAngle(index, tick);
        const [vx, vy, vz] = applyMat(combinedR, Math.cos(angle) * ringRadius, 0, Math.sin(angle) * ringRadius);
        return {
          realm,
          index,
          points,
          electron: {
            vx,
            vy,
            vz,
            px: Math.floor(cx + vx * radius),
            py: Math.floor(cy - vy * radius)
          }
        };
      });

      orbitData.forEach(({ points }) => {
        for (let step = 1; step < points.length; step++) {
          if (step % 3 === 0) continue;
          const previous = points[step - 1];
          const current = points[step];
          const depth = (previous.vz + current.vz) / 2;
          ctx.strokeStyle = depth < 0
            ? 'rgba(34, 211, 238, 0.065)'
            : 'rgba(103, 232, 249, 0.24)';
          ctx.lineWidth = depth < 0 ? 1 : 1.5;
          ctx.beginPath();
          ctx.moveTo(previous.px, previous.py);
          ctx.lineTo(current.px, current.py);
          ctx.stroke();
        }
      });

      const electronMarks = orbitData.map(({ realm, index, electron }) => ({ realm, index, ...electron }));
      electronMarks
        .filter((electron) => electron.vz <= 0)
        .forEach((electron) => {
          ctx.globalAlpha = 0.24;
          ctx.fillStyle = electron.realm.themeColor;
          ctx.fillRect(electron.px - 5, electron.py - 5, 10, 10);
          ctx.globalAlpha = 1;
        });

      const nucleusPulse = 1 + Math.sin(tick * 0.055) * 0.045;
      const nucleusGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 92 * nucleusPulse);
      nucleusGlow.addColorStop(0, 'rgba(251, 191, 36, 0.48)');
      nucleusGlow.addColorStop(0.48, 'rgba(6, 182, 212, 0.18)');
      nucleusGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = nucleusGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 92 * nucleusPulse, 0, Math.PI * 2);
      ctx.fill();

      const particleSize = 21 * nucleusPulse;
      const particleGap = 3;
      NUCLEUS_PARTICLES.forEach(([gx, gy, type], index) => {
        const px = Math.round(cx + gx * (particleSize - particleGap) - particleSize / 2);
        const py = Math.round(cy + gy * (particleSize - particleGap) - particleSize / 2);
        const front = (index + Math.floor(tick / 20)) % 5 === 0;
        ctx.fillStyle = type === 'p'
          ? (front ? '#fde68a' : '#f59e0b')
          : (front ? '#a5f3fc' : '#64748b');
        ctx.fillRect(px, py, Math.ceil(particleSize), Math.ceil(particleSize));
        ctx.strokeStyle = type === 'p' ? '#92400e' : '#164e63';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, Math.ceil(particleSize) - 2, Math.ceil(particleSize) - 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(px + 3, py + 3, 5, 5);
      });

      let currentHover = null;
      let hoverPx = 0;
      let hoverPy = 0;
      let hoverDist = 34;

      electronMarks
        .filter((electron) => electron.vz > 0)
        .sort((a, b) => a.vz - b.vz)
        .forEach((electron) => {
          const { realm, px, py, vz, index } = electron;
          const dist = Math.hypot(lastMouse.x - px, lastMouse.y - py);
          if (!isDraggingRef.current && isMouseOverCanvasRef.current && vz > 0.05 && dist < hoverDist) {
            currentHover = realm;
            hoverPx = px;
            hoverPy = py;
            hoverDist = dist;
          }

          const isHovered = hoveredRealmRef.current?.id === realm.id || currentHover?.id === realm.id;
          const isActive = activeRealmId === realm.id;
          const pulse = Math.sin(tick * 0.1 + index) * (isHovered ? 2 : 1.2);

          if (isHovered) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
            ctx.fillRect(px - 20, py - 20, 40, 40);
          }

          ctx.strokeStyle = isHovered || isActive ? '#fbbf24' : realm.themeColor;
          ctx.lineWidth = isHovered ? 3 : 2;
          const outlineSize = (isHovered ? 18 : 14) + pulse;
          ctx.strokeRect(px - outlineSize / 2, py - outlineSize / 2, outlineSize, outlineSize);
          ctx.fillStyle = isHovered || isActive ? '#fff7ed' : realm.themeColor;
          ctx.fillRect(px - 5, py - 5, 10, 10);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.fillRect(px - 3, py - 3, 3, 3);
          drawRealmLabel(ctx, realm, px, py - 21, vz, index);
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
  }, [activeRealmId, onSelectRealm]);

  const startWarp = (realm) => {
    if (!realm || warpRef.current) return;
    retroAudio.playWarp();
    warpRef.current = { realm, progress: 0, fired: false };
  };

  const applyTrackballDrag = (fromX, fromY, toX, toY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const a = projectToSphere(fromX, fromY, cx, cy, ATOM_RADIUS);
    const b = projectToSphere(toX, toY, cx, cy, ATOM_RADIUS);
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

  const handlePointerDown = (event) => {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // synthetic / untrusted events may not support capture
    }
    isDraggingRef.current = true;
    setIsDragging(true);
    setHoveredRealm(null);
    hoveredRealmRef.current = null;
    dragDistanceRef.current = 0;
    const { x, y } = canvasPointFromEvent(canvasRef.current, event);
    lastMouseRef.current = { x, y, prevX: x, prevY: y };
  };

  const handlePointerMove = (event) => {
    const { x, y } = canvasPointFromEvent(canvasRef.current, event);
    if (isDraggingRef.current) {
      const prevX = lastMouseRef.current.x ?? x;
      const prevY = lastMouseRef.current.y ?? y;
      dragDistanceRef.current += Math.abs(x - prevX) + Math.abs(y - prevY);
      applyTrackballDrag(prevX, prevY, x, y);
    }
    lastMouseRef.current = { x, y, prevX: lastMouseRef.current.x, prevY: lastMouseRef.current.y };
  };

  const endDrag = (event) => {
    try {
      if (event?.currentTarget?.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
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

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-5xl">
      <div className="w-full flex items-center justify-between mb-2 sm:mb-3 px-1 sm:px-2 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Atom className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
          <span className="font-pixel text-[9px] sm:text-xs text-cyan-300">16-BIT ATOMIC MODEL</span>
        </div>

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
            onClick={() => setSpinSpeed((speed) => speed === 0.0006 ? 0.0012 : 0.0006)}
            className="btn-pixel text-[8px] sm:text-[9px] py-1 px-1.5 sm:px-2.5"
            title="Toggle Slow / Normal Speed"
          >
            {spinSpeed === 0.0006 ? 'SLOW' : 'FAST'}
          </button>
        </div>
      </div>

      <div className="relative pixel-box pixel-box-cyan rounded-lg overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-1 sm:p-2 w-fit mx-auto">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={ATOM_CANVAS_W}
            height={ATOM_CANVAS_H}
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
            onContextMenu={(event) => event.preventDefault()}
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

      <div className="mt-2 text-center text-[9px] sm:text-[10px] font-mono text-cyan-400/90 bg-slate-900/90 px-3 py-1.5 border border-cyan-500/30 rounded flex items-center justify-center gap-1.5 max-w-sm">
        <span className="text-amber-400 font-pixel text-[8px] animate-pulse">●</span>
        <span>DRAG TO ORBIT • CLICK TO EXPLORE</span>
      </div>

      <div className="w-full max-w-5xl mt-3 sm:mt-4">
        <div className="font-pixel text-[9px] sm:text-[10px] text-slate-400 mb-2 flex items-center gap-2 px-1">
          <Orbit className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>AVAILABLE PHYSICS WAYPOINTS ({PHYSICS_REALMS.length}):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PHYSICS_REALMS.map((realm) => {
            const isActive = activeRealmId === realm.id;
            return (
              <button
                key={realm.id}
                onClick={() => startWarp(realm)}
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
