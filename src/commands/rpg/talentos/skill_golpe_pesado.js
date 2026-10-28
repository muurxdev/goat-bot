module.exports = {
    name: 'skill_golpe_pesado',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Golpe Demolidor',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: GOLPE DEMOLIDOR* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Guerreiro Berserker\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +15% de Dano Físico por ponto\n\n'
        txt += 'Para evoluir: `.evoluirtalento golpe_pesado`'
        return reply(txt.trim())
    }
}
