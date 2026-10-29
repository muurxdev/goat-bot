/**
 * Regra de Segurança #36
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_36',
    aliases: ["regra_seg_36","cmd_seg_regra_36","alt_seg_regra_36","atalho_seg_regra_36","abrev_seg_regra_36","call_seg_regra_36","func_seg_regra_36"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #36',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #36'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #36',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
