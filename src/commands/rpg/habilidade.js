const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const { pagas } = require('../../services/skillTreeService')
const logger = require('../../core/logger')

const SKILL_EFFECTS = {
    ataque: {
        nome: '⚔️ Golpe Furioso',
        descricao: 'Dano amplificado em 2x no próximo ataque',
        apply: (user, baseDmg) => {
            return { dano: baseDmg * 2, hpCost: 0, msg: '⚔️ *GOLPE FURIOSO!* Dano 2x desferido!' }
        }
    },
    defesa: {
        nome: '🛡️ Muralha Arcana',
        descricao: 'Reduz todo dano recebido em 50% neste turno',
        apply: (user, baseDmg) => {
            return { danoReduzido: 0.5, hpCost: 0, msg: '🛡️ *MURALHA ARCANA ATIVADA!* Dano reduzido em 50%!' }
        }
    },
    magia: {
        nome: '🔮 Explosão Arcana',
        descricao: 'Dano mágico 3x, mas custa 15 HP',
        apply: (user, baseDmg) => {
            return { dano: baseDmg * 3, hpCost: 15, msg: '🔮 *EXPLOSÃO ARCANA!* Dano 3x, mas -15 HP!' }
        }
    },
    cura: {
        nome: '💚 Cura Divina',
        descricao: 'Recupera 30 HP imediatamente',
        apply: (user, baseDmg) => {
            return { cura: 30, hpCost: 0, msg: '💚 *CURA DIVINA!* +30 HP recuperados!' }
        }
    },
    sorte: {
        nome: '🍀 Toque da Sorte',
        descricao: 'Próximo ataque tem chance crítica garantida',
        apply: (user, baseDmg) => {
            return { critico: true, hpCost: 0, msg: '🍀 *TOQUE DA SORTE!* Próximo ataque será crítico!' }
        }
    }
}

module.exports = {
    name: 'habilidade',
    aliases: ['skill', 'usarskill', 'usarhabilidade'],
    category: 'rpg',
    subcategory: 'Combate',
    description: 'Usa uma habilidade desbloqueada durante batalha',
    cooldownMs: 10000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const skillName = (args[0] || '').toLowerCase()
        // Lista de chaves (aceita os formatos antigos); conferência por item, não por pedaço de texto.
        const skills = pagas(user)

        if (!skillName || skillName === 'lista' || skillName === 'help') {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   ⚡ *USO DE HABILIDADES* ⚡   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `📊 *Skills Desbloqueadas:* ${skills.join(', ') || 'Nenhuma'}\n\n`

            if (skills.length === 0) {
                doc += '❌ Você não possui nenhuma skill desbloqueada!\n'
                doc += '💡 _Desbloqueie com_ \`.arvorehabilidades\`'
            } else {
                doc += '╭━〔 📋 SKILLS 〕━⬣\n'
                Object.entries(SKILL_EFFECTS).forEach(([key, s]) => {
                    const has = skills.includes(key)
                    if (has) {
                        doc += `┃ ${s.nome} (${key})\n`
                        doc += `┃ ${s.descricao}\n`
                        doc += `┃ ─────────────────\n`
                    }
                })
                doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
                doc += '💡 _Use_ \`.habilidade <nome>\` _durante uma batalha!_'
            }

            return reply(doc.trim(), [sender])
        }

        if (!skills.includes(skillName)) {
            return reply(`❌ Você não possui a skill *${skillName}* desbloqueada!\n💡 _Desbloqueie com_ \`.arvorehabilidades desbloquear ${skillName}\``)
        }

        if (!SKILL_EFFECTS[skillName]) {
            return reply('❌ Habilidade não encontrada. Use `.habilidade lista` para ver suas skills.')
        }

        const effect = SKILL_EFFECTS[skillName]
        const userHp = user.rpgHp || user.hp || 100

        if (effect.hpCost && userHp <= effect.hpCost) {
            return reply(`❌ HP insuficiente para usar ${effect.nome}!\n❤️ *Seu HP:* ${userHp} | *Custo:* ${effect.hpCost} HP`)
        }

        if (effect.hpCost) {
            user.rpgHp = userHp - effect.hpCost
            user.hp = user.rpgHp
        }

        if (effect.cura) {
            const maxHp = user.rpgHpMax || user.hpMax || 100
            user.rpgHp = Math.min(maxHp, userHp + effect.cura)
            user.hp = user.rpgHp
        }

        user.activeSkill = skillName
        user.activeSkillTurns = 1

        await dataService.saveXpData(xpData)
        logger.info(`[HABILIDADE] ${sender} ativou skill ${skillName}`)

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   ⚡ *HABILIDADE ATIVADA!* ⚡   ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        doc += `${effect.msg}\n\n`
        doc += `❤️ *HP Atual:* ${user.rpgHp || user.hp || 100}\n`
        if (effect.hpCost) doc += `💸 *HP Consumido:* -${effect.hpCost}\n`
        if (effect.cura) doc += `💚 *HP Recuperado:* +${effect.cura}\n`
        doc += `\n💡 _Efeito aplicado ao próximo ataque em batalha!_`

        return reply(doc.trim(), [sender])
    }
}
