const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const { runMigrations } = require('./migrations');
const logger = require('../utils/logger');

const dbDir = path.dirname(path.resolve(config.databasePath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.resolve(config.databasePath));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

runMigrations(db);
logger.info('Database initialized');

// --- Prepared statements ---

const stmts = {
  createTicket: db.prepare('INSERT INTO tickets (guild_id, channel_id, owner_id, category) VALUES (?, ?, ?, ?)'),
  getTicketByChannel: db.prepare('SELECT * FROM tickets WHERE channel_id = ?'),
  getTicketById: db.prepare('SELECT * FROM tickets WHERE id = ?'),
  getOpenTicketByUser: db.prepare("SELECT * FROM tickets WHERE owner_id = ? AND status != 'closed' LIMIT 1"),
  updateTicketStatus: db.prepare('UPDATE tickets SET status = ? WHERE id = ?'),
  claimTicket: db.prepare("UPDATE tickets SET claimed_by = ?, status = 'claimed' WHERE id = ?"),
  closeTicket: db.prepare("UPDATE tickets SET status = 'closed', closed_at = datetime('now') WHERE id = ?"),

  addMessage: db.prepare('INSERT INTO ticket_messages (ticket_id, author_id, author_name, content, attachments) VALUES (?, ?, ?, ?, ?)'),
  getMessages: db.prepare('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC'),

  createInfluencer: db.prepare('INSERT INTO influencers (user_id, followers, average_views) VALUES (?, ?, ?)'),
  getInfluencer: db.prepare('SELECT * FROM influencers WHERE user_id = ?'),
  updateInfluencerStatus: db.prepare("UPDATE influencers SET status = ?, approved_by = ?, approved_at = datetime('now') WHERE user_id = ?"),

  createUefi: db.prepare('INSERT INTO uefi_applications (user_id, answers) VALUES (?, ?)'),
  getUefi: db.prepare("SELECT * FROM uefi_applications WHERE user_id = ? AND status != 'rejected' ORDER BY id DESC LIMIT 1"),
  updateUefiStatus: db.prepare('UPDATE uefi_applications SET status = ?, interviewer = ? WHERE id = ?'),

  createReservation: db.prepare('INSERT INTO reservations (user_id, position) VALUES (?, ?)'),
  getReservationCount: db.prepare('SELECT COUNT(*) as count FROM reservations'),
  getReservation: db.prepare('SELECT * FROM reservations WHERE user_id = ?'),

  createRating: db.prepare('INSERT INTO ratings (ticket_id, user_id, stars, comment, staff_id) VALUES (?, ?, ?, ?, ?)'),
  getRating: db.prepare('SELECT * FROM ratings WHERE ticket_id = ?'),
};

module.exports = {
  db,
  tickets: {
    create: (guildId, channelId, ownerId, category) => stmts.createTicket.run(guildId, channelId, ownerId, category),
    getByChannel: (channelId) => stmts.getTicketByChannel.get(channelId),
    getById: (id) => stmts.getTicketById.get(id),
    getOpenByUser: (userId) => stmts.getOpenTicketByUser.get(userId),
    updateStatus: (status, id) => stmts.updateTicketStatus.run(status, id),
    claim: (claimedBy, id) => stmts.claimTicket.run(claimedBy, id),
    close: (id) => stmts.closeTicket.run(id),
  },
  messages: {
    add: (ticketId, authorId, authorName, content, attachments) =>
      stmts.addMessage.run(ticketId, authorId, authorName, content, JSON.stringify(attachments || [])),
    getAll: (ticketId) => stmts.getMessages.all(ticketId),
  },
  influencers: {
    create: (userId, followers, avgViews) => stmts.createInfluencer.run(userId, followers, avgViews),
    get: (userId) => stmts.getInfluencer.get(userId),
    updateStatus: (status, approvedBy, userId) => stmts.updateInfluencerStatus.run(status, approvedBy, userId),
  },
  uefi: {
    create: (userId, answers) => stmts.createUefi.run(userId, JSON.stringify(answers)),
    get: (userId) => stmts.getUefi.get(userId),
    updateStatus: (status, interviewer, id) => stmts.updateUefiStatus.run(status, interviewer, id),
  },
  reservations: {
    create: (userId, position) => stmts.createReservation.run(userId, position),
    count: () => stmts.getReservationCount.get().count,
    get: (userId) => stmts.getReservation.get(userId),
  },
  ratings: {
    create: (ticketId, userId, stars, comment, staffId) => stmts.createRating.run(ticketId, userId, stars, comment, staffId),
    get: (ticketId) => stmts.getRating.get(ticketId),
  },
};
