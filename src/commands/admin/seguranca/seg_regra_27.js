/**
 * Regra de Segurança #27
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_27',
    aliases: ["regra_seg_27","cmd_seg_regra_27","alt_seg_regra_27","atalho_seg_regra_27","abrev_seg_regra_27","call_seg_regra_27","func_seg_regra_27"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #27',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #27'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #27',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
