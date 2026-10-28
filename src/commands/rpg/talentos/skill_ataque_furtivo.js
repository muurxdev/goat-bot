module.exports = {
    name: 'skill_ataque_furtivo',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Ataque Furtivo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: ATAQUE FURTIVO* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Assassino Sombrio\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +25% de Dano Crítico por ponto\n\n'
        txt += 'Para evoluir: `.evoluirtalento ataque_furtivo`'
        return reply(txt.trim())
    }
}
