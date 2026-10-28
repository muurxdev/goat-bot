process.env.NODE_ENV = 'test'
process.env.WHISPER_API_URL = 'http://whisper.teste/v1/audio/transcriptions'
process.env.TRANSCRICAO_ESPERA_MS = '5'
delete process.env.ANTHROPIC_API_KEY

/**
 * Transcrição de áudio de QUALQUER duração, em segundo plano (2026-10-15).
 * O Whisper é simulado (`fetch`); o ffmpeg é de verdade: o corte em trechos é o que se testa.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const temFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0
if (!temFfmpeg) {
    console.log('\n🧪 Transcrição longa: ffmpeg ausente, testes pulados.\n')
    process.exit(0)
}

const { tempDir } = require('../src/config/paths')
const longa = require('../src/services/transcricaoLonga')

let ok = 0, falhou = 0
async function teste(nome, fn) {
    try { await fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const fetchOriginal = global.fetch
let chamadasWhisper = 0
function simularWhisper(fn) {
    chamadasWhisper = 0
    global.fetch = async () => {
        chamadasWhisper += 1
        const r = fn(chamadasWhisper)
        if (r.atraso) await new Promise(res => setTimeout(res, r.atraso))
        return { ok: r.status ? r.status < 400 : true, status: r.status || 200, json: async () => ({ text: r.texto }), text: async () => String(r.texto || '') }
    }
}

function clienteFalso() {
    const enviadas = []
    return { enviadas, sendMessage: async (jid, conteudo) => { enviadas.push({ jid, conteudo }); return { key: { id: 'X' } } } }
}

function audioDeMinutos(min) {
    const dir = path.join(__dirname, '..', 'data', 'teste-transcricao')
    fs.mkdirSync(dir, { recursive: true })
    const arq = path.join(dir, `silencio-${min}min.wav`)
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `anullsrc=r=8000:cl=mono`, '-t', String(min * 60), arq])
    assert.strictEqual(r.status, 0, 'ffmpeg não gerou o áudio de teste')
    return fs.readFileSync(arq)
}

async function esperarFim(client, predicado, ms = 60000) {
    const ate = Date.now() + ms
    while (Date.now() < ate) {
        if (client.enviadas.some(predicado)) return
        await new Promise(r => setTimeout(r, 50))
    }
    throw new Error('a transcrição não terminou a tempo. Mensagens: ' + JSON.stringify(client.enviadas.map(e => e.conteudo.text || e.conteudo.caption || '(doc)')).slice(0, 400))
}

const texto = e => e.conteudo.text || e.conteudo.caption || ''

async function main() {
    console.log('\n🧪 Transcrição longa em segundo plano...\n')
    // Sobras de execuções anteriores (trabalhos que falharam de propósito, ou testes interrompidos)
    // entrariam na retomada e nos limites por pessoa.
    fs.rmSync(path.join(tempDir, 'transcricao'), { recursive: true, force: true })

    await teste('áudio de 12 min: responde na hora com o plano e depois entrega o texto na ordem', async () => {
        simularWhisper(n => ({ texto: `trecho ${n} falado aqui` }))
        const c = clienteFalso()
        const r = await longa.enfileirar({ client: c, from: 'g@g.us', info: { key: { id: 'P1' } }, buffer: audioDeMinutos(12), remetente: 'a@s.whatsapp.net' })
        assert.ok(r.ok, 'não aceitou o áudio')
        // O plano já saiu, antes de qualquer trecho
        const plano = texto(c.enviadas[0])
        assert.ok(/12 min/.test(plano), `plano sem a duração: ${plano}`)
        assert.ok(/estimada/i.test(plano), `plano sem estimativa: ${plano}`)
        assert.ok(/aviso aqui quando terminar/i.test(plano), `plano sem o stand-by: ${plano}`)

        await esperarFim(c, e => /Transcrição pronta/.test(texto(e)))
        const final = texto(c.enviadas.find(e => /Transcrição pronta/.test(texto(e))))
        assert.ok(final.indexOf('trecho 1') < final.indexOf('trecho 2') && final.indexOf('trecho 2') < final.indexOf('trecho 3'), final)
        assert.strictEqual(chamadasWhisper, 3, `chamou o Whisper ${chamadasWhisper}x (12 min = 3 trechos de 5 min)`)
        assert.strictEqual(fs.existsSync(path.join(tempDir, 'transcricao', r.id)), false, 'não limpou a pasta temporária')
    })

    await teste('texto grande demais para uma mensagem vai como arquivo .txt, com o começo na legenda', async () => {
        simularWhisper(n => ({ texto: ('palavra'.padEnd(10, 'x') + ' ').repeat(160) + `fim${n}` })) // ~1,8 mil chars por trecho
        const c = clienteFalso()
        await longa.enfileirar({ client: c, from: 'g@g.us', info: null, buffer: audioDeMinutos(12), remetente: 'b@s.whatsapp.net' })
        await esperarFim(c, e => e.conteudo.document)
        const doc = c.enviadas.find(e => e.conteudo.document).conteudo
        assert.strictEqual(doc.mimetype, 'text/plain')
        assert.ok(/\.txt$/.test(doc.fileName))
        const conteudo = doc.document.toString('utf8')
        assert.ok(conteudo.includes('fim1') && conteudo.includes('fim2') && conteudo.includes('fim3'), 'faltou texto no arquivo')
        assert.ok(doc.caption.length < 1100, `legenda com ${doc.caption.length} caracteres`)
    })

    await teste('trecho sem fala (silêncio/música) não derruba o trabalho', async () => {
        simularWhisper(n => (n === 2 ? { texto: '' } : { texto: `fala ${n}` }))
        const c = clienteFalso()
        await longa.enfileirar({ client: c, from: 'g@g.us', buffer: audioDeMinutos(12), remetente: 'c@s.whatsapp.net' })
        await esperarFim(c, e => /Transcrição pronta/.test(texto(e)))
        const final = texto(c.enviadas.find(e => /Transcrição pronta/.test(texto(e))))
        assert.ok(final.includes('fala 1') && final.includes('fala 3') && !final.includes('não transcrito'), final)
    })

    await teste('um trecho que falha é tentado de novo e o trabalho segue', async () => {
        let falhou2 = 0
        simularWhisper(n => {
            if (n === 2 && falhou2 < 1) { falhou2++; return { status: 500, texto: 'erro' } }
            return { texto: `ok ${n}` }
        })
        const c = clienteFalso()
        await longa.enfileirar({ client: c, from: 'g@g.us', buffer: audioDeMinutos(12), remetente: 'd@s.whatsapp.net' })
        await esperarFim(c, e => /Transcrição pronta/.test(texto(e)))
        assert.ok(!texto(c.enviadas.find(e => /Transcrição pronta/.test(texto(e)))).includes('não transcrito'))
    })

    await teste('transcritor fora do ar: avisa com clareza e não finge que terminou', async () => {
        simularWhisper(() => ({ status: 503, texto: 'fora' }))
        const c = clienteFalso()
        await longa.enfileirar({ client: c, from: 'g@g.us', buffer: audioDeMinutos(20), remetente: 'e@s.whatsapp.net' })
        await esperarFim(c, e => /fora do ar/.test(texto(e)))
        assert.ok(!c.enviadas.some(e => /Transcrição pronta/.test(texto(e))), 'disse que terminou sem terminar')
    })

    await teste('retomada: depois de um reinício continua do trecho em que parou', async () => {
        // Prepara a pasta como o bot a deixaria: entrada + estado com o trecho 1 já transcrito.
        const id = 'tr_retomada_teste'
        const dir = path.join(tempDir, 'transcricao', id)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'entrada.bin'), audioDeMinutos(12))
        fs.writeFileSync(path.join(dir, 'job.json'), JSON.stringify({
            id, from: 'g@g.us', remetente: 'f@s.whatsapp.net', duracaoSeg: 720,
            criadoEm: Date.now(), status: 'transcrevendo', textos: { 0: 'trecho que já estava pronto' }
        }))
        simularWhisper(n => ({ texto: `novo ${n}` }))
        const c = clienteFalso()
        const n = longa.retomarPendentes(c)
        assert.strictEqual(n, 1)
        await esperarFim(c, e => /Transcrição pronta/.test(texto(e)))
        const final = texto(c.enviadas.find(e => /Transcrição pronta/.test(texto(e))))
        assert.ok(final.includes('trecho que já estava pronto'), 'perdeu o que já tinha sido transcrito')
        assert.strictEqual(chamadasWhisper, 2, `chamou o Whisper ${chamadasWhisper}x; só faltavam 2 trechos`)
        assert.ok(c.enviadas.some(e => /continuo a transcrição/.test(texto(e))), 'não avisou que retomou')
    })

    await teste('limite por pessoa: o 4º pedido simultâneo é recusado; dono não tem limite', async () => {
        simularWhisper(() => ({ texto: 'x', atraso: 700 })) // jobs lentos: ficam ativos enquanto os pedidos chegam
        const c = clienteFalso()
        const aud = audioDeMinutos(6)
        const rs = []
        for (let i = 0; i < 4; i++) rs.push(await longa.enfileirar({ client: c, from: 'g@g.us', buffer: aud, remetente: 'lim@s.whatsapp.net' }))
        assert.deepStrictEqual(rs.map(r => r.ok), [true, true, true, false])
        assert.strictEqual(rs[3].motivo, 'limite')
        const dono = await longa.enfileirar({ client: c, from: 'g@g.us', buffer: aud, remetente: 'lim@s.whatsapp.net', ehDono: true })
        assert.ok(dono.ok)
        // deixa a fila esvaziar antes de sair (senão sobram pastas temporárias)
        const ate = Date.now() + 30000
        while (longa.situacao().length && Date.now() < ate) await new Promise(r => setTimeout(r, 100))
    })

    await teste('formatarDuracao e estimativa', () => {
        assert.strictEqual(longa.formatarDuracao(45), '45 s')
        assert.strictEqual(longa.formatarDuracao(125), '2 min 5 s')
        assert.strictEqual(longa.formatarDuracao(3600), '1 h')
        assert.strictEqual(longa.formatarDuracao(4320), '1 h 12 min')
        assert.ok(longa.estimarSeg(3600) >= 300 && longa.estimarSeg(3600) <= 2000, 'a estimativa de 1 h deve ser realista neste servidor (~20 min)')
    })

    global.fetch = fetchOriginal
    try {
        fs.rmSync(path.join(__dirname, '..', 'data', 'teste-transcricao'), { recursive: true, force: true })
        fs.rmSync(path.join(tempDir, 'transcricao'), { recursive: true, force: true })
    } catch (e) { console.log(`     (sobrou lixo de teste: ${e.message})`) }
    console.log(`\n📊 Transcrição longa: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou > 0 ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
