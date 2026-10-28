/**
 * Comando .apostames — APOSTAS DO MÊS
 *
 * Seu resultado nos últimos 30 dias.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostames',
    aliases: ["apostasdomes","cmd_apostames","alt_apostames","atalho_apostames","abrev_apostames","call_apostames","func_apostames"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Seu resultado nos últimos 30 dias',
    examples: [' — nos últimos 30 dias: rodadas, quanto apostou e o resultado'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const d = A.desempenho(sender, 30)
        if (!d.rodadas) {
            return reply(F.tela({
                emoji: '🗓️',
                titulo: 'Apostas do mês',
                intro: 'Não encontrei apostas suas nos últimos 30 dias. Quando houver rodadas registradas nesse período, eu mostro quanto entrou, quanto saiu e o resultado.',
                dica: 'Ficar um tempo sem apostar também é resultado: nenhuma moeda perdida.',
                proximos: [
                { nome: 'apostasemana', oque: 'resultado dos últimos 7 dias' },
                { nome: 'apostafrequencia', oque: 'com que frequência você joga' }
            ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🗓️',
            titulo: 'Apostas do mês',
            intro: (d.saldo >= 0 ? '🟢 Você está *' + A.moeda(d.saldo) + '* no lucro ' : '🔴 Você está *' + A.moeda(Math.abs(d.saldo)) + '* no prejuízo ') + 'nos últimos 30 dias.',
            secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: [
                F.campo('Rodadas', String(d.rodadas)),
                F.campo('Apostado', A.moeda(d.apostado)),
                F.campo('Taxa de acerto', d.taxaAcerto.toFixed(1).replace('.', ',') + '%'),
                F.campo('Resultado', (d.saldo >= 0 ? '🟢 +' : '🔴 ') + A.moeda(d.saldo))
            ] }],
            dica: 'A taxa de acerto sozinha engana: jogos que pagam muito acertam pouco.',
            proximos: [
                { nome: 'apostasemana', oque: 'resultado dos últimos 7 dias' },
                { nome: 'apostafrequencia', oque: 'com que frequência você joga' }
            ],
            prefix
        }))
    }
}
