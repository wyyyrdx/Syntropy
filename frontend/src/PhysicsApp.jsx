import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Atom, Award, BookOpen, Map, Sparkles, Tv, Volume2, VolumeX } from 'lucide-react';
import PhysicsAtom from './components/PhysicsAtom';
import PhysicsWorld from './components/PhysicsWorld';
import PhysicsBookSelector from './components/PhysicsBookSelector';
import QuizModal from './components/QuizModal';
import { PHYSICS_REALMS } from './data/physicsRealms';
import { retroAudio } from './audio/retroAudio';

const STORAGE_KEY = 'syntropy_physics_stats';

export default function PhysicsApp() {
  const [currentView, setCurrentView] = useState('atom');
  const [selectedRealm, setSelectedRealm] = useState(PHYSICS_REALMS[0]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const timerRef = useRef(null);
  const [stats, setStats] = useState(() => {
    try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (value) return { xp: value.xp ?? 120, level: value.level ?? 1, completedQuizzes: Array.isArray(value.completedQuizzes) ? value.completedQuizzes : [] }; } catch { /* ignore */ }
    return { xp: 120, level: 1, completedQuizzes: [] };
  });

  useEffect(() => { retroAudio.init(); setIsMuted(retroAudio.isMuted()); return () => clearTimeout(timerRef.current); }, []);
  const toast = useCallback((message, duration = 3500) => { setToastMessage(message); clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setToastMessage(null), duration); }, []);
  const awardXP = useCallback((amount, reason, sourceId) => {
    let awarded = false; let repeated = false;
    setStats((previous) => {
      const completed = previous.completedQuizzes || [];
      if (sourceId && completed.includes(sourceId)) { repeated = true; return previous; }
      awarded = true; const xp = previous.xp + amount; const next = { xp, level: Math.floor(xp / 200) + 1, completedQuizzes: sourceId ? [...completed, sourceId] : completed };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ } return next;
    });
    if (repeated) toast('Already mastered — no extra EXP', 2500); else if (awarded) toast(`+${amount} EXP: ${reason}`);
  }, [toast]);
  const selectRealm = (realm) => { setSelectedRealm(realm); setCurrentView('realm'); };
  const nav = (view) => { retroAudio.playBlip(); setCurrentView(view); };
  const xpProgress = (stats.xp % 200) / 2;

  return <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden w-full ${crtEnabled ? 'crt-overlay' : ''}`}>
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b-2 border-slate-800 backdrop-blur px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      <div className="flex items-center justify-between gap-2 w-full sm:w-auto"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-cyan-300"><Atom className="w-5 h-5" /></div><div><div className="flex items-center gap-1.5"><h1 className="font-pixel text-xs sm:text-sm text-cyan-300">SYNTROPY</h1><span className="font-pixel text-[8px] px-1 py-0.5 bg-amber-500/20 border border-amber-400 text-amber-300 rounded">PHY</span></div><p className="font-mono text-[9px] text-slate-400">PIXEL PHYSICS</p></div></div>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded"><Award className="w-3.5 h-3.5 text-amber-400" /><div><div className="font-pixel text-[8px] text-slate-300">L{stats.level} <span className="text-amber-400 font-mono">{stats.xp}XP</span></div><div className="w-14 bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5"><div className="bg-amber-400 h-full" style={{ width: `${xpProgress}%` }} /></div></div></div>
          <button className={`p-2 rounded border ${isMuted ? 'border-rose-500 text-rose-400' : 'border-slate-700 text-cyan-400'}`} onClick={() => setIsMuted(retroAudio.toggleMute())}>{isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}</button>
          <button className={`p-2 rounded border ${crtEnabled ? 'border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-500'}`} onClick={() => setCrtEnabled((value) => !value)}><Tv className="w-3.5 h-3.5" /></button></div></div>
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 border-2 border-slate-800 rounded w-full sm:w-auto">
        <button onClick={() => nav('atom')} className={`btn-pixel flex-1 text-[9px] py-1.5 px-2.5 flex items-center justify-center gap-1.5 ${currentView === 'atom' ? 'btn-pixel-primary' : 'bg-transparent border-transparent'}`}><Atom className="w-3.5 h-3.5" /> ATOM</button>
        <button onClick={() => nav('realm')} className={`btn-pixel flex-1 text-[9px] py-1.5 px-2.5 flex items-center justify-center gap-1.5 ${currentView === 'realm' ? 'btn-pixel-green' : 'bg-transparent border-transparent'}`}><Map className="w-3.5 h-3.5" /> 2D REALM</button>
        <button onClick={() => nav('books')} className={`btn-pixel flex-1 text-[9px] py-1.5 px-2.5 flex items-center justify-center gap-1.5 ${currentView === 'books' ? 'btn-pixel-amber' : 'bg-transparent border-transparent'}`}><BookOpen className="w-3.5 h-3.5" /> BOOKS</button>
      </nav>
    </header>
    <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full overflow-x-hidden">
      {currentView === 'atom' && <PhysicsAtom onSelectRealm={selectRealm} activeRealmId={selectedRealm.id} />}
      {currentView === 'realm' && <PhysicsWorld realm={selectedRealm} onBackToHub={() => setCurrentView('atom')} onOpenQuiz={setActiveQuiz} playerStats={stats} onAwardXP={awardXP} isInputLocked={Boolean(activeQuiz)} />}
      {currentView === 'books' && <PhysicsBookSelector onSelectRealm={selectRealm} onStartQuiz={setActiveQuiz} completedQuizzes={stats.completedQuizzes} />}
    </main>
    {toastMessage && <div className="fixed top-24 right-6 z-50 bg-amber-950/95 border-2 border-amber-400 text-amber-200 px-3.5 py-2 rounded font-pixel text-[10px] flex gap-2"><Sparkles className="w-4 h-4" />{toastMessage}</div>}
    {activeQuiz && <QuizModal key={activeQuiz.id || activeQuiz.question} quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onAwardXP={awardXP} />}
  </div>;
}
