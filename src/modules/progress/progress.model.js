const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', progressSchema);
