process.env.NODE_ENV = 'test'

/**
 * Download de mídia tem UMA reação do começo ao fim: ⏳ → ✅ (2026-10-15).
 * Antes o `.spotify` abria com 🎬 (emoji de cinema, para um áudio) e um instante depois o aviso de
 * download trocava para ⏳: a mensagem do usuário piscava um emoji errado e outro.
 */

const assert = require('assert')
const dispatcher = require('../src/handlers/commandDispatcher')
dispatcher.loadCommands()
const { COMMAND_REACTIONS, CATEGORY_REACTIONS } = dispatcher.reacoesDeInicio

let ok = 0, falhou = 0
function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

/** O emoji com que o dispatcher abre o comando (mesma regra do dispatch). */
const emojiDeInicio = cmd => COMMAND_REACTIONS[cmd.name] || (cmd.category && CATEGORY_REACTIONS[cmd.category.toLowerCase()]) || '⚡'

console.log('\n🧪 Reação única nos downloads...\n')

teste('os comandos de download abrem com ⏳, nunca com 🎬/🎵/🔎', () => {
    for (const nome of ['play', 'spotify', 'soundcloud', 'ytmp3', 'ytmp4', 'tiktok', 'insta', 'twitter', 'kwai', 'reddit', 'pinterest', 'media', 'youtube']) {
        const cmd = dispatcher.findCommand(nome)
        if (!cmd) continue // comando que esta instalação não tem
        const e = emojiDeInicio(cmd)
        assert.strictEqual(e, '⏳', `.${nome} abre com ${e}`)
    }
    assert.ok(dispatcher.findCommand('spotify'), '.spotify sumiu do registro')
})

teste('nenhum comando da categoria "media" abre com emoji de cinema', () => {
    const maus = []
    for (const cmd of dispatcher.getCommands().values ? dispatcher.getCommands().values() : Object.values(dispatcher.getCommands())) {
        if (String(cmd.category || '').toLowerCase() === 'media' && ['🎬', '📹', '🎞️'].includes(emojiDeInicio(cmd))) maus.push(`${cmd.name}=${emojiDeInicio(cmd)}`)
    }
    // Os de editar/converter vídeo de propósito (tovideo, gif…) podem manter o emoji do que fazem.
    const permitidos = new Set(['tovideo', 'gif'])
    const reais = maus.filter(m => !permitidos.has(m.split('=')[0]))
    assert.deepStrictEqual(reais, [], `abrem com cinema: ${reais.join(', ')}`)
})

console.log(`\n📊 Reação única nos downloads: ✅ ${ok}  ❌ ${falhou}\n`)
process.exit(falhou > 0 ? 1 : 0)
