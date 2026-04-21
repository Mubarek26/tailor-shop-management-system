const { asyncHandler } = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const Measurement = require('./measurements.model');

const getMeasurements = asyncHandler(async (req, res, next) => {
  const orderId = req.params.orderId;
  if (!orderId) {
    return next(new AppError('orderId is required', 400));
  }

  const measurement = await Measurement.findOne({ order_id: orderId });

  if (!measurement) {
    return next(new AppError('Measurements not found for this order', 404));
  }

  // populate related order and its customer and assigned tailor
  await measurement.populate({
    path: 'order_id',
    select: 'total_price deposit remaining_price appointment_date status design_image_url owner_id',
    populate: [
      { path: 'customer_id', select: 'name phone unique_code' },
      { path: 'assigned_tailor_id', select: 'fullName phoneNumber' },
    ],
  });

  res.status(200).json({ status: 'success', data: { measurement } });
});

const createMeasurements = asyncHandler(async (req, res) => {
  res.status(201).json({ message: 'createMeasurements not implemented' });
});

const updateMeasurements = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new AppError('Measurement id is required', 400));

  // allowed fields for update
  const allowed = [
    'coat_length',
    'coat_waist',
    'coat_chest',
    'coat_shoulder',
    'pant_length',
    'pant_waist',
    'pant_hip',
    'pant_thigh',
    'pant_bottom',
    'vest_length',
    'vest_waist',
    'vest_chest',
  ];

  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      const val = req.body[key];
      // coerce numeric-like strings to numbers, leave null/empty as-is
      updates[key] = val === '' || val === null ? val : Number(val);
      if (Number.isNaN(updates[key])) updates[key] = val;
    }
  }

  if (Object.keys(updates).length === 0) {
    return next(new AppError('No updatable measurement fields provided', 400));
  }

  const measurement = await Measurement.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!measurement) return next(new AppError('Measurement not found', 404));

  // populate the order and nested relations for the response
  await measurement.populate({
    path: 'order_id',
    select: 'total_price deposit remaining_price appointment_date status design_image_url owner_id',
    populate: [
      { path: 'customer_id', select: 'name phone unique_code' },
      { path: 'assigned_tailor_id', select: 'fullName phoneNumber' },
    ],
  });

  res.status(200).json({ status: 'success', data: { measurement } });
});

module.exports = { getMeasurements, createMeasurements, updateMeasurements };
