const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'guerraguilda',
    aliases: ['warguild', 'guerraguild', 'battleguild'],
    category: 'rpg',
    subcategory: 'Guildas',
    description: 'Sistema de guerra de guildas — recrute, guerreie e suba de nível',
    cooldownMs: 30000,
    execute: async ({ args, sender, reply, info }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const guilds = dataService.getGuildData()

        const sub = (args[0] || '').toLowerCase()
        const nomeGuilda = args.slice(1).join(' ').trim()

        if (!sub || sub === 'ajuda' || sub === 'help') {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   ⚔️ *GUERRA DE GUILDAS* ⚔️   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += '╭━〔 📋 COMANDOS 〕━⬣\n'
            doc += '┃ • \`.guerraguilda criar <nome>\` — Criar guilda (5000 coins)\n'
            doc += '┃ • \`.guerraguilda ver\` — Ver info da sua guilda\n'
            doc += '┃ • \`.guerraguilda recrutar @user\` — Recrutar membro\n'
            doc += '┃ • \`.guerraguilda sair\` — Sair da guilda\n'
            doc += '┃ • \`.guerraguilda lista\` — Listar todas as guildas\n'
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += `👑 *${botName}*`

            return reply(doc.trim(), [sender])
        }

        if (sub === 'lista' || sub === 'todas') {
            const guildNames = Object.keys(guilds)
            if (guildNames.length === 0) {
                return reply('🏰 *Nenhuma guilda foi fundada ainda!*\n💡 _Seja o primeiro com_ \`.guerraguilda criar [nome]\`')
            }

            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🏰 *CATÁLOGO DE GUILDAS* 🏰   ║\n'
            doc += '╚══════════════════════════════╝\n\n'

            const mentions = []
            guildNames.forEach((gName, idx) => {
                const g = guilds[gName]
                if (g.dono) mentions.push(g.dono)
                const membros = (g.membros || []).map(m => {
                    mentions.push(m)
                    return `@${m.split('@')[0]}`
                }).join(', ')

                doc += `╭━〔 ${idx + 1}. 🛡️ *${gName}* 〕━⬣\n`
                doc += `┃ 👑 *Líder:* @${(g.dono || '').split('@')[0]}\n`
                doc += `┃ 📈 *Nível:* ${g.level || 1}  |  ⭐ *XP:* ${(g.xp || 0).toLocaleString('pt-BR')}\n`
                doc += `┃ 👥 *Membros (${(g.membros || []).length}):* ${membros || 'Nenhum'}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            doc += `👑 *${botName}*`
            return reply(doc.trim(), mentions)
        }

        if (sub === 'criar') {
            if (!nomeGuilda) return reply('❌ Informe o nome da guilda! Ex: `.guerraguilda criar Pecados Capitais`')
            if (user.guilda) return reply(`❌ Você já pertence à guilda *${user.guilda}*. Saia primeiro com \`.guerraguilda sair\`.`)
            if (guilds[nomeGuilda]) return reply(`❌ Já existe uma guilda com o nome *${nomeGuilda}*.`)
            if ((user.coins || 0) < 5000) return reply(`❌ Coins insuficientes!\n\n💰 *Seu Saldo:* ${formatCoins(user.coins || 0)}\n🏷️ *Custo:* ${formatCoins(5000)}`)

            user.coins -= 5000
            user.guilda = nomeGuilda

            guilds[nomeGuilda] = {
                dono: sender,
                membros: [sender],
                level: 1,
                xp: 0,
                coins: 0,
                criadaEm: Date.now()
            }

            await dataService.saveXpData(xpData)
            await dataService.saveGuildData(guilds)
            logger.info(`[GUERRAGUILDA] ${sender} criou guilda ${nomeGuilda}`)

            let doc = '🏰 *GUILDA CRIADA COM SUCESSO!*\n\n'
            doc += `📛 *Nome:* ${nomeGuilda}\n`
            doc += `👑 *Líder:* @${sender.split('@')[0]}\n`
            doc += `💰 *Custo Pago:* ${formatCoins(5000)}\n`
            doc += `👥 *Membros:* 1\n\n`
            doc += `💡 _Recrute membros com_ \`.guerraguilda recrutar @user\`!`

            return reply(doc.trim(), [sender])
        }

        if (sub === 'recrutar' || sub === 'convidar') {
            const minhaGuilda = user.guilda
            if (!minhaGuilda || !guilds[minhaGuilda]) return reply('❌ Você não pertence a nenhuma guilda.')
            const g = guilds[minhaGuilda]
            if (g.dono !== sender) return reply('⛔ Apenas o Líder pode recrutar membros.')

            const mentionedJid = info.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
            const target = mentionedJid[0] || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

            if (!target) return reply('📌 Marque o usuário: `.guerraguilda recrutar @user`')
            if (target === sender) return reply('❌ Você já é o líder!')

            const targetUser = initializeUser(target, xpData)
            if (targetUser.guilda) {
                return reply(`❌ @${target.split('@')[0]} já pertence à guilda *${targetUser.guilda}*!`, [target])
            }

            if (!g.membros) g.membros = []
            if (!g.membros.includes(target)) g.membros.push(target)
            targetUser.guilda = minhaGuilda

            await dataService.saveXpData(xpData)
            await dataService.saveGuildData(guilds)
            logger.info(`[GUERRAGUILDA] ${sender} recrutou ${target} na guilda ${minhaGuilda}`)

            return reply(`✅ *MEMBRO RECRUTADO!*\n\n@${target.split('@')[0]} agora faz parte da guilda *${minhaGuilda}*!`, [sender, target])
        }

        if (sub === 'sair') {
            const minhaGuilda = user.guilda
            if (!minhaGuilda) return reply('❌ Você não pertence a nenhuma guilda.')

            const g = guilds[minhaGuilda]
            if (g && g.dono === sender) {
                return reply('❌ O líder não pode sair! Se for o único membro, a guilda será desfeita.')
            }

            if (g && g.membros) {
                g.membros = g.membros.filter(m => m !== sender)
            }
            delete user.guilda

            await dataService.saveXpData(xpData)
            await dataService.saveGuildData(guilds)

            return reply(`✅ Você saiu da guilda *${minhaGuilda}*.`, [sender])
        }

        if (sub === 'ver' || sub === 'info') {
            const gName = nomeGuilda || user.guilda
            if (!gName || !guilds[gName]) {
                return reply('❌ Nenhuma guilda encontrada. Use `.guerraguilda criar <nome>` para criar uma.')
            }

            const g = guilds[gName]
            const mentions = [g.dono, ...(g.membros || [])]

            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🏰 *DETALHES DA GUILDA* 🏰   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `📛 *Nome:* ${gName}\n`
            doc += `👑 *Líder:* @${(g.dono || '').split('@')[0]}\n`
            doc += `📈 *Nível:* ${g.level || 1}  |  ⭐ *XP:* ${(g.xp || 0).toLocaleString('pt-BR')}\n`
            doc += `💰 *Cofre:* ${formatCoins(g.coins || 0)}\n\n`

            doc += `╭━〔 👥 MEMBROS (${(g.membros || []).length}) 〕━⬣\n`
            ;(g.membros || []).forEach((m, idx) => {
                const isLeader = m === g.dono
                doc += `┃ ${idx + 1}. @${m.split('@')[0]} ${isLeader ? '👑 *(Líder)*' : '⚔️ *(Guerreiro)*'}\n`
            })
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += `👑 *${botName}*`

            return reply(doc.trim(), mentions)
        }

        return reply('❌ Opção inválida! Use `.guerraguilda` para ver os comandos.')
    }
}
