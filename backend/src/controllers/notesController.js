const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { generateConceptGraph } = require('../../ai/generate');

async function uploadNote(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided (field name: 'image')." });
  }

  // TODO: replace with real authenticated user id once auth is wired up
  const userId = req.body.user_id || 'anonymous';
  const sessionId = uuidv4();

  db.prepare(
    `INSERT INTO sessions (id, user_id, status) VALUES (?, ?, 'pending')`
  ).run(sessionId, userId);

  db.prepare(
    `INSERT INTO notes (id, session_id, image_path) VALUES (?, ?, ?)`
  ).run(uuidv4(), sessionId, req.file.path);

  res.status(202).json({ session_id: sessionId, status: 'pending' });

  processNoteAsync(sessionId, req.file.path).catch((err) => {
    console.error(`[notesController] Background processing failed for session ${sessionId}:`, err);
  });
}

function getStatus(req, res) {
  const { sessionId } = req.params;

  const session = db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  if (session.status === 'failed') {
    return res.status(200).json({
      session_id: session.id,
      status: 'failed',
      error: session.error_message,
    });
  }

  if (session.status !== 'completed') {
    return res.status(200).json({ session_id: session.id, status: session.status });
  }

  const note = db.prepare(`SELECT * FROM notes WHERE session_id = ?`).get(sessionId);
  const nodes = db
    .prepare(`SELECT node_id, title, explanation, importance, suggested_cluster FROM concepts WHERE session_id = ?`)
    .all(sessionId);
  const edges = db
    .prepare(`SELECT source_id, target_id, relationship_type FROM concept_edges WHERE session_id = ?`)
    .all(sessionId);
  const questions = db
    .prepare(`SELECT * FROM questions WHERE session_id = ?`)
    .all(sessionId)
    .map((q) => ({
      question_id: q.question_id,
      linked_node_id: q.linked_node_id,
      question_text: q.question_text,
      options: JSON.parse(q.options_json),
      correct_option_id: q.correct_option_id,
      explanation: q.explanation,
    }));

  res.status(200).json({
    session_id: session.id,
    status: 'completed',
    created_at: session.created_at,
    user_id: session.user_id,
    subject_title: note?.subject_title,
    raw_transcription: note?.raw_transcription,
    nodes,
    edges,
    questions,
  });
}

async function processNoteAsync(sessionId, imagePath) {
  db.prepare(`UPDATE sessions SET status = 'processing', updated_at = datetime('now') WHERE id = ?`).run(sessionId);

  try {
    const graph = await generateConceptGraph(imagePath);

    const tx = db.transaction(() => {
      db.prepare(
        `UPDATE notes SET subject_title = ?, raw_transcription = ? WHERE session_id = ?`
      ).run(graph.subject_title, graph.raw_transcription, sessionId);

      const insertConcept = db.prepare(
        `INSERT INTO concepts (node_id, session_id, title, explanation, importance, suggested_cluster)
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      for (const n of graph.nodes || []) {
        insertConcept.run(n.node_id, sessionId, n.title, n.explanation, n.importance, n.suggested_cluster);
      }

      const insertEdge = db.prepare(
        `INSERT INTO concept_edges (session_id, source_id, target_id, relationship_type) VALUES (?, ?, ?, ?)`
      );
      for (const e of graph.edges || []) {
        insertEdge.run(sessionId, e.source_id, e.target_id, e.relationship_type);
      }

      const insertQuestion = db.prepare(
        `INSERT INTO questions (question_id, session_id, linked_node_id, question_text, options_json, correct_option_id, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      for (const q of graph.questions || []) {
        insertQuestion.run(
          q.question_id,
          sessionId,
          q.linked_node_id,
          q.question_text,
          JSON.stringify(q.options || []),
          q.correct_option_id,
          q.explanation
        );
      }

      db.prepare(`UPDATE sessions SET status = 'completed', updated_at = datetime('now') WHERE id = ?`).run(sessionId);
    });

    tx();
  } catch (err) {
    db.prepare(
      `UPDATE sessions SET status = 'failed', error_message = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(err.message || 'Unknown AI processing error', sessionId);
  }
}

module.exports = { uploadNote, getStatus };
