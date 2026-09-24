const express = require('express');
const citizenController = require('../controllers/citizenController');

const router = express.Router();

router.post('/citizen/login', citizenController.login);

module.exports = router;
