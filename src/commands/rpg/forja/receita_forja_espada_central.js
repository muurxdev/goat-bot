module.exports = {
    name: 'receita_forja_espada_central',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Espada Longa dos Cavaleiros Sagrados',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: ESPADA LONGA DOS CAVALEIROS SAGRADOS* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 12\n'
        txt += '💰 *Custo de Execução:* 8.000 moedas\n'
        txt += '📦 *Materiais Necessários:* 5x Lingotes de Aço Reforçado, 2x Fragmentos de Luz\n'
        txt += '✨ *Item Gerado:* Espada Longa Central (ATK +120, Crítico +10%)\n'
        txt += '📖 *Efeito:* Arma padrão de alta nobreza com lâmina de corte afiado e encantamento sagrado.\n\n'
        txt += 'Para produzir agora: `.forjar forja_espada_central`'
        return reply(txt.trim())
    }
}
