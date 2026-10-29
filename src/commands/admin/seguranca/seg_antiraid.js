/**
 * Segurança do Grupo: seg_antiraid / antiraid
 */
const M = require('../../../utils/moldura');
const dataService = require('../../../services/dataService');
const logger = require('../../../core/logger');

module.exports = {
    name: 'seg_antiraid',
    aliases: [
        "antiraid", "shield_antiraid", "cmd_seg_antiraid", "alt_seg_antiraid",
        "atalho_seg_antiraid", "abrev_seg_antiraid", "call_seg_antiraid", "func_seg_antiraid"
    ],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Ativa ou desativa o protocolo defensivo contra ataques e invasões coordenadas no grupo',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2500,
    execute: async ({ from, reply, args = [], isGroup, isAdmin, sender, prefix = "." }) => {
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || '').toLowerCase().trim();
        const isEnable = ["on", "1", "ativar", "sim", "ligar"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao", "desligar"].includes(opt);

        if (isEnable) {
            configs[from].antiraid = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTIRAID] Ativado em ${from} por ${sender}`);
            return reply(
                `🛡️ *PROTOCOLO ANTI-RAID: ATIVADO!*\n\n` +
                `O grupo está sob vigilância contra invasões em massa e ataques coordenados. Entradas suspeitas e flood de ingressos serão bloqueados.`
            );
        }

        if (isDisable) {
            configs[from].antiraid = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTIRAID] Desativado em ${from} por ${sender}`);
            return reply(
                `🛡️ *PROTOCOLO ANTI-RAID: DESATIVADO!*\n\n` +
                `A proteção anti-raid foi desligada no grupo.`
            );
        }

        const isAtivo = Boolean(configs[from].antiraid);
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: ANTI-RAID'),
            '📋 *Descrição:* Defesa ativa contra ataques, spam massivo e invasões de links de terceiros',
            `⚙️ *Estado:* ${isAtivo ? '🟢 *ATIVADO*' : '🔴 *DESLIGADO*'}`,
            M.secao('🔒', 'Diretrizes de Proteção', [
                `• \`${prefix}antiraid on\` ➔ Ativar protocolo defensivo`,
                `• \`${prefix}antiraid off\` ➔ Desativar protocolo defensivo`,
                '• Em caso de invasão em andamento, use `.seg_lockdown_grupo` para trancar o chat.'
            ]),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
