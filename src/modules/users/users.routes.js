const express = require('express');
const {
  listUsers,
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
router.get('/tailors', protect, restrictTo('owner'), getOwnerTailors);
router.get('/owners', protect, restrictTo('tailor'), getTailorOwners);
router.post('/create-tailor', protect, restrictTo('owner'), createTailor);
router.get('/tailors/by-phone/:phoneNumber', protect, findTailorByPhoneNumber);
router.put('/:id', updateUser);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
