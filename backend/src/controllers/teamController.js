/**
 * Syntropy Backend . Team controller
 */

const db = require('../config/db');

function getSessionMembers(sessionId) {
  return db
    .prepare(
      `SELECT sm.user_id, sm.role, sm.joined_at, u.email
       FROM session_members sm
       JOIN users u ON u.id = sm.user_id
       WHERE sm.session_id = ?
       ORDER BY sm.joined_at ASC`
    )
    .all(sessionId);
}

function isMember(sessionId, userId) {
  return !!db
    .prepare(`SELECT 1 FROM session_members WHERE session_id = ? AND user_id = ?`)
    .get(sessionId, userId);
}

async function joinSession(req, res) {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const session = db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  if (isMember(sessionId, userId)) {
    return res.status(200).json({
      message: 'Already a member of this session.',
      members: getSessionMembers(sessionId),
    });
  }

  // MVP cap: owner + exactly one teammate.
  const members = getSessionMembers(sessionId);
  const nonOwnerCount = members.filter((m) => m.role !== 'owner').length;
  if (nonOwnerCount >= 1) {
    return res.status(409).json({ error: 'This session already has a teammate.' });
  }

  db.prepare(
    `INSERT INTO session_members (session_id, user_id, role) VALUES (?, ?, 'member')`
  ).run(sessionId, userId);

  res.status(200).json({
    message: 'Joined session.',
    members: getSessionMembers(sessionId),
  });
}

function listMembers(req, res) {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const session = db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  // Only members of the session (owner or teammate) can see who's in it.
  if (!isMember(sessionId, userId)) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  res.status(200).json({ session_id: sessionId, members: getSessionMembers(sessionId) });
}

module.exports = { joinSession, listMembers };
