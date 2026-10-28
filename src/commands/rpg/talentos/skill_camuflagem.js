module.exports = {
    name: 'skill_camuflagem',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Instinto Selvagem',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: INSTINTO SELVAGEM* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Arqueiro Elemental\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +10% de Resistência e Esquiva no mato\n\n'
        txt += 'Para evoluir: `.evoluirtalento camuflagem`'
        return reply(txt.trim())
    }
}
