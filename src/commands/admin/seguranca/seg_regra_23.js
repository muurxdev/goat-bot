/**
 * Regra de Segurança #23
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_23',
    aliases: ["regra_seg_23","cmd_seg_regra_23","alt_seg_regra_23","atalho_seg_regra_23","abrev_seg_regra_23","call_seg_regra_23","func_seg_regra_23"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #23',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #23'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #23',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
