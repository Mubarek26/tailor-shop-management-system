module.exports = {
  '/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'List notifications',
      responses: { '200': { description: 'Notifications list' } },
    },
  },
};
