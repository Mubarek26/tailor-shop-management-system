module.exports = {
  '/orders': {
    get: {
      tags: ['Orders'],
      summary: 'List owner orders',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Orders list' } },
    },
  },
  '/orders/create-full': {
    post: {
      tags: ['Orders'],
      summary: 'Create full order with customer, order, measurements and optional image',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateFullOrderJson' },
          },
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/CreateFullOrderMultipart' },
            encoding: {
              customer: { contentType: 'application/json' },
              order: { contentType: 'application/json' },
              measurements: { contentType: 'application/json' },
            },
          },
        },
      },
      responses: { '201': { description: 'Full order created' } },
    },
  },
  '/orders/{id}': {
    put: {
      tags: ['Orders'],
      summary: 'Update order by owner',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateOrderByOwnerJson' },
          },
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/UpdateOrderByOwnerMultipart' },
            encoding: {
              customer: { contentType: 'application/json' },
              order: { contentType: 'application/json' },
              measurements: { contentType: 'application/json' },
            },
          },
        },
      },
      responses: { '200': { description: 'Order updated' }, '404': { description: 'Order not found' } },
    },
    delete: {
      tags: ['Orders'],
      summary: 'Delete order by id',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Order deleted' } },
    },
  },
  '/orders/{id}/status': {
    patch: {
      tags: ['Orders'],
      summary: 'Update order status by owner',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateOrderStatusBody' },
          },
        },
      },
      responses: { '200': { description: 'Order status updated' }, '400': { description: 'Invalid status' }, '404': { description: 'Order not found' } },
    },
  },
  '/orders/{id}/assign-tailor': {
    patch: {
      tags: ['Orders'],
      summary: 'Assign order to tailor by owner',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignOrderToTailorBody' },
          },
        },
      },
      responses: {
        '200': { description: 'Order assigned to tailor successfully' },
        '400': { description: 'Invalid tailor or request body' },
        '403': { description: 'Tailor is not assigned to this owner' },
        '404': { description: 'Order or tailor not found' },
      },
    },
  },
  '/orders/{id}/unassign-tailor': {
    patch: {
      tags: ['Orders'],
      summary: 'Unassign order from tailor by owner',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Order unassigned from tailor successfully' },
        '404': { description: 'Order not found' },
        '401': { description: 'Unauthorized' }
      },
    },
  },
  '/orders/tailor': {
    get: {
      tags: ['Orders'],
      summary: 'Get orders assigned to authenticated tailor (optional owner filter)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'ownerId', in: 'query', required: false, schema: { type: 'string' } },
        { name: 'ownerPhone', in: 'query', required: false, schema: { type: 'string' } },
        { name: 'status', in: 'query', required: false, schema: { type: 'string' } },
      ],
      responses: {
        '200': { description: 'Orders for tailor', content: { 'application/json': { schema: { $ref: '#/components/schemas/TailorOrdersResponse' } } } },
      },
    },
  },
};