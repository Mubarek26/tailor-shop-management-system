module.exports = {
  '/progress/{orderId}': {
    get: {
      tags: ['Progress'],
      summary: 'Get progress by order id',
      parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Progress found' } },
    },
  },
  '/progress/{id}': {
    put: {
      tags: ['Progress'],
      summary: 'Update progress by id',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { type: 'object' } },
        },
      },
      responses: { '200': { description: 'Progress updated' } },
    },
  },
};
