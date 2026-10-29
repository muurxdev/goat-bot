/**
 * Regra de Segurança #73
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_73',
    aliases: ["regra_seg_73","cmd_seg_regra_73","alt_seg_regra_73","atalho_seg_regra_73","abrev_seg_regra_73","call_seg_regra_73","func_seg_regra_73"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #73',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #73'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #73',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
