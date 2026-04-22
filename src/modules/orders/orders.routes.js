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

router.get('/', protect, restrictTo('owner', 'superadmin'), listOrders);
router.get('/tailor', protect, restrictTo('tailor', 'superadmin', 'owner'), listTailorOrders);
router.post('/create-full', protect, restrictTo('owner', 'superadmin'), createFullOrderUpload, createFullOrder);
router.put('/:id', protect, restrictTo('owner', 'superadmin'), updateOrderUpload, updateOrder);
router.patch('/:id/status', protect, restrictTo('owner', 'superadmin', 'tailor'), updateOrderStatus);
router.patch('/:id/assign-tailor', protect, restrictTo('owner', 'superadmin'), assignOrderToTailor);
router.patch('/:id/unassign-tailor', protect, restrictTo('owner', 'superadmin'), unassignOrder);
router.delete('/:id', protect, restrictTo('owner', 'superadmin'), deleteOrder);

module.exports = router;
