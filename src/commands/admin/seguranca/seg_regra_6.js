/**
 * Regra de Segurança #6
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_6',
    aliases: ["regra_seg_6","cmd_seg_regra_6","alt_seg_regra_6","atalho_seg_regra_6","abrev_seg_regra_6","call_seg_regra_6","func_seg_regra_6"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #6',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #6'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #6',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
