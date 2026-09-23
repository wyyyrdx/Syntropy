// historyRealms.js
//
// Mirrors GEOGRAPHY_REALMS' shape so HistoryRealm.jsx can reuse World3D's
// rendering approach almost line-for-line. Key differences from Geography:
//   - landmarks (built from each chapter's `concepts`) carry only a `fact`,
//     no quiz — concepts are lore, not test questions.
//   - the realm's single `chapterQuiz` lives on the realm itself and is
//     delivered by talking to the NPC (not by any individual landmark).
//
// realm.id === the chapter's `realmTarget` in historyBooksData.js, so
// HistoryBookSelector's "Play in Realm" button can look realms up directly.

import { HISTORY_BOOKS } from './historyBooksData';

function findChapter(chapterId) {
  for (const book of HISTORY_BOOKS) {
    const chapter = book.chapters.find((c) => c.id === chapterId);
    if (chapter) return { book, chapter };
  }
  return null;
}

// Spread concepts out across a small grid so they don't overlap.
function layoutLandmarks(concepts, positions, icons) {
  return concepts.map((concept, i) => ({
    id: `concept-${i}`,
    name: concept.title,
    category: concept.importance,
    icon: icons[i] || '📖',
    x: positions[i][0],
    y: positions[i][1],
    fact: concept.explanation
  }));
}

const REALM_DEFS = [
  {
    id: 'bhimbetka-caves',
    chapterId: 'h6-ch1',
    era: 'ancient',
    period: 'Prehistoric Era',
    biome: 'Rock Shelter Forest',
    elevation: 'Highland Forest',
    themeColor: '#c99a3d',
    icons: ['🏹', '🔥', '🌾'],
    positions: [[5, 5], [12, 8], [8, 13]],
    mapConfig: { width: 18, height: 16, baseTile: 'forest_floor', playerStart: { x: 3, y: 9 } },
    npc: {
      name: 'Elder Rukmi',
      title: 'Cave Painter',
      avatar: '🪨',
      dialogue:
        "Welcome, wanderer. Long before cities, we lived by hunting, gathering, and reading the land — walk among the shelters and see how we lived."
    }
  },
  {
    id: 'mohenjo-daro',
    chapterId: 'h6-ch2',
    era: 'ancient',
    period: 'c. 2500 BCE',
    biome: 'Planned River City',
    elevation: 'River Plain',
    themeColor: '#c99a3d',
    icons: ['🧱', '🛁', '🏺'],
    positions: [[6, 6], [14, 6], [10, 12]],
    mapConfig: { width: 20, height: 16, baseTile: 'brick_street', playerStart: { x: 3, y: 12 } },
    npc: {
      name: 'Overseer Danu',
      title: 'City Planner',
      avatar: '🏺',
      dialogue:
        'Mind the drains as you walk — every street in Mohenjo-daro was planned so water never pooled where people lived.'
    }
  },
  {
    id: 'delhi-sultanate',
    chapterId: 'h7-ch1',
    era: 'medieval',
    period: '1206 – 1526 CE',
    biome: 'Sultanate Fort & Bazaar',
    elevation: 'Fortified Plateau',
    themeColor: '#7c5cbf',
    icons: ['🗡️', '📋', '👑'],
    positions: [[5, 6], [13, 5], [9, 12]],
    mapConfig: { width: 20, height: 16, baseTile: 'stone_courtyard', playerStart: { x: 3, y: 9 } },
    npc: {
      name: 'Qazi Rafiq',
      title: 'Court Scribe',
      avatar: '📜',
      dialogue:
        'Three centuries, five dynasties — the Sultanate rose and fell on how well it governed the land it had won.'
    }
  },
  {
    id: 'agra-fort',
    chapterId: 'h7-ch2',
    era: 'medieval',
    period: '1526 – 1857 CE',
    biome: 'Mughal Fort Courtyard',
    elevation: 'Riverside Fort',
    themeColor: '#7c5cbf',
    icons: ['⚔️', '👑', '📯'],
    positions: [[6, 5], [14, 7], [9, 13]],
    mapConfig: { width: 20, height: 16, baseTile: 'sandstone_court', playerStart: { x: 3, y: 10 } },
    npc: {
      name: 'Ustad Hameed',
      title: 'Imperial Architect',
      avatar: '🕌',
      dialogue:
        "From Panipat to Agra — the Mughals built an empire in stone as much as in conquest. Walk the courtyard and see how."
    }
  },
  {
    id: 'kolkata',
    chapterId: 'h8-ch1',
    era: 'early-modern',
    period: '1757 CE',
    biome: 'Company Trading Port',
    elevation: 'Delta Port',
    themeColor: '#3f8f5f',
    icons: ['⚔️', '🏹', '📜'],
    positions: [[5, 6], [13, 5], [9, 12]],
    mapConfig: { width: 20, height: 16, baseTile: 'dock_planks', playerStart: { x: 3, y: 9 } },
    npc: {
      name: 'Clerk Whitfield',
      title: 'Company Trader',
      avatar: '🖋️',
      dialogue:
        'We came for cotton and spice — but after Plassey, the ledgers changed, and so did who ruled Bengal.'
    }
  },
  {
    id: 'red-fort-delhi',
    chapterId: 'h8-ch2',
    era: 'early-modern',
    period: '1857 CE',
    biome: 'Besieged Fort City',
    elevation: 'Fortified City',
    themeColor: '#3f8f5f',
    icons: ['🔥', '🛡️', '🏛️'],
    positions: [[6, 6], [14, 6], [10, 13]],
    mapConfig: { width: 20, height: 16, baseTile: 'fort_rubble', playerStart: { x: 3, y: 10 } },
    npc: {
      name: 'Sepoy Ratan',
      title: 'Rebel Soldier',
      avatar: '🪖',
      dialogue:
        'Grievance had been building for years before it broke into open revolt. What you see here changed who governed India.'
    }
  },
  {
    id: 'paris',
    chapterId: 'h9-ch1',
    era: 'early-modern',
    period: '1789 CE',
    biome: 'Cobblestone City Square',
    elevation: 'City Square',
    themeColor: '#3f8f5f',
    icons: ['⚖️', '🏰', '📜'],
    positions: [[5, 5], [13, 6], [9, 13]],
    mapConfig: { width: 20, height: 16, baseTile: 'cobblestone', playerStart: { x: 3, y: 9 } },
    npc: {
      name: 'Citoyenne Belle',
      title: 'Pamphleteer',
      avatar: '🥖',
      dialogue:
        'Liberty, equality, fraternity — words on paper until the people of Paris decided to make them real.'
    }
  },
  {
    id: 'manchester',
    chapterId: 'h9-ch2',
    era: 'early-modern',
    period: '1760 – 1840 CE',
    biome: 'Factory District',
    elevation: 'Industrial District',
    themeColor: '#3f8f5f',
    icons: ['⚙️', '🏭', '🏙️'],
    positions: [[6, 6], [14, 5], [10, 13]],
    mapConfig: { width: 20, height: 16, baseTile: 'factory_floor', playerStart: { x: 3, y: 10 } },
    npc: {
      name: 'Foreman Grimes',
      title: 'Mill Overseer',
      avatar: '⚙️',
      dialogue:
        'Machines changed everything here — how fast we work, where we live, even what a city looks like.'
    }
  },
  {
    id: 'sabarmati-ashram',
    chapterId: 'h10-ch1',
    era: 'modern',
    period: '1920 – 1942 CE',
    biome: 'Ashram Courtyard',
    elevation: 'Riverside Courtyard',
    themeColor: '#b6483f',
    icons: ['✊', '🧂', '🚩'],
    positions: [[5, 6], [13, 5], [9, 13]],
    mapConfig: { width: 20, height: 16, baseTile: 'ashram_courtyard', playerStart: { x: 3, y: 9 } },
    npc: {
      name: 'Satyagrahi Meera',
      title: 'Freedom Volunteer',
      avatar: '🕊️',
      dialogue:
        'We withdrew our cooperation, we broke the salt law, and in the end we asked the British simply to Quit India.'
    }
  },
  {
    id: 'berlin',
    chapterId: 'h10-ch2',
    era: 'modern',
    period: '1914 – 1945 CE',
    biome: 'War-torn Cityscape',
    elevation: 'Bombed City Block',
    themeColor: '#b6483f',
    icons: ['💣', '✈️', '🌍'],
    positions: [[6, 5], [14, 7], [10, 13]],
    mapConfig: { width: 20, height: 16, baseTile: 'trench_mud', playerStart: { x: 3, y: 10 } },
    npc: {
      name: 'Correspondent Voss',
      title: 'War Reporter',
      avatar: '📻',
      dialogue:
        'Two wars, thirty years apart, reshaped the whole world — and out of the wreckage, empires finally let go.'
    }
  }
];

export const HISTORY_REALMS = REALM_DEFS.map((def) => {
  const found = findChapter(def.chapterId);
  const concepts = found?.chapter?.concepts || [];
  const chapterQuiz = found?.chapter?.quiz?.[0] || null;

  return {
    id: def.id,
    name: found?.chapter?.title || def.id,
    era: def.era,
    period: def.period,
    biome: def.biome,
    elevation: def.elevation,
    themeColor: def.themeColor,
    bookTitle: found?.book?.title,
    grade: found?.book?.grade,
    mapConfig: def.mapConfig,
    npc: def.npc,
    landmarks: layoutLandmarks(concepts, def.positions, def.icons),
    chapterQuiz
  };
});

export function realmsByEra(eraId) {
  return HISTORY_REALMS.filter((r) => r.era === eraId);
}
