module.exports = {
    name: 'receita_encantamento_runa_sol',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Runa Ancestral do Sol Ardente',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: RUNA ANCESTRAL DO SOL ARDENTE* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 10\n'
        txt += '💰 *Custo de Execução:* 6.000 moedas\n'
        txt += '📦 *Materiais Necessários:* 3x Fragmentos de Rubi, 1x Selo Solar\n'
        txt += '✨ *Item Gerado:* Runa do Sol (Gera queimadura contínua no inimigo)\n'
        txt += '📖 *Efeito:* Encanta qualquer arma equipada com efeito de combustão mágica.\n\n'
        txt += 'Para produzir agora: `.forjar encantamento_runa_sol`'
        return reply(txt.trim())
    }
}
