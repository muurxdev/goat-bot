/**
 * Regra de Segurança #84
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_84',
    aliases: ["regra_seg_84","cmd_seg_regra_84","alt_seg_regra_84","atalho_seg_regra_84","abrev_seg_regra_84","call_seg_regra_84","func_seg_regra_84"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #84',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #84'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #84',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
