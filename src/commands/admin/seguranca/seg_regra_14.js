/**
 * Regra de Segurança #14
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_14',
    aliases: ["regra_seg_14","cmd_seg_regra_14","alt_seg_regra_14","atalho_seg_regra_14","abrev_seg_regra_14","call_seg_regra_14","func_seg_regra_14"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #14',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #14'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #14',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
