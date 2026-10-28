const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes } = require('../../utils/constants')
const F = require('../../utils/formato')

module.exports = {
    name: 'pocaoativa',
    aliases: ['buffs', 'minhapocao'],
    category: 'rpg',
    subcategory: 'Alquimia',
    description: 'Consulta o tempo restante e efeitos da sua poção ativa',
    examples: [' — mostra a poção que está valendo e quanto tempo falta'],
    execute: async ({ sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!user.pocaoAtiva || Date.now() >= user.pocaoAtiva.expira) {
            user.pocaoAtiva = null
            await dataService.saveXpData(xpData)
            const inv = Array.isArray(user.inventario) ? user.inventario : []
            const naMochila = Object.keys(pocoes).filter(t => inv.includes('🧪 ' + t))
            return reply(F.tela({
                emoji: '🧪',
                titulo: 'Nenhuma poção ativa',
                intro: 'Você não está sob efeito de nenhuma poção agora. Quando beber uma, aqui aparece o efeito e o tempo que falta.',
                secoes: [{ emoji: '🎒', titulo: 'Na sua mochila', linhas: naMochila.length
                    ? naMochila.map(t => `• ${F.cmd(prefix, 'usarpocao', t)} — ${pocoes[t].nome.replace('🧪 ', '')}`)
                    : ['Nenhuma poção. Crie uma com os espólios da receita.'] }],
                dica: 'Poções dão mais dano, XP ou moedas por 30 minutos.',
                proximos: naMochila.length
                    ? [{ nome: 'usarpocao', args: naMochila[0], oque: 'beber agora' }]
                    : [{ nome: 'criarpocao', oque: 'ver as receitas' }, { nome: 'pocao', oque: 'ler o guia de poções' }],
                prefix
            }))
        }

        const pocao = pocoes[user.pocaoAtiva.tipo]
        const tempoRestante = user.pocaoAtiva.expira - Date.now()
        const total = pocao?.duracao || tempoRestante

        await reply(F.tela({
            emoji: '🧪',
            titulo: 'Poção ativa',
            intro: `*${pocao?.nome || user.pocaoAtiva.tipo}* ainda vale por *${F.tempo(tempoRestante)}*.`,
            secoes: [{ emoji: '📜', titulo: 'Efeito', linhas: [
                F.campo('Efeito', pocao?.descricao || '—'),
                F.campo('Tempo restante', F.tempo(tempoRestante)),
                F.campo('Restante', F.barra(tempoRestante / total))
            ] }],
            dica: 'Beber outra poção agora troca o efeito atual pelo novo.',
            proximos: [
                { nome: 'hunt', oque: 'aproveitar numa caçada' },
                { nome: 'boss', oque: 'aproveitar contra um chefe' }
            ],
            prefix
        }))
    }
}
