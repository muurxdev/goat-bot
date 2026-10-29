const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .clonartags / .extrairtags
 * Extrai menções e tags de uma mensagem citada e permite reutilizá-las
 */

module.exports = {
    name: 'clonartags',
    aliases: ["extrairtags","pegarmentions","gettags","cmd_clonartags","alt_clonartags","atalho_clonartags","abrev_clonartags","call_clonartags","func_clonartags"],
    category: 'adicional',
    subcategory: '⚡ RECURSOS & COMANDOS ADICIONAIS',
    description: 'Extrai e formata menções de mensagens respondidas para reenvio fácil',
    cooldownMs: 2000,
    execute: async ({ reply, info, prefix = '.' }) => {
        const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentions = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (!mentions || mentions.length === 0) {
            return reply(`📋 *Extrator de Menções & Tags*\n\nResponda a uma mensagem que contenha marcações (@alguém) com \`${prefix}clonartags\` para extrair todas as menções de uma só vez!`);
        }

        const listaTags = mentions.map(m => `${nomeDoMembro(m)}`).join(' ');

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║     📋 *TAGS EXTRAÍDAS* 📋      ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👥 *Total de Membros Marcados:* ${mentions.length}\n\n`;
        doc += `╭━〔 🏷️ LISTA PARA REENVIO 〕━⬣\n`;
        doc += `${listaTags}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Copie o bloco acima para marcar exatamente as mesmas pessoas!_`;

        return reply(doc.trim(), mentions);
    }
};