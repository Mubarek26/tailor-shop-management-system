module.exports = {
  '/customers': {
    get: {
      tags: ['Customers'],
      summary: 'List customers',
      description: 'Lists customers. Owners will only see their own customers. Superadmins can see all customers across the platform or filter by the `owner_id` query parameter.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'phone', in: 'query', required: false, schema: { type: 'string' } },
        { name: 'name', in: 'query', required: false, schema: { type: 'string' } },
        { name: 'owner_id', in: 'query', required: false, description: 'Filter customers by owner (superadmin only)', schema: { type: 'string' } },
      ],
      responses: { '200': { description: 'Customers list' } },
    },
  },
  '/customers/{id}': {
    put: {
      tags: ['Customers'],
      summary: 'Update customer by id',
      description: 'Updates customer details. Owners can only update their own customers. Superadmins can update any customer.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
              },
            },
            example: {
              name: 'Abebe Kebede',
              phone: '0912345678'
            }
          },
        },
      },
      responses: {
        '200': {
          description: 'Customer updated',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerResponse' } } },
        },
        '400': { description: 'Bad request' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Customer not found' },
      },
    },
    delete: {
      tags: ['Customers'],
      summary: 'Delete customer by id',
      description: 'Deletes a customer. Owners can delete their own customers, and superadmins can delete any customer. Prevented if the customer has existing orders.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Customer deleted', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } } } } },
        '400': { description: 'Cannot delete customer with existing orders' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Customer not found' },
      },
    },
  },
  '/customers/{id}/orders': {
    get: {
      tags: ['Customers'],
      summary: "Get customer's orders and measurements",
      description: 'Fetches the order history for a specific customer. Superadmins can view the order history for any customer.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': { description: "Customer's orders returned", content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerOrdersResponse' } } } },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Customer or orders not found' },
      },
    },
  },
};