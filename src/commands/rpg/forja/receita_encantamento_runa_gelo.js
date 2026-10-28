module.exports = {
    name: 'receita_encantamento_runa_gelo',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Runa do Vento Congelante',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: RUNA DO VENTO CONGELANTE* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 10\n'
        txt += '💰 *Custo de Execução:* 6.000 moedas\n'
        txt += '📦 *Materiais Necessários:* 3x Safiras da Montanha, 1x Selo de Gelo\n'
        txt += '✨ *Item Gerado:* Runa do Gelo (Reduz ataque e velocidade do alvo)\n'
        txt += '📖 *Efeito:* Encanta armaduras para congelar oponentes que desferirem ataques corpo a corpo.\n\n'
        txt += 'Para produzir agora: `.forjar encantamento_runa_gelo`'
        return reply(txt.trim())
    }
}
