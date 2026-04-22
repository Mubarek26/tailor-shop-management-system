module.exports = {
  '/payments/{orderId}': {
    get: {
      tags: ['Payments'],
      summary: 'Get payment history by order id',
      description: 'Returns the payment history array for a specific order. The system maintains a single Payment document per order containing a timeline of all transactions.',
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
                            _id: { type: 'string', description: 'ID of this specific transaction in the history' },
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
      summary: 'Create payment (Add to history)',
      description: 'Records a new payment for an order. If a payment document exists for the order, it pushes to the history array. If not, it creates the root document and the first history entry.',
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
      summary: 'Update a specific payment transaction by its history ID',
      description: 'Updates a specific transaction in the payment history array. The {id} parameter MUST be the `_id` of the history entry (the transaction), not the root Payment document or the Order document. It recalculates the order deposits automatically.',
      parameters: [{ name: 'id', in: 'path', required: true, description: 'The _id of the specific history transaction item to update', schema: { type: 'string' } }],
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
