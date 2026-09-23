import React, { useEffect, useRef, useState } from 'react';
import { Heart, Pause, Play, Sparkles } from 'lucide-react';
import { BIOLOGY_REALMS } from '../data/biologyRealms';
import { retroAudio } from '../audio/retroAudio';

const CANVAS_W = 780;
const CANVAS_H = 520;

const STAGES = [
  { id: 'brain', title: 'Nervous system', label: 'BRAIN', color: '#fb7185', x: 390, y: 78, fact: 'The brain and nerves coordinate the body. Sense organs send signals here.' },
  { id: 'lungs', title: 'Respiratory system', label: 'LUNGS', color: '#67e8f9', x: 390, y: 168, fact: 'Lungs take in oxygen and remove carbon dioxide. Gas exchange happens in alveoli.' },
  { id: 'heart', title: 'Circulatory system', label: 'HEART', color: '#f43f5e', x: 368, y: 198, fact: 'The heart pumps blood. Arteries leave the heart; veins return blood.' },
  { id: 'gut', title: 'Digestive system', label: 'GUT', color: '#fb923c', x: 390, y: 268, fact: 'Food is broken down and absorbed, mainly in the small intestine.' },
  { id: 'bones', title: 'Skeleton and muscle', label: 'BONES', color: '#e2e8f0', x: 318, y: 340, fact: 'Bones support and protect. Muscles pull on bones to create movement.' }
];

const QUIZ = {
  id: 'biology-human:pump',
  question: 'Which organ pumps blood around the body?',
  options: [
    { id: 'A', text: 'Heart' },
    { id: 'B', text: 'Stomach' },
    { id: 'C', text: 'Skull only' },
    { id: 'D', text: 'Hair' }
  ],
  correct: 'A',
  explanation: 'The four-chambered heart is the pump of the circulatory system.'
};

function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function oval(ctx, x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function text(ctx, value, x, y, color) {
  ctx.save();
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
  ctx.restore();
}

export default function HumanBodySystems({ onOpenQuiz, onPlayRealm }) {
  const canvasRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [stage, setStage] = useState(STAGES[2]);
  const pausedRef = useRef(false);
  const stageRef = useRef(STAGES[2]);
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
      ctx.fillStyle = '#14080e';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      text(ctx, 'HUMAN BODY SYSTEMS', 24, 28, '#fda4af');

      const cx = 390;
      oval(ctx, cx, 78, 22, 26, '#f8fafc');
      fill(ctx, cx - 16, 104, 32, 18, '#e2e8f0');
      fill(ctx, cx - 46, 128, 92, 110, '#fda4af');
      fill(ctx, cx - 70, 132, 22, 88, '#fb7185');
      fill(ctx, cx + 48, 132, 22, 88, '#fb7185');
      fill(ctx, cx - 28, 236, 22, 120, '#e11d48');
      fill(ctx, cx + 6, 236, 22, 120, '#e11d48');
      fill(ctx, cx - 30, 350, 20, 70, '#94a3b8');
      fill(ctx, cx + 10, 350, 20, 70, '#94a3b8');

      const beat = 1 + Math.sin(tick * 0.12) * 0.12;
      STAGES.forEach((item) => {
        const on = stageRef.current.id === item.id;
        const r = (on ? 12 : 8) * (item.id === 'heart' ? beat : 1);
        oval(ctx, item.x, item.y, r, r, item.color);
        if (on) {
          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(item.x, item.y, r + 8, r + 8, 0, 0, Math.PI * 2);
          ctx.stroke();
          text(ctx, item.label, item.x + 20, item.y + 4, item.color);
        }
      });
      frame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frame);
  }, []);

  const clinic = BIOLOGY_REALMS.find((realm) => realm.id === 'circulatory-ward');

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-5xl">
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <span className="font-pixel text-[9px] sm:text-xs text-rose-300">2D HUMAN BODY</span>
        </div>
        <button onClick={() => setPaused((value) => !value)} className={`btn-pixel text-[8px] py-1 px-2 ${paused ? '' : 'btn-pixel-amber'}`}>
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </button>
      </div>
      <div className="pixel-box rounded-lg overflow-hidden p-1 sm:p-2 w-full max-w-4xl" style={{ borderColor: '#fb7185' }}>
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
          <div className="font-pixel text-[10px] text-rose-300 mb-2">{stage.title.toUpperCase()}</div>
          <p className="font-mono text-sm text-slate-200">{stage.fact}</p>
        </div>
        <div className="md:col-span-4 flex flex-col gap-2">
          <button onClick={() => { retroAudio.playInteract(); onOpenQuiz?.(QUIZ); }} className="btn-pixel btn-pixel-amber text-[10px] py-2.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> TEST BODY
          </button>
          {clinic && <button onClick={() => { retroAudio.playWarp(); onPlayRealm?.(clinic); }} className="btn-pixel btn-pixel-green text-[10px] py-2.5">PLAY IN CLINIC</button>}
        </div>
      </div>
    </div>
  );
}
