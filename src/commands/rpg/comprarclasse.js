/**
 * Comando .comprarclasse / .mudarclasse / .adquirirclasse
 * Compra e equipa uma nova classe RPG com coins
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classes } = require('../../utils/constants')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

const precosClasses = {
    guerreiro: 800,
    mago: 800,
    arqueiro: 900,
    curandeiro: 1000,
    ladino: 1000,
    paladino: 1200,
    necromante: 1500,
    berserker: 1800
}

module.exports = {
    name: 'comprarclasse',
    aliases: ['mudarclasse', 'adquirirclasse', 'novoclasse'],
    category: 'rpg',
    subcategory: 'Classes',
    description: 'Compra e equipa uma nova classe RPG utilizando coins',
    cooldownMs: 3000,
    execute: async ({ text, sender, reply }) => {
        const botName = getBotName()

        if (!text) {
            const lista = Object.entries(precosClasses).map(([id, preco]) => {
                const c = classes[id]
                return `┃ • *${c?.nome || id}* — 💰 ${preco.toLocaleString('pt-BR')} Coins\n┃   👉 \`.comprarclasse ${id}\``
            }).join('\n')

            return reply(
                `╔══════════════════════════════╗\n` +
                `║   ⚔️ *ESCOLHA SUA CLASSE* ⚔️   ║\n` +
                `╚══════════════════════════════╝\n\n` +
                `💰 *Seu Saldo:* ${(precosClasses[0] || 0).toLocaleString('pt-BR')} Coins\n\n` +
                `╭━〔 🛡️ CLASSES DISPONÍVEIS 〕━⬣\n` +
                lista + '\n' +
                `╰━━━━━━━━━━━━━━━━━━⬣\n\n` +
                `💡 _Exemplo:_ \`.comprarclasse guerreiro\`\n` +
                `👑 *${botName}*`
            )
        }

        const classeEscolhida = text.toLowerCase().trim()
        if (!classes[classeEscolhida] || !precosClasses[classeEscolhida]) {
            return reply(`❌ Classe *"${classeEscolhida}"* não encontrada. Use \`.comprarclasse\` para ver as disponíveis.`)
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const preco = precosClasses[classeEscolhida]
        if ((user.coins || 0) < preco) {
            return reply(
                `❌ Coins insuficientes!\n\n` +
                `💰 *Seu Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n` +
                `🏷️ *Preço da Classe:* ${preco.toLocaleString('pt-BR')} Coins`
            )
        }

        const classeAnterior = user.classe
        user.coins -= preco
        user.classe = classeEscolhida

        await dataService.saveXpData(xpData)
        logger.info(`[COMPRARCLASSE] ${sender} comprou classe ${classeEscolhida}${classeAnterior ? ` (antes: ${classeAnterior})` : ''}`)

        const c = classes[classeEscolhida]
        let doc = `╔══════════════════════════════╗\n`
        doc += `║   ⚔️ *CLASSE ADQUIRIDA!* ⚔️   ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        doc += `✨ *Nova Classe:* ${c.nome}\n`
        doc += `📜 *Descrição:* ${c.descricao}\n`
        doc += `🌟 *Habilidade:* ${c.habilidade}\n\n`
        doc += `💰 *Pago:* ${preco.toLocaleString('pt-BR')} Coins\n`
        doc += `🪙 *Saldo Restante:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n\n`
        doc += `💡 _Use_ \`.classe info ${classeEscolhida}\` _para ver detalhes_\n`
        doc += `👑 *${botName}*`

        return reply(doc.trim())
    }
}
