import React from 'react';
import { Clock, Navigation } from 'lucide-react';
import { HISTORY_REALMS } from '../data/history/historyRealm';
import { retroAudio } from '../audio/retroAudio';

export default function HistoryTimeline({ onSelectRealm, activeRealmId }) {
  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-400 text-amber-300 font-pixel text-[9px] mb-2">
          <Clock className="w-3.5 h-3.5" />
          TIME REALM MAP
        </div>
        <h2 className="text-base sm:text-xl font-bold text-slate-100 font-pixel">WALK THE ERAS</h2>
        <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-1">
          Ten linked sites from rock shelters to the world wars. Pick an era to enter its 2D realm.
        </p>
      </div>

      <div className="relative pl-3 sm:pl-4">
        <div className="absolute left-5 sm:left-6 top-2 bottom-2 w-0.5 bg-amber-700/50" />
        <div className="space-y-3">
          {HISTORY_REALMS.map((realm) => {
            const active = realm.id === activeRealmId;
            return (
              <button
                key={realm.id}
                onClick={() => {
                  retroAudio.playWarp();
                  onSelectRealm?.(realm);
                }}
                className={`relative w-full text-left ml-8 sm:ml-10 p-3 rounded border-2 transition-all ${
                  active
                    ? 'bg-amber-950/70 border-amber-400 shadow-lg shadow-amber-900/40'
                    : 'bg-slate-900/80 border-slate-700 hover:border-amber-600'
                }`}
              >
                <span
                  className="absolute -left-10 sm:-left-11 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px]"
                  style={{ backgroundColor: realm.themeColor, borderColor: active ? '#fbbf24' : '#44403c' }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-pixel text-[8px] text-amber-300">{realm.elevation}</div>
                    <div className="font-mono font-bold text-sm text-slate-100">{realm.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {realm.region} · {realm.biome}
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 mt-1 leading-relaxed">{realm.description}</p>
                  </div>
                  <span className="btn-pixel btn-pixel-amber text-[9px] py-1.5 px-2 inline-flex items-center gap-1 shrink-0">
                    <Navigation className="w-3 h-3" />
                    ENTER
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
