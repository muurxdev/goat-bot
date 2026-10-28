process.env.NODE_ENV = 'test'

/**
 * Jogos de grupo: partida de verdade, do começo ao fim.
 *
 * A peneira de `familias-novas.test.js` só prova que cada comando responde
 * alguma coisa. Jogo precisa de mais: a rodada tem de avançar, terminar sozinha
 * (acerto, erro, desistência ou tempo) e não encher a memória do bot com
 * partidas esquecidas.
 *
 * Escrito depois dos comandos: a frente que construiu a família caiu por limite
 * de uso antes do teste dela, e os 250 comandos ficaram cobertos só pela peneira.
 */

const assert = require('assert')
const S = require('../src/services/partyGamesService')
const D = require('../src/services/partyGamesData')

let ok = 0, falhou = 0
function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const GRUPO = '120363000000000000@g.us'
const PESSOA = '5511900000001@s.whatsapp.net'

/** Uma jogada. Devolve o texto que o jogador veria. */
function jogada(config, comando, texto, { from = GRUPO, sender = PESSOA } = {}) {
    const r = S.jogar(config, {
        comando,
        args: texto ? String(texto).split(/\s+/) : [],
        from, sender, prefix: '.'
    })
    if (typeof r === 'string') return r
    // As telas vêm no formato do F.tela: junta o que é texto para conferir.
    const partes = [r.titulo, r.intro]
    for (const s of (r.secoes || [])) {
        if (typeof s === 'string') partes.push(s)
        else partes.push(s.titulo, ...(s.linhas || []))
    }
    partes.push(r.dica)
    return partes.filter(Boolean).join('\n')
}

const chave = (comando, from = GRUPO, sender = PESSOA) => S.chaveDe(from, comando, sender)

console.log('\n🧪 Jogos de grupo — partidas inteiras...\n')

S._zerar()

// ── Forca ─────────────────────────────────────────────────────────
teste('forca: acertar a palavra encerra a partida ganhando', () => {
    const tema = Object.keys(D.FORCA)[0]
    const config = { motor: 'forca', tema }
    const abertura = jogada(config, 'forca1', '')
    assert.ok(/rodada aberta/i.test(abertura), `abertura estranha: ${abertura.slice(0, 80)}`)

    const p = S.obterPartida(chave('forca1'))
    assert.ok(p && p.palavra, 'a partida não guardou a palavra')

    const fim = jogada(config, 'forca1', p.palavra)
    assert.ok(/acert|ganh|parab|salvou/i.test(fim), `não reconheceu o acerto: ${fim.slice(0, 140)}`)
    assert.ok(!S.obterPartida(chave('forca1')), 'a partida continuou aberta depois de ganhar')
})

teste('forca: errar até o fim encerra a partida perdendo', () => {
    const config = { motor: 'forca', tema: Object.keys(D.FORCA)[1] }
    jogada(config, 'forca2', '')
    const palavra = S.norm(S.obterPartida(chave('forca2')).palavra)

    let ultima = ''
    for (const letra of 'qwertyuiopasdfghjklzxcvbnm') {
        if (palavra.includes(letra)) continue
        if (!S.obterPartida(chave('forca2'))) break
        ultima = jogada(config, 'forca2', letra)
    }
    assert.ok(!S.obterPartida(chave('forca2')), 'não terminou depois de gastar as vidas')
    assert.ok(/perd|acabou|fim|era \*/i.test(ultima), `não avisou o fim: ${ultima.slice(0, 140)}`)
})

teste('forca: quem desiste encerra e vê a palavra', () => {
    const config = { motor: 'forca', tema: Object.keys(D.FORCA)[2] }
    jogada(config, 'forca3', '')
    assert.ok(S.obterPartida(chave('forca3')), 'não abriu')
    const saida = jogada(config, 'forca3', 'parar')
    assert.ok(!S.obterPartida(chave('forca3')), 'continuou aberta depois de "parar"')
    assert.ok(/palavra era/i.test(saida), `não revelou a palavra: ${saida.slice(0, 120)}`)
})

// ── Adivinhar número ──────────────────────────────────────────────
teste('adivinhar número: a dica de maior ou menor leva ao acerto', () => {
    const config = { motor: 'numero', max: 100 }
    jogada(config, 'num1', '')
    const alvo = S.obterPartida(chave('num1')).alvo ?? S.obterPartida(chave('num1')).numero
    assert.ok(Number.isInteger(alvo), 'a partida não guardou o número sorteado')

    let baixo = 1, alto = 100, resposta = ''
    for (let i = 0; i < 12 && S.obterPartida(chave('num1')); i++) {
        const palpite = Math.floor((baixo + alto) / 2)
        resposta = jogada(config, 'num1', String(palpite))
        if (palpite < alvo) baixo = palpite + 1
        else if (palpite > alvo) alto = palpite - 1
    }
    assert.ok(!S.obterPartida(chave('num1')), 'não terminou nem com 12 palpites usando a dica')
    assert.ok(/acert|isso|parab|conseguiu/i.test(resposta), `não comemorou: ${resposta.slice(0, 120)}`)
})

// ── Quiz ──────────────────────────────────────────────────────────
teste('quiz: responde tudo e fecha com placar', () => {
    const tema = Object.keys(D.QUIZZES)[0]
    const config = { motor: 'quiz', tema, qtd: 3 }
    jogada(config, 'quiz1', '')

    let resposta = ''
    for (let i = 0; i < 5 && S.obterPartida(chave('quiz1')); i++) {
        resposta = jogada(config, 'quiz1', 'a')
    }
    assert.ok(!S.obterPartida(chave('quiz1')), 'o quiz não terminou depois das perguntas')
    assert.ok(/placar|acert|result|fim|de \d/i.test(resposta), `não fechou com placar: ${resposta.slice(0, 140)}`)
})

// ── Jogo da velha ─────────────────────────────────────────────────
teste('jogo da velha: o tabuleiro fecha em vitória, derrota ou empate', () => {
    const config = { motor: 'velha' }
    jogada(config, 'velha1', '')
    let resposta = ''
    for (let casa = 1; casa <= 9 && S.obterPartida(chave('velha1')); casa++) {
        resposta = jogada(config, 'velha1', String(casa))
    }
    assert.ok(!S.obterPartida(chave('velha1')), 'o tabuleiro não fechou em 9 jogadas')
    assert.ok(/ganh|perd|velha|empat|fim|venci/i.test(resposta), `não anunciou o fim: ${resposta.slice(0, 140)}`)
})

// ── Memória do bot ────────────────────────────────────────────────
teste('partida esquecida expira sozinha', () => {
    S._zerar()
    const config = { motor: 'forca', tema: Object.keys(D.FORCA)[0] }
    jogada(config, 'forca9', '', { from: 'grupo-esquecido@g.us' })
    const k = chave('forca9', 'grupo-esquecido@g.us')
    assert.ok(S.obterPartida(k), 'não abriu')

    S._envelhecer(k, S.TTL_MS + 1000)
    S.limparExpiradas()
    assert.ok(!S.obterPartida(k), 'a partida velha continuou ocupando memória')
})

teste('teto de partidas simultâneas segura o crescimento', () => {
    S._zerar()
    const config = { motor: 'forca', tema: Object.keys(D.FORCA)[0] }
    for (let i = 0; i < S.MAX_PARTIDAS + 25; i++) {
        jogada(config, 'forca10', '', { from: `grupo${i}@g.us`, sender: `${i}@s.whatsapp.net` })
    }
    const { total, teto } = S._diagnostico()
    assert.ok(total <= teto, `passou do teto: ${total} partidas abertas (máx. ${teto})`)
})

teste('cada grupo joga a sua partida, sem misturar', () => {
    S._zerar()
    const config = { motor: 'forca', tema: Object.keys(D.FORCA)[3] }
    jogada(config, 'forca11', '', { from: 'grupo-a@g.us' })
    jogada(config, 'forca11', '', { from: 'grupo-b@g.us' })
    assert.ok(S.obterPartida(chave('forca11', 'grupo-a@g.us')), 'faltou a partida de A')
    assert.ok(S.obterPartida(chave('forca11', 'grupo-b@g.us')), 'faltou a partida de B')

    jogada(config, 'forca11', 'parar', { from: 'grupo-a@g.us' })
    assert.ok(!S.obterPartida(chave('forca11', 'grupo-a@g.us')), 'a de A não encerrou')
    assert.ok(S.obterPartida(chave('forca11', 'grupo-b@g.us')), 'encerrar A derrubou a partida de B')
})

// ── Bancos de conteúdo ────────────────────────────────────────────
// Formato real: pergunta = [texto, [alternativas], índice da certa]
teste('toda pergunta de quiz aponta para uma alternativa que existe', () => {
    const problemas = []
    for (const [tema, banco] of Object.entries(D.QUIZZES)) {
        for (const [texto, alternativas, certa] of banco.perguntas) {
            if (!Array.isArray(alternativas) || alternativas.length < 2) {
                problemas.push(`${tema}: "${String(texto).slice(0, 40)}" com menos de 2 alternativas`)
            } else if (!Number.isInteger(certa) || certa < 0 || certa >= alternativas.length) {
                problemas.push(`${tema}: "${String(texto).slice(0, 40)}" aponta ${certa}, fora das ${alternativas.length}`)
            }
        }
    }
    assert.strictEqual(problemas.length, 0, `${problemas.length} problemas:\n     ${problemas.slice(0, 5).join('\n     ')}`)
})

teste('nenhum quiz tem pergunta repetida e todos têm banco decente', () => {
    const problemas = []
    for (const [tema, banco] of Object.entries(D.QUIZZES)) {
        if (banco.perguntas.length < 12) problemas.push(`${tema} tem só ${banco.perguntas.length} perguntas (mínimo 12)`)
        const vistas = new Set()
        for (const [texto] of banco.perguntas) {
            const k = S.norm(String(texto))
            if (vistas.has(k)) problemas.push(`${tema}: "${String(texto).slice(0, 45)}" aparece duas vezes`)
            vistas.add(k)
        }
    }
    assert.strictEqual(problemas.length, 0, `${problemas.length} problemas:\n     ${problemas.slice(0, 5).join('\n     ')}`)
})

teste('banco da forca só tem palavra jogável, e cada uma com dica', () => {
    for (const [tema, banco] of Object.entries(D.FORCA)) {
        assert.ok(banco.palavras.length >= 10, `${tema} tem só ${banco.palavras.length} palavras`)
        for (const [palavra, dica] of banco.palavras) {
            assert.ok(palavra && palavra.length >= 3, `${tema}: palavra curta demais ("${palavra}")`)
            assert.ok(!/\d/.test(palavra), `${tema}: "${palavra}" tem número`)
            assert.ok(dica && String(dica).trim().length >= 5, `${tema}: "${palavra}" sem dica de verdade`)
        }
    }
})

// ── Jogos unificados (um comando por brincadeira, .jogoN como atalho) ────────
const J = require('../src/services/jogoUnificadoService')
const path = require('path')
const unificado = nome => require(path.join(__dirname, '..', 'src', 'commands', 'fun', `jogo-${nome}.js`))
const textoDe = r => [r.titulo, r.intro, ...(r.secoes || []).flatMap(s => typeof s === 'string' ? [s] : [s.titulo, ...(s.linhas || [])]),
    ...(r.proximos || []).map(p => `.${p.nome} ${p.args || ''}`)].filter(Boolean).join('\n')
/** Os dados do jogo gerado, lidos do próprio arquivo (o objeto não é exportado). */
const dadosDoJogo = nome => {
    const fonte = require('fs').readFileSync(path.join(__dirname, '..', 'src', 'commands', 'fun', `jogo-${nome}.js`), 'utf8')
    return JSON.parse(/const JOGO = ([\s\S]*?)\n\nmodule\.exports/.exec(fonte)[1])
}
const JOGO_QUIZ = dadosDoJogo('quiztema')

teste('unificado: sem argumento e sem partida mostra as opções', () => {
    S._zerar(); J._zerarEscolhas()
    const t = textoDe(J.rodar(JOGO_QUIZ, { commandName: 'quiztema', args: [], from: GRUPO, sender: PESSOA }))
    assert.ok(t.includes('`.quiztema bandeiras`'), t.slice(0, 200))
})

teste('unificado: "bandeiras 10" abre maratona e a jogada segue na mesma variante', () => {
    S._zerar(); J._zerarEscolhas()
    const abre = textoDe(J.rodar(JOGO_QUIZ, { commandName: 'quiztema', args: ['bandeiras', '10'], from: GRUPO, sender: PESSOA }))
    assert.ok(/1 de 10/i.test(abre), abre.slice(0, 120))
    const joga = textoDe(J.rodar(JOGO_QUIZ, { commandName: 'quiztema', args: ['a'], from: GRUPO, sender: PESSOA }))
    assert.ok(/2 de 10/i.test(joga), `a jogada não caiu na partida aberta: ${joga.slice(0, 120)}`)
})

teste('unificado: atalho antigo .jogo2 abre o quiz de 10 e responde pelo mesmo nome', () => {
    S._zerar(); J._zerarEscolhas()
    const abre = textoDe(J.rodar(JOGO_QUIZ, { commandName: 'jogo2', args: [], from: GRUPO, sender: PESSOA }))
    assert.ok(/1 de 10/i.test(abre), abre.slice(0, 120))
    assert.ok(abre.includes('.jogo2 a'), 'a tela do atalho deveria ensinar a responder pelo atalho')
    assert.ok(S.obterPartida(chave('jogo2')), 'partida do atalho não ficou guardada no nome do atalho')
})

teste('unificado: opção desconhecida explica e mostra as opções', () => {
    S._zerar(); J._zerarEscolhas()
    const t = textoDe(J.rodar(JOGO_QUIZ, { commandName: 'quiztema', args: ['xyz'], from: GRUPO, sender: PESSOA }))
    assert.ok(t.includes('Não conheço a opção') && t.includes('`.quiztema bandeiras`'), t.slice(0, 200))
})

teste('unificado: todo .jogo1…250 antigo continua existindo como atalho', () => {
    const atalhos = new Set()
    for (const f of require('fs').readdirSync(path.join(__dirname, '..', 'src', 'commands', 'fun')).filter(f => /^jogo-[a-z]+\.js$/.test(f))) {
        for (const a of require(path.join(__dirname, '..', 'src', 'commands', 'fun', f)).aliases) atalhos.add(a)
    }
    const faltam = Array.from({ length: 250 }, (_, i) => `jogo${i + 1}`).filter(n => !atalhos.has(n))
    assert.strictEqual(faltam.length, 0, `sem atalho: ${faltam.slice(0, 10).join(', ')}`)
})

teste('unificado: jogo sem estado sempre oferece "opcoes" para ver as outras variantes', () => {
    S._zerar(); J._zerarEscolhas()
    assert.strictEqual(unificado('roda').name, 'roda')
    const t = textoDe(J.rodar(dadosDoJogo('roda'), { commandName: 'roda', args: [], from: GRUPO, sender: PESSOA }))
    assert.ok(t.includes('.roda opcoes'), `sem caminho para as outras rodas: ${t.slice(-200)}`)
    const opcoes = textoDe(J.rodar(dadosDoJogo('roda'), { commandName: 'roda', args: ['opcoes'], from: GRUPO, sender: PESSOA }))
    assert.ok(opcoes.includes('`.roda eununca`'), opcoes.slice(0, 200))
})

console.log(`\n📊 Jogos de grupo: ✅ ${ok}  ❌ ${falhou}\n`)
process.exit(falhou > 0 ? 1 : 0)
