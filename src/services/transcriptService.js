const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

const transcriptsDir = path.resolve('./transcripts');
if (!fs.existsSync(transcriptsDir)) {
  fs.mkdirSync(transcriptsDir, { recursive: true });
}

function generateTranscript(ticket, messages, guild) {
  const lines = [
    `=================================================`,
    `📋 TRANSCRIPT — TICKET #${ticket.id}`,
    `=================================================`,
    `Categoria : ${ticket.category}`,
    `Servidor  : ${guild.name}`,
    `Aberto por: ${ticket.owner_id} (${ticket.created_at})`,
    ticket.claimed_by ? `Atendido por: ${ticket.claimed_by}` : `Atendido por: Ninguém`,
    `Fechado em: ${ticket.closed_at || new Date().toISOString()}`,
    `=================================================\n`
  ];

  for (const msg of messages) {
    const attachments = JSON.parse(msg.attachments || '[]');
    const attachText = attachments.length > 0 ? ` [Anexos: ${attachments.join(', ')}]` : '';
    lines.push(`[${msg.created_at}] ${msg.author_name}: ${msg.content || ''}${attachText}`);
  }

  lines.push(`\n=================================================`);
  lines.push(`Total de mensagens: ${messages.length}`);
  lines.push(`Gerado em: ${new Date().toISOString()}`);

  const text = lines.join('\n');
  const filename = `ticket-${ticket.id}-${Date.now()}.txt`;
  const filepath = path.join(transcriptsDir, filename);
  fs.writeFileSync(filepath, text, 'utf8');
  logger.info(`Transcript generated: ${filename}`);
  return { filepath, filename };
}

function cleanOldTranscripts(maxAgeMs = 24 * 60 * 60 * 1000) {
  if (!fs.existsSync(transcriptsDir)) return;
  const now = Date.now();
  const files = fs.readdirSync(transcriptsDir);
  let cleaned = 0;
  for (const file of files) {
    const filepath = path.join(transcriptsDir, file);
    const stat = fs.statSync(filepath);
    if (now - stat.mtimeMs > maxAgeMs) {
      fs.unlinkSync(filepath);
      cleaned++;
    }
  }
  if (cleaned > 0) logger.info(`Cleaned ${cleaned} old transcript(s)`);
}

module.exports = { generateTranscript, cleanOldTranscripts };
