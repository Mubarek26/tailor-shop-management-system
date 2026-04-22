module.exports = {
  '/orders': {
    get: {
      tags: ['Orders'],
      summary: 'List orders',
      description: 'Lists orders. An owner will only see their orders. A superadmin can see all orders or filter by `owner_id` query parameter.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'owner_id', in: 'query', required: false, description: 'Filter orders by owner (superadmin only)', schema: { type: 'string' } }],
      responses: { '200': { description: 'Orders list' } },
    },
  },
  '/orders/create-full': {
    post: {
      tags: ['Orders'],
      summary: 'Create full order with customer, order, measurements and optional image',
      description: 'Creates a comprehensive order. If created by an owner, it is automatically assigned to them. If created by a superadmin, they MUST provide an `owner_id` (either in the root body or inside the `order` JSON object).',
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
      summary: 'Update order',
      description: 'Updates an existing order. Owners can only update their own orders. Superadmins can update any order by its ID.',
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
      summary: 'Update order status',
      description: 'Updates the status of an order. Owners and assigned tailors can update their respective orders. Superadmins can update any order status.',
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