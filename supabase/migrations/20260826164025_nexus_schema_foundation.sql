/*
# NEXUS Platform — Core Database Schema

## Overview
Creates the foundational schema for the NEXUS AI-powered collaborative learning platform.
Multi-user app with authentication — each user owns their profile data, and collaborative
data (quests, study groups, peer recommendations) is shared among participants.

## New Tables
1. profiles — Extended user info linked to auth.users
2. subjects — Top-level subjects (e.g. Science)
3. chapters — Chapters within a subject (e.g. Life Processes)
4. topics — Topics within a chapter (e.g. Nutrition)
5. concepts — Individual learnable concepts
6. study_materials — Uploaded study material per user
7. knowledge_states — Per-user mastery of a concept
8. quiz_questions — Bank of quiz questions
9. quiz_attempts — Individual question attempts
10. quests — Collaborative learning challenges
11. quest_progress — Per-user progress on quests
12. group_members — Membership linking users to groups (created before study_groups for FK)
13. study_groups — Groups of students
14. peer_recommendations — AI peer matching suggestions

## Security
- RLS on every table. Owner-scoped tables use auth.uid(). Shared content tables readable by all authenticated.
*/

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_initials text NOT NULL DEFAULT '',
  bio text DEFAULT '',
  school text DEFAULT '',
  year text DEFAULT '',
  study_streak integer NOT NULL DEFAULT 0,
  overall_mastery integer NOT NULL DEFAULT 0,
  quests_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#7C3AED'
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_subjects" ON subjects;
CREATE POLICY "select_subjects" ON subjects FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- chapters
-- ============================================================
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#06B6D4',
  icon_name text DEFAULT 'BookOpen',
  UNIQUE(subject_id, slug)
);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_chapters" ON chapters;
CREATE POLICY "select_chapters" ON chapters FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- topics
-- ============================================================
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#10B981',
  icon_name text DEFAULT 'BookOpen',
  world_area text DEFAULT '',
  UNIQUE(chapter_id, slug)
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_topics" ON topics;
CREATE POLICY "select_topics" ON topics FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- concepts
-- ============================================================
CREATE TABLE IF NOT EXISTS concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  difficulty integer NOT NULL DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5)
);

ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_concepts" ON concepts;
CREATE POLICY "select_concepts" ON concepts FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- study_materials
-- ============================================================
CREATE TABLE IF NOT EXISTS study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'notes',
  status text NOT NULL DEFAULT 'pending',
  concepts_extracted integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_materials" ON study_materials;
CREATE POLICY "select_own_materials" ON study_materials FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_materials" ON study_materials;
CREATE POLICY "insert_own_materials" ON study_materials FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_materials" ON study_materials;
CREATE POLICY "update_own_materials" ON study_materials FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_materials" ON study_materials;
CREATE POLICY "delete_own_materials" ON study_materials FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- knowledge_states
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  mastery integer NOT NULL DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 100),
  attempts integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  last_practiced timestamptz,
  UNIQUE(user_id, concept_id)
);

ALTER TABLE knowledge_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_knowledge" ON knowledge_states;
CREATE POLICY "select_own_knowledge" ON knowledge_states FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_knowledge" ON knowledge_states;
CREATE POLICY "insert_own_knowledge" ON knowledge_states FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_knowledge" ON knowledge_states;
CREATE POLICY "update_own_knowledge" ON knowledge_states FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_knowledge" ON knowledge_states;
CREATE POLICY "delete_own_knowledge" ON knowledge_states FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- quiz_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  difficulty integer NOT NULL DEFAULT 3,
  explanation text DEFAULT ''
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_questions" ON quiz_questions;
CREATE POLICY "select_questions" ON quiz_questions FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- quiz_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_index integer NOT NULL,
  correct boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_attempts" ON quiz_attempts;
CREATE POLICY "select_own_attempts" ON quiz_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attempts" ON quiz_attempts;
CREATE POLICY "insert_own_attempts" ON quiz_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_attempts" ON quiz_attempts;
CREATE POLICY "delete_own_attempts" ON quiz_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- quests
-- ============================================================
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  difficulty text NOT NULL DEFAULT 'intermediate',
  question_count integer NOT NULL DEFAULT 5,
  xp integer NOT NULL DEFAULT 100,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_quests" ON quests;
CREATE POLICY "select_quests" ON quests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_quests" ON quests;
CREATE POLICY "insert_own_quests" ON quests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

-- ============================================================
-- quest_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'available',
  score integer DEFAULT 0,
  completed_at timestamptz,
  UNIQUE(user_id, quest_id)
);

ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_progress" ON quest_progress;
CREATE POLICY "select_own_progress" ON quest_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_progress" ON quest_progress;
CREATE POLICY "insert_own_progress" ON quest_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON quest_progress;
CREATE POLICY "update_own_progress" ON quest_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- study_groups (created before group_members for FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- group_members
-- ============================================================
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Now enable RLS and create policies (group_members exists now)
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_groups_as_member" ON study_groups;
CREATE POLICY "select_groups_as_member" ON study_groups FOR SELECT
  TO authenticated USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = study_groups.id
      AND group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_groups" ON study_groups;
CREATE POLICY "insert_own_groups" ON study_groups FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_membership" ON group_members;
CREATE POLICY "select_own_membership" ON group_members FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_membership" ON group_members;
CREATE POLICY "insert_own_membership" ON group_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- peer_recommendations
-- ============================================================
CREATE TABLE IF NOT EXISTS peer_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  peer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  complement_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE peer_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recommendations" ON peer_recommendations;
CREATE POLICY "select_own_recommendations" ON peer_recommendations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_recommendations" ON peer_recommendations;
CREATE POLICY "insert_own_recommendations" ON peer_recommendations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_chapter ON topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_concepts_topic ON concepts(topic_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_user ON knowledge_states(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_concept ON knowledge_states(concept_id);
CREATE INDEX IF NOT EXISTS idx_materials_user ON study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_user ON quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_peer_recs_user ON peer_recommendations(user_id);
