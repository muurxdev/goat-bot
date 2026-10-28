/**
 * Comando .termo (estilo Wordle) com RESPOSTA LIVRE: basta enviar uma palavra de
 * 5 letras no chat (sem `.termo <palavra>`), via interactionService.
 */

const interactionService = require('../../services/interactionService')

const PALAVRAS = [
    'AMIGO', 'BRUXO', 'DADOS', 'FELIZ', 'HONRA',
    'ILHAS', 'JOGOS', 'LEITE', 'MUSGO', 'NOBRE',
    'OLHOS', 'PRAIA', 'QUASE', 'RUBRO', 'SALTO',
    'TELAS', 'UNIDA', 'VELHO', 'ZEBRA', 'BOMBA',
    'CORPO', 'GATOS', 'MESAS', 'FLORE', 'PODER'
]

const activeGames = new Map()
const TTL_MS = 5 * 60 * 1000

const norm = (s) => (s || '').toUpperCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')

function history(game) {
    return game.attempts.map((a, i) => `${i + 1}. \`${a.chute}\` ${a.feedback}`).join('\n')
}

/** Processa um palpite de 5 letras. Retorna { consumed, msg }. */
function processGuess(key, chuteRaw) {
    const game = activeGames.get(key)
    if (!game) return { consumed: false, msg: null }
    const chute = norm(chuteRaw)
    if (chute.length !== 5 || !/^[A-Z]+$/.test(chute)) return { consumed: false, msg: null }

    let feedback = ''
    for (let i = 0; i < 5; i++) {
        if (chute[i] === game.secret[i]) feedback += '🟩'
        else if (game.secret.includes(chute[i])) feedback += '🟨'
        else feedback += '⬛'
    }
    game.attempts.push({ chute, feedback })

    if (chute === game.secret) {
        activeGames.delete(key)
        return { consumed: true, msg: `🎉 *ACERTOU!*\n\n👑 *Palavra:* \`${game.secret}\`\n📊 ${game.attempts.length}/${game.maxAttempts}\n\n${history(game)}` }
    }
    if (game.attempts.length >= game.maxAttempts) {
        const revelada = game.secret
        activeGames.delete(key)
        return { consumed: true, msg: `❌ *FIM DE JOGO!*\n📖 A palavra era: \`${revelada}\`\n\n${history(game)}` }
    }
    return { consumed: true, msg: `🧩 *TERMO — TENTATIVA ${game.attempts.length}/6*\n\n${history(game)}\n\n👉 Envie outra palavra de 5 letras.` }
}

module.exports = {
    name: 'termo',
    aliases: ['wordle', 'jogotermo', 'adivinharpalavra'],
    category: 'fun',
    subcategory: 'Jogos',
    description: 'Jogo estilo Wordle — adivinhe a palavra de 5 letras (responda no chat)',
    cooldownMs: 2000,
    execute: async ({ from, sender, reply, args }) => {
        const key = `${from}_${sender}`
        const chute = norm((args[0] || ''))

        if (!activeGames.has(key)) {
            const secret = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)]
            activeGames.set(key, { secret, attempts: [], maxAttempts: 6, createdAt: Date.now() })
            // interação por chat: aceita palpite de 5 letras de qualquer um do chat
            interactionService.register(from, {
                type: 'termo',
                ttlMs: TTL_MS,
                onText: async (text, c) => {
                    const { consumed, msg } = processGuess(key, text)
                    if (!consumed) return false
                    if (!activeGames.has(key)) c.clear()
                    await c.reply(msg)
                    return true
                }
            })
            return reply(
                `🟩 *TERMO — JOGO INICIADO*\n\n` +
                `🔒 A palavra secreta tem *5 letras*, você tem *6 tentativas*.\n\n` +
                `🟩 = certa/lugar certo · 🟨 = existe/lugar errado · ⬛ = não existe\n\n` +
                `👉 _Responda no chat com uma palavra de 5 letras._`
            )
        }

        if (chute) {
            const { consumed, msg } = processGuess(key, chute)
            if (consumed) {
                if (!activeGames.has(key)) interactionService.clear(from)
                return reply(msg)
            }
        }
        return reply(`❌ Seu palpite deve ter exatamente *5 letras*! (ex.: \`AMIGO\`)`)
    }
}
