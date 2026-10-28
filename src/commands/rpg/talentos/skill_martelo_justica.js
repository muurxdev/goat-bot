module.exports = {
    name: 'skill_martelo_justica',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Martelo da Justiça',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: MARTELO DA JUSTIÇA* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Paladino Sagrado\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +12% de Dano Sagrado por ponto\n\n'
        txt += 'Para evoluir: `.evoluirtalento martelo_justica`'
        return reply(txt.trim())
    }
}
