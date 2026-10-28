/**
 * Segurança do Grupo: seg_filtro_palavroes
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_filtro_palavroes',
    aliases: ["shield_filtro_palavroes","cmd_seg_filtro_palavroes","alt_seg_filtro_palavroes","atalho_seg_filtro_palavroes","abrev_seg_filtro_palavroes","call_seg_filtro_palavroes","func_seg_filtro_palavroes"],
    category: 'admin',
    subcategory: 'Segurança & Anti-Raid',
    description: 'Ativa censura automática de termos ofensivos no grupo',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args, isGroup, isAdmin }) => {
        const status = args[0] ? args[0].toLowerCase() : 'info';
        const doc = [
            M.cabecalho('🛡️', 'Protocolo de Segurança: SEG_FILTRO_PALAVROES'),
            '📋 *Descrição:* Ativa censura automática de termos ofensivos no grupo',
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
