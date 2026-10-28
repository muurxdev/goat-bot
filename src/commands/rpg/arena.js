
const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { atualizarArenaPlayer } = require('../../services/rpgService')
const { arenas } = require('../../utils/constants')
const { formatNumber } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

module.exports = {
    name: 'arena',
    aliases: ['arenas'],
    category: 'rpg',
    subcategory: 'Combate',
    description: 'Lista todas as arenas do Reino e mostra em qual você está',
    examples: [' — mostra as arenas, os troféus que cada uma pede e a sua arena atual'],
    execute: async ({ sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        atualizarArenaPlayer(user)

        const trofeus = user.arenaPontos || 0
        const lista = Object.entries(arenas)
        const linhas = lista.map(([num, a]) => {
            const aqui = Number(num) === user.arenaAtual ? ' · *você está aqui*' : ''
            const status = trofeus >= a.pontos ? '🟢' : '🔒'
            return `${status} ${a.nome} — ${formatNumber(a.pontos)} troféus${aqui}`
        })
        const atual = arenas[user.arenaAtual]
        const proxima = lista.map(([, a]) => a).find(a => a.pontos > trofeus)

        await reply(F.tela({
            emoji: '🏟️',
            titulo: 'Arenas do Reino',
            intro: `Você está na *${atual ? atual.nome : 'Arena ' + user.arenaAtual}* com *${formatNumber(trofeus)} troféus*.${proxima ? ` Faltam *${formatNumber(proxima.pontos - trofeus)}* para a próxima.` : ' Você já chegou à última arena.'}`,
            secoes: [
                proxima ? { emoji: '🎯', titulo: 'Próxima arena', linhas: [
                    F.campo('Arena', proxima.nome),
                    F.campo('Progresso', F.barra(trofeus / proxima.pontos))
                ] } : null,
                { emoji: '📜', titulo: `As ${lista.length} arenas`, linhas }
            ],
            dica: 'Vencer batalhas na arena dá troféus; cada arena nova libera adversários mais fortes.',
            proximos: [
                { nome: 'batalhar', oque: 'desafiar a sua arena atual' },
                { nome: 'rankarena', oque: 'ver quem tem mais pontos de arena' }
            ],
            prefix
        }), [sender])
    }
}
