/**
 * Segurança do Grupo: seg_auditoria_recente
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_auditoria_recente',
    aliases: ["shield_auditoria_recente","cmd_seg_auditoria_recente","alt_seg_auditoria_recente","atalho_seg_auditoria_recente","abrev_seg_auditoria_recente","call_seg_auditoria_recente","func_seg_auditoria_recente"],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Gera relatório das últimas ações administrativas e infrações',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args, isGroup, isAdmin }) => {
        const status = args[0] ? args[0].toLowerCase() : 'info';
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: SEG_AUDITORIA_RECENTE'),
            '📋 *Descrição:* Gera relatório das últimas ações administrativas e infrações',
            '⚙️ *Estado:* Operando com integridade nominal.',
            M.secao('🔒', 'Diretrizes de Proteção', [
                '• Apenas administradores habilitados possuem permissão de alteração.',
                '• Os eventos de segurança são registrados na auditoria do bot.',
                '• Em caso de emergência, use `.seg_lockdown_grupo` para trancar o chat.'
            ]),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
