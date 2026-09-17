const express = require('express');
const upload = require('../config/upload');
const validate = require('../middleware/validate');
const { ingestRequestSchema } = require('../dto/ingestSchema');
const ingestController = require('../controllers/ingestController');

const router = express.Router();

router.post(
  '/ingest',
  upload.single('file'),
  validate(ingestRequestSchema, 'body'),
  ingestController.ingest
);

module.exports = router;
