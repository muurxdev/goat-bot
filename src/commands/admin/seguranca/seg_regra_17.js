/**
 * Regra de Segurança #17
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_17',
    aliases: ["regra_seg_17","cmd_seg_regra_17","alt_seg_regra_17","atalho_seg_regra_17","abrev_seg_regra_17","call_seg_regra_17","func_seg_regra_17"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #17',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #17'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #17',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
