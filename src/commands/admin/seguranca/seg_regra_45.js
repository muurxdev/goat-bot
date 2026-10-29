/**
 * Regra de Segurança #45
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_45',
    aliases: ["regra_seg_45","cmd_seg_regra_45","alt_seg_regra_45","atalho_seg_regra_45","abrev_seg_regra_45","call_seg_regra_45","func_seg_regra_45"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #45',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #45'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #45',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
