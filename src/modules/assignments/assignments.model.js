const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    tailor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assigned_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
