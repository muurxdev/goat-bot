const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classes, classesLendarias } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'classe',
    aliases: ['classes', 'vocacao'],
    category: 'rpg',
    description: 'Sistema de classes do jogador: listar, ver informações ou escolher',
    execute: async ({ args, sender, reply }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nomeClasse = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (acao === 'lendaria' || acao === 'lendarias') {
            const lendariaCmd = require('./lendaria')
            return lendariaCmd.execute({ args: args.slice(1), sender, reply })
        }

        if (!acao || acao === 'lista') {
            let listaTexto = `╔══════════════════════════════╗\n`
            listaTexto += `║    ⚔️ *CLASSES DO REINO* ⚔️    ║\n`
            listaTexto += `╚══════════════════════════════╝\n\n`
            listaTexto += `👤 *Sua Classe Atual:* *${classes[user.classe]?.nome || user.classe || 'Nenhuma'}*\n`
            listaTexto += `🌟 *Sua Classe Lendária:* *${classesLendarias[user.classeLendaria]?.nome || user.classeLendaria || 'Nenhuma'}*\n\n`

            listaTexto += `╭━〔 🛡️ CLASSES BÁSICAS 〕━⬣\n`
            Object.entries(classes).forEach(([id, c]) => {
                listaTexto += `┃ • *${c.nome}* (\`${id}\`)\n┃   ✨ ${c.habilidade}\n`
            })
            listaTexto += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            listaTexto += `╭━〔 👑 CLASSES LENDÁRIAS SUPREMAS 〕━⬣\n`
            Object.entries(classesLendarias).forEach(([id, l]) => {
                listaTexto += `┃ • *${l.nome}* (\`${id}\`)\n┃   📌 Req: ${l.requisito}\n`
            })
            listaTexto += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            listaTexto += `💡 _Para escolher classe básica:_ \`.classe escolher [id]\`\n`
            listaTexto += `💡 _Para ver detalhes:_ \`.classe info [id]\`\n`
            listaTexto += `💡 _Para desbloquear classes lendárias:_ \`.lendaria lista\``
            return reply(listaTexto.trim())
        }

        if (acao === 'info') {
            if (!nomeClasse) return reply('❌ Use: .classe info [nome]\nExemplo: .classe info guerreiro ou .classe info goat_assault')
            const c = classes[nomeClasse] || classesLendarias[nomeClasse]
            if (!c) return reply('❌ Classe não encontrada. Use .classe lista.')

            return reply('🧬 *INFORMAÇÕES DA CLASSE*\n\n' + c.nome + '\n\n📌 *Requisito/Descrição:* ' + (c.requisito || c.descricao) + '\n✨ *Habilidade:* ' + c.habilidade + '\n\nPara escolher use:\n*.classe escolher ' + nomeClasse + '* ou *.lendaria desbloquear ' + nomeClasse + '*')
        }

        if (acao === 'escolher') {
            if (!nomeClasse) return reply('❌ Use: .classe escolher [nome]\nExemplo: .classe escolher guerreiro')
            if (!classes[nomeClasse]) return reply('❌ Classe inválida. Use .classe lista.')

            if (user.classe) {
                return reply('❌ Você já possui uma classe ativa (*' + (classes[user.classe]?.nome || user.classe) + '*). Para trocar, use: *.classeshop*')
            }

            user.classe = nomeClasse
            await dataService.saveXpData(xpData)
            logger.info('[CLASSE] User ' + sender + ' escolheu ' + nomeClasse)

            return reply('🎉 *CLASSE ESCOLHIDA COM SUCESSO!*\n\n' + classes[nomeClasse].nome + '\n\n📌 ' + classes[nomeClasse].descricao + '\n✨ ' + classes[nomeClasse].habilidade)
        }

        return reply('❌ Opção inválida. Use: .classe lista, .classe info [nome] ou .classe escolher [nome]')
    }
}