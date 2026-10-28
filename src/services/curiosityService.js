/**
 * Curiosidades — a consulta às fichas de `curiosityData.js`.
 *
 * Divisão de trabalho da família `.curio1` … `.curio250`:
 *   curiosityData.js    só as tabelas, nenhuma função de busca
 *   curiosityService.js este arquivo: achar, procurar, comparar e listar
 *   src/commands/…      só apresenta o que sai daqui, com F.tela
 *
 * Nada aqui toca rede nem banco. Uma consulta é uma volta em memória sobre uma
 * tabela que já está carregada, então responde na hora e responde igual sempre.
 *
 * ─── COMO A BUSCA ACHA ───
 * Em quatro degraus, do mais certo para o mais solto, parando no primeiro que
 * der resultado: chave do item, nome exato, começo do nome, nome por dentro.
 * Só se nada disso pegar é que procura no corpo da ficha. A comparação
 * acontece sempre sem acento e sem caixa, porque quem digita no WhatsApp não
 * põe acento — e o `\b` de regex quebra justamente com acento, então aqui não
 * se usa regex para casar palavra em português.
 *
 * ─── DE QUANDO É O NÚMERO ───
 * Toda tela que mostra número traz o campo `fonte` do tema no rodapé, como faz
 * brazilGeoService com VIGENCIA_DADOS. Sem isso, daqui a três anos ninguém
 * sabe se a área do deserto é de agora ou de uma década atrás.
 */

const F = require('../utils/formato')
const D = require('./curiosityData')

/** Tira acento e caixa: 'Ação' e 'acao' têm que casar. */
const norm = s => String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/** Índice por chave de tema, montado uma vez. */
const POR_CHAVE = new Map(D.TEMAS.map(t => [t.chave, t]))

/** Subcategorias aceitas no menu, na ordem em que a família foi montada. */
const SUBS = ['Mundo', 'Brasil', 'Ciência', 'História', 'Bicho e Planta', 'Cultura']

/** Verbos que a pessoa pode digitar antes do termo. */
const VERBOS = {
    lista: 'listar', listar: 'listar', tudo: 'listar', todos: 'listar', todas: 'listar',
    buscar: 'buscar', procurar: 'buscar', busca: 'buscar', achar: 'buscar',
    comparar: 'comparar', compara: 'comparar', versus: 'comparar', vs: 'comparar'
}

// ─────────────────────────────── leitura das tabelas ───────────────────────

/** O tema de uma chave, ou null. */
function temaDe(chave) {
    return POR_CHAVE.get(String(chave ?? '').trim()) || null
}

/** Todos os temas, ou só os de uma subcategoria. */
function temas(sub) {
    if (!sub) return D.TEMAS.slice()
    const s = norm(sub)
    return D.TEMAS.filter(t => norm(t.sub) === s)
}

/**
 * Transforma a linha crua da tabela numa ficha com rótulo em cada valor.
 * @returns {{chave:string, nome:string, fato:string, tema:object, valores:Array<{rotulo:string, valor:string}>}}
 */
function fichaDe(tema, chaveItem) {
    const linha = tema.itens[chaveItem]
    if (!Array.isArray(linha)) return null
    const fato = linha[linha.length - 1]
    const valores = tema.campos.map((rotulo, i) => ({ rotulo, valor: linha[i + 1] }))
        .filter(v => v.valor !== undefined && v.valor !== null && String(v.valor).trim() !== '')
    return { chave: chaveItem, nome: linha[0], fato, valores, tema }
}

/** Todas as fichas de um tema, na ordem em que foram escritas. */
function fichasDe(tema) {
    if (!tema) return []
    return Object.keys(tema.itens).map(k => fichaDe(tema, k)).filter(Boolean)
}

/** Listagem de um tema: o que dá para consultar ali. */
function listar(chaveTema) {
    const tema = temaDe(chaveTema)
    if (!tema) return null
    return { tema, fichas: fichasDe(tema) }
}

// ─────────────────────────────── busca ─────────────────────────────────────

/** Texto inteiro da ficha, para a busca de último recurso. */
const corpoDa = ficha => norm([ficha.chave, ficha.nome, ...ficha.valores.map(v => v.valor), ficha.fato].join(' '))

/**
 * Busca por parte do nome dentro de um tema.
 * Devolve as fichas em ordem de confiança, sem repetir.
 * @param {string} chaveTema
 * @param {string} termo
 * @param {{fundo?:boolean}} [opcoes] fundo=false procura só no nome
 */
function buscar(chaveTema, termo, opcoes = {}) {
    const tema = temaDe(chaveTema)
    const t = norm(termo)
    if (!tema || !t) return []
    const fichas = fichasDe(tema)
    const achados = []
    const visto = new Set()
    const junta = lista => {
        for (const f of lista) {
            if (visto.has(f.chave)) continue
            visto.add(f.chave)
            achados.push(f)
        }
    }
    junta(fichas.filter(f => norm(f.chave) === t || norm(f.nome) === t))
    junta(fichas.filter(f => norm(f.nome).startsWith(t) || norm(f.chave).startsWith(t)))
    junta(fichas.filter(f => norm(f.nome).includes(t)))
    if (opcoes.fundo !== false) junta(fichas.filter(f => corpoDa(f).includes(t)))
    return achados
}

/**
 * Consulta de um item: o caminho normal do comando.
 * @returns {{tema:object, ficha:object|null, parecidos:Array, exata:boolean}|null}
 */
function consultar(chaveTema, termo) {
    const tema = temaDe(chaveTema)
    if (!tema) return null
    const t = norm(termo)
    if (!t) return { tema, ficha: null, parecidos: [], exata: false }
    const achados = buscar(chaveTema, termo)
    if (!achados.length) return { tema, ficha: null, parecidos: [], exata: false }
    const exata = norm(achados[0].chave) === t || norm(achados[0].nome) === t
    return { tema, ficha: achados[0], parecidos: achados.slice(1), exata }
}

/**
 * Procura em TODOS os temas de uma vez. Serve ao teste e a quem não lembra em
 * qual comando a ficha mora.
 */
function procurar(termo, limite = 20) {
    const t = norm(termo)
    if (!t) return []
    const achados = []
    for (const tema of D.TEMAS) {
        for (const ficha of fichasDe(tema)) {
            if (norm(ficha.nome).includes(t) || norm(ficha.chave).includes(t) || corpoDa(ficha).includes(t)) {
                achados.push(ficha)
                if (achados.length >= limite) return achados
            }
        }
    }
    return achados
}

// ─────────────────────────────── comparação ────────────────────────────────

/**
 * Põe duas fichas do mesmo tema lado a lado, campo por campo.
 * @returns {{tema:object, a:object, b:object, linhas:Array<{rotulo:string, a:string, b:string, igual:boolean}>}|null}
 */
function comparar(chaveTema, termoA, termoB) {
    const tema = temaDe(chaveTema)
    if (!tema) return null
    const a = buscar(chaveTema, termoA)[0]
    const b = buscar(chaveTema, termoB)[0]
    if (!a || !b) return { tema, a: a || null, b: b || null, linhas: [] }
    const linhas = tema.campos.map((rotulo, i) => {
        const va = (a.valores[i] || {}).valor || '—'
        const vb = (b.valores[i] || {}).valor || '—'
        return { rotulo, a: va, b: vb, igual: norm(va) === norm(vb) }
    })
    return { tema, a, b, linhas }
}

/** Separa "coisa a, coisa b" ou "coisa a e coisa b" em dois termos. */
function doisTermos(texto) {
    const cru = String(texto ?? '').trim()
    if (!cru) return []
    if (cru.includes(',')) return cru.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2)
    if (cru.includes(' x ')) return cru.split(' x ').map(s => s.trim()).filter(Boolean).slice(0, 2)
    const porE = cru.split(/\s+e\s+/)
    if (porE.length === 2) return porE.map(s => s.trim()).filter(Boolean)
    const p = cru.split(/\s+/)
    if (p.length === 2) return p
    return [cru]
}

// ─────────────────────────────── telas ─────────────────────────────────────

/** Rodapé que diz de quando é o número. Vai em toda tela da família. */
const rodape = tema => `De quando é o dado: ${tema.fonte}.`

/** Bloco de próximos passos comum a todas as telas do tema. */
function proximosDe(tema, nome, fichas) {
    const primeira = fichas[0]
    const segunda = fichas[1] || fichas[0]
    const passos = []
    if (primeira) passos.push({ nome, args: primeira.chave, oque: `abre a ficha de ${primeira.nome}` })
    if (segunda && segunda !== primeira) {
        passos.push({ nome, args: `comparar ${primeira.chave}, ${segunda.chave}`, oque: 'põe as duas lado a lado' })
    }
    passos.push({ nome, args: 'lista', oque: 'mostra tudo que dá para consultar aqui' })
    return passos
}

/** A tela de listagem: o que este comando tem para contar. */
function telaDeLista(tema, nome) {
    const fichas = fichasDe(tema)
    return {
        emoji: tema.emoji,
        titulo: tema.titulo,
        intro: tema.intro,
        secoes: [
            {
                emoji: '📋', titulo: `O que dá para consultar (${fichas.length})`,
                linhas: F.lista(fichas.map(f => `*${f.nome}* — ${(f.valores[0] || {}).valor || tema.sub}`))
            },
            {
                emoji: '🔤', titulo: 'Como pedir', linhas: F.lista([
                    'escreva o nome do item logo depois do comando',
                    'um pedaço do nome já serve, e acento não faz falta',
                    'para ver duas de uma vez, use o comparar dos próximos passos'
                ])
            }
        ],
        dica: rodape(tema),
        proximos: proximosDe(tema, nome, fichas)
    }
}

/** A tela de uma ficha. O fato vem no topo: é o que a pessoa veio ler. */
function telaDeFicha(ficha, nome, aviso = '') {
    const tema = ficha.tema
    const outras = fichasDe(tema).filter(f => f.chave !== ficha.chave)
    return {
        emoji: tema.emoji,
        titulo: ficha.nome,
        intro: ficha.fato,
        secoes: [
            { emoji: '📋', titulo: tema.titulo, linhas: ficha.valores.map(v => F.campo(v.rotulo, v.valor)) },
            outras.length
                ? { emoji: '🔎', titulo: 'Também tem aqui', linhas: F.lista([outras.map(f => f.nome).join(', ')]) }
                : null,
            aviso ? { emoji: '💬', titulo: 'Sobre o que você pediu', linhas: F.lista([aviso]) } : null
        ].filter(Boolean),
        dica: rodape(tema),
        proximos: proximosDe(tema, nome, outras.length ? outras : [ficha])
    }
}

/** A tela de quando o termo não bateu com nada. Nunca deixa a pessoa na mão. */
function telaSemAchar(tema, termo, nome) {
    const fichas = fichasDe(tema)
    return {
        emoji: '🔎',
        titulo: `Não achei "${String(termo).slice(0, 40)}"`,
        intro: `Neste assunto eu guardo ${fichas.length} fichas, e nenhuma bateu com o que você escreveu.`,
        secoes: [
            {
                emoji: '📋', titulo: tema.titulo,
                linhas: F.lista(fichas.map(f => `*${f.nome}*`))
            }
        ],
        dica: 'Pode escrever só um pedaço do nome, sem acento e sem ligar para maiúscula.',
        proximos: proximosDe(tema, nome, fichas)
    }
}

/** A tela de busca por parte do nome, com mais de um resultado. */
function telaDeBusca(tema, termo, achados, nome) {
    if (!achados.length) return telaSemAchar(tema, termo, nome)
    if (achados.length === 1) return telaDeFicha(achados[0], nome)
    return {
        emoji: '🔎',
        titulo: `Achei ${achados.length} com "${String(termo).slice(0, 30)}"`,
        intro: `Todas estão no assunto: ${tema.titulo}. Escolha uma para abrir a ficha inteira.`,
        secoes: [
            {
                emoji: '📋', titulo: 'Resultados',
                linhas: F.lista(achados.map(f => `*${f.nome}* — ${(f.valores[0] || {}).valor || ''}`.trim()))
            }
        ],
        dica: rodape(tema),
        proximos: achados.slice(0, 3).map(f => ({ nome, args: f.chave, oque: `abre a ficha de ${f.nome}` }))
    }
}

/** A tela de comparação, campo por campo. */
function telaDeComparacao(tema, termos, nome) {
    const [ta, tb] = termos
    const r = comparar(tema.chave, ta, tb)
    if (!r || !r.a || !r.b) {
        const faltou = !r || !r.a ? ta : tb
        return telaSemAchar(tema, faltou || 'o que você pediu', nome)
    }
    if (r.a.chave === r.b.chave) {
        return telaDeFicha(r.a, nome, 'Os dois nomes caíram na mesma ficha, então mostrei ela inteira.')
    }
    return {
        emoji: '⚖️',
        titulo: `${r.a.nome} e ${r.b.nome}`,
        intro: `Lado a lado, campo por campo, no assunto: ${tema.titulo}.`,
        secoes: [
            {
                emoji: '📊', titulo: 'Comparação',
                linhas: r.linhas.map(l => `*${l.rotulo}*\n• ${r.a.nome}: ${l.a}\n• ${r.b.nome}: ${l.b}`)
            },
            { emoji: '💬', titulo: r.a.nome, linhas: F.lista([r.a.fato]) },
            { emoji: '💬', titulo: r.b.nome, linhas: F.lista([r.b.fato]) }
        ],
        dica: rodape(tema),
        proximos: [
            { nome, args: r.a.chave, oque: `só a ficha de ${r.a.nome}` },
            { nome, args: 'lista', oque: 'volta para a lista do assunto' }
        ]
    }
}

/**
 * O que o comando chama. Recebe o que a pessoa digitou e devolve a tela pronta
 * para o F.tela — a decisão de qual tela mostrar mora aqui, não nos 250
 * arquivos de comando.
 *
 * @param {string} chaveTema chave do tema em curiosityData
 * @param {{args?:string[], prefix?:string, nome?:string}} ctx
 */
function responder(chaveTema, { args = [], nome = 'curio', prefix = '.' } = {}) {
    const tema = temaDe(chaveTema)
    if (!tema) {
        // Só acontece se alguém editar um comando à mão e errar a chave.
        return {
            emoji: '🗂️',
            titulo: 'Assunto fora do catálogo',
            intro: 'Este comando aponta para um assunto que não existe mais na tabela de curiosidades.',
            secoes: [{
                emoji: '📋', titulo: 'O que eu tenho',
                linhas: F.lista(SUBS.map(s => `${s}: ${temas(s).length} assuntos`))
            }],
            dica: 'Regerar a família com scripts/gen-curiosidades.js conserta isso.'
        }
    }

    const cru = (args || []).map(a => String(a ?? '')).filter(a => a.trim() !== '')
    if (!cru.length) return telaDeLista(tema, nome)

    const verbo = VERBOS[norm(cru[0])]
    const resto = cru.slice(1).join(' ').trim()

    if (verbo === 'listar') return telaDeLista(tema, nome)
    if (verbo === 'comparar') {
        const termos = doisTermos(resto)
        if (termos.length < 2) {
            const fichas = fichasDe(tema)
            const tela = telaDeLista(tema, nome)
            tela.intro = `Para comparar eu preciso de dois nomes, como em: ${F.cmd(prefix, nome, `comparar ${fichas[0].chave}, ${(fichas[1] || fichas[0]).chave}`)}`
            return tela
        }
        return telaDeComparacao(tema, termos, nome)
    }
    if (verbo === 'buscar') {
        if (!resto) return telaDeLista(tema, nome)
        return telaDeBusca(tema, resto, buscar(tema.chave, resto), nome)
    }

    // Sem verbo: é o nome de um item.
    const termo = cru.join(' ')
    const r = consultar(tema.chave, termo)
    if (r.ficha) {
        const aviso = r.exata || !r.parecidos.length
            ? ''
            : `Você escreveu "${termo.slice(0, 30)}" e eu abri a ficha mais próxima. Também bateu com ${r.parecidos.map(f => f.nome).join(', ')}.`
        return telaDeFicha(r.ficha, nome, aviso)
    }
    return telaSemAchar(tema, termo, nome)
}

// ─────────────────────────────── conferência ───────────────────────────────

/**
 * Passa a tabela inteira no pente e devolve a lista de problemas. O teste da
 * família chama isto; o gerador também, antes de escrever qualquer arquivo.
 */
function conferir() {
    const problemas = []
    const chaves = new Set()
    const titulos = new Map()
    for (const tema of D.TEMAS) {
        const id = tema.chave || '(sem chave)'
        if (!tema.chave) problemas.push('tema sem chave')
        if (chaves.has(tema.chave)) problemas.push(`${id}: chave de tema repetida`)
        chaves.add(tema.chave)
        if (!SUBS.includes(tema.sub)) problemas.push(`${id}: subcategoria "${tema.sub}" fora das seis aceitas`)
        if (!tema.emoji) problemas.push(`${id}: sem emoji`)
        if (!tema.titulo) problemas.push(`${id}: sem título`)
        else if (tema.titulo.length > 55) problemas.push(`${id}: título com ${tema.titulo.length} caracteres`)
        else if (titulos.has(norm(tema.titulo))) problemas.push(`${id}: título repetido com ${titulos.get(norm(tema.titulo))}`)
        if (tema.titulo) titulos.set(norm(tema.titulo), id)
        if (!tema.intro) problemas.push(`${id}: sem intro`)
        if (!tema.fonte) problemas.push(`${id}: sem fonte (o rodapé de vigência ficaria vazio)`)
        if (!Array.isArray(tema.campos) || tema.campos.length < 2) problemas.push(`${id}: precisa de pelo menos 2 campos`)

        const itens = Object.keys(tema.itens || {})
        if (itens.length < 3) problemas.push(`${id}: só ${itens.length} ficha(s)`)
        const nomes = new Map()
        for (const k of itens) {
            const linha = tema.itens[k]
            if (!Array.isArray(linha)) { problemas.push(`${id}.${k}: não é lista`); continue }
            const esperado = tema.campos.length + 2
            if (linha.length !== esperado) problemas.push(`${id}.${k}: ${linha.length} valores, esperado ${esperado}`)
            linha.forEach((v, i) => {
                if (typeof v !== 'string' || !v.trim()) problemas.push(`${id}.${k}[${i}]: valor vazio`)
            })
            const fato = linha[linha.length - 1]
            if (typeof fato === 'string' && fato.trim().length < 40) problemas.push(`${id}.${k}: fato com ${fato.trim().length} caracteres`)
            const n = norm(linha[0])
            if (nomes.has(n)) problemas.push(`${id}: duas fichas chamadas "${linha[0]}"`)
            nomes.set(n, k)
        }
    }
    return problemas
}

/** Conta o que existe, por subcategoria. Usado pelo gerador e pelo teste. */
function contagem() {
    const por = {}
    for (const s of SUBS) por[s] = temas(s).length
    return {
        temas: D.TEMAS.length,
        fichas: D.TEMAS.reduce((s, t) => s + Object.keys(t.itens || {}).length, 0),
        porSub: por
    }
}

module.exports = {
    VIGENCIA_DADOS: D.VIGENCIA_DADOS,
    TEMAS: D.TEMAS,
    SUBS,
    norm,
    temaDe,
    temas,
    fichaDe,
    fichasDe,
    listar,
    buscar,
    consultar,
    procurar,
    comparar,
    doisTermos,
    responder,
    conferir,
    contagem
}
