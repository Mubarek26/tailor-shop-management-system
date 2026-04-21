module.exports = {
  '/tasks': {
    get: {
      tags: ['Tasks'],
      summary: 'List tasks',
      responses: { '200': { description: 'Tasks list' } },
    },
    post: {
      tags: ['Tasks'],
      summary: 'Create task',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { type: 'object' } },
        },
      },
      responses: { '201': { description: 'Task created' } },
    },
  },
  '/tasks/{id}': {
    put: {
      tags: ['Tasks'],
      summary: 'Update task by id',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { type: 'object' } },
        },
      },
      responses: { '200': { description: 'Task updated' } },
    },
  },
};
