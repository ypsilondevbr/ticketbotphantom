const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createTicket } = require('./ticketCreate');
const { claimTicket } = require('./ticketClaim');
const { requestClose, confirmClose, cancelClose } = require('./ticketClose');
const { handleRatingButton } = require('./forms');
const categories = require('../config/categories');
const reservationService = require('../services/reservationService');
const { reservationEmbed } = require('../utils/embeds');
const db = require('../database/database');
const { isAdmin } = require('../utils/permissions');
const influencerService = require('../services/influencerService');
const logger = require('../utils/logger');

const config = require('../config/config');

async function handleButton(interaction) {
  const customId = interaction.customId;

  // Ticket creation buttons
  if (customId.startsWith('ticket_create_')) {
    const categoryId = customId.replace('ticket_create_', '');
    const category = categories.find(c => c.id === categoryId);

    if (!category) return;

    if (category.hasModal) {
      return handleModalCategory(interaction, category);
    }

    if (categoryId === 'reserva') {
      return handleReserva(interaction);
    }

    return createTicket(interaction, categoryId);
  }

  // Ticket action buttons
  if (customId === 'ticket_claim') return claimTicket(interaction);
  if (customId === 'ticket_close') return requestClose(interaction);
  if (customId === 'ticket_confirm_close') return confirmClose(interaction);
  if (customId === 'ticket_cancel_close') return cancelClose(interaction);

  // UEFI approve/reject
  if (customId.startsWith('ticket_uefi_')) return handleUefiDecision(interaction, customId);

  // Influencer approve/reject
  if (customId.startsWith('ticket_influencer_')) return handleInfluencerDecision(interaction, customId);

  // Rating buttons (from DM)
  if (customId.startsWith('rating_')) return handleRatingButton(interaction);
}

async function handleSelectMenu(interaction) {
  if (interaction.customId === 'ticket_select_category') {
    const value = interaction.values[0]; // e.g. "ticket_create_suporte"
    
    const categoryId = value.replace('ticket_create_', '');
    const category = categories.find(c => c.id === categoryId);

    if (!category) return;

    if (category.hasModal) {
      return handleModalCategory(interaction, category);
    }

    if (categoryId === 'reserva') {
      return handleReserva(interaction);
    }

    return createTicket(interaction, categoryId);
  }
}

function handleModalCategory(interaction, category) {
  if (category.id === 'uefi') {
    const modal = new ModalBuilder()
      .setCustomId('modal_uefi')
      .setTitle('🛡️ Aplicação — Produto UEFI');

    const q1 = new TextInputBuilder()
      .setCustomId('uefi_q1')
      .setLabel('Por que deseja o produto UEFI?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(500);

    const q2 = new TextInputBuilder()
      .setCustomId('uefi_q2')
      .setLabel('Qual sua experiência com UEFI?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(500);

    const q3 = new TextInputBuilder()
      .setCustomId('uefi_q3')
      .setLabel('Como conheceu nosso servidor?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(200);

    modal.addComponents(
      new ActionRowBuilder().addComponents(q1),
      new ActionRowBuilder().addComponents(q2),
      new ActionRowBuilder().addComponents(q3),
    );

    return interaction.showModal(modal);
  }

  if (category.id === 'influenciador') {
    const modal = new ModalBuilder()
      .setCustomId('modal_influencer')
      .setTitle('⭐ Candidatura — Influenciador');

    const followers = new TextInputBuilder()
      .setCustomId('inf_followers')
      .setLabel('Quantidade de seguidores')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('Ex: 1500')
      .setMaxLength(10);

    const views = new TextInputBuilder()
      .setCustomId('inf_views')
      .setLabel('Média de views por vídeo')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('Ex: 800')
      .setMaxLength(10);

    const link = new TextInputBuilder()
      .setCustomId('inf_link')
      .setLabel('Link do canal/perfil')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('https://...')
      .setMaxLength(200);

    modal.addComponents(
      new ActionRowBuilder().addComponents(followers),
      new ActionRowBuilder().addComponents(views),
      new ActionRowBuilder().addComponents(link),
    );

    return interaction.showModal(modal);
  }
}

async function handleReserva(interaction) {
  const result = reservationService.reserve(interaction.user.id);

  if (!result.success) {
    if (result.reason === 'already_reserved') {
      return interaction.reply({
        content: `❌ Você já possui uma reserva (posição **${result.position}**).`,
        ephemeral: true,
      });
    }
    if (result.reason === 'full') {
      return interaction.reply({
        content: '❌ Todas as vagas foram preenchidas (**60/60**).',
        ephemeral: true,
      });
    }
  }

  const embed = reservationEmbed(result.position, result.max);
  return interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleUefiDecision(interaction, customId) {
  if (!isAdmin(interaction.member)) {
    return interaction.reply({ content: '❌ Apenas administradores podem decidir.', ephemeral: true });
  }

  const ticket = db.tickets.getByChannel(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });

  const action = customId.replace('ticket_uefi_', '');
  const app = db.uefi.get(ticket.owner_id);
  if (!app) return interaction.reply({ content: '❌ Aplicação não encontrada.', ephemeral: true });

  if (action === 'approve') {
    db.uefi.updateStatus('approved', interaction.user.id, app.id);
    const member = await interaction.guild.members.fetch(ticket.owner_id).catch(() => null);
    if (member && config.uefiRoleId) {
      await member.roles.add(config.uefiRoleId).catch(err => {
        logger.error(`Failed to add UEFI role: ${err.message}`);
        interaction.channel.send('⚠️ **Aviso:** Não consegui dar o cargo para o usuário. Verifique se o cargo do bot está ACIMA do cargo UEFI nas configurações do servidor!');
      });
    }
    await interaction.reply({ content: `✅ Aplicação UEFI de <@${ticket.owner_id}> **aprovada** por <@${interaction.user.id}>. Cargo setado!` });
  } else {
    db.uefi.updateStatus('rejected', interaction.user.id, app.id);
    await interaction.reply({ content: `❌ Aplicação UEFI de <@${ticket.owner_id}> **reprovada** por <@${interaction.user.id}>.` });
  }

  // Remove the action buttons (second row) from the claimed message
  const newComponents = [interaction.message.components[0]];
  await interaction.message.edit({ components: newComponents }).catch(() => {});

  logger.info(`UEFI application ${action}d for ${ticket.owner_id} by ${interaction.user.tag}`);
}

async function handleInfluencerDecision(interaction, customId) {
  if (!isAdmin(interaction.member)) {
    return interaction.reply({ content: '❌ Apenas administradores podem decidir.', ephemeral: true });
  }

  const ticket = db.tickets.getByChannel(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });

  const action = customId.replace('ticket_influencer_', '');

  // Check if it's already decided
  const existingApp = db.influencers.get(ticket.owner_id);
  if (existingApp && existingApp.status !== 'pending') {
    return interaction.reply({ content: `❌ Esta candidatura já foi ${existingApp.status === 'approved' ? 'aprovada' : 'reprovada'}.`, ephemeral: true });
  }

  if (action === 'approve') {
    await influencerService.approve(ticket.owner_id, interaction.user.id, interaction.guild);
    const member = await interaction.guild.members.fetch(ticket.owner_id).catch(() => null);
    if (member && config.influencerRoleId) {
      await member.roles.add(config.influencerRoleId).catch(err => {
        logger.error(`Failed to add Influencer role: ${err.message}`);
        interaction.channel.send('⚠️ **Aviso:** Não consegui dar o cargo para o usuário. Verifique se o cargo do bot está ACIMA do cargo Influenciador nas configurações do servidor!');
      });
    }
    await interaction.reply({ content: `✅ <@${ticket.owner_id}> foi **aprovado** como influenciador por <@${interaction.user.id}>. Cargo setado!` });
  } else {
    influencerService.reject(ticket.owner_id, interaction.user.id);
    await interaction.reply({ content: `❌ <@${ticket.owner_id}> foi **reprovado** como influenciador por <@${interaction.user.id}>.` });
  }

  // Remove the action buttons (second row) from the claimed message
  const newComponents = [interaction.message.components[0]];
  await interaction.message.edit({ components: newComponents }).catch(() => {});

  logger.info(`Influencer application ${action}d for ${ticket.owner_id} by ${interaction.user.tag}`);
}

module.exports = { handleButton, handleSelectMenu };
