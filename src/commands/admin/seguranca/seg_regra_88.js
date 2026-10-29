/**
 * Regra de Segurança #88
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_88',
    aliases: ["regra_seg_88","cmd_seg_regra_88","alt_seg_regra_88","atalho_seg_regra_88","abrev_seg_regra_88","call_seg_regra_88","func_seg_regra_88"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #88',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #88'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #88',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
