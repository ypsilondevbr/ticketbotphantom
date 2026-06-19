const { AttachmentBuilder } = require('discord.js');
const config = require('../config/config');
const { logEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

const sentLogMessages = [];

function calculateDuration(start, end) {
  const ms = new Date(end) - new Date(start);
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

async function sendLog(client, ticket, transcriptPath) {
  const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
  if (!channel) {
    logger.error('Log channel not found');
    return;
  }

  const duration = calculateDuration(ticket.created_at, ticket.closed_at || new Date().toISOString());
  const embed = logEmbed(ticket, ticket.owner_id, ticket.claimed_by, duration);

  const { AttachmentBuilder } = require('discord.js');
  const files = transcriptPath ? [new AttachmentBuilder(transcriptPath)] : [];

  const msg = await channel.send({ embeds: [embed], files }).catch(err => {
    logger.error('Failed to send log:', err.message);
    return null;
  });

  if (msg) {
    sentLogMessages.push({ messageId: msg.id, channelId: channel.id, sentAt: Date.now() });
  }
}

async function cleanOldLogs(client, maxAgeMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  const toRemove = [];

  for (let i = sentLogMessages.length - 1; i >= 0; i--) {
    const entry = sentLogMessages[i];
    if (now - entry.sentAt > maxAgeMs) {
      try {
        const channel = await client.channels.fetch(entry.channelId).catch(() => null);
        if (channel) {
          const msg = await channel.messages.fetch(entry.messageId).catch(() => null);
          if (msg) await msg.delete().catch(() => {});
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      toRemove.push(i);
    }
  }

  for (const idx of toRemove) {
    sentLogMessages.splice(idx, 1);
  }

  if (toRemove.length > 0) logger.info(`Cleaned ${toRemove.length} old log message(s)`);
}

module.exports = { sendLog, cleanOldLogs };
