/**
 * Regra de Segurança #56
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_56',
    aliases: ["regra_seg_56","cmd_seg_regra_56","alt_seg_regra_56","atalho_seg_regra_56","abrev_seg_regra_56","call_seg_regra_56","func_seg_regra_56"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #56',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #56'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #56',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
