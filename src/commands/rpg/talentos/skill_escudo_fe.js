module.exports = {
    name: 'skill_escudo_fe',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Fortaleza Inabalável',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: FORTALEZA INABALÁVEL* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Paladino Sagrado\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +15% de Defesa Total\n\n'
        txt += 'Para evoluir: `.evoluirtalento escudo_fe`'
        return reply(txt.trim())
    }
}
