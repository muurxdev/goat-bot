/**
 * Regra de Segurança #38
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_38',
    aliases: ["regra_seg_38","cmd_seg_regra_38","alt_seg_regra_38","atalho_seg_regra_38","abrev_seg_regra_38","call_seg_regra_38","func_seg_regra_38"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #38',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #38'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #38',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
