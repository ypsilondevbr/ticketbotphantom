const logger = require('../utils/logger');
const { startHealthServer } = require('../web/health');
const transcriptService = require('../services/transcriptService');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);
    logger.info(`Serving ${client.guilds.cache.size} guilds`);

    startHealthServer(client);

    setInterval(() => {
      transcriptService.cleanupOldTranscripts();
    }, 60 * 60 * 1000); // 1 hour

    logger.info('Background jobs started (Cleanup)');
  },
};
