/**
 * Estúdio de texto — toda a lógica da família `.txt1` … `.txt160`.
 *
 * DECISÕES QUE ESTE ARQUIVO CARREGA
 *
 * 1. O serviço é a única fonte de verdade. Os 160 comandos em
 *    src/commands/texto/ são gerados por scripts/gen-texto.js e só fazem três
 *    coisas: pegar o texto, chamar `telaDeResultado` e devolver com F.tela.
 *    Nenhuma regra de negócio mora no comando — quem conserta um bug de
 *    acentuação conserta aqui, uma vez, e os 160 comandos herdam.
 *
 * 2. Nada de rede, nada de banco. Texto entra, texto sai. Isso deixa a família
 *    inteira testável sem subir o bot e sem tocar em data/database.sqlite.
 *
 * 3. `\b` de regex NÃO serve para português. `\b` considera "ç" e "ã" como
 *    limite de palavra, então /\bpao\b/ casa dentro de "pão-doce" e
 *    /\bmerda\b/ não casa em "MERDA!" acentuado vizinho. Onde preciso de borda
 *    de palavra uso classes Unicode explícitas — ver BORDA_ESQ / BORDA_DIR.
 *
 * 4. Texto de usuário pode ser enorme (alguém cola um livro). A entrada é
 *    cortada em LIMITE_ENTRADA caracteres ANTES de qualquer processamento e a
 *    saída em LIMITE_SAIDA, que é menor que o teto de mensagem do WhatsApp.
 *    Assim nenhuma operação aloca um array proporcional a um texto sem fim.
 *
 * 5. Nada de quantificador aninhado — `(a+)+`, `(\s*\w+)*` e parentes travam o
 *    processo inteiro com entrada adversária (o bot é single-thread). Todas as
 *    expressões aqui são de classe simples com um quantificador só.
 *
 * 6. Comparações caras (distância de edição) têm o tamanho limitado em
 *    LIMITE_COMPARACAO, porque o custo é largura × altura: 4.000 × 4.000 seria
 *    16 milhões de passos numa mensagem de grupo.
 *
 * 7. Os codificadores são BRINCADEIRA, não segurança. Morse, César, Vigenère e
 *    companhia são do século retrasado e qualquer um desembaralha. Cada
 *    operação de código carrega esse aviso na resposta, de propósito.
 *
 * 8. Aleatoriedade é semeada pelo próprio texto (`rngDe`). O mesmo texto gera
 *    sempre o mesmo apelido/poema: dá para repetir o resultado, conferir e
 *    testar, em vez de sair diferente a cada chamada.
 */

const F = require('../utils/formato')

// ── Limites ────────────────────────────────────────────────────────────────
const LIMITE_ENTRADA = 4000      // corte da entrada, antes de processar
const LIMITE_SAIDA = 3000        // corte do bloco de resultado (msg WA ~4096)
const LIMITE_TELA = 3800         // teto da tela inteira, já com título e seções
const LIMITE_COMPARACAO = 400    // teto para distância de edição
const MAX_LINHAS_SAIDA = 200     // teto de linhas listadas numa resposta

const AVISO_BRINCADEIRA = 'Isto é brincadeira de decifrar, não segredo: qualquer pessoa desfaz em segundos. Não use para esconder senha nem dado pessoal.'

// ── Bordas de palavra que respeitam acento ─────────────────────────────────
// Em vez de \b (que quebra com ç/ã/é), olho se o vizinho é letra ou número.
const BORDA_ESQ = '(?<![\\p{L}\\p{N}])'
const BORDA_DIR = '(?![\\p{L}\\p{N}])'

// ── Helpers de texto ───────────────────────────────────────────────────────

/** Normaliza e corta a entrada. Tudo que vem do usuário passa por aqui. */
function limitarEntrada(bruto) {
    const s = String(bruto ?? '').replace(/\r\n?/g, '\n')
    return s.length > LIMITE_ENTRADA ? s.slice(0, LIMITE_ENTRADA) : s
}

/** Corta a saída no limite de mensagem, avisando que cortou. */
function cortarSaida(texto, limite = LIMITE_SAIDA) {
    const s = String(texto ?? '')
    if (!s.trim()) return 'O resultado ficou vazio: o texto que você mandou não tinha nada desse tipo.'
    if (s.length <= limite) return s
    return s.slice(0, limite) + '\n\n[cortei aqui: o resultado passou do tamanho que cabe numa mensagem]'
}

/** Recorta um pedaço solto de texto com reticência, sem quebrar emoji pela metade. */
function recortar(s, max) {
    const t = String(s ?? '')
    if (t.length <= max || max < 2) return t.length <= max ? t : t.slice(0, Math.max(0, max))
    return Array.from(t).slice(0, max - 1).join('').trimEnd() + '…'
}

/**
 * Última barreira antes de enviar: garante que a TELA INTEIRA cabe numa
 * mensagem. Cortar só o bloco de resultado não bastava — o texto do usuário
 * também aparece na frase de abertura e nas listas, e uma pessoa colando um
 * livro fazia a soma passar do teto do WhatsApp mesmo com o resultado cortado.
 */
function limitarTela(tela) {
    tela.intro = recortar(tela.intro, 350)
    tela.dica = recortar(tela.dica, 250)
    let usado = String(tela.titulo || '').length + String(tela.intro || '').length + String(tela.dica || '').length + 40
    const secoes = []
    for (const s of (tela.secoes || [])) {
        if (!s || usado >= LIMITE_TELA) break
        const linhas = []
        for (const l of (s.linhas || [])) {
            if (usado >= LIMITE_TELA) { linhas.push('[cortei aqui: o resto não cabe numa mensagem]'); break }
            const corte = recortar(String(l ?? ''), LIMITE_TELA - usado)
            linhas.push(corte)
            usado += corte.length + 1
        }
        usado += String(s.titulo || '').length + 4
        secoes.push({ emoji: s.emoji, titulo: s.titulo, linhas })
    }
    tela.secoes = secoes
    return tela
}

/** Junta linhas já prontas respeitando o teto de linhas e de caracteres. */
function juntarLinhas(linhas) {
    const ls = linhas.slice(0, MAX_LINHAS_SAIDA)
    const sobra = linhas.length - ls.length
    const texto = ls.join('\n')
    return sobra > 0 ? texto + `\n… e mais ${sobra} linha(s) que não couberam.` : texto
}

/** Tira acento sem perder a letra: "ação" vira "acao". */
function tirarAcento(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Palavras de verdade (letra ou número), aceitando hífen e apóstrofo no meio. */
function palavrasDe(texto) {
    return String(texto).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []
}

/** Frases: pedaço de texto até um ponto final, de exclamação, interrogação ou reticências. */
function frasesDe(texto) {
    const achados = String(texto).match(/[^.!?…\n]+[.!?…]*/gu) || []
    return achados.map(f => f.trim()).filter(Boolean)
}

/** Linhas do texto, como a pessoa digitou. */
function linhasDe(texto) {
    return String(texto).split('\n')
}

/** Parágrafos: blocos separados por linha em branco. */
function paragrafosDe(texto) {
    return String(texto).split(/\n[ \t]*\n/).map(p => p.trim()).filter(Boolean)
}

/** Letras isoladas respeitando emoji e acento composto. */
function caracteresDe(texto) {
    return Array.from(String(texto))
}

/** Conta ocorrências e devolve ordenado do mais frequente para o menos. */
function contagemOrdenada(itens) {
    const mapa = new Map()
    for (const i of itens) mapa.set(i, (mapa.get(i) || 0) + 1)
    return [...mapa.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
}

/** Gerador pseudoaleatório semeado pelo texto — mesmo texto, mesmo resultado. */
function rngDe(texto) {
    let h = 2166136261
    const s = String(texto)
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    let a = h >>> 0
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/** Embaralha uma cópia do array com sorteio semeado (Fisher-Yates). */
function embaralharCom(arr, rnd) {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1))
        const t = a[i]; a[i] = a[j]; a[j] = t
    }
    return a
}

/** Escolhe um item da lista com sorteio semeado. */
function escolher(lista, rnd) {
    return lista[Math.floor(rnd() * lista.length)] ?? lista[0]
}

/** Escapa um trecho para virar regex literal. */
function escaparRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Regex de palavra inteira que funciona com acento (ver decisão 3 do cabeçalho). */
function regexPalavra(palavra, flags = 'giu') {
    return new RegExp(BORDA_ESQ + escaparRegex(palavra) + BORDA_DIR, flags)
}

/** Distância de edição (Levenshtein) com tamanho limitado — ver decisão 6. */
function distanciaEdicao(a, b) {
    const s = String(a).slice(0, LIMITE_COMPARACAO)
    const t = String(b).slice(0, LIMITE_COMPARACAO)
    if (!s.length) return t.length
    if (!t.length) return s.length
    let anterior = new Array(t.length + 1)
    let atual = new Array(t.length + 1)
    for (let j = 0; j <= t.length; j++) anterior[j] = j
    for (let i = 1; i <= s.length; i++) {
        atual[0] = i
        for (let j = 1; j <= t.length; j++) {
            const custo = s[i - 1] === t[j - 1] ? 0 : 1
            atual[j] = Math.min(atual[j - 1] + 1, anterior[j] + 1, anterior[j - 1] + custo)
        }
        const troca = anterior; anterior = atual; atual = troca
    }
    return anterior[t.length]
}

/**
 * Conta sílabas de uma palavra em português por grupos de vogais.
 * É aproximação: trata ditongo como uma sílaba e hiato fica de fora.
 * Serve para métrica de verso e leitura, não para prova de gramática.
 */
function silabasDe(palavra) {
    const p = tirarAcento(String(palavra).toLowerCase()).replace(/[^a-z]/g, '')
    if (!p) return 0
    const grupos = p.match(/[aeiou]+/g) || []
    return Math.max(1, grupos.length)
}

/** Divide o texto em dois pedaços para as operações de comparação. */
function doisPedacos(bruto) {
    const t = String(bruto)
    if (t.includes('|')) {
        const partes = t.split('|')
        return [partes[0].trim(), partes.slice(1).join('|').trim()]
    }
    const ls = linhasDe(t).filter(l => l.trim())
    if (ls.length >= 2) return [ls[0].trim(), ls.slice(1).join('\n').trim()]
    const ps = palavrasDe(t)
    if (ps.length >= 2) {
        const meio = Math.ceil(ps.length / 2)
        return [ps.slice(0, meio).join(' '), ps.slice(meio).join(' ')]
    }
    return [t.trim(), t.trim()]
}

/** As duas primeiras palavras, para anagrama/rima/distância. */
function duasPalavras(bruto) {
    if (String(bruto).includes('|')) {
        const [a, b] = doisPedacos(bruto)
        return [palavrasDe(a)[0] || a, palavrasDe(b)[0] || b]
    }
    const ps = palavrasDe(bruto)
    return [ps[0] || '', ps[1] || ps[0] || '']
}

// ── Tabelas de estilo ──────────────────────────────────────────────────────

const MAPA_PEQUENAS = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
    k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ѕ', t: 'ᴛ',
    u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
}

const MAPA_INVERTIDO = {
    a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
    k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
    u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
    '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
    '.': '˙', ',': '\'', '?': '¿', '!': '¡', '(': ')', ')': '('
}
const MAPA_INVERTIDO_VOLTA = (() => {
    const m = {}
    for (const [k, v] of Object.entries(MAPA_INVERTIDO)) if (!(v in m)) m[v] = k
    return m
})()

const MAPA_MORSE = {
    a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....',
    i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.',
    q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
    y: '-.--', z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '-': '-....-', '/': '-..-.'
}
const MAPA_MORSE_VOLTA = (() => {
    const m = {}
    for (const [k, v] of Object.entries(MAPA_MORSE)) m[v] = k
    return m
})()

const MAPA_BRAILLE = {
    a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
    k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
    u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵', ' ': '⠀',
    ',': '⠂', '.': '⠲', '?': '⠦', '!': '⠖', '-': '⠤'
}
const MAPA_BRAILLE_VOLTA = (() => {
    const m = {}
    for (const [k, v] of Object.entries(MAPA_BRAILLE)) m[v] = k
    return m
})()

const MAPA_FONETICO = {
    a: 'Alfa', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Eco', f: 'Foxtrote',
    g: 'Golfe', h: 'Hotel', i: 'India', j: 'Julieta', k: 'Quilo', l: 'Lima',
    m: 'Mike', n: 'Novembro', o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeu',
    s: 'Sierra', t: 'Tango', u: 'Uniforme', v: 'Victor', w: 'Whisky',
    x: 'Raio-X', y: 'Yankee', z: 'Zulu',
    '0': 'Zero', '1': 'Um', '2': 'Dois', '3': 'Tres', '4': 'Quatro',
    '5': 'Cinco', '6': 'Seis', '7': 'Sete', '8': 'Oito', '9': 'Nove'
}
const MAPA_FONETICO_VOLTA = (() => {
    const m = {}
    for (const [k, v] of Object.entries(MAPA_FONETICO)) m[v.toLowerCase()] = k
    return m
})()

const MAPA_LEET = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', b: '8', g: '9' }
const MAPA_LEET_VOLTA = (() => {
    const m = {}
    for (const [k, v] of Object.entries(MAPA_LEET)) m[v] = k
    return m
})()

const TECLADO = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const MAPA_TECLADO = (() => {
    const m = {}
    TECLADO.forEach((linha, i) => {
        Array.from(linha).forEach((c, j) => { m[c] = `${i + 1}.${j + 1}` })
    })
    return m
})()
const MAPA_TECLADO_VOLTA = (() => {
    const m = {}
    for (const [k, v] of Object.entries(MAPA_TECLADO)) m[v] = k
    return m
})()

const MAPA_T9 = {
    a: '2', b: '22', c: '222', d: '3', e: '33', f: '333', g: '4', h: '44', i: '444',
    j: '5', k: '55', l: '555', m: '6', n: '66', o: '666', p: '7', q: '77', r: '777',
    s: '7777', t: '8', u: '88', v: '888', w: '9', x: '99', y: '999', z: '9999'
}
const MAPA_T9_VOLTA = (() => {
    const m = {}
    for (const [k, v] of Object.entries(MAPA_T9)) m[v] = k
    return m
})()

const PALAVROES = [
    'merda', 'bosta', 'porra', 'caralho', 'buceta', 'foda', 'fodase', 'puta',
    'putaria', 'viado', 'corno', 'arrombado', 'desgraça', 'otário', 'otario',
    'babaca', 'escroto', 'piranha', 'vagabundo', 'vagabunda', 'cuzão', 'cuzao',
    'imbecil', 'retardado', 'cacete', 'xoxota', 'punheta', 'pqp', 'fdp'
]

// Marcas de português usadas para o palpite de idioma (decisão: nada de rede).
const MARCAS_PT = ['ção', 'ões', 'nh', 'lh', 'ã', 'õ', 'ç', 'á', 'é', 'í', 'ó', 'ú', 'â', 'ê', 'ô']
const PALAVRAS_PT = ['que', 'não', 'nao', 'para', 'com', 'uma', 'você', 'voce', 'mais', 'como', 'isso', 'quando', 'porque', 'então', 'entao', 'muito', 'também', 'tambem']

// ── Aplicação de estilo do WhatsApp ────────────────────────────────────────

/** Envolve cada linha não vazia com a marca de formatação do WhatsApp. */
function marcarLinhas(texto, marca) {
    return linhasDe(texto).map(l => (l.trim() ? marca + l.trim() + marca : l)).join('\n')
}

/** Troca caractere por caractere usando um mapa, preservando o que não está nele. */
function trocarPorMapa(texto, mapa, { minusculo = true } = {}) {
    return caracteresDe(minusculo ? String(texto).toLowerCase() : String(texto))
        .map(c => (c in mapa ? mapa[c] : c))
        .join('')
}

// ── Leitura de parâmetros ──────────────────────────────────────────────────

/**
 * Consome parâmetros do INÍCIO do texto sem destruir as quebras de linha.
 * Só engole o primeiro token quando ele realmente parece o parâmetro
 * (número onde se espera número, "velho>novo" onde se espera par), senão usa o
 * padrão e devolve o texto inteiro. É o que permite `.txt45 3 oi` e `.txt45 oi`
 * funcionarem os dois.
 */
function lerParametros(bruto, spec = []) {
    let resto = String(bruto)
    const p = {}
    for (const item of spec) {
        p[item.nome] = item.padrao
        const m = resto.match(/^(\S+)([ \t]*)/)
        if (!m) continue
        const token = m[1]
        const sobraria = resto.slice(m[0].length).trim()
        let aceita = false
        if (item.tipo === 'numero') aceita = /^\d{1,4}$/.test(token)
        else if (item.tipo === 'par') aceita = token.includes('>')
        else if (item.tipo === 'emoji') aceita = !/[\p{L}\p{N}]/u.test(token) && sobraria.length > 0
        else if (item.tipo === 'palavra') aceita = sobraria.length > 0
        if (!aceita) continue
        if (item.tipo === 'numero') {
            const n = parseInt(token, 10)
            p[item.nome] = Math.min(item.max ?? 999, Math.max(item.min ?? 1, n))
        } else {
            p[item.nome] = token
        }
        resto = resto.slice(m[0].length)
    }
    return { texto: resto, p }
}

// ── Grupos de operações (preenchidos abaixo) ───────────────────────────────

const OPS_TRANSFORMAR = [
    {
        id: 'maiusculas', sub: 'Transformar', emoji: '🔠', titulo: 'Tudo em maiúscula',
        descricao: 'Deixa o texto todo em letra maiúscula',
        ajuda: 'Mande um texto e devolvo tudo em letra grande, bom para título e aviso.',
        usage: '<texto>', examples: ['bom dia pessoal — vira BOM DIA PESSOAL'],
        dica: 'Texto inteiro em maiúscula soa como grito. Use só no título.',
        run: (t) => ({ texto: t.toUpperCase() })
    },
    {
        id: 'minusculas', sub: 'Transformar', emoji: '🔡', titulo: 'Tudo em minúscula',
        descricao: 'Deixa o texto todo em letra minúscula',
        ajuda: 'Mande um texto e devolvo tudo em letra pequena, sem grito.',
        usage: '<texto>', examples: ['BOM DIA PESSOAL — vira bom dia pessoal'],
        run: (t) => ({ texto: t.toLowerCase() })
    },
    {
        id: 'capitalizar', sub: 'Transformar', emoji: '🔤', titulo: 'Primeira letra de cada palavra',
        descricao: 'Põe a primeira letra de cada palavra em maiúscula',
        ajuda: 'Bom para nome de pessoa, de lugar e título de lista.',
        usage: '<texto>', examples: ['maria da silva — vira Maria Da Silva'],
        run: (t) => ({ texto: t.replace(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) })
    },
    {
        id: 'frasecapital', sub: 'Transformar', emoji: '✒️', titulo: 'Maiúscula só no começo da frase',
        descricao: 'Maiúscula no começo de cada frase, resto normal',
        ajuda: 'Arruma texto digitado todo em caixa alta ou todo em caixa baixa.',
        usage: '<texto>', examples: ['ELE CHEGOU. ELA SAIU. — vira Ele chegou. Ela saiu.'],
        run: (t) => ({
            texto: frasesDe(t.toLowerCase()).map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' ')
        })
    },
    {
        id: 'inverterletras', sub: 'Transformar', emoji: '🔃', titulo: 'Texto de trás para frente',
        descricao: 'Inverte a ordem das letras do texto',
        ajuda: 'Lê o texto de trás para frente, letra por letra.',
        usage: '<texto>', examples: ['amor e roma — vira amor e roma ao contrário'],
        run: (t) => ({ texto: caracteresDe(t).reverse().join('') })
    },
    {
        id: 'inverterpalavras', sub: 'Transformar', emoji: '↩️', titulo: 'Palavras na ordem contrária',
        descricao: 'Inverte a ordem das palavras, sem mexer nas letras',
        ajuda: 'A última palavra vira a primeira e assim por diante.',
        usage: '<texto>', examples: ['o gato subiu no telhado — vira telhado no subiu gato o'],
        run: (t) => ({ texto: t.trim().split(/\s+/).reverse().join(' ') })
    },
    {
        id: 'inverterlinhas', sub: 'Transformar', emoji: '🔽', titulo: 'Linhas de baixo para cima',
        descricao: 'Inverte a ordem das linhas do texto',
        ajuda: 'A última linha passa a ser a primeira. Bom para virar uma lista.',
        usage: '<linha 1\\nlinha 2>', examples: ['primeira\\nsegunda — devolve segunda e depois primeira'],
        run: (t) => ({ texto: juntarLinhas(linhasDe(t).reverse()) })
    },
    {
        id: 'embaralharletras', sub: 'Transformar', emoji: '🎲', titulo: 'Letras embaralhadas',
        descricao: 'Embaralha as letras de cada palavra',
        ajuda: 'Embaralha as letras do meio de cada palavra e deixa o texto quase legível.',
        usage: '<texto>', examples: ['jogo de palavras — devolve as letras misturadas'],
        dica: 'O mesmo texto embaralha sempre igual, então dá para conferir depois.',
        run: (t) => {
            const rnd = rngDe(t)
            return { texto: t.replace(/[\p{L}\p{N}]{2,}/gu, w => embaralharCom(Array.from(w), rnd).join('')) }
        }
    },
    {
        id: 'embaralharpalavras', sub: 'Transformar', emoji: '🔀', titulo: 'Palavras embaralhadas',
        descricao: 'Embaralha a ordem das palavras do texto',
        ajuda: 'Mistura a ordem das palavras — serve para jogo de montar a frase.',
        usage: '<texto>', examples: ['monte a frase certa aqui — devolve as palavras fora de ordem'],
        run: (t) => ({ texto: embaralharCom(t.trim().split(/\s+/), rngDe(t)).join(' ') })
    },
    {
        id: 'embaralharlinhas', sub: 'Transformar', emoji: '🗂️', titulo: 'Linhas embaralhadas',
        descricao: 'Embaralha a ordem das linhas do texto',
        ajuda: 'Sorteia a ordem das linhas. Bom para sortear a ordem de quem fala.',
        usage: '<linha 1\\nlinha 2>', examples: ['ana\\nbia\\ncaio — devolve os três em ordem sorteada'],
        run: (t) => ({ texto: juntarLinhas(embaralharCom(linhasDe(t).filter(l => l.trim()), rngDe(t))) })
    },
    {
        id: 'tiraracento', sub: 'Transformar', emoji: '🧹', titulo: 'Texto sem acento',
        descricao: 'Tira acento e cedilha, mantendo as letras',
        ajuda: 'Útil quando o destino não aceita acento, como alguns sistemas antigos.',
        usage: '<texto>', examples: ['coração à vontade — vira coracao a vontade'],
        run: (t) => ({ texto: tirarAcento(t) })
    },
    {
        id: 'tirarpontuacao', sub: 'Transformar', emoji: '🚫', titulo: 'Texto sem pontuação',
        descricao: 'Remove ponto, vírgula e outros sinais',
        ajuda: 'Deixa só palavras, números e espaço.',
        usage: '<texto>', examples: ['Oi, tudo bem? Claro! — vira Oi tudo bem Claro'],
        run: (t) => ({ texto: t.replace(/[^\p{L}\p{N}\s]/gu, '').replace(/[ \t]{2,}/g, ' ') })
    },
    {
        id: 'tirarespacorepetido', sub: 'Transformar', emoji: '📏', titulo: 'Sem espaço repetido',
        descricao: 'Troca espaço repetido por um espaço só',
        ajuda: 'Arruma texto colado de outro lugar, cheio de espaço sobrando.',
        usage: '<texto>', examples: ['oi     tudo    bem — vira oi tudo bem'],
        run: (t) => ({ texto: t.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim() })
    },
    {
        id: 'tirartodoespaco', sub: 'Transformar', emoji: '🧲', titulo: 'Texto sem nenhum espaço',
        descricao: 'Cola tudo, sem nenhum espaço entre as palavras',
        ajuda: 'Junta tudo numa palavra só. Serve para senha boba e brincadeira.',
        usage: '<texto>', examples: ['tudo junto agora — vira tudojuntoagora'],
        run: (t) => ({ texto: t.replace(/\s+/g, '') })
    },
    {
        id: 'tirarnumeros', sub: 'Transformar', emoji: '🔢', titulo: 'Texto sem números',
        descricao: 'Remove todos os algarismos do texto',
        ajuda: 'Tira os números e mantém o resto exatamente como está.',
        usage: '<texto>', examples: ['casa 42 rua 7 — vira casa rua'],
        run: (t) => ({ texto: t.replace(/\p{N}+/gu, '').replace(/[ \t]{2,}/g, ' ').trim() })
    },
    {
        id: 'tiraremoji', sub: 'Transformar', emoji: '😶', titulo: 'Texto sem emoji',
        descricao: 'Remove os emoji e deixa só o texto',
        ajuda: 'Bom para copiar um recado cheio de figurinha para um lugar sério.',
        usage: '<texto>', examples: ['oi 😀 tudo bem 🎉 — vira oi tudo bem'],
        run: (t) => ({ texto: t.replace(/\p{Extended_Pictographic}/gu, '').replace(/[️‍]/g, '').replace(/[ \t]{2,}/g, ' ').trim() })
    },
    {
        id: 'tirarvogais', sub: 'Transformar', emoji: '🅰️', titulo: 'Texto sem vogais',
        descricao: 'Some com as vogais e deixa o enigma',
        ajuda: 'Tira as vogais e desafia a pessoa a ler assim mesmo.',
        usage: '<texto>', examples: ['bom dia pessoal — vira bm d pssl'],
        run: (t) => ({ texto: t.replace(/[aeiouáàâãéêíóôõúü]/gi, '') })
    },
    {
        id: 'tirarlinhavazia', sub: 'Transformar', emoji: '📉', titulo: 'Sem linha em branco',
        descricao: 'Remove as linhas vazias do texto',
        ajuda: 'Junta a lista, tirando o espaço em branco entre os itens.',
        usage: '<texto com linhas>', examples: ['um\\n\\ndois — devolve um e dois grudados'],
        run: (t) => ({ texto: juntarLinhas(linhasDe(t).filter(l => l.trim())) })
    },
    {
        id: 'tirarlinharepetida', sub: 'Transformar', emoji: '♻️', titulo: 'Sem linha repetida',
        descricao: 'Deixa uma linha só quando ela aparece repetida',
        ajuda: 'Mantém a primeira aparição de cada linha e descarta as cópias.',
        usage: '<texto com linhas>', examples: ['ana\\nbia\\nana — devolve ana e bia'],
        run: (t) => {
            const vistas = new Set()
            const fica = []
            let removidas = 0
            for (const l of linhasDe(t)) {
                const chave = l.trim().toLowerCase()
                if (!chave) continue
                if (vistas.has(chave)) { removidas++; continue }
                vistas.add(chave); fica.push(l.trim())
            }
            return { texto: juntarLinhas(fica), blocos: [{ emoji: '📊', titulo: 'Contas', linhas: [F.campo('Linhas repetidas removidas', removidas)] }] }
        }
    },
    {
        id: 'tirarespacoborda', sub: 'Transformar', emoji: '✂️', titulo: 'Sem espaço nas pontas',
        descricao: 'Tira o espaço do começo e do fim de cada linha',
        ajuda: 'Arruma lista colada com recuo estranho de outro aplicativo.',
        usage: '<texto com linhas>', examples: ['   um   \\n  dois — devolve um e dois sem recuo'],
        run: (t) => ({ texto: juntarLinhas(linhasDe(t).map(l => l.trim())) })
    },
    {
        id: 'slug', sub: 'Transformar', emoji: '🔗', titulo: 'Endereço amigável',
        descricao: 'Vira endereço de link, sem acento e com hífen',
        ajuda: 'Transforma um título em pedaço de link, do jeito que site gosta.',
        usage: '<título>', examples: ['Minha Loja de Pão — vira minha-loja-de-pao'],
        run: (t) => ({ texto: tirarAcento(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').replace(/-+$/, '') })
    },
    {
        id: 'nomearquivo', sub: 'Transformar', emoji: '📁', titulo: 'Nome de arquivo seguro',
        descricao: 'Vira nome de arquivo sem sinal proibido',
        ajuda: 'Troca sinal que o computador não aceita em nome de arquivo por sublinhado.',
        usage: '<título>', examples: ['Nota: 12/03 final? — vira Nota_12_03_final'],
        run: (t) => ({ texto: tirarAcento(t).replace(/[^A-Za-z0-9.\-]+/g, '_').replace(/_{2,}/g, '_').replace(/^_+/, '').replace(/_+$/, '').slice(0, 120) })
    },
    {
        id: 'espacado', sub: 'Transformar', emoji: '🫸', titulo: 'Letras espaçadas',
        descricao: 'Separa cada letra com um espaço',
        ajuda: 'Deixa o texto esticado, com uma letra longe da outra.',
        usage: '<texto>', examples: ['promoção — vira p r o m o ç ã o'],
        run: (t) => ({ texto: linhasDe(t).map(l => caracteresDe(l).join(' ')).join('\n') })
    },
    {
        id: 'alternado', sub: 'Transformar', emoji: '🎭', titulo: 'Letra sim, letra não',
        descricao: 'Alterna maiúscula e minúscula letra a letra',
        ajuda: 'Aquele jeito de escrever debochado, uma letra grande e outra pequena.',
        usage: '<texto>', examples: ['que engracado — vira QuE eNgRaCaDo'],
        run: (t) => {
            let i = 0
            return { texto: caracteresDe(t).map(c => (/[\p{L}]/u.test(c) ? (i++ % 2 === 0 ? c.toUpperCase() : c.toLowerCase()) : c)).join('') }
        }
    },
    {
        id: 'negrito', sub: 'Transformar', emoji: '🅱️', titulo: 'Negrito do WhatsApp',
        descricao: 'Põe o texto em negrito do WhatsApp',
        ajuda: 'Devolve o texto com asterisco em volta, que o WhatsApp mostra em negrito.',
        usage: '<texto>', examples: ['aviso importante — volta pronto para colar em negrito'],
        run: (t) => ({ texto: marcarLinhas(t, '*'), rotulo: 'Copie e cole' })
    },
    {
        id: 'italico', sub: 'Transformar', emoji: '✍️', titulo: 'Itálico do WhatsApp',
        descricao: 'Põe o texto em itálico do WhatsApp',
        ajuda: 'Devolve o texto com sublinhado em volta, que o WhatsApp mostra inclinado.',
        usage: '<texto>', examples: ['entre nós — volta pronto para colar em itálico'],
        run: (t) => ({ texto: marcarLinhas(t, '_'), rotulo: 'Copie e cole' })
    },
    {
        id: 'riscado', sub: 'Transformar', emoji: '🚮', titulo: 'Riscado do WhatsApp',
        descricao: 'Põe o texto riscado do WhatsApp',
        ajuda: 'Bom para mostrar o que mudou de ideia sem apagar.',
        usage: '<texto>', examples: ['preço antigo — volta riscado para colar'],
        run: (t) => ({ texto: marcarLinhas(t, '~'), rotulo: 'Copie e cole' })
    },
    {
        id: 'monoespacado', sub: 'Transformar', emoji: '⌨️', titulo: 'Letra de máquina',
        descricao: 'Põe o texto na letra de máquina do WhatsApp',
        ajuda: 'A letra de largura fixa do WhatsApp, boa para código e senha temporária.',
        usage: '<texto>', examples: ['codigo 1234 — volta na letra de máquina'],
        run: (t) => ({ texto: '```' + t.trim() + '```', rotulo: 'Copie e cole' })
    },
    {
        id: 'letraspequenas', sub: 'Transformar', emoji: '🔎', titulo: 'Letras miúdas',
        descricao: 'Transforma em letras miúdas de enfeite',
        ajuda: 'Troca cada letra por uma versão miúda. Funciona só com o alfabeto sem acento.',
        usage: '<texto>', examples: ['bem vindo — vira ʙᴇᴍ ᴠɪɴᴅᴏ'],
        run: (t) => ({ texto: trocarPorMapa(tirarAcento(t), MAPA_PEQUENAS) })
    },
    {
        id: 'caixaaltalarga', sub: 'Transformar', emoji: '🆎', titulo: 'Letras largas',
        descricao: 'Transforma em letras largas de enfeite',
        ajuda: 'As letras ficam com o dobro da largura, boas para nome de grupo.',
        usage: '<texto>', examples: ['loja aberta — vira ｌｏｊａ ａｂｅｒｔａ'],
        run: (t) => ({
            texto: caracteresDe(tirarAcento(t)).map(c => {
                const cod = c.charCodeAt(0)
                if (cod >= 33 && cod <= 126) return String.fromCharCode(cod + 0xFEE0)
                if (c === ' ') return '　'
                return c
            }).join('')
        })
    },
    {
        id: 'emojientrepalavras', sub: 'Transformar', emoji: '✨', titulo: 'Emoji entre as palavras',
        descricao: 'Põe um emoji no lugar de cada espaço',
        ajuda: 'Escolha o emoji como primeira coisa, ou deixe que eu uso ✨.',
        usage: '[emoji] <texto>', examples: ['🔥 promoção de hoje — vira promoção🔥de🔥hoje'],
        params: [{ nome: 'emoji', tipo: 'emoji', padrao: '✨' }],
        run: (t, p) => ({ texto: t.trim().split(/\s+/).join(p.emoji) })
    },
    {
        id: 'palavraporlinha', sub: 'Transformar', emoji: '📃', titulo: 'Uma palavra por linha',
        descricao: 'Coloca cada palavra do texto numa linha',
        ajuda: 'Vira lista vertical, uma palavra embaixo da outra.',
        usage: '<texto>', examples: ['arroz feijão farinha — devolve um item por linha'],
        run: (t) => ({ texto: juntarLinhas(t.trim().split(/\s+/).filter(Boolean)) })
    },
    {
        id: 'letraporlinha', sub: 'Transformar', emoji: '🪜', titulo: 'Uma letra por linha',
        descricao: 'Coloca cada letra do texto numa linha',
        ajuda: 'Escadinha de letras — serve de base para acróstico.',
        usage: '<palavra>', examples: ['amizade — devolve a, m, i, z, a, d, e em linhas'],
        run: (t) => ({ texto: juntarLinhas(caracteresDe(t.replace(/\s+/g, '')).slice(0, MAX_LINHAS_SAIDA)) })
    },
    {
        id: 'fraseporlinha', sub: 'Transformar', emoji: '📑', titulo: 'Uma frase por linha',
        descricao: 'Quebra o texto em uma frase por linha',
        ajuda: 'Separa o parágrafo grande em frases, uma embaixo da outra.',
        usage: '<texto>', examples: ['Ele veio. Ela foi. — devolve as duas frases separadas'],
        run: (t) => ({ texto: juntarLinhas(frasesDe(t)) })
    },
    {
        id: 'numerarlinhas', sub: 'Transformar', emoji: '🔟', titulo: 'Linhas numeradas',
        descricao: 'Põe um número na frente de cada linha',
        ajuda: 'Numera de 1 em diante, pulando as linhas vazias.',
        usage: '<texto com linhas>', examples: ['comprar pão\\npagar luz — devolve 1. e 2.'],
        run: (t) => {
            const ls = linhasDe(t).filter(l => l.trim())
            const largura = String(ls.length).length
            return { texto: juntarLinhas(ls.map((l, i) => `${String(i + 1).padStart(largura, '0')}. ${l.trim()}`)) }
        }
    },
    {
        id: 'ordenarlinhas', sub: 'Transformar', emoji: '🔤', titulo: 'Linhas em ordem alfabética',
        descricao: 'Ordena as linhas de A a Z',
        ajuda: 'Ordena respeitando acento do português, como uma lista de chamada.',
        usage: '<texto com linhas>', examples: ['caio\\nana\\nbia — devolve ana, bia, caio'],
        run: (t) => ({ texto: juntarLinhas(linhasDe(t).filter(l => l.trim()).map(l => l.trim()).sort((a, b) => a.localeCompare(b, 'pt-BR'))) })
    },
    {
        id: 'ordenarlinhasdesc', sub: 'Transformar', emoji: '🔽', titulo: 'Linhas de Z a A',
        descricao: 'Ordena as linhas de Z a A',
        ajuda: 'A mesma ordem alfabética, só que de trás para frente.',
        usage: '<texto com linhas>', examples: ['ana\\nbia\\ncaio — devolve caio, bia, ana'],
        run: (t) => ({ texto: juntarLinhas(linhasDe(t).filter(l => l.trim()).map(l => l.trim()).sort((a, b) => b.localeCompare(a, 'pt-BR'))) })
    },
    {
        id: 'ordenarpalavras', sub: 'Transformar', emoji: '🗃️', titulo: 'Palavras em ordem alfabética',
        descricao: 'Ordena as palavras do texto de A a Z',
        ajuda: 'Junta e ordena todas as palavras, útil para conferir uma lista solta.',
        usage: '<texto>', examples: ['uva banana caju — devolve banana, caju, uva'],
        run: (t) => ({ texto: palavrasDe(t).sort((a, b) => a.localeCompare(b, 'pt-BR')).join(' ') })
    },
    {
        id: 'blocos', sub: 'Transformar', emoji: '🧱', titulo: 'Quebrar em blocos',
        descricao: 'Quebra o texto em blocos de N caracteres',
        ajuda: 'Diga o tamanho do bloco na frente. Sem número, uso 60.',
        usage: '[tamanho] <texto>', examples: ['40 texto bem longo aqui — quebra de 40 em 40 letras'],
        params: [{ nome: 'tamanho', tipo: 'numero', padrao: 60, min: 5, max: 500 }],
        run: (t, p) => {
            const chars = caracteresDe(t)
            const out = []
            for (let i = 0; i < chars.length; i += p.tamanho) out.push(chars.slice(i, i + p.tamanho).join(''))
            return { texto: juntarLinhas(out), intro: `Quebrei em blocos de ${p.tamanho} caracteres.` }
        }
    },
    {
        id: 'alinhardireita', sub: 'Transformar', emoji: '➡️', titulo: 'Alinhar à direita',
        descricao: 'Empurra cada linha para a direita',
        ajuda: 'Diga a largura na frente. Sem número, uso 40.',
        usage: '[largura] <texto com linhas>', examples: ['30 aviso\\nurgente — alinha as duas à direita'],
        params: [{ nome: 'largura', tipo: 'numero', padrao: 40, min: 5, max: 200 }],
        run: (t, p) => ({ texto: juntarLinhas(linhasDe(t).map(l => l.trim().padStart(p.largura, ' '))) })
    },
    {
        id: 'alinharcentro', sub: 'Transformar', emoji: '↔️', titulo: 'Centralizar as linhas',
        descricao: 'Centraliza cada linha numa largura fixa',
        ajuda: 'Diga a largura na frente. Sem número, uso 40.',
        usage: '[largura] <texto com linhas>', examples: ['30 convite\\nhoje — centraliza as duas linhas'],
        params: [{ nome: 'largura', tipo: 'numero', padrao: 40, min: 5, max: 200 }],
        run: (t, p) => ({
            texto: juntarLinhas(linhasDe(t).map(l => {
                const s = l.trim()
                const folga = Math.max(0, p.largura - s.length)
                return ' '.repeat(Math.floor(folga / 2)) + s
            }))
        })
    },
    {
        id: 'recuar', sub: 'Transformar', emoji: '📐', titulo: 'Recuar as linhas',
        descricao: 'Põe um recuo de N espaços em cada linha',
        ajuda: 'Diga quantos espaços na frente. Sem número, uso 4.',
        usage: '[espaços] <texto com linhas>', examples: ['6 item um\\nitem dois — recua as duas linhas'],
        params: [{ nome: 'espacos', tipo: 'numero', padrao: 4, min: 1, max: 40 }],
        run: (t, p) => ({ texto: juntarLinhas(linhasDe(t).map(l => ' '.repeat(p.espacos) + l.trim())) })
    },
    {
        id: 'censurar', sub: 'Transformar', emoji: '🙊', titulo: 'Censurar palavrão',
        descricao: 'Tapa os palavrões deixando só a primeira letra',
        ajuda: 'Procuro os palavrões mais comuns e escondo o miolo com asterisco.',
        usage: '<texto>', examples: ['que merda de dia — vira que m**** de dia'],
        dica: 'A lista é curta de propósito. Não substitui a moderação do grupo.',
        run: (t) => {
            let saida = t
            let trocas = 0
            for (const p of PALAVROES) {
                saida = saida.replace(regexPalavra(p), m => {
                    trocas++
                    return m.charAt(0) + '*'.repeat(Math.max(1, Array.from(m).length - 1))
                })
            }
            return {
                texto: saida,
                blocos: [{ emoji: '📊', titulo: 'Contas', linhas: [F.campo('Palavras tapadas', trocas)] }],
                intro: trocas ? `Escondi ${trocas} palavra(s) feia(s).` : 'Nenhum palavrão da minha lista apareceu nesse texto.'
            }
        }
    },
    {
        id: 'trocarpalavra', sub: 'Transformar', emoji: '🔁', titulo: 'Trocar uma palavra por outra',
        descricao: 'Troca uma palavra por outra no texto inteiro',
        ajuda: 'Escreva velho>novo na frente do texto. Sem isso, eu destaco a palavra mais repetida.',
        usage: '<velho>novo> <texto>', examples: ['sol>lua o sol nasceu — vira o lua nasceu'],
        params: [{ nome: 'par', tipo: 'par', padrao: '' }],
        run: (t, p) => {
            if (p.par && p.par.includes('>')) {
                const [de, para] = p.par.split('>')
                if (!de) return { texto: t, intro: 'Faltou dizer qual palavra sair. Escreva assim: velho>novo.' }
                let trocas = 0
                const saida = t.replace(regexPalavra(de), () => { trocas++; return para })
                return { texto: saida, intro: `Troquei ${trocas} vez(es) "${de}" por "${para || '(nada)'}".` }
            }
            const top = contagemOrdenada(palavrasDe(t).map(w => w.toLowerCase()).filter(w => w.length > 3))[0]
            if (!top) return { texto: t, intro: 'Sem par velho>novo e sem palavra repetida, devolvi o texto como veio.' }
            const saida = t.replace(regexPalavra(top[0]), m => m.toUpperCase())
            return { texto: saida, intro: `Você não disse velho>novo, então destaquei a palavra mais repetida: "${top[0]}".` }
        }
    },
    {
        id: 'repetir', sub: 'Transformar', emoji: '🔂', titulo: 'Repetir o texto',
        descricao: 'Repete o texto o número de vezes que pedir',
        ajuda: 'Diga quantas vezes na frente. Sem número, repito 2 vezes.',
        usage: '[vezes] <texto>', examples: ['3 vai começar — repete a frase três vezes'],
        params: [{ nome: 'vezes', tipo: 'numero', padrao: 2, min: 1, max: 30 }],
        run: (t, p) => {
            const base = t.trim()
            const cabe = Math.max(1, Math.min(p.vezes, Math.floor(LIMITE_SAIDA / Math.max(1, base.length + 1))))
            return { texto: new Array(cabe).fill(base).join('\n'), intro: `Repeti ${cabe} vez(es).` }
        }
    },
    {
        id: 'refrao', sub: 'Transformar', emoji: '🎶', titulo: 'Refrão entre as linhas',
        descricao: 'Usa a primeira linha como refrão entre as outras',
        ajuda: 'A primeira linha vira o refrão e aparece entre cada uma das outras.',
        usage: '<refrão\\nlinha 1\\nlinha 2>', examples: ['ôôô\\nvamos\\nchegar — intercala o ôôô'],
        run: (t) => {
            const ls = linhasDe(t).map(l => l.trim()).filter(Boolean)
            if (ls.length < 2) return { texto: ls.join('\n'), intro: 'Mande o refrão na primeira linha e os versos nas linhas seguintes.' }
            const refrao = ls[0]
            const versos = ls.slice(1)
            const out = []
            for (const v of versos) { out.push(v, refrao) }
            return { texto: juntarLinhas(out), intro: `Refrão usado: "${refrao}".` }
        }
    },
    {
        id: 'preencherzero', sub: 'Transformar', emoji: '0️⃣', titulo: 'Zero à esquerda',
        descricao: 'Completa os números com zero à esquerda',
        ajuda: 'Diga quantos dígitos na frente. Sem número, uso 3.',
        usage: '[dígitos] <texto>', examples: ['4 sala 7 andar 2 — vira sala 0007 andar 0002'],
        params: [{ nome: 'digitos', tipo: 'numero', padrao: 3, min: 1, max: 12 }],
        run: (t, p) => ({ texto: t.replace(/\d+/g, n => n.padStart(p.digitos, '0')) })
    },
    {
        id: 'tabela', sub: 'Transformar', emoji: '📊', titulo: 'Tabela simples',
        descricao: 'Monta tabela alinhada a partir das linhas',
        ajuda: 'Separe as colunas com ponto e vírgula. Cada linha vira uma linha da tabela.',
        usage: '<nome;valor\\nnome;valor>', examples: ['pão;5\\nleite;7 — alinha as duas colunas'],
        run: (t) => {
            const linhas = linhasDe(t).map(l => l.trim()).filter(Boolean).slice(0, 60)
            const celulas = linhas.map(l => l.split(/\s*[;|]\s*/).map(c => c.trim()))
            const colunas = Math.max(1, ...celulas.map(c => c.length))
            const larguras = []
            for (let c = 0; c < colunas; c++) larguras[c] = Math.max(1, ...celulas.map(l => (l[c] || '').length))
            const montadas = celulas.map(l => {
                const pedacos = []
                for (let c = 0; c < colunas; c++) pedacos.push((l[c] || '').padEnd(larguras[c], ' '))
                return pedacos.join('  ').trimEnd()
            })
            return { texto: '```' + juntarLinhas(montadas) + '```', rotulo: 'Tabela', intro: `Montei ${montadas.length} linha(s) e ${colunas} coluna(s).` }
        }
    },
    {
        id: 'snakecase', sub: 'Transformar', emoji: '🐍', titulo: 'Tudo com sublinhado',
        descricao: 'Junta as palavras com sublinhado, em minúscula',
        ajuda: 'O formato que programador chama de snake_case.',
        usage: '<texto>', examples: ['minha lista de compras — vira minha_lista_de_compras'],
        run: (t) => ({ texto: tirarAcento(t).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+/, '').replace(/_+$/, '') })
    },
    {
        id: 'camelcase', sub: 'Transformar', emoji: '🐫', titulo: 'Palavras grudadas com corcova',
        descricao: 'Junta as palavras com maiúscula da segunda em diante',
        ajuda: 'O formato que programador chama de camelCase.',
        usage: '<texto>', examples: ['minha lista de compras — vira minhaListaDeCompras'],
        run: (t) => {
            const ps = palavrasDe(tirarAcento(t)).map(w => w.toLowerCase())
            return { texto: ps.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('') }
        }
    },
    {
        id: 'kebabcase', sub: 'Transformar', emoji: '🍢', titulo: 'Tudo com hífen',
        descricao: 'Junta as palavras com hífen, em minúscula',
        ajuda: 'O formato que programador chama de kebab-case.',
        usage: '<texto>', examples: ['minha lista de compras — vira minha-lista-de-compras'],
        run: (t) => ({ texto: tirarAcento(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').replace(/-+$/, '') })
    },
    {
        id: 'constantecase', sub: 'Transformar', emoji: '🗿', titulo: 'Maiúscula com sublinhado',
        descricao: 'Junta em maiúscula separando com sublinhado',
        ajuda: 'O formato de constante de programa: NOME_ASSIM.',
        usage: '<texto>', examples: ['limite de envio — vira LIMITE_DE_ENVIO'],
        run: (t) => ({ texto: tirarAcento(t).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+/, '').replace(/_+$/, '') })
    },
    {
        id: 'pascalcase', sub: 'Transformar', emoji: '🏛️', titulo: 'Palavras grudadas em maiúscula',
        descricao: 'Junta as palavras com maiúscula em todas',
        ajuda: 'O formato que programador chama de PascalCase.',
        usage: '<texto>', examples: ['minha lista de compras — vira MinhaListaDeCompras'],
        run: (t) => ({ texto: palavrasDe(tirarAcento(t)).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') })
    },
    {
        id: 'sigla', sub: 'Transformar', emoji: '🔠', titulo: 'Sigla das iniciais',
        descricao: 'Monta a sigla com a inicial de cada palavra',
        ajuda: 'Pego a primeira letra de cada palavra e monto a sigla.',
        usage: '<texto>', examples: ['organização das nações unidas — vira ONU'],
        run: (t) => {
            // Palavrinha de ligação ("de", "da", "e") não entra na sigla, salvo
            // quando a pessoa escreveu com maiúscula de propósito.
            const todas = palavrasDe(t)
            const ligacao = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'em'])
            const valem = todas.filter(w => !ligacao.has(w.toLowerCase()) || w.charAt(0) === w.charAt(0).toUpperCase())
            const base = valem.length ? valem : todas
            return {
                texto: base.map(w => w.charAt(0).toUpperCase()).join(''),
                intro: `Formei a sigla com ${base.length} palavra(s), pulando as de ligação.`
            }
        }
    },
    {
        id: 'sonumeros', sub: 'Transformar', emoji: '🧮', titulo: 'Só os números',
        descricao: 'Extrai só os números que aparecem no texto',
        ajuda: 'Puxo os números do meio do texto, na ordem em que aparecem.',
        usage: '<texto>', examples: ['pedido 42 custou 19 reais — devolve 42 e 19'],
        run: (t) => {
            const ns = t.match(/\d+(?:[.,]\d+)?/g) || []
            const soma = ns.reduce((a, n) => a + (parseFloat(n.replace(',', '.')) || 0), 0)
            return {
                texto: ns.join('\n'),
                blocos: [{ emoji: '📊', titulo: 'Contas', linhas: [F.campo('Quantidade', ns.length), F.campo('Soma', soma.toLocaleString('pt-BR'))] }]
            }
        }
    },
    {
        id: 'soletras', sub: 'Transformar', emoji: '🔤', titulo: 'Só as letras',
        descricao: 'Deixa só letras e espaço, tirando o resto',
        ajuda: 'Tira número, sinal e emoji, e deixa a palavra limpa.',
        usage: '<texto>', examples: ['pedido 42 #urgente — vira pedido urgente'],
        run: (t) => ({ texto: t.replace(/[^\p{L}\s]/gu, '').replace(/[ \t]{2,}/g, ' ').trim() })
    },
    {
        id: 'juntarlinhas', sub: 'Transformar', emoji: '🧷', titulo: 'Juntar tudo num parágrafo',
        descricao: 'Junta as linhas num parágrafo só',
        ajuda: 'Desfaz a quebra de linha e vira um texto corrido.',
        usage: '<texto com linhas>', examples: ['ele chegou\\ne foi embora — vira uma linha só'],
        run: (t) => ({ texto: linhasDe(t).map(l => l.trim()).filter(Boolean).join(' ') })
    },
    {
        id: 'separarporvirgula', sub: 'Transformar', emoji: '📝', titulo: 'Lista com vírgula',
        descricao: 'Junta as linhas ou palavras separando por vírgula',
        ajuda: 'Vira lista no meio da frase, com "e" antes do último item.',
        usage: '<texto com linhas>', examples: ['pão\\nleite\\novo — vira pão, leite e ovo'],
        run: (t) => {
            const itens = linhasDe(t).map(l => l.trim()).filter(Boolean)
            const lista = itens.length > 1 ? itens : t.trim().split(/\s+/)
            if (lista.length === 1) return { texto: lista[0] }
            return { texto: lista.slice(0, -1).join(', ') + ' e ' + lista[lista.length - 1] }
        }
    },
    {
        id: 'truncar', sub: 'Transformar', emoji: '🪓', titulo: 'Cortar no tamanho',
        descricao: 'Corta o texto no tamanho que você pedir',
        ajuda: 'Diga quantos caracteres na frente. Sem número, corto em 100.',
        usage: '[tamanho] <texto>', examples: ['50 texto grande demais para o campo — corta em 50'],
        params: [{ nome: 'tamanho', tipo: 'numero', padrao: 100, min: 5, max: 2000 }],
        run: (t, p) => {
            const chars = caracteresDe(t.trim())
            const cortado = chars.length <= p.tamanho ? t.trim() : chars.slice(0, p.tamanho - 1).join('') + '…'
            return { texto: cortado, intro: `Tamanho pedido: ${p.tamanho}. Ficou com ${caracteresDe(cortado).length}.` }
        }
    },
    {
        id: 'filtrarlinhas', sub: 'Transformar', emoji: '🔍', titulo: 'Só as linhas com a palavra',
        descricao: 'Mantém só as linhas que têm a palavra',
        ajuda: 'Escreva a palavra na frente e depois o texto com várias linhas.',
        usage: '<palavra> <texto com linhas>', examples: ['pago joão pago\\nmaria deve — devolve a linha do joão'],
        params: [{ nome: 'palavra', tipo: 'palavra', padrao: '' }],
        run: (t, p) => {
            const alvo = tirarAcento(String(p.palavra || '')).toLowerCase()
            if (!alvo) return { texto: t, intro: 'Sem palavra para filtrar, devolvi o texto inteiro.' }
            const ls = linhasDe(t).filter(l => tirarAcento(l).toLowerCase().includes(alvo))
            return {
                texto: juntarLinhas(ls.map(l => l.trim())),
                intro: `Procurei "${p.palavra}" e achei em ${ls.length} linha(s).`
            }
        }
    }
]

/** Confere os dígitos verificadores de um CPF (só a conta, nada de consulta). */
function cpfValido(bruto) {
    const n = String(bruto).replace(/\D/g, '')
    if (n.length !== 11) return false
    if (/^(\d)\1{10}$/.test(n)) return false
    for (const corte of [9, 10]) {
        let soma = 0
        for (let i = 0; i < corte; i++) soma += Number(n[i]) * (corte + 1 - i)
        let dv = (soma * 10) % 11
        if (dv === 10) dv = 0
        if (dv !== Number(n[corte])) return false
    }
    return true
}

/** Bloco padrão de "achei isto no texto" para os localizadores. */
function blocoAchados(achados, rotulo, emoji) {
    const unicos = [...new Set(achados)]
    return {
        texto: unicos.length ? juntarLinhas(unicos.map(a => '• ' + a)) : '',
        intro: unicos.length
            ? `Achei ${unicos.length} ${rotulo}${unicos.length > 1 ? 's' : ''} no texto.`
            : `Não achei nenhum ${rotulo} nesse texto.`,
        emojiRotulo: emoji,
        rotulo: rotulo.charAt(0).toUpperCase() + rotulo.slice(1)
    }
}

const OPS_ANALISAR = [
    {
        id: 'contarcaracteres', sub: 'Analisar', emoji: '🔢', titulo: 'Quantos caracteres',
        descricao: 'Conta os caracteres do texto, com e sem espaço',
        ajuda: 'Diz o tamanho do texto, bom para campo com limite de letras.',
        usage: '<texto>', examples: ['bom dia pessoal — diz quantos caracteres tem'],
        run: (t) => {
            const chars = caracteresDe(t)
            const semEspaco = chars.filter(c => !/\s/.test(c))
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Tamanho', linhas: [
                        F.campo('Com espaço', chars.length),
                        F.campo('Sem espaço', semEspaco.length),
                        F.campo('Só letras', (t.match(/\p{L}/gu) || []).length),
                        F.campo('Só números', (t.match(/\p{N}/gu) || []).length)
                    ]
                }],
                intro: `Esse texto tem ${chars.length} caracteres contando os espaços.`
            }
        }
    },
    {
        id: 'contarsemespaco', sub: 'Analisar', emoji: '📐', titulo: 'Caracteres sem espaço',
        descricao: 'Conta só os caracteres que não são espaço',
        ajuda: 'A conta que sistema de mensagem costuma usar para cobrar SMS.',
        usage: '<texto>', examples: ['bom dia pessoal — conta sem os espaços'],
        run: (t) => {
            const n = caracteresDe(t).filter(c => !/\s/.test(c)).length
            const sms = Math.ceil(n / 160) || 0
            return {
                blocos: [{ emoji: '📊', titulo: 'Tamanho', linhas: [F.campo('Sem espaço', n), F.campo('Daria SMS de 160', sms)] }],
                intro: `Fora os espaços, sobram ${n} caracteres.`
            }
        }
    },
    {
        id: 'contarpalavras', sub: 'Analisar', emoji: '📝', titulo: 'Quantas palavras',
        descricao: 'Conta as palavras e as palavras diferentes',
        ajuda: 'Diz quantas palavras tem e quantas são diferentes umas das outras.',
        usage: '<texto>', examples: ['o rato roeu a roupa do rei — conta as palavras'],
        run: (t) => {
            const ps = palavrasDe(t)
            const dif = new Set(ps.map(w => tirarAcento(w).toLowerCase()))
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Contas', linhas: [
                        F.campo('Palavras', ps.length),
                        F.campo('Palavras diferentes', dif.size),
                        F.campo('Riqueza', ps.length ? Math.round((dif.size / ps.length) * 100) + '%' : '0%')
                    ]
                }],
                intro: `São ${ps.length} palavras, sendo ${dif.size} diferentes.`
            }
        }
    },
    {
        id: 'contarfrases', sub: 'Analisar', emoji: '📄', titulo: 'Quantas frases',
        descricao: 'Conta as frases separadas por ponto final',
        ajuda: 'Conta quantas frases o texto tem e mostra a maior delas.',
        usage: '<texto>', examples: ['Ele veio. Ela foi embora. — conta duas frases'],
        run: (t) => {
            const fs = frasesDe(t)
            const maior = fs.slice().sort((a, b) => b.length - a.length)[0] || ''
            return {
                blocos: [
                    { emoji: '📊', titulo: 'Contas', linhas: [F.campo('Frases', fs.length), F.campo('Maior frase', maior.length + ' caracteres')] },
                    { emoji: '🔎', titulo: 'A maior delas', linhas: [maior.slice(0, 300)] }
                ],
                intro: `Contei ${fs.length} frase(s) nesse texto.`
            }
        }
    },
    {
        id: 'contarparagrafos', sub: 'Analisar', emoji: '🧾', titulo: 'Quantos parágrafos',
        descricao: 'Conta os parágrafos separados por linha em branco',
        ajuda: 'Cada bloco separado por linha em branco conta como um parágrafo.',
        usage: '<texto>', examples: ['bloco um\\n\\nbloco dois — conta dois parágrafos'],
        run: (t) => {
            const ps = paragrafosDe(t)
            const palavras = ps.map(p => palavrasDe(p).length)
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Contas', linhas: [
                        F.campo('Parágrafos', ps.length),
                        F.campo('Média de palavras', ps.length ? Math.round(palavras.reduce((a, b) => a + b, 0) / ps.length) : 0),
                        F.campo('Maior parágrafo', (Math.max(0, ...palavras)) + ' palavras')
                    ]
                }],
                intro: `Esse texto tem ${ps.length} parágrafo(s).`
            }
        }
    },
    {
        id: 'contarlinhas', sub: 'Analisar', emoji: '📋', titulo: 'Quantas linhas',
        descricao: 'Conta as linhas, incluindo as vazias',
        ajuda: 'Conta linha por linha e diz quantas estão em branco.',
        usage: '<texto com linhas>', examples: ['um\\n\\ndois — diz que são três linhas'],
        run: (t) => {
            const ls = linhasDe(t)
            const vazias = ls.filter(l => !l.trim()).length
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Contas', linhas: [
                        F.campo('Linhas', ls.length),
                        F.campo('Com conteúdo', ls.length - vazias),
                        F.campo('Em branco', vazias)
                    ]
                }],
                intro: `São ${ls.length} linha(s), ${vazias} delas em branco.`
            }
        }
    },
    {
        id: 'tempoleitura', sub: 'Analisar', emoji: '⏱️', titulo: 'Tempo de leitura',
        descricao: 'Estima quanto tempo leva para ler o texto',
        ajuda: 'Uso a conta de 200 palavras por minuto, que é leitura tranquila.',
        usage: '<texto>', examples: ['cole aqui o texto inteiro — estima o tempo de leitura'],
        run: (t) => {
            const n = palavrasDe(t).length
            const seg = Math.round((n / 200) * 60)
            return {
                blocos: [{ emoji: '📊', titulo: 'Conta', linhas: [F.campo('Palavras', n), F.campo('Leitura', F.tempo(seg * 1000)), F.campo('Ritmo usado', '200 palavras por minuto')] }],
                intro: `Dá para ler em mais ou menos ${F.tempo(seg * 1000)}.`
            }
        }
    },
    {
        id: 'tempofala', sub: 'Analisar', emoji: '🎤', titulo: 'Tempo falando',
        descricao: 'Estima quanto tempo leva para falar o texto',
        ajuda: 'Uso 130 palavras por minuto, que é o ritmo de quem fala com calma.',
        usage: '<texto>', examples: ['cole o roteiro do áudio — estima a duração'],
        run: (t) => {
            const n = palavrasDe(t).length
            const seg = Math.round((n / 130) * 60)
            return {
                blocos: [{ emoji: '📊', titulo: 'Conta', linhas: [F.campo('Palavras', n), F.campo('Falando', F.tempo(seg * 1000)), F.campo('Ritmo usado', '130 palavras por minuto')] }],
                intro: `Falando com calma, esse texto rende ${F.tempo(seg * 1000)} de áudio.`
            }
        }
    },
    {
        id: 'palavrasrepetidas', sub: 'Analisar', emoji: '🔁', titulo: 'Palavras mais repetidas',
        descricao: 'Mostra as palavras que mais aparecem no texto',
        ajuda: 'Ignoro palavrinha de ligação para a lista não virar só "de" e "que".',
        usage: '<texto>', examples: ['cole um texto longo — mostra o que mais se repete'],
        run: (t) => {
            const vazias = new Set(['de', 'da', 'do', 'das', 'dos', 'que', 'com', 'para', 'por', 'uma', 'um', 'os', 'as', 'no', 'na', 'em', 'se', 'ao', 'e', 'o', 'a'])
            const ps = palavrasDe(t).map(w => tirarAcento(w).toLowerCase()).filter(w => w.length > 2 && !vazias.has(w))
            const top = contagemOrdenada(ps).filter(([, n]) => n > 1).slice(0, 12)
            return {
                blocos: [{ emoji: '🏆', titulo: 'Campeãs de repetição', linhas: top.length ? top.map(([w, n]) => `• ${w} — ${n} vez(es)`) : ['Nenhuma palavra apareceu mais de uma vez.'] }],
                intro: top.length ? `A palavra mais repetida é "${top[0][0]}", com ${top[0][1]} aparições.` : 'Nesse texto nenhuma palavra se repetiu.'
            }
        }
    },
    {
        id: 'palavrasraras', sub: 'Analisar', emoji: '💎', titulo: 'Palavras que só aparecem uma vez',
        descricao: 'Lista as palavras que aparecem uma única vez',
        ajuda: 'Serve para achar termo solto que talvez precise de explicação.',
        usage: '<texto>', examples: ['cole um texto longo — lista as palavras únicas'],
        run: (t) => {
            const ps = palavrasDe(t).map(w => tirarAcento(w).toLowerCase()).filter(w => w.length > 3)
            const unicas = contagemOrdenada(ps).filter(([, n]) => n === 1).map(([w]) => w)
            return {
                texto: unicas.length ? unicas.slice(0, 80).join(', ') : '',
                rotulo: 'Só uma aparição',
                intro: `${unicas.length} palavra(s) apareceram uma vez só, de ${new Set(ps).size} diferentes.`
            }
        }
    },
    {
        id: 'mediafrase', sub: 'Analisar', emoji: '📏', titulo: 'Tamanho médio das frases',
        descricao: 'Diz quantas palavras tem a frase média',
        ajuda: 'Frase acima de 25 palavras costuma cansar quem lê no celular.',
        usage: '<texto>', examples: ['cole um parágrafo — diz a média por frase'],
        run: (t) => {
            const fs = frasesDe(t)
            const contas = fs.map(f => palavrasDe(f).length)
            const media = contas.length ? contas.reduce((a, b) => a + b, 0) / contas.length : 0
            const longas = contas.filter(n => n > 25).length
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Contas', linhas: [
                        F.campo('Frases', fs.length),
                        F.campo('Média de palavras', media.toFixed(1)),
                        F.campo('Frases acima de 25 palavras', longas)
                    ]
                }],
                intro: `A frase média tem ${media.toFixed(1)} palavras.`,
                dica: longas ? 'Frases muito longas cansam no celular. Vale quebrar em duas.' : 'Tamanho de frase confortável para leitura no celular.'
            }
        }
    },
    {
        id: 'mediapalavra', sub: 'Analisar', emoji: '🔠', titulo: 'Tamanho médio das palavras',
        descricao: 'Diz quantas letras tem a palavra média',
        ajuda: 'Palavra comprida demais deixa o texto pesado de ler.',
        usage: '<texto>', examples: ['cole um parágrafo — diz a média de letras'],
        run: (t) => {
            const ps = palavrasDe(t)
            const media = ps.length ? ps.reduce((a, w) => a + Array.from(w).length, 0) / ps.length : 0
            const maior = ps.slice().sort((a, b) => b.length - a.length)[0] || '—'
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Contas', linhas: [
                        F.campo('Palavras', ps.length),
                        F.campo('Média de letras', media.toFixed(1)),
                        F.campo('Maior palavra', maior)
                    ]
                }],
                intro: `A palavra média tem ${media.toFixed(1)} letras.`
            }
        }
    },
    {
        id: 'legibilidade', sub: 'Analisar', emoji: '🎓', titulo: 'Facilidade de leitura',
        descricao: 'Dá uma nota de facilidade de leitura ao texto',
        ajuda: 'Junto tamanho de frase e de palavra numa nota de 0 a 100. Quanto maior, mais fácil.',
        usage: '<texto>', examples: ['cole um texto — devolve a nota de facilidade'],
        run: (t) => {
            const ps = palavrasDe(t)
            const fs = frasesDe(t)
            const silabas = ps.reduce((a, w) => a + silabasDe(w), 0)
            const ppf = fs.length ? ps.length / fs.length : ps.length
            const spp = ps.length ? silabas / ps.length : 0
            const nota = Math.max(0, Math.min(100, 248.835 - 1.015 * ppf - 84.6 * spp))
            const faixa = nota >= 75 ? 'muito fácil, qualquer pessoa entende'
                : nota >= 50 ? 'fácil, dá para ler sem esforço'
                    : nota >= 25 ? 'puxado, exige atenção'
                        : 'difícil, melhor reescrever mais curto'
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Nota', linhas: [
                        F.campo('Facilidade', Math.round(nota) + ' de 100'),
                        F.barra(nota / 100),
                        F.campo('Palavras por frase', ppf.toFixed(1)),
                        F.campo('Sílabas por palavra', spp.toFixed(2))
                    ]
                }],
                intro: `Nota ${Math.round(nota)} de 100: ${faixa}.`,
                dica: 'A conta é aproximada e vale para português corrido, não para lista nem para código.'
            }
        }
    },
    {
        id: 'capsexcessivo', sub: 'Analisar', emoji: '📢', titulo: 'Está gritando?',
        descricao: 'Mede quanto do texto está em letra maiúscula',
        ajuda: 'Muita maiúscula soa como grito no grupo. Aqui você confere antes de mandar.',
        usage: '<texto>', examples: ['ATENÇÃO pessoal — mede a proporção de maiúscula'],
        run: (t) => {
            const letras = t.match(/\p{L}/gu) || []
            const maiusc = letras.filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length
            const pct = letras.length ? (maiusc / letras.length) * 100 : 0
            const veredito = pct > 60 ? 'está gritando' : pct > 30 ? 'está no limite' : 'está em tom normal'
            return {
                blocos: [{ emoji: '📊', titulo: 'Medida', linhas: [F.campo('Letras', letras.length), F.campo('Em maiúscula', maiusc), F.barra(pct / 100)] }],
                intro: `${Math.round(pct)}% das letras estão em maiúscula: ${veredito}.`
            }
        }
    },
    {
        id: 'contaremoji', sub: 'Analisar', emoji: '😀', titulo: 'Quantos emoji',
        descricao: 'Conta os emoji e diz quais mais aparecem',
        ajuda: 'Conta as figurinhas do texto e mostra o ranking delas.',
        usage: '<texto>', examples: ['oi 😀 tchau 😀 🎉 — conta três emoji'],
        run: (t) => {
            const achados = t.match(/\p{Extended_Pictographic}/gu) || []
            const top = contagemOrdenada(achados).slice(0, 10)
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Contagem', linhas: [
                        F.campo('Emoji no total', achados.length),
                        F.campo('Emoji diferentes', new Set(achados).size),
                        ...top.map(([e, n]) => `• ${e} — ${n} vez(es)`)
                    ]
                }],
                intro: achados.length ? `Achei ${achados.length} emoji nesse texto.` : 'Esse texto não tem nenhum emoji.'
            }
        }
    },
    {
        id: 'detectarportugues', sub: 'Analisar', emoji: '🇧🇷', titulo: 'Parece português?',
        descricao: 'Palpita se o texto está em português pelas marcas',
        ajuda: 'Procuro ç, ã, õ, terminação em ção e palavras comuns do português.',
        usage: '<texto>', examples: ['a canção não parou — diz que parece português'],
        dica: 'É palpite por marcas do idioma, sem consultar nada fora do bot.',
        run: (t) => {
            const baixo = t.toLowerCase()
            const marcas = MARCAS_PT.filter(m => baixo.includes(m))
            const ps = new Set(palavrasDe(baixo))
            const comuns = PALAVRAS_PT.filter(p => ps.has(p))
            const pontos = marcas.length * 2 + comuns.length * 3
            const veredito = pontos >= 8 ? 'quase certeza que é português'
                : pontos >= 3 ? 'parece português, mas com poucas pistas'
                    : 'não achei marca suficiente de português'
            return {
                blocos: [{
                    emoji: '🔎', titulo: 'Pistas encontradas', linhas: [
                        F.campo('Marcas de escrita', marcas.length ? marcas.join(', ') : 'nenhuma'),
                        F.campo('Palavras típicas', comuns.length ? comuns.join(', ') : 'nenhuma'),
                        F.campo('Pontos', pontos)
                    ]
                }],
                intro: `Meu palpite: ${veredito}.`
            }
        }
    },
    {
        id: 'acharemail', sub: 'Analisar', emoji: '📧', titulo: 'Achar e-mail no texto',
        descricao: 'Procura endereços de e-mail dentro do texto',
        ajuda: 'Puxo os e-mails do meio de um texto grande, sem você caçar a olho.',
        usage: '<texto>', examples: ['fale com ana@site.com hoje — devolve o endereço'],
        run: (t) => blocoAchados(t.match(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu) || [], 'e-mail', '📧')
    },
    {
        id: 'achartelefone', sub: 'Analisar', emoji: '📞', titulo: 'Achar telefone no texto',
        descricao: 'Procura números de telefone dentro do texto',
        ajuda: 'Reconheço o formato brasileiro, com ou sem parêntese e traço.',
        usage: '<texto>', examples: ['ligue (35) 99737-9643 amanhã — devolve o número'],
        run: (t) => blocoAchados(t.match(/(?:\+?55[\s.-]?)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/g) || [], 'telefone', '📞')
    },
    {
        id: 'acharlink', sub: 'Analisar', emoji: '🔗', titulo: 'Achar link no texto',
        descricao: 'Procura endereços de site dentro do texto',
        ajuda: 'Separo os links do resto do recado para você conferir antes de clicar.',
        usage: '<texto>', examples: ['veja em https://exemplo.com agora — devolve o link'],
        dica: 'Confira o endereço antes de abrir. Link parecido com o certo é golpe comum.',
        run: (t) => blocoAchados(t.match(/(?:https?:\/\/|www\.)\S{2,}/gi) || [], 'link', '🔗')
    },
    {
        id: 'acharcpf', sub: 'Analisar', emoji: '🪪', titulo: 'Achar CPF no texto',
        descricao: 'Procura CPF no texto e confere os dígitos',
        ajuda: 'Acho o número e confiro a conta dos dois dígitos finais.',
        usage: '<texto>', examples: ['cadastro 529.982.247-25 aprovado — confere o CPF'],
        dica: 'Confiro só a conta matemática. Não consulto nenhum cadastro, e não guardo o número.',
        run: (t) => {
            const achados = [...new Set(t.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g) || [])]
            return {
                texto: achados.length ? juntarLinhas(achados.map(c => `• ${c} — ${cpfValido(c) ? 'conta bate' : 'conta não bate'}`)) : '',
                rotulo: 'CPF encontrado',
                intro: achados.length ? `Achei ${achados.length} número no formato de CPF.` : 'Não achei nenhum número no formato de CPF.'
            }
        }
    },
    {
        id: 'achardata', sub: 'Analisar', emoji: '📅', titulo: 'Achar data no texto',
        descricao: 'Procura datas escritas com barra ou traço',
        ajuda: 'Pego datas do tipo 05/11 ou 05-11-2026 no meio do recado.',
        usage: '<texto>', examples: ['a reunião é 05/11/2026 às 14h — devolve a data'],
        run: (t) => blocoAchados(t.match(/\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?/g) || [], 'data', '📅')
    },
    {
        id: 'achardinheiro', sub: 'Analisar', emoji: '💰', titulo: 'Achar valor em dinheiro',
        descricao: 'Procura valores em reais dentro do texto',
        ajuda: 'Pego os valores escritos com R$ e ainda somo tudo.',
        usage: '<texto>', examples: ['pão R$ 5,00 e leite R$ 7,50 — soma os dois'],
        run: (t) => {
            const achados = t.match(/R\$\s?[\d.,]+/gi) || []
            const soma = achados.reduce((a, v) => {
                const n = parseFloat(String(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'))
                return a + (isNaN(n) ? 0 : n)
            }, 0)
            return {
                texto: achados.length ? juntarLinhas(achados.map(a => '• ' + a.trim())) : '',
                rotulo: 'Valores encontrados',
                blocos: achados.length ? [{ emoji: '🧮', titulo: 'Total', linhas: [F.campo('Soma', 'R$ ' + soma.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))] }] : [],
                intro: achados.length ? `Achei ${achados.length} valor(es) em reais.` : 'Não achei nenhum valor escrito com R$ nesse texto.'
            }
        }
    },
    {
        id: 'acharhashtag', sub: 'Analisar', emoji: '#️⃣', titulo: 'Achar hashtag no texto',
        descricao: 'Separa as hashtags usadas no texto',
        ajuda: 'Junto as marcações com cerquilha para você reaproveitar na próxima postagem.',
        usage: '<texto>', examples: ['bom dia #domingo #café — devolve as duas hashtags'],
        run: (t) => blocoAchados(t.match(/#[\p{L}\p{N}_]+/gu) || [], 'hashtag', '#️⃣')
    },
    {
        id: 'acharmencao', sub: 'Analisar', emoji: '📣', titulo: 'Achar menção no texto',
        descricao: 'Separa as menções com arroba no texto',
        ajuda: 'Lista quem foi marcado com arroba dentro do recado.',
        usage: '<texto>', examples: ['obrigado @ana e @bia — devolve as duas menções'],
        run: (t) => blocoAchados(t.match(/@[\p{L}\p{N}_.]+/gu) || [], 'menção', '📣')
    },
    {
        id: 'compararTextos', sub: 'Analisar', emoji: '⚖️', titulo: 'Comparar dois textos',
        descricao: 'Mede o quanto dois textos se parecem',
        ajuda: 'Separe os dois textos com uma barra em pé. Sem barra, comparo a primeira linha com o resto.',
        usage: '<texto 1 | texto 2>', examples: ['bom dia | boa noite — mostra o quanto se parecem'],
        run: (t) => {
            const [a, b] = doisPedacos(t)
            const pa = new Set(palavrasDe(a).map(w => tirarAcento(w).toLowerCase()))
            const pb = new Set(palavrasDe(b).map(w => tirarAcento(w).toLowerCase()))
            const comuns = [...pa].filter(w => pb.has(w))
            const uniao = new Set([...pa, ...pb])
            const parecido = uniao.size ? (comuns.length / uniao.size) * 100 : 0
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Resultado', linhas: [
                        F.campo('Texto 1', palavrasDe(a).length + ' palavras'),
                        F.campo('Texto 2', palavrasDe(b).length + ' palavras'),
                        F.campo('Palavras em comum', comuns.length),
                        F.barra(parecido / 100)
                    ]
                }, { emoji: '🤝', titulo: 'Palavras dos dois', linhas: [comuns.slice(0, 40).join(', ') || 'nenhuma palavra em comum'] }],
                intro: `Os dois textos se parecem ${Math.round(parecido)}%.`
            }
        }
    },
    {
        id: 'diferencalinhas', sub: 'Analisar', emoji: '🔀', titulo: 'Diferença entre duas versões',
        descricao: 'Mostra o que mudou de uma versão para a outra',
        ajuda: 'Separe as duas versões com uma barra em pé e eu comparo linha a linha.',
        usage: '<versão 1 | versão 2>', examples: ['pão\\nleite | pão\\novo — mostra o que saiu e o que entrou'],
        run: (t) => {
            const [a, b] = doisPedacos(t)
            const la = linhasDe(a).map(l => l.trim()).filter(Boolean)
            const lb = linhasDe(b).map(l => l.trim()).filter(Boolean)
            const setA = new Set(la), setB = new Set(lb)
            const sairam = la.filter(l => !setB.has(l))
            const entraram = lb.filter(l => !setA.has(l))
            return {
                blocos: [
                    { emoji: '➖', titulo: 'Saiu da versão nova', linhas: sairam.length ? sairam.slice(0, 40).map(l => '• ' + l) : ['nada saiu'] },
                    { emoji: '➕', titulo: 'Entrou na versão nova', linhas: entraram.length ? entraram.slice(0, 40).map(l => '• ' + l) : ['nada entrou'] }
                ],
                intro: `Comparei as duas versões: ${sairam.length} linha(s) saíram e ${entraram.length} entraram.`
            }
        }
    },
    {
        id: 'acharpalavra', sub: 'Analisar', emoji: '🔍', titulo: 'Procurar palavra no texto',
        descricao: 'Conta e mostra onde a palavra aparece',
        ajuda: 'Escreva a palavra procurada na frente e depois o texto.',
        usage: '<palavra> <texto>', examples: ['rato o rato roeu a roupa do rato — acha as duas vezes'],
        params: [{ nome: 'palavra', tipo: 'palavra', padrao: '' }],
        run: (t, p) => {
            const alvo = String(p.palavra || '')
            if (!alvo) return { intro: 'Escreva a palavra procurada antes do texto, assim: palavra e depois o texto.', blocos: [] }
            const ls = linhasDe(t)
            const onde = []
            let total = 0
            ls.forEach((l, i) => {
                const m = l.match(regexPalavra(alvo))
                if (m) { total += m.length; onde.push(`• linha ${i + 1}: ${l.trim().slice(0, 120)}`) }
            })
            return {
                blocos: [{ emoji: '📊', titulo: 'Resultado', linhas: [F.campo('Palavra', alvo), F.campo('Vezes encontrada', total)] },
                { emoji: '📄', titulo: 'Onde aparece', linhas: onde.length ? onde.slice(0, 30) : ['não apareceu em nenhuma linha'] }],
                intro: total ? `Achei "${alvo}" ${total} vez(es) no texto.` : `Não achei "${alvo}" nesse texto.`
            }
        }
    },
    {
        id: 'anagrama', sub: 'Analisar', emoji: '🔤', titulo: 'É anagrama?',
        descricao: 'Diz se duas palavras usam as mesmas letras',
        ajuda: 'Mande duas palavras. Comparo letra por letra, ignorando acento e ordem.',
        usage: '<palavra 1> <palavra 2>', examples: ['roma amor — diz que é anagrama'],
        run: (t) => {
            const [a, b] = duasPalavras(t)
            const chave = s => tirarAcento(String(s).toLowerCase()).replace(/[^a-z0-9]/g, '').split('').sort().join('')
            const ka = chave(a), kb = chave(b)
            const igual = ka === kb && ka.length > 0
            return {
                blocos: [{
                    emoji: '🧩', titulo: 'Comparação', linhas: [
                        F.campo('Palavra 1', a || '—'), F.campo('Palavra 2', b || '—'),
                        F.campo('Letras de cada uma', `${ka || '—'} / ${kb || '—'}`)
                    ]
                }],
                intro: igual ? `Sim: "${a}" e "${b}" usam exatamente as mesmas letras.` : `Não: "${a}" e "${b}" não usam as mesmas letras.`
            }
        }
    },
    {
        id: 'palindromo', sub: 'Analisar', emoji: '🪞', titulo: 'É palíndromo?',
        descricao: 'Diz se o texto fica igual lido ao contrário',
        ajuda: 'Ignoro acento, espaço e pontuação antes de comparar.',
        usage: '<texto>', examples: ['socorram me subi no onibus em marrocos — diz que é palíndromo'],
        run: (t) => {
            const limpo = tirarAcento(t.toLowerCase()).replace(/[^a-z0-9]/g, '')
            const contrario = limpo.split('').reverse().join('')
            const e = limpo.length > 0 && limpo === contrario
            return {
                blocos: [{ emoji: '🧩', titulo: 'Comparação', linhas: [F.campo('Só as letras', limpo.slice(0, 200) || '—'), F.campo('De trás para frente', contrario.slice(0, 200) || '—')] }],
                intro: e ? 'Sim, esse texto é palíndromo: fica igual lido ao contrário.' : 'Não é palíndromo: lido ao contrário fica diferente.'
            }
        }
    },
    {
        id: 'rima', sub: 'Analisar', emoji: '🎵', titulo: 'As palavras rimam?',
        descricao: 'Diz se duas palavras rimam pelo final',
        ajuda: 'Mande duas palavras. Comparo o final delas, que é onde a rima mora.',
        usage: '<palavra 1> <palavra 2>', examples: ['coração emoção — diz que rimam'],
        run: (t) => {
            const [a, b] = duasPalavras(t)
            const fim = s => tirarAcento(String(s).toLowerCase()).replace(/[^a-z]/g, '')
            const fa = fim(a), fb = fim(b)
            let iguais = 0
            while (iguais < fa.length && iguais < fb.length && fa[fa.length - 1 - iguais] === fb[fb.length - 1 - iguais]) iguais++
            const rima = iguais >= 2 && fa !== fb
            return {
                blocos: [{
                    emoji: '🧩', titulo: 'Final das palavras', linhas: [
                        F.campo('Palavra 1', a || '—'), F.campo('Palavra 2', b || '—'),
                        F.campo('Letras finais iguais', iguais)
                    ]
                }],
                intro: rima ? `Rimam: "${a}" e "${b}" terminam com ${iguais} letras iguais.`
                    : fa === fb ? 'São a mesma palavra, então não conta como rima.'
                        : `Não rimam: só ${iguais} letra(s) do final batem.`
            }
        }
    },
    {
        id: 'contarsilabas', sub: 'Analisar', emoji: '🗣️', titulo: 'Quantas sílabas',
        descricao: 'Conta as sílabas de cada palavra do texto',
        ajuda: 'Conto por grupos de vogais. É aproximação, boa para verso e para nome.',
        usage: '<texto>', examples: ['saudade infinita — conta as sílabas de cada uma'],
        run: (t) => {
            const ps = palavrasDe(t).slice(0, 80)
            const total = ps.reduce((a, w) => a + silabasDe(w), 0)
            return {
                texto: juntarLinhas(ps.map(w => `• ${w} — ${silabasDe(w)} sílaba(s)`)),
                rotulo: 'Palavra por palavra',
                blocos: [{ emoji: '📊', titulo: 'Total', linhas: [F.campo('Palavras', ps.length), F.campo('Sílabas somadas', total)] }],
                intro: `Contei ${total} sílaba(s) em ${ps.length} palavra(s).`
            }
        }
    },
    {
        id: 'metricaverso', sub: 'Analisar', emoji: '📜', titulo: 'Métrica dos versos',
        descricao: 'Conta as sílabas de cada verso do poema',
        ajuda: 'Mande um verso por linha e eu conto as sílabas de cada um.',
        usage: '<verso 1\\nverso 2>', examples: ['minha terra tem palmeiras\\nonde canta o sabiá — conta as duas'],
        dica: 'A contagem é por grupo de vogais, então não é a escansão exata da métrica clássica.',
        run: (t) => {
            const versos = linhasDe(t).map(l => l.trim()).filter(Boolean).slice(0, 60)
            const contas = versos.map(v => palavrasDe(v).reduce((a, w) => a + silabasDe(w), 0))
            const igual = new Set(contas).size === 1 && contas.length > 1
            return {
                texto: juntarLinhas(versos.map((v, i) => `${String(contas[i]).padStart(2, ' ')} sílabas — ${v}`)),
                rotulo: 'Verso a verso',
                intro: igual ? `Todos os ${versos.length} versos têm ${contas[0]} sílabas: a métrica está regular.`
                    : `Contei ${versos.length} verso(s), variando de ${contas.length ? Math.min(...contas) : 0} a ${contas.length ? Math.max(...contas) : 0} sílabas.`
            }
        }
    },
    {
        id: 'letrasfrequentes', sub: 'Analisar', emoji: '🔡', titulo: 'Letras mais usadas',
        descricao: 'Mostra quais letras mais aparecem no texto',
        ajuda: 'Ranking das letras, com barra para enxergar a diferença.',
        usage: '<texto>', examples: ['cole um texto grande — mostra o ranking das letras'],
        run: (t) => {
            const letras = tirarAcento(t.toLowerCase()).match(/[a-z]/g) || []
            const top = contagemOrdenada(letras).slice(0, 12)
            const maior = top[0]?.[1] || 1
            return {
                blocos: [{ emoji: '🏆', titulo: 'Ranking', linhas: top.length ? top.map(([c, n]) => `${c} ${F.barra(n / maior, 12)} ${n}`) : ['Nenhuma letra nesse texto.'] }],
                intro: top.length ? `A letra mais usada é "${top[0][0]}", com ${top[0][1]} aparições.` : 'Não achei letras nesse texto.'
            }
        }
    },
    {
        id: 'vogaisconsoantes', sub: 'Analisar', emoji: '🅾️', titulo: 'Vogais e consoantes',
        descricao: 'Conta vogais e consoantes do texto',
        ajuda: 'Em português, texto equilibrado costuma ficar perto de 45% de vogais.',
        usage: '<texto>', examples: ['arara azul voando — conta vogais e consoantes'],
        run: (t) => {
            const letras = tirarAcento(t.toLowerCase()).match(/[a-z]/g) || []
            const vogais = letras.filter(c => 'aeiou'.includes(c)).length
            const cons = letras.length - vogais
            const pct = letras.length ? (vogais / letras.length) * 100 : 0
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Contas', linhas: [
                        F.campo('Vogais', vogais), F.campo('Consoantes', cons), F.barra(pct / 100)
                    ]
                }],
                intro: `São ${vogais} vogais e ${cons} consoantes: ${Math.round(pct)}% do texto é vogal.`
            }
        }
    },
    {
        id: 'painelresumo', sub: 'Analisar', emoji: '📈', titulo: 'Painel do texto',
        descricao: 'Resumo geral com todos os números do texto',
        ajuda: 'Um retrato só, com tamanho, ritmo de leitura e nota de facilidade.',
        usage: '<texto>', examples: ['cole o texto inteiro — devolve o painel completo'],
        run: (t) => {
            const chars = caracteresDe(t).length
            const ps = palavrasDe(t)
            const fs = frasesDe(t)
            const pars = paragrafosDe(t)
            const silabas = ps.reduce((a, w) => a + silabasDe(w), 0)
            const nota = Math.max(0, Math.min(100, 248.835 - 1.015 * (fs.length ? ps.length / fs.length : ps.length) - 84.6 * (ps.length ? silabas / ps.length : 0)))
            return {
                blocos: [
                    { emoji: '📏', titulo: 'Tamanho', linhas: [F.campo('Caracteres', chars), F.campo('Palavras', ps.length), F.campo('Frases', fs.length), F.campo('Parágrafos', pars.length)] },
                    { emoji: '⏱️', titulo: 'Ritmo', linhas: [F.campo('Leitura', F.tempo(Math.round((ps.length / 200) * 60) * 1000)), F.campo('Falando', F.tempo(Math.round((ps.length / 130) * 60) * 1000))] },
                    { emoji: '🎓', titulo: 'Facilidade', linhas: [F.campo('Nota', Math.round(nota) + ' de 100'), F.barra(nota / 100)] }
                ],
                intro: `Retrato do texto: ${ps.length} palavras em ${fs.length} frase(s).`
            }
        }
    },
    {
        id: 'nuvempalavras', sub: 'Analisar', emoji: '☁️', titulo: 'Nuvem de palavras',
        descricao: 'Desenha em barras as palavras que dominam',
        ajuda: 'Mostra o peso de cada palavra do texto em barra, como uma nuvem em lista.',
        usage: '<texto>', examples: ['cole um texto grande — desenha o peso das palavras'],
        run: (t) => {
            const vazias = new Set(['de', 'da', 'do', 'que', 'com', 'para', 'uma', 'os', 'as', 'no', 'na', 'em', 'e', 'o', 'a', 'um'])
            const ps = palavrasDe(t).map(w => tirarAcento(w).toLowerCase()).filter(w => w.length > 2 && !vazias.has(w))
            const top = contagemOrdenada(ps).slice(0, 10)
            const maior = top[0]?.[1] || 1
            return {
                blocos: [{ emoji: '☁️', titulo: 'Peso de cada palavra', linhas: top.length ? top.map(([w, n]) => `${w.padEnd(14, ' ')} ${F.barra(n / maior, 10)} ${n}`) : ['Texto curto demais para desenhar a nuvem.'] }],
                intro: top.length ? `A palavra que domina esse texto é "${top[0][0]}".` : 'Mande um texto maior para a nuvem ficar interessante.'
            }
        }
    },
    {
        id: 'palavraslongas', sub: 'Analisar', emoji: '🐘', titulo: 'Palavras mais compridas',
        descricao: 'Lista as palavras mais compridas do texto',
        ajuda: 'Mostra as campeãs de tamanho, que costumam ser as mais difíceis.',
        usage: '<texto>', examples: ['cole um texto — lista as palavras mais compridas'],
        run: (t) => {
            const ps = [...new Set(palavrasDe(t))].sort((a, b) => b.length - a.length).slice(0, 15)
            return {
                texto: juntarLinhas(ps.map(w => `• ${w} — ${Array.from(w).length} letras, ${silabasDe(w)} sílaba(s)`)),
                rotulo: 'As mais compridas',
                intro: ps.length ? `A palavra mais comprida é "${ps[0]}", com ${Array.from(ps[0]).length} letras.` : 'Não achei palavras nesse texto.'
            }
        }
    },
    {
        id: 'densidadepalavra', sub: 'Analisar', emoji: '🎯', titulo: 'Peso de uma palavra',
        descricao: 'Diz quanto do texto é uma palavra escolhida',
        ajuda: 'Escreva a palavra na frente e depois o texto. Devolvo a porcentagem dela.',
        usage: '<palavra> <texto>', examples: ['casa a casa da casa é bonita — diz o peso de casa'],
        params: [{ nome: 'palavra', tipo: 'palavra', padrao: '' }],
        run: (t, p) => {
            const alvo = tirarAcento(String(p.palavra || '')).toLowerCase()
            const ps = palavrasDe(t).map(w => tirarAcento(w).toLowerCase())
            const n = ps.filter(w => w === alvo).length
            const pct = ps.length ? (n / ps.length) * 100 : 0
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Medida', linhas: [
                        F.campo('Palavra', p.palavra || '—'), F.campo('Vezes', n),
                        F.campo('Total de palavras', ps.length), F.barra(pct / 100)
                    ]
                }],
                intro: alvo ? `"${p.palavra}" ocupa ${pct.toFixed(1)}% das palavras do texto.` : 'Escreva a palavra na frente do texto para eu medir o peso dela.'
            }
        }
    },
    {
        id: 'distanciaedicao', sub: 'Analisar', emoji: '📶', titulo: 'Quantas trocas de letra',
        descricao: 'Conta quantas trocas separam duas palavras',
        ajuda: 'Mando o número de letras que precisa mudar para uma virar a outra.',
        usage: '<palavra 1> <palavra 2>', examples: ['casa caso — diz que muda uma letra'],
        dica: 'É a mesma conta que o corretor usa para sugerir a palavra certa.',
        run: (t) => {
            const [a, b] = duasPalavras(t)
            const d = distanciaEdicao(tirarAcento(a.toLowerCase()), tirarAcento(b.toLowerCase()))
            const maior = Math.max(a.length, b.length, 1)
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Comparação', linhas: [
                        F.campo('Palavra 1', a || '—'), F.campo('Palavra 2', b || '—'),
                        F.campo('Trocas necessárias', d), F.barra(1 - d / maior)
                    ]
                }],
                intro: d === 0 ? 'As duas palavras são exatamente iguais.' : `Precisa mudar ${d} letra(s) para "${a}" virar "${b}".`
            }
        }
    },
    {
        id: 'contarsimbolos', sub: 'Analisar', emoji: '❇️', titulo: 'Quantos sinais',
        descricao: 'Conta pontuação e sinais usados no texto',
        ajuda: 'Mostra quantas vírgulas, pontos e outros sinais o texto tem.',
        usage: '<texto>', examples: ['Oi! Tudo bem? Sim, tudo. — conta os sinais'],
        run: (t) => {
            const sinais = t.match(/[^\p{L}\p{N}\s]/gu) || []
            const top = contagemOrdenada(sinais).slice(0, 12)
            return {
                blocos: [{
                    emoji: '📊', titulo: 'Contagem', linhas: [
                        F.campo('Sinais no total', sinais.length),
                        F.campo('Sinais diferentes', new Set(sinais).size),
                        ...top.map(([c, n]) => `• ${c} — ${n} vez(es)`)
                    ]
                }],
                intro: sinais.length ? `Esse texto usa ${sinais.length} sinal(is) de pontuação e símbolos.` : 'Esse texto não tem nenhum sinal de pontuação.'
            }
        }
    }
]

// ── Codificadores (brincadeira, nunca segurança) ───────────────────────────
//
// Todos trabalham em cima do ponto de código do caractere, não do byte, para
// que acento e emoji voltem inteiros na ida e volta. Os que só conhecem o
// alfabeto sem acento (morse, braille, fonético, T9, teclado) deixam o que não
// reconhecem passar intacto — assim nada some do texto da pessoa.

/** Converte cada caractere para um número na base pedida, separado por espaço. */
function paraBase(texto, base, largura) {
    return caracteresDe(texto).map(c => c.codePointAt(0).toString(base).padStart(largura, '0')).join(' ')
}

const DIGITOS_DA_BASE = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[0-9a-fA-F]+$/ }

/**
 * Volta de uma lista de números numa base para o texto, contando quantos
 * pedaços foram mesmo entendidos.
 *
 * A contagem existe porque decodificador calado é armadilha: quem colava um
 * texto comum em `.debinario` recebia um caractere de controle invisível e
 * achava que o comando estava quebrado. Agora a resposta diz o que aconteceu.
 */
function deBase(texto, base) {
    const pedacos = String(texto).trim().split(/\s+/).filter(Boolean)
    const valido = DIGITOS_DA_BASE[base] || /^\w+$/
    let entendidos = 0
    const saida = pedacos.map(p => {
        if (!valido.test(p)) return ''
        const n = parseInt(p, base)
        if (!Number.isFinite(n) || n <= 0 || n > 0x10FFFF) return ''
        entendidos++
        return String.fromCodePoint(n)
    }).join('')
    return { texto: saida, entendidos, total: pedacos.length }
}

/**
 * Frase de abertura dos decodificadores: diz quanto do texto era mesmo daquele
 * formato, em vez de devolver sujeira em silêncio.
 */
function introDecodificacao(entendidos, total, formato) {
    if (!total) return `Mande um texto em ${formato} para eu traduzir.`
    if (entendidos === 0) return `Esse texto não parece estar em ${formato}: não reconheci nenhum pedaço. Confira se colou o código certo.`
    if (entendidos < total) return `Entendi ${entendidos} de ${total} pedaço(s). O resto não estava em ${formato} e passou direto.`
    return `Traduzi os ${total} pedaço(s) de ${formato} do seu texto.`
}

/** Aplica um mapa letra a letra, com separadores de letra e de palavra. */
function porPalavras(texto, fn, sepLetra, sepPalavra) {
    return String(texto).toLowerCase().trim().split(/\s+/).filter(Boolean)
        .map(p => caracteresDe(p).map(fn).filter(x => x !== '').join(sepLetra))
        .join(sepPalavra)
}

/**
 * Desfaz o que `porPalavras` fez. `fn` devolve null no pedaço que não reconhece;
 * ele volta como veio e entra na contagem do que não foi entendido.
 */
function dePalavras(texto, fn, sepLetra, sepPalavra) {
    let entendidos = 0, total = 0
    const saida = String(texto).trim().split(sepPalavra)
        .map(p => p.trim().split(sepLetra).filter(Boolean).map(pedaco => {
            total++
            const v = fn(pedaco)
            if (v === null || v === undefined) return pedaco
            entendidos++
            return v
        }).join(''))
        .join(' ')
    return { texto: saida, entendidos, total }
}

/** Como `trocarPorMapa`, mas contando quantos caracteres o mapa reconheceu. */
function trocarContando(texto, mapa, { minusculo = false } = {}) {
    let entendidos = 0, total = 0
    const saida = caracteresDe(minusculo ? String(texto).toLowerCase() : String(texto)).map(c => {
        if (/\s/.test(c)) return c
        total++
        if (c in mapa) { entendidos++; return mapa[c] }
        return c
    }).join('')
    return { texto: saida, entendidos, total }
}

/** Roda o alfabeto sem acento em N casas (César e ROT13). */
function girarAlfabeto(texto, casas) {
    const n = ((casas % 26) + 26) % 26
    return String(texto).replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97
        return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26) + base)
    })
}

/** Atbash: o alfabeto de trás para frente. Aplicar duas vezes volta ao original. */
function atbash(texto) {
    return String(texto).replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97
        return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base))
    })
}

/** Vigenère: César com casa diferente para cada letra da chave. */
function vigenere(texto, chave, sentido) {
    const limpa = tirarAcento(String(chave || 'chave').toLowerCase()).replace(/[^a-z]/g, '') || 'chave'
    let i = 0
    return String(texto).replace(/[a-zA-Z]/g, c => {
        const casas = (limpa.charCodeAt(i % limpa.length) - 97) * sentido
        i++
        const base = c <= 'Z' ? 65 : 97
        return String.fromCharCode((((c.charCodeAt(0) - base + casas) % 26) + 26) % 26 + base)
    })
}

/** Cifra do trilho: escreve em zigue-zague e lê linha por linha. */
function paraTrilho(texto, trilhos = 3) {
    const chars = caracteresDe(texto)
    const trilhas = Array.from({ length: trilhos }, () => [])
    let r = 0, passo = 1
    for (const c of chars) {
        trilhas[r].push(c)
        if (r === 0) passo = 1
        else if (r === trilhos - 1) passo = -1
        r += passo
    }
    return trilhas.map(t => t.join('')).join('')
}

/** Desfaz a cifra do trilho refazendo o zigue-zague pelo tamanho do texto. */
function deTrilho(texto, trilhos = 3) {
    const chars = caracteresDe(texto)
    const padrao = []
    let r = 0, passo = 1
    for (let i = 0; i < chars.length; i++) {
        padrao.push(r)
        if (r === 0) passo = 1
        else if (r === trilhos - 1) passo = -1
        r += passo
    }
    const quantos = new Array(trilhos).fill(0)
    for (const p of padrao) quantos[p]++
    const trilhas = []
    let idx = 0
    for (let i = 0; i < trilhos; i++) { trilhas.push(chars.slice(idx, idx + quantos[i])); idx += quantos[i] }
    const pos = new Array(trilhos).fill(0)
    return padrao.map(p => trilhas[p][pos[p]++] ?? '').join('')
}

const OPS_CODIGOS = [
    {
        id: 'morse', sub: 'Códigos', emoji: '📡', titulo: 'Virar código morse',
        descricao: 'Passa o texto para código morse',
        ajuda: 'Cada letra vira ponto e traço. A barra separa as palavras.',
        usage: '<texto>', examples: ['sos agora — vira ... --- ... / .- ...'],
        run: (t) => ({ texto: porPalavras(tirarAcento(t), c => MAPA_MORSE[c] ?? c, ' ', ' / '), rotulo: 'Em morse' })
    },
    {
        id: 'demorse', sub: 'Códigos', emoji: '📻', titulo: 'Ler código morse',
        descricao: 'Traduz ponto e traço de volta para letras',
        ajuda: 'Mande o morse com espaço entre as letras e barra entre as palavras.',
        usage: '<morse>', examples: ['... --- ... — vira sos'],
        run: (t) => {
            const r = dePalavras(t, s => (/^[.\-]+$/.test(s) ? MAPA_MORSE_VOLTA[s] ?? null : null), ' ', ' / ')
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'morse') }
        }
    },
    {
        id: 'binario', sub: 'Códigos', emoji: '💾', titulo: 'Virar binário',
        descricao: 'Passa o texto para zeros e uns',
        ajuda: 'Cada caractere vira um número de base dois.',
        usage: '<texto>', examples: ['oi — vira 01101111 01101001'],
        run: (t) => ({ texto: paraBase(t, 2, 8), rotulo: 'Em binário' })
    },
    {
        id: 'debinario', sub: 'Códigos', emoji: '🔌', titulo: 'Ler binário',
        descricao: 'Traduz zeros e uns de volta para texto',
        ajuda: 'Mande os grupos de zeros e uns separados por espaço.',
        usage: '<binário>', examples: ['01101111 01101001 — vira oi'],
        run: (t) => {
            const r = deBase(t, 2)
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'binário') }
        }
    },
    {
        id: 'hexadecimal', sub: 'Códigos', emoji: '🧪', titulo: 'Virar hexadecimal',
        descricao: 'Passa o texto para o formato hexadecimal',
        ajuda: 'Cada caractere vira um número de base dezesseis.',
        usage: '<texto>', examples: ['oi — vira 6f 69'],
        run: (t) => ({ texto: paraBase(t, 16, 2), rotulo: 'Em hexadecimal' })
    },
    {
        id: 'dehexadecimal', sub: 'Códigos', emoji: '🔬', titulo: 'Ler hexadecimal',
        descricao: 'Traduz hexadecimal de volta para texto',
        ajuda: 'Mande os pares separados por espaço.',
        usage: '<hexadecimal>', examples: ['6f 69 — vira oi'],
        run: (t) => {
            const r = deBase(t, 16)
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'hexadecimal') }
        }
    },
    {
        id: 'octal', sub: 'Códigos', emoji: '🎱', titulo: 'Virar octal',
        descricao: 'Passa o texto para o formato octal',
        ajuda: 'Cada caractere vira um número de base oito.',
        usage: '<texto>', examples: ['oi — vira 157 151'],
        run: (t) => ({ texto: paraBase(t, 8, 3), rotulo: 'Em octal' })
    },
    {
        id: 'deoctal', sub: 'Códigos', emoji: '🎲', titulo: 'Ler octal',
        descricao: 'Traduz octal de volta para texto',
        ajuda: 'Mande os números de base oito separados por espaço.',
        usage: '<octal>', examples: ['157 151 — vira oi'],
        run: (t) => {
            const r = deBase(t, 8)
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'octal') }
        }
    },
    {
        id: 'unicodedecimal', sub: 'Códigos', emoji: '🔢', titulo: 'Virar número de cada letra',
        descricao: 'Troca cada caractere pelo número dele',
        ajuda: 'Cada caractere tem um número próprio na tabela universal. Aqui você vê.',
        usage: '<texto>', examples: ['oi — vira 111 105'],
        run: (t) => ({ texto: paraBase(t, 10, 1), rotulo: 'Em números' })
    },
    {
        id: 'deunicodedecimal', sub: 'Códigos', emoji: '🔡', titulo: 'Ler número de cada letra',
        descricao: 'Troca os números de volta pelos caracteres',
        ajuda: 'Mande os números separados por espaço e devolvo as letras.',
        usage: '<números>', examples: ['111 105 — vira oi'],
        run: (t) => {
            const r = deBase(t, 10)
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'número de caractere') }
        }
    },
    {
        id: 'base64', sub: 'Códigos', emoji: '📦', titulo: 'Virar base64',
        descricao: 'Embrulha o texto no formato base64',
        ajuda: 'Formato usado para transportar texto por sistemas antigos. Volta inteiro, com acento e emoji.',
        usage: '<texto>', examples: ['oi pessoal — vira b2kgcGVzc29hbA=='],
        run: (t) => ({ texto: Buffer.from(t, 'utf8').toString('base64'), rotulo: 'Em base64' })
    },
    {
        id: 'debase64', sub: 'Códigos', emoji: '📭', titulo: 'Ler base64',
        descricao: 'Desembrulha um texto que está em base64',
        ajuda: 'Mande o embrulho e devolvo o texto original.',
        usage: '<base64>', examples: ['b2kgcGVzc29hbA== — vira oi pessoal'],
        run: (t) => {
            const limpo = String(t).trim().replace(/\s+/g, '')
            const volta = Buffer.from(limpo, 'base64').toString('utf8')
            const confere = Buffer.from(volta, 'utf8').toString('base64').replace(/=+$/, '') === limpo.replace(/=+$/, '')
            return {
                texto: volta,
                rotulo: 'Texto lido',
                intro: confere ? 'Desembrulhei o base64 e o texto voltou inteiro.' : 'Desembrulhei, mas o resultado saiu estranho: confira se o base64 veio completo.'
            }
        }
    },
    {
        id: 'urlcodificar', sub: 'Códigos', emoji: '🌐', titulo: 'Codificar para link',
        descricao: 'Troca acento e espaço pelo código de link',
        ajuda: 'Deixa o texto pronto para ir dentro de um endereço de site.',
        usage: '<texto>', examples: ['pão de mel — vira p%C3%A3o%20de%20mel'],
        run: (t) => ({ texto: encodeURIComponent(t), rotulo: 'Pronto para link' })
    },
    {
        id: 'urldecodificar', sub: 'Códigos', emoji: '🧭', titulo: 'Ler código de link',
        descricao: 'Traduz o código de link de volta para texto',
        ajuda: 'Desfaz aqueles %20 e %C3%A3 que aparecem colados de um endereço.',
        usage: '<texto codificado>', examples: ['p%C3%A3o%20de%20mel — vira pão de mel'],
        run: (t) => {
            let saida
            try { saida = decodeURIComponent(String(t).trim()) }
            catch (erro) { return { texto: t, intro: `Esse texto tem um código de link quebrado (${erro.message}), então devolvi como veio.` } }
            return { texto: saida, rotulo: 'Texto lido' }
        }
    },
    {
        id: 'rot13', sub: 'Códigos', emoji: '🔄', titulo: 'Girar 13 casas',
        descricao: 'Gira o alfabeto em 13 casas, ida e volta',
        ajuda: 'Aplicar duas vezes volta ao original. É o esconde-esconde mais antigo da internet.',
        usage: '<texto>', examples: ['ola mundo — vira byn zhaqb'],
        run: (t) => ({ texto: girarAlfabeto(t, 13), rotulo: 'Girado' })
    },
    {
        id: 'atbash', sub: 'Códigos', emoji: '🪞', titulo: 'Alfabeto espelhado',
        descricao: 'Troca A por Z, B por Y e assim por diante',
        ajuda: 'Cifra antiquíssima. Aplicar duas vezes volta ao original.',
        usage: '<texto>', examples: ['ola mundo — vira loz nfmwl'],
        run: (t) => ({ texto: atbash(t), rotulo: 'Espelhado' })
    },
    {
        id: 'cesar', sub: 'Códigos', emoji: '🏛️', titulo: 'Cifra de César',
        descricao: 'Anda com as letras o número de casas que pedir',
        ajuda: 'Diga o número de casas na frente. Sem número, ando 3 casas.',
        usage: '[casas] <texto>', examples: ['5 ola mundo — anda cinco casas no alfabeto'],
        params: [{ nome: 'casas', tipo: 'numero', padrao: 3, min: 1, max: 25 }],
        run: (t, p) => ({ texto: girarAlfabeto(t, p.casas), rotulo: `Andando ${p.casas} casa(s)`, intro: `Andei ${p.casas} casa(s) no alfabeto. Guarde esse número para desfazer.` })
    },
    {
        id: 'decesar', sub: 'Códigos', emoji: '🗝️', titulo: 'Desfazer cifra de César',
        descricao: 'Volta as letras o número de casas que pedir',
        ajuda: 'Diga o mesmo número que foi usado para cifrar. Sem número, volto 3 casas.',
        usage: '[casas] <texto>', examples: ['5 tqf rzsit — volta cinco casas'],
        params: [{ nome: 'casas', tipo: 'numero', padrao: 3, min: 1, max: 25 }],
        run: (t, p) => ({ texto: girarAlfabeto(t, -p.casas), rotulo: `Voltando ${p.casas} casa(s)` })
    },
    {
        id: 'vigenere', sub: 'Códigos', emoji: '🔐', titulo: 'Cifra de Vigenère',
        descricao: 'Cifra usando uma palavra-chave que você escolhe',
        ajuda: 'Escreva a palavra-chave na frente e depois o texto.',
        usage: '<chave> <texto>', examples: ['limao ola mundo — cifra usando limao'],
        params: [{ nome: 'chave', tipo: 'palavra', padrao: 'chave' }],
        run: (t, p) => ({ texto: vigenere(t, p.chave, 1), rotulo: 'Cifrado', intro: `Cifrei com a chave "${p.chave}". Sem ela ninguém desfaz direito.` })
    },
    {
        id: 'devigenere', sub: 'Códigos', emoji: '🗄️', titulo: 'Desfazer Vigenère',
        descricao: 'Desfaz a cifra usando a mesma palavra-chave',
        ajuda: 'Escreva a mesma palavra-chave na frente e depois o texto cifrado.',
        usage: '<chave> <texto>', examples: ['limao zwa yfxus — desfaz usando limao'],
        params: [{ nome: 'chave', tipo: 'palavra', padrao: 'chave' }],
        run: (t, p) => ({ texto: vigenere(t, p.chave, -1), rotulo: 'Texto lido' })
    },
    {
        id: 'cifranumeros', sub: 'Códigos', emoji: '🔟', titulo: 'Letra vira número',
        descricao: 'Troca cada letra pela posição dela no alfabeto',
        ajuda: 'A vira 1, B vira 2 e assim por diante. Traço separa as letras.',
        usage: '<texto>', examples: ['ola — vira 15-12-1'],
        run: (t) => ({
            texto: porPalavras(tirarAcento(t), c => {
                const n = c.charCodeAt(0) - 96
                return n >= 1 && n <= 26 ? String(n) : c
            }, '-', ' / '),
            rotulo: 'Em números'
        })
    },
    {
        id: 'decifranumeros', sub: 'Códigos', emoji: '🔢', titulo: 'Número vira letra',
        descricao: 'Troca a posição no alfabeto de volta pela letra',
        ajuda: 'Mande os números com traço entre as letras e barra entre as palavras.',
        usage: '<números>', examples: ['15-12-1 — vira ola'],
        run: (t) => {
            const r = dePalavras(t, s => {
                if (!/^\d{1,2}$/.test(s)) return null
                const n = parseInt(s, 10)
                return n >= 1 && n <= 26 ? String.fromCharCode(96 + n) : null
            }, '-', ' / ')
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'letra em número') }
        }
    },
    {
        id: 'fonetico', sub: 'Códigos', emoji: '🛩️', titulo: 'Alfabeto fonético',
        descricao: 'Soletra usando o alfabeto de rádio',
        ajuda: 'Bom para ditar nome e código por telefone sem confundir letra.',
        usage: '<texto>', examples: ['ana — vira Alfa Novembro Alfa'],
        run: (t) => ({ texto: porPalavras(tirarAcento(t), c => MAPA_FONETICO[c] ?? c, ' ', ' / '), rotulo: 'Soletrado' })
    },
    {
        id: 'defonetico', sub: 'Códigos', emoji: '📶', titulo: 'Ler alfabeto fonético',
        descricao: 'Junta as palavras do alfabeto de rádio em letras',
        ajuda: 'Mande as palavras com barra separando cada palavra do texto.',
        usage: '<palavras>', examples: ['Alfa Novembro Alfa — vira ana'],
        run: (t) => {
            const r = dePalavras(t, s => MAPA_FONETICO_VOLTA[s.toLowerCase()] ?? null, ' ', ' / ')
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'alfabeto fonético') }
        }
    },
    {
        id: 'braille', sub: 'Códigos', emoji: '⠿', titulo: 'Escrever em braille',
        descricao: 'Mostra o texto com os pontos do braille',
        ajuda: 'Mostra o desenho dos pontos em texto. Não substitui um leitor de verdade.',
        usage: '<texto>', examples: ['ola — vira ⠕⠇⠁'],
        dica: 'É só o desenho dos pontos na tela, para conhecer o sistema.',
        run: (t) => ({ texto: trocarPorMapa(tirarAcento(t), MAPA_BRAILLE), rotulo: 'Em braille' })
    },
    {
        id: 'debraille', sub: 'Códigos', emoji: '👐', titulo: 'Ler braille em texto',
        descricao: 'Traduz os pontos do braille de volta em letras',
        ajuda: 'Cole os pontos e eu devolvo as letras correspondentes.',
        usage: '<braille>', examples: ['⠕⠇⠁ — vira ola'],
        run: (t) => {
            const r = trocarContando(t, MAPA_BRAILLE_VOLTA)
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'braille') }
        }
    },
    {
        id: 'leet', sub: 'Códigos', emoji: '🕹️', titulo: 'Escrita de jogo antigo',
        descricao: 'Troca letras por números parecidos',
        ajuda: 'A vira 4, E vira 3, O vira 0. A escrita das salas de jogo dos anos 90.',
        usage: '<texto>', examples: ['batalha — vira 8474lh4'],
        run: (t) => ({ texto: trocarPorMapa(tirarAcento(t), MAPA_LEET), rotulo: 'Escrita de jogo' })
    },
    {
        id: 'deleet', sub: 'Códigos', emoji: '🎮', titulo: 'Ler escrita de jogo',
        descricao: 'Troca os números de volta pelas letras',
        ajuda: 'Desfaz o 4 em A, o 3 em E e assim por diante.',
        usage: '<texto>', examples: ['8474lh4 — vira batalha'],
        run: (t) => {
            const trocados = (String(t).match(/[034578912]/g) || []).length
            return {
                texto: trocarPorMapa(t, MAPA_LEET_VOLTA, { minusculo: false }),
                rotulo: 'Texto lido',
                intro: trocados ? `Devolvi ${trocados} número(s) para a letra que eles imitavam.` : 'Esse texto não tem nenhum número imitando letra, então voltou como veio.'
            }
        }
    },
    {
        id: 'invertidotexto', sub: 'Códigos', emoji: '🙃', titulo: 'Texto de cabeça para baixo',
        descricao: 'Escreve o texto de cabeça para baixo',
        ajuda: 'Vira as letras e inverte a ordem, como se o celular estivesse de ponta-cabeça.',
        usage: '<texto>', examples: ['ola mundo — vira opunɯ ɐlo'],
        run: (t) => ({ texto: caracteresDe(trocarPorMapa(tirarAcento(t), MAPA_INVERTIDO)).reverse().join(''), rotulo: 'De cabeça para baixo' })
    },
    {
        id: 'deinvertidotexto', sub: 'Códigos', emoji: '🔃', titulo: 'Desvirar texto de ponta-cabeça',
        descricao: 'Põe de volta no pé o texto de ponta-cabeça',
        ajuda: 'Cole o texto virado e eu devolvo na posição normal.',
        usage: '<texto virado>', examples: ['opunɯ ɐlo — vira ola mundo'],
        run: (t) => {
            const r = trocarContando(caracteresDe(t).reverse().join(''), MAPA_INVERTIDO_VOLTA)
            return { texto: r.texto, rotulo: 'Texto lido', intro: `Virei o texto de volta e reconheci ${r.entendidos} de ${r.total} caractere(s).` }
        }
    },
    {
        id: 'codigoteclado', sub: 'Códigos', emoji: '⌨️', titulo: 'Código do teclado',
        descricao: 'Troca a letra pela posição dela no teclado',
        ajuda: 'A primeira parte é a fileira e a segunda é a tecla contando da esquerda.',
        usage: '<texto>', examples: ['ola — vira 2.9-3.9-3.1'],
        run: (t) => ({ texto: porPalavras(tirarAcento(t), c => MAPA_TECLADO[c] ?? c, '-', ' / '), rotulo: 'Posição no teclado' })
    },
    {
        id: 'decodigoteclado', sub: 'Códigos', emoji: '🖱️', titulo: 'Ler código do teclado',
        descricao: 'Troca a posição no teclado de volta pela letra',
        ajuda: 'Mande as posições com traço entre as letras e barra entre as palavras.',
        usage: '<posições>', examples: ['2.9-3.9-3.1 — vira ola'],
        run: (t) => {
            const r = dePalavras(t, s => MAPA_TECLADO_VOLTA[s] ?? null, '-', ' / ')
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'posição de teclado') }
        }
    },
    {
        id: 't9', sub: 'Códigos', emoji: '📱', titulo: 'Teclado de celular antigo',
        descricao: 'Escreve como no celular de tecla, apertando números',
        ajuda: 'A letra C era o 2 apertado três vezes. Aqui fica 222.',
        usage: '<texto>', examples: ['oi — vira 666-444'],
        run: (t) => ({ texto: porPalavras(tirarAcento(t), c => MAPA_T9[c] ?? c, '-', ' / '), rotulo: 'Em teclas' })
    },
    {
        id: 'det9', sub: 'Códigos', emoji: '☎️', titulo: 'Ler teclado de celular antigo',
        descricao: 'Traduz as teclas apertadas de volta em letras',
        ajuda: 'Mande as teclas com traço entre as letras e barra entre as palavras.',
        usage: '<teclas>', examples: ['666-444 — vira oi'],
        run: (t) => {
            const r = dePalavras(t, s => MAPA_T9_VOLTA[s] ?? null, '-', ' / ')
            return { texto: r.texto, rotulo: 'Texto lido', intro: introDecodificacao(r.entendidos, r.total, 'tecla de celular') }
        }
    },
    {
        id: 'trilho', sub: 'Códigos', emoji: '🚂', titulo: 'Cifra do trilho',
        descricao: 'Escreve em zigue-zague e lê linha por linha',
        ajuda: 'As letras descem e sobem em três trilhos, depois são lidas trilho por trilho.',
        usage: '<texto>', examples: ['encontro no portao — embaralha em zigue-zague'],
        run: (t) => ({ texto: paraTrilho(t, 3), rotulo: 'Em zigue-zague' })
    },
    {
        id: 'detrilho', sub: 'Códigos', emoji: '🛤️', titulo: 'Desfazer cifra do trilho',
        descricao: 'Refaz o zigue-zague e devolve o texto',
        ajuda: 'Cole o texto cifrado em três trilhos e eu remonto.',
        usage: '<texto cifrado>', examples: ['ennoproocrononta — remonta o zigue-zague'],
        run: (t) => ({ texto: deTrilho(t, 3), rotulo: 'Texto lido' })
    }
]

// ── Fonte de blocos para o banner ──────────────────────────────────────────
//
// Desenho as letras com "█" e espaço, nunca com traço de moldura: o projeto
// proibiu os caracteres de moldura (os de desenhar caixa) e a regra vale também
// para arte em texto. Cada letra tem 5 linhas de 3 colunas.
const FONTE_BLOCOS = {
    a: ['###', '#.#', '###', '#.#', '#.#'], b: ['##.', '#.#', '##.', '#.#', '##.'],
    c: ['###', '#..', '#..', '#..', '###'], d: ['##.', '#.#', '#.#', '#.#', '##.'],
    e: ['###', '#..', '##.', '#..', '###'], f: ['###', '#..', '##.', '#..', '#..'],
    g: ['###', '#..', '#.#', '#.#', '###'], h: ['#.#', '#.#', '###', '#.#', '#.#'],
    i: ['###', '.#.', '.#.', '.#.', '###'], j: ['..#', '..#', '..#', '#.#', '###'],
    k: ['#.#', '#.#', '##.', '#.#', '#.#'], l: ['#..', '#..', '#..', '#..', '###'],
    m: ['#.#', '###', '###', '#.#', '#.#'], n: ['#.#', '###', '#.#', '#.#', '#.#'],
    o: ['###', '#.#', '#.#', '#.#', '###'], p: ['###', '#.#', '###', '#..', '#..'],
    q: ['###', '#.#', '#.#', '###', '..#'], r: ['###', '#.#', '##.', '#.#', '#.#'],
    s: ['###', '#..', '###', '..#', '###'], t: ['###', '.#.', '.#.', '.#.', '.#.'],
    u: ['#.#', '#.#', '#.#', '#.#', '###'], v: ['#.#', '#.#', '#.#', '#.#', '.#.'],
    w: ['#.#', '#.#', '###', '###', '#.#'], x: ['#.#', '#.#', '.#.', '#.#', '#.#'],
    y: ['#.#', '#.#', '.#.', '.#.', '.#.'], z: ['###', '..#', '.#.', '#..', '###'],
    '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
    '2': ['###', '..#', '###', '#..', '###'], '3': ['###', '..#', '###', '..#', '###'],
    '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '###', '..#', '###'],
    '6': ['###', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'],
    '8': ['###', '#.#', '###', '#.#', '###'], '9': ['###', '#.#', '###', '..#', '###'],
    ' ': ['...', '...', '...', '...', '...'], '!': ['.#.', '.#.', '.#.', '...', '.#.'],
    '?': ['###', '..#', '.##', '...', '.#.'], '.': ['...', '...', '...', '...', '.#.'],
    '-': ['...', '...', '###', '...', '...']
}

/** Monta o banner em blocos, no máximo 9 caracteres para caber na tela. */
function bannerDeBlocos(texto) {
    const letras = caracteresDe(tirarAcento(String(texto).toLowerCase())).filter(c => c in FONTE_BLOCOS).slice(0, 9)
    if (!letras.length) return ''
    const linhas = []
    for (let i = 0; i < 5; i++) {
        linhas.push(letras.map(c => FONTE_BLOCOS[c][i]).join('.')
            .replace(/#/g, '█').replace(/\./g, ' ').trimEnd())
    }
    return linhas.join('\n')
}

/** Divide o pedido em pedaços por linha, barra ou vírgula — usado pelos criadores. */
function pedacosDe(texto) {
    const porLinha = linhasDe(texto).map(l => l.trim()).filter(Boolean)
    if (porLinha.length > 1) return porLinha
    return String(texto).split(/\s*[;|,]\s*/).map(p => p.trim()).filter(Boolean)
}

const OPS_CRIAR = [
    {
        id: 'apelido', sub: 'Criar', emoji: '🏷️', titulo: 'Ideias de apelido',
        descricao: 'Cria apelidos a partir do nome que você mandar',
        ajuda: 'Mande um nome e devolvo seis apelidos montados em cima dele.',
        usage: '<nome>', examples: ['Rafael — devolve seis apelidos com esse nome'],
        run: (t) => {
            const nome = palavrasDe(t)[0] || t.trim()
            const curto = nome.slice(0, Math.max(3, Math.ceil(nome.length / 2)))
            const rnd = rngDe(t)
            const enfeites = ['do Norte', 'de Ferro', 'da Madrugada', 'sem Medo', 'da Sorte', 'Relâmpago', 'Trovão', 'da Estrada', 'da Brasa', 'do Vento']
            const ideias = [
                curto.toLowerCase() + 'zinho',
                curto.toLowerCase() + 'ão',
                nome + ' ' + escolher(enfeites, rnd),
                nome.charAt(0).toUpperCase() + '. ' + escolher(enfeites, rnd),
                'Zé ' + nome,
                curto.toLowerCase() + escolher(['ka', 'ko', 'zzy', 'sh', 'ty'], rnd)
            ]
            return {
                texto: juntarLinhas(ideias.map((i, n) => `${n + 1}. ${i}`)),
                rotulo: 'Ideias de apelido',
                intro: `Seis apelidos montados em cima de "${nome}".`
            }
        }
    },
    {
        id: 'frasedeefeito', sub: 'Criar', emoji: '💥', titulo: 'Frase de efeito',
        descricao: 'Monta frases de efeito com o seu tema',
        ajuda: 'Diga o assunto e monto três frases curtas em cima dele.',
        usage: '<tema>', examples: ['treino — devolve frases de efeito sobre treino'],
        run: (t) => {
            const tema = t.trim().toLowerCase()
            const palavra = palavrasDe(tema)[0] || tema
            const rnd = rngDe(t)
            const moldes = [
                `${tema} não é sorte, é o que sobra de quem insistiu.`,
                `Quem espera o dia certo nunca começa ${tema}.`,
                `${palavra.charAt(0).toUpperCase() + palavra.slice(1)} hoje, desculpa nenhuma amanhã.`,
                `Todo mundo quer o resultado de ${tema}, pouca gente quer a rotina.`,
                `${tema} feito devagar ainda vence ${tema} adiado.`,
                `O segredo de ${tema} é ninguém ver a parte chata.`
            ]
            const escolhidas = embaralharCom(moldes, rnd).slice(0, 3)
            return {
                texto: juntarLinhas(escolhidas.map((f, i) => `${i + 1}. ${f}`)),
                rotulo: 'Frases prontas',
                intro: `Três frases de efeito sobre "${tema}".`
            }
        }
    },
    {
        id: 'nomegrupo', sub: 'Criar', emoji: '👥', titulo: 'Nome para o grupo',
        descricao: 'Sugere nomes de grupo com as suas palavras',
        ajuda: 'Mande as palavras que combinam com a turma e eu monto os nomes.',
        usage: '<palavras>', examples: ['futebol domingo amigos — sugere nomes de grupo'],
        run: (t) => {
            const ps = palavrasDe(t)
            const rnd = rngDe(t)
            const base = ps[0] || t.trim()
            const extra = ps[1] || 'da Firma'
            const enfeites = ['do Barulho', 'da Resenha', 'sem Noção', 'de Elite', 'da Quebrada', 'do Sofá']
            const ideias = [
                `${base.toUpperCase()} ${escolher(enfeites, rnd)}`,
                `Só os ${base}`,
                `${base} e ${extra}`,
                `Turma do ${base}`,
                `${base} ${escolher(['2.0', 'Oficial', 'Raiz', 'Premium'], rnd)}`,
                `Clube do ${extra}`
            ]
            return {
                texto: juntarLinhas(ideias.map((i, n) => `${n + 1}. ${i}`)),
                rotulo: 'Nomes sugeridos',
                intro: `Seis nomes de grupo usando "${ps.slice(0, 3).join(', ') || base}".`
            }
        }
    },
    {
        id: 'bio', sub: 'Criar', emoji: '📇', titulo: 'Texto de perfil',
        descricao: 'Monta três textos curtos de perfil',
        ajuda: 'Mande o que te descreve, separado por vírgula, e eu monto a bio.',
        usage: '<coisas que te descrevem>', examples: ['café, corrida, cachorro — monta três bios'],
        run: (t) => {
            const ps = pedacosDe(t)
            const rnd = rngDe(t)
            const lista = ps.length > 1 ? ps : palavrasDe(t)
            const junta = lista.slice(0, 3).join(' · ')
            const ideias = [
                `${junta}. Nessa ordem.`,
                `Vivendo de ${lista[0] || 'pouca coisa'} e ${lista[1] || 'muita teimosia'}.`,
                `${junta} — e um dia de cada vez. ${escolher(['🌱', '⚡', '☕', '🎯'], rnd)}`
            ]
            return {
                texto: juntarLinhas(ideias.map((i, n) => `${n + 1}. ${i}`)),
                rotulo: 'Opções de bio',
                intro: `Três textos de perfil com o que você mandou.`
            }
        }
    },
    {
        id: 'legendafoto', sub: 'Criar', emoji: '📸', titulo: 'Legenda para foto',
        descricao: 'Sugere legendas a partir do que está na foto',
        ajuda: 'Descreva a foto em poucas palavras e devolvo quatro legendas.',
        usage: '<o que aparece na foto>', examples: ['praia no fim da tarde — sugere legendas'],
        run: (t) => {
            const cena = t.trim().toLowerCase()
            const rnd = rngDe(t)
            const ideias = embaralharCom([
                `${cena}, sem filtro e sem pressa.`,
                `Guardei ${cena} para os dias que precisarem.`,
                `Um dia comum vira isso: ${cena}.`,
                `Se der certo de novo, aviso. ${cena}.`,
                `Nada demais, só ${cena} e a paz que veio junto.`
            ], rnd).slice(0, 4)
            return {
                texto: juntarLinhas(ideias.map((i, n) => `${n + 1}. ${i}`)),
                rotulo: 'Legendas',
                intro: `Quatro legendas para uma foto de "${cena}".`
            }
        }
    },
    {
        id: 'convite', sub: 'Criar', emoji: '💌', titulo: 'Convite pronto',
        descricao: 'Monta um convite com o que, quando e onde',
        ajuda: 'Mande o quê, quando e onde separados por vírgula ou em linhas.',
        usage: '<o quê, quando, onde>', examples: ['churrasco, sábado 13h, casa da vó — monta o convite'],
        run: (t) => {
            const [oque, quando, onde, extra] = pedacosDe(t)
            return {
                texto: [
                    `🎉 *${(oque || 'Nosso encontro').toUpperCase()}*`,
                    '',
                    `📅 Quando: ${quando || 'combinar no grupo'}`,
                    `📍 Onde: ${onde || 'combinar no grupo'}`,
                    extra ? `📝 Detalhe: ${extra}` : '',
                    '',
                    'Confirme presença respondendo aqui. Contamos com você.'
                ].filter(l => l !== '').join('\n'),
                rotulo: 'Convite pronto para encaminhar',
                intro: 'Copie e encaminhe: o convite já saiu formatado.'
            }
        }
    },
    {
        id: 'recadoaniversario', sub: 'Criar', emoji: '🎂', titulo: 'Recado de aniversário',
        descricao: 'Escreve um recado de aniversário personalizado',
        ajuda: 'Mande o nome e, se quiser, o que vocês têm em comum.',
        usage: '<nome, detalhe>', examples: ['Ana, amiga de escola — escreve o recado'],
        run: (t) => {
            const [nome, detalhe] = pedacosDe(t)
            const quem = nome || palavrasDe(t)[0] || 'você'
            const rnd = rngDe(t)
            const abertura = escolher(['Parabéns', 'Feliz aniversário', 'Muitos anos de vida'], rnd)
            return {
                texto: [
                    `🎂 *${abertura}, ${quem}!*`,
                    '',
                    detalhe ? `Faz tempo que a gente se conhece — ${detalhe} — e isso não é pouca coisa.` : 'Que hoje seja do jeito que você gosta: sem correria e com quem importa.',
                    `Que este ano traga mais calma, mais saúde e mais motivo para rir.`,
                    '',
                    `Um abraço grande, ${quem}.`
                ].join('\n'),
                rotulo: 'Recado pronto',
                intro: `Recado de aniversário escrito para ${quem}.`
            }
        }
    },
    {
        id: 'pedidodesculpa', sub: 'Criar', emoji: '🙏', titulo: 'Pedido de desculpa',
        descricao: 'Escreve um pedido de desculpa pelo motivo dado',
        ajuda: 'Diga o que aconteceu e para quem. Escrevo o pedido sem desculpa esfarrapada.',
        usage: '<motivo, para quem>', examples: ['cheguei atrasado, João — escreve o pedido'],
        run: (t) => {
            const [motivo, quem] = pedacosDe(t)
            const razao = motivo || t.trim()
            return {
                texto: [
                    quem ? `${quem}, preciso te dizer uma coisa.` : 'Preciso te dizer uma coisa.',
                    '',
                    `Me desculpe por ${razao.toLowerCase()}. Não foi por descaso, mas isso não muda o incômodo que causei.`,
                    'Assumo o erro, não vou ficar inventando justificativa, e já estou ajeitando para não se repetir.',
                    '',
                    'Se quiser conversar, estou por aqui.'
                ].join('\n'),
                rotulo: 'Pedido pronto',
                intro: 'Pedido de desculpa direto, sem rodeio e sem culpar os outros.'
            }
        }
    },
    {
        id: 'agradecimento', sub: 'Criar', emoji: '💐', titulo: 'Mensagem de agradecimento',
        descricao: 'Escreve um agradecimento pelo motivo dado',
        ajuda: 'Diga por que e para quem. Devolvo a mensagem pronta.',
        usage: '<motivo, para quem>', examples: ['me ajudou na mudança, Bia — escreve o agradecimento'],
        run: (t) => {
            const [motivo, quem] = pedacosDe(t)
            const razao = motivo || t.trim()
            return {
                texto: [
                    quem ? `${quem}, obrigado de verdade.` : 'Obrigado de verdade.',
                    '',
                    `Você ${razao.toLowerCase()} sem eu nem precisar pedir duas vezes. Isso ficou marcado.`,
                    'Quando precisar de mim, é só chamar — e eu vou lembrar.',
                    '',
                    'De coração.'
                ].join('\n'),
                rotulo: 'Agradecimento pronto',
                intro: 'Agradecimento escrito com o motivo que você deu.'
            }
        }
    },
    {
        id: 'asciiletras', sub: 'Criar', emoji: '🔳', titulo: 'Nome em letras grandes',
        descricao: 'Desenha a palavra com blocos quadrados',
        ajuda: 'Mande uma palavra curta, de até nove letras, e eu desenho com blocos.',
        usage: '<palavra>', examples: ['goat — desenha a palavra em blocos'],
        dica: 'Quanto mais curta a palavra, melhor fica na tela do celular.',
        run: (t) => {
            const banner = bannerDeBlocos(t)
            const usado = tirarAcento(t.toLowerCase()).replace(/[^a-z0-9 !?.-]/g, '').slice(0, 9)
            return {
                texto: banner ? '```' + banner + '```' : '',
                rotulo: 'Desenho em blocos',
                intro: banner ? `Desenhei "${usado}" com blocos. Só entram letras, números e pontuação simples.` : 'Não achei letra nenhuma que eu saiba desenhar nesse texto.'
            }
        }
    },
    {
        id: 'bomdia', sub: 'Criar', emoji: '🌅', titulo: 'Mensagem de bom dia',
        descricao: 'Escreve um bom dia com o seu assunto',
        ajuda: 'Diga para quem ou sobre o quê e eu escrevo o bom dia.',
        usage: '<para quem ou tema>', examples: ['para o grupo do trabalho — escreve o bom dia'],
        run: (t) => {
            const alvo = t.trim()
            const rnd = rngDe(t)
            const desejo = escolher([
                'que o café esteja forte e a paciência também',
                'que o dia renda mais do que a lista de tarefas',
                'que as notícias de hoje sejam das boas',
                'que nada de urgente apareça antes das nove'
            ], rnd)
            return {
                texto: [
                    `☀️ *Bom dia, ${alvo}!*`,
                    '',
                    `Começou mais um. Que ele venha leve e ${desejo}.`,
                    'Se hoje render pouco, tudo bem: amanhã tem outro.',
                    '',
                    'Bom dia de verdade.'
                ].join('\n'),
                rotulo: 'Mensagem pronta',
                intro: `Bom dia escrito para "${alvo}".`
            }
        }
    },
    {
        id: 'boanoite', sub: 'Criar', emoji: '🌙', titulo: 'Mensagem de boa noite',
        descricao: 'Escreve uma boa noite com o seu assunto',
        ajuda: 'Diga para quem ou sobre o quê e eu escrevo a boa noite.',
        usage: '<para quem ou tema>', examples: ['para a família — escreve a boa noite'],
        run: (t) => {
            const alvo = t.trim()
            const rnd = rngDe(t)
            const fecho = escolher([
                'Descanse: o resto espera até amanhã.',
                'Desligue o celular antes do sono, ele agradece.',
                'O dia foi o que deu, e já está de bom tamanho.',
                'Amanhã a gente resolve o que sobrou.'
            ], rnd)
            return {
                texto: [
                    `🌙 *Boa noite, ${alvo}.*`,
                    '',
                    fecho,
                    'Que o sono venha rápido e a cabeça pare quieta.',
                    '',
                    'Até amanhã.'
                ].join('\n'),
                rotulo: 'Mensagem pronta',
                intro: `Boa noite escrita para "${alvo}".`
            }
        }
    },
    {
        id: 'contagemregressiva', sub: 'Criar', emoji: '⏳', titulo: 'Contagem regressiva escrita',
        descricao: 'Escreve a contagem regressiva para um evento',
        ajuda: 'Diga quantos dias faltam na frente e depois o nome do evento.',
        usage: '[dias] <evento>', examples: ['7 viagem para a praia — escreve a contagem'],
        params: [{ nome: 'dias', tipo: 'numero', padrao: 10, min: 1, max: 999 }],
        run: (t, p) => {
            const evento = t.trim() || 'o grande dia'
            const total = p.dias
            const marcos = []
            for (const d of [total, Math.ceil(total / 2), 3, 2, 1, 0]) {
                if (d > total || marcos.some(m => m.d === d)) continue
                marcos.push({
                    d,
                    texto: d === 0 ? `É hoje: ${evento}!`
                        : d === 1 ? `Falta 1 dia para ${evento}.`
                            : `Faltam ${d} dias para ${evento}.`
                })
            }
            return {
                texto: juntarLinhas(marcos.map(m => `${F.barra(1 - m.d / total, 10)}  ${m.texto}`)),
                rotulo: 'Contagem escrita',
                intro: `Contagem montada para ${evento}, começando em ${total} dia(s).`
            }
        }
    },
    {
        id: 'listatarefas', sub: 'Criar', emoji: '✅', titulo: 'Lista de tarefas',
        descricao: 'Formata as suas tarefas numa lista de marcar',
        ajuda: 'Mande uma tarefa por linha ou separadas por vírgula.',
        usage: '<tarefa 1, tarefa 2>', examples: ['pagar luz, comprar pão — monta a lista'],
        run: (t) => {
            const itens = pedacosDe(t).slice(0, 40)
            return {
                texto: [
                    '📋 *Para fazer*',
                    '',
                    ...itens.map((i, n) => `☐ ${n + 1}. ${i.charAt(0).toUpperCase() + i.slice(1)}`),
                    '',
                    `Total: ${itens.length} tarefa(s).`
                ].join('\n'),
                rotulo: 'Lista pronta',
                intro: `Formatei ${itens.length} tarefa(s) numa lista de marcar.`
            }
        }
    },
    {
        id: 'atareuniao', sub: 'Criar', emoji: '🗒️', titulo: 'Ata de reunião',
        descricao: 'Formata os assuntos numa ata de reunião',
        ajuda: 'Primeira linha é o assunto da reunião, as outras são os pontos tratados.',
        usage: '<assunto\\nponto 1\\nponto 2>', examples: ['obra do salão\\nverba aprovada — monta a ata'],
        run: (t) => {
            const partes = pedacosDe(t)
            const assunto = partes[0] || 'Reunião'
            const pontos = partes.slice(1)
            return {
                texto: [
                    `🗒️ *Ata — ${assunto}*`,
                    '',
                    '*Pontos tratados*',
                    ...(pontos.length ? pontos.map((p, i) => `${i + 1}. ${p}`) : ['1. (nenhum ponto informado além do assunto)']),
                    '',
                    '*Combinados*',
                    '• Responsável: a definir no grupo',
                    '• Prazo: a definir no grupo',
                    '',
                    'Quem participou pode corrigir respondendo a esta mensagem.'
                ].join('\n'),
                rotulo: 'Ata pronta',
                intro: `Ata montada com ${pontos.length} ponto(s) sobre "${assunto}".`
            }
        }
    },
    {
        id: 'poema', sub: 'Criar', emoji: '🪶', titulo: 'Poema com as suas palavras',
        descricao: 'Monta um poema curto com as palavras dadas',
        ajuda: 'Mande as palavras que devem aparecer e eu monto os versos em cima delas.',
        usage: '<palavras>', examples: ['chuva, janela, saudade — monta o poema'],
        run: (t) => {
            const ps = palavrasDe(t).map(w => w.toLowerCase())
            const p = (i) => ps[i % Math.max(1, ps.length)] || 'silêncio'
            const versos = [
                `A ${p(0)} chegou sem avisar,`,
                `e ficou do jeito que ${p(1)} costuma ficar.`,
                `Entre uma ${p(2)} e outra, aprendi`,
                `que ${p(0)} não se manda embora, se espera passar.`,
                '',
                `Quando ${p(3)} voltar a caber no peito,`,
                `eu conto essa história direito.`
            ]
            return {
                texto: juntarLinhas(versos),
                rotulo: 'Poema',
                intro: `Poema montado com ${Math.min(4, ps.length)} palavra(s) suas.`
            }
        }
    },
    {
        id: 'acrostico', sub: 'Criar', emoji: '🔡', titulo: 'Acróstico',
        descricao: 'Monta um acróstico com a palavra que mandar',
        ajuda: 'Cada letra da palavra começa uma linha. Mande também palavras para eu usar.',
        usage: '<palavra>', examples: ['amizade — monta o acróstico da palavra'],
        run: (t) => {
            const ps = palavrasDe(t)
            const base = ps[0] || 'amizade'
            const extras = ps.slice(1)
            const rnd = rngDe(t)
            const complementos = extras.length ? extras : ['sempre por perto', 'sem cobrança', 'no dia ruim também', 'de verdade', 'sem hora marcada', 'que fica']
            const letras = caracteresDe(tirarAcento(base.toLowerCase())).filter(c => /[a-z0-9]/.test(c)).slice(0, 14)
            const linhas = letras.map((c, i) => `*${c.toUpperCase()}* — ${complementos[i % complementos.length]}`)
            return {
                texto: juntarLinhas(linhas),
                rotulo: `Acróstico de ${base.toUpperCase()}`,
                intro: `Acróstico de "${base}" com ${letras.length} linha(s).`,
                dica: extras.length ? '' : 'Mande outras palavras depois da principal para eu usar nas linhas: ' + escolher(['amizade calma leal', 'coragem fé luta'], rnd)
            }
        }
    },
    {
        id: 'hashtags', sub: 'Criar', emoji: '#️⃣', titulo: 'Hashtags do texto',
        descricao: 'Transforma as palavras do texto em hashtags',
        ajuda: 'Pego as palavras que importam e devolvo prontas para postar.',
        usage: '<texto>', examples: ['bolo de cenoura caseiro — vira as hashtags do post'],
        run: (t) => {
            const vazias = new Set(['de', 'da', 'do', 'que', 'com', 'para', 'uma', 'os', 'as', 'no', 'na', 'em', 'e', 'o', 'a', 'um'])
            const ps = [...new Set(palavrasDe(t).map(w => tirarAcento(w).toLowerCase()).filter(w => w.length > 2 && !vazias.has(w)))]
            const tags = ps.slice(0, 15).map(w => '#' + w.replace(/[^a-z0-9]/g, ''))
            const juntas = ps.length > 1 ? '#' + ps.slice(0, 3).map(w => w.replace(/[^a-z0-9]/g, '')).join('') : ''
            return {
                texto: [tags.join(' '), juntas].filter(Boolean).join('\n'),
                rotulo: 'Hashtags prontas',
                intro: `Montei ${tags.length} hashtag(s) com as palavras do seu texto.`
            }
        }
    },
    {
        id: 'titulos', sub: 'Criar', emoji: '📰', titulo: 'Sugestões de título',
        descricao: 'Sugere títulos a partir do assunto do texto',
        ajuda: 'Mande o assunto ou o texto e devolvo cinco títulos.',
        usage: '<assunto>', examples: ['como economizar água em casa — sugere títulos'],
        run: (t) => {
            const assunto = t.trim().replace(/[.!?]+$/, '').toLowerCase()
            const ps = palavrasDe(assunto)
            const chave = ps.slice(0, 4).join(' ') || assunto
            const ideias = [
                chave.charAt(0).toUpperCase() + chave.slice(1),
                `${chave.charAt(0).toUpperCase() + chave.slice(1)}: o guia sem enrolação`,
                `O que ninguém te conta sobre ${chave}`,
                `${ps.length} coisas para saber antes de ${chave}`,
                `${chave.charAt(0).toUpperCase() + chave.slice(1)} — do começo ao fim`
            ]
            return {
                texto: juntarLinhas(ideias.map((i, n) => `${n + 1}. ${i}`)),
                rotulo: 'Títulos sugeridos',
                intro: `Cinco títulos montados em cima de "${chave}".`
            }
        }
    },
    {
        id: 'avisogrupo', sub: 'Criar', emoji: '📢', titulo: 'Aviso para o grupo',
        descricao: 'Formata o seu recado como aviso de grupo',
        ajuda: 'Primeira linha vira o título do aviso e o resto vira o corpo.',
        usage: '<título\\nrecado>', examples: ['portão quebrado\\nusar a entrada lateral — formata o aviso'],
        run: (t) => {
            const partes = pedacosDe(t)
            const titulo = (partes[0] || 'Aviso').toUpperCase()
            const corpo = partes.slice(1)
            return {
                texto: [
                    `📢 *${titulo}*`,
                    '',
                    ...(corpo.length ? corpo.map(c => `• ${c}`) : ['• (sem detalhes além do título)']),
                    '',
                    'Quem tiver dúvida responde aqui mesmo.'
                ].join('\n'),
                rotulo: 'Aviso pronto',
                intro: `Aviso formatado com ${corpo.length} ponto(s).`
            }
        }
    },
    {
        id: 'enquete', sub: 'Criar', emoji: '🗳️', titulo: 'Enquete para o grupo',
        descricao: 'Formata pergunta e opções como enquete',
        ajuda: 'Primeira linha é a pergunta, as outras são as opções.',
        usage: '<pergunta\\nopção 1\\nopção 2>', examples: ['que dia?\\nsábado\\ndomingo — monta a enquete'],
        run: (t) => {
            const partes = pedacosDe(t)
            const pergunta = partes[0] || 'O que vocês acham?'
            const opcoes = partes.slice(1)
            const numeros = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
            return {
                texto: [
                    `🗳️ *${pergunta}*`,
                    '',
                    ...(opcoes.length ? opcoes.slice(0, 9).map((o, i) => `${numeros[i]} ${o}`) : ['1️⃣ Sim', '2️⃣ Não']),
                    '',
                    'Responda com o número da sua escolha.'
                ].join('\n'),
                rotulo: 'Enquete pronta',
                intro: `Enquete com ${opcoes.length || 2} opção(ões) sobre "${pergunta}".`
            }
        }
    },
    {
        id: 'despedida', sub: 'Criar', emoji: '👋', titulo: 'Mensagem de despedida',
        descricao: 'Escreve uma despedida com o motivo dado',
        ajuda: 'Diga de onde está saindo e por quê. Escrevo sem drama.',
        usage: '<motivo, para quem>', examples: ['saindo do grupo do trabalho — escreve a despedida'],
        run: (t) => {
            const [motivo, quem] = pedacosDe(t)
            const razao = motivo || t.trim()
            return {
                texto: [
                    quem ? `${quem}, passando para me despedir.` : 'Passando aqui para me despedir.',
                    '',
                    `Estou ${razao.toLowerCase()}. Não é briga com ninguém, é só a vida mudando de lugar.`,
                    'Levo comigo as conversas boas e fico devendo as risadas.',
                    '',
                    'Meu contato continua o mesmo. Apareçam.'
                ].join('\n'),
                rotulo: 'Despedida pronta',
                intro: 'Despedida escrita com o motivo que você deu, sem drama.'
            }
        }
    },
    {
        id: 'boasvindas', sub: 'Criar', emoji: '🚪', titulo: 'Mensagem de boas-vindas',
        descricao: 'Escreve boas-vindas para quem chegou',
        ajuda: 'Diga o nome de quem chegou e, se quiser, o nome do grupo.',
        usage: '<nome, grupo>', examples: ['Marcos, time do futebol — escreve as boas-vindas'],
        run: (t) => {
            const [nome, grupo] = pedacosDe(t)
            const quem = nome || palavrasDe(t)[0] || 'pessoa nova'
            return {
                texto: [
                    `🚪 *Chegou gente nova: ${quem}*`,
                    '',
                    grupo ? `Seja bem-vindo ao ${grupo}.` : 'Seja bem-vindo por aqui.',
                    'Fique à vontade para se apresentar quando quiser — ninguém morde.',
                    'Combinado do grupo: respeito sempre, corrente nunca.',
                    '',
                    `Boa estadia, ${quem}.`
                ].join('\n'),
                rotulo: 'Boas-vindas prontas',
                intro: `Mensagem de boas-vindas escrita para ${quem}.`
            }
        }
    },
    {
        id: 'dedicatoria', sub: 'Criar', emoji: '💝', titulo: 'Dedicatória',
        descricao: 'Escreve uma dedicatória para presente ou livro',
        ajuda: 'Diga para quem e o motivo. Devolvo a dedicatória curta.',
        usage: '<para quem, motivo>', examples: ['Clara, por ter aguentado meus áudios — escreve a dedicatória'],
        run: (t) => {
            const [quem, motivo] = pedacosDe(t)
            const nome = quem || palavrasDe(t)[0] || 'você'
            return {
                texto: [
                    `Para ${nome},`,
                    '',
                    motivo ? `${motivo.charAt(0).toUpperCase() + motivo.slice(1)} — e por tudo que não coube aqui.` : 'Por tudo que não coube nesta página.',
                    'Que isto aqui sirva de lembrete: você fez diferença.',
                    '',
                    'Com carinho.'
                ].join('\n'),
                rotulo: 'Dedicatória pronta',
                intro: `Dedicatória escrita para ${nome}.`
            }
        }
    }
]

// ── Registro ───────────────────────────────────────────────────────────────

const OPS = [].concat(OPS_TRANSFORMAR, OPS_ANALISAR, OPS_CODIGOS, OPS_CRIAR)
const POR_ID = new Map(OPS.map(o => [o.id, o]))

/**
 * Pares de ida e volta dos codificadores — a suíte usa isto para garantir que
 * codificar e decodificar devolve o texto original.
 *
 * `chave` é o parâmetro que os dois lados precisam receber (César, Vigenère).
 * `normaliza` existe porque alguns códigos não conhecem maiúscula nem acento:
 * morse, braille, fonético, T9 e teclado voltam sempre em letra minúscula.
 */
const PARES_CODIGO = [
    { ida: 'morse', volta: 'demorse', amostra: 'ola mundo 123', normaliza: s => s.toLowerCase() },
    { ida: 'binario', volta: 'debinario', amostra: 'Olá mundo 123 😀' },
    { ida: 'hexadecimal', volta: 'dehexadecimal', amostra: 'Olá mundo 123 😀' },
    { ida: 'octal', volta: 'deoctal', amostra: 'Olá mundo 123 😀' },
    { ida: 'unicodedecimal', volta: 'deunicodedecimal', amostra: 'Olá mundo 123 😀' },
    { ida: 'base64', volta: 'debase64', amostra: 'Olá mundo 123 😀' },
    { ida: 'urlcodificar', volta: 'urldecodificar', amostra: 'Olá mundo 123 😀' },
    { ida: 'rot13', volta: 'rot13', amostra: 'Ola mundo' },
    { ida: 'atbash', volta: 'atbash', amostra: 'Ola mundo' },
    { ida: 'cesar', volta: 'decesar', amostra: 'Ola mundo', chave: '7' },
    { ida: 'vigenere', volta: 'devigenere', amostra: 'ola mundo', chave: 'limao' },
    { ida: 'cifranumeros', volta: 'decifranumeros', amostra: 'ola mundo', normaliza: s => s.toLowerCase() },
    { ida: 'fonetico', volta: 'defonetico', amostra: 'ola mundo', normaliza: s => s.toLowerCase() },
    { ida: 'braille', volta: 'debraille', amostra: 'ola mundo', normaliza: s => s.toLowerCase() },
    { ida: 'leet', volta: 'deleet', amostra: 'ola mundo', normaliza: s => s.toLowerCase() },
    { ida: 'invertidotexto', volta: 'deinvertidotexto', amostra: 'ola mundo', normaliza: s => s.toLowerCase() },
    { ida: 'codigoteclado', volta: 'decodigoteclado', amostra: 'ola mundo', normaliza: s => s.toLowerCase() },
    { ida: 't9', volta: 'det9', amostra: 'ola mundo', normaliza: s => s.toLowerCase() },
    { ida: 'trilho', volta: 'detrilho', amostra: 'encontro no portao' }
]

function opDe(id) {
    const op = POR_ID.get(id)
    if (!op) throw new Error(`Operação de texto desconhecida: ${id}`)
    return op
}

// ── Porta de entrada dos comandos ──────────────────────────────────────────

/**
 * Pega o texto: o que a pessoa digitou ou, se não digitou nada, o texto da
 * mensagem respondida. O handler já herda a citação em `args`, mas comando
 * chamado por outro caminho pode receber só `info` — por isso a segunda volta.
 */
function entradaDe(args = [], info = null) {
    const direto = Array.isArray(args) ? args.join(' ').trim() : String(args || '').trim()
    if (direto) return limitarEntrada(direto)
    const citada = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (citada) {
        const texto = citada.conversation
            || citada.extendedTextMessage?.text
            || citada.imageMessage?.caption
            || citada.videoMessage?.caption
            || citada.documentMessage?.caption
            || ''
        if (String(texto).trim()) return limitarEntrada(String(texto).trim())
    }
    return ''
}

/** Roda a operação crua: entra texto, sai o resultado. Sem apresentação. */
function aplicar(id, bruto) {
    const op = opDe(id)
    const entrada = limitarEntrada(bruto)
    const { texto, p } = lerParametros(entrada, op.params || [])
    const r = op.run(texto, p) || {}
    return r
}

/** Tela de "como usar", quando a pessoa chama o comando sem texto nenhum. */
function telaDeAjuda(id, { prefix = '.', nome = '' } = {}) {
    const op = opDe(id)
    const exemplos = (op.examples || []).map(e => {
        const [args, oque] = String(e).split(' — ')
        return '`' + prefix + nome + (args ? ' ' + args : '') + '`' + (oque ? ' — ' + oque : '')
    })
    return limitarTela({
        emoji: op.emoji, titulo: op.titulo, prefix,
        intro: op.ajuda,
        secoes: [
            { emoji: '✍️', titulo: 'Digite assim', linhas: ['`' + prefix + nome + ' ' + op.usage + '`'] },
            { emoji: '💬', titulo: 'Exemplo pronto', linhas: exemplos }
        ],
        dica: op.dica || 'Você também pode responder a uma mensagem com esse comando, sem digitar o texto de novo.'
    })
}

/** Tela do resultado, pronta para F.tela. Toda a decisão de recorte mora aqui. */
function telaDeResultado(id, bruto, { prefix = '.', nome = '' } = {}) {
    const op = opDe(id)
    const r = aplicar(id, bruto)
    const secoes = []
    if (r.texto !== undefined) {
        secoes.push({ emoji: r.emojiRotulo || '📄', titulo: r.rotulo || 'Resultado', linhas: [cortarSaida(r.texto)] })
    }
    for (const b of (r.blocos || [])) secoes.push(b)
    if (op.sub === 'Códigos') secoes.push({ emoji: '🎈', titulo: 'Combinado', linhas: [AVISO_BRINCADEIRA] })
    return limitarTela({
        emoji: op.emoji, titulo: op.titulo, prefix,
        intro: r.intro || (op.descricao.charAt(0).toUpperCase() + op.descricao.slice(1) + '.'),
        secoes,
        dica: r.dica || op.dica || ''
    })
}

module.exports = {
    // catálogo
    OPS, POR_ID, PARES_CODIGO, opDe,
    // porta de entrada
    entradaDe, aplicar, telaDeAjuda, telaDeResultado,
    // helpers expostos para os testes
    limitarEntrada, cortarSaida, recortar, limitarTela, tirarAcento, palavrasDe,
    frasesDe, linhasDe, paragrafosDe, caracteresDe, contagemOrdenada, silabasDe,
    distanciaEdicao, rngDe, lerParametros, regexPalavra, doisPedacos, duasPalavras,
    bannerDeBlocos, cpfValido,
    LIMITE_ENTRADA, LIMITE_SAIDA, LIMITE_TELA, AVISO_BRINCADEIRA
}
