module.exports = {
    name: 'skill_flecha_tempestade',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Vórtice do Vento',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: VÓRTICE DO VENTO* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Arqueiro Elemental\n'
        txt += '⭐ *Nível Máximo:* 1 níveis\n'
        txt += '📖 *Descrição:* Disparo perfura todos os inimigos e atordoa o chefe\n\n'
        txt += 'Para evoluir: `.evoluirtalento flecha_tempestade`'
        return reply(txt.trim())
    }
}
