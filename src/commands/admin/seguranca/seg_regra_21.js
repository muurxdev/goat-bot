/**
 * Regra de Segurança #21
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_21',
    aliases: ["regra_seg_21","cmd_seg_regra_21","alt_seg_regra_21","atalho_seg_regra_21","abrev_seg_regra_21","call_seg_regra_21","func_seg_regra_21"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #21',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #21'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #21',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
