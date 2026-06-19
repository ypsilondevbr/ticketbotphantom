const db = require('../database/database');
const config = require('../config/config');
const { feedbackEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

async function submitRating(client, ticket, userId, stars, comment) {
  const staffId = ticket.claimed_by;

  db.ratings.create(ticket.id, userId, stars, comment || null, staffId || null);
  logger.info(`Rating saved: ticket #${ticket.id}, ${stars} stars`);

  const channel = await client.channels.fetch(config.feedbackChannelId).catch(() => null);
  if (!channel) {
    logger.error('Feedback channel not found');
    return;
  }

  const embed = feedbackEmbed(userId, ticket, stars, comment, staffId);
  await channel.send({ embeds: [embed] }).catch(err => {
    logger.error(`Failed to send feedback: ${err.message}`);
  });
}

module.exports = { submitRating };
