const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins, formatXP } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

function xpNecessario(level) {
    return level * 100 + 50
}

module.exports = {
    name: 'levelup',
    aliases: ['lvl', 'nivelup', 'proximo'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Mostra progresso para o próximo nível e recompensas de level up',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const level = user.level || 1
        const xpAtual = user.xp || 0
        const xpReq = xpNecessario(level)
        const faltam = Math.max(0, xpReq - xpAtual)
        const percent = Math.min(100, Math.floor((xpAtual / xpReq) * 100))
        const blocos = 10
        const cheios = Math.floor((percent / 100) * blocos)
        const barra = '🟩'.repeat(cheios) + '⬛'.repeat(blocos - cheios)

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   ⬆️ *LEVEL UP* ⬆️   \n`
        doc += `╚══════════════════════════════╝\n\n`

        doc += `📈 *Nível Atual:* ${level}\n`
        doc += `⭐ *XP Atual:* ${xpAtual.toLocaleString('pt-BR')} / ${xpReq.toLocaleString('pt-BR')}\n`
        doc += `🎯 *Faltam:* ${faltam.toLocaleString('pt-BR')} XP\n\n`

        doc += `╭━〔 📊 PROGRESSO 〕━⬣\n`
        doc += `┃ ${barra} ${percent}%\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 🎁 RECOMPENSAS AO UPAR 〕━⬣\n`
        doc += `┃ 🎯 +2 Skill Points\n`
        doc += `┃ 💰 +100 Coins\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 📈 PRÓXIMOS MARCOS 〕━⬣\n`
        if (level < 10) doc += `┃ 🔓 Nível 10 → *🧠 Estudante Dev*\n`
        if (level < 20) doc += `┃ 🔓 Nível 20 → *💻 Pro*\n`
        if (level < 30) doc += `┃ 🔓 Nível 30 → *⚡ Elite*\n`
        if (level < 40) doc += `┃ 🔓 Nível 40 → *🔥 Mestre*\n`
        if (level < 50) doc += `┃ 🔓 Nível 50 → *👑 Lendário*\n`
        if (level < 100) doc += `┃ 🔓 Nível 100 → *🌟 Celestial*\n`
        if (level >= 100) doc += `┃ 🌟 Você já é Celestial! Continue subindo!\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`

        await reply(doc.trim())
    }
}
