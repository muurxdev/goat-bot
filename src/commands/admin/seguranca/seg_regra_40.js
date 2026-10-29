/**
 * Regra de Segurança #40
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_40',
    aliases: ["regra_seg_40","cmd_seg_regra_40","alt_seg_regra_40","atalho_seg_regra_40","abrev_seg_regra_40","call_seg_regra_40","func_seg_regra_40"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #40',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #40'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #40',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
