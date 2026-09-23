export const TILE_SIZE = 32;

const palette = {
  stone_floor: ['#1c1917', '#44403c', '#a8a29e'],
  brick_floor: ['#431407', '#9a3412', '#f59e0b'],
  court_floor: ['#1c1006', '#78350f', '#d97706'],
  fort_floor: ['#3f2a0a', '#a16207', '#fbbf24'],
  port_floor: ['#1c1917', '#57534e', '#a8a29e'],
  revolt_floor: ['#2a0510', '#9f1239', '#fb7185'],
  revolution_floor: ['#0b1f3a', '#1d4ed8', '#60a5fa'],
  mill_floor: ['#111827', '#334155', '#94a3b8'],
  ashram_floor: ['#052e16', '#166534', '#4ade80'],
  archive_floor: ['#0f172a', '#334155', '#cbd5e1']
};

function random(x, y, seed = 17) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return value - Math.floor(value);
}

export function generateRealmTilemap(realm) {
  const width = realm.mapConfig.width || 24;
  const height = realm.mapConfig.height || 20;
  const base = realm.mapConfig.baseTile || 'stone_floor';
  const start = realm.mapConfig.playerStart;
  const routes = new Set();
  const obstacles = new Set();
  const addRoute = (target) => {
    let x = start.x;
    let y = start.y;
    while (x !== target.x) { routes.add(`${x},${y}`); x += x < target.x ? 1 : -1; }
    while (y !== target.y) { routes.add(`${x},${y}`); y += y < target.y ? 1 : -1; }
    routes.add(`${x},${y}`);
  };
  realm.landmarks.forEach(addRoute);
  const grid = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
    const key = `${x},${y}`;
    const border = x === 0 || y === 0 || x === width - 1 || y === height - 1;
    const landmark = realm.landmarks.some((item) => item.x === x && item.y === y);
    if (landmark) return 'landmark_pad';
    if (routes.has(key) || (x === start.x && y === start.y)) return 'life_path';
    if (border || random(x, y, realm.id.length) > 0.88) { obstacles.add(key); return 'thicket'; }
    return base;
  }));
  return { grid, obstacles, width, height };
}

export function drawTile(ctx, type, x, y, tick = 0) {
  const colors = palette[type] || palette.plant_floor;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  if (type === 'thicket') {
    ctx.fillStyle = '#052e16';
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = '#166534';
    ctx.fillRect(6, 8, 8, 14);
    ctx.fillRect(16, 6, 10, 16);
    ctx.fillStyle = tick % 40 < 20 ? '#4ade80' : '#f59e0b';
    ctx.fillRect(9, 10, 3, 3);
    ctx.fillRect(19, 12, 3, 3);
  } else if (type === 'life_path') {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 13, 32, 6);
    ctx.fillStyle = tick % 30 < 15 ? '#4ade80' : '#22c55e';
    ctx.fillRect(0, 15, 32, 2);
  } else if (type === 'landmark_pad') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 32, 32);
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, 26, 26);
  } else {
    ctx.fillStyle = colors[1];
    ctx.fillRect(0, 0, 32, 2);
    ctx.fillRect(0, 30, 32, 2);
    ctx.fillRect(0, 0, 2, 32);
    ctx.fillRect(30, 0, 2, 32);
    ctx.fillStyle = colors[2];
    ctx.fillRect(7, 7, 3, 3);
    ctx.fillRect(22, 20, 4, 2);
  }
  ctx.restore();
}

export function drawPlayerSprite(ctx, x, y, direction, moving, tick) {
  const bob = moving && Math.floor(tick / 6) % 2 ? 1 : 0;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(10, 5, 12, 9);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(direction === 'left' ? 9 : 13, 8, 5, 3);
  ctx.fillStyle = '#14532d';
  ctx.fillRect(8, 14, 16, 12);
  ctx.fillStyle = '#86efac';
  ctx.fillRect(5, 16, 3, 8);
  ctx.fillRect(24, 16, 3, 8);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(9, 26, 5, 6);
  ctx.fillRect(18, 26, 5, 6);
  ctx.restore();
}

export function generateRealmFauna(realm) {
  const icons = ['leaf', 'bug', 'spore', 'pulse'];
  return Array.from({ length: 4 }, (_, index) => ({
    id: `${realm.id}-${index}`,
    x: 5 + index * 5,
    y: 3 + (index * 4) % 14,
    phase: index * 19,
    icon: icons[index % icons.length]
  }));
}

export function faunaWorldPos(item, tick) {
  return {
    x: item.x,
    y: item.y,
    px: item.x * TILE_SIZE + Math.sin((tick + item.phase) / 30) * 8,
    py: item.y * TILE_SIZE
  };
}

export function drawAmbientAnimal(ctx, item, tick) {
  const pos = faunaWorldPos(item, tick);
  ctx.save();
  ctx.translate(pos.px, pos.py);
  const color = item.icon === 'bug' ? '#f59e0b' : item.icon === 'pulse' ? '#fb7185' : '#4ade80';
  ctx.fillStyle = color;
  ctx.fillRect(10, 10, 10, 8);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(13, 12, 4, 3);
  ctx.restore();
}

export function drawInteractionIndicator(ctx, x, y, label, tick) {
  const lift = Math.sin(tick * 0.08) * 3;
  ctx.save();
  ctx.fillStyle = '#86efac';
  ctx.fillRect(x + 7, y - 17 + lift, 18, 16);
  ctx.fillStyle = '#052e16';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + 16, y - 5 + lift);
  ctx.restore();
}
