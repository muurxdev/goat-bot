const { nomeDoMembro } = require('../../utils/nomeMembro');
const dataService = require('../../services/dataService')
const { initializeUser, adicionarXp } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')
const { sortearEquipamentoDrop } = require('../../services/rpgEquipmentService')

const RAID_BOSS = {
    nome: '👁️ Guardião do Vazio',
    hpMax: 500,
    danoBase: 30,
    xp: 2000,
    coins: [1000, 5000],
    loot: ['⭐ Cristal do Vazio', '🗡️ Lâmina Dimensional', '🛡️ Escudo Abissal', '👑 Coroa do Guardião']
}

function barraVida(atual, max) {
    const total = 10
    const ratio = Math.max(0, Math.min(1, atual / max))
    const filled = Math.round(ratio * total)
    return '█'.repeat(filled) + '░'.repeat(total - filled) + ' ' + Math.round(ratio * 100) + '%'
}

module.exports = {
    name: 'raidevento',
    aliases: ['raidsemanal', 'eventoraid'],
    category: 'rpg',
    subcategory: 'Eventos',
    description: 'Evento de raid semanal — derrote o boss com o grupo',
    cooldownMs: 604800000,
    execute: async ({ sender, reply, from, args, client }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const eventos = dataService.getRaidEventsData()

        // Mesmo problema do .raid: saveBossData() só persiste `lutas`, então
        // `raidEvent` era descartado e o evento sumia entre um comando e outro.
        const eventKey = `raid_${from}`
        const raid = eventos[eventKey]

        const sub = (args[0] || '').toLowerCase()

        if (sub === 'status' || sub === 'info') {
            if (!raid || raid.hp <= 0) {
                return reply('❌ *Nenhum raid de evento ativo no momento!*\n\n💡 _Aguarde o próximo evento ou crie com_ \`.raidevento\`')
            }

            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🐉 *RAID DE EVENTO — STATUS* 🐉   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `👁️ *Boss:* ${RAID_BOSS.nome}\n`
            doc += `❤️ *Vida:* ${barraVida(raid.hp, raid.hpMax)}\n`
            doc += `❤️ ${Math.max(0, raid.hp).toLocaleString('pt-BR')} / ${raid.hpMax.toLocaleString('pt-BR')} HP\n\n`

            const participantes = Object.entries(raid.dano || {}).sort((a, b) => b[1] - a[1])
            doc += '╭━〔 ⚔️ RANKING 〕━⬣\n'
            if (participantes.length > 0) {
                participantes.slice(0, 10).forEach(([pUser, dmg], i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'
                    doc += `┃ ${medal} ${nomeDoMembro(pUser)} — *${dmg.toLocaleString('pt-BR')} dmg*\n`
                })
            } else {
                doc += '┃ ▫️ Nenhum ataque ainda.\n'
            }
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '💡 _Ataque:_ \`.raidevento atk\`'

            const mentions = participantes.map(p => p[0])
            return reply(doc.trim(), mentions)
        }

        if (sub === 'atk' || sub === 'atacar' || sub === 'golpe' || !sub) {
            if (!raid || raid.hp <= 0) {
                if (raid && raid.hp <= 0) {
                    return reply('❌ *Este raid já foi derrotado!*\n\nAguarde o próximo evento.')
                }

                eventos[eventKey] = {
                    hp: RAID_BOSS.hpMax,
                    hpMax: RAID_BOSS.hpMax,
                    dano: {},
                    ativo: true,
                    inicio: Date.now()
                }

                const bossRef = eventos[eventKey]
                const userLevel = user.level || 1
                let dano = Math.floor(userLevel * 8) + Math.floor(Math.random() * 50) + 30

                const classe = user.classe || 'nenhuma'
                if (classe === 'guerreiro') dano = Math.floor(dano * 1.5)
                if (classe === 'mago') dano = Math.floor(dano * 1.8)
                if (classe === 'arqueiro') dano = Math.floor(dano * 1.7)
                if (classe === 'ladino') dano = Math.floor(dano * 1.9)
                if (classe === 'paladino') dano = Math.floor(dano * 1.6)
                if (classe === 'berserker') dano = Math.floor(dano * 2.0)
                if (classe === 'necromante') dano = Math.floor(dano * 1.7)
                if (classe === 'curandeiro') dano = Math.floor(dano * 1.4)
                if (user.classeLendaria) dano = Math.floor(dano * 1.5)

                bossRef.hp -= dano
                if (!bossRef.dano[sender]) bossRef.dano[sender] = 0
                bossRef.dano[sender] += dano

                const bossDmg = RAID_BOSS.danoBase + Math.floor(Math.random() * 20)
                user.hp = Math.max(1, (user.hp || 100) - bossDmg)
                user.rpgHp = user.hp

                if (bossRef.hp <= 0) {
                    bossRef.hp = 0
                    bossRef.ativo = false
                    return await handleVictory(sender, user, bossRef, xpData, eventos, eventKey, reply)
                }

                await dataService.saveXpData(xpData)
                dataService.saveRaidEventsData(eventos)

                let doc = '⚔️ *ATAQUE NO RAID DE EVENTO!*\n\n'
                doc += `👁️ *Boss:* ${RAID_BOSS.nome}\n`
                doc += `❤️ *Vida:* ${barraVida(bossRef.hp, bossRef.hpMax)}\n`
                doc += `❤️ ${Math.max(0, bossRef.hp).toLocaleString('pt-BR')} / ${bossRef.hpMax.toLocaleString('pt-BR')} HP\n\n`
                doc += `💥 *Seu Golpe:* ${dano.toLocaleString('pt-BR')} de dano!\n`
                doc += `📊 *Seu Total:* ${bossRef.dano[sender].toLocaleString('pt-BR')} HP\n`
                doc += `💔 *Contra-ataque:* -${bossDmg} HP (Seu HP: ${user.hp || user.rpgHp || 100})`

                return reply(doc.trim(), [sender])
            }

            const userLevel = user.level || 1
            let dano = Math.floor(userLevel * 8) + Math.floor(Math.random() * 50) + 30

            const classe = user.classe || 'nenhuma'
            if (classe === 'guerreiro') dano = Math.floor(dano * 1.5)
            if (classe === 'mago') dano = Math.floor(dano * 1.8)
            if (classe === 'arqueiro') dano = Math.floor(dano * 1.7)
            if (classe === 'ladino') dano = Math.floor(dano * 1.9)
            if (classe === 'paladino') dano = Math.floor(dano * 1.6)
            if (classe === 'berserker') dano = Math.floor(dano * 2.0)
            if (classe === 'necromante') dano = Math.floor(dano * 1.7)
            if (classe === 'curandeiro') dano = Math.floor(dano * 1.4)
            if (user.classeLendaria) dano = Math.floor(dano * 1.5)

            raid.hp -= dano
            if (!raid.dano) raid.dano = {}
            if (!raid.dano[sender]) raid.dano[sender] = 0
            raid.dano[sender] += dano

            const bossDmg = RAID_BOSS.danoBase + Math.floor(Math.random() * 20)
            user.hp = Math.max(1, (user.hp || 100) - bossDmg)
            user.rpgHp = user.hp

            if (raid.hp <= 0) {
                raid.hp = 0
                raid.ativo = false
                return await handleVictory(sender, user, raid, xpData, eventos, eventKey, reply)
            }

            await dataService.saveXpData(xpData)
            dataService.saveRaidEventsData(eventos)

            let doc = '⚔️ *ATAQUE NO RAID DE EVENTO!*\n\n'
            doc += `👁️ *Boss:* ${RAID_BOSS.nome}\n`
            doc += `❤️ *Vida:* ${barraVida(raid.hp, raid.hpMax)}\n`
            doc += `❤️ ${Math.max(0, raid.hp).toLocaleString('pt-BR')} / ${raid.hpMax.toLocaleString('pt-BR')} HP\n\n`
            doc += `💥 *Seu Golpe:* ${dano.toLocaleString('pt-BR')} de dano!\n`
            doc += `📊 *Seu Total:* ${raid.dano[sender].toLocaleString('pt-BR')} HP\n`
            doc += `💔 *Contra-ataque:* -${bossDmg} HP (Seu HP: ${user.hp || user.rpgHp || 100})`

            return reply(doc.trim(), [sender])
        }

        return reply('╔══════════════════════════════╗\n║   🐉 *RAID DE EVENTO SEMANAL* 🐉   ║\n╚══════════════════════════════╝\n\n• \`.raidevento\` — Participar / criar raid\n• \`.raidevento atk\` — Atacar o boss\n• \`.raidevento status\` — Ver progresso\n\n👁️ *Boss:* ' + RAID_BOSS.nome + '\n❤️ *HP:* ' + RAID_BOSS.hpMax + '\n🎁 *Recompensas:* ' + formatCoins(RAID_BOSS.coins[0]) + '-' + formatCoins(RAID_BOSS.coins[1]) + ' + loot raro\n\n💡 _Todos os membros do grupo podem atacar!_')
    }
}

async function handleVictory(sender, user, raid, xpData, eventos, eventKey, reply) {
    const participantes = Object.keys(raid.dano || {})

    let coinsTotal = Math.floor(Math.random() * (RAID_BOSS.coins[1] - RAID_BOSS.coins[0] + 1)) + RAID_BOSS.coins[0]
    let xpTotal = RAID_BOSS.xp

    const coinsPorJogador = Math.floor(coinsTotal / Math.max(1, participantes.length))
    const xpPorJogador = Math.floor(xpTotal / Math.max(1, participantes.length))

    participantes.sort((a, b) => ((raid.dano || {})[b] || 0) - ((raid.dano || {})[a] || 0))

    const dropsPorJogador = {}

    participantes.forEach((pUser, i) => {
        const p = initializeUser(pUser, xpData)
        p.coins = (p.coins || 0) + coinsPorJogador
        p.raidBossesKilled = (p.raidBossesKilled || 0) + 1

        if (!Array.isArray(p.inventario)) p.inventario = []
        const userRewards = []

        // 1. Drop Garantido de Material de Evento
        if (RAID_BOSS.loot && RAID_BOSS.loot.length > 0) {
            const drop = RAID_BOSS.loot[i % RAID_BOSS.loot.length]
            p.inventario.push(drop)
            userRewards.push(`🎁 ${drop}`)
        }

        // 2. Drop de Equipamento Real do Catálogo (MVP 80%, outros 50%)
        const chanceEquip = i === 0 ? 0.80 : 0.50
        if (Math.random() <= chanceEquip) {
            try {
                const equip = sortearEquipamentoDrop((p.level || 1) + 10)
                if (equip) {
                    p.inventario.push({ ...equip })
                    userRewards.push(`✨ ${equip.raridade} ${equip.nome} (+${equip.cp} CP)`)
                }
            } catch (err) {
                logger.warn('[RAIDEVENTO] Erro ao sortear equipamento: ' + err.message)
            }
        }

        const { lvlRes: lvlResult } = adicionarXp(p, xpPorJogador, { source: 'rpg' })
        if (lvlResult && lvlResult.subiu) {
            userRewards.push(`🆙 Nível ${p.level}`)
        }

        dropsPorJogador[pUser] = userRewards
    })

    delete eventos[eventKey]
    await dataService.saveXpData(xpData)
    dataService.saveRaidEventsData(eventos)
    logger.info(`[RAIDEVENTO] Grupo venceu raid com ${participantes.length} jogadores`)

    let doc = '╔══════════════════════════════╗\n'
    doc += '║   🏆 *RAID DE EVENTO DERROTADO!* 🏆   ║\n'
    doc += '╚══════════════════════════════╝\n\n'
    doc += `👁️ *${RAID_BOSS.nome}* foi derrotado!\n\n`
    doc += `💰 *Recompensa Básica:* +${formatCoins(coinsPorJogador)} | ⭐ +${xpPorJogador.toLocaleString('pt-BR')} XP\n\n`

    doc += '╭━〔 🏅 PARTICIPANTES & DROPS 〕━⬣\n'
    participantes.forEach((pUser, i) => {
        const dmg = (raid.dano || {})[pUser] || 0
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'
        doc += `┃ ${medal} ${nomeDoMembro(pUser)} — *${dmg.toLocaleString('pt-BR')} dmg*\n`
        const rew = dropsPorJogador[pUser] || []
        if (rew.length > 0) {
            rew.forEach(r => {
                doc += `┃    └ ${r}\n`
            })
        }
    })
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '💡 _Equipe seus novos itens com \`.equipar <nome>\` e veja no \`.inv\`!_'

    return reply(doc.trim(), participantes)
}
