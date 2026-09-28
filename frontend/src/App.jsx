import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Globe2, 
  Map, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Tv, 
  Award, 
  Sparkles, 
  Upload, 
  Menu, 
  ChevronRight, 
  Dna, 
  Atom, 
  Landmark, 
  Leaf, 
  Heart, 
  Clock, 
  Compass, 
  Anchor, 
  Swords, 
  Flag,
  LogOut
} from 'lucide-react';
import { retroAudio } from './audio/retroAudio';
import QuizModal from './components/QuizModal';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

// Geography Components & Data
import PixelGlobe from './components/PixelGlobe';
import World3D from './components/World3D';
import ClassBookSelector from './components/ClassBookSelector';
import { GEOGRAPHY_REALMS } from './data/geographyRealms';

// History Components & Data
import EraPortalGrid from './components/EraPortalGrid';
import HistoryRealm from './components/HistoryRealm';
import HistoryBookSelector from './components/HistoryBookSelector';
import { HISTORY_REALMS } from './data/historyRealms';

// Biology Components & Data
import PhotosynthesisPlant from './components/PhotosynthesisPlant';
import BiologyCell from './components/BiologyCell';
import BiologyWorld from './components/BiologyWorld';
import BiologyBookSelector from './components/BiologyBookSelector';
import AnimalFoodWeb from './components/AnimalFoodWeb';
import HumanBodySystems from './components/HumanBodySystems';
import { BIOLOGY_REALMS } from './data/biologyRealms';

// Physics Components & Data
import PhysicsAtom from './components/PhysicsAtom';
import PhysicsWorld from './components/PhysicsWorld';
import PhysicsBookSelector from './components/PhysicsBookSelector';
import { PHYSICS_REALMS } from './data/physicsRealms';

/* ─────────────────────────────────────────────
   GLOBAL APP ERROR BOUNDARY
───────────────────────────────────────────── */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[AppErrorBoundary] Caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#060911] text-center space-y-4">
          <div className="p-6 rounded-lg bg-[#080d19] border-2 border-cyan-400 max-w-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] space-y-3">
            <p className="font-mono text-cyan-300 text-sm font-bold">[ SYSTEM INTERRUPT RECOVERED ]</p>
            <p className="font-mono text-slate-300 text-xs">
              {this.state.error?.message || 'A render exception occurred.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-black uppercase cursor-pointer"
              >
                REBOOT CONSOLE
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AUTH_STORAGE_KEY = 'syntropy_auth';

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored);
    if (!session?.token || !session?.user?.email) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    const payloadSegment = session.token.split('.')[1];
    if (payloadSegment) {
      const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded));
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
    }

    return session;
  } catch {
    return null;
  }
}

export default function App() {
  // Navigation State: 'upload' | 'biology' | 'physics' | 'history' | 'geography'
  const [activeSpace, setActiveSpace] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authSession, setAuthSession] = useState(readStoredAuth);

  // Sub-views for each space (in-page tab navigation)
  const [geoView, setGeoView] = useState('globe'); // 'globe' | 'realm' | 'books'
  const [selectedGeoRealm, setSelectedGeoRealm] = useState(GEOGRAPHY_REALMS[0]);

  const [historyView, setHistoryView] = useState('timeline'); // 'timeline' | 'realm' | 'books'
  const [selectedHistoryRealm, setSelectedHistoryRealm] = useState(HISTORY_REALMS[0]);

  const [bioView, setBioView] = useState('plant'); // 'plant' | 'cell' | 'foodweb' | 'body' | 'realm' | 'books'
  const [selectedBioRealm, setSelectedBioRealm] = useState(BIOLOGY_REALMS[0]);

  const [physicsView, setPhysicsView] = useState('atom'); // 'atom' | 'realm' | 'books'
  const [selectedPhysicsRealm, setSelectedPhysicsRealm] = useState(PHYSICS_REALMS[0]);

  // Audio & CRT Scanlines
  const [isMuted, setIsMuted] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);

  // Active Recall Quiz & Global Notifications
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  // Player RPG Progress Stats (Shared across all spaces)
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('syntropy_player_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          xp: parsed.xp ?? 770,
          level: parsed.level ?? 4,
          completedQuizzes: Array.isArray(parsed.completedQuizzes) ? parsed.completedQuizzes : []
        };
      }
    } catch {
      // ignore
    }
    return { xp: 770, level: 4, completedQuizzes: [] };
  });

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
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  const handleToggleSound = () => {
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleAwardXP = useCallback((amount, reason, sourceId) => {
    let awarded = false;
    let alreadyDone = false;

    setStats(prev => {
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
        localStorage.setItem('syntropy_player_stats', JSON.stringify(updated));
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
      retroAudio.playPowerup?.();
      showToast(`+${amount} EXP: ${reason}`);
    }
  }, [showToast]);

  const xpProgress = (stats.xp % 200) / 2;

  // Space switcher handler (In-page SPA navigation with zero page reloads)
  const handleSwitchSpace = (space) => {
    retroAudio.playBlip();
    setActiveSpace(space);
  };

  const handleAuthenticated = useCallback((session) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // The active session still works when browser storage is unavailable.
    }
    setAuthSession(session);
  }, []);

  const handleLogout = () => {
    retroAudio.playBlip?.();
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage errors while ending the in-memory session.
    }
    setAuthSession(null);
    setActiveSpace('upload');
  };

  if (!authSession) {
    return <LoginPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className={`w-full h-screen bg-[#060911] text-slate-100 flex flex-col font-sans select-none overflow-hidden ${crtEnabled ? 'crt-overlay' : ''}`}>
      {/* =========================================================
          PERSISTENT TOP TERMINAL BAR
          ========================================================= */}
      <header className="h-14 border-b border-[#141f36] bg-[#070b16] px-4 flex items-center justify-between z-30 shrink-0 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              retroAudio.playBlip();
              setSidebarOpen(!sidebarOpen);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0b1325] border border-[#1a2942] hover:border-cyan-400 font-mono font-bold text-cyan-300 tracking-wider transition-all cursor-pointer"
            title="Toggle Core Spaces Menu"
          >
            <Menu className="w-3.5 h-3.5 text-cyan-300" />
            <span style={{ fontSize: '16px', letterSpacing: '0.18em' }}>CORE SPACES</span>
          </button>
        </div>

        {/* Brand Center */}
        <div 
          onClick={() => {
            retroAudio.playBlip?.();
            handleSwitchSpace('upload');
          }}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 cursor-pointer group py-1 px-3 rounded-lg border border-cyan-500/25 bg-[#050a16]/90 backdrop-blur-md hover:border-cyan-400 hover:bg-cyan-950/40 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.18)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)]"
          title="Syntropy AI Matrix — Click to return to Ingestion Terminal"
        >
          {/* Animated Neon Emblem */}
          <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-cyan-400 via-teal-400 to-indigo-600 p-[1.5px] shadow-[0_0_12px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-[#050a16] rounded-[3px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-black"></span>
          </div>

          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <h1 className="font-mono font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.85)] text-[18px] sm:text-[20px] group-hover:tracking-[0.3em] transition-all duration-300">
                SYNTROPY
              </h1>
              <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 tracking-wider shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                AI.OS
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[8px] font-mono text-cyan-400/70 tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>COGNITIVE REALM ENGINE</span>
            </div>
          </div>
        </div>

        {/* Top Right: Player Level, Sound & CRT Toggles */}
        <div className="flex items-center gap-2.5">
          <div
            className="hidden sm:flex items-center border border-[#1a2942] bg-[#0b1325] px-2.5 py-1.5 rounded font-mono text-xs text-cyan-200"
            style={{ maxWidth: '176px' }}
          >
            <span className="truncate" title={authSession.user.email}>{authSession.user.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded border border-[#1a2942] text-slate-400 bg-[#0b1325] hover:border-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all cursor-pointer"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

          {/* XP Badge */}
          <div className="hidden xs:flex items-center gap-2 bg-[#090d22] border border-dashed border-[#ffe886] px-2.5 py-1 rounded">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-300">
                <span className="font-bold text-amber-300">L{stats.level}</span>
                <span className="text-amber-400 font-bold">{stats.xp}XP</span>
              </div>
              <div className="w-14 bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 rounded border transition-all cursor-pointer ${
              isMuted ? 'border-rose-500 text-rose-400 bg-rose-950/40' : 'border-[#1a2942] text-cyan-400 bg-[#0b1325] hover:border-cyan-400'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => setCrtEnabled(!crtEnabled)}
            className={`p-1.5 rounded border transition-all cursor-pointer ${
              crtEnabled ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40' : 'border-[#1a2942] text-slate-500 bg-[#0b1325]'
            }`}
            title="Toggle Retro CRT Scanlines"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN WORKSPACE LAYOUT (SIDEBAR + ACTIVE SPACE)
          ========================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* PERSISTENT LEFT SIDEBAR: CORE SPACES */}
        <aside
          className={`${
            sidebarOpen ? 'w-56 sm:w-60' : 'w-0 -translate-x-full'
          } border-r border-[#141f36] bg-[#070b16] transition-all duration-300 flex flex-col shrink-0 overflow-y-auto`}
        >
          <div className="p-3 border-b border-[#141f36]/60">
            <div className="font-mono font-bold text-cyan-400 uppercase" style={{ fontSize: '15px', letterSpacing: '0.22em' }}>
              // CORE SPACES
            </div>
          </div>

          <nav className="p-2 space-y-1.5 flex-1">
            {/* 1. Upload Notes */}
            <button
              onClick={() => handleSwitchSpace('upload')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all cursor-pointer ${
                activeSpace === 'upload'
                  ? 'bg-cyan-950/40 border border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.18)] font-bold'
                  : 'hover:bg-[#0c1428] border border-transparent hover:border-[#1e2f4d] text-slate-300 hover:text-cyan-300 font-bold'
              } font-mono`}
              style={{ fontSize: '15px', letterSpacing: '0.1em' }}
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-cyan-300" />
                <span className="tracking-wide">UPLOAD NOTES</span>
              </div>
              {activeSpace === 'upload' ? (
                <span className="font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold" style={{ fontSize: '12px' }}>
                  ACTIVE
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* 2. Biology */}
            <button
              onClick={() => handleSwitchSpace('biology')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all cursor-pointer ${
                activeSpace === 'biology'
                  ? 'bg-cyan-950/40 border border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.18)] font-bold'
                  : 'hover:bg-[#0c1428] border border-transparent hover:border-[#1e2f4d] text-slate-300 hover:text-cyan-300 font-bold'
              } font-mono`}
              style={{ fontSize: '15px', letterSpacing: '0.1em' }}
            >
              <div className="flex items-center gap-2.5">
                <Dna className="w-4 h-4 text-cyan-400" />
                <span>BIOLOGY</span>
              </div>
              {activeSpace === 'biology' ? (
                <span className="font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold" style={{ fontSize: '12px' }}>
                  ACTIVE
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* 3. Physics */}
            <button
              onClick={() => handleSwitchSpace('physics')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all cursor-pointer ${
                activeSpace === 'physics'
                  ? 'bg-sky-950/40 border border-sky-400/80 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.18)] font-bold'
                  : 'hover:bg-[#0c1428] border border-transparent hover:border-[#1e2f4d] text-slate-300 hover:text-sky-300 font-bold'
              } font-mono`}
              style={{ fontSize: '15px', letterSpacing: '0.1em' }}
            >
              <div className="flex items-center gap-2.5">
                <Atom className="w-4 h-4 text-sky-400" />
                <span>PHYSICS</span>
              </div>
              {activeSpace === 'physics' ? (
                <span className="font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold" style={{ fontSize: '12px' }}>
                  ACTIVE
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* 4. History */}
            <button
              onClick={() => handleSwitchSpace('history')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all cursor-pointer ${
                activeSpace === 'history'
                  ? 'bg-amber-950/40 border border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.18)] font-bold'
                  : 'hover:bg-[#181408] border border-transparent hover:border-amber-500/30 text-amber-300 hover:text-amber-200 font-bold'
              } font-mono`}
              style={{ fontSize: '15px', letterSpacing: '0.1em' }}
            >
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>HISTORY</span>
              </div>
              {activeSpace === 'history' ? (
                <span className="font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold" style={{ fontSize: '12px' }}>
                  ACTIVE
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* 5. Geography */}
            <button
              onClick={() => handleSwitchSpace('geography')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all cursor-pointer ${
                activeSpace === 'geography'
                  ? 'bg-emerald-950/40 border border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.18)] font-bold'
                  : 'hover:bg-[#081812] border border-transparent hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold'
              } font-mono`}
              style={{ fontSize: '15px', letterSpacing: '0.1em' }}
            >
              <div className="flex items-center gap-2.5">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span>GEOGRAPHY</span>
              </div>
              {activeSpace === 'geography' ? (
                <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold" style={{ fontSize: '12px' }}>
                  ACTIVE
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </nav>
        </aside>

        {/* =========================================================
            ACTIVE SPACE VIEWPORT (ALL RENDERED IN SAME PAGE)
            ========================================================= */}
        <AppErrorBoundary>
          <div className="flex-1 flex flex-col overflow-y-auto bg-[#060911]">
          {/* ==================== 1. UPLOAD NOTES TERMINAL ==================== */}
          {activeSpace === 'upload' && (
            <Dashboard
              onNavigateSpace={handleSwitchSpace}
              onEnterRealm={() => {
                handleSwitchSpace('geography');
                setGeoView('realm');
              }}
              playerStats={stats}
              onAwardXP={handleAwardXP}
            />
          )}

          {/* ==================== 2. HISTORY SPACE (IN-PAGE) ==================== */}
          {activeSpace === 'history' && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4">
              {/* Space Header & In-Page Tab Navigation (Centered with HUD Wings) */}
              <div className="p-4 sm:p-5 bg-[#070d1c]/90 border border-amber-500/30 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden space-y-3">
                <div className="w-full flex items-center justify-center gap-4 relative z-10">
                  {/* Left HUD decorative wing */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-amber-500/50"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#160d04] border border-amber-500/40 font-mono text-xs text-amber-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      <span>ERA.ACTIVE</span>
                    </div>
                    <div className="h-px w-8 bg-amber-500/50"></div>
                  </div>

                  {/* Centered Title & Description */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2.5 rounded bg-amber-950/60 border border-amber-400/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <h2 className="font-mono font-bold text-amber-300 tracking-widest uppercase flex items-center gap-2" style={{ fontSize: '32px', letterSpacing: '0.12em', textShadow: '0 0 16px rgba(251,191,36,0.6)' }}>
                        <span>ERA EXPLORER</span>
                      </h2>
                    </div>
                    <p className="font-mono text-slate-300 mt-1 max-w-2xl text-center" style={{ fontSize: '16px', letterSpacing: '0.05em' }}>
                      Journey across civilization eras and test active recall historical timelines.
                    </p>
                  </div>

                  {/* Right HUD decorative wing */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <div className="h-px w-8 bg-amber-500/50"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#160d04] border border-amber-500/40 font-mono text-xs text-amber-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                      <span>CHRONO // SYNC</span>
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/20 to-amber-500/50"></div>
                  </div>
                </div>

                {/* Sub-nav tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 bg-[#070b16] p-1.5 border border-[#141f36] rounded shadow-inner">
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setHistoryView('timeline');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      historyView === 'timeline'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Clock className="w-4 h-4" />
                    <span>TIMELINE</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setHistoryView('realm');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      historyView === 'realm'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Map className="w-4 h-4" />
                    <span>2D REALM</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setHistoryView('books');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      historyView === 'books'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>CODEX</span>
                  </button>
                </div>
              </div>

              {/* History Sub-View Body */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {historyView === 'timeline' && (
                  <EraPortalGrid
                    onSelectRealm={(realm) => {
                      setSelectedHistoryRealm(realm);
                      setHistoryView('realm');
                    }}
                    activeRealmId={selectedHistoryRealm?.id}
                  />
                )}
                {historyView === 'realm' && (
                  <HistoryRealm
                    realm={selectedHistoryRealm}
                    onBackToHub={() => setHistoryView('timeline')}
                    onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
                    playerStats={stats}
                    onAwardXP={handleAwardXP}
                    isInputLocked={Boolean(activeQuiz)}
                  />
                )}
                {historyView === 'books' && (
                  <HistoryBookSelector
                    onSelectRealm={(realm) => {
                      setSelectedHistoryRealm(realm);
                      setHistoryView('realm');
                    }}
                    onStartQuiz={(quiz) => setActiveQuiz(quiz)}
                    completedQuizzes={stats.completedQuizzes}
                  />
                )}
              </div>
            </div>
          )}

          {/* ==================== 3. BIOLOGY SPACE (IN-PAGE) ==================== */}
          {activeSpace === 'biology' && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4">
              {/* Space Header & In-Page Tab Navigation (Centered with HUD Wings) */}
              <div className="p-4 sm:p-5 bg-[#070d1c]/90 border border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden space-y-3">
                <div className="w-full flex items-center justify-center gap-4 relative z-10">
                  {/* Left HUD decorative wing */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-cyan-500/50"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#071927] border border-cyan-500/40 font-mono text-xs text-cyan-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span>BIO.ACTIVE</span>
                    </div>
                    <div className="h-px w-8 bg-cyan-500/50"></div>
                  </div>

                  {/* Centered Title & Description */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2.5 rounded bg-cyan-950/60 border border-cyan-400/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                        <Dna className="w-6 h-6" />
                      </div>
                      <h2 className="font-mono font-bold text-cyan-300 tracking-widest uppercase flex items-center gap-2" style={{ fontSize: '32px', letterSpacing: '0.12em', textShadow: '0 0 16px rgba(6,182,212,0.6)' }}>
                        <span>LIVING SYSTEMS</span>
                      </h2>
                    </div>
                    <p className="font-mono text-slate-300 mt-1 max-w-2xl text-center" style={{ fontSize: '16px', letterSpacing: '0.05em' }}>
                      Interactive cellular, botanical, anatomical, and ecological bio-matrices.
                    </p>
                  </div>

                  {/* Right HUD decorative wing */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <div className="h-px w-8 bg-cyan-500/50"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#071927] border border-cyan-500/40 font-mono text-xs text-cyan-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                      <span>BIO-MATRIX // ON</span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-500/20 to-cyan-500/50"></div>
                  </div>
                </div>

                {/* Sub-nav tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 bg-[#070b16] p-1.5 border border-[#141f36] rounded shadow-inner">
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setBioView('plant');
                    }}
                    className={`px-3 py-2 rounded font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      bioView === 'plant' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Leaf className="w-4 h-4" />
                    <span>PLANT</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setBioView('cell');
                    }}
                    className={`px-3 py-2 rounded font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      bioView === 'cell' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Dna className="w-4 h-4" />
                    <span>CELL</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setBioView('body');
                    }}
                    className={`px-3 py-2 rounded font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      bioView === 'body' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Heart className="w-4 h-4" />
                    <span>BODY</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setBioView('foodweb');
                    }}
                    className={`px-3 py-2 rounded font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      bioView === 'foodweb' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Compass className="w-4 h-4" />
                    <span>FOOD WEB</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setBioView('realm');
                    }}
                    className={`px-3 py-2 rounded font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      bioView === 'realm' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Map className="w-4 h-4" />
                    <span>REALM</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setBioView('books');
                    }}
                    className={`px-3 py-2 rounded font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      bioView === 'books' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>BOOKS</span>
                  </button>
                </div>
              </div>

              {/* Biology Sub-View Body */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {bioView === 'plant' && <PhotosynthesisPlant onOpenQuiz={(quiz) => setActiveQuiz(quiz)} onAwardXP={handleAwardXP} />}
                {bioView === 'cell' && <BiologyCell onOpenQuiz={(quiz) => setActiveQuiz(quiz)} onAwardXP={handleAwardXP} />}
                {bioView === 'body' && <HumanBodySystems onOpenQuiz={(quiz) => setActiveQuiz(quiz)} onAwardXP={handleAwardXP} />}
                {bioView === 'foodweb' && <AnimalFoodWeb onOpenQuiz={(quiz) => setActiveQuiz(quiz)} onAwardXP={handleAwardXP} />}
                {bioView === 'realm' && (
                  <BiologyWorld
                    realm={selectedBioRealm}
                    onBackToHub={() => setBioView('plant')}
                    onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
                    playerStats={stats}
                    onAwardXP={handleAwardXP}
                    isInputLocked={Boolean(activeQuiz)}
                  />
                )}
                {bioView === 'books' && (
                  <BiologyBookSelector
                    onSelectRealm={(realm) => {
                      setSelectedBioRealm(realm);
                      setBioView('realm');
                    }}
                    onStartQuiz={(quiz) => setActiveQuiz(quiz)}
                    completedQuizzes={stats.completedQuizzes}
                  />
                )}
              </div>
            </div>
          )}

          {/* ==================== 4. PHYSICS SPACE (IN-PAGE) ==================== */}
          {activeSpace === 'physics' && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4">
              {/* Space Header & In-Page Tab Navigation (Centered with HUD Wings) */}
              <div className="p-4 sm:p-5 bg-[#070d1c]/90 border border-sky-500/30 rounded-lg shadow-[0_0_20px_rgba(56,189,248,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden space-y-3">
                <div className="w-full flex items-center justify-center gap-4 relative z-10">
                  {/* Left HUD decorative wing */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-500/20 to-sky-500/50"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#08182b] border border-sky-500/40 font-mono text-xs text-sky-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                      <span>QUANTUM.ON</span>
                    </div>
                    <div className="h-px w-8 bg-sky-500/50"></div>
                  </div>

                  {/* Centered Title & Description */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2.5 rounded bg-sky-950/60 border border-sky-400/80 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                        <Atom className="w-6 h-6" />
                      </div>
                      <h2 className="font-mono font-bold text-sky-300 tracking-widest uppercase flex items-center gap-2" style={{ fontSize: '32px', letterSpacing: '0.12em', textShadow: '0 0 16px rgba(56,189,248,0.6)' }}>
                        <span>QUANTUM LAB</span>
                      </h2>
                    </div>
                    <p className="font-mono text-slate-300 mt-1 max-w-2xl text-center" style={{ fontSize: '16px', letterSpacing: '0.05em' }}>
                      Atomic shells, quantum subatomic orbitals, and kinematics particle realms.
                    </p>
                  </div>

                  {/* Right HUD decorative wing */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <div className="h-px w-8 bg-sky-500/50"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#08182b] border border-sky-500/40 font-mono text-xs text-sky-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                      <span>ORBITALS // 16-BIT</span>
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-sky-500/20 to-sky-500/50"></div>
                  </div>
                </div>

                {/* Sub-nav tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 bg-[#070b16] p-1.5 border border-[#141f36] rounded shadow-inner">
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setPhysicsView('atom');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      physicsView === 'atom'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Atom className="w-4 h-4" />
                    <span>ATOM SIMULATOR</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setPhysicsView('realm');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      physicsView === 'realm'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Map className="w-4 h-4" />
                    <span>2D REALM</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setPhysicsView('books');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      physicsView === 'books'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>BOOKS</span>
                  </button>
                </div>
              </div>

              {/* Physics Sub-View Body */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {physicsView === 'atom' && (
                  <PhysicsAtom
                    onSelectRealm={(realm) => {
                      setSelectedPhysicsRealm(realm);
                      setPhysicsView('realm');
                    }}
                    activeRealmId={selectedPhysicsRealm?.id}
                  />
                )}
                {physicsView === 'realm' && (
                  <PhysicsWorld
                    realm={selectedPhysicsRealm}
                    onBackToHub={() => setPhysicsView('atom')}
                    onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
                    playerStats={stats}
                    onAwardXP={handleAwardXP}
                    isInputLocked={Boolean(activeQuiz)}
                  />
                )}
                {physicsView === 'books' && (
                  <PhysicsBookSelector
                    onSelectRealm={(realm) => {
                      setSelectedPhysicsRealm(realm);
                      setPhysicsView('realm');
                    }}
                    onStartQuiz={(quiz) => setActiveQuiz(quiz)}
                    completedQuizzes={stats.completedQuizzes}
                  />
                )}
              </div>
            </div>
          )}

          {/* ==================== 5. GEOGRAPHY SPACE (IN-PAGE) ==================== */}
          {activeSpace === 'geography' && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4">
              {/* Space Header & In-Page Tab Navigation (Centered with HUD Wings) */}
              <div className="p-4 sm:p-5 bg-[#070d1c]/90 border border-emerald-500/30 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden space-y-3">
                <div className="w-full flex items-center justify-center gap-4 relative z-10">
                  {/* Left HUD decorative wing */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-emerald-500/50"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#061c14] border border-emerald-500/40 font-mono text-xs text-emerald-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>TERRAIN.ACTIVE</span>
                    </div>
                    <div className="h-px w-8 bg-emerald-500/50"></div>
                  </div>

                  {/* Centered Title & Description */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-400/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                        <Globe2 className="w-6 h-6" />
                      </div>
                      <h2 className="font-mono font-bold text-emerald-300 tracking-widest uppercase flex items-center gap-2" style={{ fontSize: '32px', letterSpacing: '0.12em', textShadow: '0 0 16px rgba(16,185,129,0.6)' }}>
                        <span>PIXEL TERRAIN</span>
                      </h2>
                    </div>
                    <p className="font-mono text-slate-300 mt-1 max-w-2xl text-center" style={{ fontSize: '16px', letterSpacing: '0.05em' }}>
                      Spatial pixel globe, biome terrains, and geopolitical active recall waypoints.
                    </p>
                  </div>

                  {/* Right HUD decorative wing */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <div className="h-px w-8 bg-emerald-500/50"></div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#061c14] border border-emerald-500/40 font-mono text-xs text-emerald-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      <span>SPATIAL // 3D</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/20 to-emerald-500/50"></div>
                  </div>
                </div>

                {/* Sub-nav tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 bg-[#070b16] p-1.5 border border-[#141f36] rounded shadow-inner">
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setGeoView('globe');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      geoView === 'globe'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Globe2 className="w-4 h-4" />
                    <span>3D GLOBE</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setGeoView('realm');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      geoView === 'realm'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <Map className="w-4 h-4" />
                    <span>2D REALM</span>
                  </button>
                  <button
                    onClick={() => {
                      retroAudio.playBlip();
                      setGeoView('books');
                    }}
                    className={`px-4 py-2 rounded font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      geoView === 'books'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>BOOKS</span>
                  </button>
                </div>
              </div>

              {/* Geography Sub-View Body */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {geoView === 'globe' && (
                  <PixelGlobe
                    onSelectRealm={(realm) => {
                      setSelectedGeoRealm(realm);
                      setGeoView('realm');
                    }}
                    activeRealmId={selectedGeoRealm?.id}
                  />
                )}
                {geoView === 'realm' && (
                  <World3D
                    realm={selectedGeoRealm}
                    onBackToGlobe={() => setGeoView('globe')}
                    onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
                    playerStats={stats}
                    onAwardXP={handleAwardXP}
                    isInputLocked={Boolean(activeQuiz)}
                  />
                )}
                {geoView === 'books' && (
                  <ClassBookSelector
                    onSelectRealm={(realm) => {
                      setSelectedGeoRealm(realm);
                      setGeoView('realm');
                    }}
                    onStartQuiz={(quiz) => setActiveQuiz(quiz)}
                    completedQuizzes={stats.completedQuizzes}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        </AppErrorBoundary>
      </div>

      {/* Floating XP Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-[#090d22] border-2 border-amber-400 text-amber-200 px-3.5 py-2 rounded shadow-2xl font-mono text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Global Active Recall Quiz Modal */}
      {activeQuiz && (
        <QuizModal
          key={activeQuiz.id || activeQuiz.question}
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onAwardXP={handleAwardXP}
        />
      )}
    </div>
  );
}
