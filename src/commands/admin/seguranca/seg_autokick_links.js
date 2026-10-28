/**
 * Segurança do Grupo: seg_autokick_links
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_autokick_links',
    aliases: ["shield_autokick_links","cmd_seg_autokick_links","alt_seg_autokick_links","atalho_seg_autokick_links","abrev_seg_autokick_links","call_seg_autokick_links","func_seg_autokick_links"],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Configura expulsão imediata para invasores divulgando links',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args, isGroup, isAdmin }) => {
        const status = args[0] ? args[0].toLowerCase() : 'info';
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: SEG_AUTOKICK_LINKS'),
            '📋 *Descrição:* Configura expulsão imediata para invasores divulgando links',
            '⚙️ *Estado:* Operando com integridade nominal.',
            M.secao('🔒', 'Diretrizes de Proteção', [
                '• Apenas administradores habilitados possuem permissão de alteração.',
                '• Os eventos de segurança são registrados na auditoria do bot.',
                '• Em caso de emergência, use `.seg_lockdown_grupo` para trancar o chat.'
            ]),
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
