const express = require('express');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

function startHealthServer(client) {
  const app = express();

  app.use('/transcripts', express.static(path.resolve('./transcripts')));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      bot: client.user ? client.user.tag : 'not ready',
      guilds: client.guilds.cache.size,
      uptime: process.uptime(),
    });
  });

  app.listen(config.port, () => {
    logger.info(`Health server listening on port ${config.port}`);
  });
}

module.exports = { startHealthServer };
