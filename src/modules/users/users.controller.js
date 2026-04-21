const { asyncHandler } = require('../../utils/asyncHandler');
const User = require('./users.model');
const AppError = require('../../utils/appError');

const listUsers = asyncHandler(async (req, res, next) => {
  const { role } = req.query;
  const allowedRoles = ['owner', 'tailor'];
  const filter = {};

  if (role) {
    if (!allowedRoles.includes(role)) {
      return next(new AppError('Invalid role value', 400));
    }

    filter.role = role;
  }

  const users = await User.find(filter).select(
    '_id fullName email phoneNumber role status address photo createdAt updatedAt'
  );

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'updateUser not implemented' });
});

const deleteUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'deleteUser not implemented' });
});


const createTailor = asyncHandler(async (req, res, next) => {
  const { fullName, phoneNumber, password } = req.body;

  if (!fullName || !phoneNumber || !password) {
    return next(new AppError('fullName, phoneNumber, and password are required', 400));
  }

  const existing = await User.findOne({ phoneNumber });
  if (existing) {
    return next(new AppError('Phone number already in use', 409));
  }

  const newUser = await User.create({
    fullName,
    phoneNumber,
    password,
    passwordConfirm: password,
    role: 'tailor',
    status: 'approved',
    created_by: req.user._id,
    owners: [req.user._id],
  });

  newUser.password = undefined;

  res.status(201).json({ status: 'success', data: { user: newUser } });
});



const findTailorByPhoneNumber = asyncHandler(async (req, res, next) => {
  const phoneNumber = req.query.phoneNumber || req.params.phoneNumber;

  if (!phoneNumber) {
    return next(new AppError('phoneNumber is required', 400));
  }

  const tailor = await User.findOne({ phoneNumber, role: 'tailor' }).select(
    '_id fullName phoneNumber status photo address createdAt updatedAt'
  );

  if (!tailor) {
    return next(new AppError('Tailor not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tailor,
    },
  });
});

const getOwnerTailors = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'owner') {
    return next(new AppError('Unauthorized', 401));
  }

  const { phoneNumber } = req.query;
  const filter = {
    role: 'tailor',
    owners: req.user._id,
  };

  if (phoneNumber) {
    filter.phoneNumber = phoneNumber;
  }

  const tailors = await User.find(filter).select(
    '_id fullName phoneNumber status photo address createdAt updatedAt'
  );

  res.status(200).json({
    status: 'success',
    results: tailors.length,
    data: {
      tailors,
    },
  });
});

const getTailorOwners = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'tailor') {
    return next(new AppError('Unauthorized', 401));
  }

  const tailorDoc = await User.findById(req.user._id).populate(
    'owners',
    '_id fullName phoneNumber email status address createdAt updatedAt'
  );

  if (!tailorDoc) {
    return next(new AppError('Tailor not found', 404));
  }

  let owners = Array.isArray(tailorDoc.owners) ? tailorDoc.owners : [];

  const { phoneNumber, ownerId, status } = req.query;

  if (phoneNumber) {
    owners = owners.filter((o) => (o.phoneNumber || '').toString() === phoneNumber.toString());
  }

  if (ownerId) {
    owners = owners.filter((o) => o._id.toString() === ownerId.toString());
  }

  if (status) {
    owners = owners.filter((o) => (o.status || '').toString() === status.toString());
  }

  res.status(200).json({
    status: 'success',
    results: owners.length,
    data: { owners },
  });
});

const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['pending', 'approved', 'rejected'];

  if (!allowed.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'owner' },
    { status },
    { new: true, runValidators: true }
  ).select('+active');

  if (!user) {
    return next(new AppError('Owner not found', 404));
  }

  res.status(200).json({ status: 'success', data: { user } });
});

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
  updateUserStatus,
  createTailor,
  findTailorByPhoneNumber,
  getOwnerTailors,
  getTailorOwners,
};
