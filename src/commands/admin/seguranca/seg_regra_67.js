/**
 * Regra de Segurança #67
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_67',
    aliases: ["regra_seg_67","cmd_seg_regra_67","alt_seg_regra_67","atalho_seg_regra_67","abrev_seg_regra_67","call_seg_regra_67","func_seg_regra_67"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #67',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #67'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #67',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
