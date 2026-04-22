const { asyncHandler } = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const Order = require('../orders/orders.model');
const Customer = require('./customers.model');
const Measurement = require('../measurements/measurements.model');

const listCustomers = asyncHandler(async (req, res, next) => {
  const isSuperadmin = req.user && req.user.role === 'superadmin';
  if (!req.user || (req.user.role !== 'owner' && !isSuperadmin)) {
    return next(new AppError('Unauthorized', 401));
  }

  const { phone, name, owner_id } = req.query;

  let filter = {};

  if (!isSuperadmin) {
    const ownerId = req.user._id;
    const customerIds = await Order.find({ owner_id: ownerId }).distinct('customer_id');
    filter = { _id: { $in: customerIds } };
  } else if (owner_id) {
    const customerIds = await Order.find({ owner_id: owner_id }).distinct('customer_id');
    filter = { _id: { $in: customerIds } };
  }

  if (phone) filter.phone = phone;
  if (name) filter.name = { $regex: name, $options: 'i' };

  const customers = await Customer.find(filter).select('name phone unique_code created_at updated_at');

  res.status(200).json({
    status: 'success',
    results: customers.length,
    data: { customers },
  });
});

const getCustomerOrders = asyncHandler(async (req, res, next) => {
  const isSuperadmin = req.user && req.user.role === 'superadmin';
  if (!req.user || (req.user.role !== 'owner' && !isSuperadmin)) {
    return next(new AppError('Unauthorized', 401));
  }

  const customerId = req.params.id;
  if (!customerId) {
    return next(new AppError('customer id is required', 400));
  }

  const query = { customer_id: customerId };
  if (!isSuperadmin) {
    query.owner_id = req.user._id;
  }

  // Ensure this owner has orders for this customer (if not superadmin)
  const orders = await Order.find(query)
    .populate('customer_id', 'name phone unique_code')
    .populate('assigned_tailor_id', 'fullName phoneNumber');

  const orderIds = orders.map((o) => o._id);

  const measurements = await Measurement.find({ order_id: { $in: orderIds } });
  const measurementsMap = measurements.reduce((acc, m) => {
    acc[m.order_id.toString()] = m;
    return acc;
  }, {});

  const result = orders.map((o) => ({ order: o, measurements: measurementsMap[o._id.toString()] || null }));

  res.status(200).json({ status: 'success', results: result.length, data: { customerOrders: result } });
});

// createCustomer removed: customers are created implicitly when a full order is created

const updateCustomer = asyncHandler(async (req, res, next) => {
  const isSuperadmin = req.user && req.user.role === 'superadmin';
  if (!req.user || (req.user.role !== 'owner' && !isSuperadmin)) {
    return next(new AppError('Unauthorized', 401));
  }

  const customerId = req.params.id;
  if (!customerId) {
    return next(new AppError('Customer id is required', 400));
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }

  const { name, phone } = req.body;
  let modified = false;
  if (name !== undefined) {
    customer.name = name;
    modified = true;
  }
  if (phone !== undefined) {
    customer.phone = phone;
    modified = true;
  }

  if (modified) await customer.save();

  res.status(200).json({ status: 'success', data: { customer } });
});

const deleteCustomer = asyncHandler(async (req, res, next) => {
  const isSuperadmin = req.user && req.user.role === 'superadmin';
  if (!req.user || (req.user.role !== 'owner' && !isSuperadmin)) {
    return next(new AppError('Unauthorized', 401));
  }

  const customerId = req.params.id;
  if (!customerId) {
    return next(new AppError('Customer id is required', 400));
  }

  // Prevent deletion if any orders reference this customer
  const existingOrders = await Order.findOne({ customer_id: customerId });
  if (existingOrders) {
    return next(new AppError('Cannot delete customer with existing orders', 400));
  }

  const deleted = await Customer.findByIdAndDelete(customerId);
  if (!deleted) {
    return next(new AppError('Customer not found', 404));
  }

  res.status(200).json({ status: 'success', message: 'Customer deleted' });
});

module.exports = {
  listCustomers,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
};
