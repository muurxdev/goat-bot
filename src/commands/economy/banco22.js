/**
 * Comando .bancotaxadepoupanca — QUANTO VOCÊ GUARDA
 *
 * Percentual do que entra que você consegue reter.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

const VAZIO = 'As movimentações entram aqui quando você deposita, saca ou transfere pelo banco.'

module.exports = {
    name: 'bancotaxadepoupanca',
    aliases: ["taxapoupanca","cmd_bancotaxadepoupanca","alt_bancotaxadepoupanca","atalho_bancotaxadepoupanca","abrev_bancotaxadepoupanca","call_bancotaxadepoupanca","func_bancotaxadepoupanca"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Percentual do que entra que você consegue reter',
    examples: [' — que parte do que entra você consegue guardar'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const f = B.fluxo(sender, 30)
        if (!f.entrou) {
            return reply(F.tela({
                emoji: '🪙',
                titulo: 'Quanto você guarda',
                intro: 'Não encontrei entradas suas nos últimos 30 dias. Quando houver, eu calculo que parte você consegue guardar.',
                dica: VAZIO,
                proximos: [{ nome: 'bancomes', oque: 'fechamento dos últimos 30 dias' }],
                prefix
            }))
        }
        const veredito = f.taxaDePoupanca >= 30 ? '🟢 Excelente' : f.taxaDePoupanca >= 10 ? '🟡 Razoável' : f.taxaDePoupanca >= 0 ? '🔴 Você gasta quase tudo' : '🔴 Saiu mais do que entrou'
        return reply(F.tela({
            emoji: '🪙',
            titulo: 'Quanto você guarda',
            intro: 'Você reteve *' + f.taxaDePoupanca.toFixed(1).replace('.', ',') + '%* do que entrou nos últimos 30 dias. ' + veredito + '.',
            secoes: [{ emoji: '📋', titulo: 'A conta', linhas: [
                F.campo('Entrou', B.moeda(f.entrou)),
                F.campo('Saiu', B.moeda(f.saiu)),
                F.campo('Retido', f.taxaDePoupanca.toFixed(1).replace('.', ',') + '%'),
                F.barra(Math.max(0, f.taxaDePoupanca) / 100),
                F.campo('Veredito', veredito)
            ] }],
            dica: 'Acima de 30% é excelente; abaixo de 10%, quase tudo que entra vai embora.',
            proximos: [
                { nome: 'bancoautomatico', args: '20', oque: 'separar 20% dos ganhos para o banco' },
                { nome: 'bancoqueima', oque: 'ver o ritmo de gasto' }
            ],
            prefix
        }))
    }
}
