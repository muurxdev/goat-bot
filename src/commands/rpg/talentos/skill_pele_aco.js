module.exports = {
    name: 'skill_pele_aco',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Pele de Aço',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: PELE DE AÇO* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Guerreiro Berserker\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +12% de Redução de Dano recebido\n\n'
        txt += 'Para evoluir: `.evoluirtalento pele_aco`'
        return reply(txt.trim())
    }
}
