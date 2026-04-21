require('dotenv').config();

const env = {
  port: process.env.PORT || 4000,
  mongoUri:
    process.env.MONGO_URI ||
    process.env.MONGO_DEV_URI ||
    'mongodb://localhost:27017/tailor_shop',
};

module.exports = { env };
