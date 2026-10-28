/**
 * Comando .rankslayer / .rankcp
 * Ranking global de Combat Power (CP) e Patentes Slayer Legends
 */

const { getDatabase } = require('../../database/connection')
const { calculateSlayerStats } = require('../../services/slayerEngine')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'rankslayer',
    aliases: ['rankcp', 'slayerrank', 'topcp', 'toppoder', 'rankpoder'],
    category: 'rpg',
    description: 'Exibe o Top 10 Guerreiros com maior Poder de Combate (CP) no RPG',
    cooldownMs: 3000,
    execute: async ({ reply, sender }) => {
        try {
            const botName = getBotName()
            const db = getDatabase()
            const rows = db.prepare('SELECT * FROM users').all()

            if (!rows || rows.length === 0) {
                return reply('❌ Nenhum guerreiro cadastrado no banco de dados ainda.')
            }

            const scoredList = rows.map(r => {
                const s = calculateSlayerStats(r)
                const phone = r.phone || r.jid.split('@')[0].split(':')[0]
                const name = r.name || `@${phone}`
                return {
                    jid: r.jid,
                    name,
                    phone,
                    cp: s.cp,
                    slayerRank: s.slayerRank,
                    slayerTier: s.slayerTier,
                    level: r.level || 1,
                    atk: s.atk,
                    bosses: s.bossesMortos
                }
            })

            scoredList.sort((a, b) => b.cp - a.cp)
            const top10 = scoredList.slice(0, 10)
            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
            const mentions = []

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   ⚔️ *RANKING GLOBAL SLAYER CP* ⚔️  ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `🏆 *Top 10 Guerreiros com Maior Poder de Combate*\n\n`

            top10.forEach((player, i) => {
                const icon = medals[i] || `*#${i + 1}*`
                const jidClean = player.jid.split('@')[0].split(':')[0]
                mentions.push(player.jid)

                doc += `${icon} *#${i + 1}* • @${jidClean}\n`
                doc += `   ⚡ *CP:* *${player.cp.toLocaleString('pt-BR')}* | 📈 *Nível:* ${player.level}\n`
                doc += `   🎖️ *Patente:* ${player.slayerRank}\n`
                doc += `   🗡️ *ATK:* ${player.atk.toLocaleString('pt-BR')} pts | 💀 *Bosses:* ${player.bosses}\n\n`
            })

            const callerClean = sender.split('@')[0].split(':')[0]
            const callerPos = scoredList.findIndex(p => p.jid === sender || p.jid.includes(callerClean))
            if (callerPos !== -1) {
                const me = scoredList[callerPos]
                doc += `╭━〔 👤 SEU POSICIONAMENTO 〕━⬣\n`
                doc += `┃ 🏆 *Sua Colocação:* *#${callerPos + 1} Global*\n`
                doc += `┃ 🔥 *Seu Combat Power:* ⚡ *${me.cp.toLocaleString('pt-BR')} CP*\n`
                doc += `┃ 🎖️ *Patente:* ${me.slayerRank}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            }

            doc += `💡 _Consulte sua ficha detalhada:_ \`.slayer\` ou \`.cp\`\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim(), mentions)
        } catch (err) {
            logger.error('[RANKSLAYER ERROR]', err)
            return reply('❌ *Não consegui montar o ranking de poder agora.*\n\nTente de novo em instantes com `.rankslayer`.')
        }
    }
}
