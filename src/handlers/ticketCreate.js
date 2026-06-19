const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/config');
const db = require('../database/database');
const categories = require('../config/categories');
const { ticketCreatedEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

async function createTicket(interaction, categoryId) {
  const category = categories.find(c => c.id === categoryId);
  if (!category) {
    return interaction.reply({ content: '❌ Categoria inválida.', ephemeral: true });
  }

  // Check for existing open ticket
  const existing = db.tickets.getOpenByUser(interaction.user.id);
  if (existing) {
    return interaction.reply({
      content: `❌ Você já possui um ticket ativo: <#${existing.channel_id}>`,
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const channelName = `ticket-${interaction.user.username}-${Date.now().toString(36)}`;

  const permissionOverwrites = [
    {
      id: interaction.guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  const staffRoles = [config.adminRoleId, config.modRoleId, config.supportRoleId].filter(Boolean);
  for (const roleId of staffRoles) {
    permissionOverwrites.push({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  try {
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: config.ticketCategoryId || null,
      permissionOverwrites,
    });

    db.tickets.create(interaction.guild.id, channel.id, interaction.user.id, categoryId);

    const embed = ticketCreatedEmbed(`<@${interaction.user.id}>`, category.label, category.emoji);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_claim')
        .setLabel('Assumir Ticket')
        .setEmoji('✋')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Fechar Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger),
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.editReply({
      content: `✅ Ticket criado com sucesso: ${channel}`,
    });

    logger.info(`Ticket created: ${channel.name} by ${interaction.user.tag} [${categoryId}]`);
    return channel;
  } catch (err) {
    logger.error(`Failed to create ticket: ${err.message}`);
    await interaction.editReply({ content: '❌ Erro ao criar ticket. Tente novamente.' });
    return null;
  }
}

module.exports = { createTicket };
