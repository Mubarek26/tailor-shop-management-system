const { asyncHandler } = require('../../utils/asyncHandler');
const User = require('./users.model');
const AppError = require('../../utils/appError');
const sendEmail = require('../../utils/email');
const { uploadMulterFile } = require('../../utils/cloudinaryUpload');

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

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('_id fullName email phoneNumber role status address photo createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    data: { 
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    },
  });
});

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, phoneNumber, address, role, status } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { fullName, email, phoneNumber, address, role, status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
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

  const isSuperadmin = req.user && req.user.role === 'superadmin';
  let targetOwnerId = req.user._id;

  if (isSuperadmin) {
    targetOwnerId = req.body.owner_id;
    if (!targetOwnerId) {
      return next(new AppError('owner_id is required when superadmin creates a tailor', 400));
    }
  }

  const newUser = await User.create({
    fullName,
    phoneNumber,
    password,
    passwordConfirm: password,
    role: 'tailor',
    status: 'approved',
    created_by: req.user._id,
    owners: [targetOwnerId],
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
  const isSuperadmin = req.user && req.user.role === 'superadmin';
  if (!req.user || (req.user.role !== 'owner' && !isSuperadmin)) {
    return next(new AppError('Unauthorized', 401));
  }

  const { phoneNumber, owner_id } = req.query;
  const filter = {
    role: 'tailor',
  };

  if (!isSuperadmin) {
    filter.owners = req.user._id;
  } else if (owner_id) {
    filter.owners = owner_id;
  }

  if (phoneNumber) {
    filter.phoneNumber = phoneNumber;
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments(filter);
  const tailors = await User.find(filter)
    .select('_id fullName phoneNumber status photo address createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    data: {
      tailors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    },
  });
});

const getTailorOwners = asyncHandler(async (req, res, next) => {
  const isSuperadmin = req.user && req.user.role === 'superadmin';
  if (!req.user || (req.user.role !== 'tailor' && !isSuperadmin)) {
    return next(new AppError('Unauthorized', 401));
  }

  const targetTailorId = isSuperadmin && req.query.tailor_id ? req.query.tailor_id : req.user._id;

  const tailorDoc = await User.findById(targetTailorId).populate(
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

  // Send approval email if the status is now 'approved'
  if (status === 'approved') {
    const loginURL = `${process.env.FRONTEND_URL}/login`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 28px; font-weight: bold; color: #1a1a1a; text-decoration: none; }
          .content { background: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .title { font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #000; }
          .text { font-size: 16px; color: #666; margin-bottom: 32px; }
          .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: opacity 0.2s; }
          .footer { text-align: center; margin-top: 40px; font-size: 14px; color: #999; }
          .highlight { color: #1a1a1a; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">Tailor Pro</a>
          </div>
          <div class="content">
            <h1 class="title">Congratulations! Your account is approved.</h1>
            <p class="text">Hi <span class="highlight">${user.fullName}</span>,</p>
            <p class="text">Great news! Your application to join the Tailor Pro network has been reviewed and <span class="highlight">approved</span> by our administration team. You now have full access to manage your shop, clients, and orders.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${loginURL}" class="button">Log In to Your Dashboard</a>
            </div>

            <p class="text">We're thrilled to have you with us and look forward to helping your shop grow.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Tailor Pro Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to Tailor Pro! Your account has been approved",
        message: `Congratulations! Your Tailor Pro account has been approved. You can now log in here: ${loginURL}`,
        html,
      });
    } catch (err) {
      console.error("Error sending approval email:", err);
      // We don't block the response even if email fails, but we log it
    }
  }

  res.status(200).json({ status: 'success', data: { user } });
});

const updateMe = asyncHandler(async (req, res, next) => {
  const { fullName, email, address } = req.body;
  const updateData = {};
  const isTailor = req.user.role === 'tailor';
  
  // Tailors are not allowed to change their name or email
  if (!isTailor) {
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
  }
  
  if (address) updateData.address = address;

  if (req.file) {
    const uploaded = await uploadMulterFile(req.file, { folder: 'users' });
    updateData.photo = uploaded?.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

module.exports = {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  createTailor,
  findTailorByPhoneNumber,
  getOwnerTailors,
  getTailorOwners,
  updateMe,
};
