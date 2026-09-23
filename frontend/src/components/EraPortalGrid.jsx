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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {realmsInEra.map((realm) => {
            const isActive = activeRealmId === realm.id;
            return (
              <button
                key={realm.id}
                onClick={() => handleEnterRealm(realm)}
                className={`waypoint-card ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{realm.npc.avatar}</span>
                  <span className="font-mono text-[9px] text-cyan-400 uppercase">{realm.period}</span>
                </div>
                <div className="font-pixel text-[8px] text-slate-100 line-clamp-2 leading-tight">
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
