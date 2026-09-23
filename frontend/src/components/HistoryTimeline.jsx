import React from 'react';
import { Clock } from 'lucide-react';
import { HISTORY_REALMS } from '../data/history/historyRealm';
import { retroAudio } from '../audio/retroAudio';

export default function HistoryTimeline({ onSelectRealm, activeRealmId }) {
  return (
    <div className="w-full max-w-5xl p-4">
      <div className="text-center mb-4">
        <div className="font-pixel text-xs text-amber-300 mb-2">
          <Clock className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle' }} /> TIME REALM MAP
        </div>
        <h2 className="text-xl font-bold text-slate-100 font-pixel">WALK THE ERAS</h2>
        <p className="text-sm text-slate-400 font-mono mt-2">
          Ten linked sites from rock shelters to the world wars. Pick an era to enter its 2D realm.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {HISTORY_REALMS.map((realm) => {
          const active = realm.id === activeRealmId;
          return (
            <div
              key={realm.id}
              className="w-full p-3 rounded border-2"
              style={{
                background: active ? 'rgba(120, 53, 15, 0.45)' : '#0f172a',
                borderColor: active ? '#fbbf24' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="font-pixel text-xs text-amber-300">{realm.elevation}</div>
                <div className="font-mono font-bold text-sm text-slate-100">{realm.name}</div>
                <div className="font-mono text-xs text-slate-400">
                  {realm.region} · {realm.biome}
                </div>
                <p className="font-mono text-xs text-slate-400 mt-1 leading-relaxed">{realm.description}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  retroAudio.playWarp();
                  onSelectRealm?.(realm);
                }}
                className="btn-pixel btn-pixel-amber text-xs"
                style={{ flexShrink: 0 }}
              >
                ENTER
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
