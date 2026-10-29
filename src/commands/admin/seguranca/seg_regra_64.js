/**
 * Regra de Segurança #64
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_64',
    aliases: ["regra_seg_64","cmd_seg_regra_64","alt_seg_regra_64","atalho_seg_regra_64","abrev_seg_regra_64","call_seg_regra_64","func_seg_regra_64"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #64',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #64'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #64',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
