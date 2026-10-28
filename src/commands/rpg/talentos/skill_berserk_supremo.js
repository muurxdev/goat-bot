module.exports = {
    name: 'skill_berserk_supremo',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Ira do Titã',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: IRA DO TITÃ* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Guerreiro Berserker\n'
        txt += '⭐ *Nível Máximo:* 1 níveis\n'
        txt += '📖 *Descrição:* Dano dobra quando o HP está abaixo de 30%\n\n'
        txt += 'Para evoluir: `.evoluirtalento berserk_supremo`'
        return reply(txt.trim())
    }
}
