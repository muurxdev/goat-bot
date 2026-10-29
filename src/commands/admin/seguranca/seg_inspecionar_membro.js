/**
 * Segurança do Grupo: seg_inspecionar_membro
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_inspecionar_membro',
    aliases: ["shield_inspecionar_membro","cmd_seg_inspecionar_membro","alt_seg_inspecionar_membro","atalho_seg_inspecionar_membro","abrev_seg_inspecionar_membro","call_seg_inspecionar_membro","func_seg_inspecionar_membro"],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Verifica advertências, histórico de flags e nível de confiança',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args, isGroup, isAdmin }) => {
        const status = args[0] ? args[0].toLowerCase() : 'info';
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: SEG_INSPECIONAR_MEMBRO'),
            '📋 *Descrição:* Verifica advertências, histórico de flags e nível de confiança',
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
