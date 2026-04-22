module.exports = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all users',
      description: 'Fetches all users in the system. Accessible by owners and superadmins.',
      security: [{ bearerAuth: [] }],
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
      summary: 'Create a new tailor',
      description: 'Creates a new tailor account. Owners will automatically have the tailor assigned to them. Superadmins MUST provide an `owner_id` in the request body to specify which shop the tailor belongs to.',
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
      summary: 'Get tailors assigned to an owner',
      description: 'Lists tailors. Owners will only see tailors assigned to them. Superadmins can see all tailors platform-wide or filter by passing the `owner_id` query parameter.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'owner_id',
          in: 'query',
          required: false,
          description: 'Filter tailors by owner (superadmin only)',
          schema: { type: 'string' },
        },
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
      summary: 'Get owners assigned to a tailor',
      description: 'Lists shop owners a tailor works for. Tailors only see their own assigned owners. Superadmins can pass `tailor_id` to view owners for any specific tailor.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'tailor_id',
          in: 'query',
          required: false,
          description: 'Fetch owners for a specific tailor (superadmin only)',
          schema: { type: 'string' },
        },
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
      description: 'Updates a users profile details. Superadmins can update any user.',
      security: [{ bearerAuth: [] }],
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
      description: 'Deletes a user account. Superadmins can delete any user.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'User deleted' } },
    },
  },
  '/users/{id}/status': {
    patch: {
      tags: ['Users'],
      summary: 'Update user status',
      description: 'Updates the approval status (pending, approved, rejected) of a user. Accessible by superadmins and owners.',
      security: [{ bearerAuth: [] }],
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