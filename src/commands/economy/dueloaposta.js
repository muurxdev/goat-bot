/**
 * Comando .dueloaposta / .aposta1v1 / .x1aposta
 * Duelo 1v1 apostado onde o vencedor leva 100% da aposta do adversário
 */

const { getBotName } = require('../../config/botConfig')
const dataService = require('../../services/dataService')
const { initializeUser, adicionarXp } = require('../../services/xpService')
const { calculateCharacterStats, getItem } = require('../../services/rpgEquipmentService')
const logger = require('../../core/logger')

module.exports = {
    name: 'dueloaposta',
    aliases: ["aposta1v1","x1aposta","duelovalendo","apostarcoins","cmd_dueloaposta","alt_dueloaposta","atalho_dueloaposta","abrev_dueloaposta","call_dueloaposta","func_dueloaposta"],
    category: 'economy',
    description: 'Duelo 1v1 apostado onde o vencedor leva o pote de moedas apostado',
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ info, sender, reply, args }) => {
        const botName = getBotName()
        const mencao = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const betArg = args.find(a => /^\d+$/.test(a))

        if (!mencao || !betArg) {
            return reply(
                `╔══════════════════════════════╗\n` +
                `║    💰 *DUELO 1V1 APOSTADO* 💰   ║\n` +
                `╚══════════════════════════════╝\n\n` +
                `📌 *Como Apostar:*\n` +
                `• \`.dueloaposta @usuario <valor>\`\n\n` +
                `Exemplo: \`.dueloaposta @551199999999 500\`\n\n` +
                `👑 *${botName}*`
            )
        }

        if (mencao === sender) {
            return reply('❌ Você não pode apostar contra si mesmo!')
        }

        const betAmount = parseInt(betArg, 10)
        if (isNaN(betAmount) || betAmount <= 0) {
            return reply('❌ Informe um valor de aposta válido maior que zero.')
        }

        const xpData = dataService.getXpData()
        const userSender = initializeUser(sender, xpData)
        const userOponente = initializeUser(mencao, xpData)

        if ((userSender.coins || 0) < betAmount) {
            return reply(`❌ Você não possui moedas suficientes para essa aposta de *${betAmount.toLocaleString('pt-BR')} Coins*! (Seu saldo: ${(userSender.coins || 0).toLocaleString('pt-BR')} Coins)`)
        }

        if ((userOponente.coins || 0) < betAmount) {
            return reply(`❌ O oponente @${mencao.split('@')[0]} não possui saldo suficiente para essa aposta de *${betAmount.toLocaleString('pt-BR')} Coins*!`, [mencao])
        }

        const statsSender = calculateCharacterStats(userSender)
        const statsOponente = calculateCharacterStats(userOponente)

        let rollSender = statsSender.cp + (statsSender.atk * 2) + Math.floor(Math.random() * 80)
        let rollOponente = statsOponente.cp + (statsOponente.atk * 2) + Math.floor(Math.random() * 80)

        const senderVenceu = rollSender >= rollOponente
        const vencedorJid = senderVenceu ? sender : mencao
        const perdedorJid = senderVenceu ? mencao : sender

        const userVencedor = senderVenceu ? userSender : userOponente
        const userPerdedor = senderVenceu ? userOponente : userSender

        userVencedor.coins = (userVencedor.coins || 0) + betAmount
        userVencedor.wins = (userVencedor.wins || 0) + 1
        const { lvlRes: lvlResult } = adicionarXp(userVencedor, Math.floor(betAmount * 0.2) + 50, { source: 'rpg' })

        userPerdedor.coins = Math.max(0, (userPerdedor.coins || 0) - betAmount)
        userPerdedor.losses = (userPerdedor.losses || 0) + 1

        await dataService.saveXpData(xpData)
        logger.info(`[DUELO APOSTA] ${sender} vs ${mencao} valendo ${betAmount} -> Vencedor: ${vencedorJid}`)

        const nomeVencedor = userVencedor.nicknameRpg ? `*${userVencedor.nicknameRpg}*` : `@${vencedorJid.split('@')[0]}`
        const nomePerdedor = userPerdedor.nicknameRpg ? `*${userPerdedor.nicknameRpg}*` : `@${perdedorJid.split('@')[0]}`

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   💰 *RESULTADO DA APOSTA 1V1* 💰   ║\n`
        doc += `╚══════════════════════════════╝\n\n`

        doc += `💵 *Pote Total em Jogo:* *${(betAmount * 2).toLocaleString('pt-BR')} Coins*\n\n`

        doc += `╭━〔 🏆 VENCEDOR DO POTE 〕━⬣\n`
        doc += `┃ 👑 *Ganhador:* ${nomeVencedor} (@${vencedorJid.split('@')[0]})\n`
        doc += `┃ 💰 *Prêmio Ganho:* *+${betAmount.toLocaleString('pt-BR')} Coins*\n`
        doc += `┃ 📈 *Novo Saldo:* *${(userVencedor.coins || 0).toLocaleString('pt-BR')} Coins*\n`
        if (lvlResult.subiu) {
            doc += `┃ 🆙 *SUBIU DE NÍVEL!* *Nível ${userVencedor.level}*\n`
        }
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 💀 PERDEDOR DA APOSTA 〕━⬣\n`
        doc += `┃ 🩸 *Perdedor:* ${nomePerdedor} (@${perdedorJid.split('@')[0]})\n`
        doc += `┃ 💸 *Prejuízo:* *-${betAmount.toLocaleString('pt-BR')} Coins*\n`
        doc += `┃ 💰 *Saldo Restante:* *${(userPerdedor.coins || 0).toLocaleString('pt-BR')} Coins*\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `👑 *${botName}*`

        return reply(doc.trim(), [sender, mencao, vencedorJid, perdedorJid])
    }
}
