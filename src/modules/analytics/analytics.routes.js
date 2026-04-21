const express = require('express');
const { getSummary, getRevenue, getOrdersStatus } = require('./analytics.controller');
const { protect, restrictTo } = require('../auth/auth.controller');

const router = express.Router();

router.get('/summary', protect, restrictTo('owner', 'superadmin'), getSummary);
router.get('/revenue', protect, restrictTo('owner', 'superadmin'), getRevenue);
router.get('/orders-status', protect, restrictTo('owner', 'superadmin'), getOrdersStatus);

module.exports = router;
