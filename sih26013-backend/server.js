const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

app.listen(env.port, () => {
  logger.info(`SIH26013 Land Conflation backend listening on http://localhost:${env.port}`);
  logger.info(`Try: GET http://localhost:${env.port}/api/v1/health`);
});
