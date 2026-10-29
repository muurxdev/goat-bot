/**
 * Regra de Segurança #66
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_66',
    aliases: ["regra_seg_66","cmd_seg_regra_66","alt_seg_regra_66","atalho_seg_regra_66","abrev_seg_regra_66","call_seg_regra_66","func_seg_regra_66"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #66',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #66'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #66',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
