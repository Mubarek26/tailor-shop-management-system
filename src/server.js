const app = require('./app');
const { connectDb } = require('./config/db');
const { env } = require('./config/env');
const { initOrdersJobs } = require('./modules/orders/orders.jobs');

const start = async () => {
  await connectDb();
  
  // Initialize background jobs
  initOrdersJobs();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start();
