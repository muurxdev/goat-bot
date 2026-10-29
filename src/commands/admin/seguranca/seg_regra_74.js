/**
 * Regra de Segurança #74
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_74',
    aliases: ["regra_seg_74","cmd_seg_regra_74","alt_seg_regra_74","atalho_seg_regra_74","abrev_seg_regra_74","call_seg_regra_74","func_seg_regra_74"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #74',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #74'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #74',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
