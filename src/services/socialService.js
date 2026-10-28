/**
 * Vínculos sociais — quem interage com quem, e o quanto.
 *
 * O `.interacao` que já existia mandava a frase e esquecia. Aqui cada gesto
 * fica registrado por grupo, o que permite responder o que uma frase solta
 * nunca responde: quem são as duplas do grupo, quem nunca é marcado, com quem
 * você mais fala.
 *
 * A afinidade não é só contagem: gesto recente pesa mais que gesto antigo, e
 * reciprocidade pesa mais que mão única — senão bastaria alguém marcar o mesmo
 * nome cem vezes para "ser o melhor amigo" de quem nunca respondeu.
 */

const perfilData = require('./profileDataService')
const logger = require('../core/logger')
const F = require('../utils/formato')

const CHAVE = 'social_vinculos'

/** Quantos pares ficam guardados por grupo. */
const TETO_PARES = 500

/** Meia-vida da afinidade, em dias: um gesto vale metade depois disso. */
const MEIA_VIDA_DIAS = 30

/** Gestos disponíveis, com a frase e o peso de cada um. */
const GESTOS = {
    cutucar: { emoji: '👉', peso: 1, frase: 'cutucou', solo: 'está cutucando o ar, procurando companhia' },
    morder: { emoji: '😬', peso: 1, frase: 'deu uma mordidinha em', solo: 'está mordendo o próprio orgulho' },
    apertar: { emoji: '🫂', peso: 2, frase: 'apertou com força', solo: 'está se apertando de ansiedade' },
    carregar: { emoji: '🏋️', peso: 2, frase: 'pegou no colo e carregou', solo: 'está carregando o próprio peso' },
    proteger: { emoji: '🛡️', peso: 3, frase: 'ergueu o escudo para proteger', solo: 'está de guarda, sozinho' },
    salvar: { emoji: '🦸', peso: 3, frase: 'salvou de um perigo certo', solo: 'precisa que alguém o salve' },
    desafiar: { emoji: '⚔️', peso: 2, frase: 'lançou um desafio a', solo: 'está desafiando o próprio reflexo' },
    presentear: { emoji: '🎁', peso: 3, frase: 'entregou um presente a', solo: 'comprou um presente e não tem para quem dar' },
    brindar: { emoji: '🍻', peso: 2, frase: 'ergueu a caneca em brinde a', solo: 'está comemorando uma vitória sozinho' },
    treinarcom: { emoji: '🥋', peso: 2, frase: 'treinou lado a lado com', solo: 'está treinando sozinho até cair' },
    curarferido: { emoji: '💚', peso: 3, frase: 'curou os ferimentos de', solo: 'está lambendo as próprias feridas' },
    abencoar: { emoji: '✨', peso: 3, frase: 'lançou uma bênção sobre', solo: 'abençoou o próprio caminho' },
    jurar: { emoji: '🤞', peso: 3, frase: 'fez um juramento de lealdade a', solo: 'jurou lealdade a si mesmo' },
    perdoar: { emoji: '🕊️', peso: 3, frase: 'perdoou de coração', solo: 'está tentando se perdoar' },
    provocar: { emoji: '😏', peso: 1, frase: 'provocou sem dó', solo: 'está provocando o próprio ego' },
    ovacionar: { emoji: '👏', peso: 2, frase: 'aplaudiu de pé', solo: 'está se aplaudindo — e merece' },
    reverenciar: { emoji: '🙇', peso: 2, frase: 'fez uma reverência a', solo: 'está reverenciando o vazio' },
    apadrinhar: { emoji: '🏡', peso: 3, frase: 'adotou como família', solo: 'está procurando uma família' },
    acompanhar: { emoji: '🚶', peso: 2, frase: 'seguiu viagem ao lado de', solo: 'está viajando sozinho' },
    ensinar: { emoji: '📖', peso: 2, frase: 'ensinou um segredo a', solo: 'está estudando sozinho' },
    apresentar: { emoji: '🤝', peso: 2, frase: 'se apresentou formalmente a', solo: 'está se apresentando ao espelho' },
    convidar: { emoji: '✉️', peso: 2, frase: 'enviou um convite a', solo: 'escreveu um convite e não tem destinatário' },
    consolar: { emoji: '🫶', peso: 3, frase: 'consolou nos braços', solo: 'está precisando de consolo' },
    animar: { emoji: '🎈', peso: 2, frase: 'levantou o ânimo de', solo: 'está tentando se animar' },
    alimentar: { emoji: '🍖', peso: 2, frase: 'dividiu a comida com', solo: 'está lanchando sozinho no intervalo' },
    defender: { emoji: '🗡️', peso: 3, frase: 'entrou na frente para defender', solo: 'está se defendendo sozinho' },
    homenagear: { emoji: '🏆', peso: 3, frase: 'prestou uma homenagem a', solo: 'está homenageando os próprios feitos' },
    acolher: { emoji: '🕯️', peso: 3, frase: 'acolheu com hospitalidade', solo: 'está procurando abrigo' }
}

/**
 * O que cada gesto faz, no infinitivo — usado na tela de "como usar" quando a
 * pessoa chama o gesto sem marcar ninguém.
 */
const ACOES = {
    cutucar: 'dar uma cutucada em alguém',
    morder: 'dar uma mordidinha de brincadeira',
    apertar: 'dar um aperto bem forte',
    carregar: 'pegar alguém no colo',
    proteger: 'erguer o escudo por alguém',
    salvar: 'salvar alguém de um perigo',
    desafiar: 'lançar um desafio a alguém',
    presentear: 'entregar um presente',
    brindar: 'erguer a caneca em brinde a alguém',
    treinarcom: 'treinar lado a lado com alguém',
    curarferido: 'curar os ferimentos de alguém',
    abencoar: 'lançar uma bênção sobre alguém',
    jurar: 'jurar lealdade a alguém',
    perdoar: 'perdoar alguém de coração',
    provocar: 'provocar alguém sem dó',
    ovacionar: 'aplaudir alguém de pé',
    reverenciar: 'fazer uma reverência a alguém',
    apadrinhar: 'adotar alguém como família',
    acompanhar: 'seguir viagem ao lado de alguém',
    ensinar: 'ensinar um segredo a alguém',
    apresentar: 'se apresentar formalmente a alguém',
    convidar: 'mandar um convite a alguém',
    consolar: 'consolar alguém nos braços',
    animar: 'levantar o ânimo de alguém',
    alimentar: 'dividir a comida com alguém',
    defender: 'entrar na frente para defender alguém',
    homenagear: 'prestar uma homenagem a alguém',
    acolher: 'acolher alguém no time'
}

/** Nome de cada gesto para títulos (com acento, ao contrário da chave). */
const TITULOS = {
    cutucar: 'Cutucar',
    morder: 'Morder',
    apertar: 'Apertar',
    carregar: 'Carregar no colo',
    proteger: 'Proteger',
    salvar: 'Salvar',
    desafiar: 'Desafiar',
    presentear: 'Presentear',
    brindar: 'Brindar',
    treinarcom: 'Treinar junto',
    curarferido: 'Curar ferimentos',
    abencoar: 'Abençoar',
    jurar: 'Jurar lealdade',
    perdoar: 'Perdoar',
    provocar: 'Provocar',
    ovacionar: 'Ovacionar',
    reverenciar: 'Reverenciar',
    apadrinhar: 'Apadrinhar',
    acompanhar: 'Acompanhar',
    ensinar: 'Ensinar',
    apresentar: 'Apresentar-se',
    convidar: 'Convidar',
    consolar: 'Consolar',
    animar: 'Animar',
    alimentar: 'Dividir a comida',
    defender: 'Defender',
    homenagear: 'Homenagear',
    acolher: 'Acolher'
}

function chaveDoPar(a, b) {
    const na = String(a || '').split('@')[0].split(':')[0]
    const nb = String(b || '').split('@')[0].split(':')[0]
    return [na, nb].sort().join('|')
}

function nomeCurto(jid) {
    return '+' + String(jid || '').split('@')[0].slice(0, 6) + '****'
}

/** Estado social do grupo. */
function vinculos(grupoJid) {
    try {
        const bruto = perfilData.getData(grupoJid, CHAVE, null)
        const dados = bruto ? (typeof bruto === 'string' ? JSON.parse(bruto) : bruto) : {}
        return dados && typeof dados === 'object' ? dados : {}
    } catch (err) {
        logger.warn(`[SOCIAL] Vínculos de ${grupoJid} ilegíveis: ${err.message} — tratando como vazio.`)
        return {}
    }
}

function salvar(grupoJid, dados) {
    try {
        // Mantém só os pares mais fortes: um grupo grande geraria pares demais.
        const pares = Object.entries(dados)
            .sort((a, b) => (b[1].pontos || 0) - (a[1].pontos || 0))
            .slice(0, TETO_PARES)
        perfilData.setData(grupoJid, CHAVE, JSON.stringify(Object.fromEntries(pares)))
        return true
    } catch (err) {
        logger.error(`[SOCIAL] Falha ao salvar vínculos de ${grupoJid}: ${err.message}`)
        return false
    }
}

/** Registra um gesto entre duas pessoas. */
function registrar(grupoJid, autor, alvo, gesto) {
    const info = GESTOS[gesto]
    if (!info) {
        logger.warn(`[SOCIAL] Gesto "${gesto}" desconhecido — não registrado.`)
        return null
    }
    const dados = vinculos(grupoJid)
    const chave = chaveDoPar(autor, alvo)
    const atual = dados[chave] || { a: autor, b: alvo, total: 0, pontos: 0, ultima: 0, gestos: {}, de: {} }

    atual.total += 1
    atual.pontos = (atual.pontos || 0) + info.peso
    atual.ultima = Date.now()
    atual.gestos[gesto] = (atual.gestos[gesto] || 0) + 1
    // Quem enviou, para medir reciprocidade depois.
    const autorCurto = String(autor).split('@')[0].split(':')[0]
    atual.de[autorCurto] = (atual.de[autorCurto] || 0) + 1

    dados[chave] = atual
    salvar(grupoJid, dados)
    return atual
}

/**
 * Afinidade de um par: pontos com decaimento por tempo e bônus por
 * reciprocidade. Devolve 0..100.
 */
function afinidade(grupoJid, a, b) {
    const dados = vinculos(grupoJid)
    const par = dados[chaveDoPar(a, b)]
    if (!par) return { pontos: 0, nota: 0, total: 0, reciproco: 0, par: null }

    const diasAtras = (Date.now() - (par.ultima || 0)) / 86400000
    const decaimento = Math.pow(0.5, diasAtras / MEIA_VIDA_DIAS)

    const envios = Object.values(par.de || {})
    const maior = Math.max(...envios, 1)
    const menor = envios.length > 1 ? Math.min(...envios) : 0
    const reciproco = maior ? menor / maior : 0

    const bruto = (par.pontos || 0) * decaimento * (0.6 + 0.4 * reciproco)
    return {
        pontos: par.pontos || 0,
        total: par.total || 0,
        nota: Math.min(100, Math.round(bruto)),
        reciproco: Math.round(reciproco * 100),
        ultima: par.ultima,
        gestos: par.gestos || {},
        par
    }
}

/** Pares mais fortes do grupo. */
function duplas(grupoJid, limite = 10) {
    const dados = vinculos(grupoJid)
    return Object.values(dados)
        .map(p => ({ ...p, nota: afinidade(grupoJid, p.a, p.b).nota }))
        .sort((x, y) => y.nota - x.nota)
        .slice(0, limite)
}

/** Quantas interações cada pessoa enviou e recebeu. */
function porPessoa(grupoJid) {
    const dados = vinculos(grupoJid)
    const mapa = new Map()
    for (const p of Object.values(dados)) {
        for (const jid of [p.a, p.b]) {
            const curto = String(jid).split('@')[0].split(':')[0]
            const atual = mapa.get(curto) || { jid, enviados: 0, recebidos: 0, parceiros: 0 }
            atual.parceiros += 1
            mapa.set(curto, atual)
        }
        for (const [autorCurto, n] of Object.entries(p.de || {})) {
            const atual = mapa.get(autorCurto)
            if (atual) atual.enviados += n
        }
    }
    // Recebidos = total do par menos o que a própria pessoa enviou.
    for (const p of Object.values(dados)) {
        for (const jid of [p.a, p.b]) {
            const curto = String(jid).split('@')[0].split(':')[0]
            const atual = mapa.get(curto)
            if (atual) atual.recebidos += (p.total || 0) - ((p.de || {})[curto] || 0)
        }
    }
    return [...mapa.values()]
}

/** Com quem uma pessoa mais interage. */
function conexoesDe(grupoJid, jid, limite = 10) {
    const curto = String(jid).split('@')[0].split(':')[0]
    const dados = vinculos(grupoJid)
    return Object.values(dados)
        .filter(p => chaveDoPar(p.a, p.b).split('|').includes(curto))
        .map(p => {
            const outro = String(p.a).split('@')[0].split(':')[0] === curto ? p.b : p.a
            return { outro, total: p.total, nota: afinidade(grupoJid, p.a, p.b).nota, ultima: p.ultima }
        })
        .sort((a, b) => b.nota - a.nota)
        .slice(0, limite)
}

/** Contagem de cada gesto usado no grupo. */
function gestosUsados(grupoJid) {
    const dados = vinculos(grupoJid)
    const mapa = new Map()
    for (const p of Object.values(dados)) {
        for (const [g, n] of Object.entries(p.gestos || {})) mapa.set(g, (mapa.get(g) || 0) + n)
    }
    return [...mapa].map(([gesto, total]) => ({ gesto, total })).sort((a, b) => b.total - a.total)
}

/** Rótulo do nível de afinidade. */
function nivelDe(nota) {
    if (nota >= 80) return '💞 Inseparáveis'
    if (nota >= 55) return '💚 Grandes amigos'
    if (nota >= 30) return '🤝 Companheiros'
    if (nota >= 10) return '👋 Conhecidos'
    if (nota > 0) return '🌱 Primeiros contatos'
    return '❔ Sem vínculo'
}

/** Alvo de um gesto: primeira menção ou autor da mensagem respondida. */
function alvoDoGesto(ctx) {
    const marcado = (ctx.mentionedJid || [])[0]
    if (marcado) return marcado
    if (ctx.quotedSender) return ctx.quotedSender
    return null
}

/**
 * Executa um gesto social completo e responde: sem alvo explica o gesto com
 * exemplo; com alvo registra e mostra como ficou o vínculo do par.
 * @param {{reply:Function, sender:string, from:string, mentionedJid?:string[], quotedSender?:string, prefix?:string}} ctx
 * @param {string} chave  nome do gesto (igual ao nome do comando)
 */
function executarGesto(ctx, chave) {
    const info = GESTOS[chave]
    const prefix = ctx.prefix || '.'
    if (!info) {
        logger.warn(`[SOCIAL] executarGesto chamado com gesto desconhecido "${chave}".`)
        return ctx.reply('🏰 Esse gesto não existe mais. Veja os disponíveis em ' + F.cmd(prefix, 'socialcatalogo') + '.')
    }
    const alvo = alvoDoGesto(ctx)
    const eu = '@' + String(ctx.sender).split('@')[0]
    const acao = ACOES[chave] || info.frase
    if (!alvo) {
        return ctx.reply(F.tela({
            emoji: info.emoji,
            titulo: TITULOS[chave] || chave,
            intro: eu + ' ' + info.solo + '… mas esse gesto precisa de alguém do outro lado.',
            secoes: [{
                emoji: '📜', titulo: 'Como funciona',
                linhas: [
                    'Serve para ' + acao + '.',
                    'Marque a pessoa ou responda a uma mensagem dela.',
                    'Cada gesto soma afinidade entre vocês dois neste grupo.'
                ]
            }, {
                emoji: '✍️', titulo: 'Digite assim',
                linhas: [F.cmd(prefix, chave, '@pessoa')]
            }],
            dica: 'Gestos de cuidado e lealdade valem mais afinidade que provocações.',
            proximos: [
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' },
                { nome: 'socialperfil', oque: 'ver com quem você mais se conecta' }
            ],
            prefix
        }), [ctx.sender])
    }
    if (String(alvo).split('@')[0].split(':')[0] === String(ctx.sender).split('@')[0].split(':')[0]) {
        return ctx.reply(F.tela({
            emoji: info.emoji,
            titulo: 'Esse gesto é para outra pessoa',
            intro: eu + ', não dá para fazer isso consigo mesmo. Marque alguém do grupo.',
            secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, chave, '@pessoa')] }],
            prefix
        }), [ctx.sender])
    }
    const par = registrar(ctx.from, ctx.sender, alvo, chave)
    const af = afinidade(ctx.from, ctx.sender, alvo)
    const outro = '@' + String(alvo).split('@')[0]
    const texto = [
        info.emoji + ' ' + eu + ' ' + info.frase + ' ' + outro + '!',
        F.secao('💫', 'Vínculo entre vocês', [
            F.campo('Nível', nivelDe(af.nota)),
            F.campo('Afinidade', F.barra(af.nota / 100)),
            F.campo('Gestos trocados', String(par ? par.total : 1))
        ]),
        '👉 ' + F.cmd(prefix, 'afinidade', '@pessoa') + ' — detalhes do vínculo'
    ].join('\n\n')
    return ctx.reply(texto, [ctx.sender, alvo])
}

module.exports = {
    GESTOS,
    ACOES,
    TITULOS,
    executarGesto,
    alvoDoGesto,
    MEIA_VIDA_DIAS,
    TETO_PARES,
    nomeCurto,
    chaveDoPar,
    vinculos,
    registrar,
    afinidade,
    duplas,
    porPessoa,
    conexoesDe,
    gestosUsados,
    nivelDe
}
