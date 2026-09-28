const db = require('../config/db');

function recordActivity(userId, amount = 1) {
  if (!userId) return;

  db.prepare(
    `INSERT INTO user_activity (user_id, activity_date, activity_count)
     VALUES (?, date('now'), ?)
     ON CONFLICT(user_id, activity_date)
     DO UPDATE SET activity_count = activity_count + excluded.activity_count`
  ).run(userId, Math.max(1, Number(amount) || 1));
}

module.exports = { recordActivity };
