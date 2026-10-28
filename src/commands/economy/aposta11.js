/**
 * Comando .apostasemana — APOSTAS DA SEMANA
 *
 * Seu resultado nos últimos 7 dias.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostasemana',
    aliases: ["apostasdasemana","cmd_apostasemana","alt_apostasemana","atalho_apostasemana","abrev_apostasemana","call_apostasemana","func_apostasemana"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Seu resultado nos últimos 7 dias',
    examples: [' — nos últimos 7 dias: rodadas, quanto apostou e o resultado'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const d = A.desempenho(sender, 7)
        if (!d.rodadas) {
            return reply(F.tela({
                emoji: '📅',
                titulo: 'Apostas da semana',
                intro: 'Não encontrei apostas suas nos últimos 7 dias. Quando houver rodadas registradas nesse período, eu mostro quanto entrou, quanto saiu e o resultado.',
                dica: 'Ficar um tempo sem apostar também é resultado: nenhuma moeda perdida.',
                proximos: [
                { nome: 'apostahoje', oque: 'resultado das últimas 24 horas' },
                { nome: 'apostames', oque: 'resultado dos últimos 30 dias' }
            ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '📅',
            titulo: 'Apostas da semana',
            intro: (d.saldo >= 0 ? '🟢 Você está *' + A.moeda(d.saldo) + '* no lucro ' : '🔴 Você está *' + A.moeda(Math.abs(d.saldo)) + '* no prejuízo ') + 'nos últimos 7 dias.',
            secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: [
                F.campo('Rodadas', String(d.rodadas)),
                F.campo('Apostado', A.moeda(d.apostado)),
                F.campo('Recebido', A.moeda(d.recebido)),
                F.campo('Média apostada por dia', A.moeda(d.apostado / 7)),
                F.campo('Resultado', (d.saldo >= 0 ? '🟢 +' : '🔴 ') + A.moeda(d.saldo))
            ] }],
            dica: 'Compare com a semana anterior no fim de semana que vem: o ritmo diz mais que um dia isolado.',
            proximos: [
                { nome: 'apostahoje', oque: 'resultado das últimas 24 horas' },
                { nome: 'apostames', oque: 'resultado dos últimos 30 dias' }
            ],
            prefix
        }))
    }
}
