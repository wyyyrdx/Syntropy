import React, { useState } from 'react';
import { ERAS } from '../data/historyEras';
import { HISTORY_REALMS, realmsByEra } from '../data/historyRealms';
import { retroAudio } from '../audio/retroAudio';
import { Landmark, Swords, Anchor, Flag, Compass } from 'lucide-react';

const ERA_ICONS = { Landmark, Swords, Anchor, Flag };

export default function EraPortalGrid({ onSelectRealm, activeRealmId }) {
  const [selectedEraId, setSelectedEraId] = useState(ERAS[0].id);
  const selectedEra = ERAS.find((e) => e.id === selectedEraId);
  const realmsInEra = realmsByEra(selectedEraId);

  const handleSelectEra = (eraId) => {
    retroAudio.playBlip();
    setSelectedEraId(eraId);
  };

  const handleEnterRealm = (realm) => {
    retroAudio.playWarp();
    onSelectRealm(realm);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-5xl">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3 px-1 sm:px-2 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
          <span className="font-pixel text-[9px] sm:text-xs text-cyan-300">SELECT AN ERA TO ENTER</span>
        </div>
      </div>

      {/* Era Portal Cards */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        {ERAS.map((era) => {
          const Icon = ERA_ICONS[era.icon] || Landmark;
          const isSelected = era.id === selectedEraId;
          const eraRealmCount = realmsByEra(era.id).length;
          return (
            <button
              key={era.id}
              onClick={() => handleSelectEra(era.id)}
              className="pixel-box era-portal-card"
              style={{
                borderColor: isSelected ? era.themeColor : undefined,
                boxShadow: isSelected
                  ? `0 0 18px ${era.themeColor}55, 4px 4px 0px rgba(0,0,0,0.8)`
                  : undefined
              }}
            >
              <Icon
                className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2"
                style={{ color: era.themeColor }}
              />
              <div className="font-pixel text-[9px] sm:text-[10px] text-slate-100 text-center leading-snug">
                {era.label}
              </div>
              <div className="font-mono text-[9px] sm:text-[10px] text-slate-400 text-center mt-1">
                {era.range}
              </div>
              <div
                className="font-mono text-[9px] text-center mt-2 px-2 py-0.5 rounded border inline-block mx-auto"
                style={{ borderColor: `${era.themeColor}55`, color: era.themeColor }}
              >
                {eraRealmCount} REALMS
              </div>
            </button>
          );
        })}
      </div>

      {/* Realms within the selected era */}
      <div className="w-full max-w-5xl">
        <div className="font-pixel text-[9px] sm:text-[10px] text-slate-400 mb-2 flex items-center gap-2 px-1">
          <span style={{ color: selectedEra.themeColor }}>●</span>
          <span>{selectedEra.label.toUpperCase()} WAYPOINTS ({realmsInEra.length}):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {realmsInEra.map((realm) => {
            const isActive = activeRealmId === realm.id;
            return (
              <button
                key={realm.id}
                onClick={() => handleEnterRealm(realm)}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer group min-h-[88px] ${
                  isActive
                    ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                    : 'bg-[#090f1d]/90 border-[#19263e] hover:border-amber-400/60 hover:bg-[#0d162a] hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl filter drop-shadow">{realm.npc.avatar}</span>
                    <span className="font-mono text-[11px] text-amber-300/90 tracking-wider font-semibold uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                      {realm.period}
                    </span>
                  </div>
                  {isActive && (
                    <span className="font-mono text-[10px] text-amber-300 font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-slate-100 group-hover:text-amber-200 transition-colors leading-snug">
                  {realm.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-center text-[9px] sm:text-[10px] font-mono text-cyan-400/90 bg-slate-900/90 px-3 py-1.5 border border-cyan-500/30 rounded flex items-center justify-center gap-1.5 max-w-sm">
        <span className="text-amber-400 font-pixel text-[8px] animate-pulse">●</span>
        <span>PICK AN ERA • CLICK A WAYPOINT TO ENTER</span>
      </div>
    </div>
  );
}
