const { asyncHandler } = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const Payment = require('./payments.model');
const Order = require('../orders/orders.model');

const getPopulatedOrder = (order) => ({
  _id: order._id,
  total_price: order.total_price,
  deposit: order.deposit,
  remaining_price: order.remaining_price,
  appointment_date: order.appointment_date,
  status: order.status,
});

const getPayment = asyncHandler(async (req, res, next) => {
  const orderId = req.params.orderId;
  if (!orderId) return next(new AppError('orderId is required', 400));

  const paymentDoc = await Payment.findOne({ order_id: orderId });
  const payments = paymentDoc ? paymentDoc.history : [];
  
  // Sort by date descending to match previous behavior
  payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

  return res.status(200).json({ status: 'success', results: payments.length, data: { payments } });
});

const createPayment = asyncHandler(async (req, res, next) => {
  const { order_id, amount, payment_type, payment_date } = req.body;
  if (!order_id || amount == null || !payment_type) {
    return next(new AppError('order_id, amount and payment_type are required', 400));
  }

  const order = await Order.findById(order_id);
  if (!order) return next(new AppError('Order not found', 404));

  let paymentDoc = await Payment.findOne({ order_id });
  if (!paymentDoc) {
    paymentDoc = new Payment({ order_id, history: [] });
  }

  const newHistoryItem = {
    amount: Number(amount),
    payment_type,
    payment_date: payment_date || new Date(),
  };

  paymentDoc.history.push(newHistoryItem);
  await paymentDoc.save();

  if (payment_type === 'full') {
    order.deposit = order.total_price;
    order.remaining_price = 0;
  } else {
    order.deposit = (order.deposit || 0) + Number(amount);
    const rem = (order.total_price || 0) - order.deposit;
    order.remaining_price = rem > 0 ? rem : 0;
  }

  await order.save();

  const paymentObj = paymentDoc.history[paymentDoc.history.length - 1].toObject();
  paymentObj.order_id = getPopulatedOrder(order);

  res.status(201).json({ status: 'success', data: { payment: paymentObj } });
});

const updatePayment = asyncHandler(async (req, res, next) => {
  const id = req.params.id; // This is the history _id
  if (!id) return next(new AppError('Payment id is required', 400));

  const paymentDoc = await Payment.findOne({ 'history._id': id });
  if (!paymentDoc) return next(new AppError('Payment not found', 404));

  const historyItem = paymentDoc.history.id(id);
  const { amount, payment_type, payment_date } = req.body;

  const order = await Order.findById(paymentDoc.order_id);
  if (!order) return next(new AppError('Related order not found', 404));

  if (amount != null) {
    const delta = Number(amount) - Number(historyItem.amount || 0);
    if (payment_type === 'full') {
      order.deposit = order.total_price;
      order.remaining_price = 0;
    } else {
      order.deposit = (order.deposit || 0) + delta;
      const rem = (order.total_price || 0) - order.deposit;
      order.remaining_price = rem > 0 ? rem : 0;
    }
  } else if (payment_type === 'full' && historyItem.payment_type !== 'full') {
    order.deposit = order.total_price;
    order.remaining_price = 0;
  }

  if (amount != null) historyItem.amount = Number(amount);
  if (payment_type) historyItem.payment_type = payment_type;
  if (payment_date) historyItem.payment_date = payment_date;

  await paymentDoc.save();
  await order.save();

  const paymentObj = historyItem.toObject();
  paymentObj.order_id = getPopulatedOrder(order);

  res.status(200).json({ status: 'success', data: { payment: paymentObj } });
});

module.exports = { getPayment, createPayment, updatePayment };
