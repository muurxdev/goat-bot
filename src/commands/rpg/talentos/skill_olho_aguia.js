module.exports = {
    name: 'skill_olho_aguia',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Precisão Absoluta',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: PRECISÃO ABSOLUTA* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Arqueiro Elemental\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +15% de Dano à Distância por ponto\n\n'
        txt += 'Para evoluir: `.evoluirtalento olho_aguia`'
        return reply(txt.trim())
    }
}
