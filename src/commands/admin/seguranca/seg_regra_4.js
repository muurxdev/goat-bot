/**
 * Regra de Segurança #4
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_4',
    aliases: ["regra_seg_4","cmd_seg_regra_4","alt_seg_regra_4","atalho_seg_regra_4","abrev_seg_regra_4","call_seg_regra_4","func_seg_regra_4"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #4',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #4'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #4',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
