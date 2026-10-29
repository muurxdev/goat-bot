/**
 * Comando .bancoreserva — RESERVA DE EMERGÊNCIA
 *
 * Quanto guardar para aguentar tempos ruins.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/tesourariaService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

const VAZIO = 'As movimentações entram aqui quando você deposita, saca ou transfere pelo banco.'

module.exports = {
    name: 'bancoreserva',
    aliases: ["reservaemergencia","cmd_bancoreserva","alt_bancoreserva","atalho_bancoreserva","abrev_bancoreserva","call_bancoreserva","func_bancoreserva"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quanto guardar para aguentar tempos ruins',
    examples: [' — quanto guardar para aguentar 30 dias sem ganhar nada'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const f = B.fluxo(sender, 30)
        const p = B.patrimonio(user)
        if (!f.mediaDiariaGasta) {
            return reply(F.tela({
                emoji: '🛡️',
                titulo: 'Reserva de emergência',
                intro: 'Não encontrei gastos seus nos últimos 30 dias, então ainda não dá para calcular a reserva ideal.',
                secoes: [{ emoji: '💳', titulo: 'Guardado hoje', linhas: [F.campo('Banco + cofre', B.moeda(p.banco + p.cofre))] }],
                dica: VAZIO,
                proximos: [{ nome: 'bancoresumo', oque: 'ver carteira, banco e cofre' }],
                prefix
            }))
        }
        const recomendado = f.mediaDiariaGasta * 30
        const cobertura = recomendado ? ((p.banco + p.cofre) / recomendado) * 100 : 0
        return reply(F.tela({
            emoji: '🛡️',
            titulo: 'Reserva de emergência',
            intro: cobertura >= 100
                ? '🟢 Sua reserva cobre 30 dias de gastos. Você está protegido.'
                : 'Sua reserva cobre *' + cobertura.toFixed(0) + '%* de 30 dias de gastos. Faltam ' + B.moeda(recomendado - (p.banco + p.cofre)) + '.',
            secoes: [{ emoji: '📋', titulo: 'A conta', linhas: [
                F.campo('Gasto médio por dia', B.moeda(f.mediaDiariaGasta)),
                F.campo('Reserva ideal (30 dias)', B.moeda(recomendado)),
                F.campo('Guardado (banco + cofre)', B.moeda(p.banco + p.cofre)),
                F.campo('Cobertura', cobertura.toFixed(0) + '%'),
                F.barra(cobertura / 100)
            ] }],
            dica: 'A reserva fica no banco ou no cofre, longe da carteira e de ladrões.',
            proximos: [
                cobertura < 100 ? { nome: 'banco', args: 'depositar tudo', oque: 'guardar a carteira' } : null,
                { nome: 'bancoautonomia', oque: 'quanto tempo o dinheiro dura' }
            ].filter(Boolean),
            prefix
        }))
    }
}
