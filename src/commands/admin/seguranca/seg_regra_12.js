/**
 * Regra de Segurança #12
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_12',
    aliases: ["regra_seg_12","cmd_seg_regra_12","alt_seg_regra_12","atalho_seg_regra_12","abrev_seg_regra_12","call_seg_regra_12","func_seg_regra_12"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #12',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #12'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #12',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
