module.exports = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all users, optionally filter by role',
      parameters: [
        {
          name: 'role',
          in: 'query',
          required: false,
          schema: { type: 'string', enum: ['superadmin', 'owner', 'tailor'] },
        },
      ],
      responses: { '200': { description: 'Users list' } },
    },
  },
  '/users/create-tailor': {
    post: {
      tags: ['Users'],
      summary: 'Owner creates tailor',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserCreateTailorBody' },
          },
        },
      },
      responses: { '201': { description: 'Tailor created' } },
    },
  },
  '/users/tailors': {
    get: {
      tags: ['Users'],
      summary: 'Get tailors assigned to authenticated owner',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'phoneNumber',
          in: 'query',
          required: false,
          schema: { type: 'string' },
        },
      ],
      responses: { '200': { description: 'Owner tailors list' } },
    },
  },
  '/users/owners': {
    get: {
      tags: ['Users'],
      summary: 'Get owners assigned to authenticated tailor',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'phoneNumber',
          in: 'query',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'ownerId',
          in: 'query',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Tailor owners list',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OwnerListResponse' } } },
        },
        '404': { description: 'Tailor not found' },
      },
    },
  },
  '/users/tailors/by-phone/{phoneNumber}': {
    get: {
      tags: ['Users'],
      summary: 'Find tailor by phone number',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'phoneNumber', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Tailor found' },
        '404': { description: 'Tailor not found' },
      },
    },
  },
  '/users/{id}': {
    put: {
      tags: ['Users'],
      summary: 'Update user by id',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                fullName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phoneNumber: { type: 'string' },
                address: { type: 'string' },
                status: { type: 'string', enum: ['pending','approved','rejected'] },
              },
            },
            example: {
              fullName: 'Abebe Kebede',
              email: 'abebe@example.com',
              phoneNumber: '0912345678',
              address: 'Addis Ababa, Ethiopia',
              status: 'approved'
            }
          },
        },
      },
      responses: { '200': { description: 'User updated' } },
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete user by id',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'User deleted' } },
    },
  },
  '/users/{id}/status': {
    patch: {
      tags: ['Users'],
      summary: 'Update owner status',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserStatusUpdateBody' },
          },
        },
      },
      responses: { '200': { description: 'Status updated' } },
    },
  },
};