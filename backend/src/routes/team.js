const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { joinSession, listMembers } = require('../controllers/teamController');

const router = express.Router();

/**
 * @openapi
 * /team/join/{sessionId}:
 *   post:
 *     summary: Join an existing session as the teammate (the sessionId itself is the invite code)
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Joined successfully (or already a member) - returns current members
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Session not found
 *       409:
 *         description: Session already has a teammate
 */
router.post('/join/:sessionId', requireAuth, joinSession);

/**
 * @openapi
 * /team/{sessionId}/members:
 *   get:
 *     summary: List the members (owner + teammate) of a session - for shared presence
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of session members
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Session not found, or you are not a member of it
 */
router.get('/:sessionId/members', requireAuth, listMembers);

module.exports = router;
