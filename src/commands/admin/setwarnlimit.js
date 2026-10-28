/**
 * Comando .setwarnlimit / .limitewarn / .limiteavisos
 * Define o limite máximo de advertências do grupo antes da expulsão automática
 */

const dataService = require('../../services/dataService');

module.exports = {
    name: 'setwarnlimit',
    aliases: ["limitewarn","limiteavisos","maxwarns","setlimiteavisos","cmd_setwarnlimit","alt_setwarnlimit","atalho_setwarnlimit","abrev_setwarnlimit","call_setwarnlimit","func_setwarnlimit"],
    category: 'admin',
    description: 'Define o limite máximo de advertências do grupo antes da expulsão',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, prefix = '.' }) => {
        const novoLimite = parseInt(args[0], 10);
        if (isNaN(novoLimite) || novoLimite < 1 || novoLimite > 20) {
            return reply(`❌ Informe a quantidade de advertências desejada de 1 a 20 (ex: \`${prefix}setwarnlimit 5\`).`);
        }

        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        configs[from].warnLimit = novoLimite;
        await dataService.saveConfigsData(configs);

        return reply(`✅ *LIMITE DE ADVERTÊNCIAS ATUALIZADO!*\n\n⚠️ O limite de advertências deste grupo foi configurado para *${novoLimite} avisos* antes da expulsão.`);
    }
};

