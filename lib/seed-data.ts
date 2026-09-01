import type {
  Subject,
  Chapter,
  Topic,
  Concept,
  KnowledgeState,
  QuizQuestion,
  UserProfile,
  PeerStudent,
  Quest,
  StudyMaterial,
  MasteryLevel,
} from './types';

// ============================================================
// Subject
// ============================================================

export const SCIENCE_SUBJECT: Subject = {
  id: 'sub_science',
  slug: 'science',
  name: 'Science',
  description: 'Natural sciences covering life processes, matter, and energy.',
  color: '#7C3AED',
};

// ============================================================
// Chapters & Topics — Life Processes
// ============================================================

export const LIFE_PROCESSES_CHAPTER: Chapter = {
  id: 'ch_life_processes',
  subject_id: SCIENCE_SUBJECT.id,
  slug: 'life-processes',
  name: 'Life Processes',
  description:
    'The processes that keep living organisms alive — nutrition, respiration, transportation, and excretion.',
  color: '#06B6D4',
  icon: 'Atom',
};

export const TOPICS: Topic[] = [
  {
    id: 'tp_nutrition',
    chapter_id: LIFE_PROCESSES_CHAPTER.id,
    slug: 'nutrition',
    name: 'Nutrition',
    description: 'How organisms obtain and process food for energy and growth.',
    color: '#10B981',
    icon: 'Leaf',
    world_area: 'Nutrition Forest',
  },
  {
    id: 'tp_respiration',
    chapter_id: LIFE_PROCESSES_CHAPTER.id,
    slug: 'respiration',
    name: 'Respiration',
    description: 'The biochemical process of breaking down food to release energy.',
    color: '#F59E0B',
    icon: 'Wind',
    world_area: 'Respiration Valley',
  },
  {
    id: 'tp_transportation',
    chapter_id: LIFE_PROCESSES_CHAPTER.id,
    slug: 'transportation',
    name: 'Transportation',
    description: 'How substances move through the body via the circulatory system.',
    color: '#EF4444',
    icon: 'HeartPulse',
    world_area: 'Transportation City',
  },
  {
    id: 'tp_excretion',
    chapter_id: LIFE_PROCESSES_CHAPTER.id,
    slug: 'excretion',
    name: 'Excretion',
    description: 'The removal of metabolic waste from the body.',
    color: '#8B5CF6',
    icon: 'FlaskConical',
    world_area: 'Excretion Lab',
  },
];

// ============================================================
// Concepts
// ============================================================

export const CONCEPTS: Concept[] = [
  // Nutrition
  {
    id: 'c_autotrophic',
    topic_id: 'tp_nutrition',
    name: 'Autotrophic Nutrition',
    description:
      'Organisms that produce their own food from inorganic substances — primarily photosynthesis in plants.',
    difficulty: 2,
    relationships: ['c_heterotrophic'],
  },
  {
    id: 'c_heterotrophic',
    topic_id: 'tp_nutrition',
    name: 'Heterotrophic Nutrition',
    description:
      'Organisms that obtain food from other organisms — includes herbivores, carnivores, and decomposers.',
    difficulty: 2,
    relationships: ['c_autotrophic', 'c_human_digestion'],
  },
  {
    id: 'c_human_digestion',
    topic_id: 'tp_nutrition',
    name: 'Human Digestion',
    description:
      'The breakdown of food through the alimentary canal — mouth, esophagus, stomach, small intestine, large intestine.',
    difficulty: 3,
    relationships: ['c_heterotrophic', 'c_aerobic'],
  },
  // Respiration
  {
    id: 'c_aerobic',
    topic_id: 'tp_respiration',
    name: 'Aerobic Respiration',
    description:
      'Breakdown of glucose in the presence of oxygen — produces CO₂, H₂O, and ~38 ATP of energy.',
    difficulty: 3,
    relationships: ['c_anaerobic', 'c_human_digestion'],
  },
  {
    id: 'c_anaerobic',
    topic_id: 'tp_respiration',
    name: 'Anaerobic Respiration',
    description:
      'Energy production without oxygen — produces lactic acid in muscles or ethanol in yeast.',
    difficulty: 3,
    relationships: ['c_aerobic'],
  },
  {
    id: 'c_human_respiratory',
    topic_id: 'tp_respiration',
    name: 'Human Respiratory System',
    description:
      'The system of organs responsible for gas exchange — nasal cavity, trachea, bronchi, alveoli, lungs.',
    difficulty: 4,
    relationships: ['c_aerobic'],
  },
  // Transportation
  {
    id: 'c_circulatory_system',
    topic_id: 'tp_transportation',
    name: 'Human Circulatory System',
    description:
      'The network that transports oxygen, nutrients, and waste — comprises heart, blood, and blood vessels.',
    difficulty: 4,
    relationships: ['c_heart', 'c_blood', 'c_blood_vessels'],
  },
  {
    id: 'c_heart',
    topic_id: 'tp_transportation',
    name: 'The Heart',
    description:
      'A muscular organ that pumps blood through the body — four chambers: right atrium, right ventricle, left atrium, left ventricle.',
    difficulty: 4,
    relationships: ['c_circulatory_system', 'c_blood'],
  },
  {
    id: 'c_blood',
    topic_id: 'tp_transportation',
    name: 'Blood',
    description:
      'A connective tissue — RBCs (oxygen transport), WBCs (immunity), platelets (clotting), and plasma (transport medium).',
    difficulty: 3,
    relationships: ['c_circulatory_system', 'c_heart'],
  },
  {
    id: 'c_blood_vessels',
    topic_id: 'tp_transportation',
    name: 'Blood Vessels',
    description:
      'Arteries (carry blood away from heart), veins (carry blood to heart), and capillaries (site of exchange).',
    difficulty: 3,
    relationships: ['c_circulatory_system', 'c_heart'],
  },
  // Excretion
  {
    id: 'c_excretory_system',
    topic_id: 'tp_excretion',
    name: 'Human Excretory System',
    description:
      'The system that removes nitrogenous waste — kidneys, ureters, urinary bladder, urethra.',
    difficulty: 3,
    relationships: ['c_nephron', 'c_urine_formation'],
  },
  {
    id: 'c_nephron',
    topic_id: 'tp_excretion',
    name: 'Nephron',
    description:
      'The functional unit of the kidney — filters blood and produces urine through filtration, reabsorption, and secretion.',
    difficulty: 5,
    relationships: ['c_excretory_system', 'c_urine_formation'],
  },
  {
    id: 'c_urine_formation',
    topic_id: 'tp_excretion',
    name: 'Urine Formation',
    description:
      'Three steps: glomerular filtration, tubular reabsorption, and tubular secretion.',
    difficulty: 4,
    relationships: ['c_excretory_system', 'c_nephron'],
  },
];

// ============================================================
// Mastery helpers
// ============================================================

export function masteryLevel(mastery: number): MasteryLevel {
  if (mastery >= 80) return 'mastered';
  if (mastery >= 50) return 'proficient';
  if (mastery >= 25) return 'developing';
  return 'novice';
}

export function masteryColor(level: MasteryLevel): string {
  switch (level) {
    case 'mastered':
      return '#10B981';
    case 'proficient':
      return '#06B6D4';
    case 'developing':
      return '#F59E0B';
    case 'novice':
      return '#EF4444';
  }
}

// Deterministic mastery states for the current demo student
// Student profile: strong in Respiration, weak in Transportation
export const DEMO_KNOWLEDGE_STATES: KnowledgeState[] = [
  // Nutrition — moderate
  { concept_id: 'c_autotrophic', mastery: 72, level: 'proficient', attempts: 8, correct: 6, last_practiced: '2026-08-20' },
  { concept_id: 'c_heterotrophic', mastery: 65, level: 'proficient', attempts: 7, correct: 5, last_practiced: '2026-08-20' },
  { concept_id: 'c_human_digestion', mastery: 48, level: 'developing', attempts: 5, correct: 2, last_practiced: '2026-08-18' },
  // Respiration — strong
  { concept_id: 'c_aerobic', mastery: 85, level: 'mastered', attempts: 10, correct: 9, last_practiced: '2026-08-24' },
  { concept_id: 'c_anaerobic', mastery: 78, level: 'proficient', attempts: 8, correct: 6, last_practiced: '2026-08-24' },
  { concept_id: 'c_human_respiratory', mastery: 82, level: 'mastered', attempts: 9, correct: 7, last_practiced: '2026-08-22' },
  // Transportation — weak
  { concept_id: 'c_circulatory_system', mastery: 38, level: 'developing', attempts: 6, correct: 2, last_practiced: '2026-08-15' },
  { concept_id: 'c_heart', mastery: 43, level: 'developing', attempts: 7, correct: 3, last_practiced: '2026-08-15' },
  { concept_id: 'c_blood', mastery: 51, level: 'proficient', attempts: 5, correct: 3, last_practiced: '2026-08-17' },
  { concept_id: 'c_blood_vessels', mastery: 35, level: 'novice', attempts: 4, correct: 1, last_practiced: '2026-08-14' },
  // Excretion — developing
  { concept_id: 'c_excretory_system', mastery: 56, level: 'proficient', attempts: 6, correct: 4, last_practiced: '2026-08-19' },
  { concept_id: 'c_nephron', mastery: 28, level: 'novice', attempts: 3, correct: 1, last_practiced: '2026-08-16' },
  { concept_id: 'c_urine_formation', mastery: 32, level: 'developing', attempts: 4, correct: 1, last_practiced: '2026-08-16' },
];

// ============================================================
// Current demo user
// ============================================================

export const DEMO_USER: UserProfile = {
  id: 'usr_demo',
  name: 'Alex Rivera',
  email: 'alex@nexus.edu',
  avatar_initials: 'AR',
  bio: 'Biology enthusiast. Strong on respiration, working on the circulatory system.',
  school: 'Westfield College',
  year: 'Year 11',
  joined_date: '2026-08-01',
  overall_mastery: 55,
  total_concepts: 13,
  mastered_concepts: 2,
  quests_completed: 3,
  study_streak: 7,
};

// ============================================================
// Peer students — deterministic, designed to showcase matching
// ============================================================

export const PEER_STUDENTS: PeerStudent[] = [
  {
    id: 'peer_001',
    name: 'Maya Chen',
    avatar_initials: 'MC',
    school: 'Westfield College',
    overall_mastery: 68,
    chapter_masteries: [
      { chapterId: 'ch_life_processes', mastery: 68 },
    ],
    sharedChapters: ['ch_life_processes'],
  },
  {
    id: 'peer_002',
    name: 'Jordan Patel',
    avatar_initials: 'JP',
    school: 'Riverside High',
    overall_mastery: 72,
    chapter_masteries: [
      { chapterId: 'ch_life_processes', mastery: 72 },
    ],
    sharedChapters: ['ch_life_processes'],
  },
  {
    id: 'peer_003',
    name: 'Sam Okoye',
    avatar_initials: 'SO',
    school: 'North Academy',
    overall_mastery: 61,
    chapter_masteries: [
      { chapterId: 'ch_life_processes', mastery: 61 },
    ],
    sharedChapters: ['ch_life_processes'],
  },
  {
    id: 'peer_004',
    name: 'Priya Sharma',
    avatar_initials: 'PS',
    school: 'Westfield College',
    overall_mastery: 79,
    chapter_masteries: [
      { chapterId: 'ch_life_processes', mastery: 79 },
    ],
    sharedChapters: ['ch_life_processes'],
  },
];

// Topic-level mastery per peer (for complementary matching)
export const PEER_TOPIC_MASTERIES: Record<
  string,
  { topicId: string; mastery: number }[]
> = {
  peer_001: [
    { topicId: 'tp_nutrition', mastery: 62 },
    { topicId: 'tp_respiration', mastery: 55 },
    { topicId: 'tp_transportation', mastery: 91 },
    { topicId: 'tp_excretion', mastery: 64 },
  ],
  peer_002: [
    { topicId: 'tp_nutrition', mastery: 85 },
    { topicId: 'tp_respiration', mastery: 47 },
    { topicId: 'tp_transportation', mastery: 68 },
    { topicId: 'tp_excretion', mastery: 88 },
  ],
  peer_003: [
    { topicId: 'tp_nutrition', mastery: 58 },
    { topicId: 'tp_respiration', mastery: 64 },
    { topicId: 'tp_transportation', mastery: 52 },
    { topicId: 'tp_excretion', mastery: 70 },
  ],
  peer_004: [
    { topicId: 'tp_nutrition', mastery: 90 },
    { topicId: 'tp_respiration', mastery: 82 },
    { topicId: 'tp_transportation', mastery: 75 },
    { topicId: 'tp_excretion', mastery: 69 },
  ],
};

// Demo student's topic mastery (derived from knowledge states)
export const DEMO_TOPIC_MASTERIES: { topicId: string; mastery: number }[] = [
  { topicId: 'tp_nutrition', mastery: 62 },
  { topicId: 'tp_respiration', mastery: 82 },
  { topicId: 'tp_transportation', mastery: 42 },
  { topicId: 'tp_excretion', mastery: 39 },
];

// ============================================================
// Quiz questions
// ============================================================

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q_001',
    concept_id: 'c_heart',
    question: 'How many chambers does the human heart have?',
    options: ['Two', 'Three', 'Four', 'Five'],
    correctIndex: 2,
    difficulty: 2,
    explanation:
      'The human heart has four chambers: left and right atria (upper) and left and right ventricles (lower).',
  },
  {
    id: 'q_002',
    concept_id: 'c_aerobic',
    question:
      'What are the end products of aerobic respiration?',
    options: [
      'Lactic acid and energy',
      'CO₂, H₂O, and energy',
      'Ethanol and CO₂',
      'Glucose and oxygen',
    ],
    correctIndex: 1,
    difficulty: 3,
    explanation:
      'Aerobic respiration breaks down glucose in the presence of oxygen to produce CO₂, H₂O, and ~38 ATP of energy.',
  },
  {
    id: 'q_003',
    concept_id: 'c_blood',
    question: 'Which blood cells are responsible for oxygen transport?',
    options: [
      'White blood cells',
      'Platelets',
      'Red blood cells',
      'Plasma',
    ],
    correctIndex: 2,
    difficulty: 1,
    explanation:
      'Red blood cells (RBCs) contain hemoglobin, which binds and transports oxygen throughout the body.',
  },
  {
    id: 'q_004',
    concept_id: 'c_nephron',
    question: 'What is the functional unit of the kidney?',
    options: ['Ureter', 'Nephron', 'Glomerulus', 'Bladder'],
    correctIndex: 1,
    difficulty: 4,
    explanation:
      'The nephron is the basic structural and functional unit of the kidney. Each kidney contains about a million nephrons.',
  },
  {
    id: 'q_005',
    concept_id: 'c_autotrophic',
    question:
      'Which process is the primary mode of autotrophic nutrition in plants?',
    options: ['Respiration', 'Digestion', 'Photosynthesis', 'Transpiration'],
    correctIndex: 2,
    difficulty: 2,
    explanation:
      'Photosynthesis is the process by which green plants use sunlight to synthesize food from CO₂ and H₂O.',
  },
  {
    id: 'q_006',
    concept_id: 'c_anaerobic',
    question:
      'What is produced during anaerobic respiration in muscle cells?',
    options: [
      'Ethanol and CO₂',
      'Lactic acid',
      'Glucose',
      'Oxygen',
    ],
    correctIndex: 1,
    difficulty: 3,
    explanation:
      'In muscle cells under low oxygen, glucose is broken down to lactic acid, releasing a small amount of energy.',
  },
  {
    id: 'q_007',
    concept_id: 'c_blood_vessels',
    question: 'Which blood vessels carry blood away from the heart?',
    options: ['Veins', 'Capillaries', 'Arteries', 'Venules'],
    correctIndex: 2,
    difficulty: 2,
    explanation:
      'Arteries carry oxygenated blood away from the heart to the body. Veins carry blood back to the heart.',
  },
  {
    id: 'q_008',
    concept_id: 'c_urine_formation',
    question:
      'What are the three main steps of urine formation?',
    options: [
      'Filtration, reabsorption, secretion',
      'Digestion, absorption, excretion',
      'Inhalation, exchange, exhalation',
      'Pumping, circulation, return',
    ],
    correctIndex: 0,
    difficulty: 4,
    explanation:
      'Urine formation involves glomerular filtration, tubular reabsorption, and tubular secretion within the nephron.',
  },
  {
    id: 'q_009',
    concept_id: 'c_human_respiratory',
    question: 'Where does gas exchange occur in the human respiratory system?',
    options: ['Trachea', 'Bronchi', 'Alveoli', 'Nasal cavity'],
    correctIndex: 2,
    difficulty: 3,
    explanation:
      'Alveoli are tiny air sacs in the lungs where oxygen diffuses into blood and CO₂ diffuses out.',
  },
  {
    id: 'q_010',
    concept_id: 'c_human_digestion',
    question:
      'Where does most chemical digestion and nutrient absorption occur?',
    options: ['Mouth', 'Stomach', 'Small intestine', 'Large intestine'],
    correctIndex: 2,
    difficulty: 2,
    explanation:
      'The small intestine is where most chemical digestion occurs and where nutrients are absorbed into the bloodstream.',
  },
];

// ============================================================
// Quests
// ============================================================

export const QUESTS: Quest[] = [
  {
    id: 'qst_001',
    title: 'Circulatory Circuit',
    description:
      'Team up to trace blood through the entire circulatory system. Master the heart, blood, and vessels together.',
    chapterId: 'ch_life_processes',
    difficulty: 'intermediate',
    questionCount: 5,
    xp: 150,
    status: 'available',
    participants: [PEER_STUDENTS[0]], // Maya (strong in transportation)
  },
  {
    id: 'qst_002',
    title: 'Energy Equation',
    description:
      'Compare aerobic and anaerobic respiration. Build complete mastery of how cells generate energy.',
    chapterId: 'ch_life_processes',
    difficulty: 'beginner',
    questionCount: 4,
    xp: 100,
    status: 'available',
    participants: [PEER_STUDENTS[2]], // Sam
  },
  {
    id: 'qst_003',
    title: 'Waste Management Challenge',
    description:
      'Explore the excretory system from kidneys to urine formation. Tackle the nephron together.',
    chapterId: 'ch_life_processes',
    difficulty: 'advanced',
    questionCount: 6,
    xp: 200,
    status: 'available',
    participants: [PEER_STUDENTS[1]], // Jordan (strong in excretion)
  },
];

// ============================================================
// Study materials (demo)
// ============================================================

export const DEMO_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat_001',
    title: 'Life Processes — Class Notes',
    type: 'notes',
    uploadedAt: '2026-08-10',
    status: 'analyzed',
    conceptsExtracted: 13,
  },
  {
    id: 'mat_002',
    title: 'Circulatory System Diagrams',
    type: 'textbook',
    uploadedAt: '2026-08-12',
    status: 'analyzed',
    conceptsExtracted: 4,
  },
];

// ============================================================
// Derived helpers
// ============================================================

export function getConceptsByTopic(topicId: string): Concept[] {
  return CONCEPTS.filter((c) => c.topic_id === topicId);
}

export function getKnowledgeState(conceptId: string): KnowledgeState | undefined {
  return DEMO_KNOWLEDGE_STATES.find((ks) => ks.concept_id === conceptId);
}

export function getTopicMastery(topicId: string): number {
  const concepts = getConceptsByTopic(topicId);
  if (concepts.length === 0) return 0;
  const total = concepts.reduce((sum, c) => {
    const ks = getKnowledgeState(c.id);
    return sum + (ks?.mastery ?? 0);
  }, 0);
  return Math.round(total / concepts.length);
}

export function getChapterMastery(chapterId: string): number {
  const topics = TOPICS.filter((t) => t.chapter_id === chapterId);
  if (topics.length === 0) return 0;
  const total = topics.reduce((sum, t) => sum + getTopicMastery(t.id), 0);
  return Math.round(total / topics.length);
}

export function getOverallMastery(): number {
  const total = DEMO_KNOWLEDGE_STATES.reduce((sum, ks) => sum + ks.mastery, 0);
  return Math.round(total / DEMO_KNOWLEDGE_STATES.length);
}
