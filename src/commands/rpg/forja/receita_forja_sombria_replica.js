module.exports = {
    name: 'receita_forja_sombria_replica',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Réplica Mágica da Sombria',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: RÉPLICA MÁGICA DA SOMBRIA* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 25\n'
        txt += '💰 *Custo de Execução:* 35.000 moedas\n'
        txt += '📦 *Materiais Necessários:* 10x Aço das Fadas, 5x Cristais de Fogo, 1x Essência do Dragão\n'
        txt += '✨ *Item Gerado:* Sombria Réplica (ATK +350, Clones de Ilusão)\n'
        txt += '📖 *Efeito:* Cria clones mágicos em combate dividindo o dano sofrido entre cópias.\n\n'
        txt += 'Para produzir agora: `.forjar forja_sombria_replica`'
        return reply(txt.trim())
    }
}
