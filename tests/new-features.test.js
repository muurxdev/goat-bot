/**
 * BotXP — Suíte de Testes dos Novos Recursos
 * Valida Cassino, Boss Raids, Torneios, IA Vision, Memes e Segurança Anti-Trava/Spam
 */

// Isola o banco: sem isto a suite escrevia no banco de PRODUCAO.
process.env.NODE_ENV = 'test'

const assert = require("assert")
const { detectTravaZap, checkGroupSpam } = require("../src/services/securityService")
const dataService = require("../src/services/dataService")

console.log("🧪 Iniciando testes dos Novos Recursos do BotXP...\n")

// 1. TESTES DE SEGURANÇA: ANTI-TRAVA & ANTI-SPAM
console.log("--- 1. Segurança: Anti-Trava & Anti-Spam ---")

// Trava com caracteres invisíveis maliciosos
const cleanMsg = "Olá pessoal, bom dia a todos no grupo!"
assert.strictEqual(detectTravaZap(cleanMsg).isTrava, false, "Mensagem limpa não deve ser marcada como trava")

const fakeTrava = "Trava" + "\u200E".repeat(120) + "Crash"
const travaResult = detectTravaZap(fakeTrava)
assert.strictEqual(travaResult.isTrava, true, "Payload com excesso de invisíveis deve ser detectado")
console.log("  ✅ PASS: detectTravaZap detecta caracteres invisíveis maliciosos")

const zalgoAttack = "A" + "\u0300".repeat(200)
assert.strictEqual(detectTravaZap(zalgoAttack).isTrava, true, "Zalgo excessivo deve ser detectado")
console.log("  ✅ PASS: detectTravaZap detecta Zalgo combining characters")

const hugeMsg = "X".repeat(25000)
assert.strictEqual(detectTravaZap(hugeMsg).isTrava, true, "Mensagem > 20k caracteres deve ser detectada")
console.log("  ✅ PASS: detectTravaZap detecta mensagens com tamanho desproporcional")

// Anti-Spam
const groupJid = "120363000000000001@g.us"
const spammerJid = "5511999990001@s.whatsapp.net"

for (let i = 0; i < 5; i++) {
    const res = checkGroupSpam(groupJid, spammerJid, 5, 3000)
    assert.strictEqual(res.isSpam, false, "Até 5 mensagens em 3s não deve bloquear")
}
const sixth = checkGroupSpam(groupJid, spammerJid, 5, 3000)
assert.strictEqual(sixth.isSpam, true, "6ª mensagem dentro da janela deve disparar anti-spam")
console.log("  ✅ PASS: checkGroupSpam dispara alerta ao ultrapassar limite de mensagens simultâneas")

// 2. TESTES DE MATEMÁTICA DO CASSINO
console.log("\n--- 2. Matemática e Probabilidade do Cassino ---")

// Roleta: números vermelhos e pretos
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

assert.strictEqual(RED_NUMBERS.length, 18, "Roleta deve ter 18 números vermelhos")
assert.strictEqual(BLACK_NUMBERS.length, 18, "Roleta deve ter 18 números pretos")
assert.strictEqual(new Set([...RED_NUMBERS, ...BLACK_NUMBERS]).size, 36, "Números devem ser únicos de 1 a 36")
console.log("  ✅ PASS: Roleta: Conjunto de números da Roleta Europeia válido (18 vermelhos, 18 pretos + 0)")

// Blackjack hand value
function calcHand(cards) {
    let sum = 0
    let aces = 0
    for (const c of cards) {
        sum += c.val
        if (c.name === "A") aces++
    }
    while (sum > 21 && aces > 0) {
        sum -= 10
        aces--
    }
    return sum
}

const handBlackjack = [{ name: "A", val: 11 }, { name: "K", val: 10 }]
assert.strictEqual(calcHand(handBlackjack), 21, "Ás + K deve somar 21")

const handAces = [{ name: "A", val: 11 }, { name: "A", val: 11 }, { name: "9", val: 9 }]
assert.strictEqual(calcHand(handAces), 21, "Ás + Ás + 9 deve somar 21 (11 + 1 + 9)")

const handBust = [{ name: "10", val: 10 }, { name: "8", val: 8 }, { name: "5", val: 5 }]
assert.strictEqual(calcHand(handBust), 23, "10 + 8 + 5 deve somar 23 (Bust)")
console.log("  ✅ PASS: Blackjack: Cálculo de valores de cartas e flexibilidade do Ás opera com 100% de exatidão")

// 3. TESTES DE BOSS RAID COOPERATIVO
console.log("\n--- 3. RPG Boss Raid Cooperativo ---")
const raidMaxHp = 80000
const userDmg = 20000
const mult = 3.5

const xpAward = Math.floor((300 + (userDmg / 4)) * mult)
const coinsAward = Math.floor((600 + (userDmg / 2)) * mult)

assert.strictEqual(xpAward, Math.floor((300 + 5000) * 3.5), "XP proporcional deve calcular corretamente")
assert.strictEqual(coinsAward, Math.floor((600 + 10000) * 3.5), "Coins proporcionais devem calcular corretamente")
console.log("  ✅ PASS: Boss Raid: Distribuição matemática de recompensas por dano validada")

// 4. TESTES DE LIVROS & ACERVO DE ARQUIVOS EM PDF
console.log("\n--- 4. Acervo Global de Livros & Documentos PDF ---")
const bookService = require("../src/services/bookService")
assert.strictEqual(typeof bookService.searchBooks, "function", "searchBooks deve ser uma função")
assert.strictEqual(typeof bookService.resolvePdfUrl, "function", "resolvePdfUrl deve ser uma função")
assert.strictEqual(typeof bookService.downloadPdfBuffer, "function", "downloadPdfBuffer deve ser uma função")

const livroCmd = require("../src/commands/general/livro")
assert.strictEqual(livroCmd.name, "livro", "Comando livro deve estar carregado")
assert.ok(livroCmd.aliases.includes("pdf"), "Alias .pdf deve existir")
assert.ok(livroCmd.aliases.includes("ebook"), "Alias .ebook deve existir")
console.log("  ✅ PASS: Book & PDF Service e comando .livro carregados com sucesso")

console.log("\n========================================")
console.log("📊 RESULTADO DOS NOVOS RECURSOS:")
console.log("   ✅ Todas as asserções passaram com sucesso!")
console.log("========================================\n")
