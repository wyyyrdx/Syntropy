// ============================================================
// NEXUS Core Types
// Domain types for the learning platform
// ============================================================

export type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastered';

export interface Subject {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string; // hex
}

export interface Chapter {
  id: string;
  subject_id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string; // lucide icon name
}

export interface Topic {
  id: string;
  chapter_id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  world_area: string; // e.g. "Nutrition Forest"
}

export interface Concept {
  id: string;
  topic_id: string;
  name: string;
  description: string;
  difficulty: number; // 1-5
  relationships?: string[]; // ids of related concepts
}

export interface KnowledgeState {
  concept_id: string;
  mastery: number; // 0-100
  level: MasteryLevel;
  attempts: number;
  correct: number;
  last_practiced: string | null;
}

export interface TopicMastery {
  topic: Topic;
  mastery: number;
  conceptCount: number;
  masteredCount: number;
  developingCount: number;
  noviceCount: number;
}

export interface ChapterMastery {
  chapter: Chapter;
  mastery: number;
  topics: TopicMastery[];
}

export interface QuizQuestion {
  id: string;
  concept_id: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  question_id: string;
  selectedIndex: number;
  correct: boolean;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_initials: string;
  bio: string;
  school: string;
  year: string;
  joined_date: string;
  overall_mastery: number;
  total_concepts: number;
  mastered_concepts: number;
  quests_completed: number;
  study_streak: number;
}

export interface PeerStudent {
  id: string;
  name: string;
  avatar_initials: string;
  school: string;
  overall_mastery: number;
  chapter_masteries: { chapterId: string; mastery: number }[];
  sharedChapters: string[];
}

export interface PeerRecommendation {
  peer: PeerStudent;
  reason: string;
  complementScore: number; // 0-100
  youCanTeach: { chapterId: string; yourMastery: number; theirMastery: number }[];
  theyCanTeach: { chapterId: string; theirMastery: number; yourMastery: number }[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  chapterId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  xp: number;
  status: 'available' | 'in_progress' | 'completed';
  participants: PeerStudent[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'notes' | 'textbook' | 'slides' | 'practice';
  uploadedAt: string;
  status: 'analyzed' | 'processing' | 'pending';
  conceptsExtracted: number;
}
