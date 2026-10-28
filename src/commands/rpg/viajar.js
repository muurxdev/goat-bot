const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { mundos } = require('../../utils/constants')
const { formatNumber, plural } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

/** Mundos liberados para o nível, do mais fácil ao mais difícil. */
const liberadosPara = nivel => Object.entries(mundos)
    .filter(([, m]) => nivel >= m.minLevel)
    .sort((a, b) => a[1].minLevel - b[1].minLevel)

module.exports = {
    name: 'viajar',
    aliases: ['irpara', 'travel'],
    category: 'rpg',
    subcategory: 'Exploração',
    description: 'Viaje para outro mundo que você já liberou',
    usage: '<código do mundo>',
    examples: [
        'floresta — volta para a Floresta',
        'servidor — vai para o mundo do nível 10',
        'cyber — vai para o mundo do nível 20'
    ],
    execute: async ({ text, sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const nivel = user.level || 1
        const atualId = mundos[user.mundo] ? user.mundo : 'floresta'
        const liberados = liberadosPara(nivel)
        const linhasLiberados = liberados.map(([id, m]) =>
            '• ' + F.cmd(prefix, 'viajar', id) + ' — ' + m.nome + (id === atualId ? ' · _você está aqui_' : ''))

        if (!text || !text.trim()) {
            return reply(F.tela({
                emoji: '🗺️',
                titulo: 'Para onde vamos?',
                intro: 'Você está em *' + mundos[atualId].nome + '*. Escolha um mundo liberado e eu levo você até lá.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'viajar', '<código do mundo>')] },
                    { emoji: '🔓', titulo: 'Liberados para você', linhas: linhasLiberados }
                ],
                proximos: [{ nome: 'mundo', oque: 'ver todos os mundos e o nível de cada um' }],
                prefix
            }))
        }

        const destino = text.toLowerCase().trim()
        if (!mundos[destino]) {
            return reply(F.tela({
                emoji: '❌',
                titulo: 'Não conheço esse mundo',
                intro: '"' + text.trim() + '" não está no mapa do Reino. Use o código de um mundo, por exemplo ' + F.cmd(prefix, 'viajar', 'floresta') + '.',
                secoes: [{ emoji: '🔓', titulo: 'Liberados para você', linhas: linhasLiberados }],
                proximos: [{ nome: 'mundo', oque: 'ver todos os mundos e os códigos' }],
                prefix
            }))
        }

        const alvo = mundos[destino]
        if (nivel < alvo.minLevel) {
            return reply(F.tela({
                emoji: '🔒',
                titulo: alvo.nome + ' ainda está fechado',
                intro: 'Esse mundo pede nível *' + formatNumber(alvo.minLevel) + '* e você está no nível *' + formatNumber(nivel) + '*.',
                secoes: [{ emoji: '📊', titulo: 'Falta pouco?', linhas: [
                    F.campo('Níveis que faltam', formatNumber(alvo.minLevel - nivel)),
                    F.campo('Melhor mundo liberado', liberados.length ? liberados[liberados.length - 1][1].nome : '—')
                ] }],
                dica: 'Caçar no mundo mais difícil que você já liberou é o jeito mais rápido de subir.',
                proximos: [
                    liberados.length ? { nome: 'viajar', args: liberados[liberados.length - 1][0], oque: 'ir para o melhor mundo liberado' } : null,
                    { nome: 'hunt', oque: 'caçar e ganhar XP' },
                    { nome: 'dungeon', oque: 'encarar uma masmorra' }
                ].filter(Boolean),
                prefix
            }))
        }

        const jaEstava = atualId === destino
        user.mundo = destino
        await dataService.saveXpData(xpData)
        logger.info('[VIAJAR] User ' + sender + ' viajou para ' + destino)

        await reply(F.tela({
            emoji: '🧭',
            titulo: jaEstava ? 'Você já está aqui' : 'Chegada a ' + alvo.nome,
            intro: jaEstava
                ? 'Você já estava em *' + alvo.nome + '*. Os monstros daqui continuam esperando.'
                : 'Você chegou a *' + alvo.nome + '*. Os monstros daqui já estão de olho em você.',
            secoes: [{ emoji: '📜', titulo: 'Sobre o mundo', linhas: [
                F.campo('Nível mínimo', formatNumber(alvo.minLevel)),
                F.campo('Monstros', plural((alvo.monstros || []).length, 'tipo', 'tipos')),
                F.campo('Chefes', formatNumber((alvo.bosses || []).length))
            ] }],
            dica: 'Quanto mais difícil o mundo, mais XP e moedas cada caçada rende.',
            proximos: [
                { nome: 'hunt', oque: 'caçar os monstros daqui' },
                { nome: 'boss', args: 'criar', oque: 'desafiar o chefe local' },
                { nome: 'mundo', oque: 'ver o mapa' }
            ],
            prefix
        }))
    }
}
