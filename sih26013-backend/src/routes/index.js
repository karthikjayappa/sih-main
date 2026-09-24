const express = require('express');
const ingestRoutes = require('./ingestRoutes');
const parcelRoutes = require('./parcelRoutes');
const conflictRoutes = require('./conflictRoutes');
const conflationRoutes = require('./conflationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const correctionRequestRoutes = require('./correctionRequestRoutes');
const citizenRoutes = require('./citizenRoutes');

const router = express.Router();

router.get('/health', (req, res) =>
	res.status(200).json({
		data: { status: 'ok' },
		error: null,
		meta: null
	})
);

router.use(ingestRoutes);
router.use(parcelRoutes);
router.use(conflictRoutes);
router.use(conflationRoutes);
router.use(dashboardRoutes);
router.use(correctionRequestRoutes);
router.use(citizenRoutes);

module.exports = router;
