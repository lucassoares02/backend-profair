require('dotenv').config;
require('module-alias/register');

const config = require('@config');
const app = require('@app');
const logger = require('@logger');

require('./scheduler');

app.listen(config.app.port, () => { logger.info('✅ Server Running') });
