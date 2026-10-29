/**
 * Regra de Segurança #83
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_83',
    aliases: ["regra_seg_83","cmd_seg_regra_83","alt_seg_regra_83","atalho_seg_regra_83","abrev_seg_regra_83","call_seg_regra_83","func_seg_regra_83"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #83',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #83'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #83',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
