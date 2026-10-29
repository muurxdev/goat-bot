/**
 * Regra de Segurança #52
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_52',
    aliases: ["regra_seg_52","cmd_seg_regra_52","alt_seg_regra_52","atalho_seg_regra_52","abrev_seg_regra_52","call_seg_regra_52","func_seg_regra_52"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #52',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #52'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #52',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
