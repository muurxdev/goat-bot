module.exports = {
    name: 'receita_pocao_vida_suprema',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Elixir da Vitalidade Divina',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: ELIXIR DA VITALIDADE DIVINA* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 5\n'
        txt += '💰 *Custo de Execução:* 1.500 moedas\n'
        txt += '📦 *Materiais Necessários:* 2x Frascos de Cristal, 1x Água Sagrada\n'
        txt += '✨ *Item Gerado:* Elixir da Vitalidade (+500 HP instantâneo)\n'
        txt += '📖 *Efeito:* Restaura totalmente os pontos de vida e confere regeneração passiva por 1 hora.\n\n'
        txt += 'Para produzir agora: `.forjar pocao_vida_suprema`'
        return reply(txt.trim())
    }
}
