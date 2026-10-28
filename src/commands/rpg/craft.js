const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { equipamentos } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'craft',
    aliases: ['craftar'],
    category: 'rpg',
    description: 'Sistema de forja de equipamentos através de receitas de loots',
    execute: async ({ text, args, sender, reply }) => {
        const craftData = dataService.getCraftData()
        if (!craftData[sender]) craftData[sender] = []

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        if (!user.inventario) user.inventario = []

        const acaoCraft = args[0] ? args[0].toLowerCase() : ''
        const nomeCraft = args.slice(1).join(' ').trim()

        if (!text || acaoCraft === 'lista') {
            let listaEquipamentos = '⚒️ *EQUIPAMENTOS DISPONÍVEIS PARA CRAFT*\n\n'
            Object.entries(equipamentos).forEach(([id, equip]) => {
                listaEquipamentos += '🗡️ *' + equip.nome + '*\n🆔 *ID:* ' + id + '\n🏷️ Tipo: ' + equip.tipo + '\n✨ Bônus: ' + equip.bonus + '\n📦 *Receita:*\n' + Object.entries(equip.receita).map(([item, qtd]) => '  • ' + qtd + 'x ' + item).join('\n') + '\n\n'
            })
            listaEquipamentos += 'Use: *.craft fazer [id/nome]* ou *.craft [id]*'
            return reply(listaEquipamentos)
        }

        if (acaoCraft === 'meus') {
            if (craftData[sender].length === 0) {
                return reply('⚒️ Você ainda não craftou nenhum equipamento.')
            }
            let meusCrafts = '⚒️ *MEUS EQUIPAMENTOS CRAFTADOS*\n\n'
            craftData[sender].forEach(equip => {
                meusCrafts += '• ' + equip + '\n'
            })
            return reply(meusCrafts)
        }

        const termoBusca = (acaoCraft === 'fazer' ? nomeCraft : text).toLowerCase().trim()
        const craftKey = Object.keys(equipamentos).find(k => k.toLowerCase() === termoBusca)
        const eq = craftKey ? equipamentos[craftKey] : Object.values(equipamentos).find(e => e.nome.toLowerCase().includes(termoBusca))

        if (!eq) {
            return reply('❌ Equipamento não encontrado.\nUse: .craft lista')
        }

        const invCraft = user.inventario
        let faltam = []
        let temTudo = true

        for (const [item, qtd] of Object.entries(eq.receita)) {
            const quantidadeNoInv = invCraft.filter(i => i === item).length
            if (quantidadeNoInv < qtd) {
                temTudo = false
                faltam.push(item + ': ' + quantidadeNoInv + '/' + qtd)
            }
        }

        if (!temTudo) {
            return reply('❌ *MATERIAIS INSUFICIENTES!*\n\nFaltam:\n' + faltam.join('\n') + '\n\nConsulte seus itens com: *.inv*')
        }

        for (const [item, qtd] of Object.entries(eq.receita)) {
            for (let i = 0; i < qtd; i++) {
                const index = user.inventario.indexOf(item)
                if (index !== -1) {
                    user.inventario.splice(index, 1)
                }
            }
        }

        user.inventario.push(eq.nome)
        if (!craftData[sender].includes(eq.nome)) {
            craftData[sender].push(eq.nome)
        }

        await dataService.saveXpData(xpData)
        await dataService.saveCraftData(craftData)
        logger.info('[CRAFT] User ' + sender + ' craftou ' + eq.nome)

        await reply('✅ *EQUIPAMENTO FORJADO COM SUCESSO!*\n\n🗡️ ' + eq.nome + '\n✨ ' + eq.bonus + '\n\nPara equipar use:\n*.equip ' + eq.nome + '*')
    }
}