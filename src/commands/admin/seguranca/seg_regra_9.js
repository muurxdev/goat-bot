/**
 * Regra de Segurança #9
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_9',
    aliases: ["regra_seg_9","cmd_seg_regra_9","alt_seg_regra_9","atalho_seg_regra_9","abrev_seg_regra_9","call_seg_regra_9","func_seg_regra_9"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #9',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #9'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #9',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
