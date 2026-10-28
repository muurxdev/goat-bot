/**
 * Regra de Segurança #77
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_77',
    aliases: ["regra_seg_77","cmd_seg_regra_77","alt_seg_regra_77","atalho_seg_regra_77","abrev_seg_regra_77","call_seg_regra_77","func_seg_regra_77"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #77',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #77'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #77',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
