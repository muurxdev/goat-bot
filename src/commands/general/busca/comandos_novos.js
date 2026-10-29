/**
 * Busca & Navegação: comandos_novos
 */
module.exports = {
    name: 'comandos_novos',
    aliases: ["novidades_10k"],
    category: 'general',
    subcategory: 'Busca & Descoberta',
    description: 'Exibe as maiores adições da expansão épica de 10.000 comandos',
    cooldownMs: 2000,
    loreExempt: true,
    execute: async ({ reply, args, text, sender }) => {
        const M = require('../../../utils/moldura');
        const doc = [
            M.cabecalho('🚀', 'Expansão Épica de 10.000 Comandos'),
            '✨ *➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ atinge sua capacidade máxima!*',
            M.secao('🌟', 'Grandes Destaques', [
                '• Bolsa de Valores e Empresas Tycoon (.bolsa, .empresas)',
                '• Sistema Bancário e Empréstimos (.banco, .cdb)',
                '• Clãs Territoriais e Raids de Grupo (.cla, .raid_iniciar)',
                '• 118 Elementos e Atlas Mundial (.tabelaperiodica, .pais_brasil)',
                '• Filtros de Áudio FFmpeg e Personas IA (.af_bassboost, .ia_goat)',
                '• Mais de 500 Trivias e Minigames (.quiz, .jogo_d20)',
                '• Vitrine de Conquistas e Busca Universal (.badge_vitrine, .buscar)'
            ]),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')
        ].join('\n\n');
        return reply(doc);
    }
};
