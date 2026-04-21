const mongoose = require('mongoose');

const authSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'tailor'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Auth', authSchema);
