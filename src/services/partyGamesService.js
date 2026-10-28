/**
 * Motor dos jogos de grupo da família `.jogo1` … `.jogo250`.
 *
 * O comando não sabe jogar: ele passa uma configuração declarativa
 * (`{ motor, tema, modo, … }`) e recebe de volta um descritor de tela pronto
 * para `F.tela`. Toda regra, todo sorteio e todo estado moram aqui.
 *
 * ── Decisão sobre o estado das partidas ────────────────────────────────────
 * Partida com rodada (forca, quiz, adivinhação, jogo da velha, hanói…) precisa
 * lembrar da jogada anterior. Guardamos isso em memória, num Map, e NÃO no
 * banco, porque partida é efêmera: se o bot reiniciar no meio de uma forca,
 * perder a rodada é aceitável — perder memória para sempre não é.
 *
 * A chave é `grupo|jogo|pessoa`. Inclui a pessoa de propósito: num grupo de
 * cinquenta, várias pessoas jogam a mesma forca ao mesmo tempo e uma não pode
 * chutar letra na partida da outra. Inclui o grupo porque a mesma pessoa pode
 * estar jogando em dois grupos.
 *
 * Duas travas impedem que isso vire vazamento de memória:
 *   • TTL_MS  — partida parada por mais de 6 minutos morre sozinha. É limpo de
 *               forma preguiçosa (a cada abertura) em vez de por setInterval,
 *               para não segurar o processo vivo nem rodar à toa de madrugada.
 *   • MAX_PARTIDAS — teto duro de 400 partidas simultâneas. Ao estourar, a
 *               partida mais antiga a receber jogada é descartada (LRU). Sem
 *               esse teto, um grupo grande abrindo jogo e abandonando encheria
 *               o Map até o processo morrer.
 *
 * O placar de vitórias, esse sim, sobrevive a reinício: vai para o SQLite pelo
 * helper memoizado `q(sql)`, escopado por grupo (ranking global foi removido do
 * projeto de propósito). Falha de banco nunca derruba a partida — vira aviso.
 */

const D = require('./partyGamesData')
const { q } = require('../database/connection')
const logger = require('../core/logger')

const TTL_MS = 6 * 60 * 1000
const MAX_PARTIDAS = 400

/** @type {Map<string, object>} chave `grupo|jogo|pessoa` → estado da partida */
const partidas = new Map()

// ─── Estado das partidas ────────────────────────────────────────────────────

function chaveDe(from, jogo, sender) {
    return `${from || 'pv'}|${jogo}|${sender || 'anon'}`
}

/** Remove tudo que passou do TTL. Chamado antes de abrir partida nova. */
function limparExpiradas(agora = Date.now()) {
    let removidas = 0
    for (const [k, p] of partidas) {
        if (agora - p.tocadaEm > TTL_MS) { partidas.delete(k); removidas++ }
    }
    return removidas
}

/** Descarta a partida encostada há mais tempo (LRU) quando o teto estoura. */
function descartarMaisAntiga() {
    let alvo = null, maisVelha = Infinity
    for (const [k, p] of partidas) {
        if (p.tocadaEm < maisVelha) { maisVelha = p.tocadaEm; alvo = k }
    }
    if (alvo) partidas.delete(alvo)
    return alvo
}

function abrirPartida(chave, estado) {
    const agora = Date.now()
    limparExpiradas(agora)
    while (partidas.size >= MAX_PARTIDAS) {
        if (!descartarMaisAntiga()) break
    }
    const p = { ...estado, criadaEm: agora, tocadaEm: agora }
    partidas.set(chave, p)
    return p
}

function obterPartida(chave, agora = Date.now()) {
    const p = partidas.get(chave)
    if (!p) return null
    if (agora - p.tocadaEm > TTL_MS) { partidas.delete(chave); return null }
    p.tocadaEm = agora
    return p
}

function encerrarPartida(chave) {
    return partidas.delete(chave)
}

/** Apenas para os testes: espiar e zerar o estado sem depender de internals. */
function _diagnostico() {
    return { total: partidas.size, teto: MAX_PARTIDAS, ttlMs: TTL_MS, chaves: [...partidas.keys()] }
}
function _zerar() { partidas.clear() }
function _envelhecer(chave, ms) {
    const p = partidas.get(chave)
    if (p) { p.tocadaEm -= ms; p.criadaEm -= ms }
    return !!p
}

// ─── Placar persistente (sobrevive a reinício, escopado por grupo) ──────────

let tabelaPronta = false
function garantirTabela() {
    if (tabelaPronta) return true
    try {
        q(`CREATE TABLE IF NOT EXISTS party_games_placar (
            grupo TEXT NOT NULL,
            jogador TEXT NOT NULL,
            jogo TEXT NOT NULL,
            vitorias INTEGER NOT NULL DEFAULT 0,
            atualizado_em INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (grupo, jogador, jogo)
        )`).run()
        tabelaPronta = true
        return true
    } catch (e) {
        logger.warn(`[partyGames] não deu para preparar a tabela de placar: ${e.message}`)
        return false
    }
}

/** Soma uma vitória e devolve o total da pessoa naquele jogo, naquele grupo. */
function registrarVitoria(grupo, jogador, jogo) {
    if (!garantirTabela()) return 0
    try {
        q(`INSERT INTO party_games_placar (grupo, jogador, jogo, vitorias, atualizado_em)
           VALUES (?, ?, ?, 1, ?)
           ON CONFLICT(grupo, jogador, jogo) DO UPDATE SET
             vitorias = vitorias + 1, atualizado_em = excluded.atualizado_em`)
            .run(String(grupo || 'pv'), String(jogador || 'anon'), String(jogo), Date.now())
        const linha = q('SELECT vitorias FROM party_games_placar WHERE grupo = ? AND jogador = ? AND jogo = ?')
            .get(String(grupo || 'pv'), String(jogador || 'anon'), String(jogo))
        return linha ? Number(linha.vitorias) : 1
    } catch (e) {
        logger.warn(`[partyGames] vitória não registrada em ${jogo}: ${e.message}`)
        return 0
    }
}

// ─── Utilidades ─────────────────────────────────────────────────────────────

function norm(t) {
    return String(t ?? '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

function sorteio(lista) { return lista[Math.floor(Math.random() * lista.length)] }

function embaralhar(lista) {
    const a = [...lista]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = a[i]; a[i] = a[j]; a[j] = t
    }
    return a
}

/** N itens distintos sorteados da lista (ou a lista inteira, se for menor). */
function sortearVarios(lista, n) { return embaralhar(lista).slice(0, Math.min(n, lista.length)) }

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']
const NUM_EMOJI = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

/** Pedido de desistência: `.jogoN parar`. */
function pediuParar(args) {
    const a = norm(args[0])
    return a === 'PARAR' || a === 'DESISTIR' || a === 'SAIR'
}

function bancoFalando(config) {
    return { emoji: config.emoji || '🎲', titulo: config.titulo || 'Jogo da Galera' }
}

/** Tela de erro previsível — nunca lança para quem chamou. */
function telaAviso(config, texto, comando, prefix) {
    const b = bancoFalando(config)
    return {
        emoji: b.emoji, titulo: b.titulo, intro: texto,
        secoes: [{ emoji: '🎯', titulo: 'Como continuar', linhas: ['• Mande o comando de novo para começar uma rodada nova.'] }],
        proximos: [{ nome: comando, oque: 'abrir uma partida' }], prefix
    }
}

// ─── Motor: quiz ────────────────────────────────────────────────────────────

function montarQuiz(tema, qtd) {
    const banco = D.QUIZZES[tema]
    const escolhidas = sortearVarios(banco.perguntas, qtd).map(([enunciado, alts, certa]) => {
        const corretaTexto = alts[certa]
        const misturadas = embaralhar(alts)
        return { enunciado, alts: misturadas, certa: misturadas.indexOf(corretaTexto) }
    })
    return { jogo: 'quiz', tema, perguntas: escolhidas, indice: 0, acertos: 0, erradas: [] }
}

function telaPergunta(config, p, comando, prefix, cabecalho) {
    const atual = p.perguntas[p.indice]
    const alternativas = atual.alts.map((a, i) => `${LETRAS[i]}) ${a}`)
    const banco = D.QUIZZES[p.tema]
    return {
        emoji: banco.emoji, titulo: `${banco.nome} — pergunta ${p.indice + 1} de ${p.perguntas.length}`,
        intro: cabecalho ? `${cabecalho}\n\n${atual.enunciado}` : atual.enunciado,
        secoes: [
            { emoji: '🔤', titulo: 'Alternativas', linhas: alternativas },
            { emoji: '📊', titulo: 'Como vai o jogo', linhas: [`*Acertos até agora:* ${p.acertos}`] }
        ],
        dica: 'Responda mandando só a letra. Tem seis minutos por jogada.',
        proximos: [
            { nome: comando, args: 'a', oque: 'responder a alternativa A' },
            { nome: comando, args: 'parar', oque: 'encerrar o quiz' }
        ],
        prefix
    }
}

function motorQuiz(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const banco = D.QUIZZES[config.tema]
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia quiz aberto no seu nome por aqui.', comando, prefix)
        encerrarPartida(chave)
        return {
            emoji: banco.emoji, titulo: `${banco.nome} — encerrado`,
            intro: `Você parou na pergunta ${p.indice + 1} com ${p.acertos} acerto(s).`,
            secoes: [{ emoji: '⚽', titulo: 'Sem problema', linhas: ['• Guardamos o seu lugar para a próxima rodada.'] }],
            proximos: [{ nome: comando, oque: 'começar um quiz novo' }], prefix
        }
    }

    if (!p) {
        p = abrirPartida(chave, montarQuiz(config.tema, config.qtd || 5))
        return telaPergunta(config, p, comando, prefix,
            `Rodada aberta: ${p.perguntas.length} perguntas de ${banco.nome.toLowerCase()}.`)
    }

    const resposta = norm(args[0])
    if (!resposta) return telaPergunta(config, p, comando, prefix, 'Sua rodada continua de pé.')

    let escolha = LETRAS.indexOf(resposta)
    if (escolha < 0) {
        // Aceita também o texto da alternativa, para quem digita a resposta inteira.
        escolha = p.perguntas[p.indice].alts.findIndex(a => norm(a) === resposta)
    }
    if (escolha < 0 || escolha >= p.perguntas[p.indice].alts.length) {
        return telaPergunta(config, p, comando, prefix, 'Não entendi a letra. Vale de A até D.')
    }

    const atual = p.perguntas[p.indice]
    const acertou = escolha === atual.certa
    if (acertou) p.acertos++
    else p.erradas.push(`${atual.enunciado} → ${atual.alts[atual.certa]}`)
    p.indice++

    if (p.indice < p.perguntas.length) {
        const marca = acertou ? '✅ Certo!' : `❌ Era *${atual.alts[atual.certa]}*.`
        return telaPergunta(config, p, comando, prefix, marca)
    }

    encerrarPartida(chave)
    const total = p.perguntas.length
    const nota = p.acertos === total ? 'Gabaritou! O estádio inteiro aplaude de pé.'
        : p.acertos >= total * 0.7 ? 'Boa rodada, saiu de cabeça erguida.'
            : p.acertos >= total * 0.4 ? 'Deu para o gasto. Dá para melhorar na próxima.'
                : 'Rodada difícil. Bebe uma água e tenta de novo.'
    const vitorias = p.acertos === total ? registrarVitoria(from, sender, comando) : 0
    return {
        emoji: banco.emoji, titulo: `${banco.nome} — resultado`,
        intro: `${acertou ? '✅ Certo na última!' : `❌ A última era *${atual.alts[atual.certa]}*.`}\n\nVocê fez *${p.acertos} de ${total}*. ${nota}`,
        secoes: [
            p.erradas.length ? { emoji: '📚', titulo: 'O que passou batido', linhas: p.erradas.slice(0, 5).map(e => `• ${e}`) } : null,
            vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Rodadas perfeitas suas neste jogo:* ${vitorias}`] } : null
        ].filter(Boolean),
        proximos: [{ nome: comando, oque: 'jogar outra rodada' }], prefix
    }
}

// ─── Motor: forca ───────────────────────────────────────────────────────────

const BONECO = [
    ['🪢', '', ''],
    ['🪢 😀', '', ''],
    ['🪢 😐', '👕', ''],
    ['🪢 😟', '🤚 👕', ''],
    ['🪢 😧', '🤚 👕 🤚', ''],
    ['🪢 😨', '🤚 👕 🤚', '🦵'],
    ['🪢 💀', '🤚 👕 🤚', '🦵 🦵']
]
const MAX_ERROS = 6

function desenharForca(erros) {
    return BONECO[Math.min(erros, MAX_ERROS)].filter(Boolean).join('\n')
}

function mascara(palavra, acertadas) {
    return palavra.split('').map(l => (acertadas.includes(l) ? l : '_')).join(' ')
}

function telaForca(p, comando, prefix, cabecalho, banco) {
    const vidas = '❤️'.repeat(MAX_ERROS - p.erros) + '🖤'.repeat(p.erros)
    return {
        emoji: banco.emoji, titulo: `Forca — ${banco.nome}`,
        intro: `${cabecalho}\n\n${mascara(p.palavra, p.acertadas)}`,
        secoes: [
            { emoji: '🪅', titulo: 'A corda', linhas: [desenharForca(p.erros)] },
            {
                emoji: '📋', titulo: 'Situação', linhas: [
                    `*Dica:* ${p.dica}`,
                    `*Vidas:* ${vidas}`,
                    `*Letras tentadas:* ${p.tentadas.length ? p.tentadas.join(' ') : 'nenhuma ainda'}`
                ]
            }
        ],
        dica: 'Mande uma letra por vez. Se souber a palavra toda, mande ela inteira.',
        proximos: [
            { nome: comando, args: 'a', oque: 'chutar a letra A' },
            { nome: comando, args: 'parar', oque: 'desistir da rodada' }
        ],
        prefix
    }
}

function motorForca(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const banco = D.FORCA[config.tema]
    const chave = chaveDe(from, comando, sender)
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não há forca aberta no seu nome por aqui.', comando, prefix)
        const palavra = p.palavra
        encerrarPartida(chave)
        return {
            emoji: banco.emoji, titulo: `Forca — ${banco.nome} — desistência`,
            intro: `Rodada encerrada. A palavra era *${palavra}*.`,
            secoes: [{ emoji: '🍺', titulo: 'Fica para a próxima', linhas: ['• Ninguém foi enforcado. Dessa vez.'] }],
            proximos: [{ nome: comando, oque: 'começar outra forca' }], prefix
        }
    }

    if (!p) {
        const [palavra, dica] = sorteio(banco.palavras)
        p = abrirPartida(chave, { jogo: 'forca', palavra, dica, acertadas: [], tentadas: [], erros: 0 })
        return telaForca(p, comando, prefix, `Rodada aberta: ${palavra.length} letras.`, banco)
    }

    const chute = norm(args.join(''))
    if (!chute) return telaForca(p, comando, prefix, 'Sua rodada continua de pé.', banco)

    // Chute da palavra inteira.
    if (chute.length > 1) {
        if (chute === p.palavra) {
            encerrarPartida(chave)
            const vitorias = registrarVitoria(from, sender, comando)
            return telaForcaGanhou(p, comando, prefix, banco, vitorias, 'Acertou de primeira, na palavra inteira.')
        }
        p.erros++
        if (p.erros >= MAX_ERROS) return telaForcaPerdeu(p, chave, comando, prefix, banco)
        return telaForca(p, comando, prefix, `❌ Não era *${chute}*. Custou uma vida.`, banco)
    }

    if (!/^[A-Z]$/.test(chute)) {
        return telaForca(p, comando, prefix, 'Isso não é uma letra de A a Z.', banco)
    }
    if (p.tentadas.includes(chute)) {
        return telaForca(p, comando, prefix, `Você já tentou o *${chute}*. Essa não conta.`, banco)
    }

    p.tentadas.push(chute)
    if (p.palavra.includes(chute)) {
        p.acertadas.push(chute)
        const completou = p.palavra.split('').every(l => p.acertadas.includes(l))
        if (completou) {
            encerrarPartida(chave)
            const vitorias = registrarVitoria(from, sender, comando)
            return telaForcaGanhou(p, comando, prefix, banco, vitorias, `Fechou com ${MAX_ERROS - p.erros} vida(s) sobrando.`)
        }
        const quantas = p.palavra.split('').filter(l => l === chute).length
        return telaForca(p, comando, prefix, `✅ Tem *${chute}* sim — ${quantas} vez(es).`, banco)
    }

    p.erros++
    if (p.erros >= MAX_ERROS) return telaForcaPerdeu(p, chave, comando, prefix, banco)
    return telaForca(p, comando, prefix, `❌ Não tem *${chute}*. Restam ${MAX_ERROS - p.erros} vida(s).`, banco)
}

function telaForcaGanhou(p, comando, prefix, banco, vitorias, frase) {
    return {
        emoji: '🎉', titulo: `Forca — ${banco.nome} — você venceu`,
        intro: `A palavra era *${p.palavra}*. ${frase}`,
        secoes: [
            { emoji: '📋', titulo: 'Como terminou', linhas: [`*Erros:* ${p.erros} de ${MAX_ERROS}`, `*Letras tentadas:* ${p.tentadas.length}`] },
            vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
        ].filter(Boolean),
        proximos: [{ nome: comando, oque: 'jogar outra forca' }], prefix
    }
}

function telaForcaPerdeu(p, chave, comando, prefix, banco) {
    const palavra = p.palavra
    const tentadas = p.tentadas.join(' ')
    encerrarPartida(chave)
    return {
        emoji: '💀', titulo: `Forca — ${banco.nome} — acabou`,
        intro: `Seis erros. A palavra era *${palavra}*.`,
        secoes: [
            { emoji: '🪅', titulo: 'A corda', linhas: [desenharForca(MAX_ERROS)] },
            { emoji: '📋', titulo: 'O que você tentou', linhas: [tentadas || 'nada além de palpites de palavra'] }
        ],
        dica: 'Na próxima, comece pelas vogais.',
        proximos: [{ nome: comando, oque: 'tentar de novo' }], prefix
    }
}

// ─── Motor: adivinhar palavra (dica, anagrama, embaralhada) ─────────────────

function revelarParcial(palavra, nivel) {
    // nivel 0 → só a primeira letra; cresce a cada erro.
    const visiveis = Math.min(palavra.length - 1, 1 + nivel)
    return palavra.split('').map((l, i) => (i < visiveis ? l : '_')).join(' ')
}

function motorPalavra(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const banco = D.FORCA[config.tema]
    const chave = chaveDe(from, comando, sender)
    const modo = config.modo || 'dica'   // dica | anagrama | embaralhada
    const tentativasMax = config.tentativas || 4
    let p = obterPartida(chave)

    const rotulo = modo === 'anagrama' ? 'Anagrama' : modo === 'embaralhada' ? 'Palavra embaralhada' : 'Adivinhe pela dica'

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia rodada aberta no seu nome por aqui.', comando, prefix)
        const palavra = p.palavra
        encerrarPartida(chave)
        return {
            emoji: banco.emoji, titulo: `${rotulo} — ${banco.nome} — encerrado`,
            intro: `Você desistiu. A resposta era *${palavra}*.`,
            secoes: [{ emoji: '🍺', titulo: 'Sem drama', linhas: ['• A próxima palavra costuma ser mais fácil.'] }],
            proximos: [{ nome: comando, oque: 'sortear outra palavra' }], prefix
        }
    }

    if (!p) {
        const [palavra, dica] = sorteio(banco.palavras)
        let enunciado
        if (modo === 'dica') enunciado = dica
        else {
            let mistura = embaralhar(palavra.split('')).join(' ')
            if (mistura.replace(/ /g, '') === palavra) mistura = embaralhar(palavra.split('')).join(' ')
            enunciado = modo === 'anagrama' ? `${mistura}\n\nDica: ${dica}` : mistura
        }
        p = abrirPartida(chave, { jogo: 'palavra', palavra, dica, enunciado, erros: 0, tentativasMax })
        return telaPalavra(p, comando, prefix, banco, rotulo, 'Rodada aberta. Mande a palavra que você acha que é.')
    }

    const chute = norm(args.join(' ')).replace(/ /g, '')
    if (!chute) return telaPalavra(p, comando, prefix, banco, rotulo, 'Sua rodada continua de pé.')

    if (chute === p.palavra) {
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: `${rotulo} — ${banco.nome} — acertou`,
            intro: `Era *${p.palavra}* mesmo. ${p.erros === 0 ? 'E de primeira.' : `Você gastou ${p.erros} tentativa(s).`}`,
            secoes: [
                { emoji: '📖', titulo: 'Para lembrar', linhas: [`*${p.palavra}:* ${p.dica}`] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'sortear outra palavra' }], prefix
        }
    }

    p.erros++
    if (p.erros >= p.tentativasMax) {
        const palavra = p.palavra, dica = p.dica
        encerrarPartida(chave)
        return {
            emoji: '💨', titulo: `${rotulo} — ${banco.nome} — acabaram as chances`,
            intro: `A resposta era *${palavra}*.`,
            secoes: [{ emoji: '📖', titulo: 'A dica dizia', linhas: [dica] }],
            dica: 'Nada impede de abrir outra rodada agora mesmo.',
            proximos: [{ nome: comando, oque: 'tentar outra palavra' }], prefix
        }
    }
    return telaPalavra(p, comando, prefix, banco, rotulo, `❌ Não é *${chute}*. Faltam ${p.tentativasMax - p.erros} tentativa(s).`)
}

function telaPalavra(p, comando, prefix, banco, rotulo, cabecalho) {
    return {
        emoji: banco.emoji, titulo: `${rotulo} — ${banco.nome}`,
        intro: `${cabecalho}\n\n${p.enunciado}`,
        secoes: [{
            emoji: '📋', titulo: 'Situação', linhas: [
                `*Letras:* ${p.palavra.length}`,
                `*Começa assim:* ${revelarParcial(p.palavra, p.erros)}`,
                `*Tentativas restantes:* ${p.tentativasMax - p.erros}`
            ]
        }],
        dica: 'Acento não conta: pode escrever sem.',
        proximos: [
            { nome: comando, args: 'palavra', oque: 'mandar seu palpite' },
            { nome: comando, args: 'parar', oque: 'desistir e ver a resposta' }
        ],
        prefix
    }
}

// ─── Motor: completar texto (provérbio, frase, soletrar, trava-língua) ──────

function motorTexto(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const tipo = config.modo   // proverbio | frase | soletrar | travalingua | charada | enigma | oqueeoquee
    const tentativasMax = config.tentativas || 3
    let p = obterPartida(chave)

    const ROTULOS = {
        proverbio: ['Provérbio partido', '🧓'], frase: ['Complete a frase', '📝'],
        soletrar: ['Soletrando', '🔡'], travalingua: ['Trava-língua', '👅'],
        charada: ['Charada', '🤔'], enigma: ['Enigma', '🧩'], oqueeoquee: ['O que é, o que é', '❔']
    }
    const [rotulo, emoji] = ROTULOS[tipo] || ['Desafio de palavra', '🔤']

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia desafio aberto no seu nome por aqui.', comando, prefix)
        const resposta = p.resposta
        encerrarPartida(chave)
        return {
            emoji, titulo: `${rotulo} — encerrado`, intro: `Você passou a vez. A resposta era *${resposta}*.`,
            secoes: [{ emoji: '🍺', titulo: 'Tudo bem', linhas: ['• Tem muito desafio na fila, é só chamar de novo.'] }],
            proximos: [{ nome: comando, oque: 'sortear outro desafio' }], prefix
        }
    }

    if (!p) {
        const item = sortearItemTexto(tipo)
        p = abrirPartida(chave, { jogo: 'texto', tipo, enunciado: item.enunciado, resposta: item.resposta, ajuda: item.ajuda, erros: 0, tentativasMax })
        return telaTexto(p, comando, prefix, rotulo, emoji, 'Desafio na mesa. Mande sua resposta.')
    }

    const chute = norm(args.join(' '))
    if (!chute) return telaTexto(p, comando, prefix, rotulo, emoji, 'Seu desafio continua de pé.')

    const alvo = norm(p.resposta)
    const acertou = tipo === 'travalingua'
        ? chute === alvo
        : (chute === alvo || (alvo.length > 5 && chute.includes(alvo)))

    if (acertou) {
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: `${rotulo} — acertou`,
            intro: `Isso mesmo: *${p.resposta}*.`,
            secoes: [
                { emoji: '📖', titulo: 'O desafio era', linhas: [p.enunciado] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'pegar outro desafio' }], prefix
        }
    }

    p.erros++
    if (p.erros >= p.tentativasMax) {
        const resposta = p.resposta, enunciado = p.enunciado
        encerrarPartida(chave)
        return {
            emoji: '💨', titulo: `${rotulo} — acabaram as chances`,
            intro: `A resposta era *${resposta}*.`,
            secoes: [{ emoji: '📖', titulo: 'O desafio era', linhas: [enunciado] }],
            dica: 'Chama de novo que vem outro na hora.',
            proximos: [{ nome: comando, oque: 'sortear outro desafio' }], prefix
        }
    }
    return telaTexto(p, comando, prefix, rotulo, emoji, `❌ Ainda não. Faltam ${p.tentativasMax - p.erros} tentativa(s).`)
}

function sortearItemTexto(tipo) {
    if (tipo === 'proverbio') {
        const [comeco, fim] = sorteio(D.PROVERBIOS)
        return { enunciado: `${comeco}…`, resposta: fim, ajuda: `Termina com ${fim.split(' ').length} palavra(s).` }
    }
    if (tipo === 'frase') {
        const [texto, resposta] = sorteio(D.FRASES)
        return { enunciado: texto, resposta, ajuda: `A palavra tem ${resposta.length} letras.` }
    }
    if (tipo === 'soletrar') {
        const [palavra, sentido] = sorteio(D.SOLETRAR)
        return { enunciado: `Soletre a palavra que significa: ${sentido}.`, resposta: palavra, ajuda: `Começa com ${palavra[0]} e tem ${palavra.length} letras.` }
    }
    if (tipo === 'travalingua') {
        const frase = sorteio(D.TRAVALINGUAS)
        return { enunciado: `Digite exatamente, sem errar: "${frase}"`, resposta: frase, ajuda: 'Copiar não vale, mas ninguém está olhando.' }
    }
    const banco = tipo === 'charada' ? D.CHARADAS : tipo === 'enigma' ? D.ENIGMAS : D.OQUEEOQUEE
    const [enunciado, resposta] = sorteio(banco)
    return { enunciado, resposta, ajuda: `A resposta tem ${resposta.replace(/ /g, '').length} letras.` }
}

function telaTexto(p, comando, prefix, rotulo, emoji, cabecalho) {
    const linhas = [`*Tentativas restantes:* ${p.tentativasMax - p.erros}`]
    if (p.erros > 0 && p.ajuda) linhas.push(`*Ajuda:* ${p.ajuda}`)
    return {
        emoji, titulo: rotulo,
        intro: `${cabecalho}\n\n${p.enunciado}`,
        secoes: [{ emoji: '📋', titulo: 'Situação', linhas }],
        dica: 'Acento e maiúscula não contam na conferência.',
        proximos: [
            { nome: comando, args: 'sua resposta', oque: 'responder' },
            { nome: comando, args: 'parar', oque: 'desistir e ver a resposta' }
        ],
        prefix
    }
}

// ─── Motor: sinônimo e antônimo ─────────────────────────────────────────────

function motorSinonimo(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const contrario = config.modo === 'antonimo'
    const banco = contrario ? D.ANTONIMOS : D.SINONIMOS
    const rotulo = contrario ? 'Antônimo' : 'Sinônimo'
    const emoji = contrario ? '↔️' : '🟰'
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia rodada aberta no seu nome por aqui.', comando, prefix)
        const aceitas = p.aceitas.join(', ')
        encerrarPartida(chave)
        return {
            emoji, titulo: `${rotulo} — encerrado`,
            intro: `Rodada fechada na palavra *${p.palavra}*. Valiam: ${aceitas}.`,
            secoes: [{ emoji: '📊', titulo: 'Seu resultado', linhas: [`*Palavras aceitas:* ${p.pontos}`] }],
            proximos: [{ nome: comando, oque: 'sortear outra palavra' }], prefix
        }
    }

    if (!p) {
        const [palavra, aceitas] = sorteio(banco)
        const alvo = Math.min(config.alvo || aceitas.length, aceitas.length)
        p = abrirPartida(chave, { jogo: 'sinonimo', palavra, aceitas, achadas: [], pontos: 0, erros: 0, alvo })
        return telaSinonimo(p, comando, prefix, rotulo, emoji, `Palavra da rodada: *${palavra}*.`)
    }

    const chute = norm(args.join(' '))
    if (!chute) return telaSinonimo(p, comando, prefix, rotulo, emoji, 'Sua rodada continua de pé.')

    if (p.achadas.includes(chute)) {
        return telaSinonimo(p, comando, prefix, rotulo, emoji, `Você já mandou *${chute}*. Essa não conta duas vezes.`)
    }
    if (p.aceitas.some(a => norm(a) === chute)) {
        p.achadas.push(chute); p.pontos++
        if (p.pontos >= p.alvo) {
            const palavra = p.palavra, aceitas = p.achadas
            encerrarPartida(chave)
            const vitorias = registrarVitoria(from, sender, comando)
            return {
                emoji: '🎉', titulo: `${rotulo} — lista completa`,
                intro: `Fechou a meta de ${p.alvo} palavra(s) para *${palavra}*: ${aceitas.join(', ')}.`,
                secoes: [vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null].filter(Boolean),
                proximos: [{ nome: comando, oque: 'sortear outra palavra' }], prefix
            }
        }
        return telaSinonimo(p, comando, prefix, rotulo, emoji, `✅ Vale *${chute}*. Faltam ${p.alvo - p.pontos}.`)
    }

    p.erros++
    return telaSinonimo(p, comando, prefix, rotulo, emoji, `❌ *${chute}* não entra na lista desta rodada.`)
}

function telaSinonimo(p, comando, prefix, rotulo, emoji, cabecalho) {
    const pista = p.aceitas
        .filter(a => !p.achadas.includes(norm(a)))
        .map(a => `${a[0]}${'_'.repeat(Math.max(0, a.length - 1))}`)
    return {
        emoji, titulo: `${rotulo} — palavra ${p.palavra}`,
        intro: `${cabecalho}\n\nMande uma palavra por vez.`,
        secoes: [
            { emoji: '📊', titulo: 'Situação', linhas: [`*Encontradas:* ${p.pontos} de ${p.alvo}`, `*Lista completa tem:* ${p.aceitas.length}`, `*Erros:* ${p.erros}`] },
            { emoji: '🔎', titulo: 'Ainda faltam', linhas: pista.map(x => `• ${x}`) }
        ],
        dica: 'A lista aceita várias respostas. Vá mandando uma de cada vez.',
        proximos: [
            { nome: comando, args: 'palavra', oque: 'mandar um palpite' },
            { nome: comando, args: 'parar', oque: 'encerrar e ver a lista' }
        ],
        prefix
    }
}

// ─── Motor: rima ────────────────────────────────────────────────────────────

function rimaCombina(a, b) {
    if (a === b || a.length < 3 || b.length < 3) return false
    return a.slice(-3) === b.slice(-3) || (a.slice(-2) === b.slice(-2) && a.slice(-4, -2) === b.slice(-4, -2))
}

function motorRima(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const alvoRimas = config.qtd || 3
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia rodada de rima aberta por aqui.', comando, prefix)
        const feitas = p.rimas.length
        encerrarPartida(chave)
        return {
            emoji: '🎤', titulo: 'Batalha de rima — encerrada',
            intro: `Você fechou com ${feitas} rima(s) para *${p.palavra}*.`,
            secoes: [{ emoji: '📜', titulo: 'Suas rimas', linhas: p.rimas.length ? p.rimas.map(r => `• ${r}`) : ['• nenhuma desta vez'] }],
            proximos: [{ nome: comando, oque: 'pegar outra palavra' }], prefix
        }
    }

    if (!p) {
        const banco = D.FORCA[config.tema].palavras.map(x => x[0])
        const palavra = sorteio(banco)
        p = abrirPartida(chave, { jogo: 'rima', palavra, rimas: [], erros: 0, alvoRimas })
        return telaRima(p, comando, prefix, `Rime com *${palavra}*.`)
    }

    const chute = norm(args.join(' ')).replace(/ /g, '')
    if (!chute) return telaRima(p, comando, prefix, 'Sua rodada continua de pé.')
    if (p.rimas.includes(chute)) return telaRima(p, comando, prefix, `Você já usou *${chute}*.`)

    if (rimaCombina(chute, p.palavra)) {
        p.rimas.push(chute)
        if (p.rimas.length >= p.alvoRimas) {
            const palavra = p.palavra, rimas = p.rimas
            encerrarPartida(chave)
            const vitorias = registrarVitoria(from, sender, comando)
            return {
                emoji: '🎉', titulo: 'Batalha de rima — você fechou',
                intro: `Três rimas para *${palavra}* e a galera veio abaixo!`,
                secoes: [
                    { emoji: '📜', titulo: 'Suas rimas', linhas: rimas.map(r => `• ${r}`) },
                    vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
                ].filter(Boolean),
                proximos: [{ nome: comando, oque: 'pegar outra palavra' }], prefix
            }
        }
        return telaRima(p, comando, prefix, `✅ *${chute}* rima. Faltam ${p.alvoRimas - p.rimas.length}.`)
    }
    p.erros++
    return telaRima(p, comando, prefix, `❌ *${chute}* não fecha o som de *${p.palavra}*.`)
}

function telaRima(p, comando, prefix, cabecalho) {
    return {
        emoji: '🎤', titulo: `Batalha de rima — ${p.palavra}`,
        intro: `${cabecalho}\n\nO final do som precisa bater.`,
        secoes: [
            { emoji: '📊', titulo: 'Situação', linhas: [`*Rimas aceitas:* ${p.rimas.length} de ${p.alvoRimas}`, `*Recusadas:* ${p.erros}`] },
            p.rimas.length ? { emoji: '📜', titulo: 'Já valeram', linhas: p.rimas.map(r => `• ${r}`) } : null
        ].filter(Boolean),
        dica: 'Palavra inventada até passa, se o som fechar direito.',
        proximos: [
            { nome: comando, args: 'palavra', oque: 'mandar uma rima' },
            { nome: comando, args: 'parar', oque: 'encerrar a rodada' }
        ],
        prefix
    }
}

// ─── Motor: stop / adedonha ─────────────────────────────────────────────────

function motorStop(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const quantas = config.qtd || 5
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia rodada de stop aberta por aqui.', comando, prefix)
        const letra = p.letra
        encerrarPartida(chave)
        return {
            emoji: '🛑', titulo: 'Stop — rodada cancelada',
            intro: `Mesa limpa. A letra era *${letra}*.`,
            secoes: [{ emoji: '🍺', titulo: 'Tudo bem', linhas: ['• Chame de novo que sai outra letra.'] }],
            proximos: [{ nome: comando, oque: 'sortear outra letra' }], prefix
        }
    }

    if (!p) {
        const letra = sorteio('ABCDEFGIJLMNOPRSTUV'.split(''))
        const categorias = sortearVarios(D.STOP_CATEGORIAS, quantas)
        p = abrirPartida(chave, { jogo: 'stop', letra, categorias })
        return {
            emoji: '🛑', titulo: 'Stop — letra sorteada',
            intro: `A letra da rodada é *${letra}*.\n\nResponda todas as categorias de uma vez, separadas por vírgula, na ordem.`,
            secoes: [{ emoji: '📋', titulo: 'Categorias', linhas: p.categorias.map((c, i) => `${i + 1}. ${c}`) }],
            dica: 'Quem responde primeiro grita stop; aqui quem conta os pontos sou eu.',
            proximos: [
                { nome: comando, args: p.categorias.map(() => letra.toLowerCase() + '...').join(', '), oque: 'mandar suas respostas' },
                { nome: comando, args: 'parar', oque: 'cancelar a rodada' }
            ],
            prefix
        }
    }

    const respostas = args.join(' ').split(',').map(r => r.trim()).filter(Boolean)
    if (!respostas.length) {
        return {
            emoji: '🛑', titulo: `Stop — letra ${p.letra}`,
            intro: 'A rodada continua aberta. Mande as respostas separadas por vírgula.',
            secoes: [{ emoji: '📋', titulo: 'Categorias', linhas: p.categorias.map((c, i) => `${i + 1}. ${c}`) }],
            proximos: [{ nome: comando, args: 'parar', oque: 'cancelar a rodada' }], prefix
        }
    }

    const vistas = new Set()
    let pontos = 0
    const detalhe = p.categorias.map((cat, i) => {
        const r = respostas[i]
        if (!r) return `• ${cat}: em branco — 0`
        const n = norm(r)
        if (!n.startsWith(p.letra)) return `• ${cat}: ${r} — não começa com ${p.letra}, 0`
        if (vistas.has(n)) return `• ${cat}: ${r} — repetida, 0`
        vistas.add(n); pontos += 10
        return `• ${cat}: ${r} — 10`
    })
    const letra = p.letra
    encerrarPartida(chave)
    const maximo = p.categorias.length * 10
    const vitorias = pontos === maximo ? registrarVitoria(from, sender, comando) : 0
    return {
        emoji: '🛑', titulo: `Stop — resultado da letra ${letra}`,
        intro: `Você fez *${pontos} de ${maximo}* pontos.`,
        secoes: [
            { emoji: '📊', titulo: 'Conferência', linhas: detalhe },
            vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Rodadas perfeitas suas:* ${vitorias}`] } : null
        ].filter(Boolean),
        dica: 'Mostre o resultado no grupo e desafie quem reclamar.',
        proximos: [{ nome: comando, oque: 'sortear outra letra' }], prefix
    }
}

// ─── Motor: caça-palavras em texto ──────────────────────────────────────────

function montarCaca(tema, lado, quantas) {
    const palavras = sortearVarios(D.FORCA[tema].palavras.map(x => x[0]).filter(p => p.length <= lado), quantas)
    const grade = Array.from({ length: lado }, () => Array(lado).fill(''))
    const colocadas = []
    for (const palavra of palavras) {
        for (let tentativa = 0; tentativa < 40; tentativa++) {
            const horizontal = Math.random() < 0.5
            const limite = lado - palavra.length
            const linha = Math.floor(Math.random() * (horizontal ? lado : limite + 1))
            const coluna = Math.floor(Math.random() * (horizontal ? limite + 1 : lado))
            let cabe = true
            for (let i = 0; i < palavra.length; i++) {
                const l = horizontal ? linha : linha + i
                const c = horizontal ? coluna + i : coluna
                if (grade[l][c] && grade[l][c] !== palavra[i]) { cabe = false; break }
            }
            if (!cabe) continue
            for (let i = 0; i < palavra.length; i++) {
                const l = horizontal ? linha : linha + i
                const c = horizontal ? coluna + i : coluna
                grade[l][c] = palavra[i]
            }
            colocadas.push(palavra)
            break
        }
    }
    const alfabeto = 'ABCDEFGHIJLMNOPQRSTUVXZ'
    for (let l = 0; l < lado; l++) {
        for (let c = 0; c < lado; c++) {
            if (!grade[l][c]) grade[l][c] = alfabeto[Math.floor(Math.random() * alfabeto.length)]
        }
    }
    return { grade, palavras: colocadas }
}

function motorCaca(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const banco = D.FORCA[config.tema]
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia caça-palavras aberto por aqui.', comando, prefix)
        const faltavam = p.palavras.filter(x => !p.achadas.includes(x))
        encerrarPartida(chave)
        return {
            emoji: '🔎', titulo: `Caça-palavras — ${banco.nome} — encerrado`,
            intro: `Você achou ${p.achadas.length} de ${p.palavras.length}.`,
            secoes: [{ emoji: '📖', titulo: 'Estavam escondidas', linhas: faltavam.map(x => `• ${x}`) }],
            proximos: [{ nome: comando, oque: 'montar outra grade' }], prefix
        }
    }

    if (!p) {
        const { grade, palavras } = montarCaca(config.tema, config.lado || 9, config.qtd || 4)
        p = abrirPartida(chave, { jogo: 'caca', grade, palavras, achadas: [] })
        return telaCaca(p, comando, prefix, banco, 'Grade montada. Ache as palavras na horizontal e na vertical.')
    }

    const chute = norm(args.join(' ')).replace(/ /g, '')
    if (!chute) return telaCaca(p, comando, prefix, banco, 'Sua grade continua aberta.')
    if (p.achadas.includes(chute)) return telaCaca(p, comando, prefix, banco, `Você já achou *${chute}*.`)

    if (p.palavras.includes(chute)) {
        p.achadas.push(chute)
        if (p.achadas.length >= p.palavras.length) {
            encerrarPartida(chave)
            const vitorias = registrarVitoria(from, sender, comando)
            return {
                emoji: '🎉', titulo: `Caça-palavras — ${banco.nome} — completo`,
                intro: `Você achou todas: ${p.palavras.join(', ')}.`,
                secoes: [vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null].filter(Boolean),
                proximos: [{ nome: comando, oque: 'montar outra grade' }], prefix
            }
        }
        return telaCaca(p, comando, prefix, banco, `✅ *${chute}* estava lá. Faltam ${p.palavras.length - p.achadas.length}.`)
    }
    return telaCaca(p, comando, prefix, banco, `❌ *${chute}* não está escondida nesta grade.`)
}

function telaCaca(p, comando, prefix, banco, cabecalho) {
    const grade = p.grade.map(linha => linha.join(' ')).join('\n')
    const pistas = p.palavras.map(x => (p.achadas.includes(x)
        ? `• ${x} — achada`
        : `• ${x[0]}${'_'.repeat(x.length - 1)} — ${x.length} letras`))
    return {
        emoji: '🔎', titulo: `Caça-palavras — ${banco.nome}`,
        intro: `${cabecalho}\n\n${grade}`,
        secoes: [
            { emoji: '📋', titulo: 'O que procurar', linhas: pistas },
            { emoji: '📊', titulo: 'Situação', linhas: [`*Achadas:* ${p.achadas.length} de ${p.palavras.length}`] }
        ],
        dica: 'Só horizontal e vertical, sempre da esquerda para a direita ou de cima para baixo.',
        proximos: [
            { nome: comando, args: 'palavra', oque: 'dizer uma palavra que achou' },
            { nome: comando, args: 'parar', oque: 'encerrar e ver a resposta' }
        ],
        prefix
    }
}

// ─── Motores de brincadeira sem estado ──────────────────────────────────────

const BANCOS_SORTEIO = {
    verdades: D.VERDADES, desafios: D.DESAFIOS, eununca: D.EU_NUNCA,
    maisprovavel: D.MAIS_PROVAVEL, confissoes: D.CONFISSOES, relampago: D.DESAFIO_RELAMPAGO,
    historia: D.HISTORIA_INICIOS, juri: D.JURI_CASOS, sussurro: D.SUSSURRO_FRASES,
    prendas: D.PRENDAS, travalinguas: D.TRAVALINGUAS, duasverdades: D.DUAS_VERDADES_TEMAS,
    verdadeoudesafio: [
        ...D.VERDADES.map(v => `Verdade — ${v}`),
        ...D.DESAFIOS.map(d => `Desafio — ${d}`)
    ]
}

function motorSorteio(config, ctx) {
    const { comando, prefix } = ctx
    const banco = BANCOS_SORTEIO[config.banco]
    const itens = sortearVarios(banco, config.qtd || 1)
    return {
        emoji: config.emoji || '🎲', titulo: config.titulo,
        intro: config.intro,
        secoes: [
            { emoji: config.emojiLista || '📜', titulo: config.rotulo || 'Sorteado agora', linhas: itens.map(i => `• ${i}`) },
            { emoji: '📖', titulo: 'Como joga', linhas: (config.regras || []).map(r => `• ${r}`) }
        ],
        dica: config.dica,
        proximos: [{ nome: comando, oque: 'sortear de novo' }], prefix
    }
}

function motorVocePrefere(config, ctx) {
    const { comando, prefix } = ctx
    // config.banco escolhe um tema (programação, dilemas morais); sem ele, o banco geral.
    const tema = config.banco && D.VOCE_PREFERE_TEMAS[config.banco]
    const pares = sortearVarios(tema ? tema.pares : D.VOCE_PREFERE, config.qtd || 1)
    const linhas = pares.map(([a, b], i) => `${i + 1}. ${a} *ou* ${b}?`)
    return {
        emoji: '🤷', titulo: config.titulo,
        intro: 'Não vale responder "depende". Escolha um lado e defenda.',
        secoes: [
            { emoji: '⚖️', titulo: 'A escolha', linhas },
            { emoji: '📖', titulo: 'Como joga', linhas: ['• Todo mundo responde no grupo.', '• Quem ficar na minoria explica o porquê.', '• Quem enrolar paga uma prenda.'] }
        ],
        dica: 'Vale abrir votação de figurinha para contar os votos.',
        proximos: [{ nome: comando, oque: 'sortear outra escolha' }], prefix
    }
}

function motorMimica(config, ctx) {
    const { comando, prefix } = ctx
    const banco = D.MIMICA[config.tema]
    const itens = sortearVarios(banco.itens, config.qtd || 3)
    return {
        emoji: banco.emoji, titulo: `Mímica — ${banco.nome}`,
        intro: 'Sorteei o que você tem de representar. Mostre só para quem vai atuar.',
        secoes: [
            { emoji: '🎭', titulo: 'Sua vez de atuar', linhas: itens.map((i, n) => `${n + 1}. ${i}`) },
            { emoji: '📖', titulo: 'Como joga', linhas: ['• Grave um vídeo curto ou faça na chamada.', '• Nada de falar nem de escrever.', '• Quem acertar primeiro sorteia o próximo.'] }
        ],
        dica: 'Trinta segundos por item é o limite justo.',
        proximos: [{ nome: comando, oque: 'sortear outros itens' }], prefix
    }
}

function motorEleicao(config, ctx) {
    const { comando, prefix } = ctx
    const cargos = sortearVarios(D.ELEICAO_CARGOS, config.qtd || 3)
    return {
        emoji: '🗳️', titulo: config.titulo,
        intro: 'Abriu a urna da comunidade. Cada cargo precisa de um nome do grupo.',
        secoes: [
            { emoji: '📜', titulo: 'Cargos em disputa', linhas: cargos.map(([c, o]) => `• *${c}* — ${o}`) },
            { emoji: '📖', titulo: 'Como joga', linhas: ['• Cada pessoa indica um nome por cargo.', '• Quem tiver mais indicações assume.', '• O eleito não pode recusar o cargo.'] }
        ],
        dica: 'Marque os eleitos na mensagem para ninguém fugir da posse.',
        proximos: [{ nome: comando, oque: 'sortear outros cargos' }], prefix
    }
}

function motorRanking(config, ctx) {
    const { comando, prefix } = ctx
    const titulos = sortearVarios(D.RANKING_TITULOS, config.qtd || 3)
    return {
        emoji: '🏅', titulo: config.titulo,
        intro: 'Ranking de brincadeira: ninguém leva a mal, todo mundo leva a fama.',
        secoes: [
            { emoji: '📊', titulo: 'Categorias da rodada', linhas: titulos.map(([t, o]) => `• *${t}* — ${o}`) },
            { emoji: '📖', titulo: 'Como joga', linhas: ['• Cada um vota em uma pessoa por categoria.', '• Vale justificar em uma frase.', '• Quem vencer três categorias vira lenda do grupo.'] }
        ],
        dica: 'Ranking é escopado neste grupo. Ninguém compara com grupo de fora.',
        proximos: [{ nome: comando, oque: 'sortear outras categorias' }], prefix
    }
}

function motorProibida(config, ctx) {
    const { comando, prefix } = ctx
    const itens = sortearVarios(D.PALAVRA_PROIBIDA, config.qtd || 2)
    const secoes = itens.map(([alvo, proibidas]) => ({
        emoji: '🚫', titulo: `Explique: ${alvo}`, linhas: [`*Sem poder dizer:* ${proibidas.join(', ')}`]
    }))
    return {
        emoji: '🤐', titulo: config.titulo,
        intro: 'Faça o grupo adivinhar a palavra sem usar nenhuma das proibidas.',
        secoes: [
            ...secoes,
            { emoji: '📖', titulo: 'Como joga', linhas: ['• Um minuto por palavra.', '• Falou a proibida, perdeu a vez.', '• Mímica não vale, aqui é só na conversa.'] }
        ],
        dica: 'Quem estiver explicando não pode mandar o comando de novo antes da vez acabar.',
        proximos: [{ nome: comando, oque: 'sortear outras palavras' }], prefix
    }
}

// ─── Motor: adivinhar o número ──────────────────────────────────────────────

function motorNumero(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const maximo = config.max || 100
    const limite = config.tentativas || Math.ceil(Math.log2(maximo)) + 2
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia número sorteado no seu nome por aqui.', comando, prefix)
        const alvo = p.alvo
        encerrarPartida(chave)
        return {
            emoji: '🔢', titulo: 'Adivinhe o número — encerrado',
            intro: `Você desistiu. O número era *${alvo}*.`,
            secoes: [{ emoji: '🍺', titulo: 'Fica para a próxima', linhas: ['• Da próxima vez comece pelo meio da faixa.'] }],
            proximos: [{ nome: comando, oque: 'sortear outro número' }], prefix
        }
    }

    if (!p) {
        const alvo = 1 + Math.floor(Math.random() * maximo)
        p = abrirPartida(chave, { jogo: 'numero', alvo, maximo, tentativas: 0, limite, piso: 1, teto: maximo })
        return telaNumero(p, comando, prefix, `Pensei num número de 1 a ${maximo}. Descubra qual.`)
    }

    const bruto = norm(args[0])
    const palpite = Number(bruto)
    if (!bruto || !Number.isFinite(palpite) || palpite < 1 || palpite > p.maximo) {
        return telaNumero(p, comando, prefix, `Mande um número inteiro de 1 a ${p.maximo}.`)
    }

    p.tentativas++
    if (palpite === p.alvo) {
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: 'Adivinhe o número — acertou',
            intro: `Era *${p.alvo}* mesmo, em ${p.tentativas} tentativa(s).`,
            secoes: [
                { emoji: '📊', titulo: 'Desempenho', linhas: [`*Limite da rodada:* ${p.limite} tentativas`, `*Você usou:* ${p.tentativas}`] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'jogar de novo' }], prefix
        }
    }

    if (palpite < p.alvo) p.piso = Math.max(p.piso, palpite + 1)
    else p.teto = Math.min(p.teto, palpite - 1)

    if (p.tentativas >= p.limite) {
        const alvo = p.alvo
        encerrarPartida(chave)
        return {
            emoji: '💨', titulo: 'Adivinhe o número — acabaram as chances',
            intro: `O número era *${alvo}*. Ficou perto?`,
            secoes: [{ emoji: '📊', titulo: 'Resumo', linhas: [`*Tentativas usadas:* ${p.tentativas}`] }],
            dica: 'Cortar a faixa no meio a cada palpite resolve qualquer faixa em poucas rodadas.',
            proximos: [{ nome: comando, oque: 'tentar outra rodada' }], prefix
        }
    }
    const direcao = palpite < p.alvo ? 'É *maior* que isso.' : 'É *menor* que isso.'
    return telaNumero(p, comando, prefix, `${palpite}? ${direcao}`)
}

function telaNumero(p, comando, prefix, cabecalho) {
    return {
        emoji: '🔢', titulo: `Adivinhe o número — 1 a ${p.maximo}`,
        intro: cabecalho,
        secoes: [{
            emoji: '📊', titulo: 'Situação', linhas: [
                `*Faixa que sobrou:* de ${p.piso} a ${p.teto}`,
                `*Tentativas:* ${p.tentativas} de ${p.limite}`
            ]
        }],
        dica: 'Chute sempre o meio da faixa que sobrou.',
        proximos: [
            { nome: comando, args: String(Math.ceil((p.piso + p.teto) / 2)), oque: 'chutar o meio da faixa' },
            { nome: comando, args: 'parar', oque: 'desistir e ver o número' }
        ],
        prefix
    }
}

// ─── Motor: jogo da velha contra o bot ──────────────────────────────────────

const LINHAS_VELHA = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]

function vencedorVelha(b) {
    for (const [x, y, z] of LINHAS_VELHA) {
        if (b[x] && b[x] === b[y] && b[y] === b[z]) return b[x]
    }
    return b.every(c => c) ? 'E' : null
}

function minimax(b, vez, profundidade) {
    const fim = vencedorVelha(b)
    if (fim === 'O') return { nota: 10 - profundidade }
    if (fim === 'X') return { nota: profundidade - 10 }
    if (fim === 'E') return { nota: 0 }
    let melhor = null
    for (let i = 0; i < 9; i++) {
        if (b[i]) continue
        b[i] = vez
        const { nota } = minimax(b, vez === 'O' ? 'X' : 'O', profundidade + 1)
        b[i] = ''
        if (!melhor || (vez === 'O' ? nota > melhor.nota : nota < melhor.nota)) melhor = { nota, casa: i }
    }
    return melhor || { nota: 0 }
}

function jogadaDoBot(b, dificuldade) {
    const livres = b.map((c, i) => (c ? -1 : i)).filter(i => i >= 0)
    if (!livres.length) return -1
    if (dificuldade === 'facil') {
        // Fecha o jogo se puder; no resto, joga no acaso.
        for (const i of livres) { b[i] = 'O'; const v = vencedorVelha(b); b[i] = ''; if (v === 'O') return i }
        return sorteio(livres)
    }
    if (dificuldade === 'medio' && Math.random() < 0.35) return sorteio(livres)
    return minimax([...b], 'O', 0).casa
}

function desenharVelha(b) {
    const cel = i => (b[i] === 'X' ? '❌' : b[i] === 'O' ? '⭕' : NUM_EMOJI[i + 1])
    return [0, 3, 6].map(l => [cel(l), cel(l + 1), cel(l + 2)].join(' ')).join('\n')
}

function motorVelha(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const dificuldade = config.dificuldade || 'medio'
    const NOMES = { facil: 'moleza', medio: 'na medida', impossivel: 'impossível' }
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia jogo da velha aberto por aqui.', comando, prefix)
        encerrarPartida(chave)
        return {
            emoji: '🎯', titulo: 'Jogo da velha — abandonado',
            intro: 'Você deixou o tabuleiro na mesa. Considero empate por desistência.',
            secoes: [{ emoji: '🎲', titulo: 'Como estava', linhas: [desenharVelha(p.tabuleiro)] }],
            proximos: [{ nome: comando, oque: 'começar outra partida' }], prefix
        }
    }

    if (!p) {
        p = abrirPartida(chave, { jogo: 'velha', tabuleiro: Array(9).fill(''), dificuldade, jogadas: 0 })
        return telaVelha(p, comando, prefix, `Tabuleiro na mesa, dificuldade *${NOMES[dificuldade]}*. Você é o ❌ e começa.`)
    }

    const casa = Number(norm(args[0]))
    if (!Number.isInteger(casa) || casa < 1 || casa > 9) {
        return telaVelha(p, comando, prefix, 'Escolha uma casa de 1 a 9, pelo número que aparece no tabuleiro.')
    }
    if (p.tabuleiro[casa - 1]) {
        return telaVelha(p, comando, prefix, `A casa ${casa} já está ocupada. Escolha outra.`)
    }

    p.tabuleiro[casa - 1] = 'X'
    p.jogadas++
    let fim = vencedorVelha(p.tabuleiro)
    let jogadaBot = -1
    if (!fim) {
        jogadaBot = jogadaDoBot(p.tabuleiro, p.dificuldade)
        if (jogadaBot >= 0) p.tabuleiro[jogadaBot] = 'O'
        fim = vencedorVelha(p.tabuleiro)
    }

    if (fim) {
        const tabuleiro = [...p.tabuleiro]
        encerrarPartida(chave)
        const ganhou = fim === 'X'
        const vitorias = ganhou ? registrarVitoria(from, sender, comando) : 0
        const titulo = ganhou ? 'Jogo da velha — você venceu' : fim === 'O' ? 'Jogo da velha — o bot venceu' : 'Jogo da velha — deu velha'
        const intro = ganhou ? 'Você fechou a linha antes de mim. Mérito seu.'
            : fim === 'O' ? `Fechei a linha na casa ${jogadaBot + 1}. Foi bom enquanto durou.`
                : 'Ninguém fechou linha. Empate honesto.'
        return {
            emoji: ganhou ? '🎉' : fim === 'O' ? '🤖' : '🤝', titulo,
            intro,
            secoes: [
                { emoji: '🎲', titulo: 'Tabuleiro final', linhas: [desenharVelha(tabuleiro)] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'jogar de novo' }], prefix
        }
    }

    return telaVelha(p, comando, prefix, `Você marcou a casa ${casa}; eu marquei a ${jogadaBot + 1}.`)
}

function telaVelha(p, comando, prefix, cabecalho) {
    const livres = p.tabuleiro.map((c, i) => (c ? null : i + 1)).filter(Boolean)
    return {
        emoji: '🎯', titulo: 'Jogo da velha',
        intro: `${cabecalho}\n\n${desenharVelha(p.tabuleiro)}`,
        secoes: [{
            emoji: '📋', titulo: 'Situação', linhas: [
                `*Você:* ❌   *Bot:* ⭕`,
                `*Casas livres:* ${livres.join(', ')}`
            ]
        }],
        dica: 'O centro vale mais que qualquer canto.',
        proximos: [
            { nome: comando, args: String(livres[0]), oque: 'marcar essa casa' },
            { nome: comando, args: 'parar', oque: 'abandonar a partida' }
        ],
        prefix
    }
}

// ─── Motor: pedra, papel e tesoura ──────────────────────────────────────────

const JOKENPO = { PEDRA: '🪨', PAPEL: '📄', TESOURA: '✂️' }
const GANHA_DE = { PEDRA: 'TESOURA', PAPEL: 'PEDRA', TESOURA: 'PAPEL' }

function motorJokenpo(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const alvo = config.vitorias || 1
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia disputa aberta por aqui.', comando, prefix)
        const placar = `${p.suas} a ${p.minhas}`
        encerrarPartida(chave)
        return {
            emoji: '✋', titulo: 'Pedra, papel e tesoura — encerrado',
            intro: `Disputa cancelada no placar de ${placar}.`,
            secoes: [{ emoji: '🍺', titulo: 'Sem ressentimento', linhas: ['• Chame de novo quando quiser revanche.'] }],
            proximos: [{ nome: comando, oque: 'começar outra disputa' }], prefix
        }
    }

    if (!p) p = abrirPartida(chave, { jogo: 'jokenpo', suas: 0, minhas: 0, rodada: 0, alvo })

    const escolha = norm(args.join('')).replace(/S$/, '')
    const nomes = Object.keys(JOKENPO)
    const minha = sorteio(nomes)
    if (!nomes.includes(escolha)) {
        return {
            emoji: '✋', titulo: alvo > 1 ? `Pedra, papel e tesoura — melhor de ${alvo * 2 - 1}` : 'Pedra, papel e tesoura',
            intro: alvo > 1
                ? `Vence quem chegar a ${alvo} vitória(s). Placar atual: você ${p.suas}, eu ${p.minhas}.`
                : 'Escolha sua jogada e resolvemos numa rodada só.',
            secoes: [{ emoji: '🖐️', titulo: 'Opções', linhas: nomes.map(n => `• ${JOKENPO[n]} ${n.toLowerCase()}`) }],
            dica: 'Quem sempre começa com pedra é lido em duas rodadas.',
            proximos: [
                { nome: comando, args: 'pedra', oque: 'jogar pedra' },
                { nome: comando, args: 'parar', oque: 'encerrar a disputa' }
            ],
            prefix
        }
    }

    p.rodada++
    let resultado
    if (escolha === minha) resultado = 'empate'
    else if (GANHA_DE[escolha] === minha) { resultado = 'vitoria'; p.suas++ }
    else { resultado = 'derrota'; p.minhas++ }

    const linhaRodada = `${JOKENPO[escolha]} ${escolha.toLowerCase()}  contra  ${JOKENPO[minha]} ${minha.toLowerCase()}`
    const fim = p.suas >= p.alvo || p.minhas >= p.alvo
    if (!fim) {
        return {
            emoji: '✋', titulo: `Pedra, papel e tesoura — rodada ${p.rodada}`,
            intro: `${linhaRodada}\n\n${resultado === 'empate' ? 'Empatou, joga de novo.' : resultado === 'vitoria' ? 'Ponto seu.' : 'Ponto meu.'}`,
            secoes: [{ emoji: '📊', titulo: 'Placar', linhas: [`*Você:* ${p.suas}`, `*Bot:* ${p.minhas}`, `*Precisa de:* ${p.alvo} vitórias`] }],
            proximos: [
                { nome: comando, args: 'tesoura', oque: 'jogar a próxima' },
                { nome: comando, args: 'parar', oque: 'encerrar a disputa' }
            ],
            prefix
        }
    }

    const ganhou = p.suas >= p.alvo
    const placar = `${p.suas} a ${p.minhas}`
    encerrarPartida(chave)
    const vitorias = ganhou ? registrarVitoria(from, sender, comando) : 0
    return {
        emoji: ganhou ? '🎉' : '🤖', titulo: ganhou ? 'Pedra, papel e tesoura — você venceu' : 'Pedra, papel e tesoura — o bot venceu',
        intro: `${linhaRodada}\n\nFechou em *${placar}*.`,
        secoes: [vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null].filter(Boolean),
        proximos: [{ nome: comando, oque: 'pedir revanche' }], prefix
    }
}

// ─── Motores de sorte ───────────────────────────────────────────────────────

function motorDados(config, ctx) {
    const { comando, args, prefix } = ctx
    const faces = config.faces || 6
    const pedido = Number(norm(args[0]))
    const quantos = Math.min(Math.max(Number.isFinite(pedido) && pedido > 0 ? pedido : (config.qtd || 2), 1), 10)
    const rolagens = Array.from({ length: quantos }, () => 1 + Math.floor(Math.random() * faces))
    const soma = rolagens.reduce((a, b) => a + b, 0)
    return {
        emoji: '🎲', titulo: config.titulo,
        intro: `Rolei ${quantos} dado(s) de ${faces} faces.`,
        secoes: [
            { emoji: '🎯', titulo: 'Resultado', linhas: [rolagens.map(r => (faces === 6 ? ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][r - 1] + ' ' + r : String(r))).join('   '), `*Soma:* ${soma}`, `*Maior:* ${Math.max(...rolagens)}`] },
            { emoji: '📖', titulo: 'Como usar', linhas: ['• Serve para decidir a vez, a dupla ou a prenda.', '• Pode pedir de 1 a 10 dados por rolagem.'] }
        ],
        dica: `Mande o comando com um número para escolher quantos dados rolar.`,
        proximos: [{ nome: comando, args: '3', oque: 'rolar três dados' }], prefix
    }
}

function motorRoleta(config, ctx) {
    const { comando, prefix } = ctx
    const prendas = sortearVarios(D.PRENDAS, config.qtd || 3)
    const escolhida = prendas[0]
    return {
        emoji: '🎡', titulo: config.titulo,
        intro: `A roleta parou em: *${escolhida}*.`,
        secoes: [
            { emoji: '📜', titulo: 'Também estavam na roleta', linhas: prendas.slice(1).map(p => `• ${p}`) },
            { emoji: '📖', titulo: 'Como joga', linhas: ['• Quem chamou o comando cumpre a prenda sorteada.', '• Cumpriu, passa a roleta para a próxima pessoa.', '• Fugiu, cumpre duas na próxima rodada.'] }
        ],
        dica: 'Prenda aqui é brincadeira: nada que envolva dinheiro do jogo entra na roleta.',
        proximos: [{ nome: comando, oque: 'girar de novo' }], prefix
    }
}

// ─── Motor: sequência de memória ────────────────────────────────────────────

function motorMemoria(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const simbolos = config.simbolos || ['1', '2', '3', '4', '5', '6']
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia sequência aberta por aqui.', comando, prefix)
        const nivel = p.sequencia.length - 1
        encerrarPartida(chave)
        return {
            emoji: '🧠', titulo: 'Sequência de memória — encerrada',
            intro: `Você parou no nível ${nivel}.`,
            secoes: [{ emoji: '📖', titulo: 'A sequência era', linhas: [p.sequencia.join(' ')] }],
            proximos: [{ nome: comando, oque: 'começar outra sequência' }], prefix
        }
    }

    if (!p) {
        p = abrirPartida(chave, { jogo: 'memoria', simbolos, sequencia: [sorteio(simbolos)], nivel: 1 })
        return telaMemoria(p, comando, prefix, 'Decore a sequência e repita ela inteira, separada por espaço.')
    }

    const resposta = norm(args.join(' ')).replace(/\s+/g, '')
    if (!resposta) return telaMemoria(p, comando, prefix, 'Sua sequência continua de pé.')

    if (resposta === p.sequencia.join('')) {
        p.sequencia.push(sorteio(p.simbolos))
        p.nivel = p.sequencia.length
        if (p.nivel > (config.nivelMaximo || 9)) {
            const nivel = p.nivel - 1
            encerrarPartida(chave)
            const vitorias = registrarVitoria(from, sender, comando)
            return {
                emoji: '🎉', titulo: 'Sequência de memória — você zerou',
                intro: `Chegou ao nível ${nivel} sem errar. Memória de elefante.`,
                secoes: [vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null].filter(Boolean),
                proximos: [{ nome: comando, oque: 'começar outra sequência' }], prefix
            }
        }
        return telaMemoria(p, comando, prefix, `✅ Certo. Agora são ${p.sequencia.length} símbolos.`)
    }

    const certa = p.sequencia.join(' ')
    const nivel = p.sequencia.length - 1
    encerrarPartida(chave)
    return {
        emoji: '💨', titulo: 'Sequência de memória — errou',
        intro: `Você mandou ${args.join(' ')}. A sequência era *${certa}*.`,
        secoes: [{ emoji: '📊', titulo: 'Seu resultado', linhas: [`*Nível alcançado:* ${nivel}`] }],
        dica: 'Ler em voz alta ajuda mais do que olhar de novo.',
        proximos: [{ nome: comando, oque: 'tentar outra sequência' }], prefix
    }
}

function telaMemoria(p, comando, prefix, cabecalho) {
    return {
        emoji: '🧠', titulo: `Sequência de memória — nível ${p.sequencia.length}`,
        intro: `${cabecalho}\n\n${p.sequencia.join('  ')}`,
        secoes: [{ emoji: '📋', titulo: 'Situação', linhas: [`*Tamanho atual:* ${p.sequencia.length}`, `*Símbolos possíveis:* ${p.simbolos.join(' ')}`] }],
        dica: 'Não role a conversa para trás. Vale o que a memória segurar.',
        proximos: [
            { nome: comando, args: p.sequencia.join(' '), oque: 'repetir a sequência' },
            { nome: comando, args: 'parar', oque: 'encerrar' }
        ],
        prefix
    }
}

// ─── Motor: sudoku 4 por 4 ──────────────────────────────────────────────────

function gerarSudoku(buracos) {
    const base = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]]
    const troca = embaralhar([1, 2, 3, 4])
    let sol = base.map(l => l.map(v => troca[v - 1]))
    if (Math.random() < 0.5) sol = [sol[1], sol[0], sol[3], sol[2]]
    if (Math.random() < 0.5) sol = sol.map(l => [l[1], l[0], l[3], l[2]])
    const grade = sol.map(l => [...l])
    const posicoes = embaralhar(Array.from({ length: 16 }, (_, i) => i)).slice(0, buracos)
    for (const pos of posicoes) grade[Math.floor(pos / 4)][pos % 4] = 0
    return { sol, grade }
}

function desenharSudoku(grade) {
    return grade.map(l => l.map(v => (v ? String(v) : '·')).join(' ')).join('\n')
}

function motorSudoku(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia sudoku aberto por aqui.', comando, prefix)
        const sol = p.sol
        encerrarPartida(chave)
        return {
            emoji: '🔢', titulo: 'Sudoku de bolso — encerrado',
            intro: 'Deixo a resposta aqui e a mesa livre.',
            secoes: [{ emoji: '✅', titulo: 'Solução', linhas: [desenharSudoku(sol)] }],
            proximos: [{ nome: comando, oque: 'montar outro sudoku' }], prefix
        }
    }

    if (!p) {
        const { sol, grade } = gerarSudoku(config.buracos || 6)
        p = abrirPartida(chave, { jogo: 'sudoku', sol, grade, fixas: grade.map(l => l.map(v => v !== 0)), erros: 0 })
        return telaSudoku(p, comando, prefix, 'Complete de 1 a 4 sem repetir na linha, na coluna nem no bloco de dois por dois.')
    }

    const nums = args.map(a => Number(norm(a))).filter(n => Number.isInteger(n))
    if (nums.length < 3) {
        return telaSudoku(p, comando, prefix, 'Mande três números: linha, coluna e valor. Exemplo: 2 3 4.')
    }
    const [linha, coluna, valor] = nums
    if (linha < 1 || linha > 4 || coluna < 1 || coluna > 4 || valor < 1 || valor > 4) {
        return telaSudoku(p, comando, prefix, 'Linha, coluna e valor precisam ficar entre 1 e 4.')
    }
    if (p.fixas[linha - 1][coluna - 1]) {
        return telaSudoku(p, comando, prefix, `A casa ${linha}, ${coluna} já veio preenchida no enunciado.`)
    }

    if (p.sol[linha - 1][coluna - 1] !== valor) {
        p.erros++
        return telaSudoku(p, comando, prefix, `❌ ${valor} não cabe na casa ${linha}, ${coluna}.`)
    }
    p.grade[linha - 1][coluna - 1] = valor
    const completou = p.grade.every(l => l.every(v => v !== 0))
    if (completou) {
        const grade = p.grade.map(l => [...l]), erros = p.erros
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: 'Sudoku de bolso — resolvido',
            intro: `Fechou a grade com ${erros} erro(s) pelo caminho.`,
            secoes: [
                { emoji: '✅', titulo: 'Sua grade', linhas: [desenharSudoku(grade)] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'montar outro sudoku' }], prefix
        }
    }
    return telaSudoku(p, comando, prefix, `✅ ${valor} entrou na casa ${linha}, ${coluna}.`)
}

function telaSudoku(p, comando, prefix, cabecalho) {
    const faltam = p.grade.flat().filter(v => v === 0).length
    return {
        emoji: '🔢', titulo: 'Sudoku de bolso',
        intro: `${cabecalho}\n\n${desenharSudoku(p.grade)}`,
        secoes: [{ emoji: '📊', titulo: 'Situação', linhas: [`*Casas vazias:* ${faltam}`, `*Erros:* ${p.erros}`, '*Linhas e colunas contam de 1 a 4, de cima para baixo e da esquerda para a direita.*'] }],
        dica: 'Comece pela linha que só tem uma casa vazia.',
        proximos: [
            { nome: comando, args: '1 2 3', oque: 'pôr o 3 na linha 1, coluna 2' },
            { nome: comando, args: 'parar', oque: 'desistir e ver a solução' }
        ],
        prefix
    }
}

// ─── Motor: resta-um triangular de 15 casas ─────────────────────────────────

function posicoesTriangulo() {
    const pos = []
    for (let r = 1; r <= 5; r++) for (let c = 1; c <= r; c++) pos.push({ r, c })
    return pos
}
const TRI = posicoesTriangulo()
const idxTri = (r, c) => (r < 1 || r > 5 || c < 1 || c > r ? -1 : (r * (r - 1)) / 2 + c - 1)
const DIRS_TRI = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]]

function movimentosRestaUm(casas) {
    const movs = []
    for (let i = 0; i < 15; i++) {
        if (!casas[i]) continue
        const { r, c } = TRI[i]
        for (const [dr, dc] of DIRS_TRI) {
            const meio = idxTri(r + dr, c + dc)
            const destino = idxTri(r + 2 * dr, c + 2 * dc)
            if (meio >= 0 && destino >= 0 && casas[meio] && !casas[destino]) movs.push([i + 1, destino + 1, meio])
        }
    }
    return movs
}

function desenharRestaUm(casas) {
    const linhas = []
    for (let r = 1; r <= 5; r++) {
        const cel = []
        for (let c = 1; c <= r; c++) {
            const i = idxTri(r, c)
            cel.push(`${i + 1}${casas[i] ? '🔴' : '⚪'}`)
        }
        linhas.push(cel.join(' '))
    }
    return linhas.join('\n')
}

function motorRestaUm(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const vazioInicial = (config.vazio || 1) - 1
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia resta-um aberto por aqui.', comando, prefix)
        const restantes = p.casas.filter(Boolean).length
        encerrarPartida(chave)
        return {
            emoji: '🔴', titulo: 'Resta-um — encerrado',
            intro: `Você saiu com ${restantes} peça(s) no tabuleiro.`,
            secoes: [{ emoji: '🎲', titulo: 'Como estava', linhas: [desenharRestaUm(p.casas)] }],
            proximos: [{ nome: comando, oque: 'montar outro tabuleiro' }], prefix
        }
    }

    if (!p) {
        const casas = Array(15).fill(true)
        casas[vazioInicial] = false
        p = abrirPartida(chave, { jogo: 'restaum', casas, jogadas: 0 })
        return telaRestaUm(p, comando, prefix, 'Pule uma peça sobre a vizinha e caia na casa vazia logo atrás. Quem pulou some.')
    }

    const nums = args.map(a => Number(norm(a))).filter(Number.isInteger)
    if (nums.length < 2) return telaRestaUm(p, comando, prefix, 'Mande duas casas: de onde sai e para onde vai. Exemplo: 4 1.')
    const [de, para] = nums
    const movs = movimentosRestaUm(p.casas)
    const mov = movs.find(m => m[0] === de && m[1] === para)
    if (!mov) return telaRestaUm(p, comando, prefix, `De ${de} para ${para} não é salto válido agora.`)

    p.casas[de - 1] = false
    p.casas[mov[2]] = false
    p.casas[para - 1] = true
    p.jogadas++

    const restantes = p.casas.filter(Boolean).length
    const restam = movimentosRestaUm(p.casas)
    if (restantes === 1) {
        const casas = [...p.casas]
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: 'Resta-um — restou uma',
            intro: `Você limpou o tabuleiro em ${p.jogadas} salto(s). Isso é raro.`,
            secoes: [
                { emoji: '🎲', titulo: 'Tabuleiro final', linhas: [desenharRestaUm(casas)] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'montar outro tabuleiro' }], prefix
        }
    }
    if (!restam.length) {
        const casas = [...p.casas]
        encerrarPartida(chave)
        return {
            emoji: '🛑', titulo: 'Resta-um — travou',
            intro: `Não há mais salto possível. Sobraram *${restantes}* peças.`,
            secoes: [{ emoji: '🎲', titulo: 'Tabuleiro final', linhas: [desenharRestaUm(casas)] }],
            dica: restantes <= 3 ? 'Menos de quatro peças já é resultado de gente boa de tabuleiro.' : 'Tente deixar as bordas por último.',
            proximos: [{ nome: comando, oque: 'tentar de novo' }], prefix
        }
    }
    return telaRestaUm(p, comando, prefix, `✅ Saltou de ${de} para ${para}. Restam ${restantes} peças.`)
}

function telaRestaUm(p, comando, prefix, cabecalho) {
    const movs = movimentosRestaUm(p.casas)
    return {
        emoji: '🔴', titulo: 'Resta-um dos Campeões',
        intro: `${cabecalho}\n\n${desenharRestaUm(p.casas)}`,
        secoes: [
            { emoji: '📊', titulo: 'Situação', linhas: [`*Peças no tabuleiro:* ${p.casas.filter(Boolean).length}`, `*Saltos possíveis agora:* ${movs.length}`, `*Jogadas feitas:* ${p.jogadas}`] },
            { emoji: '🔎', titulo: 'Alguns saltos válidos', linhas: movs.slice(0, 5).map(m => `• ${m[0]} para ${m[1]}`) }
        ],
        dica: 'O número fica na frente da peça. 🔴 é casa ocupada, ⚪ é casa vazia.',
        proximos: [
            { nome: comando, args: movs.length ? `${movs[0][0]} ${movs[0][1]}` : '4 1', oque: 'fazer esse salto' },
            { nome: comando, args: 'parar', oque: 'encerrar o tabuleiro' }
        ],
        prefix
    }
}

// ─── Motor: torre de Hanói ──────────────────────────────────────────────────

function desenharHanoi(torres) {
    return torres.map((t, i) => `*Torre ${i + 1}:* ${t.length ? t.map(d => '▪'.repeat(d)).join(' ') : 'vazia'}`).join('\n')
}

function motorHanoi(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const discos = config.discos || 3
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia torre de Hanói aberta por aqui.', comando, prefix)
        const jogadas = p.jogadas
        encerrarPartida(chave)
        return {
            emoji: '🗼', titulo: 'Torre de Hanói — encerrada',
            intro: `Você saiu depois de ${jogadas} movimento(s).`,
            secoes: [{ emoji: '🎲', titulo: 'Como estava', linhas: [desenharHanoi(p.torres)] }],
            proximos: [{ nome: comando, oque: 'montar a torre de novo' }], prefix
        }
    }

    if (!p) {
        const torres = [Array.from({ length: discos }, (_, i) => discos - i), [], []]
        p = abrirPartida(chave, { jogo: 'hanoi', torres, discos, jogadas: 0, minimo: Math.pow(2, discos) - 1 })
        return telaHanoi(p, comando, prefix, `Leve os ${discos} discos para a torre 3. Disco grande nunca pode ficar sobre disco menor.`)
    }

    const nums = args.map(a => Number(norm(a))).filter(Number.isInteger)
    if (nums.length < 2) return telaHanoi(p, comando, prefix, 'Mande de onde e para onde. Exemplo: 1 3.')
    const [de, para] = nums
    if (de < 1 || de > 3 || para < 1 || para > 3 || de === para) {
        return telaHanoi(p, comando, prefix, 'As torres são 1, 2 e 3, e precisam ser diferentes.')
    }
    const origem = p.torres[de - 1], destino = p.torres[para - 1]
    if (!origem.length) return telaHanoi(p, comando, prefix, `A torre ${de} está vazia.`)
    const topo = origem[origem.length - 1]
    if (destino.length && destino[destino.length - 1] < topo) {
        return telaHanoi(p, comando, prefix, `Não dá: o disco ${topo} é maior que o disco ${destino[destino.length - 1]} da torre ${para}.`)
    }
    origem.pop(); destino.push(topo); p.jogadas++

    if (p.torres[2].length === p.discos) {
        const jogadas = p.jogadas, minimo = p.minimo
        const torres = p.torres.map(t => [...t])
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: 'Torre de Hanói — resolvida',
            intro: `Torre montada em ${jogadas} movimento(s). O mínimo possível era ${minimo}.`,
            secoes: [
                { emoji: '🎲', titulo: 'Tabuleiro final', linhas: [desenharHanoi(torres)] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'tentar com menos movimentos' }], prefix
        }
    }
    return telaHanoi(p, comando, prefix, `✅ Disco ${topo} foi da torre ${de} para a ${para}.`)
}

function telaHanoi(p, comando, prefix, cabecalho) {
    return {
        emoji: '🗼', titulo: `Torre de Hanói — ${p.discos} discos`,
        intro: `${cabecalho}\n\n${desenharHanoi(p.torres)}`,
        secoes: [{ emoji: '📊', titulo: 'Situação', linhas: [`*Movimentos feitos:* ${p.jogadas}`, `*Mínimo possível:* ${p.minimo}`, '*Cada ▪ é uma unidade de largura do disco.*'] }],
        dica: 'Com número ímpar de discos, o primeiro disco vai direto para a torre final.',
        proximos: [
            { nome: comando, args: '1 3', oque: 'mover da torre 1 para a 3' },
            { nome: comando, args: 'parar', oque: 'encerrar' }
        ],
        prefix
    }
}

// ─── Motor: labirinto em texto ──────────────────────────────────────────────

function gerarLabirinto(celulas) {
    const lado = celulas * 2 + 1
    const g = Array.from({ length: lado }, () => Array(lado).fill(1))
    const visitado = Array.from({ length: celulas }, () => Array(celulas).fill(false))
    const pilha = [[0, 0]]
    visitado[0][0] = true
    g[1][1] = 0
    while (pilha.length) {
        const [cy, cx] = pilha[pilha.length - 1]
        const vizinhos = [[cy - 1, cx], [cy + 1, cx], [cy, cx - 1], [cy, cx + 1]]
            .filter(([y, x]) => y >= 0 && y < celulas && x >= 0 && x < celulas && !visitado[y][x])
        if (!vizinhos.length) { pilha.pop(); continue }
        const [ny, nx] = sorteio(vizinhos)
        visitado[ny][nx] = true
        g[ny * 2 + 1][nx * 2 + 1] = 0
        g[cy + ny + 1][cx + nx + 1] = 0
        pilha.push([ny, nx])
    }
    return { g, lado, saida: [celulas * 2 - 1, celulas * 2 - 1] }
}

function desenharLabirinto(p) {
    return p.g.map((linha, y) => linha.map((v, x) => {
        if (y === p.y && x === p.x) return '🧍'
        if (y === p.saida[0] && x === p.saida[1]) return '🚪'
        return v ? '⬛' : '⬜'
    }).join('')).join('\n')
}

const RUMOS = { N: [-1, 0], S: [1, 0], L: [0, 1], O: [0, -1] }

function motorLabirinto(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia labirinto aberto por aqui.', comando, prefix)
        const passos = p.passos
        encerrarPartida(chave)
        return {
            emoji: '🧭', titulo: 'Labirinto — abandonado',
            intro: `Você saiu pela porta dos fundos depois de ${passos} passo(s).`,
            secoes: [{ emoji: '🗺️', titulo: 'Onde você parou', linhas: [desenharLabirinto(p)] }],
            proximos: [{ nome: comando, oque: 'entrar em outro labirinto' }], prefix
        }
    }

    if (!p) {
        const { g, saida } = gerarLabirinto(config.celulas || 4)
        p = abrirPartida(chave, { jogo: 'labirinto', g, saida, y: 1, x: 1, passos: 0 })
        return telaLabirinto(p, comando, prefix, 'Você é o 🧍 e a saída é a 🚪. Ande com n, s, l ou o.')
    }

    const rumos = norm(args.join('')).split('').filter(c => RUMOS[c])
    if (!rumos.length) return telaLabirinto(p, comando, prefix, 'Use n (norte), s (sul), l (leste) ou o (oeste). Vale mandar vários de uma vez.')

    let batidas = 0
    for (const r of rumos) {
        const [dy, dx] = RUMOS[r]
        const ny = p.y + dy, nx = p.x + dx
        if (ny < 0 || nx < 0 || ny >= p.g.length || nx >= p.g.length || p.g[ny][nx]) { batidas++; continue }
        p.y = ny; p.x = nx; p.passos++
        if (p.y === p.saida[0] && p.x === p.saida[1]) break
    }

    if (p.y === p.saida[0] && p.x === p.saida[1]) {
        const passos = p.passos
        const mapa = desenharLabirinto(p)
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: 'Labirinto — você achou a saída',
            intro: `Saiu em ${passos} passo(s). A galera já ia mandar busca.`,
            secoes: [
                { emoji: '🗺️', titulo: 'O caminho completo', linhas: [mapa] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'entrar em outro labirinto' }], prefix
        }
    }
    return telaLabirinto(p, comando, prefix, batidas ? `Você bateu na parede ${batidas} vez(es) e seguiu o que deu.` : 'Passos dados.')
}

function telaLabirinto(p, comando, prefix, cabecalho) {
    const abertos = Object.entries(RUMOS)
        .filter(([, [dy, dx]]) => !p.g[p.y + dy]?.[p.x + dx])
        .map(([r]) => r)
    return {
        emoji: '🧭', titulo: 'Labirinto dos Campeões',
        intro: `${cabecalho}\n\n${desenharLabirinto(p)}`,
        secoes: [{ emoji: '📊', titulo: 'Situação', linhas: [`*Passos dados:* ${p.passos}`, `*Saídas livres daqui:* ${abertos.join(', ') || 'nenhuma'}`] }],
        dica: 'Mande vários rumos de uma vez, tipo llsn, para andar rápido.',
        proximos: [
            { nome: comando, args: (abertos[0] || 'l').toLowerCase(), oque: 'andar nessa direção' },
            { nome: comando, args: 'parar', oque: 'sair do labirinto' }
        ],
        prefix
    }
}

// ─── Motor: quebra-cabeça lógico e sequência lógica ─────────────────────────

function motorLogica(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia quebra-cabeça aberto por aqui.', comando, prefix)
        const resposta = p.resposta
        encerrarPartida(chave)
        return {
            emoji: '🧩', titulo: 'Quebra-cabeça lógico — encerrado',
            intro: `Passou a vez. A resposta era *${resposta}*.`,
            secoes: [{ emoji: '📖', titulo: 'O enunciado era', linhas: [p.enunciado] }],
            proximos: [{ nome: comando, oque: 'pegar outro quebra-cabeça' }], prefix
        }
    }

    if (!p) {
        const [enunciado, resposta, ajuda] = sorteio(D.LOGICA)
        p = abrirPartida(chave, { jogo: 'logica', enunciado, resposta, ajuda, erros: 0, tentativasMax: config.tentativas || 3 })
        return telaLogica(p, comando, prefix, 'Leia com calma. A pegadinha costuma estar na primeira frase.')
    }

    const chute = norm(args.join(' '))
    if (!chute) return telaLogica(p, comando, prefix, 'Seu quebra-cabeça continua de pé.')
    if (chute === norm(p.resposta)) {
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: 'Quebra-cabeça lógico — acertou',
            intro: `*${p.resposta}* é isso mesmo.`,
            secoes: [
                { emoji: '📖', titulo: 'Por quê', linhas: [p.ajuda] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'pegar outro quebra-cabeça' }], prefix
        }
    }
    p.erros++
    if (p.erros >= p.tentativasMax) {
        const resposta = p.resposta, ajuda = p.ajuda
        encerrarPartida(chave)
        return {
            emoji: '💨', titulo: 'Quebra-cabeça lógico — acabaram as chances',
            intro: `A resposta era *${resposta}*.`,
            secoes: [{ emoji: '📖', titulo: 'O raciocínio', linhas: [ajuda] }],
            proximos: [{ nome: comando, oque: 'tentar outro' }], prefix
        }
    }
    return telaLogica(p, comando, prefix, `❌ Não é isso. Faltam ${p.tentativasMax - p.erros} tentativa(s).`)
}

function telaLogica(p, comando, prefix, cabecalho) {
    const linhas = [`*Tentativas restantes:* ${p.tentativasMax - p.erros}`]
    if (p.erros > 0) linhas.push(`*Empurrãozinho:* ${p.ajuda}`)
    return {
        emoji: '🧩', titulo: 'Quebra-cabeça lógico',
        intro: `${cabecalho}\n\n${p.enunciado}`,
        secoes: [{ emoji: '📋', titulo: 'Situação', linhas }],
        dica: 'Resposta curta: um número ou uma palavra.',
        proximos: [
            { nome: comando, args: 'sua resposta', oque: 'responder' },
            { nome: comando, args: 'parar', oque: 'desistir e ver a resposta' }
        ],
        prefix
    }
}

function gerarSequencia() {
    const tipo = Math.floor(Math.random() * 5)
    const a = 1 + Math.floor(Math.random() * 6)
    if (tipo === 0) { const r = 2 + Math.floor(Math.random() * 7); const t = [a, a + r, a + 2 * r, a + 3 * r, a + 4 * r]; return { termos: t, proximo: a + 5 * r, regra: `soma ${r} a cada passo` } }
    if (tipo === 1) { const r = 2 + Math.floor(Math.random() * 3); const t = [a, a * r, a * r ** 2, a * r ** 3]; return { termos: t, proximo: a * r ** 4, regra: `multiplica por ${r} a cada passo` } }
    if (tipo === 2) { const t = [1, 1, 2, 3, 5, 8]; return { termos: t, proximo: 13, regra: 'cada termo é a soma dos dois anteriores' } }
    if (tipo === 3) { const t = [1, 4, 9, 16, 25]; return { termos: t, proximo: 36, regra: 'são os quadrados de 1, 2, 3 e assim por diante' } }
    const t = [a, a + 1, a + 3, a + 6, a + 10]
    return { termos: t, proximo: a + 15, regra: 'a diferença cresce de um em um' }
}

function motorSequencia(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia sequência aberta por aqui.', comando, prefix)
        const proximo = p.proximo, regra = p.regra
        encerrarPartida(chave)
        return {
            emoji: '🔗', titulo: 'Sequência lógica — encerrada',
            intro: `O próximo termo era *${proximo}*.`,
            secoes: [{ emoji: '📖', titulo: 'A regra', linhas: [regra] }],
            proximos: [{ nome: comando, oque: 'pegar outra sequência' }], prefix
        }
    }

    if (!p) {
        const s = gerarSequencia()
        p = abrirPartida(chave, { jogo: 'sequencia', ...s, erros: 0, tentativasMax: config.tentativas || 3 })
        return telaSequencia(p, comando, prefix, 'Descubra o próximo número da sequência.')
    }

    const chute = Number(norm(args[0]))
    if (!Number.isFinite(chute)) return telaSequencia(p, comando, prefix, 'Mande um número.')
    if (chute === p.proximo) {
        encerrarPartida(chave)
        const vitorias = registrarVitoria(from, sender, comando)
        return {
            emoji: '🎉', titulo: 'Sequência lógica — acertou',
            intro: `*${p.proximo}* é o próximo mesmo.`,
            secoes: [
                { emoji: '📖', titulo: 'A regra era', linhas: [p.regra] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Suas vitórias neste jogo:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'pegar outra sequência' }], prefix
        }
    }
    p.erros++
    if (p.erros >= p.tentativasMax) {
        const proximo = p.proximo, regra = p.regra
        encerrarPartida(chave)
        return {
            emoji: '💨', titulo: 'Sequência lógica — acabaram as chances',
            intro: `Era *${proximo}*.`,
            secoes: [{ emoji: '📖', titulo: 'A regra', linhas: [regra] }],
            proximos: [{ nome: comando, oque: 'tentar outra' }], prefix
        }
    }
    return telaSequencia(p, comando, prefix, `❌ Não é ${chute}. Faltam ${p.tentativasMax - p.erros} tentativa(s).`)
}

function telaSequencia(p, comando, prefix, cabecalho) {
    const linhas = [`*Tentativas restantes:* ${p.tentativasMax - p.erros}`]
    if (p.erros >= 2) linhas.push(`*Pista:* ${p.regra}`)
    return {
        emoji: '🔗', titulo: 'Sequência lógica',
        intro: `${cabecalho}\n\n${p.termos.join(', ')}, ...`,
        secoes: [{ emoji: '📋', titulo: 'Situação', linhas }],
        dica: 'Olhe a diferença entre os termos antes de pensar em multiplicação.',
        proximos: [
            { nome: comando, args: '42', oque: 'chutar um número' },
            { nome: comando, args: 'parar', oque: 'desistir e ver a resposta' }
        ],
        prefix
    }
}

// ─── Motor: reflexo e contas de cabeça ──────────────────────────────────────

function motorReflexo(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const senhas = config.senhas || ['agora', 'ja', 'vai', 'corre', 'rapido', 'pega']
    const alvoMs = config.alvoMs || 2000
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia teste de reflexo aberto por aqui.', comando, prefix)
        encerrarPartida(chave)
        return {
            emoji: '⚡', titulo: 'Teste de reflexo — cancelado',
            intro: 'Tudo bem, ninguém é obrigado a correr contra o relógio.',
            secoes: [{ emoji: '🍺', titulo: 'Quando quiser', linhas: ['• Chame de novo que a senha muda.'] }],
            proximos: [{ nome: comando, oque: 'começar outro teste' }], prefix
        }
    }

    if (!p) {
        const senha = sorteio(senhas)
        p = abrirPartida(chave, { jogo: 'reflexo', senha, alvoMs, comecou: Date.now() })
        return {
            emoji: '⚡', titulo: 'Teste de reflexo',
            intro: `Responda o mais rápido que conseguir com a senha: *${senha}*.`,
            secoes: [{ emoji: '⏱️', titulo: 'Como conta', linhas: ['• O relógio já está correndo.', '• Marco o tempo entre esta mensagem e a sua resposta.', '• Digitar errado não para o cronômetro.'] }],
            dica: `Abaixo de ${(alvoMs / 1000).toFixed(1)} segundos conta como vitória.`,
            proximos: [
                { nome: comando, args: senha, oque: 'responder agora' },
                { nome: comando, args: 'parar', oque: 'cancelar o teste' }
            ],
            prefix
        }
    }

    const resposta = norm(args.join(''))
    if (resposta !== norm(p.senha)) {
        return {
            emoji: '⚡', titulo: 'Teste de reflexo — senha errada',
            intro: `A senha é *${p.senha}*. O relógio não parou.`,
            secoes: [{ emoji: '⏱️', titulo: 'Situação', linhas: [`*Tempo corrido até aqui:* ${((Date.now() - p.comecou) / 1000).toFixed(2)} s`] }],
            proximos: [{ nome: comando, args: p.senha, oque: 'responder certo' }], prefix
        }
    }

    const ms = Date.now() - p.comecou
    encerrarPartida(chave)
    const seg = (ms / 1000).toFixed(2)
    const alvo = p.alvoMs || 2000
    const nota = ms < alvo ? 'Reflexo de gato.' : ms < alvo * 2.5 ? 'Bom tempo, dentro do esperado.' : ms < 15000 ? 'Deu para o gasto.' : 'Você foi buscar café no meio, admita.'
    const vitorias = ms < alvo ? registrarVitoria(from, sender, comando) : 0
    return {
        emoji: '⚡', titulo: 'Teste de reflexo — resultado',
        intro: `Você levou *${seg} segundos*. ${nota}`,
        secoes: [
            { emoji: '📊', titulo: 'Faixas', linhas: [`• até ${(alvo / 1000).toFixed(1)} s — reflexo de gato`, `• até ${(alvo * 2.5 / 1000).toFixed(1)} s — bom`, '• acima de 15 s — você se distraiu'] },
            vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Tempos dentro da meta:* ${vitorias}`] } : null
        ].filter(Boolean),
        proximos: [{ nome: comando, oque: 'tentar bater seu tempo' }], prefix
    }
}

function gerarConta(nivel) {
    const n = (max) => 1 + Math.floor(Math.random() * max)
    if (nivel === 1) { const a = n(20), b = n(20); return { texto: `${a} + ${b}`, resposta: a + b } }
    if (nivel === 2) { const a = n(12), b = n(12); return { texto: `${a} × ${b}`, resposta: a * b } }
    if (nivel === 3) { const a = n(30), b = n(30), c = n(10); return { texto: `${a} + ${b} − ${c}`, resposta: a + b - c } }
    if (nivel === 4) { const b = n(9), r = n(12); return { texto: `${b * r} ÷ ${b}`, resposta: r } }
    const a = n(15), b = n(9), c = n(20)
    return { texto: `${a} × ${b} + ${c}`, resposta: a * b + c }
}

function motorContas(config, ctx) {
    const { comando, args, from, sender, prefix } = ctx
    const chave = chaveDe(from, comando, sender)
    const total = config.qtd || 5
    const nivel = config.nivel || 1
    let p = obterPartida(chave)

    if (pediuParar(args)) {
        if (!p) return telaAviso(config, 'Não havia rodada de contas aberta por aqui.', comando, prefix)
        const acertos = p.acertos, feitas = p.feitas
        encerrarPartida(chave)
        return {
            emoji: '➗', titulo: 'Contas de cabeça — encerrada',
            intro: `Você parou com ${acertos} acerto(s) em ${feitas} conta(s).`,
            secoes: [{ emoji: '📖', titulo: 'A última era', linhas: [`${p.conta.texto} = ${p.conta.resposta}`] }],
            proximos: [{ nome: comando, oque: 'começar outra rodada' }], prefix
        }
    }

    if (!p) {
        p = abrirPartida(chave, { jogo: 'contas', conta: gerarConta(nivel), acertos: 0, feitas: 0, total, nivel, comecou: Date.now() })
        return telaContas(p, comando, prefix, `Rodada de ${total} contas. O cronômetro já começou.`)
    }

    const chute = Number(norm(args[0]))
    if (!Number.isFinite(chute)) return telaContas(p, comando, prefix, 'Mande só o resultado, em número.')

    const acertou = chute === p.conta.resposta
    if (acertou) p.acertos++
    p.feitas++
    const anterior = `${p.conta.texto} = ${p.conta.resposta}`

    if (p.feitas >= p.total) {
        const ms = Date.now() - p.comecou
        const acertos = p.acertos
        encerrarPartida(chave)
        const seg = (ms / 1000).toFixed(1)
        const vitorias = acertos === p.total ? registrarVitoria(from, sender, comando) : 0
        return {
            emoji: '➗', titulo: 'Contas de cabeça — resultado',
            intro: `${acertou ? '✅ Certo na última.' : `❌ A última era ${anterior}.`}\n\nVocê fez *${acertos} de ${p.total}* em ${seg} segundos.`,
            secoes: [
                { emoji: '📊', titulo: 'Média', linhas: [`*Tempo por conta:* ${(ms / 1000 / p.total).toFixed(1)} s`] },
                vitorias ? { emoji: '🏆', titulo: 'Placar do grupo', linhas: [`*Rodadas perfeitas suas:* ${vitorias}`] } : null
            ].filter(Boolean),
            proximos: [{ nome: comando, oque: 'tentar bater seu tempo' }], prefix
        }
    }

    p.conta = gerarConta(p.nivel)
    return telaContas(p, comando, prefix, acertou ? '✅ Certo. Próxima.' : `❌ Era ${anterior}. Próxima.`)
}

function telaContas(p, comando, prefix, cabecalho) {
    return {
        emoji: '➗', titulo: `Contas de cabeça — nível ${p.nivel}`,
        intro: `${cabecalho}\n\nQuanto é *${p.conta.texto}*?`,
        secoes: [{ emoji: '📊', titulo: 'Situação', linhas: [`*Contas feitas:* ${p.feitas} de ${p.total}`, `*Acertos:* ${p.acertos}`, `*Tempo corrido:* ${((Date.now() - p.comecou) / 1000).toFixed(1)} s`] }],
        dica: 'Sem calculadora. A graça é a cabeça doer um pouco.',
        proximos: [
            { nome: comando, args: '12', oque: 'mandar o resultado' },
            { nome: comando, args: 'parar', oque: 'encerrar a rodada' }
        ],
        prefix
    }
}

// ─── Porta de entrada única ─────────────────────────────────────────────────

const MOTORES = {
    quiz: motorQuiz, forca: motorForca, palavra: motorPalavra, texto: motorTexto,
    sinonimo: motorSinonimo, rima: motorRima, stop: motorStop, caca: motorCaca,
    sorteio: motorSorteio, vocePrefere: motorVocePrefere, mimica: motorMimica,
    eleicao: motorEleicao, ranking: motorRanking, proibida: motorProibida,
    numero: motorNumero, velha: motorVelha, jokenpo: motorJokenpo, dados: motorDados,
    roleta: motorRoleta, memoria: motorMemoria, sudoku: motorSudoku, restaum: motorRestaUm,
    hanoi: motorHanoi, labirinto: motorLabirinto, logica: motorLogica,
    sequencia: motorSequencia, reflexo: motorReflexo, contas: motorContas
}

/**
 * Executa uma jogada e devolve o descritor de tela para `F.tela`.
 * @param {object} config  configuração declarativa do comando
 * @param {{comando:string, args:string[], from:string, sender:string, prefix:string}} ctx
 */
function jogar(config, ctx) {
    const motor = MOTORES[config.motor]
    const contexto = {
        comando: ctx.comando, args: Array.isArray(ctx.args) ? ctx.args.filter(a => a !== undefined && a !== null && String(a).trim() !== '') : [],
        from: ctx.from, sender: ctx.sender, prefix: ctx.prefix || '.'
    }
    if (!motor) {
        logger.error(`[partyGames] motor desconhecido "${config.motor}" pedido por ${ctx.comando}`)
        return telaAviso(config, 'Este jogo está com a mesa quebrada. Já avisei a cozinha.', ctx.comando, contexto.prefix)
    }
    try {
        return motor(config, contexto)
    } catch (e) {
        logger.error(`[partyGames] falha em ${ctx.comando} (motor ${config.motor}): ${e.stack || e.message}`)
        encerrarPartida(chaveDe(contexto.from, contexto.comando, contexto.sender))
        return telaAviso(config, 'A rodada deu problema e eu limpei a mesa. Pode começar de novo.', ctx.comando, contexto.prefix)
    }
}

module.exports = {
    TTL_MS, MAX_PARTIDAS, MOTORES,
    chaveDe, abrirPartida, obterPartida, encerrarPartida, limparExpiradas,
    registrarVitoria, norm, sorteio, embaralhar, sortearVarios,
    _diagnostico, _zerar, _envelhecer,
    jogar,
    motorQuiz, motorForca, motorPalavra, motorTexto,
    motorSinonimo, motorRima, motorStop, motorCaca,
    motorSorteio, motorVocePrefere, motorMimica, motorEleicao, motorRanking, motorProibida,
    motorNumero, motorVelha, motorJokenpo, motorDados, motorRoleta, motorMemoria,
    motorSudoku, motorRestaUm, motorHanoi, motorLabirinto, motorLogica,
    motorSequencia, motorReflexo, motorContas
}
