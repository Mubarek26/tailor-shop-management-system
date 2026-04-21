require('dotenv').config();

const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const User = require('../src/modules/users/users.model');

const getEnvOrThrow = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const seed = async () => {
  await mongoose.connect(env.mongoUri);

  const fullName = getEnvOrThrow('SUPERADMIN_NAME');
  const email = getEnvOrThrow('SUPERADMIN_EMAIL').toLowerCase();
  const phoneNumber = getEnvOrThrow('SUPERADMIN_PHONE');
  const password = getEnvOrThrow('SUPERADMIN_PASSWORD');

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Super admin already exists.');
    await mongoose.disconnect();
    return;
  }

  await User.create({
    fullName,
    email,
    phoneNumber,
    password,
    passwordConfirm: password,
    role: 'superadmin',
    active: true,
  });

  console.log('Super admin seeded.');
  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
