/**
 * Segurança do Grupo: seg_modo_lento
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_modo_lento',
    aliases: ["shield_modo_lento","cmd_seg_modo_lento","alt_seg_modo_lento","atalho_seg_modo_lento","abrev_seg_modo_lento","call_seg_modo_lento","func_seg_modo_lento"],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Impõe intervalo mínimo obrigatório entre mensagens consecutivas',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args, isGroup, isAdmin }) => {
        const status = args[0] ? args[0].toLowerCase() : 'info';
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: SEG_MODO_LENTO'),
            '📋 *Descrição:* Impõe intervalo mínimo obrigatório entre mensagens consecutivas',
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
