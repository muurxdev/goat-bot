const craftService = require('../../../services/craftService')

module.exports = {
    name: 'receitas',
    aliases: [],
    category: 'rpg',
    subcategory: 'Forja & Alquimia',
    description: 'Catálogo de receitas para forjar armas lendárias e destilar poções',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const list = craftService.getAllRecipes()
        let txt = '╔════════ ⚒️ *FORJA & ALQUIMIA DE REINO* ════════╗\n\n'
        txt += 'Transforme minérios e essências em equipamentos e elixires lendários.\n\n'

        for (const r of list) {
            txt += `📜 *\${r.name}* (\${r.id})\n`
            txt += `   ├ Nível Mínimo: Nível \${r.levelReq} | Custo: \${r.cost.toLocaleString('pt-BR')} moedas\n`
            txt += `   ├ Materiais: \${r.materials}\n`
            txt += `   ├ Resultado: \${r.result}\n`
            txt += `   └ Forjar: .forjar ${r.id}\n\n`
        }

        txt += '💡 Aumente seu nível de RPG para liberar receitas de grau sagrado.'
        return reply(txt.trim())
    }
}
