const express = require('express');
const {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  createTailor,
  findTailorByPhoneNumber,
  getOwnerTailors,
  getTailorOwners,
} = require('./users.controller');
const { protect, restrictTo } = require('../auth/auth.controller');

const router = express.Router();

router.get('/', listUsers);
router.get('/tailors', protect, restrictTo('owner', 'superadmin'), getOwnerTailors);
router.get('/owners', protect, restrictTo('tailor', 'superadmin'), getTailorOwners);
router.post('/create-tailor', protect, restrictTo('owner', 'superadmin'), createTailor);
router.get('/tailors/by-phone/:phoneNumber', protect, findTailorByPhoneNumber);
router.get('/:id', protect, restrictTo('superadmin'), getUser);
router.put('/:id', protect, restrictTo('superadmin'), updateUser);
router.patch('/:id/status', protect, restrictTo('owner', 'superadmin'), updateUserStatus);
router.delete('/:id', protect, restrictTo('superadmin'), deleteUser);

module.exports = router;
