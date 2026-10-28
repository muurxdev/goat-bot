/**
 * Regra de Segurança #37
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'seg_regra_37',
    aliases: ["regra_seg_37","cmd_seg_regra_37","alt_seg_regra_37","atalho_seg_regra_37","abrev_seg_regra_37","call_seg_regra_37","func_seg_regra_37"],
    category: 'admin',
    subcategory: 'Regras de Segurança',
    description: 'Parâmetro de proteção e compliance de grupo #37',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const doc = [
            M.cabecalho('🛡️', 'Regra de Segurança #37'),
            '⚙️ *Parâmetro:* Defesa Ativa e Integridade do Grupo #37',
            '🔒 *Status:* Ativo e em conformidade com as diretrizes do reino.',
            M.assinatura('GOAT Security Shield')
        ].join('\n\n');
        return reply(doc);
    }
};
