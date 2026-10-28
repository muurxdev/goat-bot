/**
 * Regra de Segurança #78
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_78',
    aliases: ["regra_seg_78","cmd_seg_regra_78","alt_seg_regra_78","atalho_seg_regra_78","abrev_seg_regra_78","call_seg_regra_78","func_seg_regra_78"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #78',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #78'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #78',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
