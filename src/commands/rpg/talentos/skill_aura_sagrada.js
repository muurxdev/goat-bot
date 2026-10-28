module.exports = {
    name: 'skill_aura_sagrada',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Aura da Luz Divina',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: AURA DA LUZ DIVINA* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Paladino Sagrado\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +100 de HP Máximo por ponto\n\n'
        txt += 'Para evoluir: `.evoluirtalento aura_sagrada`'
        return reply(txt.trim())
    }
}
