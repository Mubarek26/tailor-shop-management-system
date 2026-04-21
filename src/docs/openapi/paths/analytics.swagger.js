module.exports = {
  '/analytics/summary': {
    get: {
      tags: ['Analytics'],
      summary: 'Get analytics summary',
      responses: { '200': { description: 'Summary data' } },
    },
  },
};
