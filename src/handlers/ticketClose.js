const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/database');
const { isStaff } = require('../utils/permissions');
const { closeConfirmEmbed, ratingDmEmbed } = require('../utils/embeds');
const { generateTranscript } = require('../services/transcriptService');
const { sendLog } = require('../services/logService');
const logger = require('../utils/logger');

async function requestClose(interaction) {
  const ticket = db.tickets.getByChannel(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });
  }

  if (ticket.status === 'closed') {
    return interaction.reply({ content: '❌ Este ticket já foi fechado.', ephemeral: true });
  }

  if (!isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Apenas membros da equipe (Staff) podem fechar tickets.', ephemeral: true });
  }

  const embed = closeConfirmEmbed();
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_confirm_close')
      .setLabel('Confirmar Fechamento')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('ticket_cancel_close')
      .setLabel('Cancelar')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

  // 60s timeout — auto-cancel
  setTimeout(async () => {
    try {
      await interaction.deleteReply().catch(() => {});
    } catch {
      // Already deleted or expired
    }
  }, 60_000);
}

async function confirmClose(interaction) {
  const ticket = db.tickets.getByChannel(interaction.channel.id);
  if (!ticket || ticket.status === 'closed') {
    return interaction.update({ content: '❌ Ticket já fechado ou não encontrado.', embeds: [], components: [] });
  }

  await interaction.update({ content: '🔒 Fechando ticket...', embeds: [], components: [] });

  // Collect all messages from channel
  const messages = await fetchAllMessages(interaction.channel);

  // Save messages to DB
  for (const msg of messages) {
    if (msg.author.bot) continue;
    const attachments = msg.attachments.map(a => a.url);
    db.messages.add(ticket.id, msg.author.id, msg.author.username, msg.content, attachments);
  }

  // Close ticket in DB
  db.tickets.close(ticket.id);

  // Refresh ticket data after closing
  const closedTicket = db.tickets.getById(ticket.id);

  // Generate transcript
  const dbMessages = db.messages.getAll(ticket.id);
  const transcript = generateTranscript(closedTicket, dbMessages, interaction.guild);

  // Send log
  await sendLog(interaction.client, closedTicket, transcript.filepath);

  // Send rating DM to owner
  await sendRatingDm(interaction.client, closedTicket, transcript.filepath);

  // Delete channel after 5s
  setTimeout(async () => {
    try {
      await interaction.channel.delete().catch(() => {});
    } catch {
      // Channel might already be gone
    }
  }, 5_000);

  logger.info(`Ticket #${ticket.id} closed by ${interaction.user.tag}`);
}

async function cancelClose(interaction) {
  await interaction.update({ content: '✅ Fechamento cancelado.', embeds: [], components: [] });
}

async function fetchAllMessages(channel) {
  const all = [];
  let lastId;

  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;

    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) break;

    all.push(...batch.values());
    lastId = batch.last().id;

    if (batch.size < 100) break;
  }

  return all.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

async function sendRatingDm(client, ticket, transcriptPath) {
  try {
    const user = await client.users.fetch(ticket.owner_id);
    const embed = ratingDmEmbed(ticket.id, ticket.category);

    const row = new ActionRowBuilder().addComponents(
      ...[1, 2, 3, 4, 5].map(n =>
        new ButtonBuilder()
          .setCustomId(`rating_${n}_${ticket.id}`)
          .setLabel('⭐'.repeat(n))
          .setStyle(n >= 4 ? ButtonStyle.Success : n >= 3 ? ButtonStyle.Primary : ButtonStyle.Secondary)
      )
    );

    const { AttachmentBuilder } = require('discord.js');
    const files = transcriptPath ? [new AttachmentBuilder(transcriptPath)] : [];

    await user.send({ embeds: [embed], components: [row], files });
    logger.info(`Rating DM sent to ${user.tag} for ticket #${ticket.id}`);
  } catch (err) {
    logger.error(`Failed to send rating DM: ${err.message}`);
  }
}

module.exports = { requestClose, confirmClose, cancelClose };
