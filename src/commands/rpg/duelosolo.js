const dataService = require('../../services/dataService')
const { initializeUser, adicionarXp } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

const MONSTERS = {
    slime: { nome: '🟣 Slime', hp: 10, dano: 5, xp: 20, coins: [50, 150] },
    goblin: { nome: '👺 Goblin', hp: 25, dano: 10, xp: 50, coins: [100, 250] },
    orc: { nome: '👹 Orc', hp: 50, dano: 20, xp: 100, coins: [200, 350] },
    dragao: { nome: '🐉 Dragão Jovem', hp: 100, dano: 40, xp: 250, coins: [350, 500] }
}

function barraVida(atual, max) {
    const total = 10
    const ratio = Math.max(0, Math.min(1, atual / max))
    const filled = Math.round(ratio * total)
    return '█'.repeat(filled) + '░'.repeat(total - filled) + ' ' + Math.round(ratio * 100) + '%'
}

module.exports = {
    name: 'duelosolo',
    aliases: ['duelomob', 'lutarsolo', 'soloduel'],
    category: 'rpg',
    subcategory: 'Combate',
    description: 'Duelo solo contra monstros com sistema de turnos',
    cooldownMs: 30000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const userHp = user.rpgHp || user.hp || 100
        const userMaxHp = user.rpgHpMax || user.hpMax || 100

        if (userHp <= 0) {
            return reply('❌ Você está sem HP! Use `.curar` ou `.usarpocao` para recuperar vida antes de duelar.')
        }

        const sub = (args[0] || '').toLowerCase()

        if (sub === 'monstros' || sub === 'lista' || sub === 'help') {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   ⚔️ *DUELO SOLO — MONSTROS* ⚔️   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            Object.entries(MONSTERS).forEach(([key, m]) => {
                doc += `╭━〔 ${m.nome} 〕━⬣\n`
                doc += `┃ ❤️ HP: ${m.hp}  |  💥 Dano: ${m.dano}\n`
                doc += `┃ ⭐ XP: ${m.xp}  |  💰 Coins: ${m.coins[0]}-${m.coins[1]}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })
            doc += '💡 _Use_ \`.duelosolo\` _para lutar contra um monstro aleatório!_'
            return reply(doc.trim())
        }

        const monsterKeys = Object.keys(MONSTERS)
        const chosenKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)]
        const monster = { ...MONSTERS[chosenKey] }

        let monsterHp = monster.hp
        let playerHp = userHp
        let log = ''

        log += '╔══════════════════════════════╗\n'
        log += '║   ⚔️ *DUELO SOLO — BATALHA* ⚔️   ║\n'
        log += '╚══════════════════════════════╝\n\n'
        log += `⚔️ *Encontro:* ${monster.nome} selvagem apareceu!\n`
        log += `❤️ *HP Inimigo:* ${barraVida(monsterHp, monster.hp)} ${monsterHp}/${monster.hp}\n`
        log += `❤️ *Seu HP:* ${barraVida(playerHp, userMaxHp)} ${playerHp}/${userMaxHp}\n\n`
        log += '━━━━━━ *TURNOS DE BATALHA* ━━━━━━\n\n'

        let turn = 1
        let playerWins = false

        while (playerHp > 0 && monsterHp > 0 && turn <= 20) {
            const playerRoll = Math.floor(Math.random() * 20) + 1
            const weaponBonus = user.arma ? Math.floor(Math.random() * 10) + 5 : 0
            const playerDmg = Math.max(1, playerRoll + weaponBonus)
            monsterHp -= playerDmg

            log += `📍 *Turno ${turn}*\n`
            log += `⚔️ Você atacou: *${playerDmg}* de dano (🎲 ${playerRoll} + 🔪 ${weaponBonus})\n`

            if (monsterHp <= 0) {
                log += `💀 ${monster.nome} foi derrotado!\n`
                playerWins = true
                break
            }

            const monsterDmg = Math.max(1, monster.dano + Math.floor(Math.random() * 10) - 5)
            playerHp -= monsterDmg
            log += `🗡️ ${monster.nome} contra-atacou: *${monsterDmg}* de dano\n`
            log += `❤️ HP Inimigo: ${barraVida(monsterHp, monster.hp)} | Seu HP: ${barraVida(playerHp, userMaxHp)}\n\n`

            turn++
        }

        if (!playerWins && playerHp <= 0) {
            log += `\n💀 *VOCÊ FOI DERROTADO!*\n`
            log += `${monster.nome} venceu o duelo.\n`

            user.rpgHp = Math.max(1, playerHp)
            user.hp = Math.max(1, playerHp)
            await dataService.saveXpData(xpData)
            logger.info(`[DUELOSOLO] ${sender} perdeu para ${monster.nome}`)

            return reply(log.trim(), [sender])
        }

        if (!playerWins && turn > 20) {
            log += `\n⏱️ *EMPATE — Limite de turnos atingido!*\n`
            user.rpgHp = Math.max(1, playerHp)
            user.hp = Math.max(1, playerHp)
            await dataService.saveXpData(xpData)

            return reply(log.trim(), [sender])
        }

        const coinsGanhos = Math.floor(Math.random() * (monster.coins[1] - monster.coins[0] + 1)) + monster.coins[0]
        const xpBase = monster.xp + Math.floor(Math.random() * 20)

        user.coins = (user.coins || 0) + coinsGanhos
        user.rpgHp = Math.max(1, playerHp)
        user.hp = Math.max(1, playerHp)
        user.monstersKilled = (user.monstersKilled || 0) + 1

        const { xpGanho, lvlRes: lvlResult } = adicionarXp(user, xpBase, { source: 'rpg' })

        log += `\n╭━〔 🏆 VITÓRIA! 〕━⬣\n`
        log += `┃ 💰 *Coins Ganhou:* +${formatCoins(coinsGanhos)}\n`
        log += `┃ ⭐ *XP Ganhou:* +${xpGanho} XP\n`
        log += `┃ ❤️ *HP Restante:* ${playerHp}/${userMaxHp}\n`
        if (lvlResult.subiu) {
            log += `┃ 🆙 *SUBIU DE NÍVEL!* Nível ${user.level} 🎉\n`
        }
        log += `╰━━━━━━━━━━━━━━━━━━⬣\n`

        await dataService.saveXpData(xpData)
        logger.info(`[DUELOSOLO] ${sender} derrotou ${monster.nome} (+${coinsGanhos} coins, +${xpGanho} xp)`)

        return reply(log.trim(), [sender])
    }
}
