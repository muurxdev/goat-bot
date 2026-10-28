/**
 * Jogos unificados — um comando por brincadeira, com a variante como argumento.
 *
 * Até 2026-09-18 cada variante era um comando próprio: ".jogo1" era o quiz de
 * bandeiras com 5 perguntas, ".jogo2" o mesmo com 10, e assim por 250 comandos.
 * Agora ".quiztema bandeiras 10" escolhe a variante, e os ".jogoN" antigos
 * continuam funcionando como atalhos, cada um com o ajuste exato de antes.
 *
 * Quem joga continua sendo o partyGamesService; aqui só se decide QUAL
 * configuração vai para ele:
 *
 *  - atalho antigo (".jogo17 a")  → a variante daquele atalho, pelo mesmo nome,
 *    então uma partida aberta com ".jogo17" segue respondendo em ".jogo17";
 *  - variante nos argumentos (".quiztema bandeiras 10") → abre partida nova;
 *  - outra coisa com partida aberta (".quiztema a") → jogada, na variante que a
 *    pessoa escolheu ao abrir;
 *  - nada, sem partida aberta → a lista de opções (jogo sem estado sorteia na
 *    variante padrão e mostra as opções junto).
 */

const P = require('./partyGamesService')
const logger = require('../core/logger')

/** Chave de comparação em minúsculas (o norm do motor devolve MAIÚSCULAS). */
const chave = t => P.norm(t).toLowerCase()

/** Variante escolhida por pessoa em cada jogo: `jogo|grupo|pessoa` → índice. */
const escolhas = new Map()
const MAX_ESCOLHAS = 2000

function lembrar(chaveEscolha, indice) {
    escolhas.delete(chaveEscolha)
    escolhas.set(chaveEscolha, indice)
    if (escolhas.size > MAX_ESCOLHAS) escolhas.delete(escolhas.keys().next().value)
}

/**
 * Variante que casa com o começo dos argumentos. A mais específica ganha:
 * "bandeiras 10" vence "bandeiras".
 * @returns {number|null}
 */
function acharVariante(jogo, args) {
    const a = args.map(chave)
    let melhor = null
    jogo.variantes.forEach((v, i) => {
        if (!v.palavras.length) return
        const casa = v.palavras.every((w, k) => a[k] === w)
        if (casa && (melhor === null || v.palavras.length > jogo.variantes[melhor].palavras.length)) melhor = i
    })
    return melhor
}

/** Linhas da lista de opções, agrupadas pela primeira palavra. */
function linhasDeOpcoes(jogo, prefix) {
    const grupos = new Map()
    for (const v of jogo.variantes) {
        if (!v.palavras.length) continue
        const [primeira, ...resto] = v.palavras
        if (!grupos.has(primeira)) grupos.set(primeira, { rotulo: v.rotulo, extras: [] })
        if (resto.length) grupos.get(primeira).extras.push(resto.join(' '))
    }
    return [...grupos].map(([primeira, g]) => {
        const extra = g.extras.length ? ` _(também: ${g.extras.map(e => `\`${primeira} ${e}\``).join(', ')})_` : ''
        return `• \`${prefix}${jogo.nome} ${primeira}\` — ${g.rotulo}${extra}`
    })
}

function telaOpcoes(jogo, prefix, aviso = '') {
    const exemplo = jogo.variantes.find(v => v.palavras.length)
    return {
        emoji: jogo.emoji,
        titulo: jogo.titulo,
        intro: [aviso, jogo.intro].filter(Boolean).join('\n\n'),
        secoes: [{ emoji: '🎮', titulo: 'Escolha', linhas: linhasDeOpcoes(jogo, prefix) }],
        proximos: exemplo ? [{ nome: jogo.nome, args: exemplo.palavras.join(' '), oque: `começar: ${exemplo.rotulo}` }] : [],
        prefix
    }
}

/** Palavras que abrem a lista de opções em qualquer momento. */
const PEDE_OPCOES = new Set(['opcoes', 'lista', 'menu', 'temas'])

/**
 * Acrescenta "ver as outras opções" ao fim da tela do motor. Vai com o argumento
 * "opcoes": em jogo sem estado, repetir o comando só sorteia de novo, e sem
 * isso não havia como chegar às outras variantes.
 */
function comOpcoes(tela, jogo) {
    if (!tela || jogo.variantes.length < 2) return tela
    const proximos = Array.isArray(tela.proximos) ? tela.proximos.slice() : []
    proximos.push({ nome: jogo.nome, args: 'opcoes', oque: 'ver as outras opções deste jogo' })
    return { ...tela, proximos }
}

/**
 * Resposta livre da forca: com a partida aberta, quem joga manda só a letra
 * (ou a palavra inteira) no chat, sem ".forca". Era o que a forca antiga fazia
 * e o que torna o jogo prático num grupo. Só letra solta ou palavra do tamanho
 * exato entram, para "kkk" ou "oi" não virarem chute; e só de quem abriu a
 * partida (a partida é de uma pessoa).
 */
function registrarRespostaLivre(config, comando, from, sender, prefix) {
    const interacao = require('./interactionService')
    const chavePartida = P.chaveDe(from, comando, sender)
    if (!P.obterPartida(chavePartida)) return
    interacao.register(from, {
        type: 'forca',
        owner: sender,
        ttlMs: P.TTL_MS,
        onText: async (texto, c) => {
            const p = P.obterPartida(chavePartida)
            if (!p) { c.clear(); return false }
            const palpite = chave(texto).replace(/\s+/g, '')
            if (!/^[a-z]+$/.test(palpite)) return false
            if (palpite.length !== 1 && palpite.length !== String(p.palavra || '').length) return false
            const tela = P.jogar(config, { comando, args: [palpite], from, sender, prefix })
            if (!P.obterPartida(chavePartida)) c.clear()
            await c.reply(require('../utils/formato').tela({ ...tela, prefix }))
            return true
        }
    })
}

/** Joga e, se for forca com partida aberta, liga a resposta livre. */
function jogarComRespostaLivre(config, comando, args, base) {
    const tela = P.jogar(config, { ...base, comando, args })
    if (config.motor === 'forca') {
        try {
            registrarRespostaLivre(config, comando, base.from, base.sender, base.prefix)
        } catch (err) {
            logger.warn(`[jogos] não liguei a resposta livre da forca em ${base.from}: ${err.message}`)
        }
    }
    return tela
}

/**
 * @param {object} jogo  { nome, titulo, emoji, intro, comEstado, variantes: [{palavras, rotulo, config}], atalhos: {jogoN: índice} }
 * @param {{commandName?:string, args?:string[], from?:string, sender?:string, prefix?:string}} ctx
 * @returns {object} tela para F.tela
 */
function rodar(jogo, ctx) {
    const args = (Array.isArray(ctx.args) ? ctx.args : []).filter(a => a !== undefined && a !== null && String(a).trim() !== '')
    const { from, sender } = ctx
    const prefix = ctx.prefix || '.'
    const digitado = chave(ctx.commandName || '')
    const base = { from, sender, prefix }

    // 1. Atalho antigo: variante fixa, pelo nome digitado.
    if (Object.prototype.hasOwnProperty.call(jogo.atalhos, digitado)) {
        const v = jogo.variantes[jogo.atalhos[digitado]]
        return jogarComRespostaLivre(v.config, digitado, args, base)
    }

    const chaveEscolha = `${jogo.nome}|${from || 'pv'}|${sender || 'anon'}`

    // Jogo de uma variante só não tem o que escolher.
    if (jogo.variantes.length === 1) {
        return jogarComRespostaLivre(jogo.variantes[0].config, jogo.nome, args, base)
    }

    if (args.length === 1 && PEDE_OPCOES.has(chave(args[0]))) return telaOpcoes(jogo, prefix)

    // 2. Variante nos argumentos: partida nova nessa variante.
    const i = acharVariante(jogo, args)
    if (i !== null) {
        const v = jogo.variantes[i]
        lembrar(chaveEscolha, i)
        P.encerrarPartida(P.chaveDe(from, jogo.nome, sender))
        return comOpcoes(jogarComRespostaLivre(v.config, jogo.nome, args.slice(v.palavras.length), base), jogo)
    }

    // 3. Jogada numa partida aberta, na variante escolhida ao abrir.
    const aberta = jogo.comEstado && P.obterPartida(P.chaveDe(from, jogo.nome, sender))
    if (aberta) {
        const escolhida = escolhas.has(chaveEscolha) ? escolhas.get(chaveEscolha) : 0
        return jogarComRespostaLivre(jogo.variantes[escolhida].config, jogo.nome, args, base)
    }

    // 4. Sem variante e sem partida.
    if (args.length) {
        return telaOpcoes(jogo, prefix, `Não conheço a opção *${args.join(' ')}* neste jogo.`)
    }
    if (!jogo.comEstado) {
        // Brincadeira de uma rodada só: sorteia na variante padrão e mostra as outras.
        return comOpcoes(P.jogar(jogo.variantes[0].config, { ...base, comando: jogo.nome, args: [] }), jogo)
    }
    return telaOpcoes(jogo, prefix)
}

/** Só para os testes. */
function _zerarEscolhas() {
    escolhas.clear()
    logger.debug?.('[jogos] escolhas zeradas')
}

module.exports = { rodar, acharVariante, linhasDeOpcoes, _zerarEscolhas }
