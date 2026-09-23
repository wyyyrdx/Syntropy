// historyEras.js
// The 4 era "portals" shown on the Timeline screen (replaces Geography's globe).

export const ERAS = [
  {
    id: 'ancient',
    label: 'Ancient World',
    range: 'Prehistory – 1200 BCE',
    themeColor: '#c99a3d',
    icon: 'Landmark'
  },
  {
    id: 'medieval',
    label: 'Medieval World',
    range: '1200 – 1600 CE',
    themeColor: '#7c5cbf',
    icon: 'Swords'
  },
  {
    id: 'early-modern',
    label: 'Early Modern World',
    range: '1600 – 1900 CE',
    themeColor: '#3f8f5f',
    icon: 'Anchor'
  },
  {
    id: 'modern',
    label: 'Modern World',
    range: '1900 CE – Present',
    themeColor: '#b6483f',
    icon: 'Flag'
  }
];

export function eraById(id) {
  return ERAS.find((e) => e.id === id);
}
