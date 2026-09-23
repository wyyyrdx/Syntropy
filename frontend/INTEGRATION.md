# Physics Module Integration

## Subject-specific files

- `src/PhysicsApp.jsx`
- `src/main-physics.jsx`
- `src/components/PhysicsAtom.jsx`
- `src/components/PhysicsWorld.jsx`
- `src/components/PhysicsBookSelector.jsx`
- `src/data/physicsRealms.js`
- `src/data/physicsCurriculumBooks.js`
- `src/game/physicsTileEngine.js`
- `physics.html`

## Shared files

The Physics module imports `src/components/QuizModal.jsx`, `src/audio/retroAudio.js`, and the existing utility classes in `src/index.css` unchanged. Realm and curriculum records preserve the same public shapes as the Geography data.

## Combining subjects

Add a subject selector above the existing three-view navigation in the combined `App.jsx`. The chosen subject should supply its realm data, overview component, world component, book selector, labels, and initial realm. The Physics overview uses `PhysicsAtom`, while Geography uses `PixelGlobe`. The inner navigation can then continue to switch among overview, 2D realm, and books.

The standalone module stores progress in `syntropy_physics_stats`, while Geography uses `syntropy_player_stats`. A combined app should migrate both into one versioned object with shared `xp`, `level`, and `completedQuizzes`. Keep the current source IDs namespaced by subject so deduplication remains collision-free.

## Standalone development

Run `npm run dev` in `frontend`, then open `/physics.html`. The original `/` entry remains unchanged for Geography.

# Biology Module Integration

## Subject-specific files

- `src/BiologyApp.jsx`
- `src/main-biology.jsx`
- `src/components/BiologyCell.jsx`
- `src/components/PhotosynthesisPlant.jsx`
- `src/components/AnimalFoodWeb.jsx`
- `src/components/HumanBodySystems.jsx`
- `src/components/BiologyWorld.jsx`
- `src/components/BiologyBookSelector.jsx`
- `src/data/biologyRealms.js`
- `src/data/biologyCurriculumBooks.js`
- `src/game/biologyTileEngine.js`
- `biology.html`

## Themes

Nine 2D realms cover plants, animals, and the human body. The PLANT, ANIMAL, and BODY tabs show 2D process art (photosynthesis, food web, body systems). A GEO / PHY / BIO switcher links the three standalone apps.

## Standalone development

Open `/biology.html`. Progress is stored in `syntropy_biology_stats`.
