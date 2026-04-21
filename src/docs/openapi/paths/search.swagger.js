module.exports = {
  '/search': {
    get: {
      tags: ['Search'],
      summary: 'Search resources',
      responses: { '200': { description: 'Search results' } },
    },
  },
};
