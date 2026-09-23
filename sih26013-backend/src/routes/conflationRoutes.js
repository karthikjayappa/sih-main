const express = require('express');
const conflationController = require('../controllers/conflationController');

const router = express.Router();

router.post('/conflation/run', conflationController.run);

module.exports = router;
