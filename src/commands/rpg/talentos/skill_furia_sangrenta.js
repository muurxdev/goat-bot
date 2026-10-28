module.exports = {
    name: 'skill_furia_sangrenta',
    category: 'rpg',
    subcategory: 'Grimório de Habilidades',
    description: 'Detalhes arcanos e atributos da habilidade Fúria Sangrenta',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚡ *HABILIDADE: FÚRIA SANGRENTA* ═══════╗\n\n'
        txt += '🏷️ *Classe:* Guerreiro Berserker\n'
        txt += '⭐ *Nível Máximo:* 5 níveis\n'
        txt += '📖 *Descrição:* +5% de Chance Crítica por ponto\n\n'
        txt += 'Para evoluir: `.evoluirtalento furia_sangrenta`'
        return reply(txt.trim())
    }
}
