/**
 * Comando .apostahoje — APOSTAS DE HOJE
 *
 * O que você apostou nas últimas 24 horas.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostahoje',
    aliases: ["apostasdehoje","cmd_apostahoje","alt_apostahoje","atalho_apostahoje","abrev_apostahoje","call_apostahoje","func_apostahoje"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'O que você apostou nas últimas 24 horas',
    examples: [' — nas últimas 24 horas: rodadas, quanto apostou e o resultado'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const d = A.desempenho(sender, 1)
        if (!d.rodadas) {
            return reply(F.tela({
                emoji: '☀️',
                titulo: 'Apostas de hoje',
                intro: 'Não encontrei apostas suas nas últimas 24 horas. Quando houver rodadas registradas nesse período, eu mostro quanto entrou, quanto saiu e o resultado.',
                dica: 'Ficar um tempo sem apostar também é resultado: nenhuma moeda perdida.',
                proximos: [
                { nome: 'apostasemana', oque: 'resultado dos últimos 7 dias' },
                { nome: 'apostaalerta', oque: 'ver se passou de algum limite' }
            ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '☀️',
            titulo: 'Apostas de hoje',
            intro: (d.saldo >= 0 ? '🟢 Você está *' + A.moeda(d.saldo) + '* no lucro ' : '🔴 Você está *' + A.moeda(Math.abs(d.saldo)) + '* no prejuízo ') + 'nas últimas 24 horas.',
            secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: [
                F.campo('Rodadas', String(d.rodadas)),
                F.campo('Apostado', A.moeda(d.apostado)),
                F.campo('Resultado', (d.saldo >= 0 ? '🟢 +' : '🔴 ') + A.moeda(d.saldo))
            ] }],
            dica: 'Se o dia não foi bom, parar agora evita correr atrás do prejuízo.',
            proximos: [
                { nome: 'apostasemana', oque: 'resultado dos últimos 7 dias' },
                { nome: 'apostaalerta', oque: 'ver se passou de algum limite' }
            ],
            prefix
        }))
    }
}
