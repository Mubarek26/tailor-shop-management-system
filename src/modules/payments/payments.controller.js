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

  const currentDeposit = Number(order.deposit || 0);
  const currentTotal = Number(order.total_price || 0);
  const paymentAmount = Number(amount);

  let newDeposit, newRemaining;

  if (payment_type === 'full') {
    newDeposit = currentTotal;
    newRemaining = 0;
  } else {
    newDeposit = currentDeposit + paymentAmount;
    newRemaining = Math.max(0, currentTotal - newDeposit);
  }

  // Update order using findOneAndUpdate to ensure atomic update and avoid document state issues
  const updatedOrder = await Order.findByIdAndUpdate(
    order_id,
    { deposit: newDeposit, remaining_price: newRemaining },
    { new: true, runValidators: true }
  );

  if (!updatedOrder) return next(new AppError('Failed to update order balance', 500));

  const paymentObj = paymentDoc.history[paymentDoc.history.length - 1].toObject();
  paymentObj.order_id = getPopulatedOrder(updatedOrder);

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

  const currentTotal = Number(order.total_price || 0);
  const oldAmount = Number(historyItem.amount || 0);
  const newAmount = amount !== undefined ? Number(amount) : oldAmount;
  const isFull = payment_type === 'full';

  let nextDeposit;
  if (isFull) {
    nextDeposit = currentTotal;
  } else {
    const delta = newAmount - oldAmount;
    nextDeposit = Number(order.deposit || 0) + delta;
  }
  
  const nextRemaining = Math.max(0, currentTotal - nextDeposit);

  // Update order balance
  const updatedOrder = await Order.findByIdAndUpdate(
    order._id,
    { deposit: nextDeposit, remaining_price: nextRemaining },
    { new: true, runValidators: true }
  );

  if (amount != null) historyItem.amount = Number(amount);
  if (payment_type) historyItem.payment_type = payment_type;
  if (payment_date) historyItem.payment_date = payment_date;

  await paymentDoc.save();

  const paymentObj = historyItem.toObject();
  paymentObj.order_id = getPopulatedOrder(updatedOrder);

  res.status(200).json({ status: 'success', data: { payment: paymentObj } });
});

module.exports = { getPayment, createPayment, updatePayment };
