module.exports = {
    name: 'skill_meteoro',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Chuva de Meteoros',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: CHUVA DE METEOROS* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Mago Arcano\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +10% de Chance de Dano em Área Duplo\n\n'
        txt += 'Para evoluir: `.evoluirtalento meteoro`'
        return reply(txt.trim())
    }
}
