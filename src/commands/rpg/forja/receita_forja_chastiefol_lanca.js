module.exports = {
    name: 'receita_forja_chastiefol_lanca',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Lança Espiritual Espiritual Reforçada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: LANÇA ESPIRITUAL ESPIRITUAL REFORÇADA* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 20\n'
        txt += '💰 *Custo de Execução:* 28.000 moedas\n'
        txt += '📦 *Materiais Necessários:* 8x Troncos da Árvore Sagrada, 4x Pólen das Fadas\n'
        txt += '✨ *Item Gerado:* Espiritual (ATK +280, Troca de Formas)\n'
        txt += '📖 *Efeito:* Permite alternar entre formato lança de ataque rápido e formato travesseiro de defesa.\n\n'
        txt += 'Para produzir agora: `.forjar forja_chastiefol_lanca`'
        return reply(txt.trim())
    }
}
