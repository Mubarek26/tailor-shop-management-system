const express = require('express');
const {
  listCustomers,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
} = require('./customers.controller');
const { protect, restrictTo } = require('../auth/auth.controller');

const router = express.Router();

router.get('/', protect, restrictTo('owner'), listCustomers);
router.get('/:id/orders', protect, restrictTo('owner'), getCustomerOrders);
// POST /customers removed — customers are created via full order flow
router.put('/:id', protect, restrictTo('owner'), updateCustomer);
router.delete('/:id', protect, restrictTo('owner'), deleteCustomer);

module.exports = router;
