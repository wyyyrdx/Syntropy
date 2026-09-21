import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { generateRealmTilemap, generateRealmFauna, drawTile, drawPlayerSprite, drawAmbientAnimal, faunaWorldPos, drawInteractionIndicator, TILE_SIZE } from '../game/tileEngine';
import { retroAudio } from '../audio/retroAudio';
import { Globe, Sparkles, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';

function landmarkSourceId(realmId, landmarkId) {
  return `landmark:${realmId}:${landmarkId}`;
}

function discoveredFromStats(realm, playerStats) {
  const completed = playerStats?.completedQuizzes || [];
  return new Set(
    (realm?.landmarks || [])
      .filter((lm) => completed.includes(landmarkSourceId(realm.id, lm.id)))
      .map((lm) => lm.id)
  );
}

export default function World3D({ realm, onBackToGlobe, onOpenQuiz, playerStats, onAwardXP, isInputLocked = false }) {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({
    x: realm.mapConfig.playerStart.x,
    y: realm.mapConfig.playerStart.y,
    direction: 'down',
    isMoving: false
  });
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [discoveredLandmarks, setDiscoveredLandmarks] = useState(() => discoveredFromStats(realm, playerStats));
  const [tilemapData, setTilemapData] = useState(() => generateRealmTilemap(realm));
  const fauna = useMemo(() => generateRealmFauna(realm, tilemapData), [realm?.id, tilemapData]);

  // Regenerate tilemap if realm changes
  useEffect(() => {
    setTilemapData(generateRealmTilemap(realm));
    setPlayer({
      x: realm.mapConfig.playerStart.x,
      y: realm.mapConfig.playerStart.y,
      direction: 'down',
      isMoving: false
    });
    setDiscoveredLandmarks(discoveredFromStats(realm, playerStats));
    setActiveDialogue({
      type: 'npc',
      name: realm.npc.name,
      title: realm.npc.title,
      avatar: realm.npc.avatar,
      text: realm.npc.dialogue
    });
    retroAudio.playInteract();
  }, [realm?.id]);

  // Check nearby interactive entities
  const getNearbyEntity = useCallback((px, py) => {
    // Check landmarks
    for (const lm of realm.landmarks) {
      if (Math.hypot(lm.x - px, lm.y - py) <= 1.5) {
        return { type: 'landmark', data: lm };
      }
    }
    // Check NPC (near player start or designated spot)
    const npcX = realm.mapConfig.playerStart.x + 1;
    const npcY = realm.mapConfig.playerStart.y;
    if (Math.hypot(npcX - px, npcY - py) <= 1.5) {
      return {
        type: 'npc',
        data: {
          name: realm.npc.name,
          title: realm.npc.title,
          avatar: realm.npc.avatar,
          dialogue: realm.npc.dialogue
        }
      };
    }
    return null;
  }, [realm]);

  // Move player handler
  const movePlayer = useCallback((dx, dy, dir) => {
    if (isInputLocked) return;
    setPlayer(prev => {
      const nextX = prev.x + dx;
      const nextY = prev.y + dy;
      const key = `${nextX},${nextY}`;

      // Check boundary and solid obstacles
      if (nextX < 0 || nextX >= tilemapData.width || nextY < 0 || nextY >= tilemapData.height) {
        return { ...prev, direction: dir, isMoving: false };
      }
      if (tilemapData.obstacles.has(key)) {
        return { ...prev, direction: dir, isMoving: false };
      }

      retroAudio.playFootstep();
      return {
        x: nextX,
        y: nextY,
        direction: dir,
        isMoving: true
      };
    });
  }, [tilemapData, isInputLocked]);

  // Award discovery XP after movement settles (never inside setPlayer)
  useEffect(() => {
    if (!realm?.landmarks?.length) return;
    const newlyFound = realm.landmarks.filter(
      (lm) => Math.hypot(lm.x - player.x, lm.y - player.y) <= 1.2 && !discoveredLandmarks.has(lm.id)
    );
    if (newlyFound.length === 0) return;

    setDiscoveredLandmarks((prev) => {
      const next = new Set(prev);
      newlyFound.forEach((lm) => next.add(lm.id));
      return next;
    });
    newlyFound.forEach((lm) => {
      retroAudio.playInteract();
      if (onAwardXP) onAwardXP(50, `Discovered ${lm.name}!`, landmarkSourceId(realm.id, lm.id));
    });
  }, [player.x, player.y, realm, discoveredLandmarks, onAwardXP]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isInputLocked) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, -1, 'up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, 1, 'down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer(-1, 0, 'left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer(1, 0, 'right');
      } else if (['Space', 'KeyE', 'Enter'].includes(e.code)) {
        e.preventDefault();
        const nearby = getNearbyEntity(player.x, player.y);
        if (nearby) {
          retroAudio.playInteract();
          if (nearby.type === 'landmark') {
            setActiveDialogue({
              type: 'landmark',
              name: nearby.data.name,
              category: nearby.data.category,
              icon: nearby.data.icon,
              fact: nearby.data.fact,
              quiz: nearby.data.quiz
            });
          } else {
            setActiveDialogue({
              type: 'npc',
              name: nearby.data.name,
              title: nearby.data.title,
              avatar: nearby.data.avatar,
              text: nearby.data.dialogue
            });
          }
        } else if (activeDialogue) {
          setActiveDialogue(null);
        }
      } else if (e.code === 'Escape') {
        setActiveDialogue(null);
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        setPlayer(prev => ({ ...prev, isMoving: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [movePlayer, getNearbyEntity, player.x, player.y, activeDialogue, isInputLocked]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Camera calculations (centered on player)
      const viewportWidth = canvas.width;
      const viewportHeight = canvas.height;
      const cameraX = Math.floor(player.x * TILE_SIZE + TILE_SIZE / 2 - viewportWidth / 2);
      const cameraY = Math.floor(player.y * TILE_SIZE + TILE_SIZE / 2 - viewportHeight / 2);

      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // 1. Draw Visible Tiles
      const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
      const endCol = Math.min(tilemapData.width, Math.ceil((cameraX + viewportWidth) / TILE_SIZE));
      const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
      const endRow = Math.min(tilemapData.height, Math.ceil((cameraY + viewportHeight) / TILE_SIZE));

      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          const tileType = tilemapData.grid[y][x];
          drawTile(ctx, tileType, x * TILE_SIZE, y * TILE_SIZE, tick);
        }
      }

      // 2. Draw NPC
      const npcX = (realm.mapConfig.playerStart.x + 1) * TILE_SIZE;
      const npcY = realm.mapConfig.playerStart.y * TILE_SIZE;
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText(realm.npc.avatar, npcX + 16, npcY + 24);

      // NPC floating label
      ctx.fillStyle = '#f8fafc';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(realm.npc.name.split(' ')[0], npcX + 16, npcY - 4);

      if (Math.hypot(realm.mapConfig.playerStart.x + 1 - player.x, realm.mapConfig.playerStart.y - player.y) <= 1.5) {
        drawInteractionIndicator(ctx, npcX, npcY, '!', tick);
      }

      // 3. Draw Landmarks
      realm.landmarks.forEach(lm => {
        const lx = lm.x * TILE_SIZE;
        const ly = lm.y * TILE_SIZE;

        // Landmark Base Aura
        const isDiscovered = discoveredLandmarks.has(lm.id);
        ctx.fillStyle = isDiscovered ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.3)';
        ctx.beginPath();
        ctx.arc(lx + 16, ly + 16, 20, 0, Math.PI * 2);
        ctx.fill();

        // Landmark Icon
        ctx.font = '26px serif';
        ctx.textAlign = 'center';
        ctx.fillText(lm.icon, lx + 16, ly + 25);

        // Name tag
        ctx.fillStyle = isDiscovered ? '#34d399' : '#fbbf24';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(lm.name.slice(0, 16), lx + 16, ly + 38);

        // Interaction bubble if nearby
        if (Math.hypot(lm.x - player.x, lm.y - player.y) <= 1.5) {
          drawInteractionIndicator(ctx, lx, ly, isDiscovered ? '?' : '!', tick);
        }
      });

      const faunaNow = fauna.map((animal) => ({ animal, ...faunaWorldPos(animal, tick) }));
      faunaNow
        .filter((critter) => critter.y <= player.y)
        .forEach((critter) => drawAmbientAnimal(ctx, critter.animal, tick));

      // 4. Draw Player Explorer Sprite
      drawPlayerSprite(ctx, player.x * TILE_SIZE, player.y * TILE_SIZE, player.direction, player.isMoving, tick);

      faunaNow
        .filter((critter) => critter.y > player.y)
        .forEach((critter) => drawAmbientAnimal(ctx, critter.animal, tick));

      ctx.restore();

      // 5. Mini-map Radar Overlay (Top-Right of canvas)
      const mmWidth = 80;
      const mmHeight = 65;
      const mmX = canvas.width - mmWidth - 10;
      const mmY = 10;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(mmX, mmY, mmWidth, mmHeight);
      ctx.strokeRect(mmX, mmY, mmWidth, mmHeight);

      // Draw map dots
      const scaleX = mmWidth / tilemapData.width;
      const scaleY = mmHeight / tilemapData.height;

      // Landmarks dots
      realm.landmarks.forEach(lm => {
        ctx.fillStyle = discoveredLandmarks.has(lm.id) ? '#10b981' : '#f59e0b';
        ctx.fillRect(mmX + lm.x * scaleX - 1, mmY + lm.y * scaleY - 1, 3, 3);
      });

      // Player blip
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(mmX + player.x * scaleX - 2, mmY + player.y * scaleY - 2, 4, 4);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [player, tilemapData, realm, discoveredLandmarks, fauna]);

  const nearbyEntity = getNearbyEntity(player.x, player.y);

  // Handle canvas tap to step towards clicked direction
  const handleCanvasTap = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const dx = clickX - halfW;
    const dy = clickY - halfH;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 25) movePlayer(1, 0, 'right');
      else if (dx < -25) movePlayer(-1, 0, 'left');
    } else {
      if (dy > 25) movePlayer(0, 1, 'down');
      else if (dy < -25) movePlayer(0, -1, 'up');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-2 w-full max-w-5xl">
      {/* Top Realm Navigation Bar */}
      <div className="w-full bg-slate-900 border-2 border-slate-700 p-2 sm:p-2.5 rounded-t-lg flex flex-col gap-1.5 sm:gap-2">
        {/* Mobile View Header: 2 clean sub-rows */}
        <div className="sm:hidden flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                retroAudio.playWarp();
                onBackToGlobe();
              }}
              className="btn-pixel py-1 px-2 text-[9px] flex items-center gap-1 shrink-0"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>GLOBE</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-cyan-300 px-1.5 py-0.5 bg-slate-850 rounded border border-cyan-500/30">
                {realm.biome.split(' ')[0]}
              </span>
              {nearbyEntity && (
                <div className="flex items-center px-1.5 py-0.5 bg-amber-500/20 border border-amber-400 text-amber-300 font-pixel text-[8px] animate-bounce shrink-0">
                  [!] NEARBY
                </div>
              )}
            </div>
          </div>

          <div className="text-center font-pixel text-xs text-amber-400 py-0.5 truncate">
            {realm.name}
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-800/80 pt-1">
            GRID: ({player.x}, {player.y}) • {realm.elevation} • {discoveredLandmarks.size}/{realm.landmarks.length} FOUND
          </div>
        </div>

        {/* Desktop View Header: Full flex row */}
        <div className="hidden sm:flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                retroAudio.playWarp();
                onBackToGlobe();
              }}
              className="btn-pixel py-1 px-2.5 text-[10px] flex items-center gap-1 shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>GLOBE</span>
            </button>
            <span className="font-pixel text-xs text-amber-400">{realm.name}</span>
            <span className="font-mono text-[9px] text-cyan-300 px-1.5 py-0.5 bg-slate-800 rounded border border-cyan-500/30">
              {realm.biome}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <div>
              GRID: ({player.x}, {player.y}) • {realm.elevation} • {discoveredLandmarks.size}/{realm.landmarks.length} FOUND
            </div>
            {nearbyEntity && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-400 text-amber-300 font-pixel text-[8px] animate-bounce shrink-0">
                [SPACE] TO INTERACT
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main RPG Canvas Viewport */}
      <div className="relative pixel-box w-full flex items-center justify-center bg-black overflow-hidden border-2 border-slate-700">
        <canvas
          ref={canvasRef}
          width={760}
          height={480}
          onClick={handleCanvasTap}
          onTouchStart={handleCanvasTap}
          className="max-w-full h-auto cursor-crosshair block rounded"
        />

        {/* Floating Dialogue Box (Retro RPG Box) */}
        {activeDialogue && (
          <div
            style={{ backgroundColor: '#070d1a' }}
            className="absolute inset-x-2 bottom-2 sm:bottom-4 sm:inset-x-4 border-3 border-amber-400 p-3 sm:p-4 shadow-2xl z-30 max-w-2xl mx-auto backdrop-blur animate-fadeIn max-h-[80%] overflow-y-auto"
          >
            {activeDialogue.type === 'npc' ? (
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl p-1.5 sm:p-2 bg-slate-900 border border-amber-400 rounded shrink-0">
                  {activeDialogue.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="font-pixel text-[11px] sm:text-xs text-amber-400 truncate">{activeDialogue.name}</span>
                    <span className="font-mono text-[9px] sm:text-xs text-slate-400">{activeDialogue.title}</span>
                  </div>
                  <p className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed">
                    "{activeDialogue.text}"
                  </p>
                  <div className="mt-2.5 flex justify-end">
                    <button
                      onClick={() => setActiveDialogue(null)}
                      className="btn-pixel btn-pixel-amber text-[9px]"
                    >
                      CONTINUE [ESC]
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xl sm:text-2xl shrink-0">{activeDialogue.icon}</span>
                    <span className="font-pixel text-[11px] sm:text-xs text-amber-400 truncate">{activeDialogue.name}</span>
                  </div>
                  <span className="font-mono text-[9px] sm:text-xs text-cyan-400 px-2 py-0.5 bg-slate-900 border border-cyan-500/40 rounded shrink-0">
                    {activeDialogue.category}
                  </span>
                </div>
                <p className="font-mono text-xs sm:text-sm text-slate-200 mb-2.5 bg-slate-900/80 p-2.5 border border-slate-700 rounded leading-relaxed">
                  {activeDialogue.fact}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const q = activeDialogue.quiz;
                      setActiveDialogue(null);
                      if (q && onOpenQuiz) onOpenQuiz(q);
                    }}
                    className="btn-pixel btn-pixel-green text-[9px] sm:text-[10px] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    TEST KNOWLEDGE
                  </button>
                  <button
                    onClick={() => setActiveDialogue(null)}
                    className="btn-pixel text-[9px]"
                  >
                    CLOSE [ESC]
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Retro Gamepad Controls (Handheld Console Style) */}
      <div className="w-full bg-slate-900 border-2 border-t-0 border-slate-700 p-2 sm:p-3 rounded-b-lg flex items-center justify-between gap-2">
        {/* Direction Pad */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="grid grid-cols-3 gap-1 w-28 sm:w-32 p-1 bg-slate-950/80 border border-slate-800 rounded">
            <div></div>
            <button
              onClick={() => movePlayer(0, -1, 'up')}
              className="btn-pixel p-2 sm:p-2.5 flex items-center justify-center active:scale-95"
              aria-label="Move Up"
            >
              <ArrowUp className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
            <div></div>
            <button
              onClick={() => movePlayer(-1, 0, 'left')}
              className="btn-pixel p-2 sm:p-2.5 flex items-center justify-center active:scale-95"
              aria-label="Move Left"
            >
              <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
            <button
              onClick={() => movePlayer(0, 1, 'down')}
              className="btn-pixel p-2 sm:p-2.5 flex items-center justify-center active:scale-95"
              aria-label="Move Down"
            >
              <ArrowDown className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
            <button
              onClick={() => movePlayer(1, 0, 'right')}
              className="btn-pixel p-2 sm:p-2.5 flex items-center justify-center active:scale-95"
              aria-label="Move Right"
            >
              <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          </div>
          <div className="hidden sm:block font-pixel text-[8px] text-slate-400">
            D-PAD OR TAP SCREEN
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeDialogue) {
                retroAudio.playBlip();
                setActiveDialogue(null);
                return;
              }
              const nearby = getNearbyEntity(player.x, player.y);
              if (nearby) {
                retroAudio.playInteract();
                if (nearby.type === 'landmark') {
                  setActiveDialogue({
                    type: 'landmark',
                    name: nearby.data.name,
                    category: nearby.data.category,
                    icon: nearby.data.icon,
                    fact: nearby.data.fact,
                    quiz: nearby.data.quiz
                  });
                } else {
                  setActiveDialogue({
                    type: 'npc',
                    name: nearby.data.name,
                    title: nearby.data.title,
                    avatar: nearby.data.avatar,
                    text: nearby.data.dialogue
                  });
                }
              }
            }}
            disabled={!nearbyEntity && !activeDialogue}
            className={`btn-pixel text-[10px] sm:text-xs py-3 px-3.5 sm:px-5 rounded flex items-center gap-1.5 font-pixel transition-all active:scale-95 ${
              activeDialogue || nearbyEntity
                ? 'btn-pixel-amber shadow-lg shadow-amber-500/40 animate-pulse'
                : 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>{activeDialogue ? '[A] ADVANCE' : '[A] INTERACT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
