import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Pause, Play, Sparkles, Sun } from 'lucide-react';
import { BIOLOGY_REALMS } from '../data/biologyRealms';
import { retroAudio } from '../audio/retroAudio';

const CANVAS_W = 780;
const CANVAS_H = 520;

const STAGES = [
  {
    id: 'light',
    title: 'Sunlight',
    label: 'LIGHT',
    color: '#fbbf24',
    fact: 'Chlorophyll in the leaf traps red and blue light. That energy will drive the reactions that build sugar.'
  },
  {
    id: 'water',
    title: 'Water from roots',
    label: 'H2O',
    color: '#38bdf8',
    fact: 'Root hairs absorb water. Xylem carries it up the stem into the leaf veins.'
  },
  {
    id: 'carbon',
    title: 'Carbon dioxide',
    label: 'CO2',
    color: '#94a3b8',
    fact: 'CO2 enters through stomata, mostly on the underside of the leaf. Guard cells open and close these pores.'
  },
  {
    id: 'kitchen',
    title: 'Leaf kitchen',
    label: 'SUGAR',
    color: '#4ade80',
    fact: 'Inside chloroplasts, light energy joins CO2 and H2O to make glucose. This is photosynthesis.'
  },
  {
    id: 'oxygen',
    title: 'Oxygen out',
    label: 'O2',
    color: '#67e8f9',
    fact: 'Oxygen is released when water is split. It leaves through stomata and is the gas animals breathe.'
  }
];

const PHOTO_QUIZ = {
  id: 'biology-photo:equation',
  question: 'Which word equation describes photosynthesis?',
  options: [
    { id: 'A', text: 'Carbon dioxide + water → glucose + oxygen (in light)' },
    { id: 'B', text: 'Glucose + oxygen → carbon dioxide + water' },
    { id: 'C', text: 'Nitrogen + salt → protein + starch' },
    { id: 'D', text: 'Oxygen + water → carbon dioxide + chlorophyll' }
  ],
  correct: 'A',
  explanation: 'Green plants use light energy to turn carbon dioxide and water into glucose, and they release oxygen.'
};

function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function pixelText(ctx, text, x, y, color, align = 'center', size = 10) {
  ctx.save();
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawSun(ctx, cx, cy, tick) {
  const pulse = 1 + Math.sin(tick * 0.04) * 0.04;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + tick * 0.008;
    const inner = 36 * pulse;
    const outer = 62 + Math.sin(tick * 0.06 + i) * 5;
    ctx.strokeStyle = i % 2 ? '#fde68a' : '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.stroke();
  }
  fillRect(ctx, cx - 22, cy - 22, 44, 44, '#fbbf24');
  fillRect(ctx, cx - 16, cy - 16, 32, 32, '#fde68a');
  fillRect(ctx, cx - 6, cy - 8, 6, 6, '#fff7ed');
}

function drawSoil(ctx, width, height) {
  fillRect(ctx, 0, height - 128, width, 128, '#3f2a14');
  fillRect(ctx, 0, height - 128, width, 8, '#5a3d1c');
  for (let i = 0; i < 24; i++) {
    const x = (i * 47) % width;
    const y = height - 114 + ((i * 13) % 90);
    fillRect(ctx, x, y, 6, 4, i % 3 ? '#2a1b0c' : '#6b4423');
  }
}

function drawRoots(ctx, baseX, soilY, tick) {
  const roots = [
    [0, 6, 16, 58],
    [-24, 8, -52, 72],
    [22, 10, 58, 68],
    [-10, 16, -18, 90],
    [12, 20, 30, 96]
  ];
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 5;
  ctx.lineCap = 'square';
  roots.forEach(([x1, y1, x2, y2], i) => {
    const wobble = Math.sin(tick * 0.03 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(baseX + x1, soilY + y1);
    ctx.lineTo(baseX + x2 + wobble, soilY + y2);
    ctx.stroke();
    fillRect(ctx, baseX + x2 + wobble - 3, soilY + y2, 10, 4, '#ca8a04');
  });
}

function drawStem(ctx, x, top, bottom) {
  fillRect(ctx, x - 10, top, 20, bottom - top, '#166534');
  fillRect(ctx, x - 6, top, 6, bottom - top, '#22c55e');
  fillRect(ctx, x + 2, top, 4, bottom - top, '#14532d');
}

function drawLeaf(ctx, x, y, flip, highlight) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -1 : 1, 1);
  ctx.fillStyle = highlight ? '#4ade80' : '#16a34a';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(52, -32, 96, -6);
  ctx.quadraticCurveTo(62, 16, 0, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#14532d';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = highlight ? '#bbf7d0' : '#15803d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, 2);
  ctx.quadraticCurveTo(50, -8, 88, -4);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 16, 0);
    ctx.lineTo(30 + i * 14, -12 + i);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFlower(ctx, x, y, tick) {
  const bob = Math.sin(tick * 0.05) * 2;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    fillRect(ctx, x + Math.cos(a) * 12 - 6, y + bob + Math.sin(a) * 10 - 6, 12, 12, '#fb7185');
  }
  fillRect(ctx, x - 6, y + bob - 6, 12, 12, '#fbbf24');
}

function drawParticles(ctx, particles) {
  particles.forEach((p) => {
    fillRect(ctx, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s, p.color);
    if (p.tag) pixelText(ctx, p.tag, p.x, p.y - 12, p.color, 'center', 8);
  });
}

export default function PhotosynthesisPlant({ onOpenQuiz, onPlayRealm }) {
  const canvasRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [activeStage, setActiveStage] = useState(STAGES[0]);
  const pausedRef = useRef(false);
  const stageRef = useRef(STAGES[0]);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { stageRef.current = activeStage; }, [activeStage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let tick = 0;
    let frame;
    const plantX = CANVAS_W / 2;
    const soilY = CANVAS_H - 128;
    const leafY = 188;

    const render = () => {
      tick += pausedRef.current ? 0 : 1;
      const sky = ctx.createLinearGradient(0, 0, 0, soilY);
      sky.addColorStop(0, '#0b1f3a');
      sky.addColorStop(0.55, '#123024');
      sky.addColorStop(1, '#1a3d28');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      for (let i = 0; i < 26; i++) {
        fillRect(ctx, (i * 91) % CANVAS_W, (i * 37) % (soilY - 40), i % 4 ? 2 : 3, 2, 'rgba(255,255,255,0.25)');
      }

      drawSun(ctx, 92, 88, tick);
      drawSoil(ctx, CANVAS_W, CANVAS_H);
      drawRoots(ctx, plantX, soilY, tick);
      drawStem(ctx, plantX, 158, soilY + 8);
      const kitchenOn = stageRef.current.id === 'kitchen' || stageRef.current.id === 'oxygen';
      drawLeaf(ctx, plantX + 8, leafY, false, kitchenOn);
      drawLeaf(ctx, plantX - 8, leafY + 34, true, kitchenOn);
      drawLeaf(ctx, plantX + 10, leafY + 74, false, kitchenOn);
      drawFlower(ctx, plantX, 142, tick);

      const t = tick / 70;
      const water = Array.from({ length: 7 }, (_, i) => {
        const p = (t * 0.55 + i * 0.14) % 1;
        return { x: plantX + Math.sin(i * 1.7) * 10, y: soilY + 80 - p * 230, s: 6, color: '#38bdf8', tag: i === 0 ? 'H2O' : '' };
      });
      const carbon = Array.from({ length: 5 }, (_, i) => {
        const p = (t * 0.4 + i * 0.2) % 1;
        return { x: plantX + 150 - p * 100, y: leafY + 18 + Math.sin(tick * 0.05 + i) * 8, s: 7, color: '#cbd5e1', tag: i === 1 ? 'CO2' : '' };
      });
      const oxygen = Array.from({ length: 6 }, (_, i) => {
        const p = (t * 0.45 + i * 0.16) % 1;
        return { x: plantX + 36 + p * 120, y: leafY - 6 - p * 80, s: 7, color: '#67e8f9', tag: i === 2 ? 'O2' : '' };
      });
      const sugar = Array.from({ length: 4 }, (_, i) => {
        const p = (t * 0.3 + i * 0.25) % 1;
        return { x: plantX + 8 + Math.sin(i) * 6, y: leafY + 16 + p * 150, s: 6, color: '#fbbf24', tag: i === 0 ? 'SUGAR' : '' };
      });

      const show = stageRef.current.id;
      if (show === 'water' || show === 'kitchen') drawParticles(ctx, water);
      if (show === 'carbon' || show === 'kitchen') drawParticles(ctx, carbon);
      if (show === 'oxygen' || show === 'kitchen') drawParticles(ctx, oxygen);
      if (show === 'kitchen' || show === 'oxygen') drawParticles(ctx, sugar);
      if (show === 'light' || show === 'kitchen') {
        for (let i = 0; i < 7; i++) {
          const p = (t + i * 0.12) % 1;
          ctx.strokeStyle = `rgba(253, 224, 71, ${0.25 + p * 0.4})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(92 + p * 30, 88 + p * 16);
          ctx.lineTo(plantX + 30 + i * 5, leafY + 8);
          ctx.stroke();
        }
      }

      pixelText(ctx, 'CO2 + H2O + LIGHT  ->  GLUCOSE + O2', CANVAS_W / 2, 28, '#bbf7d0', 'center', 10);
      frame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frame);
  }, []);

  const canopy = BIOLOGY_REALMS.find((realm) => realm.id === 'chlorophyll-canopy');

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-5xl">
      <div className="w-full flex items-center justify-between mb-2 sm:mb-3 px-1 gap-2">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-pixel text-[9px] sm:text-xs text-emerald-300">2D PHOTOSYNTHESIS PLANT</span>
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
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="select-none w-full h-auto block"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      <div className="w-full max-w-4xl mt-3 flex flex-wrap justify-center gap-1.5">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => {
              retroAudio.playInteract();
              setActiveStage(stage);
            }}
            className={`btn-pixel text-[8px] sm:text-[10px] py-1.5 px-2.5 ${activeStage.id === stage.id ? 'btn-pixel-amber' : ''}`}
          >
            {stage.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl mt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 bg-slate-900 border-2 border-slate-700 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="font-pixel text-[10px] text-amber-400">{activeStage.title.toUpperCase()}</span>
          </div>
          <p className="font-mono text-sm text-slate-200 leading-relaxed">{activeStage.fact}</p>
        </div>
        <div className="md:col-span-4 flex flex-col gap-2">
          <button
            onClick={() => {
              retroAudio.playInteract();
              if (onOpenQuiz) onOpenQuiz(PHOTO_QUIZ);
            }}
            className="btn-pixel btn-pixel-amber text-[10px] py-2.5 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            TEST EQUATION
          </button>
          {canopy && (
            <button
              onClick={() => {
                retroAudio.playWarp();
                if (onPlayRealm) onPlayRealm(canopy);
              }}
              className="btn-pixel btn-pixel-green text-[10px] py-2.5"
            >
              PLAY IN CANOPY REALM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
