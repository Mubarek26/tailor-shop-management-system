const baseSpec = require('./base');
const authPaths = require('./paths/auth.swagger');
const usersPaths = require('./paths/users.swagger');
const customersPaths = require('./paths/customers.swagger');
const ordersPaths = require('./paths/orders.swagger');
const measurementsPaths = require('./paths/measurements.swagger');
const designsPaths = require('./paths/designs.swagger');
const paymentsPaths = require('./paths/payments.swagger');
const progressPaths = require('./paths/progress.swagger');
const analyticsPaths = require('./paths/analytics.swagger');
const searchPaths = require('./paths/search.swagger');
const notificationsPaths = require('./paths/notifications.swagger');

module.exports = {
  ...baseSpec,
  paths: {
    ...authPaths,
    ...usersPaths,
    ...customersPaths,
    ...ordersPaths,
    ...measurementsPaths,
    ...designsPaths,
    ...paymentsPaths,
    ...progressPaths,
    ...analyticsPaths,
    ...searchPaths,
    ...notificationsPaths,
  },
};
