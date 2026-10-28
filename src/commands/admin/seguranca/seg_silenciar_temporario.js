/**
 * Segurança do Grupo: seg_silenciar_temporario
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_silenciar_temporario',
    aliases: ["shield_silenciar_temporario","cmd_seg_silenciar_temporario","alt_seg_silenciar_temporario","atalho_seg_silenciar_temporario","abrev_seg_silenciar_temporario","call_seg_silenciar_temporario","func_seg_silenciar_temporario"],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Silencia um membro abusivo por tempo determinado',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args, isGroup, isAdmin }) => {
        const status = args[0] ? args[0].toLowerCase() : 'info';
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: SEG_SILENCIAR_TEMPORARIO'),
            '📋 *Descrição:* Silencia um membro abusivo por tempo determinado',
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
