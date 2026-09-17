const express = require('express');
const validate = require('../middleware/validate');
const { parcelSearchSchema } = require('../dto/parcelSchema');
const parcelController = require('../controllers/parcelController');

const router = express.Router();

router.get('/parcels/search', validate(parcelSearchSchema, 'query'), parcelController.search);
router.get('/parcels/:id/audit', parcelController.getAudit);
router.get('/parcels/:id', parcelController.getById);

module.exports = router;
