const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes');
const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.corsOrigin }));
app.use(morgan('dev'));

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
