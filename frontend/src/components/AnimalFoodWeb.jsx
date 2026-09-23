import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Sparkles } from 'lucide-react';
import { BIOLOGY_REALMS } from '../data/biologyRealms';
import { retroAudio } from '../audio/retroAudio';

const CANVAS_W = 780;
const CANVAS_H = 520;

const STAGES = [
  { id: 'sun', title: 'Sun energy', label: 'SUN', color: '#fbbf24', fact: 'Energy enters the living community as sunlight. Green plants capture it first.' },
  { id: 'producer', title: 'Producers', label: 'GRASS', color: '#4ade80', fact: 'Grass and other plants make food by photosynthesis. They are producers.' },
  { id: 'herbivore', title: 'Herbivores', label: 'ZEBRA', color: '#e2e8f0', fact: 'A zebra eats plants, so it is a primary consumer on the second trophic level.' },
  { id: 'predator', title: 'Predators', label: 'LION', color: '#f59e0b', fact: 'A lion eats herbivores. Energy moves along the chain: grass → zebra → lion.' },
  { id: 'decomposer', title: 'Decomposers', label: 'FUNGI', color: '#fb923c', fact: 'Fungi and bacteria break down dead matter and return minerals to the soil.' }
];

const QUIZ = {
  id: 'biology-animal:chain',
  question: 'Which food chain is in the correct energy order?',
  options: [
    { id: 'A', text: 'Grass → zebra → lion' },
    { id: 'B', text: 'Lion → grass → zebra' },
    { id: 'C', text: 'Fungi → lion → sun' },
    { id: 'D', text: 'Zebra → sun → grass' }
  ],
  correct: 'A',
  explanation: 'Arrows show energy flow from producer to consumer.'
};

function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function label(ctx, text, x, y, color) {
  ctx.save();
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function arrow(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10 * Math.cos(a - 0.4), y2 - 10 * Math.sin(a - 0.4));
  ctx.lineTo(x2 - 10 * Math.cos(a + 0.4), y2 - 10 * Math.sin(a + 0.4));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export default function AnimalFoodWeb({ onOpenQuiz, onPlayRealm }) {
  const canvasRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [stage, setStage] = useState(STAGES[0]);
  const pausedRef = useRef(false);
  const stageRef = useRef(STAGES[0]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { stageRef.current = stage; }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let tick = 0;
    let frame;
    const render = () => {
      tick += pausedRef.current ? 0 : 1;
      const sky = ctx.createLinearGradient(0, 0, 0, 360);
      sky.addColorStop(0, '#1c1408');
      sky.addColorStop(1, '#3f2a12');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      fill(ctx, 0, 360, CANVAS_W, 160, '#854d0e');
      fill(ctx, 0, 360, CANVAS_W, 8, '#a16207');

      const pulse = 1 + Math.sin(tick * 0.05) * 0.05;
      fill(ctx, 80, 70, 44 * pulse, 44 * pulse, '#fbbf24');
      fill(ctx, 88, 78, 28, 28, '#fde68a');
      for (let i = 0; i < 18; i++) fill(ctx, 40 + i * 38, 348 - (i % 3) * 10, 10, 18 + (i % 2) * 8, '#4d7c0f');
      fill(ctx, 200, 300, 70, 40, '#e2e8f0');
      fill(ctx, 190, 312, 16, 8, '#94a3b8');
      fill(ctx, 258, 308, 18, 10, '#0f172a');
      fill(ctx, 520, 250, 80, 50, '#f59e0b');
      fill(ctx, 590, 258, 28, 16, '#0f172a');
      fill(ctx, 650, 400, 36, 18, '#fb923c');
      fill(ctx, 658, 392, 20, 10, '#fdba74');

      const id = stageRef.current.id;
      if (id === 'sun' || id === 'producer') arrow(ctx, 120, 120, 220, 300, '#fde68a');
      if (id === 'producer' || id === 'herbivore') arrow(ctx, 260, 320, 300, 320, '#86efac');
      if (id === 'herbivore' || id === 'predator') arrow(ctx, 280, 300, 500, 270, '#fbbf24');
      if (id === 'decomposer' || id === 'predator') arrow(ctx, 560, 310, 660, 390, '#fb923c');

      label(ctx, 'SUN', 102, 60, '#fde68a');
      label(ctx, 'GRASS', 160, 400, '#86efac');
      label(ctx, 'ZEBRA', 235, 290, '#e2e8f0');
      label(ctx, 'LION', 560, 236, '#fbbf24');
      label(ctx, 'FUNGI', 668, 440, '#fdba74');
      label(ctx, 'FOOD WEB: SUN -> PLANT -> HERBIVORE -> PREDATOR', CANVAS_W / 2, 24, '#fde68a');
      frame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frame);
  }, []);

  const savanna = BIOLOGY_REALMS.find((realm) => realm.id === 'habitat-savanna');

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-5xl">
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-pixel text-[9px] sm:text-xs text-amber-300">2D ANIMAL FOOD WEB</span>
        </div>
        <button onClick={() => setPaused((value) => !value)} className={`btn-pixel text-[8px] py-1 px-2 ${paused ? '' : 'btn-pixel-amber'}`}>
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </button>
      </div>
      <div className="pixel-box pixel-box-gold rounded-lg overflow-hidden p-1 sm:p-2 w-full max-w-4xl">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="w-full h-auto block" style={{ imageRendering: 'pixelated' }} />
      </div>
      <div className="w-full max-w-4xl mt-3 flex flex-wrap justify-center gap-1.5">
        {STAGES.map((item) => (
          <button key={item.id} onClick={() => { retroAudio.playInteract(); setStage(item); }} className={`btn-pixel text-[8px] sm:text-[10px] py-1.5 px-2.5 ${stage.id === item.id ? 'btn-pixel-amber' : ''}`}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="w-full max-w-4xl mt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 bg-slate-900 border-2 border-slate-700 rounded p-3">
          <div className="font-pixel text-[10px] text-amber-400 mb-2">{stage.title.toUpperCase()}</div>
          <p className="font-mono text-sm text-slate-200">{stage.fact}</p>
        </div>
        <div className="md:col-span-4 flex flex-col gap-2">
          <button onClick={() => { retroAudio.playInteract(); onOpenQuiz?.(QUIZ); }} className="btn-pixel btn-pixel-amber text-[10px] py-2.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> TEST FOOD CHAIN
          </button>
          {savanna && <button onClick={() => { retroAudio.playWarp(); onPlayRealm?.(savanna); }} className="btn-pixel btn-pixel-green text-[10px] py-2.5">PLAY IN SAVANNA</button>}
        </div>
      </div>
    </div>
  );
}
