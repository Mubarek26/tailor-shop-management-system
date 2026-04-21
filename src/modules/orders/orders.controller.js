const { asyncHandler } = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const Customer = require('../customers/customers.model');
const User = require('../users/users.model');
const Order = require('./orders.model');
const Measurement = require('../measurements/measurements.model');
const { uploadMulterFile } = require('../../utils/cloudinaryUpload');
const cloudinary = require('../../config/cloudinary');

const parseJsonField = (value) => {
  if (!value) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  return value;
};

const getFirstDefined = (obj, keys) => {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }

  return undefined;
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const getSectionFromBody = (body, section) => {
  const directValue = parseJsonField(body[section]);
  if (directValue && typeof directValue === 'object') {
    return directValue;
  }

  const result = {};
  let found = false;

  Object.entries(body).forEach(([key, value]) => {
    if (key.startsWith(`${section}.`)) {
      const nestedKey = key.slice(section.length + 1);
      result[nestedKey] = value;
      found = true;
    }

    if (key.startsWith(`${section}[`) && key.endsWith(']')) {
      const nestedKey = key.slice(section.length + 1).replace(/^\[/, '').replace(/\]$/, '');
      result[nestedKey] = value;
      found = true;
    }
  });

  return found ? result : null;
};

const getCustomerFromTopLevel = (body) => {
  const name = getFirstDefined(body, ['name', 'customer_name', 'customerName']);
  const phone = getFirstDefined(body, ['phone', 'customer_phone', 'customerPhone']);

  if (!name && !phone) {
    return null;
  }

  return { name, phone };
};

const getOrderFromTopLevel = (body) => {
  const total_price = getFirstDefined(body, ['total_price', 'order_total_price', 'orderTotalPrice']);
  const prepayment = getFirstDefined(body, ['prepayment', 'order_prepayment', 'orderPrepayment']);
  const appointment_date = getFirstDefined(body, [
    'appointment_date',
    'order_appointment_date',
    'orderAppointmentDate',
  ]);

  if (!total_price && !prepayment && !appointment_date) {
    return null;
  }

  return { total_price, prepayment, appointment_date };
};

const getMeasurementsFromTopLevel = (body) => {
  const fieldMap = {
    coat_length: ['coat_length', 'measurements_coat_length', 'measurementsCoatLength'],
    coat_waist: ['coat_waist', 'measurements_coat_waist', 'measurementsCoatWaist'],
    coat_chest: ['coat_chest', 'measurements_coat_chest', 'measurementsCoatChest'],
    coat_shoulder: ['coat_shoulder', 'measurements_coat_shoulder', 'measurementsCoatShoulder'],
    pant_length: ['pant_length', 'measurements_pant_length', 'measurementsPantLength'],
    pant_waist: ['pant_waist', 'measurements_pant_waist', 'measurementsPantWaist'],
    pant_hip: ['pant_hip', 'measurements_pant_hip', 'measurementsPantHip'],
    pant_thigh: ['pant_thigh', 'measurements_pant_thigh', 'measurementsPantThigh'],
    pant_bottom: ['pant_bottom', 'measurements_pant_bottom', 'measurementsPantBottom'],
    vest_length: ['vest_length', 'measurements_vest_length', 'measurementsVestLength'],
    vest_waist: ['vest_waist', 'measurements_vest_waist', 'measurementsVestWaist'],
    vest_chest: ['vest_chest', 'measurements_vest_chest', 'measurementsVestChest'],
  };

  const measurements = {};
  let found = false;

  Object.entries(fieldMap).forEach(([targetKey, candidateKeys]) => {
    const value = getFirstDefined(body, candidateKeys);
    if (value !== undefined) {
      measurements[targetKey] = value;
      found = true;
    }
  });

  return found ? measurements : null;
};

const getUploadedImageFile = (req) => {
  if (req.file) {
    return req.file;
  }

  if (!req.files) {
    return null;
  }

  if (Array.isArray(req.files)) {
    return req.files.find((file) => file.mimetype?.startsWith('image/')) || req.files[0] || null;
  }

  return req.files.image?.[0] || req.files.file?.[0] || req.files.designImage?.[0] || null;
};

const getUpdateSections = (body) => {
  return {
    customer: getSectionFromBody(body, 'customer') || getCustomerFromTopLevel(body),
    order: getSectionFromBody(body, 'order') || getOrderFromTopLevel(body),
    measurements: getSectionFromBody(body, 'measurements') || getMeasurementsFromTopLevel(body),
  };
};

const buildMeasurementUpdatePayload = (measurementsRaw) => {
  if (!measurementsRaw) {
    return null;
  }

  const payload = {};
  let hasAnyField = false;

  [
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
  ].forEach((field) => {
    if (measurementsRaw[field] !== undefined) {
      payload[field] = toNumber(measurementsRaw[field]);
      hasAnyField = true;
    }
  });

  return hasAnyField ? payload : null;
};

const listOrders = asyncHandler(async (req, res, next) => {
    // list authenticated owners list
    if (!req.user || req.user.role !== 'owner') {
        return next(new AppError('Unauthorized', 401));
    }

    const orders = await Order.find({ owner_id: req.user._id }).populate('customer_id', 'name phone',).populate('assigned_tailor_id', 'fullName phoneNumber');
    
    res.status(200).json({
        status: 'success',
        data: {
            orders
        }
    });
});

// createOrder removed: orders should be created via /orders/create-full

const updateOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const { customer: customerRaw, order: orderRaw, measurements: measurementsRaw } = getUpdateSections(
    req.body
  );
  const uploadedFile = getUploadedImageFile(req);

  const orderDoc = await Order.findOne({ _id: orderId, owner_id: req.user._id });

  if (!orderDoc) {
    return next(new AppError('Order not found', 404));
  }

  const updateData = {};

  if (orderRaw) {
    if (orderRaw.total_price !== undefined) {
      const totalPrice = toNumber(orderRaw.total_price);
      if (typeof totalPrice !== 'number') {
        return next(new AppError('order.total_price must be a number', 400));
      }
      updateData.total_price = totalPrice;
    }

    if (orderRaw.prepayment !== undefined) {
      const prepayment = toNumber(orderRaw.prepayment);
      if (typeof prepayment !== 'number') {
        return next(new AppError('order.prepayment must be a number', 400));
      }
      updateData.prepayment = prepayment;
    }

    if (orderRaw.appointment_date !== undefined) {
      updateData.appointment_date = orderRaw.appointment_date ? new Date(orderRaw.appointment_date) : undefined;
    }

    if (orderRaw.status !== undefined) {
      if (!['pending', 'in_progress', 'completed'].includes(orderRaw.status)) {
        return next(new AppError('Invalid order status', 400));
      }
      updateData.status = orderRaw.status;
    }
  }

  if (Object.keys(updateData).length > 0) {
    if (updateData.total_price !== undefined || updateData.prepayment !== undefined) {
      const nextTotalPrice = updateData.total_price ?? orderDoc.total_price;
      const nextPrepayment = updateData.prepayment ?? orderDoc.prepayment;
      updateData.remaining_price = nextTotalPrice - nextPrepayment;
    }

    if (uploadedFile) {
      const uploadedImage = await uploadMulterFile(uploadedFile, { folder: 'orders' });
      updateData.design_image_url = uploadedImage?.secure_url;
      updateData.design_image_public_id = uploadedImage?.public_id;
    }

    Object.assign(orderDoc, updateData);
    await orderDoc.save();
  } else if (uploadedFile) {
    const uploadedImage = await uploadMulterFile(uploadedFile, { folder: 'orders' });
    orderDoc.design_image_url = uploadedImage?.secure_url;
    orderDoc.design_image_public_id = uploadedImage?.public_id;
    await orderDoc.save();
  }

  let customerDoc = await Customer.findById(orderDoc.customer_id);
  if (customerDoc && customerRaw) {
    if (customerRaw.name !== undefined) {
      customerDoc.name = customerRaw.name;
    }

    if (customerRaw.phone !== undefined) {
      customerDoc.phone = customerRaw.phone;
    }

    await customerDoc.save();
  }

  let measurementDoc = await Measurement.findOne({ order_id: orderDoc._id });
  if (measurementsRaw) {
    const measurementUpdate = buildMeasurementUpdatePayload(measurementsRaw);

    if (measurementDoc && measurementUpdate) {
      Object.assign(measurementDoc, measurementUpdate);
      await measurementDoc.save();
    } else if (!measurementDoc && measurementUpdate) {
      measurementDoc = await Measurement.create({
        order_id: orderDoc._id,
        ...measurementUpdate,
      });
    }
  }

  const updatedOrder = await Order.findById(orderDoc._id)
    .populate('customer_id', 'name phone')
    .populate('assigned_tailor_id', 'fullName phoneNumber');

  res.status(200).json({
    status: 'success',
    data: {
      customer: customerDoc,
      order: updatedOrder,
      measurements: measurementDoc,
    },
  });
});

const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'in_progress', 'completed'];

  if (!status || !allowedStatuses.includes(status)) {
    return next(new AppError('status must be one of: pending, in_progress, completed', 400));
  }

  const orderDoc = await Order.findOneAndUpdate(
    { _id: req.params.id, owner_id: req.user._id },
    { status },
    { new: true, runValidators: true }
  ).populate('customer_id', 'name phone').populate('assigned_tailor_id', 'fullName phoneNumber');

  if (!orderDoc) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: orderDoc,
    },
  });
});

const assignOrderToTailor = asyncHandler(async (req, res, next) => {
  const { tailorId, tailorPhone } = req.body;

  if (!tailorId && !tailorPhone) {
    return next(new AppError('tailorId or tailorPhone is required', 400));
  }

  const orderDoc = await Order.findOne({ _id: req.params.id, owner_id: req.user._id });

  if (!orderDoc) {
    return next(new AppError('Order not found', 404));
  }

  let tailorDoc = null;

  if (tailorId) {
    tailorDoc = await User.findById(tailorId);
  } else if (tailorPhone) {
    tailorDoc = await User.findOne({ phoneNumber: tailorPhone, role: 'tailor' });
  }

  if (!tailorDoc) {
    return next(new AppError('Tailor not found', 404));
  }

  if (tailorDoc.role !== 'tailor') {
    return next(new AppError('The selected user is not a tailor', 400));
  }

  const ownerAllowed = Array.isArray(tailorDoc.owners)
    ? tailorDoc.owners.some((ownerId) => ownerId.toString() === req.user._id.toString())
    : false;

  if (!ownerAllowed) {
    return next(new AppError('This tailor is not assigned to this owner', 403));
  }

  orderDoc.assigned_tailor_id = tailorDoc._id;
  await orderDoc.save();

  const updatedOrder = await Order.findById(orderDoc._id)
    .populate('customer_id', 'name phone')
    .populate('assigned_tailor_id', 'fullName phoneNumber');

  res.status(200).json({
    status: 'success',
    message: 'Order assigned to tailor successfully',
    data: {
      order: updatedOrder,
      tailor: tailorDoc,
    },
  });
});

const unassignOrder = asyncHandler(async (req, res, next) => {
  const orderDoc = await Order.findOne({ _id: req.params.id, owner_id: req.user._id });

  if (!orderDoc) {
    return next(new AppError('Order not found', 404));
  }

  orderDoc.assigned_tailor_id = null;
  await orderDoc.save();

  const updatedOrder = await Order.findById(orderDoc._id)
    .populate('customer_id', 'name phone')
    .populate('assigned_tailor_id', 'fullName phoneNumber');

  res.status(200).json({
    status: 'success',
    message: 'Order unassigned from tailor',
    data: { order: updatedOrder },
  });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const orderDoc = await Order.findOne({ _id: req.params.id, owner_id: req.user._id });

  if (!orderDoc) {
    throw new AppError('Order not found', 404);
  }

  await Measurement.deleteOne({ order_id: orderDoc._id });

  if (orderDoc.design_image_public_id) {
    await cloudinary.uploader.destroy(orderDoc.design_image_public_id).catch(() => null);
  }

  await Order.deleteOne({ _id: orderDoc._id });

  res.status(200).json({
    status: 'success',
    message: 'Order deleted successfully',
    data: {
      orderId: orderDoc._id,
    },
  });
});

const createFullOrder = asyncHandler(async (req, res, next) => {
  const customer = getSectionFromBody(req.body, 'customer') || getCustomerFromTopLevel(req.body);
  const orderRaw = getSectionFromBody(req.body, 'order') || getOrderFromTopLevel(req.body);
  const measurementsRaw =
    getSectionFromBody(req.body, 'measurements') || getMeasurementsFromTopLevel(req.body);
 
  if (!customer || !orderRaw || !measurementsRaw) {
    return next(new AppError('customer, order, and measurements are required', 400));
  }

  const order = {
    ...orderRaw,
    total_price: toNumber(orderRaw.total_price),
    prepayment: toNumber(orderRaw.prepayment),
  };

  const measurements = {
    coat_length: toNumber(measurementsRaw.coat_length),
    coat_waist: toNumber(measurementsRaw.coat_waist),
    coat_chest: toNumber(measurementsRaw.coat_chest),
    coat_shoulder: toNumber(measurementsRaw.coat_shoulder),
    pant_length: toNumber(measurementsRaw.pant_length),
    pant_waist: toNumber(measurementsRaw.pant_waist),
    pant_hip: toNumber(measurementsRaw.pant_hip),
    pant_thigh: toNumber(measurementsRaw.pant_thigh),
    pant_bottom: toNumber(measurementsRaw.pant_bottom),
    vest_length: toNumber(measurementsRaw.vest_length),
    vest_waist: toNumber(measurementsRaw.vest_waist),
    vest_chest: toNumber(measurementsRaw.vest_chest),
  };

  if (!customer.name || !customer.phone) {
    return next(new AppError('customer.name and customer.phone are required', 400));
  }

  if (typeof order.total_price !== 'number') {
    return next(new AppError('order.total_price must be a number', 400));
  }

  const prepayment = typeof order.prepayment === 'number' ? order.prepayment : 0;
  const remainingPrice = order.total_price - prepayment;

  let designImageUrl;
  let designImagePublicId;
  const uploadedFile = getUploadedImageFile(req);

  if (uploadedFile) {
    const uploadedImage = await uploadMulterFile(uploadedFile, { folder: 'orders' });
    designImageUrl = uploadedImage?.secure_url;
    designImagePublicId = uploadedImage?.public_id;
  }

  let customerDoc = await Customer.findOne({ phone: customer.phone });
  if (!customerDoc) {
    customerDoc = await Customer.create({
      name: customer.name,
      phone: customer.phone,
    });
  }

  const orderDoc = await Order.create({
    customer_id: customerDoc._id,
    owner_id: req.user._id,
    total_price: order.total_price,
    prepayment,
    remaining_price: remainingPrice,
    appointment_date: order.appointment_date ? new Date(order.appointment_date) : undefined,
    status: 'pending',
    design_image_url: designImageUrl,
    design_image_public_id: designImagePublicId,
  });

  const measurementDoc = await Measurement.create({
    order_id: orderDoc._id,
    coat_length: measurements.coat_length,
    coat_waist: measurements.coat_waist,
    coat_chest: measurements.coat_chest,
    coat_shoulder: measurements.coat_shoulder,
    pant_length: measurements.pant_length,
    pant_waist: measurements.pant_waist,
    pant_hip: measurements.pant_hip,
    pant_thigh: measurements.pant_thigh,
    pant_bottom: measurements.pant_bottom,
    vest_length: measurements.vest_length,
    vest_waist: measurements.vest_waist,
    vest_chest: measurements.vest_chest,
  });

  res.status(201).json({
    status: 'success',
    data: {
      customer: customerDoc,
      order: orderDoc,
      measurements: measurementDoc,
    },
  });
});

const listTailorOrders = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'tailor') {
    return next(new AppError('Unauthorized', 401));
  }

  const tailorId = req.user._id;
  const { ownerId, ownerPhone, status } = req.query;

  const filter = { assigned_tailor_id: tailorId };

  if (ownerId) {
    filter.owner_id = ownerId;
  }

  if (ownerPhone) {
    const ownerDoc = await User.findOne({ phoneNumber: ownerPhone, role: 'owner' });
    if (!ownerDoc) {
      return next(new AppError('Owner not found', 404));
    }
    filter.owner_id = ownerDoc._id;
  }

  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate('customer_id', 'name phone')
    .populate('assigned_tailor_id', 'fullName phoneNumber');

  res.status(200).json({
    status: 'success',
    data: { orders },
  });
});

module.exports = {
  listOrders,
  updateOrder,
  updateOrderStatus,
  assignOrderToTailor,
  unassignOrder,
  deleteOrder,
  createFullOrder,
  listTailorOrders,
};

