/**
 * Comando .apostafrequencia — FREQUÊNCIA DE APOSTA
 *
 * Com que frequência você joga.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostafrequencia',
    aliases: ["frequenciaapostas","cmd_apostafrequencia","alt_apostafrequencia","atalho_apostafrequencia","abrev_apostafrequencia","call_apostafrequencia","func_apostafrequencia"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Com que frequência você joga',
    examples: [' — quantas rodadas por dia e por semana você joga'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const mes = A.desempenho(sender, 30)
        const semana = A.desempenho(sender, 7)
        if (!mes.rodadas) {
            return reply(F.tela({
                emoji: '📈',
                titulo: 'Frequência de aposta',
                intro: 'Não encontrei apostas suas nos últimos 30 dias. Quando houver, eu mostro quantas rodadas por dia você joga e se o ritmo está alto.',
                dica: 'Mais de 100 rodadas por mês já é um ritmo alto.',
                proximos: [
                    { nome: 'apostalimitediario', args: '5000', oque: 'definir quanto apostar por dia' },
                    { nome: 'apostaajuda', oque: 'todos os comandos de análise' }
                ],
                prefix
            }))
        }
        const nivel = mes.rodadas > 300 ? '🔴 Muito alta' : mes.rodadas > 100 ? '🟡 Alta' : '🟢 Moderada'
        return reply(F.tela({
            emoji: '📈',
            titulo: 'Frequência de aposta',
            intro: 'Nos últimos 30 dias você jogou *' + mes.rodadas + '* rodadas. Frequência: *' + nivel + '*.',
            secoes: [{ emoji: '📋', titulo: 'Ritmo', linhas: [
                F.campo('Rodadas no mês', String(mes.rodadas)),
                F.campo('Rodadas na semana', String(semana.rodadas)),
                F.campo('Média por dia', (mes.rodadas / 30).toFixed(1).replace('.', ',')),
                F.campo('Nível', nivel)
            ] }],
            dica: 'Até 100 rodadas no mês é moderado; acima de 300, vale fazer uma pausa.',
            proximos: [
                mes.rodadas > 100 ? { nome: 'apostaparar', args: '24', oque: 'pausar as apostas por 24 horas' } : null,
                { nome: 'apostames', oque: 'resultado do mês' }
            ].filter(Boolean),
            prefix
        }))
    }
}
