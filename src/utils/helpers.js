const { PATENTES, RANKS, resolverEscala } = require('../config/lore')

const esperar = async (tempo) => new Promise(resolve => setTimeout(resolve, tempo))

function hojeId() {
    const hoje = new Date()
    return `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`
}

function semanaAtual() {
    const agora = new Date()
    const inicioAno = new Date(agora.getFullYear(), 0, 1)
    const dias = Math.floor((agora - inicioAno) / (24 * 60 * 60 * 1000))
    return Math.ceil((dias + inicioAno.getDay() + 1) / 7)
}

function barraXP(atual, level) {
    const max = Math.floor(100 * Math.pow(level, 1.5))
    const porcentagem = Math.min(100, Math.floor((atual / max) * 100))
    const blocos = 10
    const preenchido = Math.floor((porcentagem / 100) * blocos)

    let barra = ''
    for (let i = 0; i < blocos; i++) {
        barra += i < preenchido ? '🟩' : '⬛'
    }

    return `${barra} ${porcentagem}%`
}

// Patente do MUNDO DEV por nível de XP (progressão de carreira em tecnologia).
// NÃO confundir com "Cargo" (dono/admin do grupo) — isto é senioridade de XP.
/**
 * Patente do jogador, exibida em perfil e ranking.
 *
 * A escada vive em config/lore.js. Antes era uma carreira de tecnologia
 * ("Dev Junior", "Tech Lead", "CTO Lendário") — o usuário do bot não é
 * programador e não deveria ler isso.
 */
function getCargo(level) {
    return resolverEscala(PATENTES, level)
}

/** Escala de poder, usada onde o texto pede "rank" em vez de patente. */
function getRank(level) {
    return resolverEscala(RANKS, level)
}

function getRaridadeItem(itemNome) {
    if (itemNome.includes('💎') || itemNome.includes('🌟') || itemNome.includes('👑')) {
        return '🟡 LENDÁRIO'
    }
    if (itemNome.includes('🟣') || itemNome.includes('🌌') || itemNome.includes('⚫')) {
        return '🟣 ÉPICO'
    }
    if (itemNome.includes('🔵') || itemNome.includes('⚡') || itemNome.includes('🛡️')) {
        return '🔵 RARO'
    }
    if (itemNome.includes('🟢') || itemNome.includes('🪲') || itemNome.includes('🌿')) {
        return '🟢 INCOMUM'
    }
    return '⚪ COMUM'
}

module.exports = {
    esperar,
    hojeId,
    semanaAtual,
    barraXP,
    getCargo,
    getRank,
    getRaridadeItem
}

