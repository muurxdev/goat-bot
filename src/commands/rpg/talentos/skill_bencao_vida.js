module.exports = {
    name: 'skill_bencao_vida',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Regeneração Celestial',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: REGENERAÇÃO CELESTIAL* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Paladino Sagrado\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* Regenera 50 HP por turno em combate\n\n'
        txt += 'Para evoluir: `.evoluirtalento bencao_vida`'
        return reply(txt.trim())
    }
}
