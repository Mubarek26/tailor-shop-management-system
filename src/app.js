const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { setupSwagger } = require('./docs/swagger');

const app = express();

app.use(cors({
  origin: true,          // Allow all origins
  credentials: true,     // Allow cookies/auth headers
}));
app.use(cookieParser());
app.use(express.json());
setupSwagger(app);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
