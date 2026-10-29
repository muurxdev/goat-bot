/**
 * Regra de Segurança #63
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_63',
    aliases: ["regra_seg_63","cmd_seg_regra_63","alt_seg_regra_63","atalho_seg_regra_63","abrev_seg_regra_63","call_seg_regra_63","func_seg_regra_63"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #63',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #63'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #63',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
