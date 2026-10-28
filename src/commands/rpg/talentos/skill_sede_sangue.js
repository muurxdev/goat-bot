module.exports = {
    name: 'skill_sede_sangue',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Sede de Sangue',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: SEDE DE SANGUE* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Guerreiro Berserker\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +8% de Cura por ataque (Lifesteal)\n\n'
        txt += 'Para evoluir: `.evoluirtalento sede_sangue`'
        return reply(txt.trim())
    }
}
