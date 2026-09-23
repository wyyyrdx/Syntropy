import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Pause, Play } from 'lucide-react';
import { BIOLOGY_REALMS } from '../data/biologyRealms';
import { retroAudio } from '../audio/retroAudio';

const CANVAS_W = 1040;
const CANVAS_H = 720;

const ORGANELLES = [
  { realmId: 'classification-hall', name: 'Nucleus', short: 'NUCLEUS', x: 0.62, y: 0.58, kind: 'nucleus' },
  { realmId: 'chlorophyll-canopy', name: 'Chloroplast', short: 'CHLOROPLAST', x: 0.28, y: 0.32, kind: 'chloroplast' },
  { realmId: 'vascular-gardens', name: 'Vacuole', short: 'VACUOLE', x: 0.38, y: 0.62, kind: 'vacuole' },
  { realmId: 'pollination-meadow', name: 'Golgi body', short: 'GOLGI', x: 0.72, y: 0.34, kind: 'golgi' },
  { realmId: 'habitat-savanna', name: 'Cytoplasm', short: 'CYTOPLASM', x: 0.50, y: 0.28, kind: 'cytoplasm' },
  { realmId: 'adaptation-isles', name: 'Cell wall', short: 'CELL WALL', x: 0.14, y: 0.50, kind: 'wall' },
  { realmId: 'circulatory-ward', name: 'Mitochondrion', short: 'MITOCHONDRIA', x: 0.76, y: 0.62, kind: 'mito' },
  { realmId: 'digestive-kitchen', name: 'Lysosome', short: 'LYSOSOME', x: 0.22, y: 0.70, kind: 'lyso' },
  { realmId: 'skeletal-neural-lab', name: 'Endoplasmic reticulum', short: 'ER', x: 0.58, y: 0.42, kind: 'er' }
];

function canvasPointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function fillOval(ctx, x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function strokeOval(ctx, x, y, rx, ry, color, width) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function pixelText(ctx, text, x, y, color, align = 'center', size = 9) {
  ctx.save();
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(4, 12, 8, 0.92)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawChloroplast(ctx, x, y, tick, hot) {
  const wobble = Math.sin(tick * 0.04) * 1.5;
  fillOval(ctx, x, y + wobble, 46, 24, hot ? '#4ade80' : '#166534');
  strokeOval(ctx, x, y + wobble, 46, 24, '#14532d', 3);
  fillOval(ctx, x - 10, y + wobble - 2, 14, 7, '#86efac');
  fillOval(ctx, x + 12, y + wobble + 4, 14, 7, '#22c55e');
  fillOval(ctx, x + 2, y + wobble - 6, 12, 6, '#16a34a');
}

function drawMito(ctx, x, y, tick, hot) {
  const wobble = Math.sin(tick * 0.05 + 1) * 1.2;
  fillOval(ctx, x, y + wobble, 34, 18, hot ? '#fb7185' : '#9f1239');
  strokeOval(ctx, x, y + wobble, 34, 18, '#4c0519', 3);
  ctx.strokeStyle = '#fda4af';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 18, y + wobble + i * 5);
    ctx.quadraticCurveTo(x, y + wobble + i * 5 - 6, x + 18, y + wobble + i * 5);
    ctx.stroke();
  }
}

function drawGolgi(ctx, x, y, hot) {
  for (let i = 0; i < 4; i++) {
    fillOval(ctx, x + i * 2, y + i * 7, 28 - i * 2, 6, hot ? '#fde68a' : '#ca8a04');
    strokeOval(ctx, x + i * 2, y + i * 7, 28 - i * 2, 6, '#713f12', 2);
  }
}

function drawER(ctx, x, y, hot) {
  ctx.strokeStyle = hot ? '#86efac' : '#4ade80';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 40, y);
  ctx.bezierCurveTo(x - 10, y - 22, x + 10, y + 22, x + 42, y - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 36, y + 12);
  ctx.bezierCurveTo(x - 6, y - 8, x + 14, y + 28, x + 38, y + 8);
  ctx.stroke();
  fillOval(ctx, x - 8, y - 2, 5, 5, '#bbf7d0');
  fillOval(ctx, x + 16, y + 6, 5, 5, '#bbf7d0');
}

function drawLysosome(ctx, x, y, tick, hot) {
  const pulse = 10 + Math.sin(tick * 0.08) * 2;
  fillOval(ctx, x, y, pulse, pulse, hot ? '#fb923c' : '#c2410c');
  strokeOval(ctx, x, y, pulse, pulse, '#7c2d12', 3);
  fillOval(ctx, x - 3, y - 3, 4, 4, '#fdba74');
}

function organelleAt(cx, cy, mx, my) {
  let best = null;
  let bestDist = 42;
  ORGANELLES.forEach((item) => {
    const x = cx + (item.x - 0.5) * 620;
    const y = cy + (item.y - 0.5) * 460;
    const dist = Math.hypot(mx - x, my - y);
    if (dist < bestDist) {
      best = { ...item, px: x, py: y };
      bestDist = dist;
    }
  });
  return best;
}

export default function BiologyCell({ onSelectRealm, activeRealmId }) {
  const canvasRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(null);
  const pausedRef = useRef(false);
  const hoverRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, over: false });
  const warpRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let tick = 0;
    let frame;

    const render = () => {
      tick += pausedRef.current ? 0 : 1;
      const cx = CANVAS_W / 2;
      const cy = CANVAS_H / 2 + 10;

      ctx.fillStyle = '#06140c';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect((i * 97) % CANVAS_W, (i * 53) % CANVAS_H, 2, 2);
      }

      fillOval(ctx, cx, cy, 310, 230, '#14532d');
      strokeOval(ctx, cx, cy, 310, 230, '#86efac', 10);
      fillOval(ctx, cx, cy, 288, 210, '#1a4d32');
      strokeOval(ctx, cx, cy, 288, 210, '#4ade80', 5);
      fillOval(ctx, cx, cy, 274, 198, '#163d28');

      const vacX = cx - 70;
      const vacY = cy + 40;
      fillOval(ctx, vacX, vacY, 108, 86, 'rgba(56, 189, 248, 0.28)');
      strokeOval(ctx, vacX, vacY, 108, 86, '#38bdf8', 3);

      fillOval(ctx, cx + 78, cy + 48, 62, 50, '#7f1d1d');
      strokeOval(ctx, cx + 78, cy + 48, 62, 50, '#fda4af', 4);
      fillOval(ctx, cx + 78, cy + 48, 22, 18, '#fb7185');

      const mouse = mouseRef.current;
      const hit = mouse.over ? organelleAt(cx, cy, mouse.x, mouse.y) : null;
      if (hit?.realmId !== hoverRef.current?.realmId) {
        hoverRef.current = hit;
        setHovered(hit ? BIOLOGY_REALMS.find((realm) => realm.id === hit.realmId) : null);
      }

      ORGANELLES.forEach((item) => {
        const x = cx + (item.x - 0.5) * 620;
        const y = cy + (item.y - 0.5) * 460;
        const realm = BIOLOGY_REALMS.find((entry) => entry.id === item.realmId);
        const isHot = hit?.realmId === item.realmId || activeRealmId === item.realmId;
        if (item.kind === 'chloroplast') drawChloroplast(ctx, x, y, tick, isHot);
        if (item.kind === 'mito') drawMito(ctx, x, y, tick, isHot);
        if (item.kind === 'golgi') drawGolgi(ctx, x, y, isHot);
        if (item.kind === 'er') drawER(ctx, x, y, isHot);
        if (item.kind === 'lyso') drawLysosome(ctx, x, y, tick, isHot);
        if (item.kind === 'cytoplasm') {
          fillOval(ctx, x, y, 16, 16, isHot ? '#fde68a' : '#65a30d');
          strokeOval(ctx, x, y, 16, 16, '#365314', 3);
        }
        if (item.kind === 'wall') {
          ctx.strokeStyle = isHot ? '#bbf7d0' : '#86efac';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(x, y, 22, 0.2, 2.4);
          ctx.stroke();
        }
        if (item.kind === 'nucleus' || item.kind === 'vacuole') {
          strokeOval(ctx, x, y, isHot ? 28 : 22, isHot ? 22 : 16, isHot ? '#fbbf24' : realm.themeColor, 3);
        }
        if (isHot) {
          strokeOval(ctx, x, y, 40, 28, '#fbbf24', 2);
        }
        pixelText(ctx, item.short, x, y + (item.kind === 'vacuole' ? 52 : 36), realm.themeColor);
      });

      pixelText(ctx, 'PLANT CELL', 28, 28, '#86efac', 'left', 12);
      pixelText(ctx, 'CLICK AN ORGANELLE', 28, 50, '#fde68a', 'left', 9);

      const tip = tooltipRef.current;
      if (tip) {
        if (hit && !warpRef.current) {
          const scaleX = canvas.clientWidth / canvas.width;
          const scaleY = canvas.clientHeight / canvas.height;
          const tipW = tip.offsetWidth || 180;
          let left = hit.px * scaleX - tipW / 2;
          left = Math.max(8, Math.min(left, canvas.clientWidth - tipW - 8));
          tip.style.opacity = '1';
          tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(hit.py * scaleY - 70)}px)`;
        } else {
          tip.style.opacity = '0';
        }
      }

      if (warpRef.current) {
        warpRef.current.progress += 0.08;
        const progress = Math.min(1, warpRef.current.progress);
        ctx.fillStyle = `rgba(187, 247, 208, ${progress})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        if (progress >= 1 && !warpRef.current.fired) {
          warpRef.current.fired = true;
          const target = warpRef.current.realm;
          warpRef.current = null;
          onSelectRealm(target);
        }
      }

      frame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frame);
  }, [activeRealmId, onSelectRealm]);

  const startWarp = (realm) => {
    if (!realm || warpRef.current) return;
    retroAudio.playWarp();
    warpRef.current = { realm, progress: 0, fired: false };
  };

  const handleMove = (event) => {
    mouseRef.current = { ...canvasPointFromEvent(canvasRef.current, event), over: true };
  };

  const handleClick = () => {
    const realm = hovered;
    if (realm) startWarp(realm);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-5xl">
      <div className="w-full flex items-center justify-between mb-2 sm:mb-3 px-1 gap-2">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
          <span className="font-pixel text-[9px] sm:text-xs text-emerald-300">16-BIT PLANT CELL</span>
        </div>
        <button
          onClick={() => setPaused((value) => !value)}
          className={`btn-pixel text-[8px] sm:text-[10px] py-1 px-2 flex items-center gap-1 ${paused ? '' : 'btn-pixel-green'}`}
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          <span>{paused ? 'PLAY' : 'PAUSE'}</span>
        </button>
      </div>

      <div className="relative pixel-box pixel-box-cyan rounded-lg overflow-hidden bg-slate-950 p-1 sm:p-2 w-full max-w-4xl mx-auto">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className={`select-none w-full h-auto block ${hovered ? 'cursor-pointer' : 'cursor-crosshair'}`}
            onMouseMove={handleMove}
            onMouseLeave={() => {
              mouseRef.current.over = false;
              hoverRef.current = null;
              setHovered(null);
            }}
            onClick={handleClick}
          />
          <div ref={tooltipRef} className={`globe-pin-tooltip ${hovered ? 'is-on' : ''}`} aria-hidden={!hovered}>
            {hovered && (
              <>
                <span className="globe-pin-tooltip-avatar">{hovered.npc.avatar}</span>
                <div className="globe-pin-tooltip-copy">
                  <div className="globe-pin-tooltip-name">{hovered.name}</div>
                  <div className="globe-pin-tooltip-meta">
                    {ORGANELLES.find((item) => item.realmId === hovered.id)?.name}
                    <span>CLICK TO ENTER</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-[9px] sm:text-[10px] font-mono text-emerald-400/90 bg-slate-900/90 px-3 py-1.5 border border-emerald-500/30 rounded">
        CELL WALL • MEMBRANE • NUCLEUS • CHLOROPLASTS • VACUOLE
      </div>

      <div className="w-full max-w-5xl mt-3">
        <div className="font-pixel text-[9px] sm:text-[10px] text-slate-400 mb-2 px-1">
          ORGANELLE GATES ({BIOLOGY_REALMS.length})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ORGANELLES.map((item) => {
            const realm = BIOLOGY_REALMS.find((entry) => entry.id === item.realmId);
            const isActive = activeRealmId === realm.id;
            return (
              <button
                key={item.realmId}
                onClick={() => startWarp(realm)}
                className={`waypoint-card ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{realm.npc.avatar}</span>
                  <span className="font-mono text-[9px] text-emerald-400 uppercase">{item.short}</span>
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
