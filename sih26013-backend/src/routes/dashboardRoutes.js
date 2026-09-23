const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/dashboard/stats', dashboardController.stats);

module.exports = router;
