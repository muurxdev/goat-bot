module.exports = {
    name: 'skill_escudo_mana',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Barreira Espiritual',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: BARREIRA ESPIRITUAL* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Mago Arcano\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* Absorve até +200 de dano por ponto\n\n'
        txt += 'Para evoluir: `.evoluirtalento escudo_mana`'
        return reply(txt.trim())
    }
}
