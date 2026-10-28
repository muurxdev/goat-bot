/**
 * Regra de Segurança #7
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_7',
    aliases: ["regra_seg_7","cmd_seg_regra_7","alt_seg_regra_7","atalho_seg_regra_7","abrev_seg_regra_7","call_seg_regra_7","func_seg_regra_7"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #7',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #7'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #7',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
