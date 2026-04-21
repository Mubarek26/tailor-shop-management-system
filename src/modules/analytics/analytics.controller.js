const { asyncHandler } = require('../../utils/asyncHandler');
const Order = require('../orders/orders.model');
const Payment = require('../payments/payments.model');

const parseDateRange = (query) => {
  const range = {};

  if (query.from) {
    const from = new Date(query.from);
    if (!Number.isNaN(from.getTime())) {
      range.$gte = from;
    }
  }

  if (query.to) {
    const to = new Date(query.to);
    if (!Number.isNaN(to.getTime())) {
      range.$lte = to;
    }
  }

  return Object.keys(range).length ? range : null;
};

const getGroupByDateFormat = (groupBy) => {
  if (groupBy === 'week') {
    return '%G-W%V';
  }

  if (groupBy === 'month') {
    return '%Y-%m';
  }

  return '%Y-%m-%d';
};

const getSummary = asyncHandler(async (req, res) => {
  const isSuperadmin = req.user.role === 'superadmin';
  const orderFilter = isSuperadmin ? {} : { owner_id: req.user._id };
  const paymentOwnerFilter = isSuperadmin ? {} : { 'order.owner_id': req.user._id };

  const [totalOrders, ordersTotalsRows, statusRows, paidRows] = await Promise.all([
    Order.countDocuments(orderFilter),
    Order.aggregate([
      { $match: orderFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_price' },
          totalDeposit: { $sum: '$deposit' },
          totalRemaining: { $sum: '$remaining_price' },
        },
      },
    ]),
    Order.aggregate([
      { $match: orderFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'order_id',
          foreignField: '_id',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      { $match: paymentOwnerFilter },
      {
        $group: {
          _id: null,
          paidTotal: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const orderTotals = ordersTotalsRows[0] || {
    totalRevenue: 0,
    totalDeposit: 0,
    totalRemaining: 0,
  };

  const status = {
    pending: 0,
    in_progress: 0,
    completed: 0,
  };

  statusRows.forEach((row) => {
    if (status[row._id] !== undefined) {
      status[row._id] = row.count;
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      total_orders: totalOrders,
      orders_status: status,
      total_revenue: orderTotals.totalRevenue,
      total_deposit: orderTotals.totalDeposit,
      total_remaining: orderTotals.totalRemaining,
      total_paid: paidRows[0]?.paidTotal || 0,
    },
  });
});

const getRevenue = asyncHandler(async (req, res) => {
  const isSuperadmin = req.user.role === 'superadmin';
  const groupBy = req.query.groupBy || 'day';

  const allowedGroupBy = ['day', 'week', 'month'];
  if (!allowedGroupBy.includes(groupBy)) {
    return res.status(400).json({
      status: 'fail',
      message: 'groupBy must be one of: day, week, month',
    });
  }

  const dateRange = parseDateRange(req.query);
  const paymentMatch = {};

  if (dateRange) {
    paymentMatch.payment_date = dateRange;
  }

  const format = getGroupByDateFormat(groupBy);
  const ownerMatch = isSuperadmin ? {} : { 'order.owner_id': req.user._id };

  const rows = await Payment.aggregate([
    { $match: paymentMatch },
    {
      $lookup: {
        from: 'orders',
        localField: 'order_id',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: '$order' },
    { $match: ownerMatch },
    {
      $group: {
        _id: {
          period: {
            $dateToString: {
              format,
              date: '$payment_date',
            },
          },
        },
        paid_total: { $sum: '$amount' },
        deposit_total: {
          $sum: {
            $cond: [{ $eq: ['$payment_type', 'deposit'] }, '$amount', 0],
          },
        },
        full_total: {
          $sum: {
            $cond: [{ $eq: ['$payment_type', 'full'] }, '$amount', 0],
          },
        },
        order_ids: { $addToSet: '$order_id' },
      },
    },
    {
      $project: {
        _id: 0,
        period: '$_id.period',
        paid_total: 1,
        deposit_total: 1,
        full_total: 1,
        orders_count: { $size: '$order_ids' },
      },
    },
    { $sort: { period: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      groupBy,
      series: rows,
    },
  });
});

const getOrdersStatus = asyncHandler(async (req, res) => {
  const isSuperadmin = req.user.role === 'superadmin';
  const dateRange = parseDateRange(req.query);

  const filter = isSuperadmin ? {} : { owner_id: req.user._id };
  if (dateRange) {
    filter.created_at = dateRange;
  }

  const rows = await Order.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const status = {
    pending: 0,
    in_progress: 0,
    completed: 0,
  };

  rows.forEach((row) => {
    if (status[row._id] !== undefined) {
      status[row._id] = row.count;
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      total_orders: rows.reduce((sum, row) => sum + row.count, 0),
      orders_status: status,
    },
  });
});

module.exports = { getSummary, getRevenue, getOrdersStatus };
