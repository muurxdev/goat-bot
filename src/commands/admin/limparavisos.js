/**
 * Comando .limparavisos / .resetwarns / .rwarns
 * Reseta as advertências de um usuário específico ou de todos os membros do grupo
 */

const dataService = require('../../services/dataService');
const groupRemovalService = require('../../services/groupRemovalService');
const logger = require('../../core/logger');

module.exports = {
    name: 'limparavisos',
    aliases: ["resetwarns","rwarns","zeraravisos","unwarn","delwarn","limparwarns","cmd_limparavisos","alt_limparavisos","atalho_limparavisos","abrev_limparavisos","call_limparavisos","func_limparavisos"],
    category: 'admin',
    description: 'Reseta as advertências de um membro ou de todos no grupo',
    usage: '<@pessoa | all>',
    examples: ['@fulano — zera as advertências da pessoa', 'all — zera as de todo o grupo'],
    groupOnly: true,
    adminOnly: true,
    execute: async ({ client, from, args = [], mentioned, quotedSender, info, reply, sender, prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase().trim();
        const warns = dataService.getWarnsData();

        if (['all', 'todos', 'tudo', 'grupo'].includes(sub)) {
            let zerados = 0;
            try {
                const metadata = await client.groupMetadata(from);
                for (const p of metadata?.participants || []) {
                    if (warns[p.id]) {
                        warns[p.id] = 0;
                        zerados++;
                    }
                }
            } catch (err) {
                // Sem a lista de membros não dá para saber quem é deste grupo;
                // zerar todo mundo é o que o pedido "todos" mais se aproxima.
                logger.warn(`[RESET WARNS] Sem metadata de ${from} (${err.message}); zerando todos os registros conhecidos.`);
                for (const k of Object.keys(warns)) {
                    if (warns[k]) {
                        warns[k] = 0;
                        zerados++;
                    }
                }
            }

            await dataService.saveWarnsData(warns);
            logger.info(`[RESET WARNS] ${sender} zerou as advertências de ${from} (${zerados})`);
            if (!zerados) return reply('✅ Ninguém tinha advertência neste grupo.');
            return reply(`✅ Zerei as advertências do grupo (${zerados} ${zerados === 1 ? 'pessoa' : 'pessoas'}).`);
        }

        const targetJid = groupRemovalService.extrairAlvo({ info, args, quotedSender, mentioned });
        if (!targetJid) {
            return reply(
                `❓ Diga de quem zerar as advertências:\n\n` +
                `• \`${prefix}limparavisos @pessoa\`\n` +
                `• \`${prefix}limparavisos all\` — todo mundo do grupo`
            );
        }

        const targetNum = targetJid.split('@')[0].split(':')[0];
        const anteriores = warns[targetJid] || 0;
        warns[targetJid] = 0;
        await dataService.saveWarnsData(warns);

        logger.info(`[RESET WARNS] ${sender} zerou as advertências de ${targetJid} (tinha ${anteriores})`);

        const texto = anteriores
            ? `✅ Zerei as advertências de @${targetNum} (tinha ${anteriores}).`
            : `✅ @${targetNum} não tinha nenhuma advertência.`;
        await client.sendMessage(from, { text: texto, mentions: [targetJid, sender] });
    }
};
