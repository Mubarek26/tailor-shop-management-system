const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    coat_length: { type: Number },
    coat_waist: { type: Number },
    coat_chest: { type: Number },
    coat_shoulder: { type: Number },
    pant_length: { type: Number },
    pant_waist: { type: Number },
    pant_hip: { type: Number },
    pant_thigh: { type: Number },
    pant_bottom: { type: Number },
    vest_length: { type: Number },
    vest_waist: { type: Number },
    vest_chest: { type: Number },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Measurement', measurementSchema);
