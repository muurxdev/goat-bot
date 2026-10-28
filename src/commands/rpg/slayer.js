/**
 * Comando .slayer / .statusrpg / .cp
 * Tabela de pontuação e atributos de combate estilo Slayer Legends
 */

const { getUser } = require('../../database/repositories/userRepository')
const { calculateSlayerStats } = require('../../services/slayerEngine')
const { getDatabase } = require('../../database/connection')
const { arenas } = require('../../utils/constants')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'slayer',
    aliases: [ 'cp', 'atributos', 'combate', 'poder', 'pontuacao'],
    category: 'rpg',
    description: 'Exibe sua ficha e tabela de pontuação de atributos estilo Slayer Legends',
    cooldownMs: 2500,
    execute: async ({ info, sender, from, reply, client }) => {
        try {
            const botName = getBotName()
            const contextInfo = info?.message?.extendedTextMessage?.contextInfo
            const mentioned = contextInfo?.mentionedJid?.[0]
            const quotedParticipant = contextInfo?.participant
            const targetJid = mentioned || quotedParticipant || sender

            const cleanTarget = targetJid.split('@')[0].split(':')[0]
            let user = getUser(targetJid, [targetJid, cleanTarget + '@s.whatsapp.net'])

            if (!user) {
                user = {
                    jid: targetJid,
                    level: 1,
                    xp: 0,
                    hp: 100,
                    hpMax: 100,
                    wins: 0,
                    losses: 0,
                    bossesMortos: 0,
                    arenaPontos: 0,
                    arenaAtual: 1
                }
            }

            const stats = calculateSlayerStats(user)
            const arenaInfo = arenas[user.arenaAtual] || { nome: `Arena ${user.arenaAtual || 1}` }

            // Posição no ranking global de CP
            let rankPos = '#1'
            try {
                const db = getDatabase()
                const rows = db.prepare('SELECT * FROM users').all()
                let scored = rows.map(r => {
                    const s = calculateSlayerStats(r)
                    return { jid: r.jid, cp: s.cp }
                })
                scored.sort((a, b) => b.cp - a.cp)
                const idx = scored.findIndex(p => p.jid === user.jid || (p.jid && p.jid.includes(cleanTarget)))
                if (idx !== -1) {
                    rankPos = `#${idx + 1}`
                }
            } catch (err) {
                logger.warn(`[SLAYER] Não consegui calcular a posição de ${targetJid} no ranking de poder: ${err.message}`)
            }

            const petName = typeof user.pet === 'string' ? user.pet : (user.pet?.nome || 'Nenhum')
            const armaName = user.arma || user.equipado || 'Nenhuma'

            let doc = `╔══════════════════════════════╗\n`
            doc += `║    ⚔️ *SLAYER LEGENDS RPG* ⚔️    ║\n`
            doc += `╚══════════════════════════════╝\n\n`

            doc += `👤 *Guerreiro:* @${cleanTarget}\n`
            doc += `🎖️ *Patente Slayer:* ${stats.slayerRank} (${stats.slayerTier})\n`
            doc += `🏆 *Rank de Poder:* *${rankPos} Global*\n`
            doc += `🔥 *Poder de Combate (CP):* ⚡ *${stats.cp.toLocaleString('pt-BR')} CP*\n\n`

            doc += `╭━〔 📊 TABELA DE PONTUAÇÃO & ATRIBUTOS 〕━⬣\n`
            doc += `┃ 🗡️ *Ataque Físico (ATK):* ${stats.atk.toLocaleString('pt-BR')} pts\n`
            doc += `┃ 🛡️ *Defesa (DEF):* ${stats.def.toLocaleString('pt-BR')} pts (Mitigação: ${stats.mitigationPercent}%)\n`
            doc += `┃ ❤️ *Vida Total (HP):* ${stats.currentHp.toLocaleString('pt-BR')} / ${stats.hpMax.toLocaleString('pt-BR')} HP\n`
            doc += `┃ 🎯 *Taxa Crítica (CRIT):* ${stats.critRate}%\n`
            doc += `┃ 💥 *Dano Crítico (CRIT DMG):* ${stats.critDamage}% (x${(stats.critDamage / 100).toFixed(1)})\n`
            doc += `┃ ⚡ *Velocidade de Ataque:* ${stats.attackSpeed} atk/s\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `╭━〔 🏆 HISTÓRICO DE BATALHAS & ARENA 〕━⬣\n`
            doc += `┃ 💀 *Bosses Derrotados:* ${stats.bossesMortos.toLocaleString('pt-BR')} chefões\n`
            doc += `┃ ⚔️ *Vitórias em Combate:* ${stats.wins.toLocaleString('pt-BR')} vitórias\n`
            doc += `┃ 🏟️ *Arena Atual:* ${arenaInfo.nome}\n`
            doc += `┃ 🏅 *Pontos de Arena:* ${stats.arenaPontos.toLocaleString('pt-BR')} pts\n`
            doc += `┃ 🗡️ *Arma em Uso:* ${armaName}\n`
            doc += `┃ 🐾 *Companheiro (Pet):* ${petName}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `💡 _Para ver o ranking global de Combat Power:_ \`.rankslayer\` ou \`.rankcp\`\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim(), [targetJid])
        } catch (err) {
            logger.error('[SLAYER COMMAND ERROR]', err)
            return reply('❌ *Não consegui montar a ficha de poder agora.*\n\nTente de novo em instantes com `.slayer`.')
        }
    }
}
