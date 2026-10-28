module.exports = {
    name: 'skill_lamina_venenosa',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Toxina Mortal',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: TOXINA MORTAL* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Assassino Sombrio\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* Aplica envenenamento causando dano por 3 turnos\n\n'
        txt += 'Para evoluir: `.evoluirtalento lamina_venenosa`'
        return reply(txt.trim())
    }
}
