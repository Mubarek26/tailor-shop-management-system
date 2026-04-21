const express = require('express');
const {
  getMeasurements,
  createMeasurements,
  updateMeasurements,
} = require('./measurements.controller');

const router = express.Router();

router.get('/:orderId', getMeasurements);
router.post('/', createMeasurements);
router.put('/:id', updateMeasurements);

module.exports = router;
