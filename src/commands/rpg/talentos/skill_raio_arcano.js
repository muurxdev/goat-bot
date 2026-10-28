module.exports = {
    name: 'skill_raio_arcano',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Canalização Arcana',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: CANALIZAÇÃO ARCANA* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Mago Arcano\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +18% de Dano Mágico por ponto\n\n'
        txt += 'Para evoluir: `.evoluirtalento raio_arcano`'
        return reply(txt.trim())
    }
}
