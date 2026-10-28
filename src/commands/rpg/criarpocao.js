const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes, receitasPocao } = require('../../utils/constants')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const TIPOS = Object.keys(receitasPocao).filter(t => pocoes[t])

/** "2x 🟣 Cristal de Bug (você tem 1)" para cada ingrediente. */
function linhasReceita(tipo, inventario) {
    return Object.entries(receitasPocao[tipo]).map(([item, qtd]) => {
        const tem = inventario ? inventario.filter(i => i === item).length : null
        const marca = tem === null ? '•' : (tem >= qtd ? '✅' : '⬜')
        return `${marca} ${qtd}x ${item}${tem === null ? '' : ` (você tem ${tem})`}`
    })
}

module.exports = {
    name: 'criarpocao',
    aliases: ['fazerpocao', 'brew'],
    category: 'rpg',
    subcategory: 'Alquimia',
    description: 'Cria uma poção consumindo os espólios da receita que estão na mochila',
    usage: '<forca | experiencia | fortuna | lendaria>',
    examples: [
        'forca — cria uma Poção de Força',
        'experiencia — cria uma Poção de Experiência',
        'lendaria — cria a Poção Lendária'
    ],
    execute: async ({ text, sender, reply, prefix = '.' }) => {
        if (!text) {
            const xpDataUso = dataService.getXpData()
            const userUso = initializeUser(sender, xpDataUso)
            const inv = Array.isArray(userUso.inventario) ? userUso.inventario : []
            return reply(F.tela({
                emoji: '⚗️',
                titulo: 'Criar poções',
                intro: 'Junte os espólios da receita na mochila e transforme em uma poção. Depois beba para ganhar o efeito por um tempo.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'criarpocao', '<tipo>')] },
                    ...TIPOS.map(t => ({ emoji: '🧪', titulo: `${pocoes[t].nome.replace('🧪 ', '')} · ${F.cmd(prefix, 'criarpocao', t)}`, linhas: [pocoes[t].descricao, ...linhasReceita(t, inv)] }))
                ],
                dica: 'Os ingredientes marcados com ✅ você já tem na quantidade certa.',
                proximos: [
                    { nome: 'inv', oque: 'ver sua mochila' },
                    { nome: 'usarpocao', oque: 'ver como beber uma poção' }
                ],
                prefix
            }))
        }

        const tipo = text.toLowerCase().trim()
        if (!pocoes[tipo] || !receitasPocao[tipo]) {
            return reply(F.tela({
                emoji: '❌',
                titulo: 'Não conheço essa poção',
                intro: `"${text.trim()}" não é uma das receitas. Escolha uma destas:`,
                secoes: [{ emoji: '🧪', titulo: 'Receitas', linhas: TIPOS.map(t => `• ${F.cmd(prefix, 'criarpocao', t)} — ${pocoes[t].nome.replace('🧪 ', '')}`) }],
                proximos: [{ nome: 'criarpocao', oque: 'ver as receitas com ingredientes' }],
                prefix
            }))
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        if (!user.inventario) user.inventario = []

        const receita = receitasPocao[tipo]

        for (const [item, quantidade] of Object.entries(receita)) {
            const possui = user.inventario.filter(i => i === item).length
            if (possui < quantidade) {
                return reply(F.tela({
                    emoji: '⚗️',
                    titulo: 'Faltam ingredientes',
                    intro: `Para criar *${pocoes[tipo].nome}* ainda falta *${item}* (${possui} de ${quantidade}). Nada foi consumido.`,
                    secoes: [{ emoji: '📜', titulo: 'Receita', linhas: linhasReceita(tipo, user.inventario) }],
                    dica: 'Espólios caem de caçadas, da masmorra e de chefes.',
                    proximos: [
                        { nome: 'hunt', oque: 'caçar para juntar espólios' },
                        { nome: 'inv', oque: 'ver sua mochila' }
                    ],
                    prefix
                }))
            }
        }

        for (const [item, quantidade] of Object.entries(receita)) {
            for (let i = 0; i < quantidade; i++) {
                const index = user.inventario.indexOf(item)
                if (index !== -1) {
                    user.inventario.splice(index, 1)
                }
            }
        }

        user.inventario.push('🧪 ' + tipo)
        await dataService.saveXpData(xpData)
        logger.info('[CRIARPOCAO] User ' + sender + ' criou poção ' + tipo)

        await reply(F.tela({
            emoji: '⚗️',
            titulo: 'Poção criada',
            intro: `Você criou *${pocoes[tipo].nome}* e ela já está na mochila.`,
            secoes: [{ emoji: '📜', titulo: 'Poção', linhas: [
                F.campo('Efeito', pocoes[tipo].descricao),
                F.campo('Duração ao beber', F.tempo(pocoes[tipo].duracao)),
                F.campo('Ingredientes usados', Object.entries(receita).map(([i, q]) => `${q}x ${i}`).join(', '))
            ] }],
            dica: 'Beba antes de uma caçada, chefe ou duelo para aproveitar o efeito inteiro.',
            proximos: [
                { nome: 'usarpocao', args: tipo, oque: 'beber agora' },
                { nome: 'inv', oque: 'ver sua mochila' }
            ],
            prefix
        }))
    }
}
