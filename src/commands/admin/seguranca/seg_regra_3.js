/**
 * Regra de Segurança #3
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_3',
    aliases: ["regra_seg_3","cmd_seg_regra_3","alt_seg_regra_3","atalho_seg_regra_3","abrev_seg_regra_3","call_seg_regra_3","func_seg_regra_3"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #3',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #3'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #3',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
