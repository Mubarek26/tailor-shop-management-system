const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
