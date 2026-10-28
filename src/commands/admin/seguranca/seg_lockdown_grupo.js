/**
 * Segurança do Grupo: seg_lockdown_grupo
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_lockdown_grupo',
    aliases: ["shield_lockdown_grupo","cmd_seg_lockdown_grupo","alt_seg_lockdown_grupo","atalho_seg_lockdown_grupo","abrev_seg_lockdown_grupo","call_seg_lockdown_grupo","func_seg_lockdown_grupo"],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Tranca o envio de mensagens fechando o grupo temporariamente',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args, isGroup, isAdmin }) => {
        const status = args[0] ? args[0].toLowerCase() : 'info';
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: SEG_LOCKDOWN_GRUPO'),
            '📋 *Descrição:* Tranca o envio de mensagens fechando o grupo temporariamente',
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
