require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  STRIPE_KEY: process.env.STRIPE_KEY,
  MONGODB_URL: process.env.MONGODB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};