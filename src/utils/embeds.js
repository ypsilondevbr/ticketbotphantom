const { EmbedBuilder } = require('discord.js');

const COLORS = {
  primary: 0x5865F2,
  success: 0x57F287,
  danger: 0xED4245,
  warning: 0xFEE75C,
  info: 0x5865F2,
  purple: 0x9B59B6,
  orange: 0xE67E22,
};

function panelEmbed() {
  return new EmbedBuilder()
    .setTitle('🌌 **Central de Atendimento Premium**')
    .setDescription(
      'Bem-vindo à nossa central exclusiva de atendimento!\n' +
      'Para garantir uma resposta rápida e eficaz, selecione no menu abaixo a área que melhor atende à sua necessidade atual.\n\n' +
      '### 📋 Nossos Departamentos\n\n' +
      '**🎫 Suporte Técnico**\n' +
      '*Dúvidas gerais, problemas de acesso e assistência.*\n\n' +
      '**🚨 Central de Denúncias**\n' +
      '*Reporte infratores e auxilie a comunidade (Sigilo 100% garantido).*\n\n' +
      '**🤝 Propostas e Parcerias**\n' +
      '*Traga seu projeto ou servidor para construirmos uma aliança.*\n\n' +
      '**⭐ Influenciadores**\n' +
      '*Recrutamento oficial de criadores de conteúdo (YouTube/Twitch/TikTok).*\n\n' +
      '**💰 Revenda e Atacado**\n' +
      '*Entre em contato para cotações e compras em grande volume.*\n\n' +
      '**🛡️ Aplicação UEFI**\n' +
      '*Formulário restrito de avaliação para obtenção do produto UEFI.*\n\n' +
      '**🔥 Reservas Limitadas**\n' +
      '*As vagas são disputadas! Garanta a sua o quanto antes.*\n\n' +
      '—\n' +
      '```\n⏳ Atendimento 24/7 (O tempo de resposta pode variar)\n⚠️ Seja claro e direto ao detalhar seu problema no ticket.\n```'
    )
    .setColor('#2B2D31')
    .setImage('attachment://banner.png');
}

function ticketCreatedEmbed(user, category, categoryEmoji) {
  return new EmbedBuilder()
    .setTitle(`${categoryEmoji} Ticket — ${category}`)
    .setDescription(
      `Bem-vindo ao seu ticket, ${user}!\n\n` +
      '📝 Descreva seu assunto detalhadamente.\n' +
      'Um membro da equipe irá atendê-lo em breve.\n\n' +
      '**Status:** ❌ Sem atendente'
    )
    .setColor(COLORS.warning)
    .setFooter({ text: 'Aguardando atendimento' })
    .setTimestamp();
}

function ticketClaimedEmbed(user, category, categoryEmoji, claimedBy) {
  return new EmbedBuilder()
    .setTitle(`${categoryEmoji} Ticket — ${category}`)
    .setDescription(
      `Ticket de ${user}\n\n` +
      `**Status:** ✅ Atendido por ${claimedBy}`
    )
    .setColor(COLORS.success)
    .setFooter({ text: 'Em atendimento' })
    .setTimestamp();
}

function closeConfirmEmbed() {
  return new EmbedBuilder()
    .setTitle('🔒 Confirmar Fechamento')
    .setDescription(
      'Tem certeza que deseja **fechar** este ticket?\n\n' +
      'Esta ação irá:\n' +
      '• Gerar o transcript do ticket\n' +
      '• Registrar nos logs\n' +
      '• Deletar este canal\n\n' +
      '> ⏱️ Esta confirmação expira em **60 segundos**.'
    )
    .setColor(COLORS.danger)
    .setTimestamp();
}

function logEmbed(ticket, owner, claimedBy, duration) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Ticket Fechado')
    .addFields(
      { name: '👤 Usuário', value: `<@${owner}>`, inline: true },
      { name: '📁 Categoria', value: ticket.category, inline: true },
      { name: '🛠️ Responsável', value: claimedBy ? `<@${claimedBy}>` : 'Nenhum', inline: true },
      { name: '⏱️ Duração', value: duration, inline: true },
      { name: '🆔 Ticket ID', value: `#${ticket.id}`, inline: true },
    )
    .setColor(COLORS.info)
    .setFooter({ text: `Ticket #${ticket.id}` })
    .setTimestamp();

  return embed;
}

function ratingDmEmbed(ticketId, category) {
  const embed = new EmbedBuilder()
    .setTitle('⭐ Avalie seu Atendimento')
    .setDescription(
      `Seu ticket **#${ticketId}** (${category}) foi encerrado.\n\n` +
      'Como foi sua experiência? Selecione uma nota abaixo.\n' +
      '*(O histórico da conversa está anexado acima como um arquivo .txt)*'
    )
    .setColor(COLORS.purple)
    .setTimestamp();

  return embed;
}

function feedbackEmbed(userId, ticket, stars, comment, staffId) {
  const starDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  return new EmbedBuilder()
    .setTitle('📊 Nova Avaliação')
    .addFields(
      { name: '👤 Usuário', value: `<@${userId}>`, inline: true },
      { name: '🆔 Ticket', value: `#${ticket.id}`, inline: true },
      { name: '📁 Categoria', value: ticket.category, inline: true },
      { name: '🛠️ Atendente', value: staffId ? `<@${staffId}>` : 'Nenhum', inline: true },
      { name: '⭐ Avaliação', value: `${starDisplay} (${stars}/5)`, inline: true },
      { name: '💬 Comentário', value: comment || '*Sem comentário*' },
    )
    .setColor(stars >= 4 ? COLORS.success : stars >= 3 ? COLORS.warning : COLORS.danger)
    .setTimestamp();
}

function uefiApplicationEmbed(user, answers) {
  const fields = Object.entries(answers).map(([key, value]) => ({
    name: key,
    value: value || '*Não informado*',
  }));
  return new EmbedBuilder()
    .setTitle('🛡️ Aplicação UEFI')
    .setDescription(`Aplicação de ${user}`)
    .addFields(...fields)
    .setColor(COLORS.purple)
    .setFooter({ text: 'Aguardando entrevista' })
    .setTimestamp();
}

function influencerApplicationEmbed(user, followers, avgViews) {
  const meetsFollowers = followers >= 500;
  const meetsViews = avgViews >= 700;
  return new EmbedBuilder()
    .setTitle('⭐ Candidatura Influenciador')
    .setDescription(`Candidatura de ${user}`)
    .addFields(
      { name: '👥 Seguidores', value: `${followers} ${meetsFollowers ? '✅' : '❌ (mín. 500)'}`, inline: true },
      { name: '👁️ Média de Views', value: `${avgViews} ${meetsViews ? '✅' : '❌ (mín. 700)'}`, inline: true },
    )
    .setColor(meetsFollowers && meetsViews ? COLORS.success : COLORS.danger)
    .setTimestamp();
}

function reservationEmbed(position, max) {
  const full = position >= max;
  return new EmbedBuilder()
    .setTitle('🔥 Reserva de Vaga - Phantom External Basic')
    .setDescription(
      full
        ? '❌ **Todas as vagas foram preenchidas!**'
        : `✅ Sua vaga para o **Phantom External Basic** foi reservada com sucesso!\n\n` +
          `🎁 **Bônus:** Ao reservar sua vaga, você ganha **50% de desconto** no lançamento!\n\n` +
          `📊 Posição: **${position}/${max}**`
    )
    .setColor(full ? COLORS.danger : COLORS.success)
    .setTimestamp();
}

module.exports = {
  COLORS,
  panelEmbed,
  ticketCreatedEmbed,
  ticketClaimedEmbed,
  closeConfirmEmbed,
  logEmbed,
  ratingDmEmbed,
  feedbackEmbed,
  uefiApplicationEmbed,
  influencerApplicationEmbed,
  reservationEmbed,
};
