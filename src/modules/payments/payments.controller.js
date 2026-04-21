const { asyncHandler } = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const Payment = require('./payments.model');
const Order = require('../orders/orders.model');

const getPayment = asyncHandler(async (req, res, next) => {
  const orderId = req.params.orderId;
  if (!orderId) return next(new AppError('orderId is required', 400));

  const payments = await Payment.find({ order_id: orderId }).sort({ payment_date: -1 });
  return res.status(200).json({ status: 'success', results: payments.length, data: { payments } });
});

const createPayment = asyncHandler(async (req, res, next) => {
  const { order_id, amount, payment_type, payment_date } = req.body;
  if (!order_id || amount == null || !payment_type) return next(new AppError('order_id, amount and payment_type are required', 400));

  const order = await Order.findById(order_id);
  if (!order) return next(new AppError('Order not found', 404));

  // create payment
  const payment = await Payment.create({ order_id, amount: Number(amount), payment_type, payment_date });

  // adjust order deposit and remaining_price
  if (payment_type === 'full') {
    order.deposit = order.total_price;
    order.remaining_price = 0;
  } else {
    order.deposit = (order.deposit || 0) + Number(amount);
    const rem = (order.total_price || 0) - order.deposit;
    order.remaining_price = rem > 0 ? rem : 0;
  }

  await order.save();

  await payment.populate({ path: 'order_id', select: 'total_price deposit remaining_price appointment_date status' });

  res.status(201).json({ status: 'success', data: { payment } });
});

const updatePayment = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new AppError('Payment id is required', 400));

  const payment = await Payment.findById(id);
  if (!payment) return next(new AppError('Payment not found', 404));

  const { amount, payment_type, payment_date } = req.body;

  // if amount changes, adjust order accordingly
  const order = await Order.findById(payment.order_id);
  if (!order) return next(new AppError('Related order not found', 404));

    if (amount != null) {
    const delta = Number(amount) - Number(payment.amount || 0);
    // if payment_type is changed to 'full', prefer full semantics after update
    if (payment_type === 'full') {
      order.deposit = order.total_price;
      order.remaining_price = 0;
    } else {
      order.deposit = (order.deposit || 0) + delta;
      const rem = (order.total_price || 0) - order.deposit;
      order.remaining_price = rem > 0 ? rem : 0;
    }
  } else if (payment_type === 'full' && payment.payment_type !== 'full') {
    // marking this payment as full now
    order.deposit = order.total_price;
    order.remaining_price = 0;
  }

  // apply updates to payment
  if (amount != null) payment.amount = Number(amount);
  if (payment_type) payment.payment_type = payment_type;
  if (payment_date) payment.payment_date = payment_date;

  await payment.save();
  await order.save();

  await payment.populate({ path: 'order_id', select: 'total_price deposit remaining_price appointment_date status' });

  res.status(200).json({ status: 'success', data: { payment } });
});

module.exports = { getPayment, createPayment, updatePayment };
