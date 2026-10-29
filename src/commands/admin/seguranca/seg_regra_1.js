/**
 * Regra de Segurança #1
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_1',
    aliases: ["regra_seg_1","cmd_seg_regra_1","alt_seg_regra_1","atalho_seg_regra_1","abrev_seg_regra_1","call_seg_regra_1","func_seg_regra_1"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #1',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #1'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #1',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
