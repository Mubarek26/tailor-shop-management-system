const { asyncHandler } = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const Design = require('./designs.model');
const Order = require('../orders/orders.model');

const getDesign = asyncHandler(async (req, res, next) => {
  const orderId = req.params.orderId;
  if (!orderId) return next(new AppError('orderId is required', 400));

  const design = await Design.findOne({ order_id: orderId });
  if (!design) return next(new AppError('Design not found for this order', 404));

  await design.populate({
    path: 'order_id',
    select: 'total_price deposit remaining_price appointment_date status design_image_url owner_id',
    populate: [
      { path: 'customer_id', select: 'name phone unique_code' },
      { path: 'assigned_tailor_id', select: 'fullName phoneNumber' },
    ],
  });

  res.status(200).json({ status: 'success', data: { design } });
});

const createDesign = asyncHandler(async (req, res, next) => {
  const { order_id, coat_style, pant_style, vest_style, notes } = req.body;
  if (!order_id) return next(new AppError('order_id is required', 400));

  // ensure order exists
  const order = await Order.findById(order_id);
  if (!order) return next(new AppError('Order not found', 404));

  // prevent duplicate design for same order
  const existing = await Design.findOne({ order_id });
  if (existing) return next(new AppError('Design already exists for this order', 409));

  const design = await Design.create({ order_id, coat_style, pant_style, vest_style, notes });

  await design.populate({
    path: 'order_id',
    select: 'total_price deposit remaining_price appointment_date status design_image_url owner_id',
  });

  res.status(201).json({ status: 'success', data: { design } });
});

const updateDesign = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new AppError('Design id is required', 400));

  const allowed = ['coat_style', 'pant_style', 'vest_style', 'notes'];
  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  }

  if (Object.keys(updates).length === 0) return next(new AppError('No updatable fields provided', 400));

  const design = await Design.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!design) return next(new AppError('Design not found', 404));

  await design.populate({
    path: 'order_id',
    select: 'total_price deposit remaining_price appointment_date status design_image_url owner_id',
  });

  res.status(200).json({ status: 'success', data: { design } });
});

module.exports = { getDesign, createDesign, updateDesign };
