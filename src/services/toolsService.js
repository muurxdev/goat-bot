/**
 * Ferramentas do dia a dia — geradores, sorteios e contas de calendário.
 *
 * Complementa `utilitariotools`, que já cobre conversões e cálculos
 * financeiros. Aqui ficam as funções que produzem algo novo (senha, código,
 * paleta) ou que resolvem data — as duas coisas que mais dão errado quando
 * cada comando implementa do seu jeito.
 *
 * Aleatoriedade: `crypto.randomInt` onde o resultado protege alguma coisa
 * (senha, código de acesso). `Math.random` basta para sorteio de brincadeira,
 * e o custo é menor.
 */

const crypto = require('node:crypto')

const MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz'
const MAIUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITOS = '0123456789'
const SIMBOLOS = '!@#$%&*?-_=+'

/** Caracteres que se confundem na leitura: fora de senha que alguém vai digitar. */
const AMBIGUOS = /[0OoIl1|]/g

/** Palavras curtas para frases-senha, fáceis de lembrar e difíceis de adivinhar. */
const PALAVRAS = [
    'dragao', 'escudo', 'floresta', 'tempestade', 'caverna', 'martelo', 'estrela', 'oceano',
    'muralha', 'relampago', 'coragem', 'sombra', 'aurora', 'ferro', 'cristal', 'trovao',
    'pantano', 'deserto', 'montanha', 'raposa', 'corvo', 'lobo', 'urso', 'javali',
    'tesouro', 'lanterna', 'bussola', 'ancora', 'vela', 'ponte', 'torre', 'portao'
]

function inteiroSeguro(max) {
    return crypto.randomInt(0, Math.max(1, max))
}

function escolher(lista) {
    return lista[inteiroSeguro(lista.length)]
}

/**
 * Gera uma senha.
 * @param {object} opts
 * @param {number} opts.tamanho
 * @param {boolean} opts.simbolos
 * @param {boolean} opts.semAmbiguos evita 0/O, 1/l/I — para senha que será digitada
 */
function gerarSenha({ tamanho = 16, simbolos = true, semAmbiguos = false } = {}) {
    const n = Math.min(64, Math.max(4, Number(tamanho) || 16))
    let alfabeto = MINUSCULAS + MAIUSCULAS + DIGITOS + (simbolos ? SIMBOLOS : '')
    if (semAmbiguos) alfabeto = alfabeto.replace(AMBIGUOS, '')

    // Garante ao menos um de cada classe pedida: senha só de letras passa em
    // qualquer gerador ingênuo e é recusada por metade dos sistemas.
    const obrigatorios = [MINUSCULAS, MAIUSCULAS, DIGITOS]
    if (simbolos) obrigatorios.push(SIMBOLOS)

    const chars = obrigatorios.map(c => {
        const limpo = semAmbiguos ? c.replace(AMBIGUOS, '') : c
        return limpo[inteiroSeguro(limpo.length)]
    })
    while (chars.length < n) chars.push(alfabeto[inteiroSeguro(alfabeto.length)])

    // Embaralha para os obrigatórios não ficarem sempre no começo.
    for (let i = chars.length - 1; i > 0; i--) {
        const j = inteiroSeguro(i + 1)
        ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }
    return chars.slice(0, n).join('')
}

/** Frase-senha: palavras separadas, mais fácil de lembrar que uma senha aleatória. */
function gerarFraseSenha(palavras = 4, separador = '-') {
    const n = Math.min(10, Math.max(2, Number(palavras) || 4))
    const escolhidas = []
    for (let i = 0; i < n; i++) escolhidas.push(escolher(PALAVRAS))
    return escolhidas.join(separador) + separador + inteiroSeguro(100)
}

/** Código curto, para convite ou confirmação. */
function gerarCodigo(tamanho = 8, comLetras = true) {
    const alfabeto = (comLetras ? MAIUSCULAS : '') + DIGITOS
    const limpo = alfabeto.replace(AMBIGUOS, '')
    let saida = ''
    for (let i = 0; i < Math.min(32, Math.max(4, tamanho)); i++) saida += limpo[inteiroSeguro(limpo.length)]
    return saida
}

/**
 * Avalia a força de uma senha pela entropia real do conjunto usado.
 * Não é lista de regras: mede quantas tentativas seriam necessárias.
 */
function forcaDaSenha(senha) {
    const s = String(senha || '')
    if (!s) return { bits: 0, nivel: 'vazia', tempo: 'instantâneo' }

    let alfabeto = 0
    if (/[a-z]/.test(s)) alfabeto += 26
    if (/[A-Z]/.test(s)) alfabeto += 26
    if (/[0-9]/.test(s)) alfabeto += 10
    if (/[^a-zA-Z0-9]/.test(s)) alfabeto += 32

    const bits = s.length * Math.log2(Math.max(2, alfabeto))
    // Repetição e sequência reduzem a força real bem abaixo da teórica.
    const penalidade = (/(.)\1{2,}/.test(s) ? 10 : 0) + (/(012|123|234|345|456|567|678|789|abc|qwe)/i.test(s) ? 15 : 0)
    const efetivo = Math.max(0, bits - penalidade)

    let nivel
    if (efetivo < 28) nivel = 'muito fraca'
    else if (efetivo < 40) nivel = 'fraca'
    else if (efetivo < 60) nivel = 'razoável'
    else if (efetivo < 80) nivel = 'forte'
    else nivel = 'muito forte'

    // 10 bilhões de tentativas por segundo — hipótese pessimista e realista.
    const segundos = Math.pow(2, efetivo) / 1e10
    return { bits: efetivo, nivel, alfabeto, tempo: descreverSegundos(segundos), penalizada: penalidade > 0 }
}

function descreverSegundos(seg) {
    if (seg < 1) return 'instantâneo'
    if (seg < 60) return Math.round(seg) + ' segundos'
    if (seg < 3600) return Math.round(seg / 60) + ' minutos'
    if (seg < 86400) return Math.round(seg / 3600) + ' horas'
    if (seg < 31536000) return Math.round(seg / 86400) + ' dias'
    const anos = seg / 31536000
    if (anos < 1000) return Math.round(anos) + ' anos'
    if (anos < 1e6) return Math.round(anos / 1000) + ' mil anos'
    if (anos < 1e9) return Math.round(anos / 1e6) + ' milhões de anos'
    return 'mais que a idade do universo'
}

/** Embaralha uma lista sem alterar a original. */
function embaralhar(lista) {
    const c = [...lista]
    for (let i = c.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[c[i], c[j]] = [c[j], c[i]]
    }
    return c
}

/** Divide participantes em N times equilibrados em tamanho. */
function dividirTimes(participantes, quantidade = 2) {
    const n = Math.min(20, Math.max(2, Number(quantidade) || 2))
    const baralho = embaralhar(participantes)
    const times = Array.from({ length: n }, () => [])
    baralho.forEach((p, i) => times[i % n].push(p))
    return times
}

// ══════════════════════════════════════════════════════════════
// CORES
// ══════════════════════════════════════════════════════════════

function corAleatoria() {
    const hex = '#' + inteiroSeguro(0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()
    return { hex, ...detalharCor(hex) }
}

function detalharCor(hex) {
    const limpo = String(hex).replace('#', '')
    const r = parseInt(limpo.slice(0, 2), 16) || 0
    const g = parseInt(limpo.slice(2, 4), 16) || 0
    const b = parseInt(limpo.slice(4, 6), 16) || 0
    // Luminância relativa: decide se texto por cima deve ser claro ou escuro.
    const luz = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return { r, g, b, rgb: `rgb(${r}, ${g}, ${b})`, clara: luz > 0.6, luminancia: luz }
}

/** Paleta harmônica a partir de uma cor base, girando o matiz. */
function gerarPaleta(baseHex = null, quantidade = 5) {
    const base = baseHex ? detalharCor(baseHex) : corAleatoria()
    const cores = []
    for (let i = 0; i < quantidade; i++) {
        const fator = 0.6 + (i * 0.18)
        const r = Math.min(255, Math.round(base.r * fator))
        const g = Math.min(255, Math.round(base.g * fator))
        const b = Math.min(255, Math.round(base.b * fator))
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
        cores.push({ hex, rgb: `rgb(${r}, ${g}, ${b})` })
    }
    return cores
}

// ══════════════════════════════════════════════════════════════
// DATAS
// ══════════════════════════════════════════════════════════════

/** Converte "dd/mm/aaaa" ou "aaaa-mm-dd" numa data. */
function lerData(texto) {
    const t = String(texto || '').trim()
    let m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return null
}

function diferencaDeDatas(a, b) {
    const ms = Math.abs(b - a)
    const dias = Math.floor(ms / 86400000)
    let anos = b.getFullYear() - a.getFullYear()
    let meses = b.getMonth() - a.getMonth()
    if (b.getDate() < a.getDate()) meses--
    if (meses < 0) { anos--; meses += 12 }
    return { dias, semanas: Math.floor(dias / 7), meses: anos * 12 + meses, anos, horas: Math.floor(ms / 3600000) }
}

/** Dias úteis entre duas datas, excluindo sábado e domingo. */
function diasUteis(inicio, fim) {
    let contador = 0
    const d = new Date(inicio)
    const limite = new Date(fim)
    while (d <= limite) {
        const dia = d.getDay()
        if (dia !== 0 && dia !== 6) contador++
        d.setDate(d.getDate() + 1)
    }
    return contador
}

/** Feriados nacionais fixos e os móveis calculados a partir da Páscoa. */
function feriados(ano) {
    const a = Number(ano) || new Date().getFullYear()
    const fixos = [
        ['01/01', 'Confraternização Universal'], ['21/04', 'Tiradentes'],
        ['01/05', 'Dia do Trabalho'], ['07/09', 'Independência'],
        ['12/10', 'Nossa Senhora Aparecida'], ['02/11', 'Finados'],
        ['15/11', 'Proclamação da República'], ['20/11', 'Consciência Negra'],
        ['25/12', 'Natal']
    ]
    const pascoa = calcularPascoa(a)
    const movel = (dias, nome) => {
        const d = new Date(pascoa)
        d.setDate(d.getDate() + dias)
        return [`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`, nome]
    }
    return [
        ...fixos,
        movel(-47, 'Carnaval'),
        movel(-2, 'Sexta-feira Santa'),
        movel(0, 'Páscoa'),
        movel(60, 'Corpus Christi')
    ].sort((x, y) => {
        const [dx, mx] = x[0].split('/').map(Number)
        const [dy, my] = y[0].split('/').map(Number)
        return mx - my || dx - dy
    })
}

/** Algoritmo de Gauss para a data da Páscoa. */
function calcularPascoa(ano) {
    const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4), k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const mes = Math.floor((h + l - 7 * m + 114) / 31)
    const dia = ((h + l - 7 * m + 114) % 31) + 1
    return new Date(ano, mes - 1, dia)
}

/** Número romano a partir de um inteiro de 1 a 3999. */
function paraRomano(numero) {
    const n = Math.floor(Number(numero) || 0)
    if (n < 1 || n > 3999) return null
    const tabela = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
        [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
    let resto = n, saida = ''
    for (const [valor, letra] of tabela) {
        while (resto >= valor) { saida += letra; resto -= valor }
    }
    return saida
}

function deRomano(texto) {
    const t = String(texto || '').toUpperCase().trim()
    if (!/^[MDCLXVI]+$/.test(t)) return null
    const valores = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
    let total = 0
    for (let i = 0; i < t.length; i++) {
        const atual = valores[t[i]], proximo = valores[t[i + 1]] || 0
        total += atual < proximo ? -atual : atual
    }
    return paraRomano(total) === t ? total : null
}

/** Transforma um texto em identificador de endereço. */
function paraSlug(texto) {
    return String(texto || '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)
}

module.exports = {
    PALAVRAS,
    escolher,
    inteiroSeguro,
    gerarSenha,
    gerarFraseSenha,
    gerarCodigo,
    forcaDaSenha,
    descreverSegundos,
    embaralhar,
    dividirTimes,
    corAleatoria,
    detalharCor,
    gerarPaleta,
    lerData,
    diferencaDeDatas,
    diasUteis,
    feriados,
    calcularPascoa,
    paraRomano,
    deRomano,
    paraSlug
}
