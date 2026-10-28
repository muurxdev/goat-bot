/**
 * Regra de Segurança #30
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_30',
    aliases: ["regra_seg_30","cmd_seg_regra_30","alt_seg_regra_30","atalho_seg_regra_30","abrev_seg_regra_30","call_seg_regra_30","func_seg_regra_30"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #30',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #30'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #30',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
