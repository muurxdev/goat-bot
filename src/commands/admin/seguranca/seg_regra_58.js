/**
 * Regra de Segurança #58
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_58',
    aliases: ["regra_seg_58","cmd_seg_regra_58","alt_seg_regra_58","atalho_seg_regra_58","abrev_seg_regra_58","call_seg_regra_58","func_seg_regra_58"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #58',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #58'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #58',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
