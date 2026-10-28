const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { mundos } = require('../../utils/constants')
const { formatNumber, plural } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

module.exports = {
    name: 'mundo',
    aliases: ['mundos', 'mapa'],
    category: 'rpg',
    subcategory: 'Exploração',
    description: 'Veja os mundos do Reino e o nível que cada um pede',
    examples: [' — mostra onde você está, os mundos liberados e os que ainda estão fechados'],
    execute: async ({ sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const nivel = user.level || 1
        const atualId = mundos[user.mundo] ? user.mundo : 'floresta'
        const atual = mundos[atualId]

        const lista = Object.entries(mundos).sort((a, b) => a[1].minLevel - b[1].minLevel)
        const liberados = lista.filter(([, m]) => nivel >= m.minLevel)
        const fechados = lista.filter(([, m]) => nivel < m.minLevel)

        const linhasLiberados = liberados.map(([id, m]) => {
            const aqui = id === atualId ? ' · _você está aqui_' : ''
            return '• ' + m.nome + ' — ' + plural((m.monstros || []).length, 'monstro', 'monstros') + ' · ' + F.cmd(prefix, 'viajar', id) + aqui
        })
        const linhasFechados = fechados.map(([id, m]) =>
            '• ' + m.nome + ' — nível ' + formatNumber(m.minLevel) + ' (faltam ' + formatNumber(m.minLevel - nivel) + ')'
        )

        // O mundo mais difícil já liberado é onde a caçada rende mais.
        const melhor = liberados[liberados.length - 1]
        const proximo = fechados[0]

        let dica
        if (melhor && melhor[0] !== atualId) dica = 'Mundos mais difíceis dão mais XP e moedas por caçada. ' + melhor[1].nome + ' já está liberado para você.'
        else if (proximo) dica = 'Faltam ' + plural(proximo[1].minLevel - nivel, 'nível', 'níveis') + ' para abrir ' + proximo[1].nome + '.'
        else dica = 'Você já liberou todos os mundos do Reino.'

        await reply(F.tela({
            emoji: '🗺️',
            titulo: 'Mundos do Reino',
            intro: 'Você está em *' + atual.nome + '* e no nível *' + formatNumber(nivel) + '*. Liberou ' + formatNumber(liberados.length) + ' de ' + plural(lista.length, 'mundo', 'mundos') + '.',
            secoes: [
                { emoji: '🔓', titulo: 'Liberados', linhas: linhasLiberados },
                { emoji: '🔒', titulo: 'Ainda fechados', linhas: linhasFechados }
            ],
            dica,
            proximos: [
                (melhor && melhor[0] !== atualId) ? { nome: 'viajar', args: melhor[0], oque: 'ir para ' + melhor[1].nome } : null,
                { nome: 'hunt', oque: 'caçar em ' + atual.nome },
                { nome: 'explorar', oque: 'partir numa expedição' }
            ].filter(Boolean),
            prefix
        }))
    }
}
