/**
 * Regra de Segurança #26
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_26',
    aliases: ["regra_seg_26","cmd_seg_regra_26","alt_seg_regra_26","atalho_seg_regra_26","abrev_seg_regra_26","call_seg_regra_26","func_seg_regra_26"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #26',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #26'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #26',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
