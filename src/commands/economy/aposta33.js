/**
 * Comando .apostaalerta — ALERTA DE PERDA
 *
 * Avisa se você passou dos limites que definiu.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostaalerta',
    aliases: ["alertaperda","cmd_apostaalerta","alt_apostaalerta","atalho_apostaalerta","abrev_apostaalerta","call_apostaalerta","func_apostaalerta"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Avisa se você passou dos limites que definiu',
    examples: [' — mostra se você passou do limite diário, de perda ou da meta'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const l = A.limites(user)
        const d = A.desempenho(sender, 1)
        const alertas = []
        if (l.diario && d.apostado > l.diario) alertas.push('🔴 Passou do limite diário: apostou ' + A.moeda(d.apostado) + ' de ' + A.moeda(l.diario))
        if (l.stopPerda && d.saldo < 0 && Math.abs(d.saldo) > l.stopPerda) alertas.push('🔴 Passou do limite de perda: ' + A.moeda(Math.abs(d.saldo)))
        if (l.meta && d.saldo > l.meta) alertas.push('🟢 Atingiu a meta de ganho. Hora de parar.')
        const semLimites = !l.diario && !l.stopPerda && !l.meta
        return reply(F.tela({
            emoji: '🚨',
            titulo: alertas.length ? 'Alerta de perda' : 'Nenhum limite ultrapassado',
            intro: alertas.length
                ? 'Você passou de um limite que definiu. O melhor momento para parar é agora.'
                : semLimites
                    ? 'Você ainda não definiu nenhum limite, então não tenho o que vigiar. Defina um abaixo.'
                    : 'Hoje você está dentro de todos os limites que definiu.',
            secoes: [
                { emoji: '⚠️', titulo: 'Alertas', linhas: alertas },
                { emoji: '☀️', titulo: 'Hoje', linhas: [
                    F.campo('Apostado', A.moeda(d.apostado)),
                    F.campo('Resultado', (d.saldo >= 0 ? '+' : '') + A.moeda(d.saldo))
                ] },
                { emoji: '🚧', titulo: 'Seus limites', linhas: [
                    F.campo('Por dia', l.diario ? A.moeda(l.diario) : 'sem limite'),
                    F.campo('Perda máxima', l.stopPerda ? A.moeda(l.stopPerda) : 'sem limite'),
                    F.campo('Meta de ganho', l.meta ? A.moeda(l.meta) : 'não definida')
                ] }
            ],
            dica: 'Quem decide onde parar antes de começar perde menos do que quem decide no calor da mesa.',
            proximos: [
                !l.diario ? { nome: 'apostalimitediario', args: '5000', oque: 'definir quanto apostar por dia' } : null,
                !l.stopPerda ? { nome: 'apostastop', args: '2000', oque: 'definir a perda máxima' } : null,
                alertas.length ? { nome: 'apostaparar', args: '24', oque: 'pausar as apostas por 24 horas' } : null,
                { nome: 'apostahoje', oque: 'detalhes das apostas de hoje' }
            ].filter(Boolean),
            prefix
        }))
    }
}
