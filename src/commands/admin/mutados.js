/**
 * Comando .mutados / .listamutados
 * Lista todos os membros atualmente silenciados no grupo com tempo restante e motivos
 */

const muteService = require('../../services/muteService');
const F = require('../../utils/formato');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'mutados',
    aliases: ["listamutados","silenciados","vermutados","mutadosgrupo","cmd_mutados","alt_mutados","atalho_mutados","abrev_mutados","call_mutados","func_mutados"],
    category: 'admin',
    description: 'Lista todos os membros atualmente silenciados no grupo',
    examples: [' — lista quem está silenciado e por quanto tempo'],
    groupOnly: true,
    execute: async ({ client, from, reply, prefix = '.' }) => {
        const botName = getBotName();
        const mutados = muteService.getMutedMembers(from);

        if (!mutados || mutados.length === 0) {
            return reply(F.tela({
                emoji: '🔊', titulo: 'Ninguém silenciado', prefix,
                intro: 'Nenhum membro está silenciado neste grupo agora. Quando alguém estiver, aparece aqui com o tempo que falta, o motivo e quem aplicou.',
                proximos: [
                    { nome: 'mute', args: '@pessoa 10m motivo', oque: 'silencia alguém por 10 minutos' },
                    { nome: 'warn', args: '@pessoa motivo', oque: 'adverte sem silenciar' }
                ]
            }));
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔇 *MEMBROS SILENCIADOS* (${mutados.length}) 🔇   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;

        const mentions = [];

        mutados.forEach((m, idx) => {
            const num = m.userJid.split('@')[0].split(':')[0];
            mentions.push(m.userJid);
            doc += `╭━〔 #${idx + 1} @${num} 〕━⬣\n`;
            doc += `┃ ⏱️ *Tempo Restante:* ${m.remainingText}\n`;
            doc += `┃ 📝 *Motivo:* ${m.reason || 'Não informado'}\n`;
            doc += `┃ 🛡️ *Silenciado por:* ${m.mutedBy || 'Admin'}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        });

        doc += `💡 *Para desmutar:* \`${prefix}unmute @usuario\` ou \`${prefix}unmute all\`\n`;
        doc += `👑 *${botName}*`;

        await client.sendMessage(from, {
            text: doc.trim(),
            mentions
        });
    }
};

