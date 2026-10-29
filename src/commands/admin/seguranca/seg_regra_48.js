/**
 * Regra de Segurança #48
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_48',
    aliases: ["regra_seg_48","cmd_seg_regra_48","alt_seg_regra_48","atalho_seg_regra_48","abrev_seg_regra_48","call_seg_regra_48","func_seg_regra_48"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #48',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #48'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #48',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
