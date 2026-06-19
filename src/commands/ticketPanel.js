const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, AttachmentBuilder } = require('discord.js');
const categories = require('../config/categories');
const { panelEmbed } = require('../utils/embeds');
const { isAdmin } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Envia o painel de tickets'),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ content: '❌ Apenas administradores podem usar este comando.', ephemeral: true });
    }

    const embed = panelEmbed();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select_category')
      .setPlaceholder('Selecione uma categoria para abrir seu ticket...')
      .addOptions(
        categories.map(cat => 
          new StringSelectMenuOptionBuilder()
            .setLabel(cat.label)
            .setDescription(cat.description)
            .setValue(`ticket_create_${cat.id}`)
            .setEmoji(cat.emoji)
        )
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const attachment = new AttachmentBuilder('C:/Users/aliss/Downloads/Logotipo de E-Sports Gaming Ilustração Vermelho e Preto.png', { name: 'banner.png' });

    await interaction.reply({ content: '✅ Painel gerado com sucesso.', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row], files: [attachment] });
  },
};
