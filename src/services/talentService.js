/**
 * talentService.js
 * Árvores de Talentos e Habilidades Especiais por Classe de Combate.
 * Guerreiro Berserker, Mago Arcano, Paladino Sagrado, Assassino Sombrio e Arqueiro Elemental.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

const TALENT_TREES = {
    'guerreiro': {
        name: 'Guerreiro Berserker',
        desc: 'Foco em força bruta incontrolável, aumento de dano físico e roubo de vida.',
        skills: {
            'golpe_pesado': { name: 'Golpe Demolidor', max: 5, desc: '+15% de Dano Físico por ponto', stat: 'atkBonus', valPerPt: 0.15 },
            'furia_sangrenta': { name: 'Fúria Sangrenta', max: 5, desc: '+5% de Chance Crítica por ponto', stat: 'critChance', valPerPt: 0.05 },
            'pele_aco': { name: 'Pele de Aço', max: 5, desc: '+12% de Redução de Dano recebido', stat: 'dmgReduction', valPerPt: 0.12 },
            'sede_sangue': { name: 'Sede de Sangue', max: 5, desc: '+8% de Cura por ataque (Lifesteal)', stat: 'lifesteal', valPerPt: 0.08 },
            'berserk_supremo': { name: 'Ira do Titã', max: 1, desc: 'Dano dobra quando o HP está abaixo de 30%', stat: 'berserkUltimate', valPerPt: 1.0 }
        }
    },
    'mago': {
        name: 'Mago Arcano',
        desc: 'Domínio das artes arcanas, feitiços de área catastróficos e escudos de mana.',
        skills: {
            'raio_arcano': { name: 'Canalização Arcana', max: 5, desc: '+18% de Dano Mágico por ponto', stat: 'magicAtk', valPerPt: 0.18 },
            'escudo_mana': { name: 'Barreira Espiritual', max: 5, desc: 'Absorve até +200 de dano por ponto', stat: 'shieldHp', valPerPt: 200 },
            'meteoro': { name: 'Chuva de Meteoros', max: 5, desc: '+10% de Chance de Dano em Área Duplo', stat: 'aoeChance', valPerPt: 0.10 },
            'mente_brilhante': { name: 'Amplificação Mística', max: 5, desc: '+8% de Crítico Mágico', stat: 'magicCrit', valPerPt: 0.08 },
            'supernova': { name: 'Cataclismo Arcano', max: 1, desc: 'Explosão lendária ignora 50% da armadura do inimigo', stat: 'pierceArmour', valPerPt: 0.50 }
        }
    },
    'paladino': {
        name: 'Paladino Sagrado',
        desc: 'Guardião divino com regeneração constante, defesa inabalável e julgamento justo.',
        skills: {
            'aura_sagrada': { name: 'Aura da Luz Divina', max: 5, desc: '+100 de HP Máximo por ponto', stat: 'bonusHp', valPerPt: 100 },
            'martelo_justica': { name: 'Martelo da Justiça', max: 5, desc: '+12% de Dano Sagrado por ponto', stat: 'holyAtk', valPerPt: 0.12 },
            'escudo_fe': { name: 'Fortaleza Inabalável', max: 5, desc: '+15% de Defesa Total', stat: 'defenseBonus', valPerPt: 0.15 },
            'bencao_vida': { name: 'Regeneração Celestial', max: 5, desc: 'Regenera 50 HP por turno em combate', stat: 'regenPerTurn', valPerPt: 50 },
            'intervencao_divina': { name: 'Milagre Supremo', max: 1, desc: 'Revive uma vez por combate com 50% de HP', stat: 'autoRevive', valPerPt: 1.0 }
        }
    },
    'assassino': {
        name: 'Assassino Sombrio',
        desc: 'Mestre da furtividade, ataques letais pelas costas e venenos corrosivos.',
        skills: {
            'ataque_furtivo': { name: 'Ataque Furtivo', max: 5, desc: '+25% de Dano Crítico por ponto', stat: 'critDmg', valPerPt: 0.25 },
            'lamina_venenosa': { name: 'Toxina Mortal', max: 5, desc: 'Aplica envenenamento causando dano por 3 turnos', stat: 'poisonDmg', valPerPt: 80 },
            'passo_sombra': { name: 'Esquiva Sombria', max: 5, desc: '+6% de Chance de Esquivar totalmente de ataques', stat: 'dodgeChance', valPerPt: 0.06 },
            'golpe_letal': { name: 'Ponto Fraco', max: 5, desc: '+5% de Chance de Execução instantânea em alvos fracos', stat: 'executeChance', valPerPt: 0.05 },
            'danca_sombras': { name: 'Manto do Assassino', max: 1, desc: 'Primeiro golpe do combate tem 100% de crítico garantido', stat: 'firstStrikeCrit', valPerPt: 1.0 }
        }
    },
    'arqueiro': {
        name: 'Arqueiro Elemental',
        desc: 'Precisão milimétrica à distância, disparos em rajada e flechas de vento.',
        skills: {
            'olho_aguia': { name: 'Precisão Absoluta', max: 5, desc: '+15% de Dano à Distância por ponto', stat: 'rangedAtk', valPerPt: 0.15 },
            'chuva_flechas': { name: 'Rajada Elemental', max: 5, desc: '+8% de Chance de Disparo Duplo por turno', stat: 'doubleShotChance', valPerPt: 0.08 },
            'flecha_gelo': { name: 'Disparo Congelante', max: 5, desc: 'Reduz a velocidade e ataque do inimigo em 15%', stat: 'slowDebuff', valPerPt: 0.15 },
            'camuflagem': { name: 'Instinto Selvagem', max: 5, desc: '+10% de Resistência e Esquiva no mato', stat: 'evasionBonus', valPerPt: 0.10 },
            'flecha_tempestade': { name: 'Vórtice do Vento', max: 1, desc: 'Disparo perfura todos os inimigos e atordoa o chefe', stat: 'stunChance', valPerPt: 0.35 }
        }
    }
}

function getTalents(jid) {
    const db = getDatabase()
    let row = db.prepare('SELECT * FROM user_talents WHERE jid = ?').get(jid)
    if (!row) {
        db.prepare(`
            INSERT INTO user_talents (jid, talent_points, tree_type, skills_allocated, resets_used, updated_at)
            VALUES (?, 5, 'guerreiro', '{}', 0, ?)
        `).run(jid, Date.now())
        row = db.prepare('SELECT * FROM user_talents WHERE jid = ?').get(jid)
    }
    return {
        ...row,
        skillsAllocated: JSON.parse(row.skills_allocated || '{}')
    }
}

function setTree(jid, treeType) {
    treeType = String(treeType).toLowerCase().trim()
    if (!TALENT_TREES[treeType]) {
        return {
            success: false,
            message: `Classe desconhecida. Árvores disponíveis: *${Object.keys(TALENT_TREES).join(', ')}*`
        }
    }

    const t = getTalents(jid)
    const db = getDatabase()
    db.prepare('UPDATE user_talents SET tree_type = ?, updated_at = ? WHERE jid = ?')
        .run(treeType, Date.now(), jid)

    return {
        success: true,
        treeType,
        treeName: TALENT_TREES[treeType].name
    }
}

function allocatePoint(jid, skillId) {
    skillId = String(skillId).toLowerCase().trim()
    const t = getTalents(jid)
    const tree = TALENT_TREES[t.tree_type]

    if (!tree.skills[skillId]) {
        return {
            success: false,
            message: `Habilidade *${skillId}* não existe na sua árvore de *${tree.name}*. Digite \`.talentos\` para consultar as habilidades.`
        }
    }

    if (t.talent_points <= 0) {
        return {
            success: false,
            message: 'Você não tem pontos de talento disponíveis! Ganhe pontos subindo de nível no RPG.'
        }
    }

    const currentLvl = t.skillsAllocated[skillId] || 0
    const skillDef = tree.skills[skillId]

    if (currentLvl >= skillDef.max) {
        return {
            success: false,
            message: `A habilidade *${skillDef.name}* já está no nível máximo (${skillDef.max}/${skillDef.max})!`
        }
    }

    t.skillsAllocated[skillId] = currentLvl + 1
    const newPoints = t.talent_points - 1

    const db = getDatabase()
    db.prepare('UPDATE user_talents SET talent_points = ?, skills_allocated = ?, updated_at = ? WHERE jid = ?')
        .run(newPoints, JSON.stringify(t.skillsAllocated), Date.now(), jid)

    return {
        success: true,
        skillName: skillDef.name,
        newLevel: t.skillsAllocated[skillId],
        maxLevel: skillDef.max,
        remainingPoints: newPoints
    }
}

function resetTalents(jid) {
    const t = getTalents(jid)
    let totalInvested = 0
    for (const pts of Object.values(t.skillsAllocated)) {
        totalInvested += pts
    }

    if (totalInvested === 0) {
        return { success: false, message: 'Você ainda não alocou nenhum ponto de talento.' }
    }

    // Primeiro reset gratuito, depois custa 5.000 moedas
    const cost = t.resets_used > 0 ? 5000 : 0
    if (cost > 0) {
        const user = economyService.carregarUsuario(jid)
        if ((user.coins || 0) < cost) {
            return {
                success: false,
                message: `Custo para redefinir a árvore de talentos: *${cost.toLocaleString('pt-BR')} moedas*. Saldo insuficiente.`
            }
        }
        user.coins = (user.coins || 0) - cost
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)
    }

    const refundedPoints = t.talent_points + totalInvested
    const db = getDatabase()
    db.prepare('UPDATE user_talents SET talent_points = ?, skills_allocated = \'{}\', resets_used = resets_used + 1, updated_at = ? WHERE jid = ?')
        .run(refundedPoints, Date.now(), jid)

    return {
        success: true,
        refundedPoints,
        cost
    }
}

function getCombatModifiers(jid) {
    const t = getTalents(jid)
    const tree = TALENT_TREES[t.tree_type]
    const mods = {
        atkBonus: 0,
        critChance: 0,
        dmgReduction: 0,
        lifesteal: 0,
        magicAtk: 0,
        shieldHp: 0,
        bonusHp: 0,
        critDmg: 0,
        dodgeChance: 0,
        rangedAtk: 0
    }

    if (!tree) return mods

    for (const [sId, lvl] of Object.entries(t.skillsAllocated)) {
        const skill = tree.skills[sId]
        if (skill && lvl > 0) {
            if (mods[skill.stat] !== undefined) {
                mods[skill.stat] += skill.valPerPt * lvl
            }
        }
    }

    return mods
}

module.exports = {
    TALENT_TREES,
    getTalents,
    setTree,
    allocatePoint,
    resetTalents,
    getCombatModifiers
}
