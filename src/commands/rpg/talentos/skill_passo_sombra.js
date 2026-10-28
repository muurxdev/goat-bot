module.exports = {
    name: 'skill_passo_sombra',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Esquiva Sombria',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: ESQUIVA SOMBRIA* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Assassino Sombrio\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +6% de Chance de Esquivar totalmente de ataques\n\n'
        txt += 'Para evoluir: `.evoluirtalento passo_sombra`'
        return reply(txt.trim())
    }
}
