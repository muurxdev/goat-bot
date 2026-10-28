const { pocoes, bosses, arenas, cartasArena, mundos, classes, classesLendarias, petsDisponiveis, equipamentos } = require('../utils/constants')
const { calcularDanoPlayer, calcularDanoSofrido } = require('./combatEngine')

function sortearRaridadeBoss() {
    const sorte = Math.random() * 100

    if (sorte < 1) {
        return {
            raridade: '🌟 SUPREMO',
            multiplicador: 5,
            vidaMult: 3
        }
    }

    if (sorte < 5) {
        return {
            raridade: '👑 MÍTICO',
            multiplicador: 3,
            vidaMult: 2
        }
    }

    if (sorte < 15) {
        return {
            raridade: '🟣 LENDÁRIO',
            multiplicador: 2,
            vidaMult: 1.5
        }
    }

    if (sorte < 40) {
        return {
            raridade: '🔵 RARO',
            multiplicador: 1.5,
            vidaMult: 1.2
        }
    }

    return {
        raridade: '⚪ COMUM',
        multiplicador: 1,
        vidaMult: 1
    }
}

function gerarBoss(tipoEscolhido = null) {
    const keys = Object.keys(bosses)
    const chave = tipoEscolhido && bosses[tipoEscolhido]
        ? tipoEscolhido
        : keys[Math.floor(Math.random() * keys.length)]

    const bossBase = bosses[chave]
    const raridade = sortearRaridadeBoss()
    const vidaFinal = Math.floor(bossBase.vidaBase * raridade.vidaMult)

    return {
        id: chave,
        nome: bossBase.nome,
        tipo: bossBase.tipo,
        raridade: raridade.raridade,
        vida: vidaFinal,
        vidaMax: vidaFinal,
        multiplicador: raridade.multiplicador,
        efeito: bossBase.efeito,
        loot: bossBase.loot,
        ativo: true,
        dano: {}
    }
}

function sortearLootBoss(boss) {
    if (!boss.loot || boss.loot.length === 0) return null
    const sorte = Math.random() * 100

    for (const item of boss.loot) {
        if (sorte < item.chance) {
            return item
        }
    }
    return null
}

function sortearLootMob(lista) {
    if (!lista || lista.length === 0) return null
    let chanceAcumulada = 0
    const sorte = Math.random() * 100

    for (const item of lista) {
        chanceAcumulada += item.chance
        if (sorte < chanceAcumulada) {
            return item.nome
        }
    }
    return null
}

function getPocaoAtiva(player) {
    if (!player || !player.pocaoAtiva) {
        return null
    }

    if (Date.now() >= player.pocaoAtiva.expira) {
        player.pocaoAtiva = null
        return null
    }

    return pocoes[player.pocaoAtiva.tipo] || null
}

function aplicarBonusDano(player, dano) {
    const pocao = getPocaoAtiva(player)
    if (!pocao || !pocao.dano) {
        return dano
    }
    return Math.floor(dano * (1 + pocao.dano))
}

function aplicarBonusXP(player, xp) {
    const pocao = getPocaoAtiva(player)
    if (!pocao || !pocao.xp) {
        return xp
    }
    return Math.floor(xp * (1 + pocao.xp))
}

function aplicarBonusCoins(player, coins) {
    const pocao = getPocaoAtiva(player)
    if (!pocao || !pocao.coins) {
        return coins
    }
    return Math.floor(coins * (1 + pocao.coins))
}

function atualizarArenaPlayer(player) {
    if (!player.arenaPontos) player.arenaPontos = 0

    const arenaEncontrada = Object.entries(arenas)
        .reverse()
        .find(([num, a]) => player.arenaPontos >= a.pontos)

    player.arenaAtual = arenaEncontrada ? Number(arenaEncontrada[0]) : 1
}

module.exports = {
    sortearRaridadeBoss,
    gerarBoss,
    sortearLootBoss,
    sortearLootMob,
    getPocaoAtiva,
    aplicarBonusDano,
    aplicarBonusXP,
    aplicarBonusCoins,
    atualizarArenaPlayer,
    calcularDanoPlayer,
    calcularDanoSofrido,
    pocoes,
    bosses,
    arenas,
    cartasArena,
    mundos,
    classes,
    classesLendarias,
    petsDisponiveis,
    equipamentos
}
