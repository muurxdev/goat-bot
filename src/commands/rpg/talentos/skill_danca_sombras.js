module.exports = {
    name: 'skill_danca_sombras',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Manto do Assassino',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: MANTO DO ASSASSINO* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Assassino Sombrio\n'
        txt += '⭐ *Nível Máximo:* 1 níveis\n'
        txt += '📖 *Descrição:* Primeiro golpe do combate tem 100% de crítico garantido\n\n'
        txt += 'Para evoluir: `.evoluirtalento danca_sombras`'
        return reply(txt.trim())
    }
}
