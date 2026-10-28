/**
 * Comando .setprefix
 * Altera ou consulta o prefixo de comandos no grupo ou globalmente
 */

const dataService = require('../../services/dataService');
const { getBotName } = require('../../config/botConfig');
const env = require('../../config/env');

module.exports = {
    name: 'setprefix',
    aliases: ["prefix","prefixo","mudarprefixo","novoprefixo","cmd_setprefix","alt_setprefix","atalho_setprefix","abrev_setprefix","call_setprefix","func_setprefix"],
    category: 'admin',
    description: 'Mostra ou muda o sinal que vem antes dos comandos neste grupo',
    usage: '[sinal]',
    examples: [' — mostra o sinal atual', '! — os comandos passam a começar com !'],
    adminOnly: true,
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ text, from, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        const currentPrefix = configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.';
        const novoPrefixo = (text || '').trim();
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Admin";

        if (!novoPrefixo) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   ⚙️ *CONFIGURAÇÃO DE PREFIXO* ⚙️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 🏷️ DETALHES DO PREFIXO 〕━⬣\n`;
            doc += `┃ 🔹 *Prefixo no Grupo:* \`${currentPrefix}\`\n`;
            doc += `┃ 🌐 *Prefixo Global:* \`${env.prefix || '.'}\`\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `📌 *Como alterar o prefixo:*\n`;
            doc += `• \`${currentPrefix}setprefix !\` — Muda para \`!\`\n`;
            doc += `• \`${currentPrefix}setprefix #\` — Muda para \`#\`\n`;
            doc += `• \`${currentPrefix}setprefix .\` — Volta para \`.\`\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        if (novoPrefixo.length > 3) {
            return reply('❌ O prefixo deve ter no máximo 3 caracteres.');
        }

        if (!configs[from]) configs[from] = {};
        configs[from].prefix = novoPrefixo;

        await dataService.saveConfigsData(configs);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚙️ *PREFIXO ATUALIZADO* ⚙️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 🏷️ NOVO PREFIXO DE COMANDOS 〕━⬣\n`;
        doc += `┃ 🔹 *Novo Prefixo:* \`${novoPrefixo}\`\n`;
        doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Exemplo de uso:_ \`${novoPrefixo}menu\` ou \`${novoPrefixo}dossie\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), sender ? [sender] : []);
    }
};
