module.exports = {
    name: 'skill_intervencao_divina',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Milagre Supremo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: MILAGRE SUPREMO* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Paladino Sagrado\n'
        txt += '⭐ *Nível Máximo:* 1 níveis\n'
        txt += '📖 *Descrição:* Revive uma vez por combate com 50% de HP\n\n'
        txt += 'Para evoluir: `.evoluirtalento intervencao_divina`'
        return reply(txt.trim())
    }
}
