module.exports = {
    name: 'skill_flecha_gelo',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Disparo Congelante',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: DISPARO CONGELANTE* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Arqueiro Elemental\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* Reduz a velocidade e ataque do inimigo em 15%\n\n'
        txt += 'Para evoluir: `.evoluirtalento flecha_gelo`'
        return reply(txt.trim())
    }
}
