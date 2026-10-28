const educationService = require('../../../services/educationService')

module.exports = {
    name: 'calc_juros_comp',
    category: 'escola',
    subcategory: 'Matemática Financeira',
    description: 'Calcula juros compostos: .calc_juros_comp <capital> <taxa_%_ao_mes> <meses>',
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        if (args.length < 3) return reply('Uso: `.calc_juros_comp <capital> <taxa> <meses>`\nExemplo: `.calc_juros_comp 1000 1.5 12`')
        const res = educationService.calcularJurosCompostos(args[0], args[1], args[2])

        let txt = '📈 *CÁLCULO DE JUROS COMPOSTOS*\n\n'
        txt += `💰 *Capital Inicial (C):* R$ ${res.capital.toLocaleString('pt-BR')}\n`
        txt += `📊 *Taxa Mensal (i):* ${res.taxa}% a.m.\n`
        txt += `⏳ *Período (t):* ${res.meses} meses\n\n`
        txt += `💵 *Montante Final (M):* R$ ${res.montante.toLocaleString('pt-BR')}\n`
        txt += `✨ *Juros Acumulados (J):* R$ ${res.juros.toLocaleString('pt-BR')}`
        return reply(txt.trim())
    }
}
