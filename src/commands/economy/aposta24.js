/**
 * Comando .apostasugestao — QUANTO APOSTAR AGORA
 *
 * Sugestão de valor com base na sua banca e limites.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostasugestao',
    aliases: ["quantoapostar","cmd_apostasugestao","alt_apostasugestao","atalho_apostasugestao","abrev_apostasugestao","call_apostasugestao","func_apostasugestao"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Sugestão de valor com base na sua banca e limites',
    examples: [' — sugere quanto apostar com base na sua carteira, banco e limites'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const banca = (Number(user.coins) || 0) + (Number(user.bank) || 0)
        const lim = A.limites(user)
        const pausa = A.emPausa(user)
        if (!banca) {
            return reply(F.tela({
                emoji: '💡',
                titulo: 'Quanto apostar agora',
                intro: 'Você está sem moedas na carteira e no banco, então a sugestão é não apostar.',
                proximos: [
                    { nome: 'trabalhar', oque: 'ganhar moedas sem risco' },
                    { nome: 'premiodiario', oque: 'pegar o prêmio do dia' }
                ],
                prefix
            }))
        }
        let sugerido = Math.floor(banca * 0.02)
        if (lim.porAposta && sugerido > lim.porAposta) sugerido = lim.porAposta
        return reply(F.tela({
            emoji: '💡',
            titulo: pausa.pausado ? 'Você está em pausa' : 'Quanto apostar agora',
            intro: pausa.pausado
                ? 'Você pediu uma pausa e ainda faltam *' + A.duracao(pausa.restanteMs) + '*. A sugestão é esperar.'
                : 'Sugiro no máximo *' + A.moeda(sugerido) + '* por rodada.',
            secoes: [{ emoji: '📋', titulo: 'A conta', linhas: [
                F.campo('Banca (carteira + banco)', A.moeda(banca)),
                F.campo('Sugestão (2% da banca)', A.moeda(sugerido)),
                lim.porAposta ? F.campo('Seu limite por aposta', A.moeda(lim.porAposta)) : null
            ] }],
            dica: 'Com 2% por rodada, você aguenta uma sequência longa de derrotas sem quebrar.',
            proximos: [
                { nome: 'apostabanca', oque: 'mais detalhes sobre quanto arriscar' },
                !lim.porAposta ? { nome: 'apostalimite', args: String(Math.max(sugerido, 10)), oque: 'transformar a sugestão em limite' } : null
            ].filter(Boolean),
            prefix
        }))
    }
}
