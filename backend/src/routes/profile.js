const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getProfile, updateProgress } = require('../controllers/profileController');

const router = express.Router();

router.get('/', requireAuth, getProfile);
router.put('/progress', requireAuth, updateProgress);

module.exports = router;
