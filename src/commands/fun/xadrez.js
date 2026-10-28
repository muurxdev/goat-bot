/**
 * Comando .xadrez — Xadrez contra o bot, com REGRAS LEGAIS COMPLETAS.
 *
 * Usa a chess.js (MIT) para validação: xeque, xeque-mate, afogamento, roque,
 * en passant, promoção e repetição saem corretos — escrever isso à mão daria
 * um motor inteiro e cheio de bugs sutis.
 *
 * Você joga de brancas. Jogadas pelo chat, sem prefixo (interactionService),
 * em notação algébrica (`e4`, `Nf3`, `O-O`) ou origem-destino (`e2e4`).
 */

const interactionService = require('../../services/interactionService')
const logger = require('../../core/logger')

const jogos = new Map() // chatJid -> { game, dono }

const PECAS = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
}
const VALOR = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

function desenhar(game) {
    const b = game.board()
    let s = '```\n  a b c d e f g h\n'
    for (let r = 0; r < 8; r++) {
        const rank = 8 - r
        s += rank + ' '
        for (let c = 0; c < 8; c++) {
            const sq = b[r][c]
            s += (sq ? PECAS[sq.color][sq.type] : ((r + c) % 2 ? '·' : ' ')) + ' '
        }
        s += rank + '\n'
    }
    s += '  a b c d e f g h\n```'
    return s
}

function materialDe(game, cor) {
    let t = 0
    for (const linha of game.board()) {
        for (const sq of linha) if (sq && sq.color === cor) t += VALOR[sq.type] || 0
    }
    return t
}

/** Bot simples: prioriza mate, depois captura de maior valor, evita entregar peça. */
function escolherLanceBot(game) {
    const lances = game.moves({ verbose: true })
    if (!lances.length) return null

    let melhor = null, melhorNota = -Infinity
    for (const l of lances) {
        let nota = 0
        if (l.captured) nota += (VALOR[l.captured] || 0) * 10

        game.move(l)
        if (game.isCheckmate()) nota += 10000
        else if (game.isCheck()) nota += 5
        if (game.isStalemate() || game.isDraw()) nota -= 20 // não empatar à toa

        // Penaliza deixar a peça pendurada: se o humano puder capturá-la de volta.
        const respostas = game.moves({ verbose: true })
        let pior = 0
        for (const rr of respostas) {
            if (rr.to === l.to && rr.captured) pior = Math.max(pior, VALOR[rr.captured] || 0)
        }
        nota -= pior * 8
        game.undo()

        nota += Math.random() * 1.5
        if (nota > melhorNota) { melhorNota = nota; melhor = l }
    }
    return melhor
}

function situacao(game) {
    if (game.isCheckmate()) return game.turn() === 'w' ? '☠️ *XEQUE-MATE — você perdeu!*' : '🏆 *XEQUE-MATE — você venceu!*'
    if (game.isStalemate()) return '🤝 *Empate por afogamento (stalemate).*'
    if (game.isInsufficientMaterial()) return '🤝 *Empate por material insuficiente.*'
    if (game.isThreefoldRepetition()) return '🤝 *Empate por repetição.*'
    if (game.isDraw()) return '🤝 *Empate.*'
    if (game.isCheck()) return game.turn() === 'w' ? '⚠️ *Você está em xeque!*' : '⚠️ *Estou em xeque!*'
    return null
}

const acabou = game => game.isGameOver()

function estadoTexto(game, extra = '') {
    let doc = '♛ *Xadrez*\n\n'
    if (extra) doc += extra + '\n\n'
    doc += desenhar(game) + '\n'
    const sit = situacao(game)
    if (sit) doc += '\n' + sit + '\n'
    doc += `\n📊 *Material:* você ${materialDe(game, 'w')} · eu ${materialDe(game, 'b')}`
    doc += `\n🔢 *Lance:* ${game.moveNumber()}`
    if (!acabou(game)) doc += '\n\n👉 _Jogue no chat:_ `e4`, `Nf3`, `O-O` _ou_ `e2e4`\n🏳️ _Para desistir:_ `.xadrez sair`'
    else doc += '\n\n💡 _Digite_ `.xadrez novo` _para outra partida._'
    return doc.trim()
}

/** Tenta o lance do humano e responde com o do bot. Retorna texto ou null. */
function jogar(from, texto) {
    const registro = jogos.get(from)
    if (!registro) return null
    const { game } = registro

    const bruto = String(texto || '').trim()
    // Só reage ao que PARECE lance, para não engolir conversa do grupo.
    if (!/^(?:[a-h][1-8][a-h][1-8][qrbn]?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O(?:-O)?)$/.test(bruto)) return null

    let lance = null
    try {
        if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(bruto)) {
            lance = game.move({ from: bruto.slice(0, 2), to: bruto.slice(2, 4), promotion: bruto[4] || 'q' })
        } else {
            lance = game.move(bruto, { sloppy: true })
        }
    } catch (e) {
        lance = null // chess.js lança quando o lance é ilegal
    }
    if (!lance) return `❌ *Lance ilegal ou ambíguo:* \`${bruto}\`\n💡 _Tente_ \`e4\`_,_ \`Nf3\` _ou_ \`e2e4\`_._`

    if (acabou(game)) { jogos.delete(from); return estadoTexto(game, `✅ Você: *${lance.san}*`) }

    const lb = escolherLanceBot(game)
    if (!lb) { jogos.delete(from); return estadoTexto(game, `✅ Você: *${lance.san}*`) }
    const feito = game.move(lb)
    if (acabou(game)) jogos.delete(from)

    return estadoTexto(game, `✅ Você: *${lance.san}*\n🎲 Eu: *${feito.san}*`)
}

function iniciar(from, sender, reply) {
    const { Chess } = require('chess.js')
    const game = new Chess()
    jogos.set(from, { game, dono: sender })

    interactionService.register(from, {
        type: 'xadrez',
        ttlMs: 900000,
        onText: async (texto, c) => {
            const msg = jogar(from, texto)
            if (!msg) return false
            if (!jogos.has(from)) c.clear()
            await c.reply(msg)
            return true
        }
    })

    return reply(estadoTexto(game, '🎮 *Partida iniciada!* Você joga de *brancas* (♙).'))
}

module.exports = {
    name: 'xadrez',
    aliases: ['chess', 'jogoxadrez'],
    category: 'fun',
    subcategory: 'Jogos',
    description: 'Jogue xadrez completo contra mim: digite o lance no chat, como e4',
    usage: '[novo | tabuleiro | sair | lance]',
    examples: [' — começa uma partida ou mostra o tabuleiro', 'e4 — joga o peão para e4', 'sair — desiste da partida'],
    cooldownMs: 3000,
    execute: async ({ from, args, sender, reply }) => {
        const arg = String((args && args.join(' ')) || '').trim()
        const low = arg.toLowerCase()

        if (low === 'sair' || low === 'parar' || low === 'desistir') {
            if (!jogos.has(from)) return reply('♛ Não tem partida de xadrez aberta neste chat.\n\n👉 Comece uma com `.xadrez`')
            jogos.delete(from)
            interactionService.clear(from)
            return reply('🏳️ *Partida encerrada.* Digite `.xadrez` para começar outra.')
        }

        try {
            if (!jogos.has(from) || low === 'novo' || low === 'nova') return iniciar(from, sender, reply)

            if (low === 'tabuleiro' || low === 'board' || !arg) {
                return reply(estadoTexto(jogos.get(from).game, '♛ *Partida em andamento.*'))
            }

            const msg = jogar(from, arg)
            if (msg) {
                if (!jogos.has(from)) interactionService.clear(from)
                return reply(msg)
            }
            return reply(estadoTexto(jogos.get(from).game, '♛ *Partida em andamento.*'))
        } catch (err) {
            logger.error('[XADREZ ERROR]', err)
            return reply('♛ Me perdi no tabuleiro e não consegui fazer essa jogada. Tente de novo; se continuar, comece outra partida com `.xadrez novo`.')
        }
    }
}
