/**
 * Áudios de evento (services/audioEventoService).
 *
 * O que precisa continuar verdadeiro:
 *  - Vêm DESLIGADOS: grupo que não ligou nunca recebe áudio.
 *  - Um áudio por minuto em cada grupo, mesmo com eventos diferentes.
 *  - Limpar preserva a frase padrão do bot.
 *  - Falha de envio nunca lança.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')

const PASTA = fs.mkdtempSync(path.join(os.tmpdir(), 'audios-evento-'))
process.env.AUDIOS_EVENTO_DIR = PASTA

const dataService = require('../src/services/dataService')
let configs = {}
dataService.getConfigsData = () => configs
dataService.saveConfigsData = async c => { configs = c }

const servico = require('../src/services/audioEventoService')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

const GRUPO = '120363000000000011@g.us'

function clienteFalso({ falha = false } = {}) {
    const enviadas = []
    return {
        enviadas,
        sendMessage: async (jid, conteudo) => {
            if (falha) throw new Error('rede caiu')
            enviadas.push({ jid, conteudo })
        }
    }
}

;(async () => {
    console.log('🧪 Testes de áudios de evento...\n')

    fs.mkdirSync(path.join(PASTA, 'banimento'), { recursive: true })
    fs.writeFileSync(path.join(PASTA, 'banimento', 'padrao.mp3'), Buffer.from('audio-padrao'))

    await test('grupo que não ligou não recebe áudio', async () => {
        configs = {}
        const c = clienteFalso()
        assert.strictEqual(await servico.enviar(c, GRUPO, 'banimento'), false)
        assert.strictEqual(c.enviadas.length, 0)
    })

    await test('com o grupo ligado, envia como nota de voz', async () => {
        configs = { [GRUPO]: { audiosEventos: true } }
        const c = clienteFalso()
        assert.strictEqual(await servico.enviar(c, GRUPO, 'banimento'), true)
        assert.strictEqual(c.enviadas[0].conteudo.ptt, true)
        assert.ok(Buffer.isBuffer(c.enviadas[0].conteudo.audio))
    })

    await test('um áudio por minuto no grupo, mesmo em eventos diferentes', async () => {
        fs.mkdirSync(path.join(PASTA, 'promocao'), { recursive: true })
        fs.writeFileSync(path.join(PASTA, 'promocao', 'padrao.mp3'), Buffer.from('audio-promo'))
        const c = clienteFalso()
        assert.strictEqual(await servico.enviar(c, GRUPO, 'promocao'), false, 'ainda dentro do minuto')
        assert.strictEqual(await servico.enviar(c, GRUPO, 'promocao', { forcar: true }), true, 'prévia do dono ignora')
    })

    await test('evento sem áudio não envia nada', async () => {
        const c = clienteFalso()
        assert.strictEqual(await servico.enviar(c, GRUPO, 'silencio', { forcar: true }), false)
    })

    await test('salvar recusa repetido e limpar preserva o padrão', async () => {
        assert.deepStrictEqual(servico.salvar('banimento', Buffer.from('gravado-do-dono')), { ok: true, total: 2 })
        assert.strictEqual(servico.salvar('banimento', Buffer.from('gravado-do-dono')).motivo, 'repetido')
        assert.strictEqual(servico.limpar('banimento'), 1)
        assert.deepStrictEqual(fs.readdirSync(path.join(PASTA, 'banimento')), ['padrao.mp3'])
    })

    await test('falha de envio não lança', async () => {
        const c = clienteFalso({ falha: true })
        assert.strictEqual(await servico.enviar(c, GRUPO, 'banimento', { forcar: true }), false)
    })

    fs.rmSync(PASTA, { recursive: true, force: true })

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Áudios: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
