/**
 * Comando .damas — Jogo de Damas (8x8) contra o bot.
 *
 * Regras implementadas (damas brasileiras simplificadas):
 *  - Peão anda 1 casa na diagonal para frente; captura pulando (frente E trás).
 *  - Captura é OBRIGATÓRIA; se houver captura disponível, só ela é legal.
 *  - Captura em cadeia: se a peça que capturou puder capturar de novo, continua.
 *  - Ao chegar na última linha o peão vira DAMA (anda/captura à distância).
 *
 * Jogadas pelo chat, sem prefixo (via interactionService): `c3 d4`.
 */

const interactionService = require('../../services/interactionService')

const jogos = new Map() // chatJid -> estado

const VAZIO = null
const ehBranca = p => p === 'w' || p === 'W'
const ehPreta = p => p === 'b' || p === 'B'
const ehDama = p => p === 'W' || p === 'B'
const doLado = (p, lado) => (lado === 'w' ? ehBranca(p) : ehPreta(p))
const dentro = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8

function novoTabuleiro() {
    const t = Array.from({ length: 8 }, () => Array(8).fill(VAZIO))
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 !== 1) continue
            if (r < 3) t[r][c] = 'b'
            else if (r > 4) t[r][c] = 'w'
        }
    }
    return t
}

const SIMB = { w: '⚪', W: '🔵', b: '⚫', B: '🔴' }

function desenhar(t) {
    let s = '```\n  a b c d e f g h\n'
    for (let r = 0; r < 8; r++) {
        const rank = 8 - r
        s += rank + ' '
        for (let c = 0; c < 8; c++) {
            const p = t[r][c]
            if (p) s += SIMB[p] === '⚪' ? 'o ' : SIMB[p] === '🔵' ? 'O ' : SIMB[p] === '⚫' ? 'x ' : 'X '
            else s += (r + c) % 2 === 1 ? '. ' : '  '
        }
        s += rank + '\n'
    }
    s += '  a b c d e f g h\n```'
    s += '\n⚪ `o` suas peças · 🔵 `O` sua dama · ⚫ `x` minhas peças · 🔴 `X` minha dama'
    return s
}

function parseCasa(txt) {
    const m = String(txt || '').trim().toLowerCase().match(/^([a-h])([1-8])$/)
    if (!m) return null
    return [8 - Number(m[2]), m[1].charCodeAt(0) - 97] // [linha, coluna]
}
const nomeCasa = (r, c) => String.fromCharCode(97 + c) + (8 - r)

/** Capturas possíveis de UMA peça. */
function capturasDe(t, r, c) {
    const p = t[r][c]
    if (!p) return []
    const lado = ehBranca(p) ? 'w' : 'b'
    const res = []
    const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

    for (const [dr, dc] of dirs) {
        if (ehDama(p)) {
            // Dama: percorre a diagonal até achar UMA inimiga com casa vazia depois.
            let i = 1
            while (dentro(r + dr * i, c + dc * i) && t[r + dr * i][c + dc * i] === VAZIO) i++
            const ar = r + dr * i, ac = c + dc * i
            if (!dentro(ar, ac)) continue
            const alvo = t[ar][ac]
            if (!alvo || doLado(alvo, lado)) continue
            let j = 1
            while (dentro(ar + dr * j, ac + dc * j) && t[ar + dr * j][ac + dc * j] === VAZIO) {
                res.push({ de: [r, c], para: [ar + dr * j, ac + dc * j], come: [ar, ac] })
                j++
            }
        } else {
            const ar = r + dr, ac = c + dc
            const pr = r + dr * 2, pc = c + dc * 2
            if (!dentro(pr, pc)) continue
            const alvo = t[ar][ac]
            if (!alvo || doLado(alvo, lado)) continue
            if (t[pr][pc] !== VAZIO) continue
            res.push({ de: [r, c], para: [pr, pc], come: [ar, ac] })
        }
    }
    return res
}

/** Movimentos simples (sem captura) de UMA peça. */
function simplesDe(t, r, c) {
    const p = t[r][c]
    if (!p) return []
    const res = []
    if (ehDama(p)) {
        for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
            let i = 1
            while (dentro(r + dr * i, c + dc * i) && t[r + dr * i][c + dc * i] === VAZIO) {
                res.push({ de: [r, c], para: [r + dr * i, c + dc * i], come: null })
                i++
            }
        }
    } else {
        const dr = ehBranca(p) ? -1 : 1
        for (const dc of [-1, 1]) {
            const nr = r + dr, nc = c + dc
            if (dentro(nr, nc) && t[nr][nc] === VAZIO) res.push({ de: [r, c], para: [nr, nc], come: null })
        }
    }
    return res
}

/** Todos os lances legais do lado (captura é obrigatória). */
function lancesLegais(t, lado, obrigarDe = null) {
    const caps = [], simples = []
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = t[r][c]
            if (!p || !doLado(p, lado)) continue
            if (obrigarDe && (obrigarDe[0] !== r || obrigarDe[1] !== c)) continue
            caps.push(...capturasDe(t, r, c))
            simples.push(...simplesDe(t, r, c))
        }
    }
    if (caps.length) return caps
    return obrigarDe ? [] : simples
}

/** Aplica o lance; devolve se deve promover e se pode encadear captura. */
function aplicar(t, lance) {
    const [fr, fc] = lance.de, [tr, tc] = lance.para
    const p = t[fr][fc]
    t[fr][fc] = VAZIO
    if (lance.come) t[lance.come[0]][lance.come[1]] = VAZIO
    t[tr][tc] = p

    let promoveu = false
    if (p === 'w' && tr === 0) { t[tr][tc] = 'W'; promoveu = true }
    if (p === 'b' && tr === 7) { t[tr][tc] = 'B'; promoveu = true }

    // Encadeia só se capturou, não promoveu agora e ainda há captura da mesma peça.
    const encadeia = Boolean(lance.come) && !promoveu && capturasDe(t, tr, tc).length > 0
    return { promoveu, encadeia }
}

function contar(t) {
    let w = 0, b = 0
    for (const linha of t) for (const p of linha) { if (ehBranca(p)) w++; else if (ehPreta(p)) b++ }
    return { w, b }
}

/** Bot: prioriza capturas (a que come mais), senão avança/promove. */
function escolherLanceBot(t, obrigarDe = null) {
    const lances = lancesLegais(t, 'b', obrigarDe)
    if (!lances.length) return null
    const comCaptura = lances.filter(l => l.come)
    const pool = comCaptura.length ? comCaptura : lances
    let melhor = pool[0], melhorNota = -Infinity
    for (const l of pool) {
        let nota = l.come ? 10 : 0
        nota += l.para[0] * 0.5              // avançar rumo à promoção
        if (t[l.de[0]][l.de[1]] === 'b' && l.para[0] === 7) nota += 5
        nota += Math.random()
        if (nota > melhorNota) { melhorNota = nota; melhor = l }
    }
    return melhor
}

function estadoTexto(jogo, extra = '') {
    const { w, b } = contar(jogo.t)
    let doc = '♟️ *Jogo de damas*\n\n'
    if (extra) doc += extra + '\n\n'
    doc += desenhar(jogo.t) + '\n\n'
    doc += `📊 *Peças:* você ${w} · eu ${b}\n`
    if (jogo.obrigarDe) doc += `🔗 *Captura em cadeia!* Continue movendo de *${nomeCasa(...jogo.obrigarDe)}*.\n`
    else {
        const temCaptura = lancesLegais(jogo.t, 'w').some(l => l.come)
        if (temCaptura) doc += '⚠️ *Você tem captura disponível — é obrigatória.*\n'
    }
    doc += '\n👉 _Jogue digitando no chat a casa de origem e a de destino, como_ `c3 d4`\n🏳️ _Para desistir:_ `.damas sair`'
    return doc.trim()
}

function fimDeJogo(jogo) {
    const { w, b } = contar(jogo.t)
    if (w === 0) return 'bot'
    if (b === 0) return 'voce'
    if (!lancesLegais(jogo.t, 'w').length) return 'bot'
    return null
}

/** Processa a jogada do humano + resposta do bot. Retorna texto ou null. */
function jogar(from, texto) {
    const jogo = jogos.get(from)
    if (!jogo) return null

    const m = String(texto || '').trim().toLowerCase().match(/^([a-h][1-8])\s*[-, ]\s*([a-h][1-8])$/)
    if (!m) return null

    const de = parseCasa(m[1]), para = parseCasa(m[2])
    if (!de || !para) return null

    const legais = lancesLegais(jogo.t, 'w', jogo.obrigarDe)
    const lance = legais.find(l => l.de[0] === de[0] && l.de[1] === de[1] && l.para[0] === para[0] && l.para[1] === para[1])
    if (!lance) {
        const temCaptura = legais.some(l => l.come)
        return `❌ *Essa jogada não vale:* \`${m[1]} ${m[2]}\`\n💡 _Peças andam na diagonal, uma casa para a frente (ou pulando uma peça minha para capturar)._` +
            (temCaptura ? '\n⚠️ Você tem uma *captura obrigatória* disponível.' : '') +
            (jogo.obrigarDe ? `\n🔗 Continue a cadeia a partir de *${nomeCasa(...jogo.obrigarDe)}*.` : '')
    }

    const r1 = aplicar(jogo.t, lance)
    if (r1.encadeia) {
        jogo.obrigarDe = lance.para
        return estadoTexto(jogo, `✅ Capturou! *${m[1]} → ${m[2]}*`)
    }
    jogo.obrigarDe = null

    let fim = fimDeJogo(jogo)
    if (fim) { jogos.delete(from); return estadoTexto(jogo, fim === 'voce' ? '🏆 *VOCÊ VENCEU!*' : '☠️ *VOCÊ PERDEU!*') }

    // Vez do bot (com cadeia).
    const passos = []
    let obrig = null, guarda = 0
    while (guarda++ < 12) {
        const lb = escolherLanceBot(jogo.t, obrig)
        if (!lb) break
        passos.push(`${nomeCasa(...lb.de)}→${nomeCasa(...lb.para)}`)
        const rb = aplicar(jogo.t, lb)
        if (rb.encadeia) { obrig = lb.para; continue }
        break
    }

    if (!passos.length) { jogos.delete(from); return estadoTexto(jogo, '🏆 *Você venceu!* Fiquei sem jogadas.') }

    fim = fimDeJogo(jogo)
    if (fim) { jogos.delete(from); return estadoTexto(jogo, fim === 'voce' ? '🏆 *VOCÊ VENCEU!*' : '☠️ *VOCÊ PERDEU!*') }

    return estadoTexto(jogo, `✅ Você: *${m[1]} → ${m[2]}*\n🎲 Eu: *${passos.join(' , ')}*`)
}

function iniciar(from, sender, reply) {
    const jogo = { t: novoTabuleiro(), dono: sender, obrigarDe: null }
    jogos.set(from, jogo)

    interactionService.register(from, {
        type: 'damas',
        ttlMs: 600000,
        onText: async (texto, c) => {
            const msg = jogar(from, texto)
            if (!msg) return false
            if (!jogos.has(from)) c.clear()
            await c.reply(msg)
            return true
        }
    })

    return reply(estadoTexto(jogo, '🎮 *Partida iniciada!* Você é ⚪ (`o`) e joga primeiro.'))
}

module.exports = {
    name: 'damas',
    aliases: ['checkers', 'jogodamas'],
    category: 'fun',
    subcategory: 'Jogos',
    description: 'Jogue damas contra mim: digite a jogada no chat, como c3 d4',
    usage: '[novo | sair | jogada]',
    examples: [' — começa uma partida ou mostra o tabuleiro', 'c3 d4 — move a peça de c3 para d4', 'sair — desiste da partida'],
    cooldownMs: 3000,
    execute: async ({ from, args, sender, reply }) => {
        const arg = String((args && args.join(' ')) || '').trim().toLowerCase()

        if (arg === 'sair' || arg === 'parar' || arg === 'desistir') {
            if (!jogos.has(from)) return reply('♟️ Não tem partida de damas aberta neste chat.\n\n👉 Comece uma com `.damas`')
            jogos.delete(from)
            interactionService.clear(from)
            return reply('🏳️ *Partida encerrada.* Digite `.damas` para começar outra.')
        }

        if (!jogos.has(from) || arg === 'novo' || arg === 'nova') {
            return iniciar(from, sender, reply)
        }

        // Permite jogar com prefixo também: .damas c3 d4
        const msg = jogar(from, arg)
        if (msg) {
            if (!jogos.has(from)) interactionService.clear(from)
            return reply(msg)
        }
        return reply(estadoTexto(jogos.get(from), '♟️ *Partida em andamento.*'))
    }
}
