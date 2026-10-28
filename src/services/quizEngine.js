/**
 * Motor de quiz reutilizável (resposta livre via interactionService + prêmio).
 * Usado pelos comandos de quiz temático (quizgeografia, quizciencia, etc.).
 */
const dataService = require('./dataService')
const { initializeUser, adicionarXp } = require('./xpService')
const interactionService = require('./interactionService')

const norm = (s) => (s || '').toUpperCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')

function questionDoc(titulo, item) {
    // Título que já começa com emoji (ex.: "🎬 Quiz de cinema") não ganha o 🧠 também.
    const jaTemEmoji = /^\p{Extended_Pictographic}/u.test(String(titulo || '').trim())
    const cabeca = jaTemEmoji ? `*${titulo}*` : `🧠 *${titulo}* 🧠`
    let doc = `╔══════════════════════════════╗\n║   ${cabeca}   ║\n╚══════════════════════════════╝\n\n`
    doc += `❓ ${item.q}\n\n`
    if (item.opts) {
        doc += `╭━〔 📋 OPÇÕES 〕━⬣\n`
        item.opts.forEach((o, i) => { doc += `┃ ${i + 1}. ${o}\n` })
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
    }
    doc += `👉 _Responda no chat (número ou texto)._`
    return doc.trim()
}

function evaluate(input, item) {
    const val = norm(input)
    if (!val) return { attempt: false, correct: false }
    const answer = norm(item.a)
    if (item.opts) {
        const opts = item.opts.map(norm)
        const asNum = parseInt(val, 10)
        if (!isNaN(asNum) && asNum >= 1 && asNum <= item.opts.length) return { attempt: true, correct: opts[asNum - 1] === answer }
        if (val === answer) return { attempt: true, correct: true }
        if (opts.includes(val)) return { attempt: true, correct: opts[opts.indexOf(val)] === answer }
        return { attempt: false, correct: false }
    }
    // sem opções: acerto por conter a resposta
    if (val === answer || (answer.length >= 3 && val.includes(answer))) return { attempt: true, correct: true }
    return { attempt: false, correct: false }
}

/** Inicia um quiz para um chat com um banco de perguntas. */
function startQuiz(from, sender, reply, bank, titulo, premio = { xp: 200, coins: 150 }) {
    const item = bank[Math.floor(Math.random() * bank.length)]
    interactionService.register(from, {
        type: 'quiz', ttlMs: 120000,
        onText: async (text, c) => {
            const { attempt, correct } = evaluate(text, item)
            if (!attempt) return false
            if (correct) {
                c.clear()
                // xpData vazio: initializeUser busca só esta pessoa (getUser pontual)
                // em vez de carregar a tabela inteira a cada acerto.
                const u = initializeUser(c.userJid || sender, {})
                const { xpGanho, lvlRes } = adicionarXp(u, premio.xp, { source: 'rpg' })
                u.coins = (u.coins || 0) + premio.coins
                dataService.saveUser(u)
                const nivel = lvlRes && lvlRes.subiu ? `\n🆙 Subiu de nível: agora você está no *nível ${u.level}*!` : ''
                await c.reply(`🎉 *CORRETO!* Resposta: *${item.a}*\n⭐ +${xpGanho} XP e +${premio.coins} moedas!${nivel}`)
            } else {
                await c.reply(`❌ *Errado!* Tente outra opção.`)
            }
            return true
        }
    })
    return reply(questionDoc(titulo, item))
}

module.exports = { startQuiz, questionDoc }
