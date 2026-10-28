/**
 * Regra de Segurança #25
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_25',
    aliases: ["regra_seg_25","cmd_seg_regra_25","alt_seg_regra_25","atalho_seg_regra_25","abrev_seg_regra_25","call_seg_regra_25","func_seg_regra_25"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #25',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #25'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #25',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
