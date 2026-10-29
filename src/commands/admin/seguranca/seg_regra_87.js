/**
 * Regra de Segurança #87
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_87',
    aliases: ["regra_seg_87","cmd_seg_regra_87","alt_seg_regra_87","atalho_seg_regra_87","abrev_seg_regra_87","call_seg_regra_87","func_seg_regra_87"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #87',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #87'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #87',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
