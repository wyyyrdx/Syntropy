/**
 * Syntropy Retro Tile Engine
 * Renders crisp 2D pixel-art top-down explorable environments on an HTML5 canvas.
 */

export const TILE_SIZE = 32;

// Color palettes for different tile types
const TILE_COLORS = {
  // Amazon
  grass_dense: { base: '#15803d', detail: '#166534', alt: '#22c55e' },
  tree: { trunk: '#78350f', foliage: '#064e3b', light: '#059669' },
  water: { deep: '#0369a1', shallow: '#0284c7', foam: '#7dd3fc' },
  path: { base: '#b45309', detail: '#78350f' },
  
  // Himalayas
  snow_rock: { base: '#e2e8f0', detail: '#cbd5e1', alt: '#ffffff' },
  rock_mountain: { base: '#475569', peak: '#94a3b8', shadow: '#1e293b' },
  ice_crevasse: { base: '#0ea5e9', deep: '#0369a1' },
  
  // Sahara
  sand_dune: { base: '#d97706', detail: '#b45309', light: '#f59e0b' },
  sandstone: { base: '#92400e', shadow: '#78350f' },
  palm: { trunk: '#78350f', leaves: '#15803d' },
  
  // Mariana / Ocean
  coral_atoll: { base: '#0d9488', detail: '#0f766e', coral: '#f43f5e' },
  trench_chasm: { base: '#020617', rim: '#1e1b4b' },
  
  // Savannah
  savannah_grass: { base: '#ca8a04', detail: '#a16207', alt: '#eab308' },
  acacia: { trunk: '#78350f', canopy: '#65a30d' },
  
  // Nile
  alluvial_soil: { base: '#854d0e', detail: '#713f12', crop: '#4d7c0f' }
};

/**
 * Generate a deterministic tilemap grid for a given realm
 */
export function generateRealmTilemap(realm) {
  const width = realm.mapConfig.width || 24;
  const height = realm.mapConfig.height || 20;
  const baseType = realm.mapConfig.baseTile || 'grass_dense';
  const grid = [];
  const obstacles = new Set(); // Stores "x,y" keys for impassable tiles

  // Helper pseudo-random function based on seed
  function pseudoRandom(x, y, seed = 42) {
    const val = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return val - Math.floor(val);
  }

  // Pre-calculate path coordinates to guarantee 100% reachable routes to every landmark
  const trailCoords = new Set();
  const startX = realm.mapConfig?.playerStart?.x ?? 4;
  const startY = realm.mapConfig?.playerStart?.y ?? 10;

  function addLine(x0, y0, x1, y1) {
    let currX = x0;
    let currY = y0;
    trailCoords.add(`${currX},${currY}`);
    while (currX !== x1) {
      currX += currX < x1 ? 1 : -1;
      trailCoords.add(`${currX},${currY}`);
    }
    while (currY !== y1) {
      currY += currY < y1 ? 1 : -1;
      trailCoords.add(`${currX},${currY}`);
    }
  }

  // Connect player start to each landmark
  if (realm.landmarks && realm.landmarks.length > 0) {
    realm.landmarks.forEach(lm => {
      addLine(startX, startY, lm.x, lm.y);
    });
  }

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let tile = baseType;
      let isSolid = false;

      // Outer boundary walls
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        if (baseType === 'snow_rock') tile = 'rock_mountain';
        else if (baseType === 'coral_atoll') tile = 'deep_water';
        else if (baseType === 'sand_dune') tile = 'sandstone';
        else tile = 'tree';
        isSolid = true;
      } else {
        // Natural features and scatter
        const noise = pseudoRandom(x, y, 101);

        if (realm.id === 'amazon-basin') {
          // Meandering River through middle
          const riverY = Math.floor(10 + Math.sin(x * 0.4) * 3);
          if (Math.abs(y - riverY) <= 1) {
            tile = 'water';
            isSolid = true;
            if (x === 12 || x === 13) {
              tile = 'bridge';
              isSolid = false;
            }
          } else if (noise > 0.72) {
            tile = 'tree';
            isSolid = true;
          } else if (noise > 0.55) {
            tile = 'dense_flower';
          }
        } else if (realm.id === 'himalayan-range') {
          if ((x > 14 && y < 8) || (x < 6 && y > 12) || noise > 0.8) {
            tile = 'rock_mountain';
            isSolid = true;
          } else if (noise > 0.65) {
            tile = 'ice_crevasse';
          }
        } else if (realm.id === 'sahara-erg') {
          const distToOasis = Math.hypot(x - 12, y - 10);
          if (distToOasis < 2.5) {
            tile = distToOasis < 1.2 ? 'water' : 'oasis_grass';
            if (distToOasis < 1.2) isSolid = true;
          } else if (noise > 0.8) {
            tile = 'sandstone';
            isSolid = true;
          } else if (noise > 0.6) {
            tile = 'dune_crest';
          }
        } else if (realm.id === 'mariana-trench') {
          if (x > 10 && x < 16 && y > 6 && y < 14) {
            tile = 'trench_chasm';
            isSolid = true;
          } else if (noise > 0.75) {
            tile = 'coral_rock';
            isSolid = true;
          }
        } else if (realm.id === 'great-rift-valley') {
          if (x >= 10 && x <= 12 && y > 2 && y < 18) {
            tile = 'escarpment';
            if (x === 11 && (y === 8 || y === 9)) {
              tile = 'path';
            } else {
              isSolid = true;
            }
          } else if (noise > 0.75) {
            tile = 'acacia_tree';
            isSolid = true;
          }
        } else if (realm.id === 'nile-delta') {
          const branch1 = Math.floor(y * 0.7 + 5);
          const branch2 = Math.floor(18 - y * 0.5);
          if (x === branch1 || x === branch2) {
            tile = 'water';
            isSolid = true;
            if (y === 10) { tile = 'bridge'; isSolid = false; }
          } else if (noise > 0.78) {
            tile = 'reed_thicket';
            isSolid = true;
          }
        }
      }

      // If this tile is on the guaranteed trail, clear obstacles and carve trail/bridge
      if (trailCoords.has(`${x},${y}`) && x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        if (tile === 'water' || tile === 'deep_water') {
          tile = 'bridge';
          isSolid = false;
        } else {
          tile = 'path';
          isSolid = false;
        }
      }

      // Ensure landmark locations are not solid
      realm.landmarks.forEach(lm => {
        if (Math.abs(lm.x - x) <= 1 && Math.abs(lm.y - y) <= 1) {
          isSolid = false;
          if (lm.x === x && lm.y === y) tile = 'landmark_pad';
        }
      });

      // Ensure start point is open
      if (startX === x && startY === y) {
        isSolid = false;
        tile = 'path';
      }

      if (isSolid) {
        obstacles.add(`${x},${y}`);
      }
      row.push(tile);
    }
    grid.push(row);
  }

  return { grid, obstacles, width, height };
}

/**
 * Draw a single 32x32 pixel tile
 */
export function drawTile(ctx, tileType, px, py, tick = 0) {
  ctx.save();
  ctx.translate(px, py);

  switch (tileType) {
    case 'grass_dense':
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#166534';
      ctx.fillRect(4, 6, 4, 6);
      ctx.fillRect(18, 14, 4, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(6, 4, 4, 4);
      ctx.fillRect(20, 12, 4, 4);
      break;

    case 'dense_flower':
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(8, 8, 4, 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(20, 18, 4, 4);
      break;

    case 'tree':
    case 'acacia_tree':
      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(12, 16, 8, 16);
      // Foliage
      ctx.fillStyle = tileType === 'acacia_tree' ? '#65a30d' : '#047857';
      ctx.fillRect(4, 2, 24, 18);
      ctx.fillStyle = tileType === 'acacia_tree' ? '#84cc16' : '#10b981';
      ctx.fillRect(8, 4, 16, 12);
      break;

    case 'water':
    case 'deep_water':
      const wave = Math.sin(tick * 0.05 + px * 0.1) * 2;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(2, 6 + wave, 12, 3);
      ctx.fillRect(16, 18 - wave, 12, 3);
      break;

    case 'bridge':
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(2, 2, 28, 28);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(4, 4, 24, 6);
      ctx.fillRect(4, 14, 24, 6);
      ctx.fillRect(4, 24, 24, 4);
      break;

    case 'path':
    case 'dirt_trail':
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(4, 6, 8, 4);
      ctx.fillRect(16, 18, 10, 4);
      ctx.fillStyle = '#713f12';
      ctx.fillRect(10, 14, 6, 3);
      ctx.fillRect(22, 6, 4, 3);
      break;

    case 'snow_rock':
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(6, 6, 8, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 18, 10, 6);
      break;

    case 'rock_mountain':
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(4, 4, 24, 16);
      ctx.fillStyle = '#f8fafc'; // Snowcap
      ctx.fillRect(8, 4, 16, 6);
      break;

    case 'ice_crevasse':
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(8, 4, 8, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, 6, 4, 20);
      break;

    case 'sand_dune':
    case 'dune_crest':
      ctx.fillStyle = '#d97706';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(2, 8, 28, 6);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(4, 20, 24, 4);
      break;

    case 'sandstone':
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 6, 24, 20);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(6, 8, 16, 10);
      break;

    case 'oasis_grass':
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(6, 6, 6, 6);
      break;

    case 'coral_atoll':
      ctx.fillStyle = '#0d9488';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(4, 6, 10, 8);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(18, 16, 6, 6);
      break;

    case 'trench_chasm':
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, 4, 24, 24);
      break;

    case 'savannah_grass':
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(4, 8, 6, 8);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(18, 16, 8, 6);
      break;

    case 'escarpment':
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 16, 32, 16);
      break;

    case 'alluvial_soil':
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(4, 4, 24, 6);
      ctx.fillRect(4, 18, 24, 6);
      break;

    case 'landmark_pad':
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 28, 28);
      break;

    default:
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      break;
  }

  ctx.restore();
}

/**
 * Draw 16x16 Pixel Art Player Explorer Sprite
 */
export function drawPlayerSprite(ctx, px, py, direction = 'down', isMoving = false, tick = 0) {
  ctx.save();
  ctx.translate(px, py);

  const bob = isMoving ? (Math.sin(tick * 0.25) > 0 ? -2 : 0) : 0;
  const legOffset = isMoving ? (Math.sin(tick * 0.25) * 3) : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(16, 28, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs / Boots (Brown leather)
  ctx.fillStyle = '#78350f';
  if (direction === 'left' || direction === 'right') {
    ctx.fillRect(13 + legOffset, 22 + bob, 6, 8);
  } else {
    ctx.fillRect(10 - legOffset, 22 + bob, 4, 8);
    ctx.fillRect(18 + legOffset, 22 + bob, 4, 8);
  }

  // Trousers (Khaki adventurer)
  ctx.fillStyle = '#b45309';
  ctx.fillRect(10, 18 + bob, 12, 6);

  // Shirt / Explorer Vest (Teal / Forest)
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(9, 10 + bob, 14, 10);
  ctx.fillStyle = '#f59e0b'; // Backpack strap
  ctx.fillRect(11, 10 + bob, 2, 9);
  ctx.fillRect(19, 10 + bob, 2, 9);

  // Head / Face
  ctx.fillStyle = '#fed7aa'; // Skin tone
  ctx.fillRect(10, 4 + bob, 12, 8);

  // Eyes based on direction
  ctx.fillStyle = '#0f172a';
  if (direction === 'down') {
    ctx.fillRect(12, 7 + bob, 2, 2);
    ctx.fillRect(18, 7 + bob, 2, 2);
  } else if (direction === 'left') {
    ctx.fillRect(10, 7 + bob, 2, 2);
  } else if (direction === 'right') {
    ctx.fillRect(20, 7 + bob, 2, 2);
  }
  // Up facing doesn't show eyes (shows back of hat)

  // Explorer Hat (Wide brim safari/explorer cap)
  ctx.fillStyle = '#d97706';
  ctx.fillRect(6, 2 + bob, 20, 4); // Brim
  ctx.fillStyle = '#b45309';
  ctx.fillRect(10, 0 + bob, 12, 4); // Crown
  ctx.fillStyle = '#ef4444'; // Red ribbon
  ctx.fillRect(10, 3 + bob, 12, 1);

  ctx.restore();
}

/**
 * Draw floating interaction badge above entities
 */
export function drawInteractionIndicator(ctx, px, py, label = '!', tick = 0) {
  ctx.save();
  const floatY = Math.sin(tick * 0.1) * 3;
  ctx.translate(px + 16, py - 12 + floatY);

  // Bubble
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);

  ctx.restore();
}

const REALM_FAUNA = {
  'amazon-basin': ['parrot', 'monkey', 'butterfly', 'frog'],
  'himalayan-range': ['eagle', 'goat', 'yak', 'snowcat'],
  'sahara-erg': ['camel', 'lizard', 'fox', 'eagle'],
  'mariana-trench': ['fish', 'turtle', 'squid', 'jelly'],
  'great-rift-valley': ['giraffe', 'zebra', 'elephant', 'lion'],
  'nile-delta': ['ibis', 'croc', 'hippo', 'heron']
};

/**
 * Quiet scenic animals around landmarks. Visual only — not interactable.
 */
function faunaTileBlocked(tilemap, x, y) {
  if (!tilemap) return false;
  const ix = Math.round(x);
  const iy = Math.round(y);
  const tile = tilemap.grid?.[iy]?.[ix];
  return tilemap.obstacles?.has(`${ix},${iy}`)
    || tile === 'water'
    || tile === 'deep_water'
    || tile === 'trench_chasm'
    || tile === 'ice_crevasse';
}

export function generateRealmFauna(realm, tilemap) {
  const icons = REALM_FAUNA[realm.id] || ['ibis', 'fox'];
  const width = realm.mapConfig?.width || 24;
  const height = realm.mapConfig?.height || 20;
  const animals = [];
  const homes = [...(realm.landmarks || [])];
  const start = realm.mapConfig?.playerStart;
  if (start) homes.push({ x: start.x + 2, y: start.y + 1 });

  homes.forEach((home, homeIndex) => {
    const count = home.id ? 3 : 2;
    for (let n = 0; n < count; n++) {
      let placed = null;
      for (let attempt = 0; attempt < 8 && !placed; attempt++) {
        const angle = (n / count) * Math.PI * 2 + homeIndex * 0.7 + attempt * 0.45;
        const dist = 1.7 + (n % 2) * 0.45 + attempt * 0.15;
        const hx = Math.max(0.6, Math.min(width - 0.6, home.x + Math.cos(angle) * dist));
        const hy = Math.max(0.6, Math.min(height - 0.6, home.y + Math.sin(angle) * dist));
        if (homes.some((other) => other.id && Math.hypot(other.x - hx, other.y - hy) < 0.7)) continue;
        if (faunaTileBlocked(tilemap, hx, hy)) continue;
        placed = { hx, hy };
      }
      if (!placed) continue;
      animals.push({
        kind: icons[(homeIndex * 3 + n) % icons.length],
        homeX: placed.hx,
        homeY: placed.hy,
        phase: homeIndex * 11 + n * 17,
        speed: 0.01 + (n % 3) * 0.004,
        radius: 0.32 + (n % 2) * 0.22
      });
    }
  });

  return animals;
}

export function faunaWorldPos(animal, tick) {
  const x = animal.homeX + Math.cos(tick * animal.speed + animal.phase) * animal.radius;
  const y = animal.homeY + Math.sin(tick * animal.speed + animal.phase) * animal.radius * 0.55;
  return { x, y };
}

function pix(ctx, color, x, y, w = 2, h = 2) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawPixelFauna(ctx, kind, bob, hop) {
  switch (kind) {
    case 'parrot':
      pix(ctx, '#166534', 8, 14 + bob, 6, 4);
      pix(ctx, '#16a34a', 6, 8 + bob, 10, 8);
      pix(ctx, '#f97316', 14, 10 + bob, 4, 3);
      pix(ctx, '#facc15', 4, 10 + bob, 3, 3);
      pix(ctx, '#0f172a', 8, 10 + bob, 2, 2);
      pix(ctx, '#dc2626', 10, 4 + bob, 4, 6);
      break;
    case 'monkey':
      pix(ctx, '#78350f', 8, 16 + hop, 4, 6);
      pix(ctx, '#78350f', 16, 16 + hop, 4, 6);
      pix(ctx, '#92400e', 8, 8 + bob, 12, 10);
      pix(ctx, '#fdba74', 10, 4 + bob, 8, 8);
      pix(ctx, '#0f172a', 12, 7 + bob, 2, 2);
      pix(ctx, '#0f172a', 16, 7 + bob, 2, 2);
      pix(ctx, '#78350f', 18, 6 + bob, 4, 8);
      break;
    case 'butterfly':
      pix(ctx, '#f59e0b', 6 + hop, 8 + bob, 6, 8);
      pix(ctx, '#f43f5e', 16 - hop, 8 + bob, 6, 8);
      pix(ctx, '#fde047', 8 + hop, 10 + bob, 3, 3);
      pix(ctx, '#fde047', 17 - hop, 10 + bob, 3, 3);
      pix(ctx, '#1e293b', 12, 8 + bob, 3, 10);
      break;
    case 'frog':
      pix(ctx, '#15803d', 6, 12 + bob, 16, 8);
      pix(ctx, '#22c55e', 8, 8 + bob, 12, 8);
      pix(ctx, '#fde047', 10, 10 + bob, 3, 3);
      pix(ctx, '#fde047', 15, 10 + bob, 3, 3);
      pix(ctx, '#0f172a', 11, 11 + bob, 2, 2);
      pix(ctx, '#0f172a', 16, 11 + bob, 2, 2);
      pix(ctx, '#166534', 6, 18 + hop, 5, 3);
      pix(ctx, '#166534', 17, 18 + hop, 5, 3);
      break;
    case 'eagle':
      pix(ctx, '#57534e', 6, 12 + bob, 16, 5);
      pix(ctx, '#78716c', 10, 8 + bob, 10, 8);
      pix(ctx, '#fbbf24', 18, 10 + bob, 4, 3);
      pix(ctx, '#0f172a', 12, 10 + bob, 2, 2);
      pix(ctx, '#e7e5e4', 8, 16 + bob, 4, 3);
      break;
    case 'goat':
      pix(ctx, '#e7e5e4', 8, 12 + bob, 12, 8);
      pix(ctx, '#d6d3d1', 18, 8 + bob, 6, 8);
      pix(ctx, '#a8a29e', 8, 18 + hop, 3, 5);
      pix(ctx, '#a8a29e', 16, 18 + hop, 3, 5);
      pix(ctx, '#78716c', 20, 6 + bob, 2, 5);
      pix(ctx, '#0f172a', 20, 10 + bob, 2, 2);
      break;
    case 'yak':
      pix(ctx, '#292524', 6, 12 + bob, 16, 8);
      pix(ctx, '#44403c', 16, 8 + bob, 8, 8);
      pix(ctx, '#1c1917', 6, 18 + hop, 4, 5);
      pix(ctx, '#1c1917', 16, 18 + hop, 4, 5);
      pix(ctx, '#e7e5e4', 20, 6 + bob, 3, 4);
      pix(ctx, '#0f172a', 20, 10 + bob, 2, 2);
      break;
    case 'snowcat':
      pix(ctx, '#e2e8f0', 6, 12 + bob, 16, 8);
      pix(ctx, '#cbd5e1', 16, 8 + bob, 8, 8);
      pix(ctx, '#94a3b8', 8, 14 + bob, 3, 3);
      pix(ctx, '#94a3b8', 14, 14 + bob, 3, 3);
      pix(ctx, '#0f172a', 20, 10 + bob, 2, 2);
      pix(ctx, '#e2e8f0', 20, 6 + bob, 3, 4);
      pix(ctx, '#64748b', 6, 18 + hop, 4, 4);
      pix(ctx, '#64748b', 16, 18 + hop, 4, 4);
      break;
    case 'camel':
      pix(ctx, '#d97706', 6, 12 + bob, 14, 8);
      pix(ctx, '#b45309', 10, 6 + bob, 6, 8);
      pix(ctx, '#f59e0b', 18, 8 + bob, 6, 8);
      pix(ctx, '#92400e', 6, 18 + hop, 3, 5);
      pix(ctx, '#92400e', 16, 18 + hop, 3, 5);
      pix(ctx, '#0f172a', 21, 10 + bob, 2, 2);
      break;
    case 'lizard':
      pix(ctx, '#65a30d', 6, 14 + bob, 16, 4);
      pix(ctx, '#84cc16', 16, 12 + bob, 6, 5);
      pix(ctx, '#4d9948', 4, 16 + hop, 4, 2);
      pix(ctx, '#0f172a', 20, 13 + bob, 2, 2);
      break;
    case 'fox':
      pix(ctx, '#ea580c', 8, 12 + bob, 12, 8);
      pix(ctx, '#fb923c', 16, 8 + bob, 7, 8);
      pix(ctx, '#fff7ed', 12, 16 + bob, 5, 3);
      pix(ctx, '#0f172a', 20, 10 + bob, 2, 2);
      pix(ctx, '#ea580c', 20, 6 + bob, 3, 4);
      pix(ctx, '#9a3412', 8, 18 + hop, 3, 4);
      pix(ctx, '#9a3412', 16, 18 + hop, 3, 4);
      break;
    case 'fish':
      pix(ctx, '#0284c7', 8, 12 + bob, 12, 6);
      pix(ctx, '#38bdf8', 10, 13 + bob, 6, 4);
      pix(ctx, '#f97316', 4, 12 + hop, 5, 6);
      pix(ctx, '#0f172a', 17, 13 + bob, 2, 2);
      break;
    case 'turtle':
      pix(ctx, '#166534', 8, 10 + bob, 14, 10);
      pix(ctx, '#22c55e', 10, 12 + bob, 10, 6);
      pix(ctx, '#4d7c0f', 16, 14 + bob, 4, 4);
      pix(ctx, '#a3e635', 18, 8 + bob, 6, 6);
      pix(ctx, '#0f172a', 21, 10 + bob, 2, 2);
      pix(ctx, '#365314', 6, 16 + hop, 4, 3);
      pix(ctx, '#365314', 18, 18 + hop, 4, 3);
      break;
    case 'squid':
      pix(ctx, '#7c3aed', 10, 8 + bob, 10, 8);
      pix(ctx, '#a78bfa', 12, 10 + bob, 6, 5);
      pix(ctx, '#c4b5fd', 8, 16 + hop, 3, 6);
      pix(ctx, '#c4b5fd', 13, 16 + hop, 3, 6);
      pix(ctx, '#c4b5fd', 18, 16 + hop, 3, 6);
      pix(ctx, '#0f172a', 13, 11 + bob, 2, 2);
      break;
    case 'jelly':
      pix(ctx, '#67e8f9', 8, 8 + bob, 14, 8);
      pix(ctx, '#a5f3fc', 10, 10 + bob, 10, 5);
      pix(ctx, '#22d3ee', 10, 16 + hop, 2, 7);
      pix(ctx, '#22d3ee', 14, 16 + hop, 2, 6);
      pix(ctx, '#22d3ee', 18, 16 + hop, 2, 7);
      break;
    case 'giraffe':
      pix(ctx, '#ca8a04', 10, 14 + bob, 8, 6);
      pix(ctx, '#a16207', 12, 6 + bob, 4, 10);
      pix(ctx, '#eab308', 12, 2 + bob, 6, 6);
      pix(ctx, '#92400e', 10, 16 + hop, 3, 6);
      pix(ctx, '#92400e', 16, 16 + hop, 3, 6);
      pix(ctx, '#78350f', 12, 8 + bob, 2, 2);
      pix(ctx, '#0f172a', 16, 4 + bob, 2, 2);
      break;
    case 'zebra':
      pix(ctx, '#f8fafc', 8, 12 + bob, 12, 8);
      pix(ctx, '#0f172a', 10, 12 + bob, 2, 8);
      pix(ctx, '#0f172a', 14, 12 + bob, 2, 8);
      pix(ctx, '#f8fafc', 18, 8 + bob, 6, 8);
      pix(ctx, '#0f172a', 20, 8 + bob, 2, 8);
      pix(ctx, '#0f172a', 8, 18 + hop, 3, 5);
      pix(ctx, '#0f172a', 16, 18 + hop, 3, 5);
      pix(ctx, '#0f172a', 21, 10 + bob, 2, 2);
      break;
    case 'elephant':
      pix(ctx, '#94a3b8', 6, 10 + bob, 16, 10);
      pix(ctx, '#64748b', 18, 8 + bob, 6, 8);
      pix(ctx, '#475569', 20, 14 + bob, 3, 8);
      pix(ctx, '#64748b', 6, 18 + hop, 4, 5);
      pix(ctx, '#64748b', 16, 18 + hop, 4, 5);
      pix(ctx, '#0f172a', 20, 10 + bob, 2, 2);
      break;
    case 'lion':
      pix(ctx, '#d97706', 6, 8 + bob, 16, 6);
      pix(ctx, '#f59e0b', 8, 12 + bob, 12, 8);
      pix(ctx, '#b45309', 16, 8 + bob, 8, 8);
      pix(ctx, '#92400e', 8, 18 + hop, 3, 4);
      pix(ctx, '#92400e', 16, 18 + hop, 3, 4);
      pix(ctx, '#0f172a', 20, 10 + bob, 2, 2);
      break;
    case 'croc':
      pix(ctx, '#3f6212', 4, 14 + bob, 20, 6);
      pix(ctx, '#65a30d', 16, 12 + bob, 8, 6);
      pix(ctx, '#a3e635', 6, 16 + bob, 3, 2);
      pix(ctx, '#a3e635', 12, 16 + bob, 3, 2);
      pix(ctx, '#0f172a', 21, 13 + bob, 2, 2);
      pix(ctx, '#365314', 6, 18 + hop, 4, 3);
      break;
    case 'hippo':
      pix(ctx, '#78716c', 6, 12 + bob, 16, 8);
      pix(ctx, '#a8a29e', 16, 10 + bob, 8, 8);
      pix(ctx, '#57534e', 6, 18 + hop, 4, 4);
      pix(ctx, '#57534e', 16, 18 + hop, 4, 4);
      pix(ctx, '#0f172a', 20, 12 + bob, 2, 2);
      pix(ctx, '#e7e5e4', 22, 14 + bob, 3, 2);
      break;
    case 'heron':
      pix(ctx, '#e2e8f0', 12, 8 + bob, 5, 10);
      pix(ctx, '#94a3b8', 14, 4 + bob, 5, 6);
      pix(ctx, '#f59e0b', 18, 6 + bob, 3, 2);
      pix(ctx, '#0f172a', 16, 6 + bob, 2, 2);
      pix(ctx, '#cbd5e1', 12, 18 + hop, 3, 5);
      break;
    case 'ibis':
    default:
      pix(ctx, '#f8fafc', 10, 10 + bob, 8, 7);
      pix(ctx, '#e2e8f0', 16, 8 + bob, 6, 6);
      pix(ctx, '#f43f5e', 20, 10 + bob, 4, 2);
      pix(ctx, '#0f172a', 17, 9 + bob, 2, 2);
      pix(ctx, '#cbd5e1', 10, 16 + hop, 3, 5);
      break;
  }
}

export function drawAmbientAnimal(ctx, animal, tick) {
  const { x, y } = faunaWorldPos(animal, tick);
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  const bob = Math.sin(tick * 0.14 + animal.phase) > 0 ? 0 : -1;
  const hop = Math.sin(tick * 0.2 + animal.phase) > 0 ? 0 : 1;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(px + 2, py - 2);
  ctx.scale(2, 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(5, 13, 7, 2);
  drawPixelFauna(ctx, animal.kind, bob, hop);
  ctx.restore();
}
