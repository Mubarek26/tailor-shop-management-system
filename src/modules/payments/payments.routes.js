const express = require('express');
const { getPayment, createPayment, updatePayment } = require('./payments.controller');

const router = express.Router();

router.get('/:orderId', getPayment);
router.post('/', createPayment);
router.put('/:id', updatePayment);

module.exports = router;
