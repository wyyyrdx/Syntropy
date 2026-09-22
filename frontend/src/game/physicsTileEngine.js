export const TILE_SIZE = 32;

const palette = {
  lab_floor: ['#111827', '#1e293b', '#334155'], circuit_floor: ['#071a20', '#0e7490', '#22d3ee'],
  optic_floor: ['#111827', '#312e81', '#38bdf8'], wave_floor: ['#1c1404', '#92400e', '#f59e0b'],
  magnetic_floor: ['#171126', '#5b21b6', '#a78bfa'], thermal_floor: ['#240b05', '#9a3412', '#f97316'],
  hydraulic_floor: ['#06201e', '#0f766e', '#2dd4bf'], orbital_floor: ['#070a12', '#1e293b', '#eab308']
};

function random(x, y, seed = 17) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return value - Math.floor(value);
}

export function generateRealmTilemap(realm) {
  const width = realm.mapConfig.width || 24;
  const height = realm.mapConfig.height || 20;
  const base = realm.mapConfig.baseTile || 'lab_floor';
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
    if (routes.has(key) || (x === start.x && y === start.y)) return 'conduit';
    if (border || random(x, y, realm.id.length) > 0.88) { obstacles.add(key); return 'equipment'; }
    return base;
  }));
  return { grid, obstacles, width, height };
}

export function drawTile(ctx, type, x, y, tick = 0) {
  const colors = palette[type] || palette.lab_floor;
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  if (type === 'equipment') {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(2, 2, 28, 28); ctx.fillStyle = '#475569'; ctx.fillRect(5, 6, 22, 16);
    ctx.fillStyle = tick % 40 < 20 ? '#22d3ee' : '#f59e0b'; ctx.fillRect(8, 9, 4, 4); ctx.fillRect(16, 9, 8, 4);
  } else if (type === 'conduit') {
    ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, 32, 32); ctx.fillStyle = '#334155'; ctx.fillRect(0, 13, 32, 6);
    ctx.fillStyle = tick % 30 < 15 ? '#22d3ee' : '#0891b2'; ctx.fillRect(0, 15, 32, 2);
  } else if (type === 'landmark_pad') {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, 32, 32); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.strokeRect(3, 3, 26, 26);
  } else {
    ctx.fillStyle = colors[1]; ctx.fillRect(0, 0, 32, 2); ctx.fillRect(0, 30, 32, 2); ctx.fillRect(0, 0, 2, 32); ctx.fillRect(30, 0, 2, 32);
    ctx.fillStyle = colors[2]; ctx.fillRect(7, 7, 3, 3); ctx.fillRect(22, 20, 4, 2);
  }
  ctx.restore();
}

export function drawPlayerSprite(ctx, x, y, direction, moving, tick) {
  const bob = moving && Math.floor(tick / 6) % 2 ? 1 : 0;
  ctx.save(); ctx.translate(x, y + bob); ctx.fillStyle = '#f8fafc'; ctx.fillRect(10, 5, 12, 9);
  ctx.fillStyle = '#06b6d4'; ctx.fillRect(direction === 'left' ? 9 : 13, 8, 5, 3); ctx.fillStyle = '#1e293b'; ctx.fillRect(8, 14, 16, 12);
  ctx.fillStyle = '#f59e0b'; ctx.fillRect(5, 16, 3, 8); ctx.fillRect(24, 16, 3, 8); ctx.fillStyle = '#64748b'; ctx.fillRect(9, 26, 5, 6); ctx.fillRect(18, 26, 5, 6); ctx.restore();
}

export function generateRealmFauna(realm) {
  return Array.from({ length: 4 }, (_, index) => ({ id: `${realm.id}-${index}`, x: 5 + index * 5, y: 3 + (index * 4) % 14, phase: index * 19, icon: index % 2 ? 'probe' : 'spark' }));
}

export function faunaWorldPos(item, tick) {
  return { x: item.x, y: item.y, px: item.x * TILE_SIZE + Math.sin((tick + item.phase) / 30) * 8, py: item.y * TILE_SIZE };
}

export function drawAmbientAnimal(ctx, item, tick) {
  const pos = faunaWorldPos(item, tick); ctx.save(); ctx.translate(pos.px, pos.py);
  ctx.fillStyle = item.icon === 'probe' ? '#94a3b8' : '#22d3ee'; ctx.fillRect(10, 10, 10, 8);
  ctx.fillStyle = '#f59e0b'; ctx.fillRect(13, 12, 4, 3); ctx.restore();
}

export function drawInteractionIndicator(ctx, x, y, label, tick) {
  const lift = Math.sin(tick * 0.08) * 3; ctx.save(); ctx.fillStyle = '#f59e0b'; ctx.fillRect(x + 7, y - 17 + lift, 18, 16);
  ctx.fillStyle = '#070a12'; ctx.font = '10px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.fillText(label, x + 16, y - 5 + lift); ctx.restore();
}
