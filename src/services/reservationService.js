const db = require('../database/database');
const config = require('../config/config');

function getStatus() {
  const count = db.reservations.count();
  const max = config.maxReservations;
  return { count, max, full: count >= max };
}

function reserve(userId) {
  const existing = db.reservations.get(userId);
  if (existing) return { success: false, reason: 'already_reserved', position: existing.position };

  const { count, max, full } = getStatus();
  if (full) return { success: false, reason: 'full' };

  const position = count + 1;
  db.reservations.create(userId, position);
  return { success: true, position, max };
}

module.exports = { getStatus, reserve };
