const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    coat_style: { type: String },
    pant_style: { type: String },
    vest_style: { type: String },
    notes: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Design', designSchema);
