const express = require('express');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { setupSwagger } = require('./docs/swagger');

const app = express();

app.use(express.json());
setupSwagger(app);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
