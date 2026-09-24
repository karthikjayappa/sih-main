const express = require('express');
const correctionRequestController = require('../controllers/correctionRequestController');

const router = express.Router();

router.post('/correction-requests', correctionRequestController.create);

router.get('/correction-requests', correctionRequestController.findAll);

router.get('/correction-requests/:id', correctionRequestController.findById);

router.patch('/correction-requests/:id/review', correctionRequestController.review);

module.exports = router;
