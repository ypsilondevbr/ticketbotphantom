require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  logChannelId: process.env.LOG_CHANNEL_ID,
  feedbackChannelId: process.env.FEEDBACK_CHANNEL_ID,
  adminRoleId: process.env.ADMIN_ROLE_ID,
  modRoleId: process.env.MOD_ROLE_ID,
  supportRoleId: process.env.SUPPORT_ROLE_ID,
  influencerRoleId: process.env.INFLUENCER_ROLE_ID,
  uefiRoleId: process.env.UEFI_ROLE_ID,
  ownerRoleId: process.env.OWNER_ROLE_ID,
  ticketCategoryId: process.env.TICKET_CATEGORY_ID,
  maxReservations: parseInt(process.env.MAX_RESERVATIONS || '60', 10),
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `http://localhost:${process.env.PORT || 3000}`),
  databasePath: process.env.DATABASE_PATH || './data/tickets.sqlite',
};
