const express = require('express');
const healthRouter = require('./health');
const notesRouter = require('./notes');
const authRouter = require('./auth');
const teamRouter = require('./team');
const ingestionRouter = require('./ingestion');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/notes', notesRouter);
router.use('/auth', authRouter);
router.use('/team', teamRouter);
router.use('/', ingestionRouter);

module.exports = router;