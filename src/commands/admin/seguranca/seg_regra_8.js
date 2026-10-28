/**
 * Regra de Segurança #8
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_8',
    aliases: ["regra_seg_8","cmd_seg_regra_8","alt_seg_regra_8","atalho_seg_regra_8","abrev_seg_regra_8","call_seg_regra_8","func_seg_regra_8"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #8',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #8'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #8',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
