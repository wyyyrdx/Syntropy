const db = require('../config/db');
const { recordActivity } = require('../services/activityService');

function safeCompletedQuizzes(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function calculateStreak(activity) {
  const activeDates = new Set(activity.map((item) => item.activity_date));
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  const today = cursor.toISOString().slice(0, 10);
  if (!activeDates.has(today)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (activeDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function getProfile(req, res) {
  const user = db.prepare(
    `SELECT id, email, display_name, created_at FROM users WHERE id = ?`
  ).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const progressRow = db.prepare(
    `SELECT xp, completed_quizzes, updated_at FROM user_progress WHERE user_id = ?`
  ).get(req.user.id);
  const completedQuizzes = safeCompletedQuizzes(progressRow?.completed_quizzes);
  const xp = progressRow?.xp || 0;

  const notes = db.prepare(
    `SELECT
       d.id,
       d.filename,
       d.file_type,
       d.file_size,
       d.status,
       d.created_at,
       (
         SELECT gj.mode
         FROM generation_jobs gj
         WHERE gj.document_id = d.id AND gj.user_id = d.user_id
         ORDER BY gj.created_at DESC
         LIMIT 1
       ) AS last_mode,
       (
         SELECT gj.status
         FROM generation_jobs gj
         WHERE gj.document_id = d.id AND gj.user_id = d.user_id
         ORDER BY gj.created_at DESC
         LIMIT 1
       ) AS generation_status
     FROM documents d
     WHERE d.user_id = ?
     ORDER BY d.created_at DESC
     LIMIT 50`
  ).all(req.user.id);

  const activity = db.prepare(
    `SELECT activity_date, activity_count
     FROM user_activity
     WHERE user_id = ? AND activity_date >= date('now', '-370 days')
     ORDER BY activity_date ASC`
  ).all(req.user.id);

  const generatedCount = db.prepare(
    `SELECT COUNT(*) AS count FROM generation_jobs
     WHERE user_id = ? AND status = 'completed'`
  ).get(req.user.id).count;

  return res.json({
    user,
    progress: {
      xp,
      level: Math.floor(xp / 200) + 1,
      completed_quizzes: completedQuizzes,
      updated_at: progressRow?.updated_at || null
    },
    stats: {
      notes: notes.length,
      generated: generatedCount,
      quizzes: completedQuizzes.length,
      streak: calculateStreak(activity)
    },
    notes,
    activity
  });
}

function updateProgress(req, res) {
  const xp = Math.max(0, Math.floor(Number(req.body.xp) || 0));
  const completedQuizzes = Array.isArray(req.body.completed_quizzes)
    ? [...new Set(req.body.completed_quizzes.filter((item) => typeof item === 'string'))]
    : [];

  const previous = db.prepare(
    `SELECT xp, completed_quizzes FROM user_progress WHERE user_id = ?`
  ).get(req.user.id);
  const previousCompleted = safeCompletedQuizzes(previous?.completed_quizzes);

  db.prepare(
    `INSERT INTO user_progress (user_id, xp, completed_quizzes, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id)
     DO UPDATE SET
       xp = excluded.xp,
       completed_quizzes = excluded.completed_quizzes,
       updated_at = datetime('now')`
  ).run(req.user.id, xp, JSON.stringify(completedQuizzes));

  if (xp > (previous?.xp || 0) || completedQuizzes.length > previousCompleted.length) {
    recordActivity(req.user.id);
  }

  return res.json({
    progress: {
      xp,
      level: Math.floor(xp / 200) + 1,
      completed_quizzes: completedQuizzes
    }
  });
}

module.exports = { getProfile, updateProgress };
