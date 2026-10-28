module.exports = {
    name: 'skill_golpe_letal',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Ponto Fraco',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: PONTO FRACO* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Assassino Sombrio\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +5% de Chance de Execução instantânea em alvos fracos\n\n'
        txt += 'Para evoluir: `.evoluirtalento golpe_letal`'
        return reply(txt.trim())
    }
}
