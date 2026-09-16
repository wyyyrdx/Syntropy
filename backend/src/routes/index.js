const express = require('express');
const healthRouter = require('./health');
const notesRouter = require('./notes');
const authRouter = require('./auth');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/notes', notesRouter);
router.use('/auth', authRouter);

module.exports = router;