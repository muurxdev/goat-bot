/**
 * BotXP — Busca de mídia e entrega de arquivos longos
 *
 * Cobre as quatro regressões que faziam o bot errar a música e recusar live:
 *   1. busca ignorava o artista digitado e pegava o 1º resultado do YouTube
 *   2. teto de 60 min recusava live/DVD de pagode
 *   3. teto de timeout de 15 min cortava download de conteúdo longo
 *   4. áudio longo ia como `audio:` sem checar tamanho e não chegava
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const { ranquear, melhorResultado, normalizar, separarConsulta } = require('../src/services/media/searchRanker')
const { MEDIA_LIMITS } = require('../src/services/media/constants')
const { resolveDownloadFormat } = require('../src/services/media/formatResolver')

let passCount = 0
let failCount = 0

function test(nome, fn) {
    try {
        fn()
        passCount++
        console.log(`  ✅ PASS: ${nome}`)
    } catch (e) {
        failCount++
        console.log(`  ❌ FAIL: ${nome}`)
        console.log(`      ${e.message}`)
    }
}

console.log('\n--- 1. Ranqueamento respeita o artista pedido ---')

test('escolhe o artista brasileiro pedido, não a música estrangeira homônima', () => {
    // O bug relatado: pediu "Deixa Acontecer - Grupo Revelação" e veio uma
    // música em inglês porque o YouTube a ranqueou em 1º.
    const candidatos = [
        { title: 'Let It Happen', author: 'Tame Impala', duration: 287, views: 90000000 },
        { title: 'Deixa Acontecer (Ao Vivo)', author: 'Grupo Revelação', duration: 245, views: 45000000 }
    ]
    const { escolhido, confiante } = melhorResultado('Deixa Acontecer - Grupo Revelacao', candidatos)
    assert.strictEqual(escolhido.author, 'Grupo Revelação', 'deveria escolher o Grupo Revelação')
    assert.ok(confiante, 'a escolha deveria ser confiante')
})

test('karaokê e cover perdem para a versão do artista', () => {
    const candidatos = [
        { title: 'TAPA NA CARA - KARAOKE PLAYBACK', author: 'Karaoke Brasil', duration: 240, views: 500000 },
        { title: 'Tapa na Cara (cover)', author: 'Fulano', duration: 250, views: 800000 },
        { title: 'Tapa na Cara', author: 'Thiaguinho', duration: 230, views: 100000 }
    ]
    const { escolhido } = melhorResultado('Tapa na Cara - Thiaguinho', candidatos)
    assert.strictEqual(escolhido.author, 'Thiaguinho')
})

test('mas respeita quem PEDE karaokê de propósito', () => {
    const candidatos = [
        { title: 'Deixa Acontecer', author: 'Grupo Revelação', duration: 245, views: 45000000 },
        { title: 'Deixa Acontecer - KARAOKE', author: 'Karaoke Brasil', duration: 240, views: 500000 }
    ]
    const { escolhido } = melhorResultado('Deixa Acontecer karaoke', candidatos)
    assert.ok(/karaoke/i.test(escolhido.title), 'pediu karaokê, deve entregar karaokê')
})

test('busca de live longa prefere o conteúdo de horas, não o clipe curto', () => {
    const candidatos = [
        { title: 'Pagode Raiz', author: 'Canal X', duration: 200, views: 100000 },
        { title: 'Pagode Raiz - As Melhores (Ao Vivo) 2 HORAS', author: 'Pagode Total', duration: 7500, views: 3000000 }
    ]
    const { escolhido } = melhorResultado('pagode raiz ao vivo 2 horas', candidatos)
    assert.ok(escolhido.duration > 3600, 'deveria escolher a versão longa')
})

test('short de 30s não vence a faixa completa', () => {
    const candidatos = [
        { title: 'Tapa na Cara', author: 'Canal Aleatorio', duration: 30, views: 900 },
        { title: 'Tapa na Cara (Video Oficial)', author: 'Thiaguinho', duration: 230, views: 15000000 }
    ]
    const { escolhido } = melhorResultado('Tapa na Cara', candidatos)
    assert.ok(escolhido.duration > 100, 'não deveria escolher o short')
})

test('título igual ao pedido vence vídeo que só fala dele, mesmo sendo curto', () => {
    // .play "me at the zoo" entregava um vídeo SOBRE o original: os dois têm a
    // frase no título, e o original (19 s) levava a pena de short.
    const candidatos = [
        { title: '"Me at the zoo" wasn\'t the first YouTube video... (the real first video)', author: 'TheTekkitRealm', duration: 480, views: 2500000 },
        { title: 'Me at the zoo', author: 'jawed', duration: 19, views: 380000000 }
    ]
    const { escolhido } = melhorResultado('me at the zoo', candidatos)
    assert.strictEqual(escolhido.author, 'jawed')
})

test('reaction e tutorial são descartados', () => {
    const candidatos = [
        { title: 'PAGODE AO VIVO - REACTION', author: 'ReactBR', duration: 900, views: 50000 },
        { title: 'Como tocar Pagode ao vivo no violão', author: 'Aulas', duration: 800, views: 40000 },
        { title: 'Pagode ao Vivo', author: 'Grupo Pagode', duration: 3800, views: 900000 }
    ]
    const { escolhido } = melhorResultado('Pagode ao Vivo - Grupo Pagode', candidatos)
    assert.strictEqual(escolhido.author, 'Grupo Pagode')
})

test('normalização ignora acento e caixa', () => {
    assert.strictEqual(normalizar('Coração NÃO Está Só'), 'coracao nao esta so')
})

test('separa "Música - Artista" nos dois lados', () => {
    const c = separarConsulta('Deixa Acontecer - Grupo Revelação')
    assert.ok(c.temSeparador)
    assert.strictEqual(c.ladoA, 'Deixa Acontecer')
    assert.strictEqual(c.ladoB, 'Grupo Revelação')
})

test('ranquear devolve lista ordenada e reindexada', () => {
    const r = ranquear('teste', [
        { title: 'nada a ver', author: 'x', duration: 200 },
        { title: 'teste', author: 'teste', duration: 200 }
    ])
    assert.strictEqual(r.length, 2)
    assert.strictEqual(r[0].index, 1)
    assert.ok(r[0]._score >= r[1]._score, 'deve vir ordenado por score')
})

test('proteção de título: não entrega outra música do mesmo artista', () => {
    // Caso real: pediu "Dentro da B - Tropa do Bruxo", o canal é TROPA DO BRUXO,
    // mas o vídeo mais popular do canal é "Baile Do Bruxo" (outra música!).
    const candidatos = [
        { title: 'Tropa do Bruxo - Baile Do Bruxo (Visualizer)', author: 'TROPA DO BRUXO', duration: 225, views: 5000000 },
        { title: 'Dentro da B', author: 'TROPA DO BRUXO', duration: 160, views: 1000000 },
        { title: 'Dentro da B feat. Mc Reis & Mc Don Juan', author: 'DJ LG do SF', duration: 157, views: 800000 }
    ]
    const { escolhido } = melhorResultado('Dentro da B - Tropa do Bruxo', candidatos, {
        expectedTitle: 'Dentro da B',
        expectedArtist: 'Tropa do Bruxo',
        expectedDuration: 160
    })
    assert.strictEqual(escolhido.title, 'Dentro da B', 'deveria escolher a música pedida, não outra faixa do mesmo canal')
})

test('busca de título curto preserva letra/número e vence vídeo com mais views', () => {
    // "Dentro da B" tem 'b' (1 letra) e não pode ser confundido com "DENTRO DO I30"
    const candidatos = [
        { title: 'DENTRO DO I30 - Clipe Oficial', author: 'Funk Oficial', duration: 140, views: 20000000 },
        { title: 'Dentro da B feat. Mc Reis & Mc Don Juan', author: 'DJ LG do SF', duration: 157, views: 800000 }
    ]
    const { escolhido } = melhorResultado('Dentro da B', candidatos)
    assert.strictEqual(escolhido.title, 'Dentro da B feat. Mc Reis & Mc Don Juan')
})

test('duração esperada desempata a versão idêntica do áudio', () => {
    const candidatos = [
        { title: 'Faixa Desconhecida', author: 'Artista', duration: 360, views: 100000 },
        { title: 'Faixa Exata', author: 'Artista', duration: 160, views: 50000 }
    ]
    const { escolhido } = melhorResultado('Faixa - Artista', candidatos, { expectedDuration: 160 })
    assert.strictEqual(escolhido.title, 'Faixa Exata')
})

test('lista vazia não quebra', () => {
    assert.deepStrictEqual(ranquear('x', []), [])
    assert.strictEqual(melhorResultado('x', []).escolhido, null)
})

console.log('\n--- 2. Limites permitem conteúdo longo ---')

test('duração máxima comporta live de 3 horas', () => {
    assert.ok(MEDIA_LIMITS.MAX_DURATION_SECONDS >= 3 * 3600,
        `teto de ${MEDIA_LIMITS.MAX_DURATION_SECONDS / 3600}h recusaria uma live de 3h`)
})

test('timeout de download acompanha vídeo de horas', () => {
    const dur3h = 3 * 3600
    const efetivo = Math.min(
        MEDIA_LIMITS.MAX_DOWNLOAD_TIMEOUT_MS,
        Math.max(MEDIA_LIMITS.DOWNLOAD_TIMEOUT_MS, dur3h * 1200)
    )
    assert.ok(efetivo >= 60 * 60 * 1000,
        `timeout efetivo de ${efetivo / 60000} min é curto para 3h de vídeo`)
})

console.log('\n--- 3. Qualidade máxima sem trava de codec ---')

test('qualidade "max" ordena por resolução, sem forçar H.264', () => {
    const r = resolveDownloadFormat({ format: 'mp4', quality: 'max' })
    const sortIdx = r.args.indexOf('-S')
    assert.ok(sortIdx >= 0, 'deveria ter critério de ordenação')
    assert.ok(r.args[sortIdx + 1].startsWith('res'),
        'resolução deve vir primeiro em "max"')
    assert.ok(!r.args.some(a => String(a).includes('height<=')),
        'não pode haver teto de altura em "max"')
})

test('qualidade "best" também vai no máximo, com H.264 só de desempate', () => {
    const r = resolveDownloadFormat({ format: 'mp4', quality: 'best' })
    const ordem = r.args[r.args.indexOf('-S') + 1]
    assert.ok(ordem.startsWith('res,fps'),
        `"best" tem de pedir a maior resolução primeiro, e pede: ${ordem}`)
    assert.ok(ordem.includes('vcodec:h264'),
        'H.264 continua na ordenação, como desempate entre formatos da mesma resolução')
    assert.ok(!r.args.some(a => String(a).includes('height<=')),
        'não pode haver teto de altura no padrão')
})

console.log('\n--- 4. Entrega de áudio longo ---')

test('audioSender expõe limite e divisão em partes', () => {
    const a = require('../src/services/media/audioSender')
    assert.strictEqual(typeof a.enviarAudio, 'function')
    assert.strictEqual(typeof a.dividirEmPartes, 'function')
    assert.ok(a.LIMITE_AUDIO > 0)
    // Cada parte precisa caber no limite: 15 min em 128 kbps ≈ 14 MB.
    const bytesEstimados = a.SEGUNDOS_POR_PARTE * (128 * 1000 / 8)
    assert.ok(bytesEstimados < a.LIMITE_AUDIO,
        `parte de ${a.SEGUNDOS_POR_PARTE / 60} min (~${(bytesEstimados / 1024 / 1024).toFixed(0)} MB) não cabe no limite`)
})

test('videoSender conhece o caminho do Drive', () => {
    const v = require('../src/services/media/videoSender')
    assert.strictEqual(typeof v.enviarVideo, 'function')
    assert.ok(v.LIMITE_GALERIA > 0)
})

console.log('\n========================================')
console.log('📊 RESULTADO BUSCA + MÍDIA LONGA:')
console.log(`   ✅ Passaram: ${passCount}`)
console.log(`   ❌ Falharam: ${failCount}`)
console.log('========================================\n')

if (failCount > 0) process.exit(1)
