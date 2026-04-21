const express = require('express');
const { getProgress, updateProgress } = require('./progress.controller');

const router = express.Router();

router.get('/:orderId', getProgress);
router.put('/:id', updateProgress);

module.exports = router;
