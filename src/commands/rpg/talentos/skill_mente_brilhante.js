module.exports = {
    name: 'skill_mente_brilhante',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Amplificação Mística',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: AMPLIFICAÇÃO MÍSTICA* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Mago Arcano\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +8% de Crítico Mágico\n\n'
        txt += 'Para evoluir: `.evoluirtalento mente_brilhante`'
        return reply(txt.trim())
    }
}
