/**
 * Comando .apostaranking — MAIORES APOSTADORES
 *
 * Quem move mais moedas nas mesas.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const R = require('../../services/rankingService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostaranking',
    aliases: ["topapostadores","cmd_apostaranking","alt_apostaranking","atalho_apostaranking","abrev_apostaranking","call_apostaranking","func_apostaranking"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Quem move mais moedas nas mesas',
    examples: [' — quem mais movimenta moedas nas mesas deste grupo'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        dataService.initializeUser(sender)
        // Ranking escopado: em grupo, só entra quem está no grupo (decisão do dono;
        // o ranking global foi removido). No PV abre para todos os cadastrados.
        const escopo = await R.resolverEscopo({ from, isGroup })
        const r = A.rankingApostadores(500)
            .filter(x => !escopo.numeros || escopo.numeros.has(R.numeroDe(x.user_jid)))
            .slice(0, 10)
        if (!r.length) {
            return reply(F.tela({
                emoji: '🎩',
                titulo: 'Maiores apostadores',
                intro: 'Ainda não há apostas registradas ' + escopo.rotulo + '. Quando houver, esta lista mostra quem mais movimenta moedas nas mesas.',
                proximos: [
                    { nome: 'apostaresumo', oque: 'ver o seu próprio histórico' },
                    { nome: 'apostaodds', oque: 'ver a chance real de cada jogo' }
                ],
                prefix
            }))
        }
        const medalhas = ['🥇', '🥈', '🥉']
        return reply(F.tela({
            emoji: '🎩',
            titulo: 'Maiores apostadores',
            intro: 'Quem mais movimenta moedas nas mesas ' + escopo.rotulo + '.',
            secoes: [{ emoji: '🏅', titulo: 'Lista', linhas: r.map((x, i) =>
                (medalhas[i] || (i + 1) + 'º') + ' +' + R.numeroDe(x.user_jid).slice(0, 6) + '**** — ' + x.rodadas + ' rodadas · ' + A.moeda(x.volume)) }],
            dica: 'Volume alto não significa lucro: quem mais aposta costuma ser quem mais perde.',
            proximos: [
                { nome: 'apostaresumo', oque: 'ver o seu próprio histórico' },
                { nome: 'apostasaldo', oque: 'ver se você está no lucro' }
            ],
            prefix
        }))
    }
}
