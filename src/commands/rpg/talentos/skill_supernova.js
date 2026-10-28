module.exports = {
    name: 'skill_supernova',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Cataclismo Arcano',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: CATACLISMO ARCANO* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Mago Arcano\n'
        txt += '⭐ *Nível Máximo:* 1 níveis\n'
        txt += '📖 *Descrição:* Explosão lendária ignora 50% da armadura do inimigo\n\n'
        txt += 'Para evoluir: `.evoluirtalento supernova`'
        return reply(txt.trim())
    }
}
