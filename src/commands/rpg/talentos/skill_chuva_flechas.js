module.exports = {
    name: 'skill_chuva_flechas',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Rajada Elemental',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: RAJADA ELEMENTAL* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Arqueiro Elemental\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +8% de Chance de Disparo Duplo por turno\n\n'
        txt += 'Para evoluir: `.evoluirtalento chuva_flechas`'
        return reply(txt.trim())
    }
}
