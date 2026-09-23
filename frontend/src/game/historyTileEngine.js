/**
 * Syntropy History — Retro Tile Engine
 * Same rendering approach as Geography's tileEngine.js, with era-appropriate
 * tiles/props instead of biomes/wildlife. drawPlayerSprite and
 * drawInteractionIndicator are copied verbatim from Geography's tileEngine.js
 * (unchanged) so this file works standalone in a sibling app — if your
 * project can share one copy instead, delete the duplicates here and import
 * from the Geography file.
 */

export const TILE_SIZE = 32;

/* ---------------------------------------------------------------------- */
/*  Tilemap generation                                                     */
/* ---------------------------------------------------------------------- */

export function generateRealmTilemap(realm) {
  const width = realm.mapConfig.width || 20;
  const height = realm.mapConfig.height || 16;
  const baseType = realm.mapConfig.baseTile || 'stone_courtyard';
  const grid = [];
  const obstacles = new Set();

  function pseudoRandom(x, y, seed = 42) {
    const val = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return val - Math.floor(val);
  }

  const trailCoords = new Set();
  const startX = realm.mapConfig?.playerStart?.x ?? 3;
  const startY = realm.mapConfig?.playerStart?.y ?? 9;

  function addLine(x0, y0, x1, y1) {
    let cx = x0;
    let cy = y0;
    trailCoords.add(`${cx},${cy}`);
    while (cx !== x1) {
      cx += cx < x1 ? 1 : -1;
      trailCoords.add(`${cx},${cy}`);
    }
    while (cy !== y1) {
      cy += cy < y1 ? 1 : -1;
      trailCoords.add(`${cx},${cy}`);
    }
  }

  (realm.landmarks || []).forEach((lm) => addLine(startX, startY, lm.x, lm.y));

  // Boundary "wall" tile per base type
  const wallFor = {
    forest_floor: 'rock_wall',
    brick_street: 'brick_wall',
    stone_courtyard: 'stone_wall',
    sandstone_court: 'sandstone_wall',
    dock_planks: 'water_edge',
    fort_rubble: 'rubble_wall',
    cobblestone: 'stone_wall',
    factory_floor: 'brick_wall',
    ashram_courtyard: 'stone_wall',
    trench_mud: 'sandbag_wall'
  };

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let tile = baseType;
      let isSolid = false;
      const noise = pseudoRandom(x, y, 101);

      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        tile = wallFor[baseType] || 'stone_wall';
        isSolid = true;
      } else if (baseType === 'forest_floor' && noise > 0.82) {
        tile = 'boulder';
        isSolid = true;
      } else if (baseType === 'brick_street' && (x % 6 === 0 || y % 6 === 0) && noise > 0.5) {
        tile = 'brick_wall';
        isSolid = true;
      } else if ((baseType === 'stone_courtyard' || baseType === 'sandstone_court') && noise > 0.86) {
        tile = 'pillar';
        isSolid = true;
      } else if (baseType === 'dock_planks' && x > width - 5) {
        tile = 'water_edge';
        isSolid = true;
      } else if (baseType === 'fort_rubble' && noise > 0.8) {
        tile = 'rubble_pile';
        isSolid = true;
      } else if (baseType === 'cobblestone' && noise > 0.85) {
        tile = 'barricade';
        isSolid = true;
      } else if (baseType === 'factory_floor' && noise > 0.82) {
        tile = 'crate';
        isSolid = true;
      } else if (baseType === 'ashram_courtyard' && noise > 0.85) {
        tile = 'well';
        isSolid = true;
      } else if (baseType === 'trench_mud' && noise > 0.8) {
        tile = 'sandbag_wall';
        isSolid = true;
      } else if (noise > 0.93) {
        tile = 'banner';
      }

      if (trailCoords.has(`${x},${y}`) && x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        tile = baseType === 'dock_planks' ? 'dock_planks' : 'path';
        isSolid = false;
      }

      (realm.landmarks || []).forEach((lm) => {
        if (Math.abs(lm.x - x) <= 1 && Math.abs(lm.y - y) <= 1) {
          isSolid = false;
          if (lm.x === x && lm.y === y) tile = 'landmark_pad';
        }
      });

      if (startX === x && startY === y) {
        isSolid = false;
        tile = 'path';
      }

      if (isSolid) obstacles.add(`${x},${y}`);
      row.push(tile);
    }
    grid.push(row);
  }

  return { grid, obstacles, width, height };
}

/* ---------------------------------------------------------------------- */
/*  Tile rendering                                                         */
/* ---------------------------------------------------------------------- */

export function drawTile(ctx, tileType, px, py, tick = 0) {
  ctx.save();
  ctx.translate(px, py);

  switch (tileType) {
    case 'forest_floor':
      ctx.fillStyle = '#3a3220';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#4d4429';
      ctx.fillRect(4, 6, 6, 5);
      ctx.fillRect(18, 16, 6, 5);
      break;

    case 'boulder':
    case 'rock_wall':
      ctx.fillStyle = '#2b2620';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#57503f';
      ctx.fillRect(4, 6, 24, 20);
      ctx.fillStyle = '#726a54';
      ctx.fillRect(8, 8, 12, 10);
      break;

    case 'brick_street':
      ctx.fillStyle = '#5a4632';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#6f5a40';
      ctx.fillRect(2, 4, 12, 6);
      ctx.fillRect(16, 4, 14, 6);
      ctx.fillRect(2, 14, 14, 6);
      ctx.fillRect(18, 14, 12, 6);
      break;

    case 'brick_wall':
      ctx.fillStyle = '#3a2c1e';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#8a4a30';
      ctx.fillRect(2, 2, 28, 12);
      ctx.fillRect(2, 18, 28, 12);
      ctx.strokeStyle = '#2a1c12';
      ctx.strokeRect(2, 2, 28, 12);
      break;

    case 'stone_courtyard':
      ctx.fillStyle = '#3a3648';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#4a4560';
      ctx.fillRect(2, 2, 13, 13);
      ctx.fillRect(17, 17, 13, 13);
      break;

    case 'stone_wall':
      ctx.fillStyle = '#2a2738';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#5b5678';
      ctx.fillRect(3, 3, 26, 26);
      ctx.fillStyle = '#726ea0';
      ctx.fillRect(6, 6, 10, 10);
      break;

    case 'pillar':
      ctx.fillStyle = '#3a3648';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#c99a3d';
      ctx.fillRect(10, 2, 12, 28);
      ctx.fillStyle = '#a97f2e';
      ctx.fillRect(10, 2, 12, 4);
      ctx.fillRect(10, 26, 12, 4);
      break;

    case 'sandstone_court':
      ctx.fillStyle = '#5a3f22';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#7a5730';
      ctx.fillRect(2, 2, 13, 13);
      ctx.fillRect(17, 17, 13, 13);
      break;

    case 'sandstone_wall':
      ctx.fillStyle = '#3a2814';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#9a6a34';
      ctx.fillRect(3, 3, 26, 26);
      ctx.fillStyle = '#c99a3d';
      ctx.fillRect(10, 6, 12, 8);
      break;

    case 'dock_planks':
      ctx.fillStyle = '#4a3420';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#6b4c2c';
      ctx.fillRect(0, 4, 32, 6);
      ctx.fillRect(0, 14, 32, 6);
      ctx.fillRect(0, 24, 32, 6);
      break;

    case 'water_edge':
      ctx.fillStyle = '#204a5c';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#3a7a92';
      ctx.fillRect(2, 8, 12, 3);
      ctx.fillRect(16, 20, 12, 3);
      break;

    case 'fort_rubble':
      ctx.fillStyle = '#3a2422';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#54332f';
      ctx.fillRect(4, 6, 8, 6);
      ctx.fillRect(18, 16, 8, 6);
      break;

    case 'rubble_pile':
    case 'rubble_wall':
      ctx.fillStyle = '#2a1a18';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#6b463f';
      ctx.fillRect(4, 10, 24, 16);
      ctx.fillStyle = '#8a5a50';
      ctx.fillRect(8, 6, 10, 10);
      break;

    case 'cobblestone':
      ctx.fillStyle = '#3a3a42';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#4a4a54' : '#454550';
        ctx.fillRect((i % 2) * 16 + 2, Math.floor(i / 2) * 16 + 2, 12, 12);
      }
      break;

    case 'barricade':
      ctx.fillStyle = '#3a3a42';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#6b4c2c';
      ctx.fillRect(4, 8, 24, 6);
      ctx.fillRect(4, 18, 24, 6);
      break;

    case 'factory_floor':
      ctx.fillStyle = '#2e2e34';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#45454e';
      ctx.fillRect(2, 2, 28, 4);
      ctx.fillRect(2, 26, 28, 4);
      break;

    case 'crate':
      ctx.fillStyle = '#2e2e34';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#8a6a3a';
      ctx.fillRect(6, 6, 20, 20);
      ctx.strokeStyle = '#5a4420';
      ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, 20, 20);
      break;

    case 'ashram_courtyard':
      ctx.fillStyle = '#4a3f2a';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#5f5236';
      ctx.fillRect(2, 2, 13, 13);
      ctx.fillRect(17, 17, 13, 13);
      break;

    case 'well':
      ctx.fillStyle = '#4a3f2a';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#3a4a5c';
      ctx.beginPath();
      ctx.arc(16, 16, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c99a3d';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case 'trench_mud':
      ctx.fillStyle = '#3a2e24';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#4a3c2e';
      ctx.fillRect(4, 10, 24, 12);
      break;

    case 'sandbag_wall':
      ctx.fillStyle = '#2a221a';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#7a6a4a';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(2, 4 + i * 9, 28, 7);
      }
      break;

    case 'banner':
      ctx.fillStyle = '#3a3648';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#b6483f';
      ctx.fillRect(14, 2, 6, 20);
      break;

    case 'path':
      ctx.fillStyle = '#5a4a34';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#6f5c42';
      ctx.fillRect(4, 6, 8, 4);
      ctx.fillRect(18, 20, 8, 4);
      break;

    case 'landmark_pad':
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#e8b23c';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 28, 28);
      break;

    default:
      ctx.fillStyle = '#232130';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      break;
  }

  ctx.restore();
}

/* ---------------------------------------------------------------------- */
/*  Player sprite + interaction bubble (verbatim copy — see file header)   */
/* ---------------------------------------------------------------------- */

export function drawPlayerSprite(ctx, px, py, direction = 'down', isMoving = false, tick = 0) {
  ctx.save();
  ctx.translate(px, py);

  const bob = isMoving ? (Math.sin(tick * 0.25) > 0 ? -2 : 0) : 0;
  const legOffset = isMoving ? Math.sin(tick * 0.25) * 3 : 0;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(16, 28, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#78350f';
  if (direction === 'left' || direction === 'right') {
    ctx.fillRect(13 + legOffset, 22 + bob, 6, 8);
  } else {
    ctx.fillRect(10 - legOffset, 22 + bob, 4, 8);
    ctx.fillRect(18 + legOffset, 22 + bob, 4, 8);
  }

  ctx.fillStyle = '#b45309';
  ctx.fillRect(10, 18 + bob, 12, 6);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(9, 10 + bob, 14, 10);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(11, 10 + bob, 2, 9);
  ctx.fillRect(19, 10 + bob, 2, 9);

  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(10, 4 + bob, 12, 8);

  ctx.fillStyle = '#0f172a';
  if (direction === 'down') {
    ctx.fillRect(12, 7 + bob, 2, 2);
    ctx.fillRect(18, 7 + bob, 2, 2);
  } else if (direction === 'left') {
    ctx.fillRect(10, 7 + bob, 2, 2);
  } else if (direction === 'right') {
    ctx.fillRect(20, 7 + bob, 2, 2);
  }

  ctx.fillStyle = '#d97706';
  ctx.fillRect(6, 2 + bob, 20, 4);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(10, 0 + bob, 12, 4);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(10, 3 + bob, 12, 1);

  ctx.restore();
}

export function drawInteractionIndicator(ctx, px, py, label = '!', tick = 0) {
  ctx.save();
  const floatY = Math.sin(tick * 0.1) * 3;
  ctx.translate(px + 16, py - 12 + floatY);

  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);

  ctx.restore();
}

/* ---------------------------------------------------------------------- */
/*  Ambient figures (History's answer to Geography's wildlife)             */
/* ---------------------------------------------------------------------- */

// Kept to 4 shared silhouettes (rather than one unique set per realm) to
// keep this file a manageable size — tint per era gives each realm its own
// feel without 10x the sprite code. Swap in real sprites later per realm
// via the `kind` field if you want more variety.
const FIGURE_COLORS = {
  ancient: { body: '#a97f2e', accent: '#c99a3d' },
  medieval: { body: '#5b4a8a', accent: '#7c5cbf' },
  'early-modern': { body: '#2f6b48', accent: '#3f8f5f' },
  modern: { body: '#8a3a32', accent: '#b6483f' }
};

function pix(ctx, color, x, y, w = 2, h = 2) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawFigure(ctx, kind, era, bob, hop) {
  const c = FIGURE_COLORS[era] || FIGURE_COLORS.ancient;
  switch (kind) {
    case 'trader':
      pix(ctx, c.body, 8, 12 + bob, 12, 10);
      pix(ctx, '#fed7aa', 10, 6 + bob, 8, 8);
      pix(ctx, c.accent, 6, 20 + hop, 4, 6);
      pix(ctx, c.accent, 18, 20 + hop, 4, 6);
      pix(ctx, '#0f172a', 12, 9 + bob, 2, 2);
      break;
    case 'soldier':
      pix(ctx, c.body, 8, 12 + bob, 12, 10);
      pix(ctx, '#fed7aa', 10, 6 + bob, 8, 8);
      pix(ctx, c.accent, 8, 4 + bob, 12, 4);
      pix(ctx, c.body, 6, 20 + hop, 4, 6);
      pix(ctx, c.body, 18, 20 + hop, 4, 6);
      break;
    case 'worker':
      pix(ctx, c.body, 8, 14 + bob, 12, 8);
      pix(ctx, '#fed7aa', 10, 8 + bob, 8, 8);
      pix(ctx, c.accent, 6, 20 + hop, 4, 6);
      pix(ctx, c.accent, 18, 20 + hop, 4, 6);
      break;
    case 'villager':
    default:
      pix(ctx, c.body, 9, 13 + bob, 10, 9);
      pix(ctx, '#fed7aa', 10, 7 + bob, 8, 8);
      pix(ctx, c.accent, 7, 20 + hop, 4, 6);
      pix(ctx, c.accent, 17, 20 + hop, 4, 6);
      break;
  }
}

export function generateRealmFigures(realm, tilemap) {
  const kinds = ['villager', 'trader', 'worker', 'soldier'];
  const width = realm.mapConfig?.width || 20;
  const height = realm.mapConfig?.height || 16;
  const homes = [...(realm.landmarks || [])];
  const start = realm.mapConfig?.playerStart;
  if (start) homes.push({ x: start.x + 2, y: start.y + 1 });

  const figures = [];
  homes.forEach((home, homeIndex) => {
    for (let n = 0; n < 2; n++) {
      let placed = null;
      for (let attempt = 0; attempt < 6 && !placed; attempt++) {
        const angle = (n / 2) * Math.PI * 2 + homeIndex * 0.6 + attempt * 0.5;
        const dist = 1.6 + attempt * 0.2;
        const hx = Math.max(0.6, Math.min(width - 0.6, home.x + Math.cos(angle) * dist));
        const hy = Math.max(0.6, Math.min(height - 0.6, home.y + Math.sin(angle) * dist));
        const key = `${Math.round(hx)},${Math.round(hy)}`;
        if (tilemap?.obstacles?.has(key)) continue;
        placed = { hx, hy };
      }
      if (!placed) continue;
      figures.push({
        kind: kinds[(homeIndex + n) % kinds.length],
        era: realm.era,
        homeX: placed.hx,
        homeY: placed.hy,
        phase: homeIndex * 11 + n * 17,
        speed: 0.008 + (n % 2) * 0.004,
        radius: 0.3 + (n % 2) * 0.2
      });
    }
  });
  return figures;
}

export function figureWorldPos(figure, tick) {
  const x = figure.homeX + Math.cos(tick * figure.speed + figure.phase) * figure.radius;
  const y = figure.homeY + Math.sin(tick * figure.speed + figure.phase) * figure.radius * 0.5;
  return { x, y };
}

export function drawAmbientFigure(ctx, figure, tick) {
  const { x, y } = figureWorldPos(figure, tick);
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  const bob = Math.sin(tick * 0.14 + figure.phase) > 0 ? 0 : -1;
  const hop = Math.sin(tick * 0.2 + figure.phase) > 0 ? 0 : 1;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(px + 2, py - 2);
  ctx.scale(1.4, 1.4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(5, 22, 12, 2);
  drawFigure(ctx, figure.kind, figure.era, bob, hop);
  ctx.restore();
}
