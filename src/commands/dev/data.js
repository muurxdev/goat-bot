const F = require('../../utils/formato')

const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

/** Partes da data no horário de Brasília, independente do fuso da máquina. */
function partesBrasilia(d) {
    const p = {}
    for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(d)) p[x.type] = x.value
    return p
}

module.exports = {
    name: 'data',
    aliases: ["date","hoje","cmd_data","alt_data","atalho_data","abrev_data","call_data","func_data"],
    category: 'dev',
    subcategory: 'Data',
    description: 'Mostra a data de hoje no horário de Brasília',
    examples: [' — mostra a data de hoje com dia da semana e dia do ano'],
    execute: async ({ reply, prefix = '.' }) => {
        const agora = new Date()
        const p = partesBrasilia(agora)
        const iso = `${p.year}-${p.month}-${p.day}`
        const local = new Date(iso + 'T12:00:00Z')
        const diaSemana = DIAS[local.getUTCDay()]
        const inicioAno = Date.UTC(Number(p.year), 0, 1)
        const diaDoAno = Math.floor((local.getTime() - inicioAno) / 86400000) + 1
        const ano = Number(p.year)
        const bissexto = (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0
        const totalDias = bissexto ? 366 : 365
        const extenso = local.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })

        await reply(F.tela({
            emoji: '📅',
            titulo: 'Data de hoje',
            intro: `Hoje é *${diaSemana}*, ${extenso}.`,
            secoes: [{
                emoji: '📋', titulo: 'Detalhes',
                linhas: [
                    F.campo('Data', `${p.day}/${p.month}/${p.year}`),
                    F.campo('Formato ISO', '`' + iso + '`'),
                    F.campo('Dia do ano', `${diaDoAno} de ${totalDias}`),
                    F.campo('Ano andado', F.barra(diaDoAno / totalDias)),
                    F.campo('Fuso', 'horário de Brasília')
                ]
            }],
            dica: 'Precisa do horário exato? Use o comando de hora logo abaixo.',
            proximos: [
                { nome: 'hora', oque: 'hora atual' },
                { nome: 'weekdayname', args: '2026-12-25', oque: 'dia da semana de outra data' },
                { nome: 'date2timestamp', args: iso, oque: 'data em timestamp Unix' }
            ],
            prefix
        }))
    }
}
