/**
 * Regra de Segurança #20
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_20',
    aliases: ["regra_seg_20","cmd_seg_regra_20","alt_seg_regra_20","atalho_seg_regra_20","abrev_seg_regra_20","call_seg_regra_20","func_seg_regra_20"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #20',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #20'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #20',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
