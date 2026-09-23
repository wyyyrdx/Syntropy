import React, { useState, useEffect, useRef, useCallback } from 'react';
import EraPortalGrid from './components/EraPortalGrid';
import HistoryRealm from './components/HistoryRealm';
import HistoryBookSelector from './components/HistoryBookSelector';
import SubjectSwitcher from './components/SubjectSwitcher';
import QuizModal from './components/QuizModal';
import { HISTORY_REALMS } from './data/historyRealms';
import { retroAudio } from './audio/retroAudio';
import { Clock, Map, BookOpen, Volume2, VolumeX, Tv, Award, Sparkles } from 'lucide-react';

const STATS_STORAGE_KEY = 'syntropy_history_stats';

export default function HistoryApp() {
  const [currentView, setCurrentView] = useState('timeline');
  const [selectedRealm, setSelectedRealm] = useState(HISTORY_REALMS[0]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          xp: parsed.xp ?? 0,
          level: parsed.level ?? 1,
          completedQuizzes: Array.isArray(parsed.completedQuizzes) ? parsed.completedQuizzes : []
        };
      }
    } catch {
      // ignore
    }
    return { xp: 0, level: 1, completedQuizzes: [] };
  });

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    retroAudio.init();
    setIsMuted(retroAudio.isMuted());
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message, duration = 3500) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), duration);
  }, []);

  const handleToggleSound = () => {
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleAwardXP = useCallback(
    (amount, reason, sourceId) => {
      let awarded = false;
      let alreadyDone = false;

      setStats((prev) => {
        const completed = Array.isArray(prev.completedQuizzes) ? prev.completedQuizzes : [];
        if (sourceId && completed.includes(sourceId)) {
          alreadyDone = true;
          return prev;
        }

        awarded = true;
        const newXP = prev.xp + amount;
        const updated = {
          ...prev,
          xp: newXP,
          level: Math.floor(newXP / 200) + 1,
          completedQuizzes: sourceId ? [...completed, sourceId] : completed
        };
        try {
          localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      if (alreadyDone) {
        showToast('Already mastered — no extra EXP', 2500);
        return;
      }
      if (awarded) {
        showToast(`+${amount} EXP: ${reason}`);
      }
    },
    [showToast]
  );

  const handleSelectRealm = (realm) => {
    setSelectedRealm(realm);
    setCurrentView('realm');
  };

  const xpProgress = (stats.xp % 200) / 2;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden w-full max-w-full ${crtEnabled ? 'crt-overlay' : ''}`}>
      <header className="sticky top-0 z-40 bg-slate-950/95 border-b-2 border-slate-800 backdrop-blur px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center font-pixel text-sm text-white border-2 border-amber-300 shadow-md shadow-amber-500/30 shrink-0">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-pixel text-sm sm:text-sm text-amber-300 tracking-wider">SYNTROPY</h1>
                <SubjectSwitcher active="his" />
              </div>
              <p className="font-mono text-[9px] text-slate-400 hidden xs:block">PIXEL HISTORY</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-pixel text-slate-300">
                  <span>L{stats.level}</span>
                  <span className="text-amber-400 font-mono">{stats.xp}XP</span>
                </div>
                <div className="w-12 sm:w-16 bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                  <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${xpProgress}%` }}></div>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              className={`p-1.5 sm:p-2 rounded border transition-all ${
                isMuted ? 'border-rose-500 text-rose-400 bg-rose-950/40' : 'border-slate-700 text-cyan-400 bg-slate-900'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setCrtEnabled(!crtEnabled)}
              className={`p-1.5 sm:p-2 rounded border transition-all ${
                crtEnabled ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40' : 'border-slate-700 text-slate-500 bg-slate-900'
              }`}
              title="Toggle CRT Effect"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 border-2 border-slate-800 rounded w-full sm:w-auto">
          <button
            onClick={() => {
              retroAudio.playBlip();
              setCurrentView('timeline');
            }}
            className={`btn-pixel flex-1 sm:flex-initial text-[9px] sm:text-[10px] py-1.5 px-2.5 flex items-center justify-center gap-1.5 ${
              currentView === 'timeline' ? 'btn-pixel-primary' : 'bg-transparent border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>TIMELINE</span>
          </button>
          <button
            onClick={() => {
              retroAudio.playBlip();
              setCurrentView('realm');
            }}
            className={`btn-pixel flex-1 sm:flex-initial text-[9px] sm:text-[10px] py-1.5 px-2.5 flex items-center justify-center gap-1.5 ${
              currentView === 'realm' ? 'btn-pixel-green' : 'bg-transparent border-transparent'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>REALM</span>
          </button>
          <button
            onClick={() => {
              retroAudio.playBlip();
              setCurrentView('books');
            }}
            className={`btn-pixel flex-1 sm:flex-initial text-[9px] sm:text-[10px] py-1.5 px-2.5 flex items-center justify-center gap-1.5 ${
              currentView === 'books' ? 'btn-pixel-amber' : 'bg-transparent border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>BOOKS</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-full overflow-x-hidden">
        {currentView === 'timeline' && (
          <EraPortalGrid onSelectRealm={handleSelectRealm} activeRealmId={selectedRealm?.id} />
        )}

        {currentView === 'realm' && (
          <HistoryRealm
            realm={selectedRealm}
            onBackToTimeline={() => setCurrentView('timeline')}
            onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
            playerStats={stats}
            onAwardXP={handleAwardXP}
            isInputLocked={Boolean(activeQuiz)}
          />
        )}

        {currentView === 'books' && (
          <HistoryBookSelector
            onSelectRealm={handleSelectRealm}
            onStartQuiz={(quiz) => setActiveQuiz(quiz)}
            completedQuizzes={stats.completedQuizzes}
          />
        )}
      </main>

      {toastMessage && (
        <div className="fixed top-24 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-amber-950/95 border-2 border-amber-400 text-amber-200 px-3.5 py-2 rounded shadow-2xl font-pixel text-[10px] sm:text-sm flex items-center justify-center sm:justify-start gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {activeQuiz && (
        <QuizModal
          key={activeQuiz.question || activeQuiz.id}
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onAwardXP={handleAwardXP}
        />
      )}
    </div>
  );
}
