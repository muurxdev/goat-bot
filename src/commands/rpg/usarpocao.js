const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes } = require('../../utils/constants')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const TIPOS = Object.keys(pocoes)

module.exports = {
    name: 'usarpocao',
    aliases: ['tomarpocao', 'beberpocao', 'usepot'],
    category: 'rpg',
    subcategory: 'Alquimia',
    description: 'Bebe uma poção da mochila e ativa o efeito dela por 30 minutos',
    usage: '<forca | experiencia | fortuna | lendaria>',
    examples: [
        'forca — bebe a Poção de Força (mais dano)',
        'experiencia — bebe a Poção de Experiência (mais XP)',
        'fortuna — bebe a Poção da Fortuna (mais moedas)'
    ],
    execute: async ({ text, sender, reply, prefix = '.' }) => {
        if (!text) {
            const xpDataUso = dataService.getXpData()
            const userUso = initializeUser(sender, xpDataUso)
            const inv = Array.isArray(userUso.inventario) ? userUso.inventario : []
            const linhas = TIPOS.map(t => {
                const qtd = inv.filter(i => i === '🧪 ' + t).length
                return `• ${F.cmd(prefix, 'usarpocao', t)} — ${pocoes[t].nome.replace('🧪 ', '')}: ${pocoes[t].descricao.replace(/\.$/, '')}${qtd ? ` · *você tem ${qtd}*` : ''}`
            })
            return reply(F.tela({
                emoji: '🧪',
                titulo: 'Beber uma poção',
                intro: 'Escolha uma poção da mochila para ativar o efeito. Só uma poção fica ativa por vez.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'usarpocao', '<tipo>')] },
                    { emoji: '📜', titulo: 'Poções', linhas }
                ],
                dica: 'Sem poção na mochila? Crie uma com os espólios da receita.',
                proximos: [
                    { nome: 'criarpocao', oque: 'ver as receitas' },
                    { nome: 'pocaoativa', oque: 'ver a poção que está valendo' }
                ],
                prefix
            }))
        }

        const tipo = text.toLowerCase().trim()
        if (!pocoes[tipo]) {
            return reply(F.tela({
                emoji: '❌',
                titulo: 'Não conheço essa poção',
                intro: `"${text.trim()}" não é uma poção. Escolha uma destas:`,
                secoes: [{ emoji: '🧪', titulo: 'Poções', linhas: TIPOS.map(t => `• ${F.cmd(prefix, 'usarpocao', t)} — ${pocoes[t].nome.replace('🧪 ', '')}`) }],
                proximos: [{ nome: 'usarpocao', oque: 'ver as poções e quantas você tem' }],
                prefix
            }))
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        if (!user.inventario) user.inventario = []

        const nomePocao = '🧪 ' + tipo
        const index = user.inventario.indexOf(nomePocao)

        if (index === -1) {
            return reply(F.tela({
                emoji: '🎒',
                titulo: 'Essa poção não está na mochila',
                intro: `Você não tem *${pocoes[tipo].nome}*. Crie uma com os espólios da receita.`,
                dica: 'A tela de criação mostra quais ingredientes você já tem.',
                proximos: [
                    { nome: 'criarpocao', args: tipo, oque: `criar ${pocoes[tipo].nome.replace('🧪 ', '')}` },
                    { nome: 'criarpocao', oque: 'ver todas as receitas' }
                ],
                prefix
            }))
        }

        user.inventario.splice(index, 1)
        user.pocaoAtiva = {
            tipo: tipo,
            expira: Date.now() + pocoes[tipo].duracao
        }

        await dataService.saveXpData(xpData)
        logger.info('[USARPOCAO] User ' + sender + ' consumiu poção ' + tipo)

        await reply(F.tela({
            emoji: '🧪',
            titulo: 'Poção ativada',
            intro: `Você bebeu *${pocoes[tipo].nome}*: ${pocoes[tipo].descricao.charAt(0).toLowerCase() + pocoes[tipo].descricao.slice(1)}`,
            secoes: [{ emoji: '📜', titulo: 'Efeito', linhas: [
                F.campo('Efeito', pocoes[tipo].descricao),
                F.campo('Duração', F.tempo(pocoes[tipo].duracao)),
                F.campo('Vale em', 'chefes, caçadas, duelos e arenas')
            ] }],
            dica: 'Aproveite agora: o tempo corre mesmo se você não lutar.',
            proximos: [
                { nome: 'hunt', oque: 'caçar com a poção ativa' },
                { nome: 'pocaoativa', oque: 'ver quanto tempo resta' }
            ],
            prefix
        }))
    }
}
