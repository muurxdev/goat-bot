const F = require('../../../utils/formato')

module.exports = {
    name: 'campeonato',
    aliases: ['campeonatos', 'ligas', 'futebolmenu'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Central dos principais campeonatos de futebol do mundo',
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
        let doc = `╔══════════════════════════════════════╗\n`
        doc += `║  ⚽  CLUBE DOS CAMPEÕES // GOAT 10   ║\n`
        doc += `╚══════════════════════════════════════╝\n`
        doc += `       GOAT OFFICIAL SYSTEM\n\n`
        doc += `🏆 *TABELAS INTEIRAS EM TEMPO REAL:*\n`
        doc += `• \`${prefix}brasileirao\` — Brasileirão Série A (todos os 20 clubes)\n`
        doc += `• \`${prefix}serieb\` — Brasileirão Série B (todos os 20 clubes)\n`
        doc += `• \`${prefix}champions\` — UEFA Champions League (Fase de Liga de 36 clubes)\n`
        doc += `• \`${prefix}libertadores\` — Copa Libertadores (Grupos A ao H)\n`
        doc += `• \`${prefix}premier\` — Premier League Inglesa\n`
        doc += `• \`${prefix}laliga\` — La Liga Espanhola\n\n`
        doc += `🏟️ *JOGOS & PLACARES:*\n`
        doc += `• \`${prefix}jogos\` — Partidas de hoje e placares ao vivo\n`
        doc += `• \`${prefix}tabela <liga>\` — Busca direta de qualquer tabela\n\n`
        doc += `──────────────────────────────────────\n`
        doc += `🧭 *COMANDOS PARA AJUDAR:*\n`
        doc += `• \`${prefix}brasileirao\` — Ver tabela do Brasileirão Série A\n`
        doc += `• \`${prefix}champions\` — Ver tabela da Champions League\n`
        doc += `• \`${prefix}libertadores\` — Ver grupos da Copa Libertadores\n`
        doc += `• \`${prefix}jogos\` — Ver jogos de hoje\n`
        doc += `• \`${prefix}orientacao futebol\` — Manual completo do módulo`
        return reply(doc)
    }
}
