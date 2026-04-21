const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    assigned_tailor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
        },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    total_price: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    remaining_price: { type: Number, default: 0 },
    design_image_url: { type: String },
    design_image_public_id: { type: String },
    appointment_date: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Order', orderSchema);
