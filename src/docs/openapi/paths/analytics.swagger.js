module.exports = {
  '/analytics/summary': {
    get: {
      tags: ['Analytics'],
      summary: 'Get dashboard summary data',
      description: 'Provides a single, high-level snapshot of shop analytics for dashboard KPI cards. It simultaneously queries the database to calculate total orders, financial quotes (total revenue, total deposit, total remaining), a breakdown of order statuses, and actual money collected (total paid). If a superadmin provides an `owner_id` query parameter, it filters data specifically for that owner.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'owner_id',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by shop owner ID (Superadmin only)',
        },
      ],
      responses: {
        200: {
          description: 'Summary data retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: {
                    type: 'object',
                    properties: {
                      total_orders: { type: 'number', example: 42 },
                      orders_status: {
                        type: 'object',
                        properties: {
                          pending: { type: 'number', example: 10 },
                          in_progress: { type: 'number', example: 20 },
                          completed: { type: 'number', example: 12 },
                        },
                      },
                      total_revenue: { type: 'number', example: 150000 },
                      total_deposit: { type: 'number', example: 60000 },
                      total_remaining: { type: 'number', example: 90000 },
                      total_paid: { type: 'number', example: 75000 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/analytics/revenue': {
    get: {
      tags: ['Analytics'],
      summary: 'Get time-series revenue data',
      description: 'Provides time-series revenue data aggregated from actual payments. The data is grouped by `day`, `week`, or `month`. It splits the amounts into `deposit` vs `full` payments and returns the distinct count of orders that generated revenue in each period. A superadmin can filter by `owner_id`.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'groupBy',
          in: 'query',
          schema: { type: 'string', enum: ['day', 'week', 'month'], default: 'day' },
          description: 'Time bucket size for grouping revenue',
        },
        {
          name: 'from',
          in: 'query',
          schema: { type: 'string', format: 'date' },
          description: 'Start date for filtering payments (inclusive)',
        },
        {
          name: 'to',
          in: 'query',
          schema: { type: 'string', format: 'date' },
          description: 'End date for filtering payments (inclusive)',
        },
        {
          name: 'owner_id',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by shop owner ID (Superadmin only)',
        },
      ],
      responses: {
        200: {
          description: 'Revenue time-series retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: {
                    type: 'object',
                    properties: {
                      groupBy: { type: 'string', example: 'month' },
                      series: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            period: { type: 'string', example: '2026-03' },
                            paid_total: { type: 'number', example: 50000 },
                            deposit_total: { type: 'number', example: 20000 },
                            full_total: { type: 'number', example: 30000 },
                            orders_count: { type: 'number', example: 8 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/analytics/orders-status': {
    get: {
      tags: ['Analytics'],
      summary: 'Get lightweight order status breakdown',
      description: 'Provides a simple count of orders categorized by their status (`pending`, `in_progress`, `completed`). Supports filtering by date range (when the order was created). A superadmin can filter by `owner_id`.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'from',
          in: 'query',
          schema: { type: 'string', format: 'date' },
          description: 'Filter orders created after this date (inclusive)',
        },
        {
          name: 'to',
          in: 'query',
          schema: { type: 'string', format: 'date' },
          description: 'Filter orders created before this date (inclusive)',
        },
        {
          name: 'owner_id',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by shop owner ID (Superadmin only)',
        },
      ],
      responses: {
        200: {
          description: 'Status data retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: {
                    type: 'object',
                    properties: {
                      total_orders: { type: 'number', example: 42 },
                      orders_status: {
                        type: 'object',
                        properties: {
                          pending: { type: 'number', example: 10 },
                          in_progress: { type: 'number', example: 20 },
                          completed: { type: 'number', example: 12 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
