/**
 * Regra de Segurança #13
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_13',
    aliases: ["regra_seg_13","cmd_seg_regra_13","alt_seg_regra_13","atalho_seg_regra_13","abrev_seg_regra_13","call_seg_regra_13","func_seg_regra_13"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #13',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #13'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #13',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
