const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: { type: Number, required: true },
    payment_type: {
      type: String,
      enum: ['deposit', 'full'],
      required: true,
    },
    payment_date: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('Payment', paymentSchema);
