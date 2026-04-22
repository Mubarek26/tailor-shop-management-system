const express = require('express');
const {
	requestOwnerAccess,
	login,
	logout,
	protect,
	restrictTo,
	forgotPassword,
	resetPassword,
	updatePassword,
	assignTailorToOwner,
	assignTailorToOwnerByPhone,
} = require('./auth.controller');

const router = express.Router();

router.post('/owner-request', requestOwnerAccess);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-password', protect, updatePassword);

// Add a route for assigning tailors to owners
router.post('/assign-tailor', protect, restrictTo('owner', 'superadmin'), assignTailorToOwner);

// Add a route for assigning tailors to owners by phone number
router.post('/assign-tailor-by-phone', protect, restrictTo('owner', 'superadmin'), assignTailorToOwnerByPhone);

router.get('/me', protect, restrictTo('owner', 'tailor', 'superadmin'), (req, res) => {
	res.status(200).json({ status: 'success', data: { user: req.user } });
});

module.exports = router;
