const express = require('express');
const ingestRoutes = require('./ingestRoutes');
const parcelRoutes = require('./parcelRoutes');
const conflictRoutes = require('./conflictRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ data: { status: 'ok' }, error: null, meta: null }));

router.use(ingestRoutes);
router.use(parcelRoutes);
router.use(conflictRoutes);

module.exports = router;
