const express = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/users.routes');
const customerRoutes = require('../modules/customers/customers.routes');
const orderRoutes = require('../modules/orders/orders.routes');
const measurementRoutes = require('../modules/measurements/measurements.routes');
const designRoutes = require('../modules/designs/designs.routes');
const paymentRoutes = require('../modules/payments/payments.routes');
const taskRoutes = require('../modules/tasks/tasks.routes');
const progressRoutes = require('../modules/progress/progress.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
const searchRoutes = require('../modules/search/search.routes');
const notificationRoutes = require('../modules/notifications/notifications.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/measurements', measurementRoutes);
router.use('/designs', designRoutes);
router.use('/payments', paymentRoutes);
router.use('/tasks', taskRoutes);
router.use('/progress', progressRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/search', searchRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
