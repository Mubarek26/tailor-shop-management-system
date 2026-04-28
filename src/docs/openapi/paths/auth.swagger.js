module.exports = {
  '/auth/owner-request': {
    post: {
      tags: ['Auth'],
      summary: 'Request owner account access',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OwnerRequestBody' },
          },
          'multipart/form-data': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/OwnerRequestBody' },
                {
                  type: 'object',
                  properties: {
                    photo: { type: 'string', format: 'binary' },
                  },
                },
              ],
            },
          },
        },
      },
      responses: { '200': { description: 'Owner request accepted' } },
    },
  },
  '/auth/verify-email/{token}': {
    get: {
      tags: ['Auth'],
      summary: 'Verify email address',
      parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Email verified' }, '400': { description: 'Invalid token' } },
    },
  },
  '/auth/resend-verification': {
    post: {
      tags: ['Auth'],
      summary: 'Resend verification email',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object', properties: { email: { type: 'string' } } },
          },
        },
      },
      responses: { '200': { description: 'Verification email sent' } },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login with email or phone',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
        },
      },
      responses: { '200': { description: 'Logged in successfully' } },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      responses: { '200': { description: 'Logged out' } },
    },
  },
  '/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Send forgot password email',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { email: { type: 'string', format: 'email' } },
            },
          },
        },
      },
      responses: { '200': { description: 'Reset token sent' } },
    },
  },
  '/auth/reset-password/{token}': {
    patch: {
      tags: ['Auth'],
      summary: 'Reset password with token',
      parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                password: { type: 'string' },
                passwordConfirm: { type: 'string' },
              },
              required: ['password', 'passwordConfirm'],
            },
          },
        },
      },
      responses: { '200': { description: 'Password reset successfully' } },
    },
  },
  '/auth/update-password': {
    patch: {
      tags: ['Auth'],
      summary: 'Update current user password',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                passwordCurrent: { type: 'string' },
                password: { type: 'string' },
                passwordConfirm: { type: 'string' },
              },
            },
          },
        },
      },
      responses: { '200': { description: 'Password updated' } },
    },
  },
  '/auth/assign-tailor': {
    post: {
      tags: ['Auth'],
      summary: 'Assign a tailor to owner',
      description: 'Assigns a tailor to a shop owner. Owners can only assign tailors to themselves (the `ownerId` field is ignored for regular owners). Superadmins MUST provide an `ownerId` to specify which shop owner gets the tailor.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                ownerId: { type: 'string' },
                tailorId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: { '200': { description: 'Tailor assigned' } },
    },
  },
  '/auth/assign-tailor-by-phone': {
    post: {
      tags: ['Auth'],
      summary: 'Assign a tailor to owner by phone',
      description: 'Assigns a tailor using their phone number. Owners automatically assign the tailor to themselves. Superadmins MUST provide an `ownerId` to specify the target shop owner.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                phoneNumber: { type: 'string', description: 'Phone number of the tailor' },
                ownerId: { type: 'string', description: 'Required if superadmin is assigning' },
              },
            },
          },
        },
      },
      responses: { '200': { description: 'Tailor assigned by phone' } },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get current authenticated user',
      description: 'Fetches the session profile for the currently logged-in user (Superadmin, Owner, or Tailor).',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Current user profile' } },
    },
  },
};