/**
 * Figurinhas de evento (services/figurinhaEventoService).
 *
 * O que precisa continuar verdadeiro:
 *  - Sem figurinha cadastrada, nada é enviado (o evento sai só com texto).
 *  - Grupo desligado não recebe figurinha.
 *  - Remoção em massa não vira uma figurinha por pessoa (intervalo por evento).
 *  - Falha ao enviar nunca lança.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')

const PASTA = fs.mkdtempSync(path.join(os.tmpdir(), 'figurinhas-'))
process.env.FIGURINHAS_DIR = PASTA

const dataService = require('../src/services/dataService')
let configs = {}
dataService.getConfigsData = () => configs
dataService.saveConfigsData = async c => { configs = c }

const servico = require('../src/services/figurinhaEventoService')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

const GRUPO = '120363000000000009@g.us'

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
    console.log('🧪 Testes de figurinhas de evento...\n')

    await test('nomes e apelidos de evento', async () => {
        assert.strictEqual(servico.resolverEvento('Boas-Vindas'), 'boasvindas')
        assert.strictEqual(servico.resolverEvento('ban'), 'banimento')
        assert.strictEqual(servico.resolverEvento('PROMOÇÃO'), 'promocao')
        assert.strictEqual(servico.resolverEvento('qualquer'), null)
    })

    await test('sem figurinha cadastrada não envia nada', async () => {
        const c = clienteFalso()
        assert.strictEqual(await servico.enviar(c, GRUPO, 'banimento'), false)
        assert.strictEqual(c.enviadas.length, 0)
    })

    await test('cadastra, recusa repetida e conta', async () => {
        assert.deepStrictEqual(servico.salvar('banimento', Buffer.from('figurinha-1')), { ok: true, total: 1 })
        assert.strictEqual(servico.salvar('banimento', Buffer.from('figurinha-1')).motivo, 'repetida')
        assert.deepStrictEqual(servico.salvar('banimento', Buffer.from('figurinha-2')), { ok: true, total: 2 })
        assert.strictEqual(servico.contagem().find(c => c.evento === 'banimento').total, 2)
    })

    await test('envia a figurinha e respeita o intervalo do evento', async () => {
        const c = clienteFalso()
        assert.strictEqual(await servico.enviar(c, GRUPO, 'banimento'), true)
        assert.ok(Buffer.isBuffer(c.enviadas[0].conteudo.sticker))
        assert.strictEqual(await servico.enviar(c, GRUPO, 'banimento'), false, 'segunda seguida não sai')
        assert.strictEqual(await servico.enviar(c, GRUPO, 'banimento', { forcar: true }), true, 'prévia do dono ignora o intervalo')
    })

    await test('grupo desligado não recebe', async () => {
        servico.salvar('promocao', Buffer.from('promo'))
        configs = { [GRUPO]: { figurinhasEventos: false } }
        const c = clienteFalso()
        assert.strictEqual(await servico.enviar(c, GRUPO, 'promocao'), false)
        configs = {}
    })

    await test('falha de envio não lança', async () => {
        servico.salvar('despedida', Buffer.from('tchau'))
        const c = clienteFalso({ falha: true })
        assert.strictEqual(await servico.enviar(c, GRUPO, 'despedida'), false)
    })

    await test('limpar apaga as do evento', async () => {
        assert.strictEqual(servico.limpar('banimento'), 2)
        assert.strictEqual(servico.contagem().find(c => c.evento === 'banimento').total, 0)
    })

    fs.rmSync(PASTA, { recursive: true, force: true })

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Figurinhas: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
