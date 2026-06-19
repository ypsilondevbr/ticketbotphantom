const { SlashCommandBuilder } = require('discord.js');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clean')
    .setDescription('Apaga mensagens do canal (Máx: 100 mensagens. Apenas cargo Owner).')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade de mensagens a apagar (1 a 100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  async execute(interaction) {
    if (!config.ownerRoleId || !interaction.member.roles.cache.has(config.ownerRoleId)) {
      return interaction.reply({ 
        content: '❌ Acesso Negado: Apenas membros com o cargo **Owner** podem usar este comando.', 
        ephemeral: true 
      });
    }

    const amount = interaction.options.getInteger('quantidade');

    await interaction.deferReply({ ephemeral: true });

    try {
      // The true parameter in bulkDelete filters out messages older than 14 days,
      // avoiding Discord API errors for old messages.
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply({ content: `✅ Limpeza concluída com sucesso! Apaguei **${deleted.size}** mensagens.` });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ 
        content: '❌ Ocorreu um erro ao tentar apagar as mensagens. Detalhe: mensagens com mais de 14 dias não podem ser apagadas de uma vez pelo bot.' 
      });
    }
  },
};
