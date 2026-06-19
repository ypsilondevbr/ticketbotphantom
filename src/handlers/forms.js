const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/database');
const { createTicket } = require('./ticketCreate');
const { uefiApplicationEmbed, influencerApplicationEmbed } = require('../utils/embeds');
const influencerService = require('../services/influencerService');
const { submitRating } = require('../services/ratingService');
const logger = require('../utils/logger');

async function handleModal(interaction) {
  const customId = interaction.customId;

  if (customId === 'modal_uefi') return handleUefiModal(interaction);
  if (customId === 'modal_influencer') return handleInfluencerModal(interaction);
  if (customId.startsWith('modal_rating_')) return handleRatingModal(interaction);
}

async function handleUefiModal(interaction) {
  const answers = {
    'Por que deseja o produto UEFI?': interaction.fields.getTextInputValue('uefi_q1'),
    'Experiência com UEFI': interaction.fields.getTextInputValue('uefi_q2'),
    'Como conheceu o servidor': interaction.fields.getTextInputValue('uefi_q3'),
  };

  const existing = db.uefi.get(interaction.user.id);
  if (existing && (existing.status === 'pending' || existing.status === 'interview')) {
    return interaction.reply({ content: '❌ Você já possui uma aplicação UEFI em andamento.', ephemeral: true });
  }

  db.uefi.create(interaction.user.id, answers);

  const channel = await createTicket(interaction, 'uefi');

  if (channel) {
    const embed = uefiApplicationEmbed(`<@${interaction.user.id}>`, answers);
    await channel.send({ embeds: [embed] });
  }

  logger.info(`UEFI application submitted by ${interaction.user.tag}`);
}

async function handleInfluencerModal(interaction) {
  const followersStr = interaction.fields.getTextInputValue('inf_followers');
  const viewsStr = interaction.fields.getTextInputValue('inf_views');
  const link = interaction.fields.getTextInputValue('inf_link');

  const followers = parseInt(followersStr, 10);
  const avgViews = parseInt(viewsStr, 10);

  if (isNaN(followers) || isNaN(avgViews)) {
    return interaction.reply({ content: '❌ Seguidores e views devem ser números válidos.', ephemeral: true });
  }

  const validation = influencerService.validateRequirements(followers, avgViews);

  const result = influencerService.apply(interaction.user.id, followers, avgViews);
  if (!result.success) {
    const msg = result.reason === 'pending'
      ? '❌ Você já possui uma candidatura pendente.'
      : '❌ Você já é um influenciador aprovado.';
    return interaction.reply({ content: msg, ephemeral: true });
  }

  const channel = await createTicket(interaction, 'influenciador');

  if (channel) {
    const embed = influencerApplicationEmbed(`<@${interaction.user.id}>`, followers, avgViews);
    embed.addFields({ name: '🔗 Link', value: link });

    if (!validation.valid) {
      embed.setFooter({ text: '❌ Não atende aos requisitos mínimos' });
    }
    await channel.send({ embeds: [embed] });
  }

  logger.info(`Influencer application submitted by ${interaction.user.tag}: ${followers} followers, ${avgViews} avg views`);
}

async function handleRatingButton(interaction) {
  const parts = interaction.customId.split('_');
  const stars = parseInt(parts[1], 10);
  const ticketId = parseInt(parts[2], 10);

  if (isNaN(stars) || isNaN(ticketId)) return;

  const modal = new ModalBuilder()
    .setCustomId(`modal_rating_${ticketId}_${stars}`)
    .setTitle('💬 Comentário (Opcional)');

  const commentInput = new TextInputBuilder()
    .setCustomId('rating_comment')
    .setLabel('Deixe um comentário sobre o atendimento')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(500)
    .setPlaceholder('Como foi sua experiência?');

  modal.addComponents(new ActionRowBuilder().addComponents(commentInput));
  await interaction.showModal(modal);
}

async function handleRatingModal(interaction) {
  const parts = interaction.customId.split('_');
  const ticketId = parseInt(parts[2], 10);
  const stars = parseInt(parts[3], 10);

  if (isNaN(ticketId) || isNaN(stars)) return;

  const comment = interaction.fields.getTextInputValue('rating_comment') || null;

  const ticket = db.tickets.getById(ticketId);
  if (!ticket) {
    return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });
  }

  const existing = db.ratings.get(ticketId);
  if (existing) {
    return interaction.reply({ content: '❌ Você já avaliou este ticket.', ephemeral: true });
  }

  await submitRating(interaction.client, ticket, interaction.user.id, stars, comment);

  const starDisplay = '⭐'.repeat(stars);
  await interaction.reply({ content: `✅ Obrigado pela avaliação! ${starDisplay}`, ephemeral: true });

  try {
    await interaction.message.edit({ components: [] });
  } catch {
    // DM message might not be editable
  }

  logger.info(`Rating received: ticket #${ticketId}, ${stars} stars from ${interaction.user.tag}`);
}

module.exports = { handleModal, handleRatingButton };
