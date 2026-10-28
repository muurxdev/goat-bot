const educationService = require('../../../services/educationService')

module.exports = {
    name: 'calc_bhaskara',
    category: 'escola',
    subcategory: 'Matemática',
    description: 'Resolve equação do 2º grau passo a passo: .calc_bhaskara <a> <b> <c>',
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        if (args.length < 3) return reply('Uso correto: `.calc_bhaskara <a> <b> <c>`\nExemplo: `.calc_bhaskara 1 -5 6` (para x² - 5x + 6 = 0)')
        const res = educationService.resolverBhaskara(args[0], args[1], args[2])
        if (res.error) return reply(res.error)

        let txt = '🧮 *RESOLUÇÃO PASSO A PASSO: EQUAÇÃO DO 2º GRAU*\n\n'
        txt += `📐 *Equação:* ${args[0]}x² + (${args[1]})x + (${args[2]}) = 0\n`
        txt += `Δ = b² - 4ac = (${args[1]})² - 4*(${args[0]})*(${args[2]}) = *${res.delta}*\n\n`
        if (res.roots && res.roots.length === 0) {
            txt += '❌ Como Δ < 0, a equação não possui raízes reais no conjunto ℝ.'
        } else {
            txt += `x = (-b ± √Δ) / 2a\n`
            txt += `x' = *${res.x1}*\n`
            txt += `x'' = *${res.x2}*\n\n`
            txt += `✅ *Conjunto Solução:* S = {${res.x1}, ${res.x2}}`
        }
        return reply(txt.trim())
    }
}
