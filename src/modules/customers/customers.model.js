const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    unique_code: { type: Number, unique: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

customerSchema.pre('save', async function (next) {
  if (this.unique_code) {
    return next();
  }

  const counter = await Counter.findOneAndUpdate(
    { name: 'customer_unique_code' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.unique_code = counter.seq;
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
