const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('./openapi/spec');

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get('/api/docs.json', (req, res) => {
    res.status(200).json(openApiSpec);
  });
};

module.exports = { setupSwagger, openApiSpec };
