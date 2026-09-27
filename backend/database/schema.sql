-- Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,        
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending', 
  error_message TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id                TEXT PRIMARY KEY,
  session_id        TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  image_path        TEXT NOT NULL,       
  subject_title     TEXT,
  raw_transcription TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS concepts (
  node_id           TEXT NOT NULL,       
  session_id        TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  explanation       TEXT,
  importance        TEXT,                
  suggested_cluster TEXT,
  PRIMARY KEY (session_id, node_id)
);

CREATE TABLE IF NOT EXISTS concept_edges (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id        TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  source_id         TEXT NOT NULL,
  target_id         TEXT NOT NULL,
  relationship_type TEXT
);

CREATE TABLE IF NOT EXISTS questions (
  question_id       TEXT NOT NULL,
  session_id        TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  linked_node_id    TEXT,
  question_text     TEXT NOT NULL,
  options_json      TEXT NOT NULL,       
  correct_option_id TEXT,
  explanation       TEXT,
  PRIMARY KEY (session_id, question_id)
);

CREATE TABLE IF NOT EXISTS session_members (
  session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member',   -- 'owner' | 'member'
  joined_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (session_id, user_id)
);

CREATE TABLE IF NOT EXISTS documents (
  id            TEXT PRIMARY KEY,
  filename      TEXT NOT NULL,
  file_type     TEXT NOT NULL,
  file_size     INTEGER NOT NULL,
  file_path     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'ready',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id            TEXT PRIMARY KEY,
  document_id   TEXT NOT NULL,
  mode          TEXT NOT NULL, -- 'explanation' | 'graph' | 'world'
  status        TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  error         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at  TEXT
);

CREATE TABLE IF NOT EXISTS generation_results (
  id            TEXT PRIMARY KEY,
  job_id        TEXT NOT NULL REFERENCES generation_jobs(id) ON DELETE CASCADE,
  document_id   TEXT NOT NULL,
  mode          TEXT NOT NULL,
  result_json   TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

