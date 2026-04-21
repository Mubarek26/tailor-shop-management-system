module.exports = {
  '/designs/{orderId}': {
    get: {
      tags: ['Designs'],
      summary: 'Get design by order id',
      parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Design found' } },
    },
  },
  '/designs': {
    post: {
      tags: ['Designs'],
      summary: 'Create design',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                order_id: { type: 'string' },
                coat_style: { type: 'string' },
                pant_style: { type: 'string' },
                vest_style: { type: 'string' },
                notes: { type: 'string' }
              },
              required: ['order_id'],
              example: {
                order_id: '644f8a2b9a1f3c5d2e7b1234',
                coat_style: 'Slim',
                pant_style: 'Tapered',
                vest_style: 'Single-breasted',
                notes: 'Use navy thread; add extra button on cuff.'
              }
            }
          }
        }
      },
      responses: { '201': { description: 'Design created' } }
    }
  },
  '/designs/{id}': {
    put: {
      tags: ['Designs'],
      summary: 'Update design by id',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                coat_style: { type: 'string' },
                pant_style: { type: 'string' },
                vest_style: { type: 'string' },
                notes: { type: 'string' }
              },
              example: {
                coat_style: 'Classic',
                pant_style: 'Straight',
                notes: 'Change to black buttons'
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Design updated' } }
    }
  }
};
