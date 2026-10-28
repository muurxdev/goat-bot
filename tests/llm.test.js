process.env.NODE_ENV = 'test'
/**
 * IA (services/llmService): o que dá para conferir sem chave de API.
 *
 *  - A resposta do modelo sai na formatação do WhatsApp: "**x**" e "## x"
 *    apareciam crus, com os símbolos, e a resposta parecia "bugada".
 *  - O modelo Gemini é escolhido entre os da conta: o "flash" estável mais novo,
 *    nunca preview, lite ou experimental.
 *  - Sem chave nenhuma, o bot não tenta chamar provedor.
 */
const assert = require('assert')
const L = require('../src/services/llmService')

let pass = 0, fail = 0
function test(nome, fn) {
    try { fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

console.log('🧪 Testes da IA...\n')

test('Markdown vira formatação do WhatsApp', () => {
    const t = L.paraWhatsApp('## Título\n\n**negrito** e __itálico__ e ~~riscado~~\n\n- um\n* dois\n+ três')
    assert.ok(t.startsWith('*Título*'), t)
    assert.ok(t.includes('*negrito* e _itálico_ e ~riscado~'), t)
    assert.ok(t.includes('• um\n• dois\n• três'), t)
    assert.ok(!/\*\*|##/.test(t), t)
})

test('link Markdown vira texto e endereço', () => {
    assert.strictEqual(L.paraWhatsApp('veja [o site](https://x.com/a)'), 'veja o site (https://x.com/a)')
})

test('bloco de código passa intacto', () => {
    const bloco = '```js\nconst **x** = 1\n- nao e lista\n```'
    assert.ok(L.paraWhatsApp(`antes **a**\n${bloco}`).includes(bloco))
})

test('texto que já está no formato do WhatsApp não muda', () => {
    const t = '*Resposta:* 42\n\n• item\n_obs_'
    assert.strictEqual(L.paraWhatsApp(t), t)
})

test('escolhe o flash estável mais novo, sem preview nem lite', () => {
    const nomes = ['models/gemini-2.0-flash', 'models/gemini-2.5-flash', 'models/gemini-2.5-flash-lite',
        'models/gemini-3.5-flash-preview', 'models/gemini-2.5-pro', 'models/gemini-3-flash', 'models/text-embedding-004']
    assert.strictEqual(L.escolherGemini(nomes), 'gemini-3-flash')
    assert.strictEqual(L.escolherGemini(['models/gemini-2.5-pro']), null)
})

test('sem chave nenhuma, não há provedor', () => {
    for (const k of ['GEMINI_API_KEY', 'GROQ_API_KEY', 'PERPLEXITY_API_KEY', 'CLOUDFLARE_API_TOKEN', 'OLLAMA_URL']) delete process.env[k]
    assert.strictEqual(L.hasProvider(), false)
})

console.log('\n========================================')
console.log(`📊 RESULTADO — IA: ${pass} passaram, ${fail} falharam`)
console.log('========================================\n')
process.exit(fail > 0 ? 1 : 0)
