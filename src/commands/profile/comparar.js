const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins, formatXP } = require('../../utils/uiEngine')
const { getCargo, getRank } = require('../../utils/helpers')
const logger = require('../../core/logger')

module.exports = {
    name: 'comparar',
    aliases: ['compare', 'compararperfil', 'vs'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Compara seu perfil com outro usuário',
    cooldownMs: 10000,
    execute: async ({ args, sender, info, reply }) => {
        const alvo = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (!alvo || alvo === sender) {
            return reply('❌ Mencione um usuário para comparar.\n\nUso: `.comparar @user`')
        }

        const xpData = dataService.getXpData()
        const user1 = initializeUser(sender, xpData)
        const user2 = initializeUser(alvo, xpData)

        function medalha(v1, v2) {
            if (v1 > v2) return '🟢'
            if (v2 > v1) return '🔴'
            return '🟡'
        }

        const nivel1 = user1.level || 1
        const nivel2 = user2.level || 1
        const coins1 = user1.coins || 0
        const coins2 = user2.coins || 0
        const msgs1 = user1.messages || 0
        const msgs2 = user2.messages || 0
        const conquistas1 = (user1.conquistas || []).length
        const conquistas2 = (user2.conquistas || []).length
        const xp1 = user1.xp || 0
        const xp2 = user2.xp || 0

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   ⚔️ *COMPARAÇÃO DE PERFIS* ⚔️   \n`
        doc += `╚══════════════════════════════╝\n\n`

        doc += `╭━〔 📊 ESTATÍSTICAS 〕━⬣\n`
        doc += `┃                          🟢 Você  🔴 Ele\n`
        doc += `┃ ${medalha(nivel1, nivel2)} *Nível:*     ${String(nivel1).padStart(4)} vs ${String(nivel2).padStart(4)}\n`
        doc += `┃ ${medalha(xp1, xp2)} *XP:*        ${String(xp1).padStart(6)} vs ${String(xp2).padStart(6)}\n`
        doc += `┃ ${medalha(coins1, coins2)} *Coins:*     ${String(coins1).padStart(6)} vs ${String(coins2).padStart(6)}\n`
        doc += `┃ ${medalha(msgs1, msgs2)} *Mensagens:* ${String(msgs1).padStart(6)} vs ${String(msgs2).padStart(6)}\n`
        doc += `┃ ${medalha(conquistas1, conquistas2)} *Conquistas:* ${String(conquistas1).padStart(3)} vs ${String(conquistas2).padStart(3)}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        let vitorias1 = 0
        if (nivel1 > nivel2) vitorias1++
        if (xp1 > xp2) vitorias1++
        if (coins1 > coins2) vitorias1++
        if (msgs1 > msgs2) vitorias1++
        if (conquistas1 > conquistas2) vitorias1++

        const vitorias2 = 5 - vitorias1

        doc += `╭━〔 🏆 PLACAR FINAL 〕━⬣\n`
        doc += `┃ 🟢 *Você:* ${vitorias1} | 🔴 *Eles:* ${vitorias2}\n`
        if (vitorias1 > vitorias2) {
            doc += `┃ 🎉 *Você está na frente!*\n`
        } else if (vitorias2 > vitorias1) {
            doc += `┃ 💪 *Eles estão na frente!*\n`
        } else {
            doc += `┃ 🤝 *Empate perfeito!*\n`
        }
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 👤 RANKS 〕━⬣\n`
        doc += `┃ 🟢 *Você:* ${getRank(nivel1)} — ${getCargo(nivel1)}\n`
        doc += `┃ 🔴 *Eles:* ${getRank(nivel2)} — ${getCargo(nivel2)}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`

        await reply(doc.trim(), [sender, alvo])
    }
}
