const express = require('express');
const multer = require('multer');
const {
  listOrders,
  updateOrder,
  updateOrderStatus,
  assignOrderToTailor,
  unassignOrder,
  deleteOrder,
  createFullOrder,
  listTailorOrders,
} = require('./orders.controller');
const { protect, restrictTo } = require('../auth/auth.controller');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const createFullOrderUpload = upload.any();
const updateOrderUpload = upload.any();

router.get('/', protect, restrictTo('owner'), listOrders);
router.get('/tailor', protect, restrictTo('tailor'), listTailorOrders);
router.post('/create-full', protect, restrictTo('owner'), createFullOrderUpload, createFullOrder);
router.put('/:id', protect, restrictTo('owner'), updateOrderUpload, updateOrder);
router.patch('/:id/status', protect, restrictTo('owner'), updateOrderStatus);
router.patch('/:id/assign-tailor', protect, restrictTo('owner'), assignOrderToTailor);
router.patch('/:id/unassign-tailor', protect, restrictTo('owner'), unassignOrder);
router.delete('/:id', protect, restrictTo('owner'), deleteOrder);

module.exports = router;
