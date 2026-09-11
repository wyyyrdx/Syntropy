-- Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,        
  user_id       TEXT NOT NULL,
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
