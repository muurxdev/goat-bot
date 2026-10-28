const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { atualizarArenaPlayer, aplicarBonusDano, aplicarBonusCoins } = require('../../services/rpgService')
const { arenas, cartasArena } = require('../../utils/constants')
const { formatNumber, moedas, plural, marcar } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

/** Linhas de progresso até a próxima arena (vazio quando já está na última). */
function progressoArena(user) {
    const proxima = arenas[(user.arenaAtual || 1) + 1]
    const atual = arenas[user.arenaAtual || 1]
    if (!proxima || !atual) return [F.campo('Próxima arena', 'você já está na última')]
    const faixa = proxima.pontos - atual.pontos
    const feito = (user.arenaPontos || 0) - atual.pontos
    return [
        F.campo('Próxima arena', proxima.nome),
        F.campo('Faltam', plural(Math.max(0, proxima.pontos - (user.arenaPontos || 0)), 'troféu', 'troféus')),
        F.barra(faixa > 0 ? feito / faixa : 1)
    ]
}

module.exports = {
    name: 'batalhar',
    aliases: ['lutararena', 'arenabattle'],
    category: 'rpg',
    subcategory: 'Combate',
    description: 'Batalha na sua arena atual contra guardiões para ganhar troféus e coins',
    examples: [' — enfrenta um guardião da sua arena atual'],
    execute: async ({ sender, reply, prefix }) => {
        const p = prefix || '.'
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        atualizarArenaPlayer(user)

        const arenaJogador = arenas[user.arenaAtual]
        if (!arenaJogador) {
            logger.warn(`[BATALHAR] Arena ${user.arenaAtual} de ${sender} não existe no catálogo`)
            return reply(F.tela({
                emoji: '🏟️',
                titulo: 'Não achei sua arena',
                intro: 'Seus troféus apontam para uma arena que eu não conheço, então não consigo montar a batalha agora.',
                dica: 'Veja a lista de arenas; se o problema continuar, avise um administrador do grupo.',
                prefix: p,
                proximos: [{ nome: 'arena', oque: 'ver as arenas' }]
            }))
        }

        const cartasDaArena = cartasArena[user.arenaAtual] || ['Guardião da Arena']
        const inimigo = cartasDaArena[Math.floor(Math.random() * cartasDaArena.length)]

        let poderPlayerBase = (user.level * 20) + Math.floor(Math.random() * 150)
        let poderPlayer = aplicarBonusDano(user, poderPlayerBase)

        const poderArena = Math.floor(arenaJogador.pontos / 20) + Math.floor(Math.random() * 200) + 50

        if (poderPlayer >= poderArena) {
            const ganhoTrofeus = Math.floor(Math.random() * 35) + 15
            const ganhoCoins = aplicarBonusCoins(user, 50)
            const arenaAntes = user.arenaAtual

            user.arenaPontos = (user.arenaPontos || 0) + ganhoTrofeus
            user.coins = (user.coins || 0) + ganhoCoins
            user.wins = (user.wins || 0) + 1
            atualizarArenaPlayer(user)

            await dataService.saveXpData(xpData)
            logger.info('[BATALHAR] User ' + sender + ' venceu arena ' + user.arenaAtual + ' (+' + ganhoTrofeus + ' troféus)')

            const subiu = user.arenaAtual > arenaAntes
            return reply(F.tela({
                emoji: '🏆',
                titulo: subiu ? `Vitória e subida para a arena ${user.arenaAtual}` : 'Vitória na arena',
                intro: `${marcar(sender)} derrotou *${inimigo}* e ganhou *+${plural(ganhoTrofeus, 'troféu', 'troféus')}* e *${moedas(ganhoCoins)}*.`,
                secoes: [
                    { emoji: '⚔️', titulo: 'A batalha', linhas: [
                        F.campo('Seu poder', formatNumber(Math.floor(poderPlayer))),
                        F.campo('Poder do guardião', formatNumber(poderArena))
                    ] },
                    { emoji: '🏟️', titulo: 'Sua arena', linhas: [
                        F.campo('Arena', arenas[user.arenaAtual]?.nome || arenaJogador.nome),
                        F.campo('Troféus', formatNumber(user.arenaPontos)),
                        F.campo('Moedas', moedas(user.coins)),
                        ...progressoArena(user)
                    ] }
                ],
                dica: 'Arenas mais altas têm guardiões mais fortes. Subir de nível é o que mais aumenta seu poder aqui.',
                prefix: p,
                proximos: [
                    { nome: 'batalhar', oque: 'lutar de novo' },
                    { nome: 'arena', oque: 'ver todas as arenas' }
                ]
            }), [sender])
        }

        const perdaTrofeus = Math.floor(Math.random() * 20) + 5
        user.arenaPontos = Math.max(0, (user.arenaPontos || 0) - perdaTrofeus)
        user.losses = (user.losses || 0) + 1
        atualizarArenaPlayer(user)

        await dataService.saveXpData(xpData)
        logger.info('[BATALHAR] User ' + sender + ' perdeu na arena (-' + perdaTrofeus + ' troféus)')

        return reply(F.tela({
            emoji: '💀',
            titulo: 'Derrota na arena',
            intro: `*${inimigo}* venceu ${marcar(sender)}, que perdeu *${plural(perdaTrofeus, 'troféu', 'troféus')}*.`,
            secoes: [
                { emoji: '⚔️', titulo: 'A batalha', linhas: [
                    F.campo('Seu poder', formatNumber(Math.floor(poderPlayer))),
                    F.campo('Poder do guardião', formatNumber(poderArena)),
                    F.campo('Diferença', formatNumber(Math.ceil(poderArena - poderPlayer)))
                ] },
                { emoji: '🏟️', titulo: 'Sua arena', linhas: [
                    F.campo('Arena', arenas[user.arenaAtual]?.nome || arenaJogador.nome),
                    F.campo('Troféus', formatNumber(user.arenaPontos))
                ] }
            ],
            dica: 'Aqui a batalha não tira moedas, só troféus. Cada nível a mais soma poder na arena.',
            prefix: p,
            proximos: [
                { nome: 'batalhar', oque: 'tentar de novo' },
                { nome: 'hunt', oque: 'caçar para subir de nível' }
            ]
        }), [sender])
    }
}
