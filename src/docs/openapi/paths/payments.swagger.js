module.exports = {
  '/payments/{orderId}': {
    get: {
      tags: ['Payments'],
      summary: 'Get payment by order id',
      parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': {
          description: 'Payments found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  results: { type: 'number' },
                  data: {
                    type: 'object',
                    properties: {
                      payments: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            order_id: { type: 'string' },
                            amount: { type: 'number' },
                            payment_type: { type: 'string', enum: ['deposit', 'full'] },
                            payment_date: { type: 'string', format: 'date-time' },
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
  '/payments': {
    post: {
      tags: ['Payments'],
      summary: 'Create payment',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                order_id: { type: 'string' },
                amount: { type: 'number' },
                payment_type: { type: 'string', enum: ['deposit', 'full'] },
                payment_date: { type: 'string', format: 'date-time' }
              },
              required: ['order_id', 'amount', 'payment_type'],
              example: {
                order_id: '644f8a2b9a1f3c5d2e7b1234',
                amount: 2000,
                payment_type: 'deposit',
                payment_date: '2026-04-21T10:00:00Z'
              }
            }
          }
        }
      },
      responses: { '201': { description: 'Payment created' } },
    },
  },
  '/payments/{id}': {
    put: {
      tags: ['Payments'],
      summary: 'Update payment by id',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                amount: { type: 'number' },
                payment_type: { type: 'string', enum: ['deposit', 'full'] },
                payment_date: { type: 'string', format: 'date-time' },
              },
              example: {
                amount: 2500,
                payment_type: 'full',
                payment_date: '2026-04-22T12:00:00Z'
              }
            }
          }
        }
        },
      responses: {
        '200': {
          description: 'Payment updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: { type: 'object', properties: { payment: { type: 'object' } } },
                },
              },
            },
          },
        },
      },
    },
  },
};
