/**
 * Segurança do Grupo: seg_antispam_agressivo
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_antispam_agressivo',
    aliases: ["shield_antispam_agressivo","cmd_seg_antispam_agressivo","alt_seg_antispam_agressivo","atalho_seg_antispam_agressivo","abrev_seg_antispam_agressivo","call_seg_antispam_agressivo","func_seg_antispam_agressivo"],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Ajusta a sensibilidade do filtro de repetição de mensagens',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args, isGroup, isAdmin }) => {
        const status = args[0] ? args[0].toLowerCase() : 'info';
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: SEG_ANTISPAM_AGRESSIVO'),
            '📋 *Descrição:* Ajusta a sensibilidade do filtro de repetição de mensagens',
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
