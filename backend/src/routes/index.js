const express = require('express');
const healthRouter = require('./health');
const notesRouter = require('./notes');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/notes', notesRouter);

module.exports = router;
