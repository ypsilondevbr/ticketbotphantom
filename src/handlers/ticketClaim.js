const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/database');
const { isStaff } = require('../utils/permissions');
const { ticketClaimedEmbed } = require('../utils/embeds');
const categories = require('../config/categories');
const logger = require('../utils/logger');

async function claimTicket(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Apenas staff pode assumir tickets.', ephemeral: true });
  }

  const ticket = db.tickets.getByChannel(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });
  }

  if (ticket.status === 'claimed') {
    return interaction.reply({
      content: `❌ Este ticket já foi assumido por <@${ticket.claimed_by}>.`,
      ephemeral: true,
    });
  }

  if (ticket.status === 'closed') {
    return interaction.reply({ content: '❌ Este ticket já foi fechado.', ephemeral: true });
  }

  db.tickets.claim(interaction.user.id, ticket.id);

  const category = categories.find(c => c.id === ticket.category);
  const embed = ticketClaimedEmbed(
    `<@${ticket.owner_id}>`,
    category ? category.label : ticket.category,
    category ? category.emoji : '🎫',
    `<@${interaction.user.id}>`
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel(`Assumido por ${interaction.user.username}`)
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('Fechar Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger),
  );

  const rows = [row];

  if (ticket.category === 'uefi') {
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_uefi_approve').setLabel('Aprovar UEFI').setEmoji('✅').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ticket_uefi_reject').setLabel('Reprovar UEFI').setEmoji('❌').setStyle(ButtonStyle.Danger),
    );
    rows.push(actionRow);
  } else if (ticket.category === 'influenciador') {
    // Only show buttons if the influencer meets minimum requirements? No, let the admin decide or reject.
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_influencer_approve').setLabel('Aprovar Influenciador').setEmoji('✅').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ticket_influencer_reject').setLabel('Reprovar Influenciador').setEmoji('❌').setStyle(ButtonStyle.Danger),
    );
    rows.push(actionRow);
  }

  await interaction.update({ embeds: [embed], components: rows });
  logger.info(`Ticket #${ticket.id} claimed by ${interaction.user.tag}`);
}

module.exports = { claimTicket };
