const { randomUUID } = require('crypto');
const db = require('../config/db');
const { generateConceptGraph } = require('../../ai/generate');

/**
 * POST /api/notes
 * multipart/form-data: image=<file>, user_id=<string>
 *
 * Returns immediately with a session_id (status: pending) and processes
 * the AI call in the background.
 */
function uploadNote(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided (field name: "image").' });
  }

  
  const userId = req.body.user_id || 'anonymous';
  const sessionId = randomUUID();
  const noteId = randomUUID();
  const imagePath = req.file.path;

  const insertSession = db.prepare(
    `INSERT INTO sessions (id, user_id, status) VALUES (?, ?, 'pending')`
  );
  const insertNote = db.prepare(
    `INSERT INTO notes (id, session_id, image_path) VALUES (?, ?, ?)`
  );

  const tx = db.transaction(() => {
    insertSession.run(sessionId, userId);
    insertNote.run(noteId, sessionId, imagePath);
  });
  tx();

  res.status(202).json({ session_id: sessionId, status: 'pending' });

  processNoteInBackground(sessionId, imagePath);
}

async function processNoteInBackground(sessionId, imagePath) {
  try {
    const graph = await generateConceptGraph(imagePath);
    persistConceptGraph(sessionId, graph);

    db.prepare(
      `UPDATE sessions SET status = 'completed', updated_at = datetime('now') WHERE id = ?`
    ).run(sessionId);
  } catch (err) {
    console.error(`[session ${sessionId}] AI processing failed:`, err.message);
    db.prepare(
      `UPDATE sessions SET status = 'failed', error_message = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(err.message, sessionId);
  }
}

function persistConceptGraph(sessionId, graph) {
  const updateNote = db.prepare(
    `UPDATE notes SET subject_title = ?, raw_transcription = ? WHERE session_id = ?`
  );
  const insertConcept = db.prepare(
    `INSERT INTO concepts (node_id, session_id, title, explanation, importance, suggested_cluster)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertEdge = db.prepare(
    `INSERT INTO concept_edges (session_id, source_id, target_id, relationship_type)
     VALUES (?, ?, ?, ?)`
  );
  const insertQuestion = db.prepare(
    `INSERT INTO questions (question_id, session_id, linked_node_id, question_text, options_json, correct_option_id, explanation)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    updateNote.run(graph.subject_title, graph.raw_transcription, sessionId);

    for (const node of graph.nodes) {
      insertConcept.run(
        node.node_id, sessionId, node.title, node.explanation,
        node.importance, node.suggested_cluster || null
      );
    }
    for (const edge of graph.edges) {
      insertEdge.run(sessionId, edge.source_id, edge.target_id, edge.relationship_type);
    }
    for (const q of graph.questions) {
      insertQuestion.run(
        q.question_id, sessionId, q.linked_node_id, q.question_text,
        JSON.stringify(q.options), q.correct_option_id, q.explanation
      );
    }
  });
  tx();
}

/**
 * GET /api/notes/:sessionId/status
 */
function getStatus(req, res) {
  const { sessionId } = req.params;

  const session = db.prepare(
    `SELECT id, status, error_message, created_at, updated_at FROM sessions WHERE id = ?`
  ).get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const response = {
    session_id: session.id,
    status: session.status,
    created_at: session.created_at,
    updated_at: session.updated_at
  };

  if (session.status === 'failed') {
    response.error_message = session.error_message;
  }

  if (session.status === 'completed') {
    response.graph = buildGraphResponse(sessionId);
  }

  res.json(response);
}

function buildGraphResponse(sessionId) {
  const note = db.prepare(
    `SELECT subject_title, raw_transcription FROM notes WHERE session_id = ?`
  ).get(sessionId);

  const nodes = db.prepare(
    `SELECT node_id, title, explanation, importance, suggested_cluster FROM concepts WHERE session_id = ?`
  ).all(sessionId);

  const edges = db.prepare(
    `SELECT source_id, target_id, relationship_type FROM concept_edges WHERE session_id = ?`
  ).all(sessionId);

  const questions = db.prepare(
    `SELECT question_id, linked_node_id, question_text, options_json, correct_option_id, explanation FROM questions WHERE session_id = ?`
  ).all(sessionId).map(q => ({
    ...q,
    options: JSON.parse(q.options_json),
    options_json: undefined
  }));

  return {
    subject_title: note?.subject_title,
    raw_transcription: note?.raw_transcription,
    nodes,
    edges,
    questions
  };
}

module.exports = { uploadNote, getStatus };
