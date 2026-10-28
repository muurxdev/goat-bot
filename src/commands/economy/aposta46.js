/**
 * Comando .apostacontagem — CONTAGEM DE APOSTAS
 *
 * Números diretos, sem análise.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostacontagem',
    aliases: ["contarapostas","cmd_apostacontagem","alt_apostacontagem","atalho_apostacontagem","abrev_apostacontagem","call_apostacontagem","func_apostacontagem"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Números diretos, sem análise',
    examples: [' — números diretos das suas apostas'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const g = A.desempenho(sender)
        const j = A.porJogo(sender)
        if (!g.rodadas) {
            return reply(F.tela({
                emoji: '🔢',
                titulo: 'Contagem de apostas',
                intro: 'Ainda não tenho rodadas suas registradas. Esta tela se preenche sozinha conforme as apostas entram no seu histórico.',
                secoes: [{ emoji: '📋', titulo: 'O que aparece aqui', linhas: [
                    '• Rodadas, vitórias e derrotas',
                    '• Quantos jogos diferentes você já jogou',
                    '• Quanto dinheiro passou pelas mesas'
                ] }],
                proximos: [
                    { nome: 'apostaodds', oque: 'ver a chance real de cada jogo' },
                    { nome: 'apostaajuda', oque: 'todos os comandos de análise' }
                ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🔢',
            titulo: 'Contagem de apostas',
            intro: 'Você jogou *' + g.rodadas + '* rodadas: *' + g.vitorias + '* vitórias e *' + g.derrotas + '* derrotas.',
            secoes: [{ emoji: '📋', titulo: 'Números', linhas: [
                F.campo('Rodadas', String(g.rodadas)),
                F.campo('Vitórias', String(g.vitorias)),
                F.campo('Derrotas', String(g.derrotas)),
                F.campo('Jogos diferentes', String(j.length)),
                F.campo('Dinheiro movimentado', A.moeda(g.apostado + g.recebido))
            ] }],
            dica: 'Muito dinheiro movimentado não quer dizer lucro. Veja o saldo para saber se está ganhando.',
            proximos: [
                { nome: 'apostasaldo', oque: 'ver se está no lucro ou no prejuízo' },
                { nome: 'apostajogos', oque: 'desempenho por jogo' }
            ],
            prefix
        }))
    }
}
