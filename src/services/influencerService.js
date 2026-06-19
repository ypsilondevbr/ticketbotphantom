const db = require('../database/database');
const config = require('../config/config');
const logger = require('../utils/logger');

const MIN_FOLLOWERS = 500;
const MIN_VIEWS = 700;

function validateRequirements(followers, avgViews) {
  return {
    valid: followers >= MIN_FOLLOWERS && avgViews >= MIN_VIEWS,
    meetsFollowers: followers >= MIN_FOLLOWERS,
    meetsViews: avgViews >= MIN_VIEWS,
  };
}

function apply(userId, followers, avgViews) {
  const existing = db.influencers.get(userId);
  if (existing && existing.status === 'pending') {
    return { success: false, reason: 'pending' };
  }
  if (existing && existing.status === 'approved') {
    return { success: false, reason: 'already_approved' };
  }

  db.influencers.create(userId, followers, avgViews);
  return { success: true };
}

async function approve(userId, approvedBy, guild) {
  db.influencers.updateStatus('approved', approvedBy, userId);

  if (config.influencerRoleId) {
    try {
      const member = await guild.members.fetch(userId);
      await member.roles.add(config.influencerRoleId);
      logger.info(`Influencer role added to ${userId}`);
    } catch (err) {
      logger.error(`Failed to add influencer role: ${err.message}`);
    }
  }
}

function reject(userId, rejectedBy) {
  db.influencers.updateStatus('rejected', rejectedBy, userId);
}

module.exports = { validateRequirements, apply, approve, reject, MIN_FOLLOWERS, MIN_VIEWS };
