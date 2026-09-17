const express = require('express');
const validate = require('../middleware/validate');
const { conflictQuerySchema, conflictUpdateSchema } = require('../dto/conflictSchema');
const conflictController = require('../controllers/conflictController');

const router = express.Router();

router.get('/conflicts', validate(conflictQuerySchema, 'query'), conflictController.list);
router.patch('/conflicts/:unifiedParcelId', validate(conflictUpdateSchema, 'body'), conflictController.update);

module.exports = router;
