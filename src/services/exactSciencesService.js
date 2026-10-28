/**
 * Matemática, Física e Química — a sala de aula do bot.
 *
 * Toda a conta da família `.mat1` … `.mat180` mora aqui. O comando só recebe o
 * que a pessoa digitou, entrega para `responder()` e imprime o resultado; quem
 * sabe fazer conta é este arquivo. Sem rede, sem banco, sem estado.
 *
 * ─── DE ONDE VÊM OS DADOS ───
 *
 * • Massas atômicas: pesos atômicos padrão da IUPAC (tabela de 2021),
 *   arredondados para 2 a 4 casas. Para elementos sem isótopo estável usamos o
 *   número de massa do isótopo mais estável conhecido (entre colchetes na IUPAC).
 * • Eletronegatividade: escala de Pauling (valores clássicos; alguns elementos
 *   pesados não têm valor medido e ficam sem).
 * • Grupo e período: numeração IUPAC de 1 a 18. Lantanídeos e actinídeos não têm
 *   grupo (ficam fora da numeração), e isso está marcado como null.
 * • Constantes físicas: valores exatos ou recomendados do SI (revisão de 2019 do
 *   Sistema Internacional, que fixou c, h, e, k e NA por definição).
 * • Calores específicos e latentes: valores de tabela de ensino médio, à pressão
 *   de 1 atm. São valores didáticos, não medições de laboratório.
 * • Índices de refração: valores para luz amarela do sódio (589 nm), a 20 °C.
 * • Geometria molecular: modelo de repulsão dos pares eletrônicos (VSEPR),
 *   conforme o que se ensina no ensino médio.
 *
 * Onde aparece número medido, o comando diz de onde ele veio. Onde é conta, o
 * comando mostra o passo a passo — a ideia é a pessoa aprender, não só copiar.
 *
 * Convenção de erro: entrada ruim vira `EntradaInvalida`, que `responder()`
 * converte numa tela educada explicando o que faltou. Qualquer outro erro sobe
 * para o comando, que loga e avisa a pessoa.
 */

const F = require('../utils/formato')

// ════════════════════════════════════════════════════════════
//  1. Erros e helpers numéricos
// ════════════════════════════════════════════════════════════

/** Entrada que o aluno digitou errado — não é bug, é conversa. */
class EntradaInvalida extends Error {
    constructor(mensagem) { super(mensagem); this.name = 'EntradaInvalida' }
}

/** Interrompe a conta com uma explicação em português simples. */
function erro(mensagem) { throw new EntradaInvalida(mensagem) }

/** Texto cru do que a pessoa digitou. */
function juntar(args) { return (Array.isArray(args) ? args.join(' ') : String(args || '')).trim() }

/**
 * Converte um pedaço de texto em número, aceitando vírgula decimal,
 * ponto de milhar, sinal e notação científica (1,5e3 ou 1,5 x 10^3).
 */
function paraNumero(txt, rotulo = 'valor') {
    if (typeof txt === 'number') return txt
    let t = String(txt || '').trim().toLowerCase()
    if (!t) erro(`faltou o ${rotulo}`)
    t = t.replace(/\s*(?:x|×|\*)\s*10\s*\^?\s*([+-]?\d+)/, 'e$1')
    t = t.replace(/\.(?=\d{3}\b)/g, '')
    t = t.replace(',', '.')
    t = t.replace(/[^0-9.e+-]/g, '')
    const v = Number(t)
    if (!Number.isFinite(v)) erro(`não entendi o ${rotulo}: "${txt}"`)
    return v
}

/** Pega todos os números soltos no texto (útil para "100 kWh 0,92"). */
function extrairNumeros(texto) {
    const t = String(texto || '')
        .replace(/\s*(?:x|×)\s*10\s*\^\s*([+-]?\d+)/gi, 'e$1')
        .replace(/(\d)\.(?=\d{3}\b)/g, '$1')
    const achados = t.match(/[+-]?\d+(?:[.,]\d+)?(?:e[+-]?\d+)?/gi) || []
    return achados.map(s => Number(s.replace(',', '.'))).filter(v => Number.isFinite(v))
}

/**
 * Exige `quantos` números na entrada. Os rótulos entram na mensagem de erro
 * para a pessoa saber exatamente o que faltou.
 */
function numeros(args, quantos, rotulos = []) {
    const vs = extrairNumeros(juntar(args))
    if (vs.length < quantos) {
        const nomes = rotulos.length ? rotulos.join(', ') : `${quantos} números`
        erro(`preciso de ${quantos} ${quantos === 1 ? 'número' : 'números'} (${nomes}) e recebi ${vs.length}`)
    }
    return vs
}

/** Formata número no jeito brasileiro: 1.234,56. */
function n(x, casas = 2) {
    const v = Number(x)
    if (!Number.isFinite(v)) erro('a conta deu um número impossível — confira os valores')
    const abs = Math.abs(v)
    if (abs !== 0 && (abs < 1e-4 || abs >= 1e12)) return sci(v, 3)
    // Arredondar para `casas` apagaria um número pequeno e mostraria "0".
    // Nesse caso abrimos casas suficientes para o valor aparecer de verdade.
    let c = casas
    if (abs !== 0 && abs < Math.pow(10, -casas) / 2) {
        c = Math.min(12, Math.ceil(-Math.log10(abs)) + 2)
    }
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: c, minimumFractionDigits: 0 }).format(v)
}

/**
 * Abre a potência de 10 e escreve o número por extenso, no padrão brasileiro.
 * Cuidado que já custou caro: cortar "0+$" de um inteiro apaga o número —
 * 300000000 virava 3. Só se corta zero depois da vírgula.
 */
function escreverPorExtenso(v, expo) {
    const casas = Math.min(100, Math.max(0, -expo + 4))
    let bruto = v.toFixed(casas)
    if (bruto.includes('.')) bruto = bruto.replace(/0+$/, '').replace(/\.$/, '')
    const negativo = bruto.startsWith('-')
    if (negativo) bruto = bruto.slice(1)
    const [inteiro, decimal] = bruto.split('.')
    const comSeparador = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return (negativo ? '-' : '') + comSeparador + (decimal ? ',' + decimal : '')
}

/** Notação científica legível: 0,001 → "1,000 × 10^-3". */
function sci(x, casas = 3) {
    const v = Number(x)
    if (!Number.isFinite(v)) erro('a conta deu um número impossível — confira os valores')
    if (v === 0) return '0'
    return v.toExponential(casas)
        .replace('.', ',')
        .replace(/e\+?(-?)(\d+)$/, (m, s, d) => ` × 10^${s}${d}`)
}

/** Dinheiro: sempre duas casas. */
function rs(x) {
    const v = Number(x)
    if (!Number.isFinite(v)) erro('a conta deu um valor impossível — confira os números')
    return 'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)
}

function exigirInteiro(x, rotulo) {
    if (!Number.isInteger(x)) erro(`o ${rotulo} precisa ser um número inteiro (recebi ${n(x, 4)})`)
    return x
}
function exigirPositivo(x, rotulo) {
    if (!(x > 0)) erro(`o ${rotulo} precisa ser maior que zero`)
    return x
}
function exigirNaoZero(x, rotulo) {
    if (x === 0) erro(`o ${rotulo} não pode ser zero — não dá para dividir por zero`)
    return x
}
function exigirFaixa(x, min, max, rotulo) {
    if (x < min || x > max) erro(`o ${rotulo} precisa ficar entre ${n(min)} e ${n(max)}`)
    return x
}

/** Máximo divisor comum (Euclides), sempre positivo. */
function mdc(a, b) {
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b))
    while (b) { const t = b; b = a % b; a = t }
    return a
}
/** Mínimo múltiplo comum. */
function mmc(a, b) {
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b))
    if (!a || !b) return 0
    return a / mdc(a, b) * b
}
/** Fatoração em primos: 360 → [[2,3],[3,2],[5,1]]. */
function fatoresPrimos(x) {
    let v = Math.abs(Math.round(x))
    const saida = []
    for (let p = 2; p * p <= v; p += (p === 2 ? 1 : 2)) {
        let e = 0
        while (v % p === 0) { v /= p; e++ }
        if (e) saida.push([p, e])
    }
    if (v > 1) saida.push([v, 1])
    return saida
}
function ehPrimo(x) {
    const v = Math.abs(Math.round(x))
    if (v < 2) return false
    if (v % 2 === 0) return v === 2
    for (let d = 3; d * d <= v; d += 2) if (v % d === 0) return false
    return true
}
function fatorial(k) {
    if (k < 0 || !Number.isInteger(k)) erro('o fatorial só existe para inteiros de 0 para cima')
    if (k > 170) erro('esse fatorial é grande demais para caber no visor (máximo 170)')
    let r = 1
    for (let i = 2; i <= k; i++) r *= i
    return r
}
/** Combinação C(n,k) calculada sem estourar (produto encurtado). */
function combinacoes(N, k) {
    if (k < 0 || k > N) return 0
    k = Math.min(k, N - k)
    let r = 1
    for (let i = 1; i <= k; i++) r = r * (N - k + i) / i
    return Math.round(r)
}
/** Simplifica uma fração para a forma irredutível, sinal no numerador. */
function simplificar(num, den) {
    if (den === 0) erro('o denominador não pode ser zero')
    const g = mdc(num, den) || 1
    let a = num / g, b = den / g
    if (b < 0) { a = -a; b = -b }
    return [a, b]
}
/** Escreve a fração como texto: [3,4] → "3/4"; [4,2] → "2". */
function txtFracao(num, den) {
    const [a, b] = simplificar(num, den)
    return b === 1 ? String(a) : `${a}/${b}`
}
/** Arredonda para `casas` decimais de verdade (evita 0,30000000000000004). */
function arred(x, casas = 6) {
    const f = Math.pow(10, casas)
    return Math.round((x + Number.EPSILON) * f) / f
}
const grausParaRad = g => g * Math.PI / 180
const radParaGraus = r => r * 180 / Math.PI

// ════════════════════════════════════════════════════════════
//  2. Montagem da tela (o comando só imprime o que sai daqui)
// ════════════════════════════════════════════════════════════

/** Seção pronta para F.tela. */
function S(emoji, titulo, linhas) { return { emoji, titulo, linhas: (linhas || []).filter(Boolean) } }
/** Bloco do passo a passo — o coração pedagógico das respostas. */
function passos(linhas) { return S('🧮', 'Como chegamos lá', linhas) }
/** Bloco de tabela/ficha. */
function ficha(titulo, linhas, emoji = '📋') { return S(emoji, titulo, linhas) }
/**
 * Par "rótulo: valor" dentro de uma ficha. Usa o mesmo formato de
 * `formato.campo` para a tela sair igual ao resto do bot.
 */
function F_campo(rotulo, valor) { return F.campo(rotulo, valor) }

/**
 * Resposta padrão de uma conta: uma frase com o resultado em destaque,
 * o passo a passo e uma dica que ensina a ler o número.
 */
function resultado(intro, linhasPasso, dica, extras = []) {
    return { intro, secoes: [passos(linhasPasso), ...extras].filter(Boolean), dica }
}

// ════════════════════════════════════════════════════════════
//  3. Registro dos tópicos
// ════════════════════════════════════════════════════════════

const LISTA = []
const TOPICOS = {}

/**
 * Registra um tópico da sala de aula.
 * @param {object} t
 * @param {string} t.chave       identificador interno (vira o comando matN pela ordem)
 * @param {string} t.sub         'Matemática' | 'Física' | 'Química'
 * @param {string} t.emoji
 * @param {string} t.titulo
 * @param {string} t.descricao   até 55 caracteres, aparece no menu
 * @param {string} t.usage       sintaxe curta
 * @param {string[]} t.examples  'argumentos — explicação'
 * @param {string} t.intro       frase da tela de ajuda
 * @param {string} [t.dica]      dica da tela de ajuda
 * @param {function} t.calcular  (args, texto) => {intro, secoes, dica}
 */
function T(t) {
    if (TOPICOS[t.chave]) throw new Error(`tópico duplicado: ${t.chave}`)
    if (!t.examples || !t.examples.length) throw new Error(`tópico sem exemplo: ${t.chave}`)
    if (t.descricao.length > 55) throw new Error(`descrição longa demais em ${t.chave}: ${t.descricao.length}`)
    TOPICOS[t.chave] = t
    LISTA.push(t)
    return t
}

/** Só os argumentos de um exemplo ('120 2 — 120 km em 2 h' → '120 2'). */
function argsDoExemplo(exemplo) { return String(exemplo).split(' — ')[0].trim() }

/** Tela mostrada quando a pessoa chama o comando sem digitar nada. */
function telaAjuda(t, comando, prefix) {
    const exemplos = t.examples.slice(0, 3).map(ex => {
        const [a, oque] = String(ex).split(' — ')
        return `• \`${prefix}${comando} ${a}\`${oque ? ' — ' + oque : ''}`
    })
    return {
        emoji: t.emoji, titulo: t.titulo, prefix,
        intro: t.intro,
        secoes: [
            S('✍️', 'Digite assim', [`\`${prefix}${comando} ${t.usage}\``]),
            S('🎯', 'Exemplos prontos', exemplos)
        ],
        dica: t.dica || 'Pode usar vírgula nos decimais: eu entendo 2,5 do mesmo jeito que 2.5.',
        proximos: [{ nome: comando, args: argsDoExemplo(t.examples[0]), oque: 'roda o exemplo agora' }]
    }
}

/** Tela mostrada quando a conta não deu certo por causa da entrada. */
function telaErro(t, comando, prefix, motivo) {
    return {
        emoji: '🤔', titulo: 'Quase lá', prefix,
        intro: `Não consegui resolver ${t.titulo.toLowerCase()} com o que você mandou: ${motivo}.`,
        secoes: [
            S('✍️', 'O jeito certo', [`\`${prefix}${comando} ${t.usage}\``]),
            S('🎯', 'Exemplo que funciona', [`• \`${prefix}${comando} ${argsDoExemplo(t.examples[0])}\``])
        ],
        dica: 'Se o número tiver vírgula, pode mandar com vírgula mesmo.',
        proximos: [{ nome: comando, args: argsDoExemplo(t.examples[0]), oque: 'roda o exemplo agora' }]
    }
}

/**
 * Faz a conta e devolve o objeto pronto para `F.tela`.
 * @param {string} chave
 * @param {string[]} args
 * @param {{prefix?: string, comando?: string}} opcoes
 */
function responder(chave, args = [], opcoes = {}) {
    const t = TOPICOS[chave]
    if (!t) throw new Error(`tópico desconhecido no serviço de exatas: ${chave}`)
    const prefix = opcoes.prefix || '.'
    const comando = opcoes.comando || chave
    const texto = juntar(args)
    if (!texto) return telaAjuda(t, comando, prefix)
    try {
        const r = t.calcular(args, texto)
        return {
            emoji: t.emoji, titulo: t.titulo, prefix,
            intro: r.intro, secoes: r.secoes || [], dica: r.dica || '',
            proximos: r.proximos || []
        }
    } catch (e) {
        if (e instanceof EntradaInvalida) return telaErro(t, comando, prefix, e.message)
        throw e
    }
}

/** Faz a conta crua, sem embrulho de tela (usado pelos testes). */
function calcular(chave, args = []) {
    const t = TOPICOS[chave]
    if (!t) throw new Error(`tópico desconhecido no serviço de exatas: ${chave}`)
    return t.calcular(Array.isArray(args) ? args : String(args).split(/\s+/), juntar(args))
}

// ════════════════════════════════════════════════════════════
//  4. Leitura de equações escritas à mão
// ════════════════════════════════════════════════════════════

/** Deixa a equação num formato único: x², X2, x^2 → x^2; vírgula → ponto. */
function normalizarEq(texto) {
    return String(texto || '').toLowerCase()
        .replace(/\s+/g, '')
        .replace(/²/g, '^2').replace(/³/g, '^3')
        .replace(/[·×*]/g, '')
        .replace(/,/g, '.')
        .replace(/x\^?2/g, 'x^2')
}

/** Coeficiente de um termo: "" → 1, "-" → -1, "3/4" → 0,75. */
function coefTermo(s) {
    if (s === '' || s === '+') return 1
    if (s === '-') return -1
    if (s.includes('/')) {
        const [p, q] = s.split('/')
        const a = Number(p === '' || p === '+' ? 1 : p === '-' ? -1 : p), b = Number(q)
        if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) erro(`não entendi a fração "${s}"`)
        return a / b
    }
    const v = Number(s)
    if (!Number.isFinite(v)) erro(`não entendi o pedaço "${s}" da equação`)
    return v
}

/** Quebra um lado da equação em [a, b, c] de ax² + bx + c. */
function ladoPolinomio(lado) {
    let a = 0, b = 0, c = 0
    const termos = String(lado || '0').match(/[+-]?[^+-]+/g) || []
    for (const termo of termos) {
        if (!termo || termo === '+' || termo === '-') continue
        if (termo.includes('x^2')) a += coefTermo(termo.replace('x^2', ''))
        else if (termo.includes('x')) b += coefTermo(termo.replace('x', ''))
        else c += coefTermo(termo)
    }
    return [a, b, c]
}

/**
 * Lê "2x² - 5x + 3 = 0" (ou só "2 -5 3") e devolve [a, b, c].
 * @param {string} texto
 * @param {number} grau 1 ou 2 — quantos números aceitar na forma solta
 */
function coeficientes(texto, grau = 2) {
    const t = normalizarEq(texto)
    if (!t) erro('mandou a equação vazia')
    if (/x\^[3-9]/.test(t)) erro('eu só resolvo até o segundo grau (x²)')
    if (!t.includes('x')) {
        const vs = extrairNumeros(texto)
        if (grau === 2 && vs.length >= 3) return [vs[0], vs[1], vs[2]]
        if (grau === 1 && vs.length >= 2) return [0, vs[0], vs[1]]
        erro('escreva a equação com o x, ou mande os coeficientes separados por espaço')
    }
    let esq = t, dir = '0'
    if (t.includes('=')) {
        const p = t.split('=')
        if (p.length !== 2) erro('a equação só pode ter um sinal de igual')
        esq = p[0] || '0'; dir = p[1] || '0'
    }
    const E = ladoPolinomio(esq), D = ladoPolinomio(dir)
    return [arred(E[0] - D[0], 10), arred(E[1] - D[1], 10), arred(E[2] - D[2], 10)]
}

/** Lê "2x + 3y = 8" e devolve [a, b, c]. */
function coefsXY(equacao) {
    let t = String(equacao || '').toLowerCase().replace(/\s+/g, '').replace(/[·×*]/g, '').replace(/,/g, '.')
    if (!t.includes('=')) erro('cada equação do sistema precisa ter o sinal de igual')
    const [esq, dir] = t.split('=')
    const lado = (s) => {
        let a = 0, b = 0, c = 0
        for (const termo of (String(s || '0').match(/[+-]?[^+-]+/g) || [])) {
            if (!termo) continue
            if (termo.includes('x')) a += coefTermo(termo.replace('x', ''))
            else if (termo.includes('y')) b += coefTermo(termo.replace('y', ''))
            else c += coefTermo(termo)
        }
        return [a, b, c]
    }
    const E = lado(esq), D = lado(dir)
    return [arred(E[0] - D[0], 10), arred(E[1] - D[1], 10), arred(D[2] - E[2], 10)]
}

/** Escreve a equação de duas incógnitas de volta: [1,-1,1] → "x - y = 1". */
function txtEqXY(a, b, c) {
    const parte = (coef, letra, primeiro) => {
        if (coef === 0) return ''
        const valor = Math.abs(coef) === 1 ? '' : n(Math.abs(coef), 4)
        if (primeiro) return (coef < 0 ? '-' : '') + valor + letra
        return (coef < 0 ? ' - ' : ' + ') + valor + letra
    }
    const esq = parte(a, 'x', true) + parte(b, 'y', !a)
    return `${esq || '0'} = ${n(c, 4)}`
}

/** Escreve o polinômio de volta, bonitinho: [2,-5,3] → "2x² - 5x + 3". */
function txtPolinomio(a, b, c) {
    const parte = (coef, sufixo) => {
        if (coef === 0) return ''
        const sinal = coef > 0 ? ' + ' : ' - '
        const valor = Math.abs(coef) === 1 && sufixo ? '' : n(Math.abs(coef), 4)
        return sinal + valor + sufixo
    }
    let s = parte(a, 'x²') + parte(b, 'x') + parte(c, '')
    s = s.replace(/^ \+ /, '').replace(/^ - /, '-')
    return (s || '0') + ' = 0'
}

// ════════════════════════════════════════════════════════════
//  5. MATEMÁTICA — álgebra e equações
// ════════════════════════════════════════════════════════════

T({
    chave: 'eq1grau', sub: 'Matemática', emoji: '🧮', titulo: 'Equação do 1º grau',
    descricao: 'Isola o x e mostra passo a passo',
    usage: '<equação com x>',
    examples: ['2x + 6 = 0 — a mais direta de todas', '3x - 9 = 12 — com número dos dois lados', '5x = 2x + 12 — x dos dois lados'],
    intro: 'Mande a equação com o x que eu isolo ele na frente de você, um passo de cada vez.',
    dica: 'Pode escrever do jeito do caderno: 3x - 9 = 12.',
    calcular: (args, texto) => {
        const [a2, a, b] = coeficientes(texto, 1)
        if (a2 !== 0) erro('essa equação tem x², então ela é do segundo grau')
        if (a === 0) {
            return resultado(
                b === 0 ? 'Essa igualdade vale para *qualquer* valor de x.' : 'Essa equação *não tem solução*: o x sumiu e sobrou uma igualdade falsa.',
                [`Depois de arrumar tudo do lado esquerdo sobrou: ${n(b, 4)} = 0`, b === 0 ? 'Como 0 = 0 é verdade, qualquer x serve.' : `Como ${n(b, 4)} não é zero, nenhum x resolve.`],
                'Quando o x desaparece, ou a igualdade é sempre verdadeira, ou nunca é.')
        }
        const x = -b / a
        return resultado(
            `O valor de x é *${n(x, 6)}*${Number.isInteger(x) ? '' : ` (ou ${txtFracao(-b * 1000, a * 1000)} em fração)`}.`,
            [
                `1) Arrumando tudo do lado esquerdo: ${n(a, 4)}x ${b >= 0 ? '+ ' + n(b, 4) : '- ' + n(-b, 4)} = 0`,
                `2) Passo o ${n(Math.abs(b), 4)} para o outro lado trocando o sinal: ${n(a, 4)}x = ${n(-b, 4)}`,
                `3) Divido os dois lados por ${n(a, 4)}: x = ${n(-b, 4)} ÷ ${n(a, 4)}`,
                `4) Resultado: x = ${n(x, 6)}`
            ],
            `Confira: ${n(a, 4)} × ${n(x, 6)} ${b >= 0 ? '+' : '-'} ${n(Math.abs(b), 4)} = ${n(a * x + b, 6)}.`)
    }
})

T({
    chave: 'eq2grau', sub: 'Matemática', emoji: '📐', titulo: 'Equação do 2º grau',
    descricao: 'Bhaskara completa, com delta e as raízes',
    usage: '<equação com x²>',
    examples: ['2x² - 5x + 3 = 0 — duas raízes', 'x² + 2x + 5 = 0 — delta negativo', 'x² - 6x + 9 = 0 — raiz dupla'],
    intro: 'Mande a equação do segundo grau que eu calculo o delta e as raízes mostrando cada conta.',
    dica: 'Pode escrever x², x^2 ou x2 — eu entendo os três.',
    calcular: (args, texto) => {
        const [a, b, c] = coeficientes(texto, 2)
        if (a === 0) erro('sem o x² isso é uma equação do primeiro grau')
        const delta = b * b - 4 * a * c
        const linhas = [
            `1) Identifiquei: a = ${n(a, 4)}, b = ${n(b, 4)}, c = ${n(c, 4)}`,
            `2) Delta = b² - 4ac = (${n(b, 4)})² - 4 × ${n(a, 4)} × ${n(c, 4)} = ${n(b * b, 4)} - ${n(4 * a * c, 4)} = ${n(delta, 4)}`
        ]
        if (delta < 0) {
            return resultado(
                'Essa equação *não tem raiz real*: o delta deu negativo.',
                [...linhas, '3) Como delta < 0, não existe raiz quadrada real de número negativo.', '4) A parábola não encosta no eixo x em nenhum ponto.'],
                'Delta negativo não é erro seu: é a parábola inteira acima ou abaixo do eixo x.',
                [ficha('O que dá para saber mesmo assim', [`• Vértice em x = ${n(-b / (2 * a), 4)}`, `• Concavidade para ${a > 0 ? 'cima' : 'baixo'}`, `• Valor ${a > 0 ? 'mínimo' : 'máximo'} = ${n(-delta / (4 * a), 4)}`])])
        }
        const r = Math.sqrt(delta)
        const x1 = (-b + r) / (2 * a), x2 = (-b - r) / (2 * a)
        if (delta === 0) {
            return resultado(
                `A equação tem *uma raiz dupla*: x = *${n(x1, 6)}*.`,
                [...linhas, '3) Delta = 0, então a raiz é única: x = -b ÷ 2a', `4) x = ${n(-b, 4)} ÷ ${n(2 * a, 4)} = ${n(x1, 6)}`],
                'Delta zero quer dizer que a parábola só encosta no eixo x, num ponto só.')
        }
        return resultado(
            `As raízes são *${n(x1, 6)}* e *${n(x2, 6)}*.`,
            [
                ...linhas,
                `3) Raiz de ${n(delta, 4)} = ${n(r, 6)}`,
                `4) x = (${n(-b, 4)} ± ${n(r, 6)}) ÷ ${n(2 * a, 4)}`,
                `5) x₁ = ${n(x1, 6)} e x₂ = ${n(x2, 6)}`
            ],
            `Confere pela soma e produto: ${n(x1 + x2, 6)} = -b/a e ${n(x1 * x2, 6)} = c/a.`,
            [ficha('De quebra', [`• Vértice em x = ${n(-b / (2 * a), 4)}`, `• Valor ${a > 0 ? 'mínimo' : 'máximo'} = ${n(-delta / (4 * a), 4)}`, `• ${txtPolinomio(a, b, c)}`])])
    }
})

T({
    chave: 'delta', sub: 'Matemática', emoji: '🔎', titulo: 'Delta: quantas raízes existem',
    descricao: 'Calcula o discriminante e diz o que ele significa',
    usage: '<equação ou a b c>',
    examples: ['1 -6 9 — coeficientes soltos', 'x² + 2x + 5 = 0 — delta negativo', '2x² - 5x + 3 — delta positivo'],
    intro: 'O delta é o termômetro da equação do segundo grau: ele diz quantas raízes reais existem antes de você calcular qualquer coisa.',
    calcular: (args, texto) => {
        const [a, b, c] = coeficientes(texto, 2)
        if (a === 0) erro('sem o x² não existe delta')
        const d = b * b - 4 * a * c
        const leitura = d > 0 ? 'duas raízes reais diferentes' : d === 0 ? 'uma raiz real (dupla)' : 'nenhuma raiz real'
        return resultado(
            `Delta = *${n(d, 4)}* — ou seja, *${leitura}*.`,
            [`1) a = ${n(a, 4)}, b = ${n(b, 4)}, c = ${n(c, 4)}`, `2) Delta = b² - 4ac = (${n(b, 4)})² - 4 × ${n(a, 4)} × ${n(c, 4)}`, `3) Delta = ${n(b * b, 4)} - ${n(4 * a * c, 4)} = ${n(d, 4)}`, `4) Delta ${d > 0 ? 'maior que' : d === 0 ? 'igual a' : 'menor que'} zero → ${leitura}`],
            'Delta positivo: a parábola corta o eixo x. Zero: encosta. Negativo: passa longe.')
    }
})

T({
    chave: 'girard', sub: 'Matemática', emoji: '🤝', titulo: 'Soma e produto das raízes',
    descricao: 'Relações de Girard sem precisar de Bhaskara',
    usage: '<equação ou a b c>',
    examples: ['1 -5 6 — soma 5 e produto 6', 'x² - 7x + 12 = 0 — dá para adivinhar as raízes', '2x² - 5x + 3'],
    intro: 'Dá para saber a soma e o produto das raízes sem resolver a equação. Em prova isso economiza muito tempo.',
    calcular: (args, texto) => {
        const [a, b, c] = coeficientes(texto, 2)
        if (a === 0) erro('preciso do x² para usar as relações de Girard')
        const soma = -b / a, produto = c / a
        const d = b * b - 4 * a * c
        return resultado(
            `Soma das raízes = *${n(soma, 6)}* e produto = *${n(produto, 6)}*.`,
            [`1) a = ${n(a, 4)}, b = ${n(b, 4)}, c = ${n(c, 4)}`, `2) Soma = -b ÷ a = ${n(-b, 4)} ÷ ${n(a, 4)} = ${n(soma, 6)}`, `3) Produto = c ÷ a = ${n(c, 4)} ÷ ${n(a, 4)} = ${n(produto, 6)}`],
            d >= 0 ? 'Agora pense: quais dois números somam e multiplicam nesses valores? São as raízes.' : 'Atenção: o delta é negativo, então essas contas valem só no mundo dos números complexos.')
    }
})

T({
    chave: 'sistema2x2', sub: 'Matemática', emoji: '🔗', titulo: 'Sistema de duas equações',
    descricao: 'Resolve o sistema de x e y e mostra as contas',
    usage: '<eq 1> ; <eq 2>',
    examples: ['2x + 3y = 8 ; x - y = 1 — clássico do caderno', 'x + y = 10 ; x - y = 4 — soma e diferença', '3x + 2y = 12 ; x + y = 5'],
    intro: 'Mande as duas equações separadas por ponto e vírgula que eu acho o x e o y pelo método dos determinantes.',
    dica: 'Use ponto e vírgula entre as equações: 2x + 3y = 8 ; x - y = 1.',
    calcular: (args, texto) => {
        const partes = String(texto).split(/;|\||\n/).map(s => s.trim()).filter(Boolean)
        if (partes.length < 2) erro('preciso das DUAS equações separadas por ponto e vírgula')
        const [a1, b1, c1] = coefsXY(partes[0])
        const [a2, b2, c2] = coefsXY(partes[1])
        const D = a1 * b2 - a2 * b1
        if (D === 0) {
            const Dx = c1 * b2 - c2 * b1
            return resultado(
                Dx === 0 ? 'Esse sistema tem *infinitas soluções*: as duas equações dizem a mesma coisa.' : 'Esse sistema *não tem solução*: as duas retas são paralelas e nunca se encontram.',
                [`1) Determinante principal: (${n(a1, 4)} × ${n(b2, 4)}) - (${n(a2, 4)} × ${n(b1, 4)}) = 0`, '2) Determinante zero significa retas paralelas ou coincidentes.'],
                'Duas retas no plano ou se cruzam num ponto, ou são paralelas, ou são a mesma reta.')
        }
        const x = (c1 * b2 - c2 * b1) / D
        const y = (a1 * c2 - a2 * c1) / D
        return resultado(
            `A solução é *x = ${n(x, 6)}* e *y = ${n(y, 6)}*.`,
            [
                `1) Organizei: ${txtEqXY(a1, b1, c1)} e ${txtEqXY(a2, b2, c2)}`,
                `2) Determinante principal D = ${n(a1, 4)}×${n(b2, 4)} - ${n(a2, 4)}×${n(b1, 4)} = ${n(D, 4)}`,
                `3) Dx = ${n(c1, 4)}×${n(b2, 4)} - ${n(c2, 4)}×${n(b1, 4)} = ${n(c1 * b2 - c2 * b1, 4)} → x = ${n(x, 6)}`,
                `4) Dy = ${n(a1, 4)}×${n(c2, 4)} - ${n(a2, 4)}×${n(c1, 4)} = ${n(a1 * c2 - a2 * c1, 4)} → y = ${n(y, 6)}`
            ],
            `Confira na primeira equação: ${n(a1, 4)}×${n(x, 4)} + ${n(b1, 4)}×${n(y, 4)} = ${n(a1 * x + b1 * y, 4)}.`)
    }
})

T({
    chave: 'funcao1grau', sub: 'Matemática', emoji: '📈', titulo: 'Função do 1º grau',
    descricao: 'Calcula f(x), a raiz e se a reta sobe ou desce',
    usage: '<a> <b> <x>',
    examples: ['2 -3 5 — f(x) = 2x - 3 no ponto x = 5', '-1 4 2 — reta descendo', '0,5 1 10 — coeficiente com vírgula'],
    intro: 'Me dê o a, o b e o x de f(x) = ax + b que eu calculo o valor, a raiz e o jeitão da reta.',
    calcular: (args) => {
        const [a, b, x] = numeros(args, 3, ['a', 'b', 'x'])
        if (a === 0) erro('com a = 0 a função vira uma reta horizontal, não é do primeiro grau')
        const fx = a * x + b
        const raiz = -b / a
        return resultado(
            `f(${n(x, 4)}) = *${n(fx, 6)}*.`,
            [`1) A função é f(x) = ${n(a, 4)}x ${b >= 0 ? '+ ' + n(b, 4) : '- ' + n(-b, 4)}`, `2) Troco o x por ${n(x, 4)}: ${n(a, 4)} × ${n(x, 4)} ${b >= 0 ? '+' : '-'} ${n(Math.abs(b), 4)}`, `3) f(${n(x, 4)}) = ${n(fx, 6)}`],
            a > 0 ? 'Como o a é positivo, a reta sobe: quanto maior o x, maior o resultado.' : 'Como o a é negativo, a reta desce: quanto maior o x, menor o resultado.',
            [ficha('A reta inteira', [`• Raiz (onde corta o eixo x): x = ${n(raiz, 6)}`, `• Corta o eixo y em ${n(b, 4)}`, `• Inclinação (a): ${n(a, 4)} — ${a > 0 ? 'crescente' : 'decrescente'}`])])
    }
})

T({
    chave: 'funcao2grau', sub: 'Matemática', emoji: '🎢', titulo: 'Função do 2º grau: vértice',
    descricao: 'Acha vértice, máximo ou mínimo e as raízes',
    usage: '<a> <b> <c>',
    examples: ['1 -4 3 — parábola com mínimo', '-2 8 -3 — parábola com máximo', '1 2 5 — sem raiz real'],
    intro: 'Me dê os três coeficientes de f(x) = ax² + bx + c que eu acho o vértice, o valor extremo e as raízes.',
    calcular: (args) => {
        const [a, b, c] = numeros(args, 3, ['a', 'b', 'c'])
        if (a === 0) erro('com a = 0 não existe parábola')
        const xv = -b / (2 * a), d = b * b - 4 * a * c, yv = -d / (4 * a)
        const tipo = a > 0 ? 'mínimo' : 'máximo'
        const linhasRaiz = d < 0 ? ['• Não corta o eixo x (delta negativo)']
            : d === 0 ? [`• Toca o eixo x em x = ${n(xv, 6)}`]
                : [`• Corta o eixo x em ${n((-b + Math.sqrt(d)) / (2 * a), 6)} e ${n((-b - Math.sqrt(d)) / (2 * a), 6)}`]
        return resultado(
            `O vértice fica em (*${n(xv, 6)}*, *${n(yv, 6)}*) e esse é o valor *${tipo}* da função.`,
            [`1) x do vértice = -b ÷ 2a = ${n(-b, 4)} ÷ ${n(2 * a, 4)} = ${n(xv, 6)}`, `2) Delta = ${n(d, 4)}`, `3) y do vértice = -delta ÷ 4a = ${n(-d, 4)} ÷ ${n(4 * a, 4)} = ${n(yv, 6)}`],
            a > 0 ? 'Boca para cima: o vértice é o ponto mais baixo da parábola.' : 'Boca para baixo: o vértice é o ponto mais alto da parábola.',
            [ficha('Retrato da parábola', [`• Concavidade para ${a > 0 ? 'cima' : 'baixo'}`, `• Corta o eixo y em ${n(c, 4)}`, ...linhasRaiz])])
    }
})

// ════════════════════════════════════════════════════════════
//  6. MATEMÁTICA — proporção e porcentagem
// ════════════════════════════════════════════════════════════

T({
    chave: 'regratres', sub: 'Matemática', emoji: '⚖️', titulo: 'Regra de três simples',
    descricao: 'Se A vale B, quanto vale C? Com as contas',
    usage: '<a> <b> <c>',
    examples: ['3 12 7 — 3 pães custam 12, e 7 pães?', '2 350 5 — 2 horas rendem 350, e 5 horas?', '100 7 250 — receita para 100 g em 250 g'],
    intro: 'A regra de três direta: quanto mais de um, mais do outro. Mande os três números na ordem e eu acho o quarto.',
    dica: 'A ordem é: primeira quantidade, o valor dela, e a nova quantidade.',
    calcular: (args) => {
        const [a, b, c] = numeros(args, 3, ['primeira quantidade', 'valor dela', 'nova quantidade'])
        exigirNaoZero(a, 'primeiro número')
        const x = b * c / a
        return resultado(
            `O resultado é *${n(x, 6)}*.`,
            [`1) Montando: ${n(a, 4)} está para ${n(b, 4)} assim como ${n(c, 4)} está para x`, `2) Multiplico em cruz: ${n(a, 4)} × x = ${n(b, 4)} × ${n(c, 4)}`, `3) x = ${n(b * c, 4)} ÷ ${n(a, 4)} = ${n(x, 6)}`],
            `Cada unidade vale ${n(b / a, 6)} — esse é o segredo da regra de três direta.`)
    }
})

T({
    chave: 'regratresinv', sub: 'Matemática', emoji: '🔄', titulo: 'Regra de três inversa',
    descricao: 'Quando aumenta um lado e diminui o outro',
    usage: '<a> <b> <c>',
    examples: ['4 12 6 — 4 pedreiros levam 12 dias, e 6 pedreiros?', '2 90 3 — 2 torneiras enchem em 90 min, e 3?', '60 4 80 — a 60 km/h leva 4 h, e a 80 km/h?'],
    intro: 'Na regra de três inversa, dobrar um lado corta o outro pela metade: mais pedreiros, menos dias.',
    dica: 'Use esta quando mais gente ou mais velocidade significa MENOS tempo.',
    calcular: (args) => {
        const [a, b, c] = numeros(args, 3, ['primeira quantidade', 'valor dela', 'nova quantidade'])
        exigirNaoZero(c, 'terceiro número')
        const x = a * b / c
        return resultado(
            `O resultado é *${n(x, 6)}*.`,
            [`1) As grandezas são inversas: se uma cresce, a outra encolhe`, `2) Então multiplico direto: ${n(a, 4)} × ${n(b, 4)} = ${n(c, 4)} × x`, `3) x = ${n(a * b, 4)} ÷ ${n(c, 4)} = ${n(x, 6)}`],
            `O produto ${n(a * b, 4)} é a quantidade total de trabalho, e ela não muda.`)
    }
})

T({
    chave: 'regratrescomp', sub: 'Matemática', emoji: '🧩', titulo: 'Regra de três composta',
    descricao: 'Três grandezas juntas, tudo proporcional',
    usage: '<pessoas1> <tempo1> <resultado1> <pessoas2> <tempo2>',
    examples: ['5 6 40 8 9 — 5 pessoas em 6 dias fazem 40 peças; e 8 pessoas em 9 dias?', '3 8 120 6 4', '10 5 200 15 5'],
    intro: 'Quando três grandezas entram na conta ao mesmo tempo. Aqui eu trato as duas primeiras como diretamente proporcionais ao resultado.',
    dica: 'Mais gente e mais tempo produzem mais: as duas comparações multiplicam.',
    calcular: (args) => {
        const [p1, t1, r1, p2, t2] = numeros(args, 5, ['pessoas', 'tempo', 'resultado', 'novas pessoas', 'novo tempo'])
        exigirNaoZero(p1, 'número de pessoas inicial')
        exigirNaoZero(t1, 'tempo inicial')
        const x = r1 * (p2 / p1) * (t2 / t1)
        return resultado(
            `O novo resultado é *${n(x, 6)}*.`,
            [
                `1) Comparando as pessoas: ${n(p2, 4)} ÷ ${n(p1, 4)} = ${n(p2 / p1, 6)} vez(es)`,
                `2) Comparando o tempo: ${n(t2, 4)} ÷ ${n(t1, 4)} = ${n(t2 / t1, 6)} vez(es)`,
                `3) Multiplico tudo pelo resultado antigo: ${n(r1, 4)} × ${n(p2 / p1, 6)} × ${n(t2 / t1, 6)}`,
                `4) Resultado = ${n(x, 6)}`
            ],
            `Uma pessoa sozinha, em um período, faz ${n(r1 / (p1 * t1), 6)} — é daí que sai tudo.`)
    }
})

T({
    chave: 'razaoproporcao', sub: 'Matemática', emoji: '➗', titulo: 'Razão e proporção',
    descricao: 'Simplifica a razão ou confere se a proporção vale',
    usage: '<a> <b> [c] [d]',
    examples: ['12 18 — simplifica a razão', '3 4 9 12 — confere se a proporção é verdadeira', '2 5 8 20'],
    intro: 'Com dois números eu simplifico a razão. Com quatro, eu confiro se a proporção é verdadeira pela multiplicação cruzada.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['primeiro número', 'segundo número'])
        if (vs.length >= 4) {
            const [a, b, c, d] = vs
            const e1 = a * d, e2 = b * c
            const vale = Math.abs(e1 - e2) < 1e-9
            return resultado(
                vale ? 'A proporção é *verdadeira*.' : 'A proporção é *falsa*.',
                [`1) Escrevendo: ${n(a, 4)}/${n(b, 4)} = ${n(c, 4)}/${n(d, 4)}?`, `2) Multiplicando em cruz: ${n(a, 4)} × ${n(d, 4)} = ${n(e1, 4)}`, `3) E do outro lado: ${n(b, 4)} × ${n(c, 4)} = ${n(e2, 4)}`, `4) ${vale ? 'Os dois deram igual, então vale.' : 'Deram diferente, então não vale.'}`],
                'Numa proporção verdadeira, o produto dos extremos é igual ao produto dos meios.')
        }
        const [a, b] = vs
        exigirNaoZero(b, 'segundo número')
        const [p, q] = (Number.isInteger(a) && Number.isInteger(b)) ? simplificar(a, b) : [a, b]
        return resultado(
            `A razão entre ${n(a, 4)} e ${n(b, 4)} é *${txtFracao(p, q)}*, ou *${n(a / b, 6)}*.`,
            [`1) Razão = ${n(a, 4)} ÷ ${n(b, 4)}`, `2) Dividindo os dois pelo maior divisor comum: ${txtFracao(p, q)}`, `3) Em decimal: ${n(a / b, 6)}`],
            `Em porcentagem isso é ${n(a / b * 100, 2)}% — a razão e a porcentagem são a mesma ideia.`)
    }
})

T({
    chave: 'escala', sub: 'Matemática', emoji: '🗺️', titulo: 'Escala de mapa',
    descricao: 'Converte centímetros do mapa em distância real',
    usage: '<denominador da escala> <cm no mapa>',
    examples: ['50000 7 — escala 1:50.000, 7 cm no papel', '25000 12,5 — mapa mais detalhado', '1000000 3 — mapa de país'],
    intro: 'Numa escala 1:50.000, cada centímetro do papel vale 50.000 cm no mundo real. Eu faço essa conversão e já entrego em metros e quilômetros.',
    dica: 'Pode mandar a escala com o 1 na frente: 1:50000 7 funciona também.',
    calcular: (args, texto) => {
        let vs = extrairNumeros(texto)
        if (vs.length >= 3 && vs[0] === 1) vs = vs.slice(1)
        if (vs.length < 2) erro('preciso da escala e da medida no mapa em centímetros')
        const [escala, cm] = vs
        exigirPositivo(escala, 'denominador da escala')
        const cmReal = cm * escala
        return resultado(
            `${n(cm, 4)} cm nesse mapa valem *${n(cmReal / 100000, 4)} km* no mundo real.`,
            [`1) Na escala 1:${n(escala, 0)}, 1 cm do papel = ${n(escala, 0)} cm de verdade`, `2) ${n(cm, 4)} cm × ${n(escala, 0)} = ${n(cmReal, 0)} cm`, `3) Em metros: ${n(cmReal / 100, 2)} m`, `4) Em quilômetros: ${n(cmReal / 100000, 4)} km`],
            'Quanto maior o número da escala, menor o mapa e menos detalhe ele mostra.')
    }
})

T({
    chave: 'porcentagemde', sub: 'Matemática', emoji: '💯', titulo: 'Porcentagem de um valor',
    descricao: 'Calcula quanto é X% de um valor',
    usage: '<porcentagem> <valor>',
    examples: ['15 200 — quanto é 15% de 200', '7,5 1250 — com vírgula', '120 80 — porcentagem maior que 100'],
    intro: 'A conta mais pedida do mundo: quanto é X por cento de um valor.',
    calcular: (args) => {
        const [p, v] = numeros(args, 2, ['porcentagem', 'valor'])
        const r = v * p / 100
        return resultado(
            `${n(p, 4)}% de ${n(v, 4)} é *${n(r, 6)}*.`,
            [`1) Por cento quer dizer "dividido por cem": ${n(p, 4)}% = ${n(p / 100, 6)}`, `2) Multiplico pelo valor: ${n(p / 100, 6)} × ${n(v, 4)}`, `3) Resultado = ${n(r, 6)}`],
            `Atalho de cabeça: 10% de ${n(v, 4)} é ${n(v / 10, 4)}, e 1% é ${n(v / 100, 4)}.`)
    }
})

T({
    chave: 'percentualquanto', sub: 'Matemática', emoji: '📊', titulo: 'Quanto por cento A é de B',
    descricao: 'Descobre a porcentagem que um valor representa',
    usage: '<parte> <total>',
    examples: ['30 200 — 30 é quantos por cento de 200', '7 9 — acertos numa prova de 9', '1250 5000'],
    intro: 'Você tem a parte e o total e quer saber a porcentagem. É isto aqui.',
    calcular: (args) => {
        const [parte, total] = numeros(args, 2, ['parte', 'total'])
        exigirNaoZero(total, 'total')
        const p = parte / total * 100
        return resultado(
            `${n(parte, 4)} é *${n(p, 4)}%* de ${n(total, 4)}.`,
            [`1) Divido a parte pelo total: ${n(parte, 4)} ÷ ${n(total, 4)} = ${n(parte / total, 6)}`, `2) Multiplico por 100 para virar porcentagem: ${n(p, 4)}%`],
            p > 100 ? 'Passou de 100%: a parte é maior que o total que você informou.' : `Falta ${n(100 - p, 4)}% para completar o total.`)
    }
})

T({
    chave: 'aumentar', sub: 'Matemática', emoji: '📈', titulo: 'Aumentar um valor em X%',
    descricao: 'Aplica um aumento e mostra o valor novo',
    usage: '<valor> <porcentagem de aumento>',
    examples: ['200 15 — aumenta 200 em 15%', '1412 4,62 — reajuste do salário mínimo', '89,90 10'],
    intro: 'Reajuste de salário, aumento de preço, correção de aluguel: mande o valor e a porcentagem.',
    calcular: (args) => {
        const [v, p] = numeros(args, 2, ['valor', 'porcentagem'])
        const acrescimo = v * p / 100, novo = v + acrescimo
        return resultado(
            `Com ${n(p, 4)}% de aumento, ${n(v, 2)} vira *${n(novo, 2)}*.`,
            [`1) O aumento é ${n(p, 4)}% de ${n(v, 2)} = ${n(acrescimo, 2)}`, `2) Somo ao valor original: ${n(v, 2)} + ${n(acrescimo, 2)} = ${n(novo, 2)}`, `3) Atalho: ${n(v, 2)} × ${n(1 + p / 100, 6)} = ${n(novo, 2)}`],
            `Se isso fosse dinheiro: ${rs(v)} passaria a ${rs(novo)}, com ${rs(acrescimo)} a mais.`)
    }
})

T({
    chave: 'descontar', sub: 'Matemática', emoji: '🏷️', titulo: 'Desconto em um preço',
    descricao: 'Tira X% do preço e mostra quanto você economiza',
    usage: '<preço> <porcentagem de desconto>',
    examples: ['200 15 — 15% de desconto em 200', '1299,90 30 — liquidação', '49,90 5'],
    intro: 'Aquela plaquinha de 30% off: eu digo quanto fica e quanto você economiza de verdade.',
    calcular: (args) => {
        const [v, p] = numeros(args, 2, ['preço', 'porcentagem'])
        exigirFaixa(p, -1000, 100, 'desconto')
        const desconto = v * p / 100, novo = v - desconto
        return resultado(
            `Com ${n(p, 4)}% de desconto, ${rs(v)} sai por *${rs(novo)}*.`,
            [`1) O desconto é ${n(p, 4)}% de ${n(v, 2)} = ${n(desconto, 2)}`, `2) Tiro do preço: ${n(v, 2)} - ${n(desconto, 2)} = ${n(novo, 2)}`, `3) Atalho: ${n(v, 2)} × ${n(1 - p / 100, 6)} = ${n(novo, 2)}`],
            `Você economiza ${rs(desconto)}. Vale conferir se a loja não subiu o preço antes da promoção.`)
    }
})

T({
    chave: 'variacaopercent', sub: 'Matemática', emoji: '📉', titulo: 'Variação percentual',
    descricao: 'De um valor para outro: subiu ou caiu quantos %',
    usage: '<valor antigo> <valor novo>',
    examples: ['200 230 — subiu quantos por cento', '5,89 4,99 — queda de preço', '1320 1412 — reajuste do mínimo'],
    intro: 'Preço antigo e preço novo: eu digo se subiu ou caiu e em quantos por cento.',
    calcular: (args) => {
        const [antigo, novo] = numeros(args, 2, ['valor antigo', 'valor novo'])
        exigirNaoZero(antigo, 'valor antigo')
        const dif = novo - antigo, p = dif / Math.abs(antigo) * 100
        return resultado(
            `${dif >= 0 ? 'Subiu' : 'Caiu'} *${n(Math.abs(p), 4)}%*.`,
            [`1) Diferença: ${n(novo, 4)} - ${n(antigo, 4)} = ${n(dif, 4)}`, `2) Divido pelo valor antigo: ${n(dif, 4)} ÷ ${n(antigo, 4)} = ${n(dif / antigo, 6)}`, `3) Em porcentagem: ${n(p, 4)}%`],
            'Cuidado com a pegadinha: cair 50% e depois subir 50% não volta ao preço de antes.')
    }
})

// ════════════════════════════════════════════════════════════
//  7. MATEMÁTICA — matemática financeira
// ════════════════════════════════════════════════════════════

T({
    chave: 'jurossimples', sub: 'Matemática', emoji: '💰', titulo: 'Juros simples',
    descricao: 'Juros sempre sobre o valor inicial, com passos',
    usage: '<capital> <taxa % por período> <períodos>',
    examples: ['1000 2 12 — 1.000 a 2% ao mês por 12 meses', '500 1,5 6', '2500 0,8 24'],
    intro: 'No juro simples o bolo não cresce: todo mês rende sobre o valor que você colocou no começo.',
    calcular: (args) => {
        const [c, i, t] = numeros(args, 3, ['capital', 'taxa', 'tempo'])
        const juros = c * (i / 100) * t, montante = c + juros
        return resultado(
            `Você termina com *${rs(montante)}*, sendo ${rs(juros)} de juros.`,
            [`1) Juros = capital × taxa × tempo`, `2) ${n(c, 2)} × ${n(i / 100, 6)} × ${n(t, 2)} = ${n(juros, 2)}`, `3) Montante = ${n(c, 2)} + ${n(juros, 2)} = ${n(montante, 2)}`],
            `Cada período rende sempre os mesmos ${rs(c * i / 100)} — por isso o nome "simples".`)
    }
})

T({
    chave: 'juroscompostos', sub: 'Matemática', emoji: '🪙', titulo: 'Juros compostos',
    descricao: 'Juro sobre juro, com o crescimento período a período',
    usage: '<capital> <taxa % por período> <períodos>',
    examples: ['1000 2 12 — 1.000 a 2% ao mês por 1 ano', '500 1 60 — poupança longa', '10000 0,9 36'],
    intro: 'Aqui o juro rende juro. É a conta do cartão de crédito e também a do seu investimento.',
    calcular: (args) => {
        const [c, i, t] = numeros(args, 3, ['capital', 'taxa', 'tempo'])
        if (t > 1200) erro('o número de períodos é grande demais (máximo 1.200)')
        const fator = Math.pow(1 + i / 100, t)
        const montante = c * fator, juros = montante - c
        const simples = c * (i / 100) * t
        return resultado(
            `Você termina com *${rs(montante)}*, sendo ${rs(juros)} de juros.`,
            [`1) Montante = capital × (1 + taxa)^tempo`, `2) (1 + ${n(i / 100, 6)})^${n(t, 0)} = ${n(fator, 6)}`, `3) ${n(c, 2)} × ${n(fator, 6)} = ${n(montante, 2)}`],
            `No juro simples daria ${rs(c + simples)} — a diferença de ${rs(montante - c - simples)} é o juro rendendo sobre juro.`)
    }
})

T({
    chave: 'tempodobrar', sub: 'Matemática', emoji: '⏳', titulo: 'Tempo para o dinheiro dobrar',
    descricao: 'Quantos períodos até o valor dobrar nos juros',
    usage: '<taxa % por período>',
    examples: ['1 — 1% ao mês', '0,5 — poupança', '12 — 12% ao ano'],
    intro: 'Com uma taxa fixa, quanto tempo leva para o dinheiro virar o dobro? Dá para responder com logaritmo.',
    calcular: (args) => {
        const [i] = numeros(args, 1, ['taxa'])
        exigirPositivo(i, 'taxa')
        const t = Math.log(2) / Math.log(1 + i / 100)
        const regra72 = 72 / i
        return resultado(
            `Leva cerca de *${n(t, 2)} períodos* para dobrar.`,
            [`1) Quero (1 + ${n(i / 100, 6)})^t = 2`, `2) Aplico logaritmo dos dois lados: t = ln(2) ÷ ln(1 + taxa)`, `3) t = ${n(Math.log(2), 6)} ÷ ${n(Math.log(1 + i / 100), 6)} = ${n(t, 4)}`],
            `A regra prática dos 72 daria ${n(regra72, 1)} períodos — perto do valor exato e fácil de fazer de cabeça.`)
    }
})

T({
    chave: 'taxaequivalente', sub: 'Matemática', emoji: '🔁', titulo: 'Taxa mensal e taxa anual',
    descricao: 'Converte taxa de juros entre mês e ano',
    usage: '<taxa %> [ano]',
    examples: ['1 — 1% ao mês vira quanto ao ano', '12 ano — 12% ao ano vira quanto ao mês', '0,5'],
    intro: 'Cuidado: 1% ao mês não é 12% ao ano. A conversão certa usa potência, não multiplicação.',
    dica: 'Escreva "ano" no fim para converter de anual para mensal.',
    calcular: (args, texto) => {
        const [i] = numeros(args, 1, ['taxa'])
        const deAno = /ano|anual|a\.a/i.test(texto)
        if (deAno) {
            const mensal = (Math.pow(1 + i / 100, 1 / 12) - 1) * 100
            return resultado(
                `${n(i, 4)}% ao ano equivale a *${n(mensal, 4)}% ao mês*.`,
                [`1) Taxa mensal = (1 + taxa anual)^(1/12) - 1`, `2) (1 + ${n(i / 100, 6)})^(1/12) = ${n(Math.pow(1 + i / 100, 1 / 12), 8)}`, `3) Tirando o 1 e passando para porcentagem: ${n(mensal, 4)}%`],
                `Dividir por 12 daria ${n(i / 12, 4)}% — errado, porque ignora o juro sobre juro.`)
        }
        const anual = (Math.pow(1 + i / 100, 12) - 1) * 100
        return resultado(
            `${n(i, 4)}% ao mês equivale a *${n(anual, 4)}% ao ano*.`,
            [`1) Taxa anual = (1 + taxa mensal)^12 - 1`, `2) (1 + ${n(i / 100, 6)})^12 = ${n(Math.pow(1 + i / 100, 12), 8)}`, `3) Tirando o 1 e passando para porcentagem: ${n(anual, 4)}%`],
            `Multiplicar por 12 daria ${n(i * 12, 4)}% — menos que o certo, porque some o juro sobre juro.`)
    }
})

T({
    chave: 'parcela', sub: 'Matemática', emoji: '🧾', titulo: 'Valor da parcela (tabela Price)',
    descricao: 'Parcela fixa de um financiamento e o total pago',
    usage: '<valor financiado> <taxa % ao mês> <nº de parcelas>',
    examples: ['12000 1,99 48 — carro em 48 meses', '3000 3,5 10 — parcelamento de loja', '250000 0,85 360 — financiamento longo'],
    intro: 'Financiou e quer saber a parcela? Uso a tabela Price, a mesma dos bancos, e mostro quanto de juros você paga no total.',
    calcular: (args) => {
        const [pv, i, nn] = numeros(args, 3, ['valor financiado', 'taxa', 'parcelas'])
        exigirPositivo(nn, 'número de parcelas')
        if (nn > 600) erro('no máximo 600 parcelas')
        const taxa = i / 100
        const pmt = taxa === 0 ? pv / nn : pv * taxa / (1 - Math.pow(1 + taxa, -nn))
        const total = pmt * nn, juros = total - pv
        return resultado(
            `A parcela fica em *${rs(pmt)}* por mês.`,
            [`1) Fórmula da Price: parcela = valor × i ÷ (1 - (1+i)^-n)`, `2) ${n(pv, 2)} × ${n(taxa, 6)} = ${n(pv * taxa, 2)}`, `3) 1 - (1 + ${n(taxa, 6)})^-${n(nn, 0)} = ${n(1 - Math.pow(1 + taxa, -nn), 6)}`, `4) Parcela = ${n(pmt, 2)}`],
            `No fim você paga ${rs(total)}, ou seja ${rs(juros)} só de juros — ${n(juros / pv * 100, 1)}% a mais que o preço à vista.`)
    }
})

T({
    chave: 'aportemensal', sub: 'Matemática', emoji: '🏦', titulo: 'Quanto rende guardando por mês',
    descricao: 'Soma de depósitos mensais com juros compostos',
    usage: '<depósito mensal> <taxa % ao mês> <meses>',
    examples: ['300 0,8 60 — 300 por mês durante 5 anos', '100 1 120', '1000 0,5 24'],
    intro: 'Guardando um valor todo mês, com juros, quanto tem no fim? Esta é a conta da série de depósitos.',
    calcular: (args) => {
        const [p, i, t] = numeros(args, 3, ['depósito mensal', 'taxa', 'meses'])
        if (t > 1200) erro('no máximo 1.200 meses')
        const taxa = i / 100
        const fv = taxa === 0 ? p * t : p * (Math.pow(1 + taxa, t) - 1) / taxa
        const depositado = p * t
        return resultado(
            `No fim você teria *${rs(fv)}*.`,
            [`1) Fórmula: montante = depósito × ((1+i)^n - 1) ÷ i`, `2) (1 + ${n(taxa, 6)})^${n(t, 0)} = ${n(Math.pow(1 + taxa, t), 6)}`, `3) Montante = ${n(fv, 2)}`],
            `Você depositou ${rs(depositado)} e os juros renderam ${rs(fv - depositado)}.`)
    }
})

// ════════════════════════════════════════════════════════════
//  8. MATEMÁTICA — números, divisores e primos
// ════════════════════════════════════════════════════════════

/** Escreve a fatoração como texto: [[2,3],[3,2]] → "2³ × 3²". */
function txtFatoracao(fatores) {
    const exp = { 0: '⁰', 1: '', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
    return fatores.map(([p, e]) => p + (e < 10 ? exp[e] : '^' + e)).join(' × ')
}

/** Só os inteiros positivos da entrada, para as contas de teoria dos números. */
function inteirosPositivos(args, minimo, rotulo) {
    const vs = extrairNumeros(juntar(args)).map(v => Math.round(v)).filter(v => v > 0)
    if (vs.length < minimo) erro(`preciso de pelo menos ${minimo} número inteiro positivo (${rotulo})`)
    return vs
}

T({
    chave: 'mmc', sub: 'Matemática', emoji: '🔢', titulo: 'MMC — mínimo múltiplo comum',
    descricao: 'MMC de dois ou mais números, com a fatoração',
    usage: '<número> <número> [mais números]',
    examples: ['12 18 — o clássico da sala', '4 6 10 — três números', '15 25'],
    intro: 'O MMC é o menor número que todos eles dividem. Serve para somar frações e para saber quando dois ônibus passam juntos de novo.',
    calcular: (args) => {
        const vs = inteirosPositivos(args, 2, 'os números').slice(0, 8)
        if (vs.some(v => v > 1e9)) erro('use números até 1 bilhão')
        const r = vs.reduce((acc, v) => mmc(acc, v))
        return resultado(
            `O MMC de ${vs.join(', ')} é *${n(r, 0)}*.`,
            [
                ...vs.map(v => `• ${v} = ${txtFatoracao(fatoresPrimos(v)) || v}`),
                `Pego cada fator primo com o MAIOR expoente e multiplico: ${txtFatoracao(fatoresPrimos(r))} = ${n(r, 0)}`
            ],
            `Se dois eventos se repetem a cada ${vs[0]} e ${vs[1]} unidades de tempo, eles coincidem a cada ${n(r, 0)}.`)
    }
})

T({
    chave: 'mdc', sub: 'Matemática', emoji: '🧷', titulo: 'MDC — máximo divisor comum',
    descricao: 'MDC de dois ou mais números, com a fatoração',
    usage: '<número> <número> [mais números]',
    examples: ['12 18 — o clássico da sala', '48 60 36 — três números', '35 64 — números primos entre si'],
    intro: 'O MDC é o maior número que divide todos eles. Serve para simplificar fração e para repartir coisas em grupos iguais.',
    calcular: (args) => {
        const vs = inteirosPositivos(args, 2, 'os números').slice(0, 8)
        const r = vs.reduce((acc, v) => mdc(acc, v))
        const linhas = vs.map(v => `• ${v} = ${txtFatoracao(fatoresPrimos(v)) || v}`)
        return resultado(
            `O MDC de ${vs.join(', ')} é *${n(r, 0)}*.`,
            [...linhas, r === 1 ? 'Não há fator primo em comum, então o MDC é 1.' : `Pego os fatores comuns com o MENOR expoente: ${txtFatoracao(fatoresPrimos(r))} = ${n(r, 0)}`],
            r === 1 ? 'MDC igual a 1 quer dizer que esses números são primos entre si.' : `Dá para fazer ${n(r, 0)} grupos iguais usando tudo, sem sobrar nada.`)
    }
})

T({
    chave: 'divisores', sub: 'Matemática', emoji: '🗂️', titulo: 'Divisores de um número',
    descricao: 'Lista todos os divisores e conta quantos são',
    usage: '<número>',
    examples: ['36 — tem nove divisores', '100', '97 — um primo só tem dois'],
    intro: 'Todos os números que dividem o seu número sem deixar resto, em ordem.',
    calcular: (args) => {
        const [x] = inteirosPositivos(args, 1, 'o número')
        if (x > 1e7) erro('use um número de até 10 milhões')
        const divs = []
        for (let d = 1; d * d <= x; d++) {
            if (x % d === 0) { divs.push(d); if (d !== x / d) divs.push(x / d) }
        }
        divs.sort((a, b) => a - b)
        const fat = fatoresPrimos(x)
        const qtdPelaFatoracao = fat.reduce((acc, [, e]) => acc * (e + 1), 1)
        return resultado(
            `${x} tem *${divs.length} divisores*.`,
            [`1) Fatorando: ${x} = ${txtFatoracao(fat) || x}`, `2) Somo 1 a cada expoente e multiplico: ${fat.map(([, e]) => e + 1).join(' × ') || 1} = ${qtdPelaFatoracao}`, `3) Divisores: ${divs.join(', ')}`],
            divs.length === 2 ? 'Só dois divisores: esse número é primo.' : `A soma de todos eles é ${n(divs.reduce((a, b) => a + b, 0), 0)}.`)
    }
})

T({
    chave: 'fatorar', sub: 'Matemática', emoji: '🧱', titulo: 'Fatoração em números primos',
    descricao: 'Decompõe o número em fatores primos',
    usage: '<número>',
    examples: ['360 — decomposição famosa', '1024 — só potência de 2', '2024'],
    intro: 'Todo número inteiro maior que 1 é feito de primos multiplicados. Eu mostro a divisão sucessiva, igual à chave do caderno.',
    calcular: (args) => {
        const [x] = inteirosPositivos(args, 1, 'o número')
        if (x < 2) erro('a fatoração vale para números a partir do 2')
        if (x > 1e12) erro('use um número de até 1 trilhão')
        const fat = fatoresPrimos(x)
        const divisao = []
        let v = x
        for (const [p, e] of fat) for (let i = 0; i < e; i++) { divisao.push(`${n(v, 0)} ÷ ${p} = ${n(v / p, 0)}`); v /= p }
        return resultado(
            `${n(x, 0)} = *${txtFatoracao(fat)}*`,
            [...divisao.slice(0, 12).map((l, i) => `${i + 1}) ${l}`), divisao.length > 12 ? `… e mais ${divisao.length - 12} divisões` : ''],
            fat.length === 1 && fat[0][1] === 1 ? 'Esse número é primo: ele não se quebra em nada menor.' : `São ${fat.length} primo(s) diferente(s) nessa receita.`)
    }
})

T({
    chave: 'ehprimo', sub: 'Matemática', emoji: '🔍', titulo: 'É primo ou não?',
    descricao: 'Testa se o número é primo e mostra a prova',
    usage: '<número>',
    examples: ['97 — é primo', '91 — parece primo mas não é', '2024'],
    intro: 'Número primo só tem dois divisores: 1 e ele mesmo. Eu testo e mostro o divisor que denuncia quando não é.',
    calcular: (args) => {
        const [x] = inteirosPositivos(args, 1, 'o número')
        if (x > 1e14) erro('use um número de até 100 trilhões')
        if (x < 2) return resultado(`${x} *não é primo*.`, [`O 0 e o 1 não são primos por definição: primo precisa ter exatamente dois divisores.`], 'O menor número primo é o 2 — e é o único primo par.')
        let divisor = null
        for (let d = 2; d * d <= x; d++) if (x % d === 0) { divisor = d; break }
        const limite = Math.floor(Math.sqrt(x))
        if (!divisor) {
            return resultado(
                `${n(x, 0)} *é primo*.`,
                [`1) Basta testar divisores até a raiz quadrada de ${n(x, 0)}, que é ${n(limite, 0)}`, `2) Testei todos de 2 até ${n(limite, 0)} e nenhum divide`, '3) Logo, só o 1 e ele mesmo dividem esse número'],
                'Testar só até a raiz quadrada funciona porque, se houvesse um divisor maior, o par dele seria menor.')
        }
        return resultado(
            `${n(x, 0)} *não é primo*.`,
            [`1) Testando divisores a partir do 2…`, `2) Achei: ${n(x, 0)} ÷ ${divisor} = ${n(x / divisor, 0)}, sem resto`, `3) Como tem divisor além de 1 e dele mesmo, é composto`],
            `Fatorando por inteiro: ${txtFatoracao(fatoresPrimos(x))}.`)
    }
})

T({
    chave: 'primosate', sub: 'Matemática', emoji: '📜', titulo: 'Primos até um número',
    descricao: 'Lista os números primos de 2 até o limite',
    usage: '<limite>',
    examples: ['50 — os quinze primeiros', '100', '30'],
    intro: 'A peneira de Eratóstenes: risco os múltiplos e sobram só os primos.',
    calcular: (args) => {
        const [lim] = inteirosPositivos(args, 1, 'o limite')
        if (lim > 5000) erro('o limite máximo aqui é 5.000, senão a lista não cabe na tela')
        const crivo = new Array(lim + 1).fill(true)
        crivo[0] = crivo[1] = false
        for (let p = 2; p * p <= lim; p++) if (crivo[p]) for (let m = p * p; m <= lim; m += p) crivo[m] = false
        const primos = []
        for (let i = 2; i <= lim; i++) if (crivo[i]) primos.push(i)
        const mostrar = primos.slice(0, 120)
        return resultado(
            `Existem *${primos.length} primos* de 2 até ${lim}.`,
            [`1) Escrevi todos os números de 2 a ${lim}`, `2) Risquei os múltiplos de 2, 3, 5, 7… (a peneira de Eratóstenes)`, `3) Sobraram: ${mostrar.join(', ')}${primos.length > mostrar.length ? ` … e mais ${primos.length - mostrar.length}` : ''}`],
            primos.length ? `O maior primo até ${lim} é ${primos[primos.length - 1]}.` : 'Nenhum primo nesse intervalo.')
    }
})

T({
    chave: 'divisibilidade', sub: 'Matemática', emoji: '✂️', titulo: 'Regras de divisibilidade',
    descricao: 'Diz por quais números ele é divisível e por quê',
    usage: '<número>',
    examples: ['2520 — divisível por quase tudo', '1234', '990'],
    intro: 'Sem fazer a divisão: as regrinhas de 2, 3, 4, 5, 6, 8, 9, 10 e 11 aplicadas ao seu número.',
    calcular: (args) => {
        const [x] = inteirosPositivos(args, 1, 'o número')
        if (x > 1e15) erro('use um número menor')
        const s = String(x)
        const somaDigitos = s.split('').reduce((a, d) => a + Number(d), 0)
        const alternada = s.split('').reverse().reduce((a, d, i) => a + (i % 2 ? -1 : 1) * Number(d), 0)
        const regras = [
            ['2', x % 2 === 0, `termina em ${s.slice(-1)}, que é ${x % 2 === 0 ? 'par' : 'ímpar'}`],
            ['3', somaDigitos % 3 === 0, `a soma dos algarismos é ${somaDigitos}`],
            ['4', Number(s.slice(-2)) % 4 === 0, `os dois últimos algarismos formam ${s.slice(-2)}`],
            ['5', x % 5 === 0, `termina em ${s.slice(-1)}`],
            ['6', x % 2 === 0 && somaDigitos % 3 === 0, 'precisa ser divisível por 2 e por 3 ao mesmo tempo'],
            ['8', Number(s.slice(-3)) % 8 === 0, `os três últimos algarismos formam ${s.slice(-3)}`],
            ['9', somaDigitos % 9 === 0, `a soma dos algarismos é ${somaDigitos}`],
            ['10', x % 10 === 0, `termina em ${s.slice(-1)}`],
            ['11', alternada % 11 === 0, `a soma alternada dos algarismos dá ${alternada}`]
        ]
        const sim = regras.filter(r => r[1]).map(r => r[0])
        return resultado(
            sim.length ? `${n(x, 0)} é divisível por *${sim.join(', ')}*.` : `${n(x, 0)} não é divisível por nenhum dos números testados (2 a 11).`,
            regras.map(([d, ok, motivo]) => `• Por ${d}: ${ok ? 'sim' : 'não'} — ${motivo}`),
            'Essas regras são atalhos: economizam a divisão na hora da prova.')
    }
})

T({
    chave: 'tabuada', sub: 'Matemática', emoji: '✖️', titulo: 'Tabuada',
    descricao: 'Tabuada de um número, até onde você quiser',
    usage: '<número> [até quanto]',
    examples: ['7 — tabuada do 7 até o 10', '12 20 — do 12 até o 20', '9'],
    intro: 'A tabuada de qualquer número, inclusive dos que não estão no caderno.',
    calcular: (args) => {
        const vs = extrairNumeros(juntar(args))
        if (!vs.length) erro('me diga de qual número você quer a tabuada')
        const x = vs[0]
        const ate = Math.min(Math.max(Math.round(vs[1] || 10), 1), 50)
        const linhas = []
        for (let i = 1; i <= ate; i++) linhas.push(`${n(x, 4)} × ${i} = ${n(x * i, 4)}`)
        return {
            intro: `Aqui está a tabuada do *${n(x, 4)}* até ${ate}.`,
            secoes: [ficha(`Tabuada do ${n(x, 4)}`, linhas, '✖️')],
            dica: Number.isInteger(x) && x > 0 ? `Repare: cada linha soma ${n(x, 0)} em relação à anterior. A tabuada é soma repetida.` : 'Funciona com decimal também, é só multiplicação.'
        }
    }
})

// ════════════════════════════════════════════════════════════
//  9. MATEMÁTICA — estatística
// ════════════════════════════════════════════════════════════

T({
    chave: 'media', sub: 'Matemática', emoji: '📊', titulo: 'Média aritmética',
    descricao: 'Soma tudo e divide pela quantidade',
    usage: '<número> <número> [mais números]',
    examples: ['7 8 6 9 — quatro notas', '10 5 — média de duas', '2,5 3,5 4'],
    intro: 'A média junta tudo e reparte igualmente. Mande os números separados por espaço.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['pelo menos dois números'])
        const soma = vs.reduce((a, b) => a + b, 0)
        const m = soma / vs.length
        return resultado(
            `A média é *${n(m, 4)}*.`,
            [`1) Somo tudo: ${vs.map(v => n(v, 4)).join(' + ')} = ${n(soma, 4)}`, `2) Divido pela quantidade de números (${vs.length}): ${n(soma, 4)} ÷ ${vs.length}`, `3) Média = ${n(m, 4)}`],
            `O maior valor foi ${n(Math.max(...vs), 4)} e o menor ${n(Math.min(...vs), 4)}.`)
    }
})

T({
    chave: 'mediaponderada', sub: 'Matemática', emoji: '⚖️', titulo: 'Média ponderada',
    descricao: 'Média com pesos: nota e peso alternados',
    usage: '<nota> <peso> <nota> <peso> ...',
    examples: ['8 2 6 3 — nota 8 peso 2 e nota 6 peso 3', '7 1 9 4 5 2', '10 3 4 1'],
    intro: 'Quando cada nota vale diferente. Mande nota e peso alternados, nessa ordem.',
    dica: 'A ordem importa: primeiro a nota, depois o peso dela.',
    calcular: (args) => {
        const vs = numeros(args, 4, ['nota e peso, aos pares'])
        if (vs.length % 2 !== 0) erro('sobrou um número: cada nota precisa do peso dela')
        let somaNP = 0, somaP = 0
        const linhas = []
        for (let i = 0; i < vs.length; i += 2) {
            somaNP += vs[i] * vs[i + 1]; somaP += vs[i + 1]
            linhas.push(`• Nota ${n(vs[i], 4)} × peso ${n(vs[i + 1], 4)} = ${n(vs[i] * vs[i + 1], 4)}`)
        }
        exigirNaoZero(somaP, 'soma dos pesos')
        const m = somaNP / somaP
        return resultado(
            `A média ponderada é *${n(m, 4)}*.`,
            [...linhas, `Somo os produtos: ${n(somaNP, 4)}`, `Somo os pesos: ${n(somaP, 4)}`, `Divido um pelo outro: ${n(m, 4)}`],
            `A média simples dessas notas seria ${n(vs.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0) / (vs.length / 2), 4)} — o peso muda o resultado.`)
    }
})

T({
    chave: 'mediana', sub: 'Matemática', emoji: '🎯', titulo: 'Mediana',
    descricao: 'O valor do meio depois de colocar em ordem',
    usage: '<número> <número> [mais números]',
    examples: ['7 2 9 4 5 — cinco valores', '10 20 30 40 — quantidade par', '3 1 4 1 5 9 2'],
    intro: 'A mediana é o valor que fica exatamente no meio da fila. Diferente da média, ela não se assusta com um valor muito fora da curva.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['pelo menos dois números'])
        const ord = [...vs].sort((a, b) => a - b)
        const meio = Math.floor(ord.length / 2)
        const par = ord.length % 2 === 0
        const md = par ? (ord[meio - 1] + ord[meio]) / 2 : ord[meio]
        return resultado(
            `A mediana é *${n(md, 4)}*.`,
            [
                `1) Coloco em ordem: ${ord.map(v => n(v, 4)).join(', ')}`,
                `2) São ${ord.length} valores, quantidade ${par ? 'par' : 'ímpar'}`,
                par ? `3) Tiro a média dos dois do meio: (${n(ord[meio - 1], 4)} + ${n(ord[meio], 4)}) ÷ 2 = ${n(md, 4)}` : `3) O valor do meio é o ${meio + 1}º: ${n(md, 4)}`
            ],
            `A média desses mesmos números é ${n(vs.reduce((a, b) => a + b, 0) / vs.length, 4)}. Quando elas ficam bem diferentes, há valores extremos puxando a média.`)
    }
})

T({
    chave: 'moda', sub: 'Matemática', emoji: '👑', titulo: 'Moda',
    descricao: 'O valor que mais se repete na lista',
    usage: '<número> <número> [mais números]',
    examples: ['3 7 3 9 3 — o 3 domina', '1 1 2 2 5 — duas modas', '4 5 6 — nenhuma repetição'],
    intro: 'Moda é o valor mais repetido. Uma lista pode ter uma moda, várias ou nenhuma.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['pelo menos dois números'])
        const cont = new Map()
        for (const v of vs) cont.set(v, (cont.get(v) || 0) + 1)
        const maior = Math.max(...cont.values())
        const modas = [...cont.entries()].filter(([, c]) => c === maior).map(([v]) => v).sort((a, b) => a - b)
        const semModa = maior === 1
        const linhas = [...cont.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([v, c]) => `• ${n(v, 4)} aparece ${c} vez(es)`)
        return resultado(
            semModa ? 'Essa lista *não tem moda*: nenhum valor se repete.'
                : modas.length === 1 ? `A moda é *${n(modas[0], 4)}*, que aparece ${maior} vezes.`
                    : `Há *${modas.length} modas*: ${modas.map(v => n(v, 4)).join(', ')} — todas aparecem ${maior} vezes.`,
            linhas,
            semModa ? 'Lista sem repetição é chamada de amodal.' : modas.length > 1 ? 'Duas modas: chamamos de bimodal. Mais que duas, multimodal.' : 'A moda é a única medida que também funciona com palavras, não só com números.')
    }
})

T({
    chave: 'desviopadrao', sub: 'Matemática', emoji: '📏', titulo: 'Desvio padrão e variância',
    descricao: 'Mede o quanto os valores se espalham da média',
    usage: '<número> <número> [mais números]',
    examples: ['2 4 4 4 5 5 7 9 — exemplo clássico', '10 12 23 23 16 23 21 16', '5 5 5 5 — sem variação'],
    intro: 'O desvio padrão diz se os valores andam grudados na média ou espalhados longe dela.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['pelo menos dois números'])
        const m = vs.reduce((a, b) => a + b, 0) / vs.length
        const quadrados = vs.map(v => Math.pow(v - m, 2))
        const somaQ = quadrados.reduce((a, b) => a + b, 0)
        const varPop = somaQ / vs.length
        const varAm = somaQ / (vs.length - 1)
        return resultado(
            `O desvio padrão é *${n(Math.sqrt(varPop), 4)}* (population) e a média é ${n(m, 4)}.`.replace(' (population)', ' considerando todos os dados'),
            [
                `1) Média = ${n(m, 4)}`,
                `2) Distância de cada valor até a média, ao quadrado: ${quadrados.slice(0, 8).map(q => n(q, 3)).join(', ')}${quadrados.length > 8 ? '…' : ''}`,
                `3) Somo tudo: ${n(somaQ, 4)}`,
                `4) Variância = ${n(somaQ, 4)} ÷ ${vs.length} = ${n(varPop, 4)}`,
                `5) Desvio padrão = raiz de ${n(varPop, 4)} = ${n(Math.sqrt(varPop), 4)}`
            ],
            `Se esses valores forem só uma amostra de um grupo maior, divide-se por ${vs.length - 1}: variância ${n(varAm, 4)} e desvio ${n(Math.sqrt(varAm), 4)}.`)
    }
})

T({
    chave: 'notafinal', sub: 'Matemática', emoji: '📝', titulo: 'Quanto preciso tirar na prova',
    descricao: 'Nota necessária para fechar a média que falta',
    usage: '<média desejada> <nota> <nota> ...',
    examples: ['6 4,5 7 — preciso de 6 e já tirei 4,5 e 7', '7 5 8 6', '6 3'],
    intro: 'Você diz a média que precisa e as notas que já tem. Eu calculo quanto falta tirar na próxima prova, supondo que todas valem igual.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['média desejada e as notas já tiradas'])
        const alvo = vs[0], notas = vs.slice(1)
        const soma = notas.reduce((a, b) => a + b, 0)
        const total = notas.length + 1
        const precisa = alvo * total - soma
        return resultado(
            precisa <= 0 ? `Você *já garantiu* a média ${n(alvo, 2)}: mesmo tirando zero na próxima, a média fecha.`
                : `Você precisa tirar *${n(precisa, 2)}* na próxima prova.`,
            [
                `1) Para média ${n(alvo, 2)} em ${total} provas, a soma tem que ser ${n(alvo * total, 2)}`,
                `2) Você já tem ${notas.map(v => n(v, 2)).join(' + ')} = ${n(soma, 2)}`,
                `3) Falta ${n(alvo * total, 2)} - ${n(soma, 2)} = ${n(precisa, 2)}`
            ],
            precisa > 10 ? 'Passou de 10: com as notas atuais não dá para fechar só na próxima prova. Vale procurar o professor.' : 'Isso vale quando todas as provas têm o mesmo peso. Se tiver peso diferente, use a média ponderada.')
    }
})

// ════════════════════════════════════════════════════════════
//  10. MATEMÁTICA — frações
// ════════════════════════════════════════════════════════════

/** Acha duas frações no texto: "1/2 + 1/3" ou "1 2 1 3". */
function duasFracoes(texto) {
    const achados = [...String(texto).matchAll(/(-?\d+)\s*\/\s*(-?\d+)/g)]
    if (achados.length >= 2) {
        const meio = String(texto).slice(achados[0].index + achados[0][0].length, achados[1].index)
        return {
            a: Number(achados[0][1]), b: Number(achados[0][2]),
            c: Number(achados[1][1]), d: Number(achados[1][2]),
            meio
        }
    }
    const vs = extrairNumeros(texto).map(v => Math.round(v))
    if (vs.length >= 4) return { a: vs[0], b: vs[1], c: vs[2], d: vs[3], meio: String(texto) }
    erro('preciso de duas frações, tipo 1/2 e 1/3')
}

T({
    chave: 'somarfracao', sub: 'Matemática', emoji: '🍕', titulo: 'Somar e subtrair frações',
    descricao: 'Soma ou subtrai duas frações pelo MMC',
    usage: '<fração> + <fração>',
    examples: ['1/2 + 1/3 — soma com denominadores diferentes', '3/4 - 2/5 — subtração', '5/6 + 1/6 — mesmo denominador'],
    intro: 'Para somar fração é preciso igualar os denominadores. Eu faço isso pelo MMC e mostro cada etapa.',
    dica: 'Escreva com a barra: 1/2 + 1/3.',
    calcular: (args, texto) => {
        const { a, b, c, d, meio } = duasFracoes(texto)
        if (b === 0 || d === 0) erro('denominador não pode ser zero')
        const subtrair = /-/.test(meio)
        const den = mmc(b, d)
        const na = a * (den / b), nc = c * (den / d)
        const num = subtrair ? na - nc : na + nc
        const [p, q] = simplificar(num, den)
        return resultado(
            `${a}/${b} ${subtrair ? '-' : '+'} ${c}/${d} = *${txtFracao(p, q)}*  (${n(num / den, 6)})`,
            [
                `1) MMC de ${b} e ${d} é ${den}`,
                `2) ${a}/${b} vira ${na}/${den} e ${c}/${d} vira ${nc}/${den}`,
                `3) ${subtrair ? 'Subtraio' : 'Somo'} só os numeradores: ${na} ${subtrair ? '-' : '+'} ${nc} = ${num}`,
                `4) Resultado ${num}/${den}${q !== den ? `, que simplificado dá ${txtFracao(p, q)}` : ''}`
            ],
            'O denominador é o tamanho do pedaço. Só dá para somar pedaços do mesmo tamanho.')
    }
})

T({
    chave: 'multiplicarfracao', sub: 'Matemática', emoji: '✖️', titulo: 'Multiplicar e dividir frações',
    descricao: 'Multiplica ou divide duas frações, com os passos',
    usage: '<fração> x <fração>',
    examples: ['2/3 x 3/4 — multiplicação', '2/3 : 3/4 — divisão', '5/8 x 2/5'],
    intro: 'Multiplicar fração é fácil: numerador com numerador, denominador com denominador. Dividir é multiplicar pelo inverso.',
    dica: 'Use x para multiplicar e : para dividir.',
    calcular: (args, texto) => {
        const { a, b, c, d, meio } = duasFracoes(texto)
        if (b === 0 || d === 0) erro('denominador não pode ser zero')
        const dividir = /[:÷]|dividid/i.test(meio)
        if (dividir && c === 0) erro('não dá para dividir por zero')
        const num = dividir ? a * d : a * c
        const den = dividir ? b * c : b * d
        const [p, q] = simplificar(num, den)
        return resultado(
            `${a}/${b} ${dividir ? ':' : '×'} ${c}/${d} = *${txtFracao(p, q)}*  (${n(num / den, 6)})`,
            dividir
                ? [`1) Dividir é multiplicar pelo inverso: ${a}/${b} × ${d}/${c}`, `2) Numeradores: ${a} × ${d} = ${num}`, `3) Denominadores: ${b} × ${c} = ${den}`, `4) Simplificando: ${txtFracao(p, q)}`]
                : [`1) Numeradores: ${a} × ${c} = ${num}`, `2) Denominadores: ${b} × ${d} = ${den}`, `3) Simplificando: ${txtFracao(p, q)}`],
            'Na multiplicação de frações não existe MMC — isso é só para somar e subtrair.')
    }
})

T({
    chave: 'simplificarfracao', sub: 'Matemática', emoji: '🪒', titulo: 'Simplificar fração',
    descricao: 'Reduz a fração à forma irredutível pelo MDC',
    usage: '<numerador>/<denominador>',
    examples: ['18/24 — vira 3/4', '144/60', '7/13 — já é irredutível'],
    intro: 'Simplificar é dividir em cima e embaixo pelo mesmo número até não dar mais.',
    calcular: (args, texto) => {
        const m = String(texto).match(/(-?\d+)\s*\/\s*(-?\d+)/)
        const vs = extrairNumeros(texto).map(v => Math.round(v))
        const a = m ? Number(m[1]) : vs[0]
        const b = m ? Number(m[2]) : vs[1]
        if (a === undefined || b === undefined || !Number.isFinite(a) || !Number.isFinite(b)) erro('mande a fração assim: 18/24')
        if (b === 0) erro('denominador não pode ser zero')
        const g = mdc(a, b) || 1
        const [p, q] = simplificar(a, b)
        return resultado(
            `${a}/${b} simplificada é *${txtFracao(p, q)}*.`,
            g === 1 ? [`1) O MDC de ${Math.abs(a)} e ${Math.abs(b)} é 1`, '2) Não há o que cortar: a fração já está na forma mais simples']
                : [`1) MDC de ${Math.abs(a)} e ${Math.abs(b)} = ${g}`, `2) Divido o numerador: ${a} ÷ ${g} = ${p}`, `3) Divido o denominador: ${b} ÷ ${g} = ${q}`],
            `Em decimal isso vale ${n(a / b, 6)}, o mesmo que ${n(a / b * 100, 4)}%.`)
    }
})

T({
    chave: 'fracaodecimal', sub: 'Matemática', emoji: '🔟', titulo: 'Fração para decimal',
    descricao: 'Transforma fração em número decimal e em %',
    usage: '<numerador>/<denominador>',
    examples: ['3/8 — dá exato', '1/3 — dízima periódica', '7/4'],
    intro: 'Fração é divisão disfarçada. Eu faço a conta e mostro também em porcentagem.',
    calcular: (args, texto) => {
        const m = String(texto).match(/(-?\d+)\s*\/\s*(-?\d+)/)
        const vs = extrairNumeros(texto)
        const a = m ? Number(m[1]) : vs[0]
        const b = m ? Number(m[2]) : vs[1]
        if (!Number.isFinite(a) || !Number.isFinite(b)) erro('mande a fração assim: 3/8')
        if (b === 0) erro('não existe fração com denominador zero')
        const v = a / b
        const restoFatores = fatoresPrimos(Math.abs(b) / (mdc(a, b) || 1)).map(f => f[0])
        const exata = restoFatores.every(p => p === 2 || p === 5)
        return resultado(
            `${a}/${b} = *${n(v, 8)}* = *${n(v * 100, 6)}%*`,
            [`1) Fração é divisão: ${a} ÷ ${b}`, `2) Resultado: ${n(v, 8)}`, `3) Multiplicando por 100 viro porcentagem: ${n(v * 100, 6)}%`],
            exata ? 'Essa divisão é exata porque o denominador simplificado só tem fatores 2 e 5.' : 'Essa é uma dízima periódica: os algarismos se repetem para sempre, porque o denominador tem fator diferente de 2 e 5.')
    }
})

T({
    chave: 'decimalfracao', sub: 'Matemática', emoji: '🧮', titulo: 'Decimal para fração',
    descricao: 'Escreve um número decimal como fração exata',
    usage: '<número decimal>',
    examples: ['0,375 — vira 3/8', '2,5', '0,04'],
    intro: 'Todo decimal que termina vira fração: basta contar as casas depois da vírgula.',
    calcular: (args, texto) => {
        const v = paraNumero(String(texto).trim().split(/\s+/)[0], 'número decimal')
        const s = String(v)
        if (!s.includes('.')) {
            return resultado(`${n(v, 0)} já é inteiro: como fração, *${n(v, 0)}/1*.`, ['Número inteiro pode ser escrito com denominador 1.'], 'Todo inteiro é também uma fração.')
        }
        const casas = s.split('.')[1].length
        if (casas > 10) erro('esse decimal tem casas demais para virar fração exata')
        const den = Math.pow(10, casas)
        const num = Math.round(v * den)
        const [p, q] = simplificar(num, den)
        return resultado(
            `${n(v, 10)} = *${txtFracao(p, q)}*`,
            [`1) Tem ${casas} casa(s) depois da vírgula, então o denominador é ${n(den, 0)}`, `2) Fica ${num}/${den}`, `3) Simplificando pelo MDC (${mdc(num, den)}): ${txtFracao(p, q)}`],
            'Dízimas periódicas como 0,333… precisam de outro método (fração geratriz), não deste.')
    }
})

// ════════════════════════════════════════════════════════════
//  11. MATEMÁTICA — potências, raízes e logaritmos
// ════════════════════════════════════════════════════════════

T({
    chave: 'potencia', sub: 'Matemática', emoji: '⚡', titulo: 'Potência',
    descricao: 'Eleva um número a qualquer expoente',
    usage: '<base> <expoente>',
    examples: ['2 10 — dois elevado a dez', '5 -2 — expoente negativo', '9 0,5 — expoente fracionário é raiz'],
    intro: 'Potência é multiplicação repetida. Mande a base e o expoente.',
    calcular: (args) => {
        const [base, exp] = numeros(args, 2, ['base', 'expoente'])
        const r = Math.pow(base, exp)
        if (Number.isNaN(r)) erro('essa potência não dá um número real — base negativa com expoente quebrado não existe nos reais')
        if (!Number.isFinite(r)) erro('esse resultado é grande demais para eu escrever — diminua a base ou o expoente')
        const explica = exp === 0 ? 'Todo número diferente de zero elevado a 0 dá 1.'
            : exp < 0 ? `Expoente negativo vira fração: ${n(base, 4)}^${n(exp, 4)} = 1 ÷ ${n(Math.pow(base, -exp), 6)}`
                : !Number.isInteger(exp) ? `Expoente quebrado é raiz: ${n(base, 4)}^${n(exp, 4)} é a mesma coisa que a raiz dessa potência.`
                    : `${n(base, 4)} multiplicado por ele mesmo ${n(exp, 0)} vezes.`
        return resultado(
            `${n(base, 4)}^${n(exp, 4)} = *${n(r, 8)}*`,
            [`1) ${explica}`, `2) Resultado: ${n(r, 8)}`],
            Number.isInteger(exp) && exp > 0 && Math.abs(base) === 10 ? 'Potência de 10 é só contar zeros — é a base da notação científica.' : 'Cuidado com o sinal: (-2)² é 4, mas -2² é -4.')
    }
})

T({
    chave: 'raiz', sub: 'Matemática', emoji: '√', titulo: 'Raiz quadrada',
    descricao: 'Calcula a raiz e simplifica o radical',
    usage: '<número>',
    examples: ['144 — raiz exata', '72 — vira 6 raiz de 2', '2 — número irracional'],
    intro: 'Raiz quadrada é a pergunta inversa da potência: que número multiplicado por ele mesmo dá isso?',
    calcular: (args) => {
        const [x] = numeros(args, 1, ['número'])
        if (x < 0) erro('raiz quadrada de número negativo não existe entre os números reais')
        const r = Math.sqrt(x)
        const exata = Number.isInteger(x) && Number.isInteger(r)
        let fora = 1, dentro = Math.round(x)
        if (Number.isInteger(x) && x > 0 && !exata) {
            for (const [p, e] of fatoresPrimos(dentro)) {
                const pares = Math.floor(e / 2)
                fora *= Math.pow(p, pares)
                dentro /= Math.pow(p, pares * 2)
            }
        }
        const linhas = [`1) Procuro o número que, multiplicado por ele mesmo, dá ${n(x, 4)}`, `2) Raiz de ${n(x, 4)} = ${n(r, 8)}`]
        if (!exata && fora > 1) linhas.push(`3) Simplificando o radical: raiz de ${n(x, 0)} = ${fora} × raiz de ${dentro}`)
        return resultado(
            exata ? `A raiz de ${n(x, 0)} é exata: *${n(r, 0)}*.` : `A raiz de ${n(x, 4)} é *${n(r, 8)}*${fora > 1 ? ` — ou ${fora} raiz de ${dentro} na forma exata` : ''}.`,
            linhas,
            exata ? `${n(x, 0)} é um quadrado perfeito: ${n(r, 0)} × ${n(r, 0)} = ${n(x, 0)}.` : 'Quando a raiz não é exata, o número é irracional: a vírgula nunca acaba nem repete.')
    }
})

T({
    chave: 'raizn', sub: 'Matemática', emoji: '🌿', titulo: 'Raiz de qualquer índice',
    descricao: 'Raiz cúbica, quarta, quinta: você escolhe',
    usage: '<número> <índice>',
    examples: ['27 3 — raiz cúbica de 27', '81 4 — raiz quarta', '1000 3'],
    intro: 'Raiz cúbica, quarta, décima: é só dizer o número e o índice da raiz.',
    calcular: (args) => {
        const [x, idx] = numeros(args, 2, ['número', 'índice'])
        exigirPositivo(idx, 'índice da raiz')
        if (x < 0 && Math.round(idx) % 2 === 0) erro('raiz de índice par não existe para número negativo nos reais')
        const r = x < 0 ? -Math.pow(-x, 1 / idx) : Math.pow(x, 1 / idx)
        const exata = Math.abs(Math.round(r) - r) < 1e-9
        return resultado(
            `A raiz de índice ${n(idx, 0)} de ${n(x, 4)} é *${n(r, 8)}*.`,
            [`1) Procuro o número que, elevado a ${n(idx, 0)}, dá ${n(x, 4)}`, `2) Isso é o mesmo que ${n(x, 4)}^(1/${n(idx, 0)})`, `3) Resultado: ${n(r, 8)}`],
            exata ? `Confere: ${n(Math.round(r), 0)}^${n(idx, 0)} = ${n(Math.pow(Math.round(r), idx), 0)}.` : 'Raiz de índice ímpar aceita número negativo; a de índice par, não.')
    }
})

T({
    chave: 'logaritmo', sub: 'Matemática', emoji: '📐', titulo: 'Logaritmo',
    descricao: 'Log em qualquer base, com a leitura do resultado',
    usage: '<número> [base]',
    examples: ['1000 10 — log de 1000 na base 10', '8 2 — log de 8 na base 2', '100 — base 10 é o padrão'],
    intro: 'O logaritmo responde: a que expoente preciso elevar a base para chegar nesse número?',
    calcular: (args) => {
        const vs = numeros(args, 1, ['número'])
        const x = vs[0]
        const base = vs.length > 1 ? vs[1] : 10
        exigirPositivo(x, 'número')
        exigirPositivo(base, 'base')
        if (base === 1) erro('a base do logaritmo não pode ser 1')
        const r = Math.log(x) / Math.log(base)
        return resultado(
            `log de ${n(x, 6)} na base ${n(base, 4)} é *${n(r, 6)}*.`,
            [`1) A pergunta é: ${n(base, 4)} elevado a quanto dá ${n(x, 6)}?`, `2) Resposta: ${n(r, 6)}`, `3) Conferindo: ${n(base, 4)}^${n(r, 6)} = ${n(Math.pow(base, r), 6)}`],
            'Logaritmo transforma multiplicação em soma — foi assim que se calculava antes da calculadora.')
    }
})

T({
    chave: 'notacaocientifica', sub: 'Matemática', emoji: '🔬', titulo: 'Número em notação científica',
    descricao: 'Escreve número grande ou pequeno em potência de 10',
    usage: '<número>',
    examples: ['300000000 — velocidade da luz', '0,000045', '1500'],
    intro: 'Notação científica é o jeito de escrever números enormes ou minúsculos sem encher a linha de zeros.',
    calcular: (args, texto) => {
        const x = paraNumero(String(texto).trim().split(/\s+/)[0], 'número')
        if (x === 0) return resultado('O zero em notação científica é simplesmente *0*.', ['Não existe potência de 10 que dê zero.'], 'O zero é o único número sem notação científica.')
        const expo = Math.floor(Math.log10(Math.abs(x)))
        const mant = x / Math.pow(10, expo)
        return resultado(
            `${n(x, 10)} = *${n(mant, 6)} × 10^${expo}*`,
            [`1) Ando com a vírgula até sobrar um algarismo antes dela: ${n(mant, 6)}`, `2) Contei ${Math.abs(expo)} casa(s) para a ${expo >= 0 ? 'esquerda' : 'direita'}`, `3) Isso vira o expoente: 10^${expo}`],
            expo >= 0 ? 'Expoente positivo: número grande.' : 'Expoente negativo: número pequeno, menor que 1.')
    }
})

T({
    chave: 'denotacao', sub: 'Matemática', emoji: '🔭', titulo: 'Notação científica para número',
    descricao: 'Abre a potência de 10 e escreve o número inteiro',
    usage: '<mantissa> <expoente>',
    examples: ['3 8 — 3 x 10^8', '4,5 -6 — número pequeno', '1,6 -19 — carga do elétron'],
    intro: 'O caminho de volta: você manda a mantissa e o expoente, e eu escrevo o número por extenso.',
    calcular: (args) => {
        const [mant, expo] = numeros(args, 2, ['mantissa', 'expoente'])
        if (Math.abs(expo) > 300) erro('esse expoente é grande demais')
        const v = mant * Math.pow(10, expo)
        const porExtenso = Math.abs(expo) <= 20 ? escreverPorExtenso(v, expo) : n(v, 6)
        return resultado(
            `${n(mant, 6)} × 10^${n(expo, 0)} = *${porExtenso}*`,
            [`1) O expoente ${n(expo, 0)} manda a vírgula ${Math.abs(expo)} casa(s) para a ${expo >= 0 ? 'direita' : 'esquerda'}`, `2) Completo com zeros onde precisa`, `3) Número por extenso: ${porExtenso}`],
            'Em física e química quase tudo aparece assim: é mais fácil de ler e de comparar ordens de grandeza.')
    }
})

// ════════════════════════════════════════════════════════════
//  12. MATEMÁTICA — geometria plana
// ════════════════════════════════════════════════════════════

const PI = Math.PI

T({
    chave: 'areaquadrado', sub: 'Matemática', emoji: '⬜', titulo: 'Quadrado: área e perímetro',
    descricao: 'Área, perímetro e diagonal a partir do lado',
    usage: '<lado>',
    examples: ['5 — lado de 5', '2,5', '12'],
    intro: 'Me dê o lado do quadrado e eu entrego área, perímetro e até a diagonal.',
    calcular: (args) => {
        const [l] = numeros(args, 1, ['lado'])
        exigirPositivo(l, 'lado')
        return resultado(
            `A área é *${n(l * l, 4)}* unidades de área.`,
            [`1) Área = lado × lado = ${n(l, 4)} × ${n(l, 4)} = ${n(l * l, 4)}`, `2) Perímetro = 4 × ${n(l, 4)} = ${n(4 * l, 4)}`, `3) Diagonal = lado × raiz de 2 = ${n(l * Math.SQRT2, 4)}`],
            'Se o lado estiver em metros, a área sai em metros quadrados.')
    }
})

T({
    chave: 'arearetangulo', sub: 'Matemática', emoji: '▭', titulo: 'Retângulo: área e perímetro',
    descricao: 'Área, perímetro e diagonal com base e altura',
    usage: '<base> <altura>',
    examples: ['8 5 — cômodo de 8 por 5', '3,2 4,5', '120 80'],
    intro: 'Base e altura do retângulo: dá para saber quanto piso comprar e quanto rodapé vai gastar.',
    calcular: (args) => {
        const [b, h] = numeros(args, 2, ['base', 'altura'])
        exigirPositivo(b, 'base'); exigirPositivo(h, 'altura')
        return resultado(
            `A área é *${n(b * h, 4)}* e o perímetro é *${n(2 * (b + h), 4)}*.`,
            [`1) Área = base × altura = ${n(b, 4)} × ${n(h, 4)} = ${n(b * h, 4)}`, `2) Perímetro = 2 × (${n(b, 4)} + ${n(h, 4)}) = ${n(2 * (b + h), 4)}`, `3) Diagonal = raiz de (${n(b * b, 4)} + ${n(h * h, 4)}) = ${n(Math.hypot(b, h), 4)}`],
            'Para comprar piso, some uns 10% de folga por causa dos recortes e quebras.')
    }
})

T({
    chave: 'areatriangulo', sub: 'Matemática', emoji: '🔺', titulo: 'Triângulo: área por base e altura',
    descricao: 'Área do triângulo com base e altura',
    usage: '<base> <altura>',
    examples: ['10 6 — base 10 e altura 6', '7,5 4', '3 3'],
    intro: 'A área do triângulo é a metade da do retângulo de mesma base e altura.',
    calcular: (args) => {
        const [b, h] = numeros(args, 2, ['base', 'altura'])
        exigirPositivo(b, 'base'); exigirPositivo(h, 'altura')
        return resultado(
            `A área é *${n(b * h / 2, 4)}*.`,
            [`1) Área = (base × altura) ÷ 2`, `2) ${n(b, 4)} × ${n(h, 4)} = ${n(b * h, 4)}`, `3) ${n(b * h, 4)} ÷ 2 = ${n(b * h / 2, 4)}`],
            'Dois triângulos iguais juntos formam exatamente um retângulo — por isso o divide por 2.')
    }
})

T({
    chave: 'areaheron', sub: 'Matemática', emoji: '📐', titulo: 'Triângulo: área pelos três lados',
    descricao: 'Fórmula de Heron quando só se sabe os lados',
    usage: '<lado a> <lado b> <lado c>',
    examples: ['3 4 5 — triângulo retângulo famoso', '7 8 9', '5 5 5 — equilátero'],
    intro: 'Sem saber a altura, dá para achar a área só com os três lados. É a fórmula de Heron.',
    calcular: (args) => {
        const [a, b, c] = numeros(args, 3, ['lado a', 'lado b', 'lado c'])
        for (const [v, nome] of [[a, 'lado a'], [b, 'lado b'], [c, 'lado c']]) exigirPositivo(v, nome)
        if (a + b <= c || a + c <= b || b + c <= a) erro('esses três lados não fecham um triângulo: um lado é maior que a soma dos outros dois')
        const p = (a + b + c) / 2
        const area = Math.sqrt(p * (p - a) * (p - b) * (p - c))
        const retangulo = [a, b, c].sort((x, y) => x - y)
        const ehRetangulo = Math.abs(retangulo[0] ** 2 + retangulo[1] ** 2 - retangulo[2] ** 2) < 1e-9
        return resultado(
            `A área é *${n(area, 4)}*.`,
            [`1) Semiperímetro p = (${n(a, 4)} + ${n(b, 4)} + ${n(c, 4)}) ÷ 2 = ${n(p, 4)}`, `2) Área = raiz de [p × (p-a) × (p-b) × (p-c)]`, `3) raiz de [${n(p, 4)} × ${n(p - a, 4)} × ${n(p - b, 4)} × ${n(p - c, 4)}]`, `4) Área = ${n(area, 4)}`],
            ehRetangulo ? 'Esse triângulo é retângulo: os lados obedecem ao teorema de Pitágoras.' : `O perímetro é ${n(a + b + c, 4)}.`)
    }
})

T({
    chave: 'areacirculo', sub: 'Matemática', emoji: '⭕', titulo: 'Círculo: área e comprimento',
    descricao: 'Área, diâmetro e comprimento a partir do raio',
    usage: '<raio>',
    examples: ['5 — raio de 5', '2,5', '10'],
    intro: 'Com o raio eu calculo a área do círculo e o comprimento da circunferência.',
    calcular: (args) => {
        const [r] = numeros(args, 1, ['raio'])
        exigirPositivo(r, 'raio')
        return resultado(
            `A área é *${n(PI * r * r, 4)}*.`,
            [`1) Área = pi × raio² = 3,14159 × ${n(r, 4)}² `, `2) ${n(r, 4)}² = ${n(r * r, 4)}`, `3) Área = ${n(PI * r * r, 4)}`],
            `O diâmetro é ${n(2 * r, 4)} e a volta inteira (comprimento) mede ${n(2 * PI * r, 4)}.`)
    }
})

T({
    chave: 'areatrapezio', sub: 'Matemática', emoji: '🪁', titulo: 'Trapézio: área',
    descricao: 'Área do trapézio com as duas bases e a altura',
    usage: '<base maior> <base menor> <altura>',
    examples: ['10 6 4 — bases 10 e 6, altura 4', '8 3 5', '12,5 7,5 6'],
    intro: 'O trapézio tem duas bases. A área usa a média delas vezes a altura.',
    calcular: (args) => {
        const [B, b, h] = numeros(args, 3, ['base maior', 'base menor', 'altura'])
        exigirPositivo(h, 'altura')
        const area = (B + b) * h / 2
        return resultado(
            `A área é *${n(area, 4)}*.`,
            [`1) Área = (base maior + base menor) × altura ÷ 2`, `2) (${n(B, 4)} + ${n(b, 4)}) = ${n(B + b, 4)}`, `3) ${n(B + b, 4)} × ${n(h, 4)} = ${n((B + b) * h, 4)}`, `4) Dividido por 2: ${n(area, 4)}`],
            `É como se fosse um retângulo de base ${n((B + b) / 2, 4)} (a média das bases) e altura ${n(h, 4)}.`)
    }
})

T({
    chave: 'arealosango', sub: 'Matemática', emoji: '🔷', titulo: 'Losango: área',
    descricao: 'Área do losango pelas duas diagonais',
    usage: '<diagonal maior> <diagonal menor>',
    examples: ['12 8 — diagonais 12 e 8', '10 6', '7,5 4'],
    intro: 'No losango a área sai das diagonais: multiplica as duas e divide por dois.',
    calcular: (args) => {
        const [D, d] = numeros(args, 2, ['diagonal maior', 'diagonal menor'])
        exigirPositivo(D, 'diagonal maior'); exigirPositivo(d, 'diagonal menor')
        const lado = Math.hypot(D / 2, d / 2)
        return resultado(
            `A área é *${n(D * d / 2, 4)}*.`,
            [`1) Área = (diagonal maior × diagonal menor) ÷ 2`, `2) ${n(D, 4)} × ${n(d, 4)} = ${n(D * d, 4)}`, `3) ${n(D * d, 4)} ÷ 2 = ${n(D * d / 2, 4)}`],
            `Cada lado do losango mede ${n(lado, 4)}, e o perímetro dá ${n(4 * lado, 4)}.`)
    }
})

T({
    chave: 'perimetroretangulo', sub: 'Matemática', emoji: '🧵', titulo: 'Perímetro do retângulo',
    descricao: 'Quanto de cerca ou rodapé dá a volta na área',
    usage: '<base> <altura>',
    examples: ['8 5 — cômodo de 8 por 5', '30 20 — terreno', '4,5 3,2'],
    intro: 'Perímetro é a volta inteira. É o que você precisa saber para comprar rodapé, cerca ou moldura.',
    calcular: (args) => {
        const [b, h] = numeros(args, 2, ['base', 'altura'])
        exigirPositivo(b, 'base'); exigirPositivo(h, 'altura')
        const p = 2 * (b + h)
        return resultado(
            `O perímetro é *${n(p, 4)}*.`,
            [`1) São dois lados de ${n(b, 4)} e dois de ${n(h, 4)}`, `2) ${n(b, 4)} + ${n(b, 4)} + ${n(h, 4)} + ${n(h, 4)} = ${n(p, 4)}`, `3) Ou, mais rápido: 2 × (${n(b, 4)} + ${n(h, 4)}) = ${n(p, 4)}`],
            `A área desse mesmo retângulo é ${n(b * h, 4)} — perímetro é a volta, área é o recheio.`)
    }
})

T({
    chave: 'circunferencia', sub: 'Matemática', emoji: '🛞', titulo: 'Comprimento da circunferência',
    descricao: 'A volta completa de um círculo pelo raio',
    usage: '<raio>',
    examples: ['5 — raio 5', '0,33 — roda de bicicleta em metros', '35'],
    intro: 'Quanto mede a volta de um círculo? É o comprimento da circunferência: 2 vezes pi vezes o raio.',
    calcular: (args) => {
        const [r] = numeros(args, 1, ['raio'])
        exigirPositivo(r, 'raio')
        const c = 2 * PI * r
        return resultado(
            `A volta completa mede *${n(c, 4)}*.`,
            [`1) Comprimento = 2 × pi × raio`, `2) 2 × 3,14159 × ${n(r, 4)}`, `3) Comprimento = ${n(c, 4)}`],
            `Se isso fosse uma roda, cada volta dela andaria ${n(c, 4)} — em 100 voltas, ${n(c * 100, 2)}.`)
    }
})

T({
    chave: 'areasetor', sub: 'Matemática', emoji: '🍰', titulo: 'Setor circular: fatia de pizza',
    descricao: 'Área da fatia e comprimento do arco',
    usage: '<raio> <ângulo em graus>',
    examples: ['10 45 — fatia de 45 graus', '6 90 — um quarto do círculo', '20 120'],
    intro: 'Uma fatia de pizza é um setor circular. Com o raio e o ângulo eu acho a área da fatia e o tamanho da borda.',
    calcular: (args) => {
        const [r, ang] = numeros(args, 2, ['raio', 'ângulo'])
        exigirPositivo(r, 'raio')
        exigirFaixa(ang, 0, 360, 'ângulo')
        const area = PI * r * r * ang / 360
        const arco = 2 * PI * r * ang / 360
        return resultado(
            `A fatia tem área *${n(area, 4)}* e borda de *${n(arco, 4)}*.`,
            [`1) O círculo inteiro tem área ${n(PI * r * r, 4)}`, `2) A fatia é ${n(ang, 4)}/360 do círculo = ${n(ang / 360, 6)}`, `3) Área da fatia = ${n(PI * r * r, 4)} × ${n(ang / 360, 6)} = ${n(area, 4)}`, `4) Arco = ${n(2 * PI * r, 4)} × ${n(ang / 360, 6)} = ${n(arco, 4)}`],
            `Essa fatia é ${n(ang / 360 * 100, 2)}% da pizza inteira.`)
    }
})

// ════════════════════════════════════════════════════════════
//  13. MATEMÁTICA — geometria espacial
// ════════════════════════════════════════════════════════════

/** Volume em unidades cúbicas vira litros quando a medida está em decímetros. */
function litros(metrosCubicos) { return metrosCubicos * 1000 }

T({
    chave: 'volumecubo', sub: 'Matemática', emoji: '🧊', titulo: 'Cubo: volume e área total',
    descricao: 'Volume, área total e diagonal pela aresta',
    usage: '<aresta>',
    examples: ['3 — cubo de aresta 3', '0,5', '10'],
    intro: 'Aresta do cubo: eu devolvo volume, área total das seis faces e a diagonal que atravessa o cubo.',
    calcular: (args) => {
        const [a] = numeros(args, 1, ['aresta'])
        exigirPositivo(a, 'aresta')
        const v = a ** 3
        return resultado(
            `O volume é *${n(v, 4)}* unidades cúbicas.`,
            [`1) Volume = aresta³ = ${n(a, 4)} × ${n(a, 4)} × ${n(a, 4)} = ${n(v, 4)}`, `2) Área total = 6 × ${n(a * a, 4)} = ${n(6 * a * a, 4)}`, `3) Diagonal = aresta × raiz de 3 = ${n(a * Math.sqrt(3), 4)}`],
            `Se a aresta estiver em metros, cabem ${n(litros(v), 2)} litros aí dentro.`)
    }
})

T({
    chave: 'volumebloco', sub: 'Matemática', emoji: '📦', titulo: 'Caixa retangular: volume',
    descricao: 'Volume e litros de uma caixa ou cômodo',
    usage: '<comprimento> <largura> <altura>',
    examples: ['2 1,5 1 — caixa dágua em metros', '0,4 0,3 0,25 — caixa de papelão', '5 4 2,8 — cômodo'],
    intro: 'Volume de qualquer caixa retangular. Se você medir em metros, eu já converto para litros.',
    calcular: (args) => {
        const [c, l, h] = numeros(args, 3, ['comprimento', 'largura', 'altura'])
        for (const [v, nome] of [[c, 'comprimento'], [l, 'largura'], [h, 'altura']]) exigirPositivo(v, nome)
        const v = c * l * h
        return resultado(
            `O volume é *${n(v, 4)}* unidades cúbicas.`,
            [`1) Volume = comprimento × largura × altura`, `2) ${n(c, 4)} × ${n(l, 4)} = ${n(c * l, 4)}`, `3) ${n(c * l, 4)} × ${n(h, 4)} = ${n(v, 4)}`],
            `Medindo em metros, isso dá ${n(litros(v), 2)} litros. Medindo em centímetros, ${n(v / 1000, 2)} litros.`)
    }
})

T({
    chave: 'volumecilindro', sub: 'Matemática', emoji: '🥫', titulo: 'Cilindro: volume e área',
    descricao: 'Volume, litros e área total de um cilindro',
    usage: '<raio> <altura>',
    examples: ['0,5 1,2 — caixa dágua em metros', '3 10', '0,04 0,12 — lata de refrigerante'],
    intro: 'Lata, caixa dágua, tubo: tudo isso é cilindro. Raio da base e altura bastam.',
    calcular: (args) => {
        const [r, h] = numeros(args, 2, ['raio', 'altura'])
        exigirPositivo(r, 'raio'); exigirPositivo(h, 'altura')
        const base = PI * r * r, v = base * h
        const areaTotal = 2 * base + 2 * PI * r * h
        return resultado(
            `O volume é *${n(v, 6)}* unidades cúbicas.`,
            [`1) Área da base = pi × ${n(r, 4)}² = ${n(base, 6)}`, `2) Volume = área da base × altura = ${n(base, 6)} × ${n(h, 4)} = ${n(v, 6)}`, `3) Área total = 2 bases + a lateral = ${n(areaTotal, 6)}`],
            `Medindo em metros, cabem ${n(litros(v), 2)} litros.`)
    }
})

T({
    chave: 'volumecone', sub: 'Matemática', emoji: '🍦', titulo: 'Cone: volume e área',
    descricao: 'Volume, geratriz e área total do cone',
    usage: '<raio> <altura>',
    examples: ['3 4 — cone de raio 3 e altura 4', '0,05 0,15 — casquinha', '10 24'],
    intro: 'O cone é o terço do cilindro de mesma base e altura. Eu mostro por que.',
    calcular: (args) => {
        const [r, h] = numeros(args, 2, ['raio', 'altura'])
        exigirPositivo(r, 'raio'); exigirPositivo(h, 'altura')
        const base = PI * r * r, v = base * h / 3
        const g = Math.hypot(r, h)
        return resultado(
            `O volume é *${n(v, 6)}*.`,
            [`1) Área da base = pi × ${n(r, 4)}² = ${n(base, 6)}`, `2) Volume = base × altura ÷ 3 = ${n(base, 6)} × ${n(h, 4)} ÷ 3`, `3) Volume = ${n(v, 6)}`, `4) Geratriz (o lado inclinado) = ${n(g, 6)}`],
            `O cilindro de mesma base e altura teria ${n(base * h, 6)} — exatamente o triplo.`)
    }
})

T({
    chave: 'volumeesfera', sub: 'Matemática', emoji: '⚽', titulo: 'Esfera: volume e área',
    descricao: 'Volume e superfície de uma bola pelo raio',
    usage: '<raio>',
    examples: ['0,11 — bola de futebol em metros', '5', '6371 — raio da Terra em km'],
    intro: 'Bola, planeta, gota: o volume da esfera é quatro terços de pi vezes o raio ao cubo.',
    calcular: (args) => {
        const [r] = numeros(args, 1, ['raio'])
        exigirPositivo(r, 'raio')
        const v = 4 / 3 * PI * r ** 3
        const a = 4 * PI * r * r
        return resultado(
            `O volume é *${n(v, 6)}* e a superfície mede *${n(a, 6)}*.`,
            [`1) Volume = (4 ÷ 3) × pi × raio³`, `2) ${n(r, 4)}³ = ${n(r ** 3, 6)}`, `3) Volume = ${n(v, 6)}`, `4) Área da superfície = 4 × pi × raio² = ${n(a, 6)}`],
            'A superfície da esfera é igual à área de quatro círculos de mesmo raio.')
    }
})

T({
    chave: 'volumepiramide', sub: 'Matemática', emoji: '🏛️', titulo: 'Pirâmide de base quadrada',
    descricao: 'Volume e apótema de uma pirâmide quadrada',
    usage: '<lado da base> <altura>',
    examples: ['230 146 — a pirâmide de Quéops em metros', '6 4', '10 12'],
    intro: 'Como o cone, a pirâmide é um terço do prisma de mesma base e altura.',
    calcular: (args) => {
        const [l, h] = numeros(args, 2, ['lado da base', 'altura'])
        exigirPositivo(l, 'lado da base'); exigirPositivo(h, 'altura')
        const base = l * l, v = base * h / 3
        const apotema = Math.hypot(h, l / 2)
        return resultado(
            `O volume é *${n(v, 4)}*.`,
            [`1) Área da base = ${n(l, 4)} × ${n(l, 4)} = ${n(base, 4)}`, `2) Volume = base × altura ÷ 3 = ${n(base, 4)} × ${n(h, 4)} ÷ 3`, `3) Volume = ${n(v, 4)}`, `4) Apótema (altura de cada face) = ${n(apotema, 4)}`],
            `A área lateral, somando as quatro faces triangulares, é ${n(2 * l * apotema, 4)}.`)
    }
})

// ════════════════════════════════════════════════════════════
//  14. MATEMÁTICA — Pitágoras e trigonometria
// ════════════════════════════════════════════════════════════

T({
    chave: 'pitagoras', sub: 'Matemática', emoji: '📏', titulo: 'Teorema de Pitágoras: hipotenusa',
    descricao: 'Acha a hipotenusa a partir dos dois catetos',
    usage: '<cateto> <cateto>',
    examples: ['3 4 — o triângulo mais famoso da escola', '5 12', '1,5 2'],
    intro: 'O quadrado da hipotenusa é a soma dos quadrados dos catetos. Mande os dois catetos.',
    calcular: (args) => {
        const [a, b] = numeros(args, 2, ['primeiro cateto', 'segundo cateto'])
        exigirPositivo(a, 'primeiro cateto'); exigirPositivo(b, 'segundo cateto')
        const h = Math.hypot(a, b)
        return resultado(
            `A hipotenusa mede *${n(h, 6)}*.`,
            [`1) h² = ${n(a, 4)}² + ${n(b, 4)}²`, `2) h² = ${n(a * a, 4)} + ${n(b * b, 4)} = ${n(a * a + b * b, 4)}`, `3) h = raiz de ${n(a * a + b * b, 4)} = ${n(h, 6)}`],
            Number.isInteger(h) ? 'Esses três números formam um terno pitagórico: todos inteiros.' : `A área desse triângulo retângulo é ${n(a * b / 2, 4)}.`)
    }
})

T({
    chave: 'pitagorascateto', sub: 'Matemática', emoji: '📐', titulo: 'Pitágoras: achar o cateto',
    descricao: 'Acha o cateto que falta com hipotenusa e cateto',
    usage: '<hipotenusa> <cateto conhecido>',
    examples: ['5 3 — hipotenusa 5 e cateto 3', '13 5', '10 6'],
    intro: 'Quando você já sabe a hipotenusa e um cateto, o outro sai subtraindo os quadrados.',
    calcular: (args) => {
        const [h, a] = numeros(args, 2, ['hipotenusa', 'cateto'])
        exigirPositivo(h, 'hipotenusa'); exigirPositivo(a, 'cateto')
        if (a >= h) erro('a hipotenusa precisa ser o maior lado — ela não pode ser menor ou igual ao cateto')
        const b = Math.sqrt(h * h - a * a)
        return resultado(
            `O outro cateto mede *${n(b, 6)}*.`,
            [`1) cateto² = hipotenusa² - cateto conhecido²`, `2) ${n(h * h, 4)} - ${n(a * a, 4)} = ${n(h * h - a * a, 4)}`, `3) cateto = raiz de ${n(h * h - a * a, 4)} = ${n(b, 6)}`],
            `Área do triângulo: ${n(a * b / 2, 4)}. Perímetro: ${n(a + b + h, 4)}.`)
    }
})

T({
    chave: 'trigangulo', sub: 'Matemática', emoji: '🌀', titulo: 'Seno, cosseno e tangente',
    descricao: 'As três razões de um ângulo em graus',
    usage: '<ângulo em graus>',
    examples: ['30 — ângulo notável', '45', '60'],
    intro: 'Seno, cosseno e tangente de qualquer ângulo, com destaque para os ângulos notáveis da prova.',
    calcular: (args) => {
        const [g] = numeros(args, 1, ['ângulo'])
        const rad = grausParaRad(g)
        const sen = Math.sin(rad), cos = Math.cos(rad)
        const tgIndefinida = Math.abs(cos) < 1e-12
        const notaveis = { 0: 'sen 0 e cos 1', 30: 'sen 1/2, cos raiz de 3 sobre 2, tg raiz de 3 sobre 3', 45: 'sen e cos iguais a raiz de 2 sobre 2, tg 1', 60: 'sen raiz de 3 sobre 2, cos 1/2, tg raiz de 3', 90: 'sen 1, cos 0, tangente não existe' }
        return resultado(
            `Para ${n(g, 4)}°: seno *${n(sen, 6)}*, cosseno *${n(cos, 6)}*${tgIndefinida ? ', e a tangente não existe' : `, tangente *${n(sen / cos, 6)}*`}.`,
            [
                `1) Converto para radianos: ${n(g, 4)}° × pi ÷ 180 = ${n(rad, 6)} rad`,
                `2) Seno = cateto oposto ÷ hipotenusa = ${n(sen, 6)}`,
                `3) Cosseno = cateto adjacente ÷ hipotenusa = ${n(cos, 6)}`,
                tgIndefinida ? '4) Tangente = seno ÷ cosseno, mas o cosseno é zero: não existe' : `4) Tangente = seno ÷ cosseno = ${n(sen / cos, 6)}`
            ],
            notaveis[((g % 360) + 360) % 360] ? `Ângulo notável: ${notaveis[((g % 360) + 360) % 360]}.` : `Confira: seno² + cosseno² = ${n(sen * sen + cos * cos, 4)} — sempre dá 1.`)
    }
})

T({
    chave: 'trigtriangulo', sub: 'Matemática', emoji: '📊', titulo: 'Triângulo retângulo por ângulo',
    descricao: 'Acha os catetos sabendo ângulo e hipotenusa',
    usage: '<ângulo em graus> <hipotenusa>',
    examples: ['30 10 — rampa de 30 graus e 10 de comprimento', '45 7,07', '60 20'],
    intro: 'Sabendo um ângulo e a hipotenusa, o seno e o cosseno entregam os dois catetos na hora.',
    calcular: (args) => {
        const [g, hip] = numeros(args, 2, ['ângulo', 'hipotenusa'])
        exigirFaixa(g, 0.0001, 89.9999, 'ângulo')
        exigirPositivo(hip, 'hipotenusa')
        const rad = grausParaRad(g)
        const oposto = hip * Math.sin(rad), adjacente = hip * Math.cos(rad)
        return resultado(
            `Cateto oposto *${n(oposto, 6)}* e cateto adjacente *${n(adjacente, 6)}*.`,
            [
                `1) Cateto oposto = hipotenusa × seno do ângulo = ${n(hip, 4)} × ${n(Math.sin(rad), 6)}`,
                `2) Cateto oposto = ${n(oposto, 6)}`,
                `3) Cateto adjacente = hipotenusa × cosseno = ${n(hip, 4)} × ${n(Math.cos(rad), 6)} = ${n(adjacente, 6)}`,
                `4) O terceiro ângulo é ${n(90 - g, 4)}°`
            ],
            `A área desse triângulo é ${n(oposto * adjacente / 2, 4)}. Numa rampa, o cateto oposto é a altura vencida.`)
    }
})

T({
    chave: 'leisenos', sub: 'Matemática', emoji: '🔺', titulo: 'Lei dos senos',
    descricao: 'Acha um lado com dois ângulos e um lado',
    usage: '<lado a> <ângulo A> <ângulo B>',
    examples: ['10 30 45 — lado 10 oposto a 30 graus', '8 60 40', '15 25 100'],
    intro: 'Em qualquer triângulo, cada lado dividido pelo seno do ângulo oposto dá sempre o mesmo número.',
    calcular: (args) => {
        const [a, A, B] = numeros(args, 3, ['lado a', 'ângulo A', 'ângulo B'])
        exigirPositivo(a, 'lado a')
        exigirFaixa(A, 0.0001, 179.9999, 'ângulo A')
        exigirFaixa(B, 0.0001, 179.9999, 'ângulo B')
        if (A + B >= 180) erro('a soma dos dois ângulos passou de 180° — não fecha triângulo')
        const k = a / Math.sin(grausParaRad(A))
        const b = k * Math.sin(grausParaRad(B))
        const C = 180 - A - B
        return resultado(
            `O lado oposto a ${n(B, 4)}° mede *${n(b, 6)}*.`,
            [
                `1) Lei dos senos: a ÷ sen A = b ÷ sen B`,
                `2) ${n(a, 4)} ÷ sen ${n(A, 4)}° = ${n(a, 4)} ÷ ${n(Math.sin(grausParaRad(A)), 6)} = ${n(k, 6)}`,
                `3) b = ${n(k, 6)} × sen ${n(B, 4)}° = ${n(b, 6)}`,
                `4) O terceiro ângulo é ${n(C, 4)}°, e o lado dele mede ${n(k * Math.sin(grausParaRad(C)), 6)}`
            ],
            'Essa lei funciona em qualquer triângulo, não só no retângulo.')
    }
})

T({
    chave: 'leicossenos', sub: 'Matemática', emoji: '🧭', titulo: 'Lei dos cossenos',
    descricao: 'Acha o lado oposto sabendo dois lados e o ângulo',
    usage: '<lado b> <lado c> <ângulo entre eles>',
    examples: ['8 6 60 — lados 8 e 6 com 60 graus entre eles', '5 7 45', '10 10 90'],
    intro: 'É o Pitágoras turbinado: serve para triângulo que não tem ângulo reto.',
    calcular: (args) => {
        const [b, c, A] = numeros(args, 3, ['lado b', 'lado c', 'ângulo'])
        exigirPositivo(b, 'lado b'); exigirPositivo(c, 'lado c')
        exigirFaixa(A, 0.0001, 179.9999, 'ângulo')
        const cosA = Math.cos(grausParaRad(A))
        const a2 = b * b + c * c - 2 * b * c * cosA
        const a = Math.sqrt(a2)
        return resultado(
            `O lado oposto ao ângulo de ${n(A, 4)}° mede *${n(a, 6)}*.`,
            [
                `1) a² = b² + c² - 2 × b × c × cos A`,
                `2) ${n(b * b, 4)} + ${n(c * c, 4)} = ${n(b * b + c * c, 4)}`,
                `3) 2 × ${n(b, 4)} × ${n(c, 4)} × ${n(cosA, 6)} = ${n(2 * b * c * cosA, 6)}`,
                `4) a² = ${n(a2, 6)} → a = ${n(a, 6)}`
            ],
            Math.abs(A - 90) < 1e-9 ? 'Com 90° o último termo some e sobra exatamente o teorema de Pitágoras.' : `A área desse triângulo é ${n(b * c * Math.sin(grausParaRad(A)) / 2, 4)}.`)
    }
})

T({
    chave: 'grausrad', sub: 'Matemática', emoji: '🔄', titulo: 'Graus e radianos',
    descricao: 'Converte ângulo entre graus e radianos',
    usage: '<valor> [rad]',
    examples: ['180 — graus para radianos', '3,1416 rad — radianos para graus', '45'],
    intro: 'Meia volta são 180 graus ou pi radianos. Eu converto nos dois sentidos.',
    dica: 'Escreva "rad" no fim se o valor que você mandou já está em radianos.',
    calcular: (args, texto) => {
        const [v] = numeros(args, 1, ['valor do ângulo'])
        if (/rad/i.test(texto)) {
            const g = radParaGraus(v)
            return resultado(
                `${n(v, 6)} radianos = *${n(g, 6)} graus*.`,
                [`1) 1 radiano = 180 ÷ pi graus`, `2) ${n(v, 6)} × 180 ÷ 3,14159 = ${n(g, 6)}`],
                `Isso é ${n(v / PI, 4)} vezes pi — em radianos costuma-se escrever em função de pi.`)
        }
        const r = grausParaRad(v)
        return resultado(
            `${n(v, 6)} graus = *${n(r, 6)} radianos*.`,
            [`1) 180 graus = pi radianos`, `2) ${n(v, 6)} × pi ÷ 180 = ${n(r, 6)}`, `3) Em função de pi: ${txtFracao(Math.round(v * 12), 2160)} de pi`],
            'Radiano é a medida natural do círculo: uma volta inteira são 2 pi radianos.')
    }
})

// ════════════════════════════════════════════════════════════
//  15. MATEMÁTICA — geometria analítica
// ════════════════════════════════════════════════════════════

T({
    chave: 'distanciapontos', sub: 'Matemática', emoji: '📍', titulo: 'Distância entre dois pontos',
    descricao: 'Distância no plano cartesiano com os passos',
    usage: '<x1> <y1> <x2> <y2>',
    examples: ['0 0 3 4 — da origem ao ponto (3,4)', '1 2 4 6', '-2 5 3 -7'],
    intro: 'No plano cartesiano, a distância entre dois pontos é o Pitágoras disfarçado.',
    calcular: (args) => {
        const [x1, y1, x2, y2] = numeros(args, 4, ['x1', 'y1', 'x2', 'y2'])
        const dx = x2 - x1, dy = y2 - y1
        const d = Math.hypot(dx, dy)
        return resultado(
            `A distância é *${n(d, 6)}*.`,
            [`1) Diferença em x: ${n(x2, 4)} - ${n(x1, 4)} = ${n(dx, 4)}`, `2) Diferença em y: ${n(y2, 4)} - ${n(y1, 4)} = ${n(dy, 4)}`, `3) d = raiz de (${n(dx * dx, 4)} + ${n(dy * dy, 4)}) = raiz de ${n(dx * dx + dy * dy, 4)}`, `4) d = ${n(d, 6)}`],
            'As diferenças são os catetos e a distância é a hipotenusa.')
    }
})

T({
    chave: 'pontomedio', sub: 'Matemática', emoji: '🎯', titulo: 'Ponto médio',
    descricao: 'O ponto bem no meio de dois pontos dados',
    usage: '<x1> <y1> <x2> <y2>',
    examples: ['0 0 4 6 — meio do caminho', '2 3 8 9', '-5 1 5 -1'],
    intro: 'O ponto médio é a média dos x e a média dos y. Simples assim.',
    calcular: (args) => {
        const [x1, y1, x2, y2] = numeros(args, 4, ['x1', 'y1', 'x2', 'y2'])
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
        return resultado(
            `O ponto médio é (*${n(mx, 6)}*, *${n(my, 6)}*).`,
            [`1) x do meio = (${n(x1, 4)} + ${n(x2, 4)}) ÷ 2 = ${n(mx, 6)}`, `2) y do meio = (${n(y1, 4)} + ${n(y2, 4)}) ÷ 2 = ${n(my, 6)}`],
            `Esse ponto fica a ${n(Math.hypot(x2 - x1, y2 - y1) / 2, 6)} de distância de cada extremidade.`)
    }
})

T({
    chave: 'equacaoreta', sub: 'Matemática', emoji: '📈', titulo: 'Equação da reta por dois pontos',
    descricao: 'Monta a equação da reta que passa nos pontos',
    usage: '<x1> <y1> <x2> <y2>',
    examples: ['0 1 2 5 — reta pelos pontos (0,1) e (2,5)', '1 3 4 9', '-1 2 3 2'],
    intro: 'Dois pontos definem uma reta. Eu acho a inclinação e escrevo a equação reduzida.',
    calcular: (args) => {
        const [x1, y1, x2, y2] = numeros(args, 4, ['x1', 'y1', 'x2', 'y2'])
        if (x1 === x2 && y1 === y2) erro('os dois pontos são o mesmo — por um ponto só passam infinitas retas')
        if (x1 === x2) {
            return resultado(
                `A reta é *vertical*: x = ${n(x1, 4)}.`,
                [`1) Os dois pontos têm o mesmo x (${n(x1, 4)})`, '2) Reta vertical não tem inclinação definida', '3) A equação é simplesmente x = ' + n(x1, 4)],
                'Reta vertical é o único caso em que não existe a forma y = ax + b.')
        }
        const m = (y2 - y1) / (x2 - x1)
        const b = y1 - m * x1
        return resultado(
            `A equação é *y = ${n(m, 6)}x ${b >= 0 ? '+ ' + n(b, 6) : '- ' + n(-b, 6)}*.`,
            [`1) Inclinação m = (${n(y2, 4)} - ${n(y1, 4)}) ÷ (${n(x2, 4)} - ${n(x1, 4)}) = ${n(m, 6)}`, `2) Uso o ponto (${n(x1, 4)}, ${n(y1, 4)}): ${n(y1, 4)} = ${n(m, 6)} × ${n(x1, 4)} + b`, `3) b = ${n(b, 6)}`],
            m === 0 ? 'Inclinação zero: a reta é horizontal.' : `A reta ${m > 0 ? 'sobe' : 'desce'} ${n(Math.abs(m), 4)} para cada 1 que anda em x, e corta o eixo y em ${n(b, 4)}.`)
    }
})

T({
    chave: 'areacoordenadas', sub: 'Matemática', emoji: '🗺️', titulo: 'Área do triângulo por coordenadas',
    descricao: 'Área de um triângulo dados os três vértices',
    usage: '<x1> <y1> <x2> <y2> <x3> <y3>',
    examples: ['0 0 4 0 0 3 — triângulo retângulo na origem', '1 1 5 2 3 6', '-2 0 2 0 0 4'],
    intro: 'Com os três vértices no plano, a área sai de um determinante. Serve até para calcular terreno.',
    calcular: (args) => {
        const [x1, y1, x2, y2, x3, y3] = numeros(args, 6, ['as coordenadas dos três vértices'])
        const det = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)
        const area = Math.abs(det) / 2
        if (area === 0) erro('esses três pontos estão alinhados, então não formam triângulo')
        return resultado(
            `A área é *${n(area, 6)}*.`,
            [`1) Monto o determinante com os três pontos`, `2) ${n(x1, 4)}×(${n(y2, 4)} - ${n(y3, 4)}) + ${n(x2, 4)}×(${n(y3, 4)} - ${n(y1, 4)}) + ${n(x3, 4)}×(${n(y1, 4)} - ${n(y2, 4)}) = ${n(det, 6)}`, `3) Área = módulo de ${n(det, 6)} ÷ 2 = ${n(area, 6)}`],
            'Se o determinante desse zero, os pontos estariam em linha reta.')
    }
})

// ════════════════════════════════════════════════════════════
//  16. MATEMÁTICA — bases numéricas
// ════════════════════════════════════════════════════════════

T({
    chave: 'decbin', sub: 'Matemática', emoji: '💻', titulo: 'Decimal para binário',
    descricao: 'Converte para binário mostrando as divisões',
    usage: '<número decimal>',
    examples: ['42 — o número da resposta', '255', '13'],
    intro: 'O computador só conhece 0 e 1. Eu mostro as divisões sucessivas por 2 que fazem a conversão.',
    calcular: (args) => {
        const [x] = numeros(args, 1, ['número'])
        const v = Math.round(Math.abs(x))
        if (v > 1e12) erro('use um número de até 1 trilhão')
        const bin = v.toString(2)
        const divisoes = []
        let atual = v
        while (atual > 0 && divisoes.length < 20) { divisoes.push(`${atual} ÷ 2 = ${Math.floor(atual / 2)}, resto ${atual % 2}`); atual = Math.floor(atual / 2) }
        return resultado(
            `${n(v, 0)} em binário é *${bin}*.`,
            [...divisoes.map((d, i) => `${i + 1}) ${d}`), `Lendo os restos de baixo para cima: ${bin}`],
            `São ${bin.length} dígitos binários (bits) e ${bin.split('').filter(c => c === '1').length} deles valem 1.`)
    }
})

T({
    chave: 'bindec', sub: 'Matemática', emoji: '🔤', titulo: 'Binário para decimal',
    descricao: 'Converte binário somando os valores posicionais',
    usage: '<número binário>',
    examples: ['101010 — vira 42', '11111111', '1101'],
    intro: 'Cada casa do binário vale o dobro da anterior. Somando as casas que têm 1, chega-se ao número decimal.',
    calcular: (args, texto) => {
        const bin = String(texto).replace(/\s+/g, '')
        if (!/^[01]+$/.test(bin)) erro('número binário só tem 0 e 1')
        if (bin.length > 40) erro('no máximo 40 dígitos binários')
        const v = parseInt(bin, 2)
        const parcelas = []
        for (let i = 0; i < bin.length; i++) {
            const peso = Math.pow(2, bin.length - 1 - i)
            if (bin[i] === '1') parcelas.push(`${peso}`)
        }
        return resultado(
            `${bin} em decimal é *${n(v, 0)}*.`,
            [`1) As casas valem, da direita para a esquerda: 1, 2, 4, 8, 16, 32…`, `2) Somo as casas que têm 1: ${parcelas.join(' + ') || '0'}`, `3) Total = ${n(v, 0)}`],
            `Em hexadecimal esse mesmo número é ${v.toString(16).toUpperCase()}.`)
    }
})

T({
    chave: 'basequalquer', sub: 'Matemática', emoji: '🔁', titulo: 'Converter entre bases',
    descricao: 'Muda um número de uma base para outra',
    usage: '<número> <base de origem> <base de destino>',
    examples: ['FF 16 10 — hexadecimal para decimal', '255 10 16 — decimal para hexa', '777 8 2'],
    intro: 'Decimal, binário, octal, hexadecimal ou qualquer base de 2 a 36: eu converto entre elas.',
    calcular: (args, texto) => {
        const partes = String(texto).trim().split(/\s+/)
        if (partes.length < 3) erro('preciso do número, da base de origem e da base de destino')
        const numero = partes[0]
        const origem = Math.round(paraNumero(partes[1], 'base de origem'))
        const destino = Math.round(paraNumero(partes[2], 'base de destino'))
        if (origem < 2 || origem > 36 || destino < 2 || destino > 36) erro('as bases precisam estar entre 2 e 36')
        const v = parseInt(numero, origem)
        if (!Number.isFinite(v) || Number.isNaN(v)) erro(`"${numero}" não é um número válido na base ${origem}`)
        if (v > Number.MAX_SAFE_INTEGER) erro('esse número é grande demais para converter com precisão')
        const saida = v.toString(destino).toUpperCase()
        return resultado(
            `${numero.toUpperCase()} na base ${origem} é *${saida}* na base ${destino}.`,
            [`1) Leio ${numero.toUpperCase()} na base ${origem}`, `2) Em decimal isso vale ${n(v, 0)}`, `3) Reescrevo ${n(v, 0)} na base ${destino}: ${saida}`],
            'A base 10 é a nossa, a 2 é a do computador, a 16 aparece nas cores do site e nos endereços de memória.')
    }
})

// ════════════════════════════════════════════════════════════
//  17. MATEMÁTICA — progressões
// ════════════════════════════════════════════════════════════

T({
    chave: 'pa', sub: 'Matemática', emoji: '➕', titulo: 'PA: termo geral',
    descricao: 'Acha o enésimo termo de uma progressão aritmética',
    usage: '<primeiro termo> <razão> <posição>',
    examples: ['2 3 10 — começa em 2, soma 3, quero o 10º', '100 -5 12 — razão negativa', '1 2 50'],
    intro: 'Na progressão aritmética cada termo soma sempre a mesma razão. Eu acho o termo que você quiser.',
    calcular: (args) => {
        const [a1, r, pos] = numeros(args, 3, ['primeiro termo', 'razão', 'posição'])
        exigirPositivo(pos, 'posição')
        const an = a1 + (pos - 1) * r
        const primeiros = []
        for (let i = 1; i <= Math.min(8, pos); i++) primeiros.push(n(a1 + (i - 1) * r, 4))
        return resultado(
            `O ${n(pos, 0)}º termo é *${n(an, 6)}*.`,
            [`1) Fórmula: an = a1 + (n - 1) × razão`, `2) an = ${n(a1, 4)} + (${n(pos, 0)} - 1) × ${n(r, 4)}`, `3) an = ${n(a1, 4)} + ${n((pos - 1) * r, 4)} = ${n(an, 6)}`, `4) Começo da sequência: ${primeiros.join(', ')}${pos > 8 ? '…' : ''}`],
            r > 0 ? 'Razão positiva: a sequência só cresce.' : r < 0 ? 'Razão negativa: a sequência só diminui.' : 'Razão zero: todos os termos são iguais.')
    }
})

T({
    chave: 'pasoma', sub: 'Matemática', emoji: '🧮', titulo: 'PA: soma dos termos',
    descricao: 'Soma os n primeiros termos de uma PA',
    usage: '<primeiro termo> <razão> <quantidade>',
    examples: ['1 1 100 — a soma que Gauss fez na infância', '2 3 10', '5 -1 20'],
    intro: 'A soma de uma progressão aritmética: o truque é juntar o primeiro com o último termo.',
    calcular: (args) => {
        const [a1, r, qtd] = numeros(args, 3, ['primeiro termo', 'razão', 'quantidade'])
        exigirPositivo(qtd, 'quantidade de termos')
        if (qtd > 1e6) erro('no máximo 1 milhão de termos')
        const an = a1 + (qtd - 1) * r
        const soma = (a1 + an) * qtd / 2
        return resultado(
            `A soma dos ${n(qtd, 0)} termos é *${n(soma, 6)}*.`,
            [`1) Último termo: ${n(a1, 4)} + (${n(qtd, 0)} - 1) × ${n(r, 4)} = ${n(an, 6)}`, `2) Fórmula: soma = (primeiro + último) × quantidade ÷ 2`, `3) (${n(a1, 4)} + ${n(an, 6)}) × ${n(qtd, 0)} ÷ 2`, `4) Soma = ${n(soma, 6)}`],
            'Gauss descobriu isso aos 9 anos: somar 1 até 100 é o mesmo que 50 pares valendo 101 cada.')
    }
})

T({
    chave: 'pg', sub: 'Matemática', emoji: '✖️', titulo: 'PG: termo geral',
    descricao: 'Acha o enésimo termo de uma progressão geométrica',
    usage: '<primeiro termo> <razão> <posição>',
    examples: ['2 3 8 — dobra e triplica rápido', '1 2 20 — o grão de arroz do tabuleiro', '1000 0,5 10'],
    intro: 'Na progressão geométrica cada termo multiplica pela mesma razão. É o crescimento que explode.',
    calcular: (args) => {
        const [a1, q, pos] = numeros(args, 3, ['primeiro termo', 'razão', 'posição'])
        exigirPositivo(pos, 'posição')
        if (pos > 400) erro('posição máxima: 400')
        const an = a1 * Math.pow(q, pos - 1)
        const primeiros = []
        for (let i = 1; i <= Math.min(7, pos); i++) primeiros.push(n(a1 * Math.pow(q, i - 1), 4))
        return resultado(
            `O ${n(pos, 0)}º termo é *${n(an, 6)}*.`,
            [`1) Fórmula: an = a1 × razão^(n-1)`, `2) an = ${n(a1, 4)} × ${n(q, 4)}^${n(pos - 1, 0)}`, `3) ${n(q, 4)}^${n(pos - 1, 0)} = ${n(Math.pow(q, pos - 1), 6)}`, `4) an = ${n(an, 6)}`, `5) Começo: ${primeiros.join(', ')}${pos > 7 ? '…' : ''}`],
            Math.abs(q) > 1 ? 'Razão maior que 1: o crescimento é explosivo, muito mais rápido que a PA.' : 'Razão entre -1 e 1: os termos encolhem e se aproximam de zero.')
    }
})

T({
    chave: 'pgsoma', sub: 'Matemática', emoji: '📦', titulo: 'PG: soma dos termos',
    descricao: 'Soma os termos de uma PG, finita ou infinita',
    usage: '<primeiro termo> <razão> <quantidade>',
    examples: ['1 2 10 — soma dos dez primeiros', '3 0,5 8 — razão menor que 1', '1 2 64 — o tabuleiro de xadrez inteiro'],
    intro: 'Soma dos termos de uma progressão geométrica. Quando a razão é pequena, a soma até o infinito tem um valor finito.',
    calcular: (args) => {
        const [a1, q, qtd] = numeros(args, 3, ['primeiro termo', 'razão', 'quantidade'])
        exigirPositivo(qtd, 'quantidade de termos')
        if (qtd > 400) erro('no máximo 400 termos')
        const soma = q === 1 ? a1 * qtd : a1 * (Math.pow(q, qtd) - 1) / (q - 1)
        const extra = Math.abs(q) < 1 ? `Somando infinitos termos, o total se aproxima de ${n(a1 / (1 - q), 6)} e nunca passa disso.` : 'Com razão maior que 1, somar mais termos aumenta o total para sempre.'
        return resultado(
            `A soma dos ${n(qtd, 0)} primeiros termos é *${n(soma, 6)}*.`,
            q === 1 ? [`1) Com razão 1 todos os termos são iguais`, `2) Soma = ${n(a1, 4)} × ${n(qtd, 0)} = ${n(soma, 6)}`]
                : [`1) Fórmula: soma = a1 × (razão^n - 1) ÷ (razão - 1)`, `2) ${n(q, 4)}^${n(qtd, 0)} = ${n(Math.pow(q, qtd), 6)}`, `3) Soma = ${n(a1, 4)} × ${n(Math.pow(q, qtd) - 1, 6)} ÷ ${n(q - 1, 4)}`, `4) Soma = ${n(soma, 6)}`],
            extra)
    }
})

// ════════════════════════════════════════════════════════════
//  18. MATEMÁTICA — contagem e probabilidade
// ════════════════════════════════════════════════════════════

T({
    chave: 'fatorial', sub: 'Matemática', emoji: '❗', titulo: 'Fatorial',
    descricao: 'Calcula n! e explica para que ele serve',
    usage: '<número>',
    examples: ['5 — cinco fatorial', '10', '0 — o caso especial'],
    intro: 'O fatorial multiplica o número por todos os menores que ele. É a base de toda a contagem.',
    calcular: (args) => {
        const [x] = numeros(args, 1, ['número'])
        const k = Math.round(x)
        const f = fatorial(k)
        const serie = []
        for (let i = k; i >= 1; i--) serie.push(String(i))
        return resultado(
            `${k}! = *${n(f, 0)}*`,
            k === 0 ? ['Por convenção, 0! = 1: existe exatamente um jeito de não organizar nada.']
                : [`1) ${k}! = ${serie.slice(0, 12).join(' × ')}${serie.length > 12 ? ' × …' : ''}`, `2) Resultado: ${n(f, 0)}`],
            `Isso quer dizer que ${k} coisas diferentes podem ser colocadas em fila de ${n(f, 0)} maneiras.`)
    }
})

T({
    chave: 'anagramas', sub: 'Matemática', emoji: '🔤', titulo: 'Anagramas de uma palavra',
    descricao: 'Quantas palavras diferentes dá para montar',
    usage: '<palavra>',
    examples: ['AMOR — quatro letras diferentes', 'BANANA — com letras repetidas', 'MATEMATICA'],
    intro: 'Embaralhando as letras de uma palavra, quantas sequências diferentes aparecem? Letra repetida diminui a conta.',
    calcular: (args, texto) => {
        const palavra = String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase()
        if (!palavra) erro('mande uma palavra, só com letras')
        if (palavra.length > 20) erro('use uma palavra de até 20 letras')
        const cont = new Map()
        for (const c of palavra) cont.set(c, (cont.get(c) || 0) + 1)
        let total = fatorial(palavra.length)
        const repetidas = []
        for (const [c, q] of cont) if (q > 1) { total /= fatorial(q); repetidas.push(`${c} aparece ${q} vezes`) }
        return resultado(
            `${palavra} tem *${n(total, 0)}* anagramas.`,
            [
                `1) A palavra tem ${palavra.length} letras, então começo com ${palavra.length}! = ${n(fatorial(palavra.length), 0)}`,
                repetidas.length ? `2) Divido pelas repetições: ${repetidas.join(', ')}` : '2) Nenhuma letra se repete, então não divido nada',
                `3) Total de anagramas: ${n(total, 0)}`
            ],
            repetidas.length ? 'Letras repetidas trocam de lugar sem mudar a palavra — por isso a divisão.' : 'Sem letras repetidas, o total é o fatorial puro.')
    }
})

T({
    chave: 'arranjo', sub: 'Matemática', emoji: '🥇', titulo: 'Arranjo: quando a ordem importa',
    descricao: 'Quantas sequências de p entre n, com ordem',
    usage: '<n> <p>',
    examples: ['10 3 — pódio de 3 entre 10 corredores', '5 2', '26 4'],
    intro: 'Arranjo conta as possibilidades quando trocar a ordem gera um resultado diferente, como no pódio de uma corrida.',
    calcular: (args) => {
        const [N, p] = numeros(args, 2, ['total', 'quantos escolher'])
        const nn = Math.round(N), pp = Math.round(p)
        if (pp > nn) erro('não dá para escolher mais elementos do que existem')
        if (nn > 170) erro('use um total de até 170')
        let r = 1
        const termos = []
        for (let i = 0; i < pp; i++) { r *= (nn - i); termos.push(String(nn - i)) }
        return resultado(
            `Existem *${n(r, 0)}* arranjos possíveis.`,
            [`1) Fórmula: A = n! ÷ (n - p)!`, `2) Na prática, multiplico ${pp} números descendo a partir de ${nn}: ${termos.join(' × ')}`, `3) Total = ${n(r, 0)}`],
            `Se a ordem NÃO importasse, seriam só ${n(combinacoes(nn, pp), 0)} possibilidades — esse é o caso da combinação.`)
    }
})

T({
    chave: 'combinacao', sub: 'Matemática', emoji: '🎲', titulo: 'Combinação: quando a ordem não importa',
    descricao: 'Quantos grupos de p entre n, sem ordem',
    usage: '<n> <p>',
    examples: ['60 6 — os jogos possíveis da Mega-Sena', '10 3', '52 5 — mãos de pôquer'],
    intro: 'Combinação conta grupos: trocar a ordem dos escolhidos não cria um grupo novo.',
    calcular: (args) => {
        const [N, p] = numeros(args, 2, ['total', 'quantos escolher'])
        const nn = Math.round(N), pp = Math.round(p)
        if (pp > nn) erro('não dá para escolher mais elementos do que existem')
        if (nn > 1000) erro('use um total de até 1.000')
        const c = combinacoes(nn, pp)
        return resultado(
            `Existem *${n(c, 0)}* combinações possíveis.`,
            [`1) Fórmula: C = n! ÷ [p! × (n - p)!]`, `2) Com n = ${nn} e p = ${pp}`, `3) Total = ${n(c, 0)}`],
            `Em arranjo (com ordem) seriam ${n(c * fatorial(Math.min(pp, 170)), 0)} — a combinação divide pelas ${pp}! ordens repetidas.`)
    }
})

T({
    chave: 'probabilidade', sub: 'Matemática', emoji: '🍀', titulo: 'Probabilidade simples',
    descricao: 'Chance em % com casos favoráveis e possíveis',
    usage: '<casos favoráveis> <casos possíveis>',
    examples: ['1 6 — tirar o 5 num dado', '13 52 — tirar uma carta de copas', '4 10'],
    intro: 'Probabilidade é uma divisão: o que te interessa dividido por tudo que pode acontecer.',
    calcular: (args) => {
        const [fav, tot] = numeros(args, 2, ['casos favoráveis', 'casos possíveis'])
        exigirPositivo(tot, 'total de casos')
        if (fav < 0) erro('não existe quantidade negativa de casos favoráveis')
        if (fav > tot) erro('os casos favoráveis não podem passar do total')
        const p = fav / tot
        return resultado(
            `A chance é de *${n(p * 100, 4)}%*.`,
            [`1) Probabilidade = favoráveis ÷ possíveis = ${n(fav, 0)} ÷ ${n(tot, 0)}`, `2) Em decimal: ${n(p, 6)}`, `3) Em porcentagem: ${n(p * 100, 4)}%`, `4) Em fração: ${txtFracao(Math.round(fav), Math.round(tot))}`],
            `A chance de NÃO acontecer é ${n((1 - p) * 100, 4)}% — as duas sempre somam 100%.`)
    }
})

T({
    chave: 'probdados', sub: 'Matemática', emoji: '🎲', titulo: 'Probabilidade com dois dados',
    descricao: 'Chance de tirar certa soma com dois dados',
    usage: '<soma desejada>',
    examples: ['7 — a soma mais provável', '12 — a mais difícil', '4'],
    intro: 'Jogando dois dados comuns, nem toda soma tem a mesma chance. O 7 é o campeão, e eu mostro por quê.',
    calcular: (args) => {
        const [alvo] = numeros(args, 1, ['soma desejada'])
        const s = Math.round(alvo)
        if (s < 2 || s > 12) erro('com dois dados a soma só vai de 2 a 12')
        const jeitos = []
        for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) jeitos.push(`${a}+${b}`)
        const p = jeitos.length / 36
        return resultado(
            `A chance de somar ${s} é de *${n(p * 100, 4)}%*.`,
            [`1) Dois dados dão 6 × 6 = 36 resultados possíveis`, `2) Dão soma ${s}: ${jeitos.join(', ')}`, `3) São ${jeitos.length} jeitos em 36: ${txtFracao(jeitos.length, 36)} = ${n(p * 100, 4)}%`],
            s === 7 ? 'O 7 é a soma mais provável: seis combinações diferentes levam a ele.' : `Para comparar: a soma 7 tem 6 jeitos, a maior chance de todas.`)
    }
})

T({
    chave: 'probbinomial', sub: 'Matemática', emoji: '🎯', titulo: 'Probabilidade binomial',
    descricao: 'Chance de k acertos em n tentativas',
    usage: '<tentativas> <chance % por tentativa> <acertos desejados>',
    examples: ['10 50 5 — cinco caras em dez lançamentos', '5 20 2', '8 25 3'],
    intro: 'Repetindo a mesma tentativa várias vezes, qual a chance de acertar exatamente k vezes? Essa é a distribuição binomial.',
    calcular: (args) => {
        const [N, pc, k] = numeros(args, 3, ['tentativas', 'chance em %', 'acertos'])
        const nn = Math.round(N), kk = Math.round(k)
        exigirFaixa(pc, 0, 100, 'chance em porcentagem')
        if (nn < 1 || nn > 170) erro('use de 1 a 170 tentativas')
        if (kk < 0 || kk > nn) erro('os acertos precisam estar entre 0 e o número de tentativas')
        const p = pc / 100
        const c = combinacoes(nn, kk)
        const prob = c * Math.pow(p, kk) * Math.pow(1 - p, nn - kk)
        return resultado(
            `A chance de exatamente ${kk} acerto(s) em ${nn} tentativas é de *${n(prob * 100, 4)}%*.`,
            [
                `1) Maneiras de escolher quais ${kk} tentativas acertam: C(${nn}, ${kk}) = ${n(c, 0)}`,
                `2) Chance de acertar ${kk} vezes: ${n(p, 4)}^${kk} = ${n(Math.pow(p, kk), 8)}`,
                `3) Chance de errar as outras ${nn - kk}: ${n(1 - p, 4)}^${nn - kk} = ${n(Math.pow(1 - p, nn - kk), 8)}`,
                `4) Multiplico tudo: ${n(prob * 100, 4)}%`
            ],
            `Na média se espera ${n(nn * p, 2)} acerto(s) em ${nn} tentativas.`)
    }
})

T({
    chave: 'probmega', sub: 'Matemática', emoji: '🍀', titulo: 'Chance na Mega-Sena',
    descricao: 'Probabilidade real de acertar as seis dezenas',
    usage: '<quantas dezenas você joga>',
    examples: ['6 — a aposta simples', '10 — aposta com dez dezenas', '15'],
    intro: 'A Mega-Sena sorteia 6 dezenas entre 60. Eu calculo a chance verdadeira de acertar a sena com a quantidade de dezenas que você marcar.',
    calcular: (args) => {
        const [d] = numeros(args, 1, ['quantidade de dezenas'])
        const k = Math.round(d)
        if (k < 6 || k > 20) erro('a aposta vai de 6 a 20 dezenas')
        const universo = combinacoes(60, 6)
        const jogos = combinacoes(k, 6)
        const chance = jogos / universo
        return resultado(
            `Marcando ${k} dezenas, a chance de fazer a sena é de *1 em ${n(Math.round(1 / chance), 0)}*.`,
            [
                `1) Total de resultados possíveis: C(60, 6) = ${n(universo, 0)}`,
                `2) Um cartão com ${k} dezenas cobre C(${k}, 6) = ${n(jogos, 0)} jogo(s)`,
                `3) Chance = ${n(jogos, 0)} ÷ ${n(universo, 0)} = ${n(chance * 100, 8)}%`
            ],
            'Para comparação: a chance de ser atingido por um raio ao longo da vida é muito maior que a de ganhar na aposta simples.')
    }
})

// ════════════════════════════════════════════════════════════
//  19. FÍSICA — dados de referência
// ════════════════════════════════════════════════════════════

/** Gravidade usada nas contas de escola. A oficial é 9,80665 m/s². */
const G_TERRA = 9.8

/**
 * Constantes físicas. Os valores marcados como exatos foram FIXADOS na revisão
 * de 2019 do Sistema Internacional: em vez de medidos, eles agora definem as
 * unidades. Os demais são os valores recomendados do CODATA.
 */
const CONSTANTES = [
    { busca: ['luz', 'c'], nome: 'Velocidade da luz no vácuo', simbolo: 'c', valor: '299.792.458 m/s', nota: 'Exata por definição: o metro é definido a partir dela desde 1983.' },
    { busca: ['gravidade', 'g'], nome: 'Aceleração da gravidade padrão', simbolo: 'g', valor: '9,80665 m/s²', nota: 'Valor padrão ao nível do mar; na escola arredonda-se para 9,8 ou 10.' },
    { busca: ['gravitacao', 'newton', 'G'], nome: 'Constante da gravitação universal', simbolo: 'G', valor: '6,674 × 10^-11 N·m²/kg²', nota: 'A constante da fórmula da atração entre massas.' },
    { busca: ['planck', 'h'], nome: 'Constante de Planck', simbolo: 'h', valor: '6,62607015 × 10^-34 J·s', nota: 'Exata por definição; é ela que define o quilograma desde 2019.' },
    { busca: ['carga', 'eletron', 'e'], nome: 'Carga elementar', simbolo: 'e', valor: '1,602176634 × 10^-19 C', nota: 'Exata por definição; é a carga do próton (e o oposto da do elétron).' },
    { busca: ['boltzmann', 'k'], nome: 'Constante de Boltzmann', simbolo: 'k', valor: '1,380649 × 10^-23 J/K', nota: 'Exata por definição; liga temperatura e energia.' },
    { busca: ['avogadro', 'mol'], nome: 'Número de Avogadro', simbolo: 'NA', valor: '6,02214076 × 10^23 /mol', nota: 'Exato por definição: é o que define o mol desde 2019.' },
    { busca: ['gases', 'R'], nome: 'Constante universal dos gases', simbolo: 'R', valor: '8,314 J/(mol·K) ou 0,082 atm·L/(mol·K)', nota: 'A da equação PV = nRT. Escolha a versão conforme a unidade da pressão.' },
    { busca: ['massaeletron'], nome: 'Massa do elétron', simbolo: 'me', valor: '9,109 × 10^-31 kg', nota: 'Cerca de 1.836 vezes menor que a do próton.' },
    { busca: ['massaproton'], nome: 'Massa do próton', simbolo: 'mp', valor: '1,673 × 10^-27 kg', nota: 'Praticamente igual à do nêutron.' },
    { busca: ['coulomb', 'eletrostatica'], nome: 'Constante eletrostática no vácuo', simbolo: 'k0', valor: '8,99 × 10^9 N·m²/C²', nota: 'A constante da lei de Coulomb.' },
    { busca: ['atmosfera', 'pressao'], nome: 'Pressão atmosférica ao nível do mar', simbolo: '1 atm', valor: '101.325 Pa = 760 mmHg', nota: 'É o peso da coluna de ar acima de você.' },
    { busca: ['agua', 'densidade'], nome: 'Densidade da água a 4 °C', simbolo: 'd', valor: '1.000 kg/m³ = 1 g/cm³', nota: 'Por isso 1 litro de água pesa 1 quilo.' },
    { busca: ['calorespecifico'], nome: 'Calor específico da água líquida', simbolo: 'c', valor: '1 cal/(g·°C) = 4.186 J/(kg·°C)', nota: 'A água é teimosa: custa muito calor para mudar de temperatura.' },
    { busca: ['som'], nome: 'Velocidade do som no ar a 20 °C', simbolo: 'v', valor: '343 m/s', nota: 'Depende da temperatura: quanto mais quente o ar, mais rápido o som.' },
    { busca: ['zeroabsoluto'], nome: 'Zero absoluto', simbolo: '0 K', valor: '-273,15 °C', nota: 'A temperatura mais baixa possível; nunca foi alcançada de fato.' }
]

/** As sete unidades de base do SI. Todas as outras saem destas. */
const UNIDADES_SI = [
    { grandeza: 'comprimento', unidade: 'metro', simbolo: 'm', nota: 'Definido pela velocidade da luz.' },
    { grandeza: 'massa', unidade: 'quilograma', simbolo: 'kg', nota: 'Única unidade de base com prefixo no nome; hoje definida pela constante de Planck.' },
    { grandeza: 'tempo', unidade: 'segundo', simbolo: 's', nota: 'Definido pela vibração do átomo de césio-133.' },
    { grandeza: 'corrente elétrica', unidade: 'ampère', simbolo: 'A', nota: 'Definido pela carga elementar.' },
    { grandeza: 'temperatura', unidade: 'kelvin', simbolo: 'K', nota: 'Não se diz "grau kelvin": é só kelvin.' },
    { grandeza: 'quantidade de matéria', unidade: 'mol', simbolo: 'mol', nota: 'Definido pelo número de Avogadro.' },
    { grandeza: 'intensidade luminosa', unidade: 'candela', simbolo: 'cd', nota: 'Mede luz do ponto de vista do olho humano.' }
]

const PREFIXOS_SI = [
    ['tera', 'T', '10^12'], ['giga', 'G', '10^9'], ['mega', 'M', '10^6'], ['quilo', 'k', '10^3'],
    ['hecto', 'h', '10^2'], ['deca', 'da', '10^1'], ['deci', 'd', '10^-1'], ['centi', 'c', '10^-2'],
    ['mili', 'm', '10^-3'], ['micro', 'u', '10^-6'], ['nano', 'n', '10^-9'], ['pico', 'p', '10^-12']
]

/** Coeficientes de dilatação linear (por °C), valores didáticos. */
const DILATACAO = {
    aco: { nome: 'aço', alfa: 1.2e-5 },
    aluminio: { nome: 'alumínio', alfa: 2.4e-5 },
    cobre: { nome: 'cobre', alfa: 1.7e-5 },
    ferro: { nome: 'ferro', alfa: 1.2e-5 },
    vidro: { nome: 'vidro comum', alfa: 9e-6 },
    chumbo: { nome: 'chumbo', alfa: 2.9e-5 },
    concreto: { nome: 'concreto', alfa: 1.2e-5 },
    ouro: { nome: 'ouro', alfa: 1.4e-5 }
}

/** Calor específico em cal/(g·°C) — valores de tabela de ensino médio. */
const CALOR_ESPECIFICO = {
    agua: { nome: 'água', c: 1 },
    gelo: { nome: 'gelo', c: 0.5 },
    aluminio: { nome: 'alumínio', c: 0.22 },
    ferro: { nome: 'ferro', c: 0.11 },
    cobre: { nome: 'cobre', c: 0.093 },
    chumbo: { nome: 'chumbo', c: 0.031 },
    vidro: { nome: 'vidro', c: 0.2 },
    ar: { nome: 'ar', c: 0.24 }
}

/** Texto sem acento e em minúsculas, para procurar em tabela. */
function chaveBusca(txt) {
    return String(txt || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// ════════════════════════════════════════════════════════════
//  20. FÍSICA — cinemática
// ════════════════════════════════════════════════════════════

T({
    chave: 'vmedia', sub: 'Física', emoji: '🚗', titulo: 'Velocidade média',
    descricao: 'Velocidade média a partir da distância e do tempo',
    usage: '<distância em km> <tempo em horas>',
    examples: ['120 2 — 120 km em 2 horas', '450 5,5 — viagem longa', '3 0,25 — caminhada de 15 minutos'],
    intro: 'Velocidade média é distância dividida por tempo. Eu entrego em km/h e em m/s.',
    dica: 'Se o tempo estiver em minutos, divida por 60 antes: 30 min viram 0,5.',
    calcular: (args) => {
        const [d, t] = numeros(args, 2, ['distância', 'tempo'])
        exigirNaoZero(t, 'tempo')
        const v = d / t
        return resultado(
            `A velocidade média foi de *${n(v, 4)} km/h*.`,
            [`1) Velocidade média = distância ÷ tempo`, `2) ${n(d, 4)} km ÷ ${n(t, 4)} h = ${n(v, 4)} km/h`, `3) Em m/s: ${n(v, 4)} ÷ 3,6 = ${n(v / 3.6, 4)} m/s`],
            `Nessa média, em 1 hora se percorre ${n(v, 2)} km e em 10 minutos, ${n(v / 6, 2)} km.`)
    }
})

T({
    chave: 'mru', sub: 'Física', emoji: '➡️', titulo: 'Movimento uniforme (MRU)',
    descricao: 'Posição final com velocidade constante',
    usage: '<posição inicial> <velocidade> <tempo>',
    examples: ['0 20 5 — parte do zero a 20 m/s por 5 s', '100 -10 4 — indo para trás', '50 15 8'],
    intro: 'Sem aceleração, a posição cresce de forma constante: S = S0 + v × t.',
    calcular: (args) => {
        const [s0, v, t] = numeros(args, 3, ['posição inicial', 'velocidade', 'tempo'])
        const s = s0 + v * t
        return resultado(
            `A posição final é *${n(s, 4)}*.`,
            [`1) Fórmula do MRU: S = S0 + v × t`, `2) S = ${n(s0, 4)} + ${n(v, 4)} × ${n(t, 4)}`, `3) S = ${n(s0, 4)} + ${n(v * t, 4)} = ${n(s, 4)}`],
            `Deslocamento total: ${n(v * t, 4)}. ${v < 0 ? 'Velocidade negativa quer dizer que o corpo anda no sentido contrário ao positivo.' : 'A cada segundo o corpo anda os mesmos ' + n(v, 4) + '.'}`)
    }
})

T({
    chave: 'aceleracao', sub: 'Física', emoji: '📈', titulo: 'Aceleração média',
    descricao: 'Quanto a velocidade muda por segundo',
    usage: '<velocidade inicial> <velocidade final> <tempo>',
    examples: ['0 100 8 — de 0 a 100 km/h em 8 s', '20 5 3 — freando', '0 30 6'],
    intro: 'Aceleração é a mudança de velocidade dividida pelo tempo que ela levou para mudar.',
    dica: 'Se as velocidades estiverem em km/h, o resultado sai em km/h por segundo.',
    calcular: (args) => {
        const [v0, v1, t] = numeros(args, 3, ['velocidade inicial', 'velocidade final', 'tempo'])
        exigirNaoZero(t, 'tempo')
        const a = (v1 - v0) / t
        return resultado(
            `A aceleração média é *${n(a, 4)}* por segundo.`,
            [`1) Aceleração = (velocidade final - inicial) ÷ tempo`, `2) (${n(v1, 4)} - ${n(v0, 4)}) = ${n(v1 - v0, 4)}`, `3) ${n(v1 - v0, 4)} ÷ ${n(t, 4)} = ${n(a, 4)}`],
            a < 0 ? 'Aceleração negativa: o corpo está freando.' : `Em unidades de trânsito, isso é ${n(a / 3.6, 4)} m/s² se as velocidades estavam em km/h.`)
    }
})

T({
    chave: 'mruvvel', sub: 'Física', emoji: '🏎️', titulo: 'MRUV: velocidade no tempo',
    descricao: 'Velocidade depois de acelerar por certo tempo',
    usage: '<velocidade inicial> <aceleração> <tempo>',
    examples: ['0 2 10 — parte do repouso com 2 m/s²', '20 -4 3 — freando', '5 1,5 8'],
    intro: 'Com aceleração constante, a velocidade cresce em linha reta: v = v0 + a × t.',
    calcular: (args) => {
        const [v0, a, t] = numeros(args, 3, ['velocidade inicial', 'aceleração', 'tempo'])
        const v = v0 + a * t
        return resultado(
            `A velocidade depois de ${n(t, 4)} s é *${n(v, 4)} m/s* (${n(v * 3.6, 2)} km/h).`,
            [`1) Fórmula: v = v0 + a × t`, `2) v = ${n(v0, 4)} + ${n(a, 4)} × ${n(t, 4)}`, `3) v = ${n(v0, 4)} + ${n(a * t, 4)} = ${n(v, 4)} m/s`],
            v < 0 ? 'A velocidade ficou negativa: o corpo parou e voltou no sentido contrário.' : `A cada segundo a velocidade muda ${n(a, 4)} m/s.`)
    }
})

T({
    chave: 'mruvpos', sub: 'Física', emoji: '🛣️', titulo: 'MRUV: posição no tempo',
    descricao: 'Onde o corpo está depois de acelerar',
    usage: '<posição inicial> <velocidade inicial> <aceleração> <tempo>',
    examples: ['0 0 2 5 — parte parado com 2 m/s² por 5 s', '10 20 -2 4', '0 15 1,5 6'],
    intro: 'A equação horária do MRUV: S = S0 + v0 × t + (a × t²) ÷ 2.',
    calcular: (args) => {
        const [s0, v0, a, t] = numeros(args, 4, ['posição inicial', 'velocidade inicial', 'aceleração', 'tempo'])
        const s = s0 + v0 * t + a * t * t / 2
        return resultado(
            `A posição depois de ${n(t, 4)} s é *${n(s, 4)}*.`,
            [`1) S = S0 + v0×t + (a×t²)÷2`, `2) v0×t = ${n(v0, 4)} × ${n(t, 4)} = ${n(v0 * t, 4)}`, `3) (a×t²)÷2 = (${n(a, 4)} × ${n(t * t, 4)}) ÷ 2 = ${n(a * t * t / 2, 4)}`, `4) S = ${n(s0, 4)} + ${n(v0 * t, 4)} + ${n(a * t * t / 2, 4)} = ${n(s, 4)}`],
            `A velocidade nesse instante é ${n(v0 + a * t, 4)} m/s e o deslocamento total foi ${n(s - s0, 4)}.`)
    }
})

T({
    chave: 'torricelli', sub: 'Física', emoji: '🎯', titulo: 'Equação de Torricelli',
    descricao: 'Velocidade final sem precisar saber o tempo',
    usage: '<velocidade inicial> <aceleração> <distância>',
    examples: ['0 2 100 — parte do repouso e anda 100 m', '30 -5 50 — freando por 50 m', '10 3 45'],
    intro: 'Quando o tempo não interessa, Torricelli resolve: v² = v0² + 2 × a × distância.',
    calcular: (args) => {
        const [v0, a, d] = numeros(args, 3, ['velocidade inicial', 'aceleração', 'distância'])
        const v2 = v0 * v0 + 2 * a * d
        if (v2 < 0) erro('com esses valores o corpo para antes de percorrer toda essa distância')
        const v = Math.sqrt(v2)
        return resultado(
            `A velocidade final é *${n(v, 4)} m/s* (${n(v * 3.6, 2)} km/h).`,
            [`1) v² = v0² + 2 × a × d`, `2) v² = ${n(v0 * v0, 4)} + 2 × ${n(a, 4)} × ${n(d, 4)}`, `3) v² = ${n(v2, 4)}`, `4) v = raiz de ${n(v2, 4)} = ${n(v, 4)} m/s`],
            a < 0 ? `Em freada, a distância até parar de vez seria ${n(v0 * v0 / (2 * Math.abs(a)), 2)} m.` : 'Torricelli é o atalho: entra com distância e sai com velocidade, sem o tempo no meio.')
    }
})

T({
    chave: 'quedalivre', sub: 'Física', emoji: '🪂', titulo: 'Queda livre',
    descricao: 'Tempo de queda e velocidade ao chegar no chão',
    usage: '<altura em metros>',
    examples: ['20 — prédio de 7 andares', '1,5 — da altura da mão', '100'],
    intro: 'Soltando um objeto do repouso, quanto tempo ele leva para cair e com que velocidade chega? Uso g = 9,8 m/s² e desprezo o ar.',
    calcular: (args) => {
        const [h] = numeros(args, 1, ['altura'])
        exigirPositivo(h, 'altura')
        const t = Math.sqrt(2 * h / G_TERRA)
        const v = G_TERRA * t
        return resultado(
            `A queda dura *${n(t, 4)} s* e o objeto chega a *${n(v, 4)} m/s* (${n(v * 3.6, 2)} km/h).`,
            [`1) h = (g × t²) ÷ 2, então t = raiz de (2h ÷ g)`, `2) t = raiz de (2 × ${n(h, 4)} ÷ 9,8) = ${n(t, 4)} s`, `3) v = g × t = 9,8 × ${n(t, 4)} = ${n(v, 4)} m/s`],
            'Sem ar, uma pena e um martelo caem juntos — foi o experimento feito na Lua em 1971.')
    }
})

T({
    chave: 'lancvertical', sub: 'Física', emoji: '🚀', titulo: 'Lançamento vertical',
    descricao: 'Altura máxima e tempo de um objeto jogado pra cima',
    usage: '<velocidade inicial em m/s>',
    examples: ['20 — jogando para cima a 20 m/s', '9,8', '5'],
    intro: 'Jogando algo para cima, até onde sobe e quanto tempo fica no ar? Subida e descida levam o mesmo tempo.',
    calcular: (args) => {
        const [v0] = numeros(args, 1, ['velocidade inicial'])
        exigirPositivo(v0, 'velocidade inicial')
        const tSubida = v0 / G_TERRA
        const hMax = v0 * v0 / (2 * G_TERRA)
        return resultado(
            `Sobe *${n(hMax, 4)} m* e fica *${n(2 * tSubida, 4)} s* no ar.`,
            [`1) No ponto mais alto a velocidade é zero`, `2) Tempo de subida = v0 ÷ g = ${n(v0, 4)} ÷ 9,8 = ${n(tSubida, 4)} s`, `3) Altura máxima = v0² ÷ (2g) = ${n(v0 * v0, 4)} ÷ 19,6 = ${n(hMax, 4)} m`, `4) Tempo total no ar = 2 × ${n(tSubida, 4)} = ${n(2 * tSubida, 4)} s`],
            `O objeto volta à sua mão com a mesma velocidade de ${n(v0, 4)} m/s, só que para baixo.`)
    }
})

T({
    chave: 'lancobliquo', sub: 'Física', emoji: '⚽', titulo: 'Lançamento oblíquo',
    descricao: 'Alcance e altura de um chute ou arremesso',
    usage: '<velocidade em m/s> <ângulo em graus>',
    examples: ['20 45 — o ângulo de maior alcance', '15 30', '25 60'],
    intro: 'Chute de bola, tiro de canhão, arremesso: eu calculo onde cai, até onde sobe e quanto tempo voa.',
    calcular: (args) => {
        const [v0, ang] = numeros(args, 2, ['velocidade', 'ângulo'])
        exigirPositivo(v0, 'velocidade')
        exigirFaixa(ang, 0, 90, 'ângulo')
        const rad = grausParaRad(ang)
        const vx = v0 * Math.cos(rad), vy = v0 * Math.sin(rad)
        const tVoo = 2 * vy / G_TERRA
        const alcance = vx * tVoo
        const hMax = vy * vy / (2 * G_TERRA)
        return resultado(
            `Cai a *${n(alcance, 4)} m* de distância, subindo até *${n(hMax, 4)} m*.`,
            [
                `1) Separo a velocidade: horizontal ${n(vx, 4)} m/s e vertical ${n(vy, 4)} m/s`,
                `2) Tempo no ar = 2 × ${n(vy, 4)} ÷ 9,8 = ${n(tVoo, 4)} s`,
                `3) Alcance = ${n(vx, 4)} × ${n(tVoo, 4)} = ${n(alcance, 4)} m`,
                `4) Altura máxima = ${n(vy * vy, 4)} ÷ 19,6 = ${n(hMax, 4)} m`
            ],
            Math.abs(ang - 45) < 0.001 ? '45° é o ângulo de maior alcance possível, quando se ignora o ar.' : `Com 45° o alcance seria ${n(v0 * v0 / G_TERRA, 4)} m — o máximo para essa velocidade.`)
    }
})

T({
    chave: 'mcu', sub: 'Física', emoji: '🎡', titulo: 'Movimento circular',
    descricao: 'Período, frequência e velocidade numa volta',
    usage: '<raio em metros> <período em segundos>',
    examples: ['2 4 — roda de raio 2 m girando a cada 4 s', '0,33 0,5 — roda de bicicleta', '6371000 86400 — a Terra girando'],
    intro: 'Tudo que gira: eu calculo quantas voltas por segundo, a velocidade angular e a velocidade de um ponto na borda.',
    calcular: (args) => {
        const [r, T2] = numeros(args, 2, ['raio', 'período'])
        exigirPositivo(r, 'raio'); exigirPositivo(T2, 'período')
        const f = 1 / T2
        const w = 2 * PI / T2
        const v = w * r
        return resultado(
            `Um ponto na borda anda a *${n(v, 4)} m/s* (${n(v * 3.6, 2)} km/h).`,
            [`1) Frequência = 1 ÷ período = 1 ÷ ${n(T2, 4)} = ${n(f, 6)} voltas por segundo`, `2) Velocidade angular = 2 × pi ÷ período = ${n(w, 6)} rad/s`, `3) Velocidade na borda = velocidade angular × raio = ${n(w, 6)} × ${n(r, 4)} = ${n(v, 4)} m/s`],
            `Isso dá ${n(f * 60, 2)} rotações por minuto (RPM). A aceleração centrípeta é ${n(v * v / r, 4)} m/s².`)
    }
})

T({
    chave: 'acentripeta', sub: 'Física', emoji: '🌀', titulo: 'Aceleração centrípeta',
    descricao: 'A aceleração que empurra para o centro da curva',
    usage: '<velocidade em m/s> <raio da curva>',
    examples: ['20 50 — carro a 72 km/h numa curva de 50 m', '10 5', '30 100'],
    intro: 'Mesmo com velocidade constante, quem faz curva está acelerando: a direção muda, e isso já é aceleração.',
    calcular: (args) => {
        const [v, r] = numeros(args, 2, ['velocidade', 'raio'])
        exigirPositivo(r, 'raio')
        const a = v * v / r
        return resultado(
            `A aceleração centrípeta é *${n(a, 4)} m/s²*.`,
            [`1) Fórmula: a = v² ÷ raio`, `2) ${n(v, 4)}² = ${n(v * v, 4)}`, `3) ${n(v * v, 4)} ÷ ${n(r, 4)} = ${n(a, 4)} m/s²`],
            `Isso é ${n(a / G_TERRA, 3)} vez(es) a gravidade. Num carro de 1.000 kg, o atrito precisa segurar ${n(1000 * a, 0)} N.`)
    }
})

// ════════════════════════════════════════════════════════════
//  21. FÍSICA — dinâmica
// ════════════════════════════════════════════════════════════

T({
    chave: 'forcaresultante', sub: 'Física', emoji: '💪', titulo: 'Segunda lei de Newton',
    descricao: 'Força resultante a partir da massa e aceleração',
    usage: '<massa em kg> <aceleração em m/s²>',
    examples: ['1000 2 — carro de 1 tonelada acelerando', '70 1,5', '0,145 300 — bola de beisebol na tacada'],
    intro: 'Força é massa vezes aceleração. É a lei que explica por que caminhão demora mais para arrancar.',
    calcular: (args) => {
        const [m, a] = numeros(args, 2, ['massa', 'aceleração'])
        const f = m * a
        return resultado(
            `A força resultante é *${n(f, 4)} N*.`,
            [`1) Fórmula: F = massa × aceleração`, `2) F = ${n(m, 4)} kg × ${n(a, 4)} m/s²`, `3) F = ${n(f, 4)} newtons`],
            `Para comparar: o peso desse mesmo corpo na Terra é ${n(m * G_TERRA, 2)} N.`)
    }
})

T({
    chave: 'peso', sub: 'Física', emoji: '⚖️', titulo: 'Peso e massa',
    descricao: 'Peso em newtons e em outros mundos',
    usage: '<massa em kg> [gravidade]',
    examples: ['70 — uma pessoa de 70 kg na Terra', '70 1,62 — a mesma pessoa na Lua', '5 3,71 — em Marte'],
    intro: 'Massa é quanta matéria você tem; peso é a força com que o planeta te puxa. Na Lua a massa é a mesma, o peso não.',
    dica: 'Gravidades: Terra 9,8, Lua 1,62, Marte 3,71, Júpiter 24,8.',
    calcular: (args) => {
        const vs = numeros(args, 1, ['massa'])
        const m = vs[0]
        const g = vs.length > 1 ? vs[1] : G_TERRA
        exigirPositivo(m, 'massa')
        const p = m * g
        return resultado(
            `O peso é *${n(p, 4)} N*.`,
            [`1) Fórmula: P = massa × gravidade`, `2) P = ${n(m, 4)} kg × ${n(g, 4)} m/s²`, `3) P = ${n(p, 4)} newtons`],
            `Na Lua (g = 1,62) essa massa pesaria ${n(m * 1.62, 2)} N, e em Marte (g = 3,71), ${n(m * 3.71, 2)} N. A massa continua ${n(m, 2)} kg em todo lugar.`)
    }
})

T({
    chave: 'atrito', sub: 'Física', emoji: '🧱', titulo: 'Força de atrito',
    descricao: 'Atrito a partir do coeficiente e da massa',
    usage: '<coeficiente de atrito> <massa em kg>',
    examples: ['0,3 50 — caixa de 50 kg no chão', '0,8 1000 — pneu no asfalto seco', '0,1 20 — superfície escorregadia'],
    intro: 'Atrito é a força que segura o movimento. Ela depende do quanto o corpo aperta o chão e do par de materiais.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['coeficiente de atrito', 'massa'])
        const [mu, m] = vs
        const g = vs.length > 2 ? vs[2] : G_TERRA
        exigirPositivo(m, 'massa')
        const normal = m * g
        const f = mu * normal
        return resultado(
            `A força de atrito é *${n(f, 4)} N*.`,
            [`1) Força normal = massa × gravidade = ${n(m, 4)} × ${n(g, 4)} = ${n(normal, 4)} N`, `2) Atrito = coeficiente × normal = ${n(mu, 4)} × ${n(normal, 4)}`, `3) Atrito = ${n(f, 4)} N`],
            `Para o corpo começar a andar é preciso empurrar com mais de ${n(f, 2)} N. Repare que a área de contato não entra na conta.`)
    }
})

T({
    chave: 'planoinclinado', sub: 'Física', emoji: '⛰️', titulo: 'Plano inclinado',
    descricao: 'Forças e aceleração numa rampa sem atrito',
    usage: '<massa em kg> <ângulo da rampa>',
    examples: ['10 30 — caixa de 10 kg numa rampa de 30 graus', '50 15', '2 45'],
    intro: 'Numa rampa, o peso se divide em duas partes: uma empurra o corpo ladeira abaixo, a outra aperta a rampa.',
    calcular: (args) => {
        const [m, ang] = numeros(args, 2, ['massa', 'ângulo'])
        exigirPositivo(m, 'massa')
        exigirFaixa(ang, 0, 90, 'ângulo')
        const rad = grausParaRad(ang)
        const p = m * G_TERRA
        const paralela = p * Math.sin(rad)
        const normal = p * Math.cos(rad)
        return resultado(
            `A rampa puxa o corpo com *${n(paralela, 4)} N* e ele desce acelerando a *${n(G_TERRA * Math.sin(rad), 4)} m/s²*.`,
            [
                `1) Peso total = ${n(m, 4)} × 9,8 = ${n(p, 4)} N`,
                `2) Componente que desce a rampa = peso × sen ${n(ang, 2)}° = ${n(paralela, 4)} N`,
                `3) Componente que aperta a rampa (normal) = peso × cos ${n(ang, 2)}° = ${n(normal, 4)} N`,
                `4) Sem atrito, a aceleração é g × sen ${n(ang, 2)}° = ${n(G_TERRA * Math.sin(rad), 4)} m/s²`
            ],
            `Para o corpo não escorregar, o atrito precisaria de coeficiente mínimo de ${n(Math.tan(rad), 4)}.`)
    }
})

T({
    chave: 'hooke', sub: 'Física', emoji: '🪀', titulo: 'Lei de Hooke (mola)',
    descricao: 'Força de uma mola esticada ou comprimida',
    usage: '<constante da mola em N/m> <deformação em metros>',
    examples: ['200 0,1 — mola de 200 N/m esticada 10 cm', '50 0,25', '1000 0,02'],
    intro: 'Quanto mais você estica a mola, mais ela puxa de volta — e na mesma proporção.',
    calcular: (args) => {
        const [k, x] = numeros(args, 2, ['constante da mola', 'deformação'])
        const f = k * x
        return resultado(
            `A mola faz uma força de *${n(f, 4)} N*.`,
            [`1) Fórmula: F = k × x`, `2) F = ${n(k, 4)} N/m × ${n(x, 4)} m`, `3) F = ${n(f, 4)} N`],
            `A energia guardada nessa mola é ${n(k * x * x / 2, 4)} J. Dobrar a deformação dobra a força, mas quadruplica a energia.`)
    }
})

T({
    chave: 'elevador', sub: 'Física', emoji: '🛗', titulo: 'Peso aparente no elevador',
    descricao: 'Quanto a balança marca num elevador acelerando',
    usage: '<massa em kg> <aceleração do elevador>',
    examples: ['70 2 — subindo acelerando a 2 m/s²', '70 -2 — descendo acelerando', '80 0 — parado ou em velocidade constante'],
    intro: 'Aquela sensação de leveza ou peso no elevador tem conta: a balança marca a força normal, não a massa.',
    dica: 'Aceleração positiva é para cima; negativa, para baixo.',
    calcular: (args) => {
        const [m, a] = numeros(args, 2, ['massa', 'aceleração do elevador'])
        exigirPositivo(m, 'massa')
        const normal = m * (G_TERRA + a)
        if (normal < 0) erro('com essa aceleração para baixo o corpo se solta do chão do elevador')
        return resultado(
            `A balança marcaria *${n(normal / G_TERRA, 3)} kg*, ou seja, ${n(normal, 2)} N.`,
            [`1) Normal = massa × (g + aceleração)`, `2) N = ${n(m, 4)} × (9,8 ${a >= 0 ? '+' : '-'} ${n(Math.abs(a), 4)})`, `3) N = ${n(normal, 4)} N`, `4) Dividindo por 9,8 para ler em quilos: ${n(normal / G_TERRA, 3)} kg`],
            a > 0 ? 'Subindo acelerando você se sente mais pesado.' : a < 0 ? 'Descendo acelerando você se sente mais leve; se a aceleração fosse 9,8 você flutuaria.' : 'Sem aceleração a balança marca a massa de verdade — velocidade constante não muda nada.')
    }
})

T({
    chave: 'quantmovimento', sub: 'Física', emoji: '🎳', titulo: 'Quantidade de movimento e impulso',
    descricao: 'Momento linear e o impulso para parar o corpo',
    usage: '<massa em kg> <velocidade em m/s>',
    examples: ['1000 20 — carro de 1 t a 72 km/h', '0,145 40 — bola de beisebol', '70 5'],
    intro: 'Quantidade de movimento é massa vezes velocidade. Para mudá-la é preciso força agindo por algum tempo — isso é o impulso.',
    calcular: (args) => {
        const [m, v] = numeros(args, 2, ['massa', 'velocidade'])
        const q = m * v
        return resultado(
            `A quantidade de movimento é *${n(q, 4)} kg·m/s*.`,
            [`1) Fórmula: Q = massa × velocidade`, `2) Q = ${n(m, 4)} × ${n(v, 4)} = ${n(q, 4)} kg·m/s`, `3) Para parar esse corpo é preciso um impulso de mesmo tamanho: ${n(Math.abs(q), 4)} N·s`],
            `Parando em 0,1 s a força seria ${n(Math.abs(q) / 0.1, 0)} N; parando em 1 s, só ${n(Math.abs(q), 0)} N. É por isso que o airbag existe: ele estica o tempo da parada.`)
    }
})

T({
    chave: 'colisaoinelastica', sub: 'Física', emoji: '💥', titulo: 'Colisão com os corpos grudados',
    descricao: 'Velocidade final quando dois corpos se juntam',
    usage: '<massa 1> <velocidade 1> <massa 2> <velocidade 2>',
    examples: ['1000 20 1500 0 — carro batendo em outro parado', '2 5 3 -2 — batendo de frente', '60 4 40 0'],
    intro: 'Quando dois corpos batem e seguem grudados, a quantidade de movimento total se conserva — mas parte da energia vira som e amassado.',
    calcular: (args) => {
        const [m1, v1, m2, v2] = numeros(args, 4, ['massa 1', 'velocidade 1', 'massa 2', 'velocidade 2'])
        exigirPositivo(m1 + m2, 'soma das massas')
        const vf = (m1 * v1 + m2 * v2) / (m1 + m2)
        const ecAntes = m1 * v1 * v1 / 2 + m2 * v2 * v2 / 2
        const ecDepois = (m1 + m2) * vf * vf / 2
        return resultado(
            `Depois da batida os dois seguem juntos a *${n(vf, 4)} m/s*.`,
            [
                `1) Quantidade de movimento antes: ${n(m1, 2)}×${n(v1, 2)} + ${n(m2, 2)}×${n(v2, 2)} = ${n(m1 * v1 + m2 * v2, 4)}`,
                `2) Massa total depois: ${n(m1 + m2, 4)} kg`,
                `3) Velocidade final = ${n(m1 * v1 + m2 * v2, 4)} ÷ ${n(m1 + m2, 4)} = ${n(vf, 4)} m/s`
            ],
            `Energia cinética antes: ${n(ecAntes, 2)} J; depois: ${n(ecDepois, 2)} J. Os ${n(ecAntes - ecDepois, 2)} J que sumiram viraram deformação, calor e barulho.`)
    }
})

// ════════════════════════════════════════════════════════════
//  22. FÍSICA — trabalho, energia e potência
// ════════════════════════════════════════════════════════════

T({
    chave: 'trabalho', sub: 'Física', emoji: '🏋️', titulo: 'Trabalho de uma força',
    descricao: 'Energia gasta ao empurrar algo por uma distância',
    usage: '<força em N> <distância em m> [ângulo]',
    examples: ['50 10 — empurrando com 50 N por 10 m', '100 5 60 — força inclinada 60 graus', '20 3'],
    intro: 'Em física, trabalho é força vezes distância na direção do movimento. Segurar peso parado não dá trabalho nenhum.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['força', 'distância'])
        const [f, d] = vs
        const ang = vs.length > 2 ? vs[2] : 0
        const w = f * d * Math.cos(grausParaRad(ang))
        return resultado(
            `O trabalho é de *${n(w, 4)} joules*.`,
            [`1) Fórmula: W = força × distância × cosseno do ângulo`, ang ? `2) cos ${n(ang, 2)}° = ${n(Math.cos(grausParaRad(ang)), 6)}` : '2) Força na mesma direção do movimento: cosseno vale 1', `3) W = ${n(f, 4)} × ${n(d, 4)}${ang ? ' × ' + n(Math.cos(grausParaRad(ang)), 4) : ''} = ${n(w, 4)} J`],
            `Isso equivale a ${n(w / 4.186, 2)} calorias. Uma força perpendicular ao movimento (90°) não faz trabalho nenhum.`)
    }
})

T({
    chave: 'energiacinetica', sub: 'Física', emoji: '🏃', titulo: 'Energia cinética',
    descricao: 'Energia guardada no movimento de um corpo',
    usage: '<massa em kg> <velocidade em m/s>',
    examples: ['1000 20 — carro de 1 t a 72 km/h', '70 8 — pessoa correndo', '0,05 300 — projétil'],
    intro: 'Todo corpo em movimento carrega energia. E ela cresce com o QUADRADO da velocidade — o dobro de velocidade é o quádruplo de energia.',
    calcular: (args) => {
        const [m, v] = numeros(args, 2, ['massa', 'velocidade'])
        const ec = m * v * v / 2
        return resultado(
            `A energia cinética é *${n(ec, 4)} joules*.`,
            [`1) Fórmula: Ec = (massa × velocidade²) ÷ 2`, `2) ${n(v, 4)}² = ${n(v * v, 4)}`, `3) Ec = (${n(m, 4)} × ${n(v * v, 4)}) ÷ 2 = ${n(ec, 4)} J`],
            `A ${n(v * 2, 2)} m/s (o dobro) a energia seria ${n(ec * 4, 2)} J — quatro vezes maior. É por isso que velocidade mata no trânsito.`)
    }
})

T({
    chave: 'energiapotencial', sub: 'Física', emoji: '🏔️', titulo: 'Energia potencial gravitacional',
    descricao: 'Energia guardada pela altura de um corpo',
    usage: '<massa em kg> <altura em m>',
    examples: ['2 10 — 2 kg a 10 m de altura', '70 3', '1000 50 — água numa caixa alta'],
    intro: 'Levantar algo guarda energia. Quando você solta, essa energia volta como movimento.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['massa', 'altura'])
        const [m, h] = vs
        const g = vs.length > 2 ? vs[2] : G_TERRA
        const ep = m * g * h
        return resultado(
            `A energia potencial é *${n(ep, 4)} joules*.`,
            [`1) Fórmula: Ep = massa × gravidade × altura`, `2) Ep = ${n(m, 4)} × ${n(g, 4)} × ${n(h, 4)}`, `3) Ep = ${n(ep, 4)} J`],
            `Se soltar, o corpo chega ao chão a ${n(Math.sqrt(2 * g * Math.abs(h)), 3)} m/s — toda a energia de altura vira movimento.`)
    }
})

T({
    chave: 'energiaelastica', sub: 'Física', emoji: '🎯', titulo: 'Energia elástica da mola',
    descricao: 'Energia guardada numa mola deformada',
    usage: '<constante da mola> <deformação em m>',
    examples: ['200 0,1 — mola de 200 N/m esticada 10 cm', '500 0,05', '80 0,3'],
    intro: 'Mola esticada é energia guardada, pronta para virar movimento. É o princípio do estilingue e do arco.',
    calcular: (args) => {
        const [k, x] = numeros(args, 2, ['constante da mola', 'deformação'])
        const e = k * x * x / 2
        return resultado(
            `A mola guarda *${n(e, 6)} joules*.`,
            [`1) Fórmula: E = (k × x²) ÷ 2`, `2) ${n(x, 4)}² = ${n(x * x, 8)}`, `3) E = (${n(k, 4)} × ${n(x * x, 8)}) ÷ 2 = ${n(e, 6)} J`],
            `Essa energia lançaria um corpo de 100 g a ${n(Math.sqrt(2 * e / 0.1), 3)} m/s. Dobrar a deformação guarda quatro vezes mais energia.`)
    }
})

T({
    chave: 'potenciamecanica', sub: 'Física', emoji: '⚙️', titulo: 'Potência mecânica',
    descricao: 'Energia por segundo, em watts e em cavalos',
    usage: '<trabalho em joules> <tempo em segundos>',
    examples: ['1000 5 — 1.000 J em 5 s', '50000 10', '735,5 1 — exatamente 1 cavalo-vapor'],
    intro: 'Potência é a pressa da energia: a mesma energia gasta em menos tempo significa mais potência.',
    calcular: (args) => {
        const [w, t] = numeros(args, 2, ['trabalho', 'tempo'])
        exigirNaoZero(t, 'tempo')
        const p = w / t
        return resultado(
            `A potência é de *${n(p, 4)} watts*.`,
            [`1) Fórmula: potência = trabalho ÷ tempo`, `2) P = ${n(w, 4)} J ÷ ${n(t, 4)} s`, `3) P = ${n(p, 4)} W`],
            `Isso equivale a ${n(p / 735.5, 3)} cavalo(s)-vapor (cv) e, ligado por uma hora, consumiria ${n(p / 1000, 4)} kWh.`)
    }
})

T({
    chave: 'rendimento', sub: 'Física', emoji: '♻️', titulo: 'Rendimento de uma máquina',
    descricao: 'Quanto da energia vira trabalho útil, em %',
    usage: '<energia útil> <energia total gasta>',
    examples: ['300 1000 — motor que aproveita 300 de 1000', '45 60', '2 10'],
    intro: 'Nenhuma máquina aproveita tudo: parte da energia sempre vira calor. O rendimento diz quanto sobrou de útil.',
    calcular: (args) => {
        const [util, total] = numeros(args, 2, ['energia útil', 'energia total'])
        exigirPositivo(total, 'energia total')
        if (util > total) erro('a energia útil não pode ser maior que a energia gasta — isso seria criar energia do nada')
        const r = util / total
        return resultado(
            `O rendimento é de *${n(r * 100, 3)}%*.`,
            [`1) Rendimento = energia útil ÷ energia total`, `2) ${n(util, 4)} ÷ ${n(total, 4)} = ${n(r, 6)}`, `3) Em porcentagem: ${n(r * 100, 3)}%`],
            `Os outros ${n(total - util, 4)} (${n((1 - r) * 100, 2)}%) viraram calor e barulho. Motor de carro a gasolina fica perto de 25% a 30%.`)
    }
})

// ════════════════════════════════════════════════════════════
//  23. FÍSICA — hidrostática
// ════════════════════════════════════════════════════════════

T({
    chave: 'densidade', sub: 'Física', emoji: '🪨', titulo: 'Densidade',
    descricao: 'Densidade em g/cm³ e se o corpo boia na água',
    usage: '<massa em g> <volume em cm³>',
    examples: ['200 100 — 200 g em 100 cm³', '27 10 — alumínio', '19,3 1 — ouro puro'],
    intro: 'Densidade diz o quanto a matéria está apertada. É o que decide se algo boia ou afunda.',
    calcular: (args) => {
        const [m, v] = numeros(args, 2, ['massa', 'volume'])
        exigirPositivo(v, 'volume')
        const d = m / v
        return resultado(
            `A densidade é *${n(d, 4)} g/cm³* (${n(d * 1000, 2)} kg/m³).`,
            [`1) Densidade = massa ÷ volume`, `2) ${n(m, 4)} g ÷ ${n(v, 4)} cm³`, `3) Densidade = ${n(d, 4)} g/cm³`],
            d < 1 ? 'Menos denso que a água (1 g/cm³): esse material boia.' : d > 1 ? 'Mais denso que a água (1 g/cm³): esse material afunda.' : 'Densidade igual à da água: fica boiando entre duas águas.')
    }
})

T({
    chave: 'pressao', sub: 'Física', emoji: '📌', titulo: 'Pressão',
    descricao: 'Pressão a partir da força e da área',
    usage: '<força em N> <área em m²>',
    examples: ['700 0,03 — pessoa em pé sobre os dois pés', '700 0,000001 — a mesma pessoa num salto agulha', '1000 2'],
    intro: 'A mesma força espalhada numa área grande faz pouca pressão; concentrada num ponto, fura.',
    calcular: (args) => {
        const [f, a] = numeros(args, 2, ['força', 'área'])
        exigirPositivo(a, 'área')
        const p = f / a
        return resultado(
            `A pressão é de *${n(p, 4)} Pa*.`,
            [`1) Fórmula: pressão = força ÷ área`, `2) ${n(f, 4)} N ÷ ${n(a, 6)} m²`, `3) Pressão = ${n(p, 4)} pascals`],
            `Isso equivale a ${n(p / 101325, 4)} atmosfera(s). É por isso que faca afiada corta melhor: mesma força, área muito menor.`)
    }
})

T({
    chave: 'pressaohidrostatica', sub: 'Física', emoji: '🤿', titulo: 'Pressão dentro da água',
    descricao: 'Pressão a certa profundidade, com e sem o ar',
    usage: '<profundidade em m> [densidade do líquido em kg/m³]',
    examples: ['10 — dez metros de água', '30 — mergulho profundo', '2 13600 — coluna de mercúrio'],
    intro: 'Cada 10 metros de água somam mais ou menos uma atmosfera de pressão. Por isso dói o ouvido no fundo da piscina.',
    calcular: (args) => {
        const vs = numeros(args, 1, ['profundidade'])
        const h = vs[0]
        const dens = vs.length > 1 ? vs[1] : 1000
        exigirPositivo(h, 'profundidade')
        const p = dens * G_TERRA * h
        const total = p + 101325
        return resultado(
            `A ${n(h, 2)} m de profundidade a pressão da coluna é *${n(p, 0)} Pa*.`,
            [`1) Fórmula: p = densidade × g × altura`, `2) p = ${n(dens, 0)} × 9,8 × ${n(h, 2)}`, `3) p = ${n(p, 0)} Pa = ${n(p / 101325, 4)} atm`, `4) Somando o ar de cima: ${n(total, 0)} Pa = ${n(total / 101325, 4)} atm`],
            'A pressão não depende do tamanho da piscina, só da profundidade. Um lago raso e enorme pressiona menos que um poço fundo.')
    }
})

T({
    chave: 'empuxo', sub: 'Física', emoji: '🛟', titulo: 'Empuxo de Arquimedes',
    descricao: 'Força que a água faz para cima num corpo',
    usage: '<volume submerso em litros> [densidade do líquido]',
    examples: ['10 — 10 litros submersos na água', '50 — corpo maior', '2 800 — em óleo de 800 kg/m³'],
    intro: 'Todo corpo mergulhado recebe um empurrão para cima igual ao peso do líquido que ele empurrou para fora.',
    calcular: (args) => {
        const vs = numeros(args, 1, ['volume submerso em litros'])
        const litrosSub = vs[0]
        const dens = vs.length > 1 ? vs[1] : 1000
        exigirPositivo(litrosSub, 'volume submerso')
        const volumeM3 = litrosSub / 1000
        const e = dens * G_TERRA * volumeM3
        return resultado(
            `O empuxo é de *${n(e, 4)} N*.`,
            [`1) Fórmula: empuxo = densidade do líquido × g × volume submerso`, `2) ${n(litrosSub, 3)} litros = ${n(volumeM3, 6)} m³`, `3) E = ${n(dens, 0)} × 9,8 × ${n(volumeM3, 6)} = ${n(e, 4)} N`],
            `Esse empuxo sustenta um corpo de até ${n(e / G_TERRA, 3)} kg. Acima disso, afunda.`)
    }
})

T({
    chave: 'prensahidraulica', sub: 'Física', emoji: '🔧', titulo: 'Prensa hidráulica',
    descricao: 'Força multiplicada pelo princípio de Pascal',
    usage: '<força aplicada> <área pequena> <área grande>',
    examples: ['100 0,01 0,5 — 100 N virando muito mais', '50 0,002 0,1', '200 0,05 1'],
    intro: 'O macaco hidráulico do posto: uma força pequena num pistão pequeno vira uma força enorme no pistão grande.',
    calcular: (args) => {
        const [f1, a1, a2] = numeros(args, 3, ['força aplicada', 'área menor', 'área maior'])
        exigirPositivo(a1, 'área menor')
        const p = f1 / a1
        const f2 = p * a2
        return resultado(
            `A força na saída é de *${n(f2, 4)} N*.`,
            [`1) A pressão é a mesma nos dois lados: ${n(f1, 4)} ÷ ${n(a1, 6)} = ${n(p, 2)} Pa`, `2) Força grande = pressão × área grande = ${n(p, 2)} × ${n(a2, 6)}`, `3) Força = ${n(f2, 4)} N — ${n(a2 / a1, 3)} vezes maior`],
            `Não existe almoço grátis: o pistão pequeno precisa descer ${n(a2 / a1, 1)} vezes mais do que o grande sobe. A energia é a mesma.`)
    }
})

// ════════════════════════════════════════════════════════════
//  24. FÍSICA — termologia
// ════════════════════════════════════════════════════════════

T({
    chave: 'calorsensivel', sub: 'Física', emoji: '🔥', titulo: 'Calor para esquentar',
    descricao: 'Calor necessário para mudar a temperatura',
    usage: '<massa em g> <variação de temperatura> [material]',
    examples: ['500 60 — esquentar meio litro de água em 60 graus', '200 30 aluminio', '1000 80 ferro'],
    intro: 'Quanto calor é preciso para esquentar algo? Depende da massa, de quantos graus e do material.',
    dica: 'Materiais que eu conheço: água, gelo, alumínio, ferro, cobre, chumbo, vidro e ar.',
    calcular: (args, texto) => {
        const [m, dt] = numeros(args, 2, ['massa', 'variação de temperatura'])
        const busca = chaveBusca(texto).replace(/[\d.,-]/g, '').trim()
        const achado = Object.entries(CALOR_ESPECIFICO).find(([k, v]) => busca.includes(k) || busca.includes(chaveBusca(v.nome)))
        const mat = achado ? achado[1] : CALOR_ESPECIFICO.agua
        const qCal = m * mat.c * dt
        return resultado(
            `São necessárias *${n(qCal, 2)} calorias* (${n(qCal * 4.186, 2)} J).`,
            [`1) Fórmula: Q = massa × calor específico × variação de temperatura`, `2) Material: ${mat.nome}, calor específico ${n(mat.c, 4)} cal/(g·°C)`, `3) Q = ${n(m, 2)} × ${n(mat.c, 4)} × ${n(dt, 2)} = ${n(qCal, 2)} cal`, `4) Em joules: ${n(qCal, 2)} × 4,186 = ${n(qCal * 4.186, 2)} J`],
            `Um chuveiro de 5.500 W levaria ${n(qCal * 4.186 / 5500, 2)} segundos para entregar esse calor.`)
    }
})

T({
    chave: 'calorlatente', sub: 'Física', emoji: '🧊', titulo: 'Calor para derreter ou ferver',
    descricao: 'Calor da mudança de estado, sem mudar a temperatura',
    usage: '<massa em g> <fusao|vaporizacao>',
    examples: ['200 fusao — derreter 200 g de gelo', '500 vaporizacao — ferver meio litro', '1000 fusao'],
    intro: 'Na hora de derreter ou ferver, o termômetro trava: toda a energia vai para mudar o estado, não a temperatura.',
    calcular: (args, texto) => {
        const [m] = numeros(args, 1, ['massa'])
        exigirPositivo(m, 'massa')
        const t = chaveBusca(texto)
        const vaporizar = /vapor|fervu|ferver|ebulic/.test(t)
        const L = vaporizar ? 540 : 80
        const q = m * L
        return resultado(
            `São necessárias *${n(q, 2)} calorias* (${n(q * 4.186, 0)} J) para ${vaporizar ? 'vaporizar' : 'derreter'} ${n(m, 2)} g de ${vaporizar ? 'água' : 'gelo'}.`,
            [`1) Fórmula: Q = massa × calor latente`, `2) Calor latente de ${vaporizar ? 'vaporização da água: 540 cal/g' : 'fusão do gelo: 80 cal/g'}`, `3) Q = ${n(m, 2)} × ${L} = ${n(q, 2)} cal`],
            vaporizar ? 'Ferver gasta quase 7 vezes mais energia que derreter a mesma massa — por isso a panela demora tanto para secar toda a água.' : 'Enquanto o gelo derrete a temperatura fica em 0 °C, mesmo recebendo calor o tempo todo.')
    }
})

T({
    chave: 'equilibriotermico', sub: 'Física', emoji: '🌡️', titulo: 'Temperatura final da mistura',
    descricao: 'Misturando duas águas, qual a temperatura final',
    usage: '<massa 1> <temperatura 1> <massa 2> <temperatura 2>',
    examples: ['200 80 300 20 — café quente com água fria', '500 90 500 10', '100 0 400 50'],
    intro: 'Misturando duas porções de água em temperaturas diferentes, o quente esfria e o frio esquenta até empatarem.',
    calcular: (args) => {
        const [m1, t1, m2, t2] = numeros(args, 4, ['massa 1', 'temperatura 1', 'massa 2', 'temperatura 2'])
        exigirPositivo(m1, 'primeira massa'); exigirPositivo(m2, 'segunda massa')
        const tf = (m1 * t1 + m2 * t2) / (m1 + m2)
        return resultado(
            `A temperatura final é de *${n(tf, 3)} °C*.`,
            [
                `1) O calor que um perde o outro ganha: m1 × c × (tf - t1) + m2 × c × (tf - t2) = 0`,
                `2) Como é a mesma água, o calor específico some da conta`,
                `3) tf = (${n(m1, 2)}×${n(t1, 2)} + ${n(m2, 2)}×${n(t2, 2)}) ÷ (${n(m1, 2)} + ${n(m2, 2)})`,
                `4) tf = ${n(m1 * t1 + m2 * t2, 2)} ÷ ${n(m1 + m2, 2)} = ${n(tf, 3)} °C`
            ],
            `A água quente cedeu ${n(m1 * Math.abs(t1 - tf), 1)} cal e a fria recebeu ${n(m2 * Math.abs(tf - t2), 1)} cal. O que um perde, o outro ganha.`)
    }
})

T({
    chave: 'temperaturaconv', sub: 'Física', emoji: '🌡️', titulo: 'Converter temperaturas',
    descricao: 'Celsius, Fahrenheit e Kelvin de uma vez',
    usage: '<valor> <C|F|K>',
    examples: ['100 C — água fervendo', '98,6 F — febre em Fahrenheit', '300 K'],
    intro: 'Mande o valor e a escala e eu devolvo as três: Celsius, Fahrenheit e Kelvin.',
    calcular: (args, texto) => {
        const [v] = numeros(args, 1, ['temperatura'])
        const t = chaveBusca(texto)
        const escala = /f(ahrenheit)?\b/.test(t) ? 'F' : /k(elvin)?\b/.test(t) ? 'K' : 'C'
        let c
        if (escala === 'F') c = (v - 32) * 5 / 9
        else if (escala === 'K') c = v - 273.15
        else c = v
        if (c < -273.15) erro('abaixo de -273,15 °C não existe: é o zero absoluto')
        const f = c * 9 / 5 + 32
        const k = c + 273.15
        return resultado(
            `${n(v, 4)} °${escala} = *${n(c, 3)} °C* = *${n(f, 3)} °F* = *${n(k, 3)} K*.`,
            [
                `1) A escala informada foi ${escala === 'C' ? 'Celsius' : escala === 'F' ? 'Fahrenheit' : 'Kelvin'}`,
                `2) Celsius para Fahrenheit: (°C × 9 ÷ 5) + 32 = ${n(f, 3)}`,
                `3) Celsius para Kelvin: °C + 273,15 = ${n(k, 3)}`
            ],
            'Referências: a água congela a 0 °C (32 °F, 273,15 K) e ferve a 100 °C (212 °F) ao nível do mar.')
    }
})

T({
    chave: 'dilatacaolinear', sub: 'Física', emoji: '📏', titulo: 'Dilatação de um comprimento',
    descricao: 'Quanto um corpo estica ao esquentar',
    usage: '<comprimento em m> <variação de temperatura> [material]',
    examples: ['100 30 aco — trilho de 100 m esquentando 30 graus', '10 50 aluminio', '2 40 cobre'],
    intro: 'Tudo cresce ao esquentar. Por isso trilho tem folga e ponte tem junta de dilatação.',
    dica: 'Materiais que eu conheço: aço, alumínio, cobre, ferro, vidro, chumbo, concreto e ouro.',
    calcular: (args, texto) => {
        const [L0, dt] = numeros(args, 2, ['comprimento', 'variação de temperatura'])
        const busca = chaveBusca(texto).replace(/[\d.,-]/g, '').trim()
        const achado = Object.entries(DILATACAO).find(([k, v]) => busca.includes(k) || busca.includes(chaveBusca(v.nome)))
        const mat = achado ? achado[1] : DILATACAO.aco
        const dl = L0 * mat.alfa * dt
        return resultado(
            `O comprimento aumenta *${n(dl * 1000, 4)} mm* (${n(dl, 8)} m).`,
            [`1) Fórmula: variação = comprimento × coeficiente × variação de temperatura`, `2) Material: ${mat.nome}, coeficiente ${sci(mat.alfa, 1)} por °C`, `3) ${n(L0, 4)} × ${sci(mat.alfa, 1)} × ${n(dt, 2)} = ${n(dl, 8)} m`],
            `O comprimento final fica em ${n(L0 + dl, 6)} m. Parece pouco, mas numa ponte de concreto isso racha o asfalto se não houver junta.`)
    }
})

T({
    chave: 'dilatacaovolumetrica', sub: 'Física', emoji: '🛢️', titulo: 'Dilatação de um volume',
    descricao: 'Quanto um volume cresce ao esquentar',
    usage: '<volume> <variação de temperatura> [material]',
    examples: ['50 20 aluminio — 50 litros esquentando 20 graus', '1000 30 aco', '2 40 vidro'],
    intro: 'O volume dilata três vezes mais que o comprimento — porque cresce nas três direções ao mesmo tempo.',
    calcular: (args, texto) => {
        const [V0, dt] = numeros(args, 2, ['volume', 'variação de temperatura'])
        const busca = chaveBusca(texto).replace(/[\d.,-]/g, '').trim()
        const achado = Object.entries(DILATACAO).find(([k, v]) => busca.includes(k) || busca.includes(chaveBusca(v.nome)))
        const mat = achado ? achado[1] : DILATACAO.aco
        const gama = 3 * mat.alfa
        const dv = V0 * gama * dt
        return resultado(
            `O volume aumenta *${n(dv, 6)}* (na mesma unidade que você mandou).`,
            [`1) Coeficiente volumétrico = 3 × coeficiente linear`, `2) Material: ${mat.nome} → 3 × ${sci(mat.alfa, 1)} = ${sci(gama, 1)} por °C`, `3) Variação = ${n(V0, 4)} × ${sci(gama, 1)} × ${n(dt, 2)} = ${n(dv, 8)}`],
            `O volume final é ${n(V0 + dv, 6)}. É por isso que o posto vende combustível "inchado" quando o tanque está quente.`)
    }
})

// ════════════════════════════════════════════════════════════
//  25. FÍSICA — óptica e ondas
// ════════════════════════════════════════════════════════════

T({
    chave: 'lentes', sub: 'Física', emoji: '🔎', titulo: 'Lentes: equação de Gauss',
    descricao: 'Onde a imagem se forma e de que tamanho',
    usage: '<distância do objeto> <distância focal>',
    examples: ['30 10 — objeto a 30 cm de uma lente de foco 10', '5 10 — objeto dentro do foco', '100 50'],
    intro: 'Com a distância do objeto e o foco da lente, eu digo onde a imagem aparece, se ela é real ou virtual e se está de ponta-cabeça.',
    dica: 'Foco positivo é lente convergente (lupa); negativo é divergente.',
    calcular: (args) => {
        const [p, f] = numeros(args, 2, ['distância do objeto', 'distância focal'])
        exigirPositivo(p, 'distância do objeto')
        exigirNaoZero(f, 'distância focal')
        if (Math.abs(p - f) < 1e-9) erro('com o objeto exatamente no foco a imagem se forma no infinito')
        const pl = 1 / (1 / f - 1 / p)
        const aumento = -pl / p
        return resultado(
            `A imagem se forma a *${n(Math.abs(pl), 4)}* da lente, ${pl > 0 ? 'do outro lado (imagem real)' : 'do mesmo lado do objeto (imagem virtual)'}.`,
            [
                `1) Equação de Gauss: 1/f = 1/p + 1/p'`,
                `2) 1/p' = 1/${n(f, 4)} - 1/${n(p, 4)} = ${n(1 / f - 1 / p, 8)}`,
                `3) p' = ${n(pl, 4)}`,
                `4) Aumento = -p'/p = ${n(aumento, 4)}`
            ],
            `A imagem é ${Math.abs(aumento) > 1 ? 'maior' : Math.abs(aumento) < 1 ? 'menor' : 'do mesmo tamanho'} que o objeto e está ${aumento < 0 ? 'de ponta-cabeça' : 'em pé'}.`)
    }
})

T({
    chave: 'espelhos', sub: 'Física', emoji: '🪞', titulo: 'Espelhos esféricos',
    descricao: 'Imagem num espelho côncavo ou convexo',
    usage: '<distância do objeto> <distância focal>',
    examples: ['30 10 — espelho côncavo de foco 10', '20 -15 — espelho convexo', '5 10'],
    intro: 'Espelho de maquiagem, retrovisor, espelho de loja: todos seguem a mesma equação das lentes.',
    dica: 'Foco positivo é espelho côncavo (aumenta); negativo é convexo (retrovisor).',
    calcular: (args) => {
        const [p, f] = numeros(args, 2, ['distância do objeto', 'distância focal'])
        exigirPositivo(p, 'distância do objeto')
        exigirNaoZero(f, 'distância focal')
        if (Math.abs(p - f) < 1e-9) erro('com o objeto no foco os raios saem paralelos e não formam imagem')
        const pl = 1 / (1 / f - 1 / p)
        const aumento = -pl / p
        return resultado(
            `A imagem aparece a *${n(Math.abs(pl), 4)}* do espelho e é *${pl > 0 ? 'real' : 'virtual'}*.`,
            [
                `1) Mesma equação de Gauss: 1/f = 1/p + 1/p'`,
                `2) Raio de curvatura = 2 × foco = ${n(2 * f, 4)}`,
                `3) p' = ${n(pl, 4)}`,
                `4) Aumento = ${n(aumento, 4)} (${Math.abs(aumento) > 1 ? 'ampliada' : 'reduzida'}, ${aumento < 0 ? 'invertida' : 'direita'})`
            ],
            f < 0 ? 'Espelho convexo sempre dá imagem menor, direita e virtual — por isso o retrovisor avisa que os objetos estão mais perto do que parecem.' : 'Espelho côncavo aumenta quando o rosto está entre ele e o foco.')
    }
})

T({
    chave: 'snell', sub: 'Física', emoji: '💧', titulo: 'Refração: lei de Snell',
    descricao: 'Ângulo da luz ao passar de um meio para outro',
    usage: '<índice 1> <ângulo de incidência> <índice 2>',
    examples: ['1 30 1,33 — do ar para a água', '1,33 40 1 — da água para o ar', '1 45 1,5 — para o vidro'],
    intro: 'A luz entorta ao mudar de meio. É por isso que o canudo parece quebrado dentro do copo.',
    dica: 'Índices comuns: ar 1, água 1,33, vidro 1,5, diamante 2,42.',
    calcular: (args) => {
        const [n1, ang, n2] = numeros(args, 3, ['índice do primeiro meio', 'ângulo', 'índice do segundo meio'])
        exigirPositivo(n1, 'primeiro índice'); exigirPositivo(n2, 'segundo índice')
        exigirFaixa(ang, 0, 90, 'ângulo de incidência')
        const seno2 = n1 * Math.sin(grausParaRad(ang)) / n2
        if (seno2 > 1) {
            const limite = radParaGraus(Math.asin(n2 / n1))
            return resultado(
                'Nesse caso acontece *reflexão total*: a luz não passa, volta inteira.',
                [`1) Lei de Snell: n1 × sen i = n2 × sen r`, `2) sen r daria ${n(seno2, 4)}, e seno não pode passar de 1`, `3) O ângulo limite aqui é ${n(limite, 3)}° — acima dele a luz reflete toda`],
                'É esse fenômeno que faz a fibra óptica funcionar: a luz fica presa dentro dela.')
        }
        const ang2 = radParaGraus(Math.asin(seno2))
        return resultado(
            `A luz sai com *${n(ang2, 3)}°* em relação à normal.`,
            [`1) Lei de Snell: n1 × sen i = n2 × sen r`, `2) ${n(n1, 3)} × sen ${n(ang, 2)}° = ${n(n1 * Math.sin(grausParaRad(ang)), 6)}`, `3) sen r = ${n(seno2, 6)} → r = ${n(ang2, 3)}°`],
            n2 > n1 ? 'Entrando num meio mais denso, a luz se aproxima da normal e anda mais devagar.' : 'Saindo para um meio menos denso, a luz se afasta da normal.')
    }
})

T({
    chave: 'vergencia', sub: 'Física', emoji: '👓', titulo: 'Grau dos óculos (vergência)',
    descricao: 'Converte distância focal em graus de dioptria',
    usage: '<distância focal em metros>',
    examples: ['0,5 — foco de meio metro', '-0,25 — lente divergente', '2'],
    intro: 'O "grau" do óculos é a vergência: 1 dividido pela distância focal em metros. Quanto menor o foco, maior o grau.',
    calcular: (args) => {
        const [f] = numeros(args, 1, ['distância focal'])
        exigirNaoZero(f, 'distância focal')
        const v = 1 / f
        return resultado(
            `Essa lente tem *${n(v, 3)} dioptrias* (${n(v, 2)} graus).`,
            [`1) Vergência = 1 ÷ distância focal em metros`, `2) V = 1 ÷ ${n(f, 4)} m`, `3) V = ${n(v, 4)} di`],
            v > 0 ? 'Grau positivo: lente convergente, receitada para quem tem hipermetropia ou vista cansada.' : 'Grau negativo: lente divergente, a da miopia.')
    }
})

T({
    chave: 'ondavelocidade', sub: 'Física', emoji: '🌊', titulo: 'Velocidade de uma onda',
    descricao: 'Velocidade pelo comprimento de onda e frequência',
    usage: '<comprimento de onda em m> <frequência em Hz>',
    examples: ['0,5 680 — som no ar', '3 100', '0,000000550 545000000000000 — luz verde'],
    intro: 'Toda onda obedece à mesma regra: velocidade é comprimento de onda vezes frequência.',
    calcular: (args) => {
        const [lambda, f] = numeros(args, 2, ['comprimento de onda', 'frequência'])
        const v = lambda * f
        return resultado(
            `A velocidade da onda é *${n(v, 4)} m/s*.`,
            [`1) Fórmula: v = comprimento de onda × frequência`, `2) v = ${n(lambda, 8)} m × ${n(f, 4)} Hz`, `3) v = ${n(v, 4)} m/s`],
            `Para comparar: som no ar a 20 °C anda 343 m/s e a luz no vácuo, 299.792.458 m/s.`)
    }
})

T({
    chave: 'periodofrequencia', sub: 'Física', emoji: '⏱️', titulo: 'Período e frequência',
    descricao: 'Um é o inverso do outro; eu converto os dois',
    usage: '<valor> <hz|s>',
    examples: ['60 hz — frequência da tomada no Brasil', '0,02 s — período de 20 milissegundos', '440 hz'],
    intro: 'Frequência é quantas vezes por segundo; período é quanto tempo dura cada vez. Um é o inverso do outro.',
    calcular: (args, texto) => {
        const [v] = numeros(args, 1, ['valor'])
        exigirPositivo(v, 'valor')
        const ehSegundos = /\bs\b|segundo|periodo|período/i.test(texto) && !/hz|hertz/i.test(texto)
        const f = ehSegundos ? 1 / v : v
        const T2 = ehSegundos ? v : 1 / v
        return resultado(
            `Frequência *${n(f, 6)} Hz* e período *${n(T2, 8)} s*.`,
            [`1) Você informou o ${ehSegundos ? 'período' : 'valor em hertz'}`, `2) Período = 1 ÷ frequência = ${n(T2, 8)} s`, `3) Frequência = 1 ÷ período = ${n(f, 6)} Hz`, `4) Em rotações por minuto: ${n(f * 60, 2)} RPM`],
            'A tomada no Brasil oscila 60 vezes por segundo; o lá do diapasão, 440.')
    }
})

// ════════════════════════════════════════════════════════════
//  26. FÍSICA — eletricidade
// ════════════════════════════════════════════════════════════

T({
    chave: 'ohm', sub: 'Física', emoji: '🔌', titulo: 'Primeira lei de Ohm',
    descricao: 'Corrente a partir da tensão e da resistência',
    usage: '<tensão em V> <resistência em ohms>',
    examples: ['127 10 — tomada de 127 V num resistor de 10 ohms', '220 44', '12 6 — circuito de carro'],
    intro: 'A lei de Ohm amarra tensão, corrente e resistência: quanto maior a resistência, menor a corrente.',
    calcular: (args) => {
        const [v, r] = numeros(args, 2, ['tensão', 'resistência'])
        exigirPositivo(r, 'resistência')
        const i = v / r
        return resultado(
            `A corrente é de *${n(i, 4)} A*.`,
            [`1) Lei de Ohm: tensão = resistência × corrente`, `2) Corrente = ${n(v, 4)} V ÷ ${n(r, 4)} ohms`, `3) Corrente = ${n(i, 4)} ampères`],
            `A potência dissipada é ${n(v * i, 2)} W. Ligado por uma hora, isso gasta ${n(v * i / 1000, 4)} kWh.`)
    }
})

T({
    chave: 'potenciaeletrica', sub: 'Física', emoji: '💡', titulo: 'Potência elétrica',
    descricao: 'Potência em watts pela tensão e corrente',
    usage: '<tensão em V> <corrente em A>',
    examples: ['127 45 — chuveiro elétrico', '220 5', '12 2'],
    intro: 'Potência elétrica é tensão vezes corrente. É ela que aparece na etiqueta dos aparelhos.',
    calcular: (args) => {
        const [v, i] = numeros(args, 2, ['tensão', 'corrente'])
        const p = v * i
        return resultado(
            `A potência é de *${n(p, 2)} W*.`,
            [`1) Fórmula: potência = tensão × corrente`, `2) P = ${n(v, 4)} V × ${n(i, 4)} A`, `3) P = ${n(p, 2)} watts`],
            `Ligado 1 hora, esse aparelho consome ${n(p / 1000, 4)} kWh. A resistência dele é de ${i !== 0 ? n(v / i, 3) : '—'} ohms.`)
    }
})

T({
    chave: 'resistoresserie', sub: 'Física', emoji: '➖', titulo: 'Resistores em série',
    descricao: 'Resistência total quando estão em fila',
    usage: '<resistência> <resistência> [mais]',
    examples: ['10 20 30 — três resistores em fila', '100 220', '4,7 4,7 4,7'],
    intro: 'Em série é fácil: a resistência total é a soma de todas. A corrente é a mesma em todos eles.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['pelo menos duas resistências'])
        if (vs.some(v => v < 0)) erro('resistência negativa não existe')
        const total = vs.reduce((a, b) => a + b, 0)
        return resultado(
            `A resistência equivalente é *${n(total, 4)} ohms*.`,
            [`1) Em série, basta somar: ${vs.map(v => n(v, 3)).join(' + ')}`, `2) Total = ${n(total, 4)} ohms`],
            `Ligado em 127 V, esse conjunto puxaria ${n(127 / total, 4)} A. Em série a total é sempre MAIOR que a maior resistência isolada.`)
    }
})

T({
    chave: 'resistoresparalelo', sub: 'Física', emoji: '🔀', titulo: 'Resistores em paralelo',
    descricao: 'Resistência total quando estão lado a lado',
    usage: '<resistência> <resistência> [mais]',
    examples: ['10 20 — dois em paralelo', '100 100 100', '6 3'],
    intro: 'Em paralelo a conta é dos inversos, e o resultado é sempre menor que a menor das resistências.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['pelo menos duas resistências'])
        if (vs.some(v => v <= 0)) erro('cada resistência precisa ser maior que zero')
        const somaInv = vs.reduce((a, b) => a + 1 / b, 0)
        const total = 1 / somaInv
        return resultado(
            `A resistência equivalente é *${n(total, 4)} ohms*.`,
            [`1) Em paralelo: 1/R = ${vs.map(v => '1/' + n(v, 3)).join(' + ')}`, `2) 1/R = ${n(somaInv, 6)}`, `3) R = 1 ÷ ${n(somaInv, 6)} = ${n(total, 4)} ohms`],
            `O resultado ficou menor que a menor resistência (${n(Math.min(...vs), 3)} ohms) — em paralelo, mais caminhos significam menos resistência.`)
    }
})

T({
    chave: 'consumokwh', sub: 'Física', emoji: '🔋', titulo: 'Consumo de energia em kWh',
    descricao: 'Quantos kWh um aparelho gasta por mês',
    usage: '<potência em W> <horas por dia> [dias]',
    examples: ['5500 0,5 30 — chuveiro meia hora por dia', '100 8 30 — lâmpada acesa 8 h', '350 24 30 — geladeira'],
    intro: 'A conta de luz cobra kWh: potência vezes tempo. Aqui eu transformo watts e horas em kWh do mês.',
    calcular: (args) => {
        const vs = numeros(args, 2, ['potência em watts', 'horas por dia'])
        const [pot, horas] = vs
        const dias = vs.length > 2 ? vs[2] : 30
        exigirPositivo(pot, 'potência')
        const kwh = pot * horas * dias / 1000
        return resultado(
            `O consumo é de *${n(kwh, 3)} kWh* no período.`,
            [`1) Energia = potência × horas ÷ 1.000`, `2) Por dia: ${n(pot, 0)} × ${n(horas, 3)} ÷ 1.000 = ${n(pot * horas / 1000, 4)} kWh`, `3) Em ${n(dias, 0)} dias: ${n(kwh, 3)} kWh`],
            `Com a tarifa em torno de R$ 0,90 por kWh, isso daria uns ${rs(kwh * 0.9)} na conta. Confira a tarifa na sua fatura.`)
    }
})

T({
    chave: 'contadeluz', sub: 'Física', emoji: '🧾', titulo: 'Quanto custa na conta de luz',
    descricao: 'Converte kWh em reais usando a sua tarifa',
    usage: '<kWh> <tarifa por kWh>',
    examples: ['100 0,92 — 100 kWh a R$ 0,92', '250 0,85', '38 1,05'],
    intro: 'Pegue o consumo em kWh e a tarifa que está impressa na sua conta. Eu faço o resto.',
    dica: 'A tarifa está na sua fatura, em reais por kWh. Ela muda por estado e por bandeira.',
    calcular: (args) => {
        const [kwh, tarifa] = numeros(args, 2, ['consumo em kWh', 'tarifa'])
        const custo = kwh * tarifa
        return resultado(
            `A conta fica em *${rs(custo)}* (sem impostos e taxas extras).`,
            [`1) Custo = consumo × tarifa`, `2) ${n(kwh, 3)} kWh × ${rs(tarifa)} por kWh`, `3) Custo = ${rs(custo)}`],
            `Por dia isso dá ${rs(custo / 30)}. Economizar 10 kWh no mês pouparia ${rs(10 * tarifa)}. Bandeira tarifária e iluminação pública entram por cima disso.`)
    }
})

// ════════════════════════════════════════════════════════════
//  27. FÍSICA — fichas de referência
// ════════════════════════════════════════════════════════════

T({
    chave: 'constantesfisicas', sub: 'Física', emoji: '📚', titulo: 'Constantes da física',
    descricao: 'Procure uma constante pelo nome e veja o valor',
    usage: '<nome da constante ou "todas">',
    examples: ['luz — velocidade da luz', 'avogadro', 'todas — a lista inteira'],
    intro: 'As constantes que aparecem em prova, com o valor certo e o motivo de cada uma existir.',
    dica: 'Procure por: luz, gravidade, gravitação, Planck, carga, Boltzmann, Avogadro, gases, atmosfera, som.',
    calcular: (args, texto) => {
        const busca = chaveBusca(texto)
        const todas = /todas|tudo|lista/.test(busca)
        const achadas = todas ? CONSTANTES : CONSTANTES.filter(c =>
            c.busca.some(b => chaveBusca(b) === busca || busca.includes(chaveBusca(b))) || chaveBusca(c.nome).includes(busca))
        if (!achadas.length) erro(`não achei nenhuma constante com "${texto}"`)
        if (achadas.length === 1) {
            const c = achadas[0]
            return {
                intro: `*${c.nome}* (${c.simbolo}) vale *${c.valor}*.`,
                secoes: [ficha('Por que ela importa', [c.nota], '📌')],
                dica: 'Desde 2019 várias constantes passaram a DEFINIR as unidades, em vez de serem medidas.'
            }
        }
        return {
            intro: `Achei ${achadas.length} constante(s).`,
            secoes: [ficha('Constantes', achadas.map(c => `• *${c.nome}* (${c.simbolo}): ${c.valor}`))],
            dica: 'Peça uma pelo nome para ver a explicação completa.'
        }
    }
})

T({
    chave: 'unidadessi', sub: 'Física', emoji: '📐', titulo: 'Unidades do Sistema Internacional',
    descricao: 'As sete unidades de base e os prefixos do SI',
    usage: '<grandeza ou "todas">',
    examples: ['massa — a unidade de massa', 'todas — as sete de base', 'prefixos — quilo, mili, micro'],
    intro: 'Toda medida do mundo se apoia em sete unidades. Todas as outras são combinações delas.',
    dica: 'Peça "prefixos" para ver a escala de tera até pico.',
    calcular: (args, texto) => {
        const busca = chaveBusca(texto)
        if (/prefixo/.test(busca)) {
            return {
                intro: 'Os prefixos multiplicam ou dividem qualquer unidade por potências de dez.',
                secoes: [ficha('Prefixos do SI', PREFIXOS_SI.map(([nome, sim, val]) => `• *${nome}* (${sim}) = ${val}`))],
                dica: 'Um quilômetro é mil metros; um milissegundo é um milésimo de segundo. O mesmo prefixo vale para qualquer unidade.'
            }
        }
        const todas = /todas|tudo|lista|base/.test(busca)
        const achadas = todas ? UNIDADES_SI : UNIDADES_SI.filter(u => chaveBusca(u.grandeza).includes(busca) || chaveBusca(u.unidade).includes(busca) || chaveBusca(u.simbolo) === busca)
        if (!achadas.length) erro(`não achei essa grandeza; tente "todas" para ver as sete`)
        return {
            intro: achadas.length === 1 ? `A unidade de ${achadas[0].grandeza} é o *${achadas[0].unidade}* (${achadas[0].simbolo}).` : 'Estas são as sete unidades de base do Sistema Internacional.',
            secoes: [ficha('Unidades de base', achadas.map(u => `• *${u.grandeza}*: ${u.unidade} (${u.simbolo}) — ${u.nota}`))],
            dica: 'Unidades derivadas como newton e joule são só combinações destas sete.'
        }
    }
})

// ════════════════════════════════════════════════════════════
//  28. QUÍMICA — tabela periódica
// ════════════════════════════════════════════════════════════

/**
 * Tabela periódica completa. Cada linha é:
 *   [símbolo, nome em português, número atômico, massa atômica, grupo, período,
 *    família, eletronegatividade de Pauling]
 *
 * Massa atômica: peso atômico padrão da IUPAC (2021), arredondado. Para os
 * elementos sem isótopo estável, é o número de massa do isótopo mais estável
 * conhecido — a IUPAC escreve esses entre colchetes.
 * Grupo: numeração IUPAC de 1 a 18. Lantanídeos e actinídeos ficam fora da
 * numeração e aparecem como null.
 * Eletronegatividade: escala de Pauling; null quando não há valor tabelado.
 */
const TABELA_BRUTA = [
    ['H', 'Hidrogênio', 1, 1.008, 1, 1, 'hidrogênio', 2.20],
    ['He', 'Hélio', 2, 4.0026, 18, 1, 'gás nobre', null],
    ['Li', 'Lítio', 3, 6.94, 1, 2, 'metal alcalino', 0.98],
    ['Be', 'Berílio', 4, 9.0122, 2, 2, 'metal alcalinoterroso', 1.57],
    ['B', 'Boro', 5, 10.81, 13, 2, 'semimetal', 2.04],
    ['C', 'Carbono', 6, 12.011, 14, 2, 'não metal', 2.55],
    ['N', 'Nitrogênio', 7, 14.007, 15, 2, 'não metal', 3.04],
    ['O', 'Oxigênio', 8, 15.999, 16, 2, 'não metal', 3.44],
    ['F', 'Flúor', 9, 18.998, 17, 2, 'halogênio', 3.98],
    ['Ne', 'Neônio', 10, 20.180, 18, 2, 'gás nobre', null],
    ['Na', 'Sódio', 11, 22.990, 1, 3, 'metal alcalino', 0.93],
    ['Mg', 'Magnésio', 12, 24.305, 2, 3, 'metal alcalinoterroso', 1.31],
    ['Al', 'Alumínio', 13, 26.982, 13, 3, 'metal representativo', 1.61],
    ['Si', 'Silício', 14, 28.085, 14, 3, 'semimetal', 1.90],
    ['P', 'Fósforo', 15, 30.974, 15, 3, 'não metal', 2.19],
    ['S', 'Enxofre', 16, 32.06, 16, 3, 'não metal', 2.58],
    ['Cl', 'Cloro', 17, 35.45, 17, 3, 'halogênio', 3.16],
    ['Ar', 'Argônio', 18, 39.95, 18, 3, 'gás nobre', null],
    ['K', 'Potássio', 19, 39.098, 1, 4, 'metal alcalino', 0.82],
    ['Ca', 'Cálcio', 20, 40.078, 2, 4, 'metal alcalinoterroso', 1.00],
    ['Sc', 'Escândio', 21, 44.956, 3, 4, 'metal de transição', 1.36],
    ['Ti', 'Titânio', 22, 47.867, 4, 4, 'metal de transição', 1.54],
    ['V', 'Vanádio', 23, 50.942, 5, 4, 'metal de transição', 1.63],
    ['Cr', 'Cromo', 24, 51.996, 6, 4, 'metal de transição', 1.66],
    ['Mn', 'Manganês', 25, 54.938, 7, 4, 'metal de transição', 1.55],
    ['Fe', 'Ferro', 26, 55.845, 8, 4, 'metal de transição', 1.83],
    ['Co', 'Cobalto', 27, 58.933, 9, 4, 'metal de transição', 1.88],
    ['Ni', 'Níquel', 28, 58.693, 10, 4, 'metal de transição', 1.91],
    ['Cu', 'Cobre', 29, 63.546, 11, 4, 'metal de transição', 1.90],
    ['Zn', 'Zinco', 30, 65.38, 12, 4, 'metal de transição', 1.65],
    ['Ga', 'Gálio', 31, 69.723, 13, 4, 'metal representativo', 1.81],
    ['Ge', 'Germânio', 32, 72.630, 14, 4, 'semimetal', 2.01],
    ['As', 'Arsênio', 33, 74.922, 15, 4, 'semimetal', 2.18],
    ['Se', 'Selênio', 34, 78.971, 16, 4, 'não metal', 2.55],
    ['Br', 'Bromo', 35, 79.904, 17, 4, 'halogênio', 2.96],
    ['Kr', 'Criptônio', 36, 83.798, 18, 4, 'gás nobre', 3.00],
    ['Rb', 'Rubídio', 37, 85.468, 1, 5, 'metal alcalino', 0.82],
    ['Sr', 'Estrôncio', 38, 87.62, 2, 5, 'metal alcalinoterroso', 0.95],
    ['Y', 'Ítrio', 39, 88.906, 3, 5, 'metal de transição', 1.22],
    ['Zr', 'Zircônio', 40, 91.224, 4, 5, 'metal de transição', 1.33],
    ['Nb', 'Nióbio', 41, 92.906, 5, 5, 'metal de transição', 1.60],
    ['Mo', 'Molibdênio', 42, 95.95, 6, 5, 'metal de transição', 2.16],
    ['Tc', 'Tecnécio', 43, 98, 7, 5, 'metal de transição', 1.90],
    ['Ru', 'Rutênio', 44, 101.07, 8, 5, 'metal de transição', 2.20],
    ['Rh', 'Ródio', 45, 102.91, 9, 5, 'metal de transição', 2.28],
    ['Pd', 'Paládio', 46, 106.42, 10, 5, 'metal de transição', 2.20],
    ['Ag', 'Prata', 47, 107.87, 11, 5, 'metal de transição', 1.93],
    ['Cd', 'Cádmio', 48, 112.41, 12, 5, 'metal de transição', 1.69],
    ['In', 'Índio', 49, 114.82, 13, 5, 'metal representativo', 1.78],
    ['Sn', 'Estanho', 50, 118.71, 14, 5, 'metal representativo', 1.96],
    ['Sb', 'Antimônio', 51, 121.76, 15, 5, 'semimetal', 2.05],
    ['Te', 'Telúrio', 52, 127.60, 16, 5, 'semimetal', 2.10],
    ['I', 'Iodo', 53, 126.90, 17, 5, 'halogênio', 2.66],
    ['Xe', 'Xenônio', 54, 131.29, 18, 5, 'gás nobre', 2.60],
    ['Cs', 'Césio', 55, 132.91, 1, 6, 'metal alcalino', 0.79],
    ['Ba', 'Bário', 56, 137.33, 2, 6, 'metal alcalinoterroso', 0.89],
    ['La', 'Lantânio', 57, 138.91, 3, 6, 'lantanídeo', 1.10],
    ['Ce', 'Cério', 58, 140.12, null, 6, 'lantanídeo', 1.12],
    ['Pr', 'Praseodímio', 59, 140.91, null, 6, 'lantanídeo', 1.13],
    ['Nd', 'Neodímio', 60, 144.24, null, 6, 'lantanídeo', 1.14],
    ['Pm', 'Promécio', 61, 145, null, 6, 'lantanídeo', null],
    ['Sm', 'Samário', 62, 150.36, null, 6, 'lantanídeo', 1.17],
    ['Eu', 'Európio', 63, 151.96, null, 6, 'lantanídeo', null],
    ['Gd', 'Gadolínio', 64, 157.25, null, 6, 'lantanídeo', 1.20],
    ['Tb', 'Térbio', 65, 158.93, null, 6, 'lantanídeo', null],
    ['Dy', 'Disprósio', 66, 162.50, null, 6, 'lantanídeo', 1.22],
    ['Ho', 'Hólmio', 67, 164.93, null, 6, 'lantanídeo', 1.23],
    ['Er', 'Érbio', 68, 167.26, null, 6, 'lantanídeo', 1.24],
    ['Tm', 'Túlio', 69, 168.93, null, 6, 'lantanídeo', 1.25],
    ['Yb', 'Itérbio', 70, 173.05, null, 6, 'lantanídeo', null],
    ['Lu', 'Lutécio', 71, 174.97, null, 6, 'lantanídeo', 1.27],
    ['Hf', 'Háfnio', 72, 178.49, 4, 6, 'metal de transição', 1.30],
    ['Ta', 'Tântalo', 73, 180.95, 5, 6, 'metal de transição', 1.50],
    ['W', 'Tungstênio', 74, 183.84, 6, 6, 'metal de transição', 2.36],
    ['Re', 'Rênio', 75, 186.21, 7, 6, 'metal de transição', 1.90],
    ['Os', 'Ósmio', 76, 190.23, 8, 6, 'metal de transição', 2.20],
    ['Ir', 'Irídio', 77, 192.22, 9, 6, 'metal de transição', 2.20],
    ['Pt', 'Platina', 78, 195.08, 10, 6, 'metal de transição', 2.28],
    ['Au', 'Ouro', 79, 196.97, 11, 6, 'metal de transição', 2.54],
    ['Hg', 'Mercúrio', 80, 200.59, 12, 6, 'metal de transição', 2.00],
    ['Tl', 'Tálio', 81, 204.38, 13, 6, 'metal representativo', 1.62],
    ['Pb', 'Chumbo', 82, 207.2, 14, 6, 'metal representativo', 1.87],
    ['Bi', 'Bismuto', 83, 208.98, 15, 6, 'metal representativo', 2.02],
    ['Po', 'Polônio', 84, 209, 16, 6, 'semimetal', 2.00],
    ['At', 'Astato', 85, 210, 17, 6, 'halogênio', 2.20],
    ['Rn', 'Radônio', 86, 222, 18, 6, 'gás nobre', null],
    ['Fr', 'Frâncio', 87, 223, 1, 7, 'metal alcalino', 0.70],
    ['Ra', 'Rádio', 88, 226, 2, 7, 'metal alcalinoterroso', 0.90],
    ['Ac', 'Actínio', 89, 227, 3, 7, 'actinídeo', 1.10],
    ['Th', 'Tório', 90, 232.04, null, 7, 'actinídeo', 1.30],
    ['Pa', 'Protactínio', 91, 231.04, null, 7, 'actinídeo', 1.50],
    ['U', 'Urânio', 92, 238.03, null, 7, 'actinídeo', 1.38],
    ['Np', 'Netúnio', 93, 237, null, 7, 'actinídeo', 1.36],
    ['Pu', 'Plutônio', 94, 244, null, 7, 'actinídeo', 1.28],
    ['Am', 'Amerício', 95, 243, null, 7, 'actinídeo', 1.30],
    ['Cm', 'Cúrio', 96, 247, null, 7, 'actinídeo', 1.30],
    ['Bk', 'Berquélio', 97, 247, null, 7, 'actinídeo', 1.30],
    ['Cf', 'Califórnio', 98, 251, null, 7, 'actinídeo', 1.30],
    ['Es', 'Einstênio', 99, 252, null, 7, 'actinídeo', 1.30],
    ['Fm', 'Férmio', 100, 257, null, 7, 'actinídeo', 1.30],
    ['Md', 'Mendelévio', 101, 258, null, 7, 'actinídeo', 1.30],
    ['No', 'Nobélio', 102, 259, null, 7, 'actinídeo', 1.30],
    ['Lr', 'Laurêncio', 103, 262, null, 7, 'actinídeo', null],
    ['Rf', 'Rutherfórdio', 104, 267, 4, 7, 'metal de transição', null],
    ['Db', 'Dúbnio', 105, 270, 5, 7, 'metal de transição', null],
    ['Sg', 'Seabórgio', 106, 269, 6, 7, 'metal de transição', null],
    ['Bh', 'Bóhrio', 107, 270, 7, 7, 'metal de transição', null],
    ['Hs', 'Hássio', 108, 270, 8, 7, 'metal de transição', null],
    ['Mt', 'Meitnério', 109, 278, 9, 7, 'metal de transição', null],
    ['Ds', 'Darmstácio', 110, 281, 10, 7, 'metal de transição', null],
    ['Rg', 'Roentgênio', 111, 282, 11, 7, 'metal de transição', null],
    ['Cn', 'Copernício', 112, 285, 12, 7, 'metal de transição', null],
    ['Nh', 'Nihônio', 113, 286, 13, 7, 'metal representativo', null],
    ['Fl', 'Fleróvio', 114, 289, 14, 7, 'metal representativo', null],
    ['Mc', 'Moscóvio', 115, 290, 15, 7, 'metal representativo', null],
    ['Lv', 'Livermório', 116, 293, 16, 7, 'metal representativo', null],
    ['Ts', 'Tenessino', 117, 294, 17, 7, 'halogênio', null],
    ['Og', 'Oganessônio', 118, 294, 18, 7, 'gás nobre', null]
]

const ELEMENTOS = TABELA_BRUTA.map(([simbolo, nome, z, massa, grupo, periodo, familia, eletro]) =>
    ({ simbolo, nome, z, massa, grupo, periodo, familia, eletro }))

const POR_SIMBOLO = Object.fromEntries(ELEMENTOS.map(e => [e.simbolo, e]))
const POR_Z = Object.fromEntries(ELEMENTOS.map(e => [e.z, e]))
const SINTETICOS = new Set(['Tc', 'Pm', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'])
const GASOSOS = new Set(['H', 'He', 'N', 'O', 'F', 'Ne', 'Cl', 'Ar', 'Kr', 'Xe', 'Rn'])
const LIQUIDOS = new Set(['Br', 'Hg'])

/** Curiosidade de uso cotidiano para os elementos mais conhecidos. */
const NOTAS_ELEMENTO = {
    H: 'O elemento mais abundante do universo. No Sol, ele se funde e vira hélio.',
    He: 'O segundo mais abundante do universo e o gás que faz balão subir e a voz ficar fina.',
    C: 'A base de toda a química orgânica e de toda a vida que conhecemos. Grafite e diamante são os dois puro carbono.',
    N: 'Faz 78% do ar que você respira. Também é a base dos fertilizantes.',
    O: 'O que você respira e o que faz o ferro enferrujar. É o mais abundante da crosta terrestre.',
    Na: 'Junto com o cloro forma o sal de cozinha. Sozinho, reage violentamente com água.',
    Mg: 'Está na clorofila: é ele que faz a planta ser verde.',
    Al: 'O metal mais abundante da crosta. Leve, não enferruja e é 100% reciclável.',
    Si: 'A areia é dióxido de silício. Todo chip de computador nasce dele.',
    P: 'Está no DNA e nos ossos. Também é o que acende a cabeça do palito de fósforo.',
    S: 'O cheiro de ovo podre e de enxofre queimado. Usado na borracha (vulcanização).',
    Cl: 'Desinfeta a água da piscina e da torneira. Puro, é um gás verde-amarelado e tóxico.',
    K: 'Está na banana e é essencial para o funcionamento dos músculos e nervos.',
    Ca: 'Ossos, dentes, leite, giz e calcário — tudo cálcio.',
    Fe: 'O que faz o sangue ser vermelho e o que forma o núcleo da Terra.',
    Cu: 'O metal dos fios elétricos: conduz muito bem e custa menos que a prata.',
    Zn: 'Protege o aço da ferrugem (galvanização) e reforça a imunidade.',
    Ag: 'O melhor condutor elétrico que existe. Também mata bactérias.',
    Au: 'Não enferruja nem escurece. Por isso virou dinheiro e joia há milênios.',
    Hg: 'O único metal líquido à temperatura ambiente. Muito tóxico.',
    Pb: 'Pesado e tóxico. Foi tirado da gasolina e da tinta por causa disso.',
    U: 'Combustível das usinas nucleares e da primeira bomba atômica.',
    Ne: 'O gás dos letreiros luminosos, com aquela luz vermelho-alaranjada.'
}

/** Famílias com o que cada uma tem de característico. */
const FAMILIAS = {
    'alcalinos': { grupo: 1, filtro: e => e.familia === 'metal alcalino', traco: 'Têm 1 elétron na última camada e o perdem com muita facilidade. São tão reativos que precisam ser guardados no querosene.' },
    'alcalinoterrosos': { grupo: 2, filtro: e => e.familia === 'metal alcalinoterroso', traco: 'Têm 2 elétrons na última camada. Reativos, mas menos que os alcalinos.' },
    'transicao': { grupo: null, filtro: e => e.familia === 'metal de transição', traco: 'Os metais do meio da tabela. Formam íons de várias cargas e dão cor aos compostos.' },
    'calcogenios': { grupo: 16, filtro: e => e.grupo === 16, traco: 'Família do oxigênio. Precisam de 2 elétrons para completar a camada.' },
    'halogenios': { grupo: 17, filtro: e => e.familia === 'halogênio', traco: 'Faltam-lhes só 1 elétron, então são ávidos por elétrons. Formam sais com os metais.' },
    'gases nobres': { grupo: 18, filtro: e => e.familia === 'gás nobre', traco: 'Já têm a última camada completa, então quase não reagem com nada.' },
    'lantanideos': { grupo: null, filtro: e => e.familia === 'lantanídeo', traco: 'As terras raras. Estão em ímãs potentes, telas e lasers.' },
    'actinideos': { grupo: null, filtro: e => e.familia === 'actinídeo', traco: 'Todos radioativos. Urânio e plutônio são os mais conhecidos.' },
    'semimetais': { grupo: null, filtro: e => e.familia === 'semimetal', traco: 'Ficam em cima da fronteira: conduzem eletricidade só às vezes. É a base dos semicondutores.' },
    'nao metais': { grupo: null, filtro: e => e.familia === 'não metal', traco: 'Não conduzem bem eletricidade nem calor e tendem a ganhar elétrons.' },
    'boro': { grupo: 13, filtro: e => e.grupo === 13, traco: 'Família do boro, com 3 elétrons na última camada. O alumínio é o mais famoso.' },
    'carbono': { grupo: 14, filtro: e => e.grupo === 14, traco: 'Família do carbono, com 4 elétrons na última camada. É a família da vida e dos chips.' },
    'nitrogenio': { grupo: 15, filtro: e => e.grupo === 15, traco: 'Família do nitrogênio, com 5 elétrons na última camada.' }
}

/** Acha um elemento pelo símbolo, nome ou número atômico. */
function acharElemento(termo) {
    const t = String(termo || '').trim()
    if (!t) erro('me diga o elemento (símbolo, nome ou número atômico)')
    if (/^\d+$/.test(t)) {
        const e = POR_Z[Number(t)]
        if (!e) erro(`não existe elemento com número atômico ${t} (a tabela vai de 1 a 118)`)
        return e
    }
    const simbolo = t[0].toUpperCase() + t.slice(1).toLowerCase()
    if (POR_SIMBOLO[simbolo] && t.length <= 2) return POR_SIMBOLO[simbolo]
    const busca = chaveBusca(t)
    const porNome = ELEMENTOS.find(e => chaveBusca(e.nome) === busca)
    if (porNome) return porNome
    const parcial = ELEMENTOS.find(e => chaveBusca(e.nome).startsWith(busca) && busca.length >= 3)
    if (parcial) return parcial
    if (POR_SIMBOLO[simbolo]) return POR_SIMBOLO[simbolo]
    erro(`não achei o elemento "${termo}" na tabela periódica`)
}

/** Estado físico do elemento a 25 °C e 1 atm. */
function estadoFisico(e) {
    if (GASOSOS.has(e.simbolo)) return 'gasoso'
    if (LIQUIDOS.has(e.simbolo)) return 'líquido'
    return 'sólido'
}

// ─── Leitura de fórmulas químicas ───────────────────────────

/** Conta os átomos de um grupo (sem hidratação), respeitando parênteses. */
function contarGrupo(s) {
    const pilha = [{}]
    let i = 0
    while (i < s.length) {
        const c = s[i]
        if (c === '(' || c === '[') { pilha.push({}); i++; continue }
        if (c === ')' || c === ']') {
            const grupo = pilha.pop()
            if (!pilha.length) erro('tem parêntese fechando sem abrir na fórmula')
            i++
            let num = ''
            while (i < s.length && /\d/.test(s[i])) num += s[i++]
            const mult = num ? Number(num) : 1
            const topo = pilha[pilha.length - 1]
            for (const [el, q] of Object.entries(grupo)) topo[el] = (topo[el] || 0) + q * mult
            continue
        }
        const m = /^([A-Z][a-z]?)(\d*)/.exec(s.slice(i))
        if (!m) erro(`não entendi o trecho "${s.slice(i, i + 6)}" da fórmula`)
        if (!POR_SIMBOLO[m[1]]) erro(`não conheço o elemento "${m[1]}"`)
        const q = m[2] ? Number(m[2]) : 1
        const topo = pilha[pilha.length - 1]
        topo[m[1]] = (topo[m[1]] || 0) + q
        i += m[0].length
    }
    if (pilha.length !== 1) erro('faltou fechar um parêntese na fórmula')
    return pilha[0]
}

/** Conta os átomos de uma fórmula inteira, aceitando hidratos (CuSO4.5H2O). */
function contarAtomos(formula) {
    const limpa = String(formula || '').replace(/\s+/g, '').replace(/[·•]/g, '.')
    if (!limpa) erro('mande a fórmula da substância')
    const total = {}
    for (const parte of limpa.split('.')) {
        if (!parte) continue
        const m = parte.match(/^(\d+)/)
        const mult = m ? Number(m[1]) : 1
        const corpo = m ? parte.slice(m[1].length) : parte
        if (!corpo) erro('faltou a fórmula depois do número')
        for (const [el, q] of Object.entries(contarGrupo(corpo))) total[el] = (total[el] || 0) + q * mult
    }
    if (!Object.keys(total).length) erro('não achei nenhum elemento nessa fórmula')
    return total
}

/** Massa molar em g/mol a partir da contagem de átomos. */
function massaMolar(formula) {
    const atomos = contarAtomos(formula)
    let total = 0
    const linhas = []
    for (const [el, q] of Object.entries(atomos)) {
        const massa = POR_SIMBOLO[el].massa * q
        total += massa
        linhas.push(`• ${el} (${POR_SIMBOLO[el].nome}): ${q} × ${n(POR_SIMBOLO[el].massa, 3)} = ${n(massa, 3)} g/mol`)
    }
    return { total, linhas, atomos }
}

// ─── Balanceamento por álgebra linear com frações exatas ────

function fr(a, b = 1) {
    if (b === 0) erro('divisão por zero no balanceamento')
    const g = mdc(a, b) || 1
    let x = a / g, y = b / g
    if (y < 0) { x = -x; y = -y }
    return [x, y]
}
const frSoma = (x, y) => fr(x[0] * y[1] + y[0] * x[1], x[1] * y[1])
const frSub = (x, y) => fr(x[0] * y[1] - y[0] * x[1], x[1] * y[1])
const frMul = (x, y) => fr(x[0] * y[0], x[1] * y[1])
const frDiv = (x, y) => { if (y[0] === 0) erro('divisão por zero no balanceamento'); return fr(x[0] * y[1], x[1] * y[0]) }

/**
 * Balanceia a equação achando o núcleo da matriz de elementos por espécie.
 * @returns {{coeficientes:number[], reagentes:string[], produtos:string[]}}
 */
function balancear(equacao) {
    const limpa = String(equacao || '').replace(/[=→]|-->|->|>>/g, '|')
    const lados = limpa.split('|').map(s => s.trim()).filter(Boolean)
    if (lados.length !== 2) erro('escreva a equação com uma seta, tipo H2 + O2 -> H2O')
    const reagentes = lados[0].split('+').map(s => s.trim()).filter(Boolean)
    const produtos = lados[1].split('+').map(s => s.trim()).filter(Boolean)
    const especies = [...reagentes, ...produtos]
    if (especies.length < 2) erro('preciso de pelo menos uma substância de cada lado')
    if (especies.length > 12) erro('essa equação tem substâncias demais (máximo 12)')
    const comps = especies.map(contarAtomos)
    const elementos = [...new Set(comps.flatMap(c => Object.keys(c)))]
    const cols = especies.length
    const M = elementos.map(el => comps.map((c, j) => fr((c[el] || 0) * (j < reagentes.length ? 1 : -1))))

    let linha = 0
    const pivos = []
    for (let c = 0; c < cols && linha < M.length; c++) {
        let p = -1
        for (let i = linha; i < M.length; i++) if (M[i][c][0] !== 0) { p = i; break }
        if (p === -1) continue
        const tmp = M[linha]; M[linha] = M[p]; M[p] = tmp
        const pivo = M[linha][c]
        for (let j = 0; j < cols; j++) M[linha][j] = frDiv(M[linha][j], pivo)
        for (let i = 0; i < M.length; i++) {
            if (i === linha || M[i][c][0] === 0) continue
            const fator = M[i][c]
            for (let j = 0; j < cols; j++) M[i][j] = frSub(M[i][j], frMul(fator, M[linha][j]))
        }
        pivos.push(c); linha++
    }
    const livres = []
    for (let c = 0; c < cols; c++) if (!pivos.includes(c)) livres.push(c)
    if (livres.length !== 1) erro('não consegui balancear: confira se as fórmulas estão certas e se falta alguma substância')
    const livre = livres[0]
    const x = new Array(cols).fill(null).map(() => fr(0))
    x[livre] = fr(1)
    for (let i = 0; i < pivos.length; i++) x[pivos[i]] = frSub(fr(0), M[i][livre])

    let L = 1
    for (const v of x) L = mmc(L, v[1]) || 1
    let inteiros = x.map(v => Math.round(v[0] * L / v[1]))
    const g = inteiros.reduce((a, b) => mdc(a, b)) || 1
    inteiros = inteiros.map(v => v / g)
    if (inteiros.some(v => v <= 0)) erro('essa reação não fecha com coeficientes positivos — confira as fórmulas')
    return { coeficientes: inteiros, reagentes, produtos }
}

// ─── Distribuição eletrônica ────────────────────────────────

const ORDEM_PAULING = [
    ['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6],
    ['5s', 2], ['4d', 10], ['5p', 6], ['6s', 2], ['4f', 14], ['5d', 10], ['6p', 6],
    ['7s', 2], ['5f', 14], ['6d', 10], ['7p', 6]
]
const NOME_CAMADA = { 1: 'K', 2: 'L', 3: 'M', 4: 'N', 5: 'O', 6: 'P', 7: 'Q' }

/**
 * Distribuição pelo diagrama de Linus Pauling.
 * @returns {{subniveis:string[], camadas:object, ultimaCamada:number, valencia:number}}
 */
function distribuicaoEletronica(eletrons) {
    if (eletrons < 1 || eletrons > 118) erro('a distribuição vale para 1 a 118 elétrons')
    let restam = eletrons
    const subniveis = []
    const camadas = {}
    for (const [nome, cap] of ORDEM_PAULING) {
        if (restam <= 0) break
        const q = Math.min(cap, restam)
        restam -= q
        subniveis.push(`${nome}${q}`)
        const nivel = Number(nome[0])
        camadas[nivel] = (camadas[nivel] || 0) + q
    }
    const ultimaCamada = Math.max(...Object.keys(camadas).map(Number))
    return { subniveis, camadas, ultimaCamada, valencia: camadas[ultimaCamada] }
}

// ─── Geometria e polaridade (modelo VSEPR do ensino médio) ──

const MOLECULAS = {
    H2: { geometria: 'linear', polar: false, nota: 'Dois átomos iguais: a ligação é apolar.' },
    O2: { geometria: 'linear', polar: false, nota: 'Ligação dupla entre átomos iguais, sem polaridade.' },
    N2: { geometria: 'linear', polar: false, nota: 'Ligação tripla, das mais fortes que existem.' },
    Cl2: { geometria: 'linear', polar: false, nota: 'Átomos iguais, molécula apolar.' },
    HCl: { geometria: 'linear', polar: true, nota: 'O cloro puxa mais os elétrons: molécula polar.' },
    HF: { geometria: 'linear', polar: true, nota: 'A ligação mais polar entre dois átomos comuns.' },
    CO2: { geometria: 'linear', polar: false, nota: 'Cada ligação é polar, mas as duas se anulam por simetria.' },
    H2O: { geometria: 'angular', polar: true, nota: 'O par de elétrons livre entorta a molécula, e ela fica polar — por isso a água dissolve tanta coisa.' },
    SO2: { geometria: 'angular', polar: true, nota: 'Tem par livre no enxofre, então entorta e fica polar.' },
    H2S: { geometria: 'angular', polar: true, nota: 'Mesma forma da água, mas com enxofre.' },
    NH3: { geometria: 'piramidal', polar: true, nota: 'O par livre do nitrogênio empurra os hidrogênios e forma uma pirâmide.' },
    PH3: { geometria: 'piramidal', polar: true, nota: 'Mesma forma da amônia.' },
    CH4: { geometria: 'tetraédrica', polar: false, nota: 'Quatro hidrogênios simétricos: as polaridades se anulam.' },
    CCl4: { geometria: 'tetraédrica', polar: false, nota: 'Simétrica, então apolar, mesmo com ligações polares.' },
    CHCl3: { geometria: 'tetraédrica', polar: true, nota: 'A simetria quebrou: um hidrogênio e três cloros deixam a molécula polar.' },
    BF3: { geometria: 'trigonal plana', polar: false, nota: 'O boro fica com só 6 elétrons e a molécula é plana e simétrica.' },
    BeH2: { geometria: 'linear', polar: false, nota: 'O berílio faz só duas ligações, em linha reta.' },
    SO3: { geometria: 'trigonal plana', polar: false, nota: 'Simétrica, então apolar.' },
    C2H4: { geometria: 'trigonal plana', polar: false, nota: 'O eteno é plano por causa da ligação dupla.' },
    NaCl: { geometria: 'rede iônica', polar: true, nota: 'Não é molécula: é uma rede de íons que se repete, o cristal do sal.' }
}

/** Funções orgânicas com o grupo característico e exemplos reais. */
const FUNCOES_ORGANICAS = {
    alcool: { nome: 'Álcool', grupo: 'OH ligado a carbono saturado', sufixo: '-ol', exemplos: 'Etanol (álcool da bebida e do carro), metanol, glicerol', nota: 'O OH ligado a carbono de cadeia aberta. Faz ligação de hidrogênio, por isso mistura com água.' },
    fenol: { nome: 'Fenol', grupo: 'OH ligado direto ao anel benzênico', sufixo: 'fenol', exemplos: 'Fenol comum, usado em desinfetante', nota: 'Parece álcool, mas o anel deixa ele levemente ácido.' },
    aldeido: { nome: 'Aldeído', grupo: 'CHO na ponta da cadeia', sufixo: '-al', exemplos: 'Metanal (formol), etanal', nota: 'A carbonila fica sempre na ponta da cadeia.' },
    cetona: { nome: 'Cetona', grupo: 'C=O no meio da cadeia', sufixo: '-ona', exemplos: 'Propanona (acetona do esmalte)', nota: 'A carbonila fica entre dois carbonos, nunca na ponta.' },
    acido: { nome: 'Ácido carboxílico', grupo: 'COOH', sufixo: 'ácido …-oico', exemplos: 'Ácido etanoico (vinagre), ácido cítrico', nota: 'O grupo COOH solta H+ na água: é o que dá o gosto azedo.' },
    ester: { nome: 'Éster', grupo: 'COO entre dois carbonos', sufixo: '-oato de -ila', exemplos: 'Acetato de etila, essências de frutas, gorduras', nota: 'Nasce de ácido mais álcool. É o cheiro da banana e do morango artificial.' },
    eter: { nome: 'Éter', grupo: 'O entre dois carbonos', sufixo: '-óxi-', exemplos: 'Éter etílico, usado como solvente', nota: 'O oxigênio no meio da cadeia, sem hidrogênio junto.' },
    amina: { nome: 'Amina', grupo: 'NH2 ligado a carbono', sufixo: '-amina', exemplos: 'Metilamina, anilina, aminoácidos', nota: 'Derivada da amônia, trocando hidrogênio por carbono. Tem caráter básico.' },
    amida: { nome: 'Amida', grupo: 'CONH2', sufixo: '-amida', exemplos: 'Ureia, náilon, proteínas', nota: 'A ligação que junta os aminoácidos nas proteínas é uma amida.' },
    haleto: { nome: 'Haleto orgânico', grupo: 'F, Cl, Br ou I ligado a carbono', sufixo: 'halo-', exemplos: 'Clorofórmio, CFCs, PVC', nota: 'Halogênio preso ao carbono. Muitos são solventes e alguns atacam a camada de ozônio.' },
    hidrocarboneto: { nome: 'Hidrocarboneto', grupo: 'só carbono e hidrogênio', sufixo: '-ano, -eno, -ino', exemplos: 'Metano, gasolina, GLP, benzeno', nota: 'A família mais simples: só C e H. É o petróleo inteiro.' }
}

const PREFIXO_CARBONO = ['', 'met', 'et', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec', 'undec', 'dodec']

const METAIS = new Set(['metal alcalino', 'metal alcalinoterroso', 'metal de transição', 'metal representativo', 'lantanídeo', 'actinídeo'])
const ehMetal = simbolo => METAIS.has((POR_SIMBOLO[simbolo] || {}).familia)

/** Nox fixo dos elementos que quase nunca mudam de carga. */
const NOX_FIXO = {
    F: -1, Li: 1, Na: 1, K: 1, Rb: 1, Cs: 1, Ag: 1, H: 1,
    Be: 2, Mg: 2, Ca: 2, Sr: 2, Ba: 2, Zn: 2, Cd: 2, Al: 3, O: -2
}
const PEROXIDOS = new Set(['H2O2', 'Na2O2', 'K2O2', 'Li2O2', 'BaO2', 'CaO2'])

// ════════════════════════════════════════════════════════════
//  29. QUÍMICA — átomo e tabela periódica
// ════════════════════════════════════════════════════════════

T({
    chave: 'elemento', sub: 'Química', emoji: '⚗️', titulo: 'Ficha de um elemento químico',
    descricao: 'Tudo sobre um elemento: símbolo, massa, família',
    usage: '<símbolo, nome ou número atômico>',
    examples: ['Fe — o ferro', 'oxigenio — pelo nome', '79 — pelo número atômico'],
    intro: 'A ficha completa de qualquer um dos 118 elementos: massa, grupo, período, família e para que ele serve.',
    dica: 'Vale símbolo (Fe), nome (ferro) ou número atômico (26).',
    calcular: (args, texto) => {
        const e = acharElemento(String(texto).trim().split(/\s+/)[0])
        const dist = distribuicaoEletronica(e.z)
        return {
            intro: `*${e.nome}* (${e.simbolo}) — número atômico *${e.z}*, massa atômica *${n(e.massa, 3)} u*.`,
            secoes: [
                ficha('Na tabela', [
                    F_campo('Grupo', e.grupo ? `${e.grupo}` : 'fora da numeração (bloco f)'),
                    F_campo('Período', e.periodo),
                    F_campo('Família', e.familia),
                    F_campo('Estado a 25 °C', estadoFisico(e)),
                    F_campo('Eletronegatividade', e.eletro ? n(e.eletro, 2) + ' (Pauling)' : 'sem valor tabelado'),
                    SINTETICOS.has(e.simbolo) ? F_campo('Origem', 'produzido em laboratório, não existe estável na natureza') : null
                ]),
                ficha('Elétrons', [
                    F_campo('Distribuição', dist.subniveis.join(' ')),
                    F_campo('Camadas', Object.entries(dist.camadas).map(([k, v]) => `${NOME_CAMADA[k]}=${v}`).join(' ')),
                    F_campo('Última camada', `${dist.valencia} elétron(s)`)
                ], '🔬'),
                NOTAS_ELEMENTO[e.simbolo] ? ficha('Onde ele aparece', [NOTAS_ELEMENTO[e.simbolo]], '🌍') : null
            ].filter(Boolean),
            dica: 'A massa atômica é a média dos isótopos que existem na natureza, por isso quase nunca dá um número redondo.'
        }
    }
})

T({
    chave: 'familia', sub: 'Química', emoji: '👨‍👩‍👧', titulo: 'Famílias da tabela periódica',
    descricao: 'Quem são e o que têm em comum os elementos',
    usage: '<nome da família>',
    examples: ['halogenios — a família do cloro', 'gases nobres', 'alcalinos'],
    intro: 'Elementos da mesma coluna se parecem porque têm o mesmo número de elétrons na última camada.',
    dica: 'Famílias: alcalinos, alcalinoterrosos, transição, calcogênios, halogênios, gases nobres, lantanídeos, actinídeos, semimetais.',
    calcular: (args, texto) => {
        const busca = chaveBusca(texto)
        const achada = Object.entries(FAMILIAS).find(([k]) => busca.includes(k) || k.includes(busca))
        if (!achada) erro(`não conheço a família "${texto}"`)
        const [nomeFamilia, dados] = achada
        const membros = ELEMENTOS.filter(dados.filtro)
        return {
            intro: `A família dos *${nomeFamilia}* tem ${membros.length} elemento(s)${dados.grupo ? `, no grupo ${dados.grupo}` : ''}.`,
            secoes: [
                ficha('O que marca essa família', [dados.traco], '💡'),
                ficha('Quem são', membros.slice(0, 20).map(e => `• ${e.simbolo} — ${e.nome} (Z = ${e.z}, massa ${n(e.massa, 2)})`).concat(membros.length > 20 ? [`• … e mais ${membros.length - 20}`] : []))
            ],
            dica: 'Dentro da mesma família, quanto mais embaixo, maior o átomo e mais fácil ele perder elétron.'
        }
    }
})

T({
    chave: 'distribuicao', sub: 'Química', emoji: '🔬', titulo: 'Distribuição eletrônica',
    descricao: 'Diagrama de Pauling elemento por elemento',
    usage: '<elemento ou número de elétrons>',
    examples: ['Fe — ferro, 26 elétrons', 'oxigenio', '20 — cálcio'],
    intro: 'O caminho dos elétrons pelo diagrama de Linus Pauling, subnível por subnível, até a camada de valência.',
    calcular: (args, texto) => {
        const termo = String(texto).trim().split(/\s+/)[0]
        const e = acharElemento(termo)
        const d = distribuicaoEletronica(e.z)
        return {
            intro: `*${e.nome}* (Z = ${e.z}): *${d.subniveis.join(' ')}*`,
            secoes: [
                ficha('Por camada', Object.entries(d.camadas).map(([k, v]) => `• Camada ${NOME_CAMADA[k]} (n = ${k}): ${v} elétron(s)`), '🧅'),
                ficha('Camada de valência', [
                    F_campo('Última camada', `${NOME_CAMADA[d.ultimaCamada]} (n = ${d.ultimaCamada})`),
                    F_campo('Elétrons de valência', d.valencia),
                    F_campo('Subnível mais energético', d.subniveis[d.subniveis.length - 1])
                ], '⚡')
            ],
            dica: 'O diagrama de Pauling preenche por energia, não por número da camada: por isso o 4s vem antes do 3d.'
        }
    }
})

T({
    chave: 'valencia', sub: 'Química', emoji: '🤝', titulo: 'Elétrons de valência',
    descricao: 'Quantos elétrons faltam ou sobram para ligar',
    usage: '<elemento>',
    examples: ['O — oxigênio', 'sodio', 'Cl'],
    intro: 'A última camada decide tudo: quem sobra elétron vira cátion, quem falta vira ânion.',
    calcular: (args, texto) => {
        const e = acharElemento(String(texto).trim().split(/\s+/)[0])
        const d = distribuicaoEletronica(e.z)
        const v = d.valencia
        const faltam = 8 - v
        const comportamento = e.familia === 'gás nobre' ? 'já está completo e praticamente não reage'
            : ehMetal(e.simbolo) ? `tende a PERDER ${v} elétron(s) e virar o cátion ${e.simbolo}${v > 1 ? v : ''}+`
                : `tende a GANHAR ${faltam} elétron(s) e virar o ânion ${e.simbolo}${faltam > 1 ? faltam : ''}-`
        return resultado(
            `*${e.nome}* tem *${v} elétron(s)* na última camada e ${comportamento}.`,
            [`1) Distribuição: ${d.subniveis.join(' ')}`, `2) A última camada é a ${NOME_CAMADA[d.ultimaCamada]}, com ${v} elétron(s)`, `3) Para chegar aos 8 da regra do octeto ${faltam === 0 ? 'não falta nada' : `faltam ${faltam}`}`],
            'A regra do octeto vale bem para os elementos das primeiras colunas e falha nos metais de transição.')
    }
})

T({
    chave: 'particulas', sub: 'Química', emoji: '⚛️', titulo: 'Prótons, nêutrons e elétrons',
    descricao: 'Conta as partículas de um átomo ou de um íon',
    usage: '<elemento> [número de massa] [carga]',
    examples: ['Na — sódio neutro', 'Na 23 1 — o cátion sódio', 'C 14 — o carbono-14'],
    intro: 'O número atômico diz os prótons; a massa menos os prótons dá os nêutrons; a carga muda só os elétrons.',
    dica: 'A carga vai como número: 1 para +1, -2 para o ânion de carga 2 negativa.',
    calcular: (args, texto) => {
        const partes = String(texto).trim().split(/\s+/)
        const e = acharElemento(partes[0])
        const vs = extrairNumeros(partes.slice(1).join(' '))
        const A = vs.length ? Math.round(vs[0]) : Math.round(e.massa)
        const carga = vs.length > 1 ? Math.round(vs[1]) : 0
        if (A < e.z) erro(`o número de massa não pode ser menor que o número atômico (${e.z})`)
        const nêutrons = A - e.z
        const eletrons = e.z - carga
        if (eletrons < 0) erro('essa carga tiraria mais elétrons do que o átomo tem')
        return resultado(
            `*${e.nome}-${A}*${carga ? ` com carga ${carga > 0 ? '+' : ''}${carga}` : ''}: *${e.z} prótons*, *${nêutrons} nêutrons* e *${eletrons} elétrons*.`,
            [
                `1) Prótons = número atômico = ${e.z}`,
                `2) Nêutrons = massa - prótons = ${A} - ${e.z} = ${nêutrons}`,
                carga === 0 ? `3) Átomo neutro: elétrons = prótons = ${e.z}` : `3) Carga ${carga > 0 ? '+' : ''}${carga}: ${carga > 0 ? 'perdeu' : 'ganhou'} ${Math.abs(carga)} elétron(s) → ${eletrons}`
            ],
            carga === 0 ? 'Átomo neutro tem sempre o mesmo número de prótons e elétrons.' : carga > 0 ? 'Carga positiva é cátion: perdeu elétron, e não ganhou próton.' : 'Carga negativa é ânion: ganhou elétron.')
    }
})

T({
    chave: 'isotopos', sub: 'Química', emoji: '👯', titulo: 'Isótopos, isóbaros e isótonos',
    descricao: 'Compara dois átomos e diz a relação entre eles',
    usage: '<massa 1> <atômico 1> <massa 2> <atômico 2>',
    examples: ['12 6 14 6 — carbono-12 e carbono-14', '40 20 40 18 — mesmo número de massa', '24 12 23 11'],
    intro: 'Dois átomos podem ter o mesmo número de prótons, de massa ou de nêutrons. Cada caso tem um nome.',
    calcular: (args) => {
        const [A1, Z1, A2, Z2] = numeros(args, 4, ['massa 1', 'número atômico 1', 'massa 2', 'número atômico 2']).map(Math.round)
        if (A1 < Z1 || A2 < Z2) erro('o número de massa nunca é menor que o número atômico')
        const N1 = A1 - Z1, N2 = A2 - Z2
        const relacoes = []
        if (Z1 === Z2) relacoes.push('*isótopos* (mesmo número de prótons, logo o mesmo elemento)')
        if (A1 === A2) relacoes.push('*isóbaros* (mesmo número de massa)')
        if (N1 === N2) relacoes.push('*isótonos* (mesmo número de nêutrons)')
        const e1 = POR_Z[Z1], e2 = POR_Z[Z2]
        return resultado(
            relacoes.length ? `Esses dois átomos são ${relacoes.join(' e ')}.` : 'Esses dois átomos não têm nenhuma dessas relações: prótons, massa e nêutrons são todos diferentes.',
            [
                `1) Primeiro átomo: ${e1 ? e1.nome : 'Z = ' + Z1} — ${Z1} prótons, ${N1} nêutrons, massa ${A1}`,
                `2) Segundo átomo: ${e2 ? e2.nome : 'Z = ' + Z2} — ${Z2} prótons, ${N2} nêutrons, massa ${A2}`,
                `3) Comparando: prótons ${Z1 === Z2 ? 'iguais' : 'diferentes'}, massa ${A1 === A2 ? 'igual' : 'diferente'}, nêutrons ${N1 === N2 ? 'iguais' : 'diferentes'}`
            ],
            'Isótopo é do mesmo elemento; isóbaro e isótono são de elementos diferentes.')
    }
})

T({
    chave: 'massaatomicamedia', sub: 'Química', emoji: '⚖️', titulo: 'Massa atômica média',
    descricao: 'Média ponderada dos isótopos pela abundância',
    usage: '<massa> <abundância %> <massa> <abundância %> ...',
    examples: ['34,969 75,77 36,966 24,23 — os isótopos do cloro', '10 19,9 11 80,1 — o boro', '63 69,2 65 30,8'],
    intro: 'A massa que aparece na tabela periódica é a média dos isótopos, pesada pela abundância de cada um na natureza.',
    calcular: (args) => {
        const vs = numeros(args, 4, ['massa e abundância, aos pares'])
        if (vs.length % 2 !== 0) erro('cada massa precisa da abundância dela')
        let soma = 0, somaAb = 0
        const linhas = []
        for (let i = 0; i < vs.length; i += 2) {
            soma += vs[i] * vs[i + 1] / 100
            somaAb += vs[i + 1]
            linhas.push(`• Massa ${n(vs[i], 4)} × ${n(vs[i + 1], 3)}% = ${n(vs[i] * vs[i + 1] / 100, 5)}`)
        }
        if (Math.abs(somaAb - 100) > 1) erro(`as abundâncias somam ${n(somaAb, 2)}% e deveriam somar 100%`)
        return resultado(
            `A massa atômica média é *${n(soma, 4)} u*.`,
            [...linhas, `Somando tudo: ${n(soma, 4)} u`],
            'É por isso que o cloro aparece como 35,45 na tabela, e não como 35 ou 37.')
    }
})

T({
    chave: 'propriedadesperiodicas', sub: 'Química', emoji: '📊', titulo: 'Comparar dois elementos',
    descricao: 'Raio, eletronegatividade e caráter metálico',
    usage: '<elemento 1> <elemento 2>',
    examples: ['Na Cl — sódio e cloro', 'Li Cs', 'F I'],
    intro: 'As propriedades seguem a posição na tabela: o raio cresce para baixo e para a esquerda, a eletronegatividade faz o contrário.',
    calcular: (args, texto) => {
        const partes = String(texto).trim().split(/\s+/)
        if (partes.length < 2) erro('preciso de dois elementos para comparar')
        const a = acharElemento(partes[0]), b = acharElemento(partes[1])
        if (a.simbolo === b.simbolo) erro('mande dois elementos diferentes')
        const maiorRaio = a.periodo !== b.periodo
            ? (a.periodo > b.periodo ? a : b)
            : ((a.grupo || 99) < (b.grupo || 99) ? a : b)
        const maisEletro = (a.eletro || 0) > (b.eletro || 0) ? a : b
        const dif = Math.abs((a.eletro || 0) - (b.eletro || 0))
        return {
            intro: `*${a.nome}* e *${b.nome}*: o átomo maior é o *${maiorRaio.nome}* e quem puxa elétron com mais força é o *${maisEletro.nome}*.`,
            secoes: [
                ficha(a.nome, [F_campo('Z', a.z), F_campo('Período', a.periodo), F_campo('Grupo', a.grupo || 'bloco f'), F_campo('Eletronegatividade', a.eletro ? n(a.eletro, 2) : 'sem valor'), F_campo('Família', a.familia)]),
                ficha(b.nome, [F_campo('Z', b.z), F_campo('Período', b.periodo), F_campo('Grupo', b.grupo || 'bloco f'), F_campo('Eletronegatividade', b.eletro ? n(b.eletro, 2) : 'sem valor'), F_campo('Família', b.familia)]),
                ficha('A ligação entre eles', [
                    dif >= 1.7 ? `Diferença de eletronegatividade ${n(dif, 2)}: a ligação seria iônica.`
                        : dif >= 0.4 ? `Diferença de eletronegatividade ${n(dif, 2)}: ligação covalente polar.`
                            : `Diferença de eletronegatividade ${n(dif, 2)}: ligação covalente apolar.`
                ], '🔗')
            ],
            dica: 'Na tabela, o raio atômico cresce de cima para baixo e da direita para a esquerda. A eletronegatividade cresce no sentido oposto.'
        }
    }
})

// ════════════════════════════════════════════════════════════
//  30. QUÍMICA — mol e estequiometria
// ════════════════════════════════════════════════════════════

T({
    chave: 'massamolar', sub: 'Química', emoji: '🧪', titulo: 'Massa molar de uma substância',
    descricao: 'Soma as massas atômicas da fórmula que você mandar',
    usage: '<fórmula química>',
    examples: ['H2SO4 — ácido sulfúrico', 'Ca(OH)2 — com parênteses', 'CuSO4.5H2O — com água de hidratação'],
    intro: 'Mande a fórmula e eu somo átomo por átomo. Entendo parênteses e água de hidratação.',
    dica: 'Respeite as maiúsculas: CO é monóxido de carbono, Co é cobalto.',
    calcular: (args, texto) => {
        const formula = String(texto).trim().split(/\s+/)[0]
        const { total, linhas } = massaMolar(formula)
        return resultado(
            `A massa molar de *${formula}* é *${n(total, 3)} g/mol*.`,
            [...linhas, `Somando tudo: ${n(total, 3)} g/mol`],
            `Isso quer dizer que 1 mol dessa substância pesa ${n(total, 2)} gramas e tem 6,02 × 10^23 unidades.`)
    }
})

T({
    chave: 'molparamassa', sub: 'Química', emoji: '⚖️', titulo: 'De mols para gramas',
    descricao: 'Quantos gramas há na quantidade de mols',
    usage: '<mols> <fórmula>',
    examples: ['2 H2O — dois mols de água', '0,5 NaCl', '3 H2SO4'],
    intro: 'Você tem a quantidade em mol e quer saber quantos gramas pesar na balança.',
    calcular: (args, texto) => {
        const [mols] = numeros(args, 1, ['quantidade de mols'])
        const formula = String(texto).replace(/[\d.,]+/, '').trim().split(/\s+/)[0]
        if (!formula) erro('faltou a fórmula da substância')
        const { total } = massaMolar(formula)
        const massa = mols * total
        return resultado(
            `${n(mols, 4)} mol de ${formula} pesa *${n(massa, 4)} g*.`,
            [`1) Massa molar de ${formula} = ${n(total, 3)} g/mol`, `2) Massa = mols × massa molar = ${n(mols, 4)} × ${n(total, 3)}`, `3) Massa = ${n(massa, 4)} g`],
            `Nessa quantidade há ${n(mols * 6.02214076e23, 4)} unidades da substância.`)
    }
})

T({
    chave: 'massaparamol', sub: 'Química', emoji: '🔁', titulo: 'De gramas para mols',
    descricao: 'Quantos mols há na massa que você pesou',
    usage: '<gramas> <fórmula>',
    examples: ['36 H2O — 36 gramas de água', '58,5 NaCl', '100 CaCO3'],
    intro: 'Pesou na balança e quer saber quantos mols são? É dividir pela massa molar.',
    calcular: (args, texto) => {
        const [massa] = numeros(args, 1, ['massa em gramas'])
        const formula = String(texto).replace(/[\d.,]+/, '').trim().split(/\s+/)[0]
        if (!formula) erro('faltou a fórmula da substância')
        const { total } = massaMolar(formula)
        const mols = massa / total
        return resultado(
            `${n(massa, 4)} g de ${formula} são *${n(mols, 5)} mol*.`,
            [`1) Massa molar de ${formula} = ${n(total, 3)} g/mol`, `2) Mols = massa ÷ massa molar = ${n(massa, 4)} ÷ ${n(total, 3)}`, `3) Mols = ${n(mols, 5)}`],
            `Isso dá ${n(mols * 6.02214076e23, 4)} moléculas (ou fórmulas unitárias).`)
    }
})

T({
    chave: 'avogadro', sub: 'Química', emoji: '🔢', titulo: 'Número de partículas',
    descricao: 'Converte mols em número de moléculas',
    usage: '<mols> [fórmula]',
    examples: ['2 — dois mols', '0,25', '18 H2O — a partir da massa em gramas'],
    intro: 'Um mol tem 6,02 × 10^23 unidades. Esse número é tão grande que um mol de grãos de areia cobriria o planeta.',
    dica: 'Se você mandar uma fórmula junto, eu trato o número como massa em gramas.',
    calcular: (args, texto) => {
        const [valor] = numeros(args, 1, ['quantidade'])
        const resto = String(texto).replace(/[\d.,]+/, '').trim().split(/\s+/)[0]
        const NA = 6.02214076e23
        if (resto && /^[A-Z]/.test(resto)) {
            const { total } = massaMolar(resto)
            const mols = valor / total
            return resultado(
                `${n(valor, 4)} g de ${resto} contêm *${n(mols * NA, 4)}* unidades.`,
                [`1) Massa molar de ${resto} = ${n(total, 3)} g/mol`, `2) Mols = ${n(valor, 4)} ÷ ${n(total, 3)} = ${n(mols, 6)}`, `3) Unidades = ${n(mols, 6)} × 6,022 × 10^23 = ${n(mols * NA, 4)}`],
                'O número de Avogadro é exato por definição desde 2019: é ele que define o mol.')
        }
        return resultado(
            `${n(valor, 4)} mol contêm *${n(valor * NA, 4)}* unidades.`,
            [`1) 1 mol = 6,02214076 × 10^23 unidades`, `2) ${n(valor, 4)} × 6,022 × 10^23 = ${n(valor * NA, 4)}`],
            'Se fosse possível contar uma unidade por segundo, levaria mais tempo que a idade do universo.')
    }
})

T({
    chave: 'volumemolar', sub: 'Química', emoji: '🎈', titulo: 'Volume de um gás na CNTP',
    descricao: 'Volume ocupado por um gás a 0 °C e 1 atm',
    usage: '<mols> [fórmula]',
    examples: ['2 — dois mols de qualquer gás', '0,5', '32 O2 — a partir da massa'],
    intro: 'Nas condições normais (0 °C e 1 atm), um mol de qualquer gás ocupa 22,4 litros — não importa qual gás seja.',
    calcular: (args, texto) => {
        const [valor] = numeros(args, 1, ['quantidade'])
        const resto = String(texto).replace(/[\d.,]+/, '').trim().split(/\s+/)[0]
        let mols = valor, explicacao = []
        if (resto && /^[A-Z]/.test(resto)) {
            const { total } = massaMolar(resto)
            mols = valor / total
            explicacao = [`1) Massa molar de ${resto} = ${n(total, 3)} g/mol`, `2) Mols = ${n(valor, 4)} ÷ ${n(total, 3)} = ${n(mols, 6)}`]
        }
        const vol = mols * 22.4
        return resultado(
            `Esse gás ocupa *${n(vol, 4)} litros* na CNTP.`,
            [...explicacao, `${explicacao.length + 1}) Volume = mols × 22,4 L = ${n(mols, 6)} × 22,4`, `${explicacao.length + 2}) Volume = ${n(vol, 4)} L`],
            'Vale para qualquer gás porque, nas mesmas condições, volumes iguais de gases têm o mesmo número de moléculas.')
    }
})

T({
    chave: 'composicaopercentual', sub: 'Química', emoji: '🥧', titulo: 'Composição percentual',
    descricao: 'Quanto por cento da massa é de cada elemento',
    usage: '<fórmula química>',
    examples: ['H2O — quanto da água é oxigênio', 'C6H12O6 — glicose', 'NaHCO3'],
    intro: 'Quanto da massa de uma substância é de cada elemento? Útil para saber o teor de nitrogênio de um fertilizante, por exemplo.',
    calcular: (args, texto) => {
        const formula = String(texto).trim().split(/\s+/)[0]
        const { total, atomos } = massaMolar(formula)
        const linhas = Object.entries(atomos).map(([el, q]) => {
            const m = POR_SIMBOLO[el].massa * q
            return `• ${POR_SIMBOLO[el].nome} (${el}): ${n(m, 3)} g de ${n(total, 3)} = *${n(m / total * 100, 2)}%*`
        })
        const maior = Object.entries(atomos).reduce((a, b) => (POR_SIMBOLO[a[0]].massa * a[1] > POR_SIMBOLO[b[0]].massa * b[1] ? a : b))
        return resultado(
            `Em ${formula}, o elemento que mais pesa é o *${POR_SIMBOLO[maior[0]].nome}*.`,
            [`Massa molar total: ${n(total, 3)} g/mol`, ...linhas],
            'Os percentuais somam 100%. É assim que se confere a pureza e o teor de um produto.')
    }
})

T({
    chave: 'formulaminima', sub: 'Química', emoji: '🧩', titulo: 'Fórmula mínima pelos percentuais',
    descricao: 'Descobre a proporção dos átomos por análise',
    usage: '<elemento> <%> <elemento> <%> ...',
    examples: ['C 40 H 6,7 O 53,3 — vira CH2O', 'Na 39,3 Cl 60,7', 'Fe 69,9 O 30,1'],
    intro: 'O laboratório dá a porcentagem de cada elemento; eu devolvo a proporção mais simples entre os átomos.',
    calcular: (args, texto) => {
        const pares = [...String(texto).matchAll(/([A-Z][a-z]?)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/g)]
        if (pares.length < 2) erro('mande o símbolo e a porcentagem de cada elemento, tipo: C 40 H 6,7 O 53,3')
        const dados = pares.map(p => {
            const el = p[1]
            if (!POR_SIMBOLO[el]) erro(`não conheço o elemento ${el}`)
            const pc = Number(p[2].replace(',', '.'))
            return { el, pc, mols: pc / POR_SIMBOLO[el].massa }
        })
        const menor = Math.min(...dados.map(d => d.mols))
        let proporcoes = dados.map(d => d.mols / menor)
        let fator = 1
        for (let f = 1; f <= 8; f++) {
            if (proporcoes.every(p => Math.abs(p * f - Math.round(p * f)) < 0.08)) { fator = f; break }
        }
        const inteiros = proporcoes.map(p => Math.round(p * fator))
        const formula = dados.map((d, i) => d.el + (inteiros[i] > 1 ? inteiros[i] : '')).join('')
        return resultado(
            `A fórmula mínima é *${formula}*.`,
            [
                ...dados.map(d => `• ${d.el}: ${n(d.pc, 2)}% ÷ ${n(POR_SIMBOLO[d.el].massa, 3)} = ${n(d.mols, 5)} mol`),
                `Divido todos pelo menor (${n(menor, 5)}): ${proporcoes.map(p => n(p, 3)).join(' : ')}`,
                fator > 1 ? `Multiplico por ${fator} para dar inteiro: ${inteiros.join(' : ')}` : `Já deu inteiro: ${inteiros.join(' : ')}`
            ],
            'A fórmula mínima dá a proporção; a fórmula molecular pode ser um múltiplo dela (CH2O vira C6H12O6 na glicose).')
    }
})

T({
    chave: 'balanceamento', sub: 'Química', emoji: '⚖️', titulo: 'Balancear equação química',
    descricao: 'Acha os coeficientes que fecham a equação',
    usage: '<reagentes> -> <produtos>',
    examples: ['H2 + O2 -> H2O — a formação da água', 'C3H8 + O2 -> CO2 + H2O — queima do gás de cozinha', 'Fe + O2 -> Fe2O3'],
    intro: 'Nada se perde: o número de átomos de cada elemento tem de ser igual dos dois lados. Eu acho os coeficientes que fazem isso.',
    dica: 'Separe os lados com uma seta: H2 + O2 -> H2O.',
    calcular: (args, texto) => {
        const { coeficientes, reagentes, produtos } = balancear(texto)
        const escreve = (lista, deslocamento) => lista.map((f, i) => {
            const c = coeficientes[i + deslocamento]
            return (c === 1 ? '' : c) + f
        }).join(' + ')
        const equacao = `${escreve(reagentes, 0)} → ${escreve(produtos, reagentes.length)}`
        const especies = [...reagentes, ...produtos]
        const comps = especies.map(contarAtomos)
        const elementos = [...new Set(comps.flatMap(c => Object.keys(c)))]
        const conferencia = elementos.map(el => {
            const esq = comps.slice(0, reagentes.length).reduce((s, c, i) => s + (c[el] || 0) * coeficientes[i], 0)
            const dir = comps.slice(reagentes.length).reduce((s, c, i) => s + (c[el] || 0) * coeficientes[i + reagentes.length], 0)
            return `• ${el}: ${esq} de um lado e ${dir} do outro`
        })
        return resultado(
            `Equação balanceada: *${equacao}*`,
            [`1) Coeficientes encontrados: ${coeficientes.join(', ')}`, '2) Conferindo átomo por átomo:', ...conferencia],
            'Esses são os menores números inteiros que fecham a conta — é a lei da conservação da massa, de Lavoisier.')
    }
})

// ════════════════════════════════════════════════════════════
//  31. QUÍMICA — soluções
// ════════════════════════════════════════════════════════════

T({
    chave: 'concentracaocomum', sub: 'Química', emoji: '🥤', titulo: 'Concentração comum (g/L)',
    descricao: 'Gramas de soluto por litro de solução',
    usage: '<massa do soluto em g> <volume em litros>',
    examples: ['20 0,5 — 20 g em meio litro', '5 2', '58,5 1'],
    intro: 'A concentração mais direta: quantos gramas de soluto existem em cada litro de solução.',
    calcular: (args) => {
        const [m, v] = numeros(args, 2, ['massa do soluto', 'volume em litros'])
        exigirPositivo(v, 'volume')
        const c = m / v
        return resultado(
            `A concentração é de *${n(c, 4)} g/L*.`,
            [`1) Concentração = massa do soluto ÷ volume da solução`, `2) ${n(m, 3)} g ÷ ${n(v, 4)} L`, `3) C = ${n(c, 4)} g/L`],
            `Em 100 mL dessa solução haveria ${n(c / 10, 4)} g de soluto.`)
    }
})

T({
    chave: 'molaridade', sub: 'Química', emoji: '🧫', titulo: 'Concentração em mol/L',
    descricao: 'Molaridade a partir da massa e do volume',
    usage: '<massa em g> <fórmula> <volume em litros>',
    examples: ['58,5 NaCl 1 — um mol de sal por litro', '40 NaOH 2', '98 H2SO4 0,5'],
    intro: 'A molaridade conta mols por litro. É a concentração que os químicos usam de verdade.',
    calcular: (args, texto) => {
        const formula = (String(texto).match(/[A-Z][A-Za-z0-9().]*/) || [])[0]
        if (!formula) erro('faltou a fórmula da substância')
        const vs = extrairNumeros(String(texto))
        if (vs.length < 2) erro('preciso da massa em gramas e do volume em litros')
        const massa = vs[0], volume = vs[vs.length - 1]
        exigirPositivo(volume, 'volume')
        const { total } = massaMolar(formula)
        const mols = massa / total
        const M = mols / volume
        return resultado(
            `A concentração é de *${n(M, 5)} mol/L*.`,
            [`1) Massa molar de ${formula} = ${n(total, 3)} g/mol`, `2) Mols = ${n(massa, 3)} ÷ ${n(total, 3)} = ${n(mols, 5)} mol`, `3) Molaridade = ${n(mols, 5)} ÷ ${n(volume, 4)} L = ${n(M, 5)} mol/L`],
            `Em concentração comum isso é ${n(massa / volume, 4)} g/L.`)
    }
})

T({
    chave: 'diluicao', sub: 'Química', emoji: '💧', titulo: 'Diluição de solução',
    descricao: 'Concentração final ao acrescentar água',
    usage: '<concentração inicial> <volume inicial> <volume final>',
    examples: ['2 0,5 1 — meio litro a 2 mol/L virando 1 litro', '10 100 250', '0,5 50 200'],
    intro: 'Acrescentar água não cria nem destrói soluto: só espalha a mesma quantidade num volume maior.',
    calcular: (args) => {
        const [c1, v1, v2] = numeros(args, 3, ['concentração inicial', 'volume inicial', 'volume final'])
        exigirPositivo(v2, 'volume final')
        if (v2 < v1) erro('na diluição o volume final é maior que o inicial')
        const c2 = c1 * v1 / v2
        return resultado(
            `A concentração final é *${n(c2, 5)}* (na mesma unidade da inicial).`,
            [`1) Na diluição vale C1 × V1 = C2 × V2`, `2) ${n(c1, 4)} × ${n(v1, 4)} = ${n(c1 * v1, 4)}`, `3) C2 = ${n(c1 * v1, 4)} ÷ ${n(v2, 4)} = ${n(c2, 5)}`],
            `Foi preciso acrescentar ${n(v2 - v1, 4)} de água. A solução ficou ${n(v2 / v1, 3)} vezes mais fraca.`)
    }
})

T({
    chave: 'misturasolucoes', sub: 'Química', emoji: '🫗', titulo: 'Mistura de duas soluções',
    descricao: 'Concentração final ao juntar dois preparos',
    usage: '<C1> <V1> <C2> <V2>',
    examples: ['2 100 0,5 200 — juntando duas soluções', '1 50 3 150', '0,2 500 0,8 500'],
    intro: 'Misturando duas soluções do mesmo soluto, a quantidade total de soluto se soma e o volume também.',
    calcular: (args) => {
        const [c1, v1, c2, v2] = numeros(args, 4, ['C1', 'V1', 'C2', 'V2'])
        exigirPositivo(v1 + v2, 'volume total')
        const cf = (c1 * v1 + c2 * v2) / (v1 + v2)
        return resultado(
            `A concentração final é *${n(cf, 5)}*.`,
            [`1) Soluto da primeira: ${n(c1, 4)} × ${n(v1, 4)} = ${n(c1 * v1, 4)}`, `2) Soluto da segunda: ${n(c2, 4)} × ${n(v2, 4)} = ${n(c2 * v2, 4)}`, `3) Volume total: ${n(v1 + v2, 4)}`, `4) Concentração = ${n(c1 * v1 + c2 * v2, 4)} ÷ ${n(v1 + v2, 4)} = ${n(cf, 5)}`],
            'A concentração final fica sempre entre as duas originais — é uma média ponderada pelos volumes.')
    }
})

T({
    chave: 'titulomassa', sub: 'Química', emoji: '📉', titulo: 'Título em massa (%)',
    descricao: 'Porcentagem de soluto na massa da solução',
    usage: '<massa do soluto> <massa da solução>',
    examples: ['5 100 — 5 g em 100 g de solução', '20 250', '3,5 1000 — a salinidade do mar'],
    intro: 'O título é a fração do soluto na massa total. É o que aparece no rótulo como "10% de álcool".',
    calcular: (args) => {
        const [ms, msol] = numeros(args, 2, ['massa do soluto', 'massa da solução'])
        exigirPositivo(msol, 'massa da solução')
        if (ms > msol) erro('o soluto não pode pesar mais que a solução inteira')
        const t = ms / msol
        return resultado(
            `O título é *${n(t * 100, 4)}%* em massa.`,
            [`1) Título = massa do soluto ÷ massa da solução`, `2) ${n(ms, 4)} ÷ ${n(msol, 4)} = ${n(t, 6)}`, `3) Em porcentagem: ${n(t * 100, 4)}%`],
            `Os outros ${n((1 - t) * 100, 4)}% são solvente: ${n(msol - ms, 4)} de massa.`)
    }
})

T({
    chave: 'ppm', sub: 'Química', emoji: '🔬', titulo: 'Partes por milhão (ppm)',
    descricao: 'Concentração de quantidades muito pequenas',
    usage: '<massa do soluto> <massa da solução>',
    examples: ['0,002 1000 — 2 mg em 1 kg', '0,5 1000000', '0,0015 500'],
    intro: 'Quando a quantidade é minúscula (flúor na água, poluente no ar), usa-se partes por milhão em vez de porcentagem.',
    dica: 'Use a mesma unidade nos dois números: gramas e gramas, ou quilos e quilos.',
    calcular: (args) => {
        const [ms, msol] = numeros(args, 2, ['massa do soluto', 'massa da solução'])
        exigirPositivo(msol, 'massa da solução')
        const ppmValor = ms / msol * 1e6
        return resultado(
            `A concentração é de *${n(ppmValor, 4)} ppm*.`,
            [`1) ppm = (massa do soluto ÷ massa da solução) × 1.000.000`, `2) ${n(ms, 6)} ÷ ${n(msol, 4)} = ${n(ms / msol, 10)}`, `3) × 1.000.000 = ${n(ppmValor, 4)} ppm`],
            `Em porcentagem isso é ${n(ms / msol * 100, 8)}%. Em água potável, 1 ppm é 1 miligrama por litro.`)
    }
})

T({
    chave: 'molalidade', sub: 'Química', emoji: '🧂', titulo: 'Molalidade (mol/kg)',
    descricao: 'Mols de soluto por quilo de solvente',
    usage: '<mols do soluto> <massa do solvente em kg>',
    examples: ['0,5 1 — meio mol por quilo', '2 0,25', '0,1 0,5'],
    intro: 'A molalidade usa a massa do solvente, não o volume. Por isso ela não muda com a temperatura.',
    calcular: (args) => {
        const [mols, kg] = numeros(args, 2, ['mols do soluto', 'massa do solvente em kg'])
        exigirPositivo(kg, 'massa do solvente')
        const w = mols / kg
        return resultado(
            `A molalidade é de *${n(w, 5)} mol/kg*.`,
            [`1) Molalidade = mols do soluto ÷ massa do solvente em kg`, `2) ${n(mols, 5)} ÷ ${n(kg, 4)} kg`, `3) W = ${n(w, 5)} molal`],
            'Diferente da molaridade, a molalidade não muda quando a solução esquenta, porque massa não dilata.')
    }
})

// ════════════════════════════════════════════════════════════
//  32. QUÍMICA — ácidos, bases e funções inorgânicas
// ════════════════════════════════════════════════════════════

T({
    chave: 'ph', sub: 'Química', emoji: '🧴', titulo: 'pH pela concentração de H+',
    descricao: 'Calcula o pH e diz se é ácido ou básico',
    usage: '<concentração de H+ em mol/L>',
    examples: ['0,001 — solução ácida', '1e-7 — água pura', '0,0000000001'],
    intro: 'O pH é o logaritmo negativo da concentração de H+. Abaixo de 7 é ácido, acima é básico.',
    dica: 'Pode escrever em notação científica: 1e-7 ou 1 x 10^-7.',
    calcular: (args, texto) => {
        const h = paraNumero(String(texto).trim().split(/\s+/)[0], 'concentração de H+')
        exigirPositivo(h, 'concentração de H+')
        const pH = -Math.log10(h)
        const oh = 1e-14 / h
        return resultado(
            `O pH é *${n(pH, 3)}* — solução *${pH < 6.99 ? 'ácida' : pH > 7.01 ? 'básica' : 'neutra'}*.`,
            [`1) pH = -log[H+]`, `2) [H+] = ${sci(h, 3)} mol/L`, `3) pH = ${n(pH, 3)}`, `4) pOH = 14 - ${n(pH, 3)} = ${n(14 - pH, 3)} e [OH-] = ${sci(oh, 3)} mol/L`],
            'Cada unidade de pH é dez vezes mais ácido ou mais básico. Suco de limão tem pH 2; sabão, perto de 10.')
    }
})

T({
    chave: 'hidrogenionica', sub: 'Química', emoji: '💧', titulo: 'Concentração de H+ pelo pH',
    descricao: 'O caminho de volta: do pH para o mol/L',
    usage: '<pH>',
    examples: ['3 — solução bem ácida', '7 — neutra', '11,5'],
    intro: 'Sabendo o pH, dá para voltar à concentração de H+ e de OH-.',
    calcular: (args) => {
        const [pH] = numeros(args, 1, ['pH'])
        exigirFaixa(pH, -2, 16, 'pH')
        const h = Math.pow(10, -pH)
        const oh = 1e-14 / h
        return resultado(
            `Com pH ${n(pH, 3)}, a concentração de H+ é *${sci(h, 3)} mol/L*.`,
            [`1) [H+] = 10 elevado a -pH`, `2) [H+] = 10^-${n(pH, 3)} = ${sci(h, 3)} mol/L`, `3) [OH-] = 10^-14 ÷ [H+] = ${sci(oh, 3)} mol/L`, `4) pOH = ${n(14 - pH, 3)}`],
            pH < 7 ? 'Mais H+ que OH-: solução ácida.' : pH > 7 ? 'Mais OH- que H+: solução básica.' : 'H+ e OH- empatados: solução neutra.')
    }
})

T({
    chave: 'poh', sub: 'Química', emoji: '🔄', titulo: 'pH e pOH',
    descricao: 'Converte entre pH e pOH (a soma dá 14)',
    usage: '<valor> [poh]',
    examples: ['4 — pH 4 vira pOH quanto', '9 poh — informando o pOH', '7'],
    intro: 'Na água a 25 °C, pH mais pOH sempre dá 14. Sabendo um, o outro sai de graça.',
    dica: 'Escreva "poh" no fim se o valor que você mandou é o pOH.',
    calcular: (args, texto) => {
        const [v] = numeros(args, 1, ['valor'])
        exigirFaixa(v, -2, 16, 'valor')
        const ehPoh = /poh/i.test(texto)
        const pH = ehPoh ? 14 - v : v
        const pOH = 14 - pH
        return resultado(
            `pH = *${n(pH, 3)}* e pOH = *${n(pOH, 3)}*.`,
            [`1) Você informou o ${ehPoh ? 'pOH' : 'pH'} = ${n(v, 3)}`, `2) pH + pOH = 14`, `3) O outro valor é 14 - ${n(v, 3)} = ${n(14 - v, 3)}`, `4) [H+] = ${sci(Math.pow(10, -pH), 2)} e [OH-] = ${sci(Math.pow(10, -pOH), 2)} mol/L`],
            'Esse 14 vem do produto iônico da água, que vale 10^-14 a 25 °C.')
    }
})

T({
    chave: 'phacidoforte', sub: 'Química', emoji: '🍋', titulo: 'pH de um ácido forte',
    descricao: 'pH pela concentração de um ácido forte',
    usage: '<concentração em mol/L> [nº de hidrogênios]',
    examples: ['0,01 — HCl a 0,01 mol/L', '0,05 2 — ácido sulfúrico', '0,1'],
    intro: 'Ácido forte ioniza quase tudo, então a concentração de H+ é praticamente a do ácido (vezes o número de hidrogênios).',
    dica: 'Ácidos fortes comuns: HCl, HBr, HI, HNO3 (1 hidrogênio) e H2SO4 (2).',
    calcular: (args) => {
        const vs = numeros(args, 1, ['concentração'])
        const c = vs[0]
        const hidrogenios = vs.length > 1 ? Math.round(vs[1]) : 1
        exigirPositivo(c, 'concentração')
        exigirFaixa(hidrogenios, 1, 3, 'número de hidrogênios')
        const h = c * hidrogenios
        const pH = -Math.log10(h)
        return resultado(
            `O pH é aproximadamente *${n(pH, 3)}*.`,
            [`1) Ácido forte ioniza praticamente 100%`, `2) [H+] = ${n(c, 6)} × ${hidrogenios} = ${n(h, 8)} mol/L`, `3) pH = -log(${n(h, 8)}) = ${n(pH, 3)}`],
            'Para ácido fraco esta conta não vale: ele ioniza só um pedaço, e aí entra a constante de ionização.')
    }
})

T({
    chave: 'classificafuncao', sub: 'Química', emoji: '🏷️', titulo: 'Função inorgânica da fórmula',
    descricao: 'Diz se é ácido, base, sal ou óxido',
    usage: '<fórmula>',
    examples: ['H2SO4 — ácido sulfúrico', 'NaOH — soda cáustica', 'CaCO3 — calcário'],
    intro: 'As quatro famílias da química inorgânica, reconhecidas pelo formato da fórmula.',
    calcular: (args, texto) => {
        const formula = String(texto).trim().split(/\s+/)[0]
        const atomos = contarAtomos(formula)
        const elementos = Object.keys(atomos)
        const temOH = /\(OH\)|OH/.test(formula)
        const comecaComH = /^H[^a-z]/.test(formula) || /^H\d/.test(formula)
        let funcao, motivo
        if (elementos.length === 2 && atomos.O && !atomos.H) {
            funcao = 'óxido'
            motivo = 'Dois elementos, sendo um deles o oxigênio, e o oxigênio é o mais eletronegativo.'
        } else if (temOH && ehMetal(elementos[0])) {
            funcao = 'base (hidróxido)'
            motivo = `Começa com um metal (${POR_SIMBOLO[elementos[0]].nome}) e tem o grupo OH, que se solta como íon hidroxila.`
        } else if (comecaComH && !ehMetal(elementos[1] || elementos[0])) {
            funcao = 'ácido'
            motivo = 'Começa com hidrogênio ligado a não metal: em água ele solta H+.'
        } else if (ehMetal(elementos[0])) {
            funcao = 'sal'
            motivo = `Tem um metal (${POR_SIMBOLO[elementos[0]].nome}) junto com um ânion, sem OH nem só oxigênio. Vem da reação de um ácido com uma base.`
        } else {
            funcao = 'composto molecular'
            motivo = 'Só não metais, sem hidrogênio ácido nem oxigênio como par único — não se encaixa nas quatro funções clássicas.'
        }
        const { total } = massaMolar(formula)
        return resultado(
            `*${formula}* é ${funcao === 'ácido' || funcao === 'sal' ? 'um' : 'um(a)'} *${funcao}*.`,
            [`1) Elementos na fórmula: ${elementos.join(', ')}`, `2) ${motivo}`, `3) Massa molar: ${n(total, 3)} g/mol`],
            'Ácido + base dá sal e água: é a reação de neutralização, a mais famosa da química inorgânica.')
    }
})

// ════════════════════════════════════════════════════════════
//  33. QUÍMICA — ligações e estrutura
// ════════════════════════════════════════════════════════════

T({
    chave: 'tipoligacao', sub: 'Química', emoji: '🔗', titulo: 'Tipo de ligação química',
    descricao: 'Iônica ou covalente pela eletronegatividade',
    usage: '<elemento 1> <elemento 2>',
    examples: ['Na Cl — o sal de cozinha', 'H O — a água', 'C C'],
    intro: 'A diferença de eletronegatividade decide: se for grande, um rouba o elétron do outro (iônica); se for pequena, eles dividem (covalente).',
    calcular: (args, texto) => {
        const partes = String(texto).trim().split(/\s+/)
        if (partes.length < 2) erro('preciso de dois elementos')
        const a = acharElemento(partes[0]), b = acharElemento(partes[1])
        if (a.eletro === null || b.eletro === null) erro('um desses elementos não tem eletronegatividade tabelada (gases nobres quase não fazem ligação)')
        const dif = Math.abs(a.eletro - b.eletro)
        const metalMetal = ehMetal(a.simbolo) && ehMetal(b.simbolo)
        const tipo = metalMetal ? 'metálica' : dif >= 1.7 ? 'iônica' : dif >= 0.4 ? 'covalente polar' : 'covalente apolar'
        const explica = metalMetal ? 'Dois metais formam ligação metálica: os elétrons ficam livres num "mar" que conduz eletricidade.'
            : dif >= 1.7 ? 'A diferença é grande: o mais eletronegativo arranca o elétron e os dois viram íons de cargas opostas.'
                : dif >= 0.4 ? 'A diferença é média: eles dividem o par de elétrons, mas um puxa mais que o outro.'
                    : 'A diferença é pequena: dividem o par de elétrons quase igualmente.'
        return resultado(
            `A ligação entre ${a.nome} e ${b.nome} é *${tipo}*.`,
            [`1) Eletronegatividade do ${a.nome}: ${n(a.eletro, 2)}`, `2) Eletronegatividade do ${b.nome}: ${n(b.eletro, 2)}`, `3) Diferença: ${n(dif, 2)}`, `4) ${explica}`],
            'O corte em 1,7 é uma referência prática, não uma fronteira exata: na natureza a transição é gradual.')
    }
})

T({
    chave: 'geometria', sub: 'Química', emoji: '📐', titulo: 'Geometria molecular',
    descricao: 'A forma da molécula pelo modelo VSEPR',
    usage: '<fórmula da molécula>',
    examples: ['H2O — a água', 'CO2', 'NH3 — a amônia'],
    intro: 'Os pares de elétrons se repelem e empurram os átomos para longe uns dos outros. É isso que dá forma à molécula.',
    dica: 'Moléculas que eu conheço: H2O, CO2, NH3, CH4, BF3, SO2, SO3, HCl, H2S, CCl4, C2H4, N2, O2.',
    calcular: (args, texto) => {
        const formula = String(texto).trim().split(/\s+/)[0]
        const chave = Object.keys(MOLECULAS).find(k => k.toLowerCase() === formula.toLowerCase())
        if (!chave) erro(`ainda não tenho a geometria de "${formula}" na minha tabela`)
        const m = MOLECULAS[chave]
        const { total } = massaMolar(chave)
        return {
            intro: `*${chave}* tem geometria *${m.geometria}* e é uma molécula *${m.polar ? 'polar' : 'apolar'}*.`,
            secoes: [
                ficha('Por que essa forma', [m.nota], '💡'),
                ficha('Dados', [F_campo('Geometria', m.geometria), F_campo('Polaridade', m.polar ? 'polar' : 'apolar'), F_campo('Massa molar', n(total, 3) + ' g/mol')])
            ],
            dica: 'Molécula polar dissolve substância polar; apolar dissolve apolar. Por isso óleo e água não se misturam.'
        }
    }
})

T({
    chave: 'polaridade', sub: 'Química', emoji: '🧲', titulo: 'Polaridade e solubilidade',
    descricao: 'Se a molécula é polar e no que ela dissolve',
    usage: '<fórmula da molécula>',
    examples: ['CO2 — apolar apesar das ligações polares', 'H2O', 'CCl4'],
    intro: 'Ligação polar não garante molécula polar: se a forma for simétrica, as polaridades se anulam.',
    dica: 'Moléculas que eu conheço: H2O, CO2, NH3, CH4, BF3, SO2, SO3, HCl, H2S, CCl4, C2H4, N2, O2.',
    calcular: (args, texto) => {
        const formula = String(texto).trim().split(/\s+/)[0]
        const chave = Object.keys(MOLECULAS).find(k => k.toLowerCase() === formula.toLowerCase())
        if (!chave) erro(`ainda não tenho "${formula}" na minha tabela de moléculas`)
        const m = MOLECULAS[chave]
        return resultado(
            `*${chave}* é uma molécula *${m.polar ? 'polar' : 'apolar'}*.`,
            [`1) Geometria: ${m.geometria}`, `2) ${m.nota}`, `3) Por isso ela ${m.polar ? 'dissolve bem em água e em outros solventes polares' : 'dissolve em gasolina, éter e outros solventes apolares, mas não em água'}`],
            'A regra de bolso é "semelhante dissolve semelhante" — e é por isso que sabão funciona: ele tem uma ponta polar e outra apolar.')
    }
})

T({
    chave: 'nox', sub: 'Química', emoji: '🔋', titulo: 'Número de oxidação (nox)',
    descricao: 'Calcula o nox de um elemento na fórmula',
    usage: '<fórmula> <elemento>',
    examples: ['H2SO4 S — o enxofre no ácido sulfúrico', 'KMnO4 Mn', 'Fe2O3 Fe'],
    intro: 'O nox diz quantos elétrons o átomo cedeu ou recebeu na ligação. Serve para balancear reações de oxirredução.',
    dica: 'Regras usadas: oxigênio -2, hidrogênio +1, alcalinos +1, alcalinoterrosos +2, flúor -1.',
    calcular: (args, texto) => {
        const partes = String(texto).trim().split(/\s+/)
        if (partes.length < 2) erro('mande a fórmula e depois o elemento, tipo: H2SO4 S')
        const formula = partes[0]
        const alvoBruto = partes[1]
        const alvo = alvoBruto[0].toUpperCase() + alvoBruto.slice(1).toLowerCase()
        const atomos = contarAtomos(formula)
        if (!atomos[alvo]) erro(`o elemento ${alvo} não aparece em ${formula}`)
        const peroxido = PEROXIDOS.has(formula)
        let somaConhecida = 0
        const linhas = []
        for (const [el, q] of Object.entries(atomos)) {
            if (el === alvo) continue
            let nox = NOX_FIXO[el]
            if (el === 'O' && peroxido) nox = -1
            if (nox === undefined) erro(`não sei o nox fixo do ${POR_SIMBOLO[el].nome} — só consigo resolver quando resta uma incógnita só`)
            somaConhecida += nox * q
            linhas.push(`• ${el}: nox ${nox > 0 ? '+' : ''}${nox} × ${q} átomo(s) = ${nox * q}`)
        }
        const qAlvo = atomos[alvo]
        const noxAlvo = (0 - somaConhecida) / qAlvo
        return resultado(
            `Em *${formula}*, o nox do *${POR_SIMBOLO[alvo].nome}* é *${noxAlvo > 0 ? '+' : ''}${n(noxAlvo, 3)}*.`,
            [
                `1) A soma dos nox num composto neutro tem de dar zero`,
                ...linhas,
                `2) Os conhecidos somam ${somaConhecida}`,
                `3) Sobra para os ${qAlvo} átomo(s) de ${alvo}: ${-somaConhecida} ÷ ${qAlvo} = ${noxAlvo > 0 ? '+' : ''}${n(noxAlvo, 3)}`
            ],
            peroxido ? 'Atenção: em peróxido o oxigênio vale -1, não -2.' : 'Nox positivo quer dizer que o átomo cedeu elétrons; negativo, que recebeu.')
    }
})

// ════════════════════════════════════════════════════════════
//  34. QUÍMICA — gases
// ════════════════════════════════════════════════════════════

const R_GASES = 0.082 // atm·L/(mol·K)

T({
    chave: 'gasesideais', sub: 'Química', emoji: '🎈', titulo: 'Equação dos gases ideais',
    descricao: 'Quantos mols há num gás por P, V e T',
    usage: '<pressão em atm> <volume em L> <temperatura em °C>',
    examples: ['1 22,4 0 — as condições normais', '2 10 27', '1 5 25'],
    intro: 'PV = nRT: com pressão, volume e temperatura, eu descubro quantos mols de gás existem ali.',
    calcular: (args) => {
        const [p, v, tc] = numeros(args, 3, ['pressão', 'volume', 'temperatura'])
        exigirPositivo(p, 'pressão'); exigirPositivo(v, 'volume')
        const tk = tc + 273.15
        if (tk <= 0) erro('abaixo do zero absoluto não existe gás')
        const mols = p * v / (R_GASES * tk)
        return resultado(
            `Há *${n(mols, 5)} mol* de gás.`,
            [`1) Converto a temperatura: ${n(tc, 2)} °C + 273,15 = ${n(tk, 2)} K`, `2) PV = nRT, então n = PV ÷ RT`, `3) n = (${n(p, 3)} × ${n(v, 3)}) ÷ (0,082 × ${n(tk, 2)})`, `4) n = ${n(mols, 5)} mol`],
            `Isso corresponde a ${n(mols * 6.022e23, 4)} moléculas. Na CNTP esse gás ocuparia ${n(mols * 22.4, 3)} L.`)
    }
})

T({
    chave: 'boyle', sub: 'Química', emoji: '🗜️', titulo: 'Lei de Boyle (temperatura fixa)',
    descricao: 'Volume final ao mudar a pressão do gás',
    usage: '<pressão 1> <volume 1> <pressão 2>',
    examples: ['1 10 2 — dobrando a pressão', '2 5 0,5', '1 100 4'],
    intro: 'Com a temperatura parada, apertar o gás pela metade do volume dobra a pressão. Um cresce quando o outro diminui.',
    calcular: (args) => {
        const [p1, v1, p2] = numeros(args, 3, ['pressão inicial', 'volume inicial', 'pressão final'])
        exigirPositivo(p2, 'pressão final')
        const v2 = p1 * v1 / p2
        return resultado(
            `O volume final é *${n(v2, 5)}*.`,
            [`1) A temperatura não muda, então P1 × V1 = P2 × V2`, `2) ${n(p1, 4)} × ${n(v1, 4)} = ${n(p1 * v1, 4)}`, `3) V2 = ${n(p1 * v1, 4)} ÷ ${n(p2, 4)} = ${n(v2, 5)}`],
            v2 < v1 ? 'O gás foi comprimido: mais pressão, menos espaço.' : 'O gás se expandiu: menos pressão, mais espaço.')
    }
})

T({
    chave: 'charles', sub: 'Química', emoji: '🌡️', titulo: 'Lei de Charles (pressão fixa)',
    descricao: 'Volume final ao mudar a temperatura do gás',
    usage: '<volume 1> <temperatura 1 em °C> <temperatura 2 em °C>',
    examples: ['10 27 127 — esquentando o gás', '5 0 100', '2 25 -10'],
    intro: 'Com a pressão parada, gás quente ocupa mais espaço. É por isso que o balão de ar quente sobe.',
    calcular: (args) => {
        const [v1, t1c, t2c] = numeros(args, 3, ['volume inicial', 'temperatura inicial', 'temperatura final'])
        const t1 = t1c + 273.15, t2 = t2c + 273.15
        if (t1 <= 0 || t2 <= 0) erro('abaixo do zero absoluto não existe gás')
        const v2 = v1 * t2 / t1
        return resultado(
            `O volume final é *${n(v2, 5)}*.`,
            [`1) Converto para kelvin: ${n(t1c, 2)} °C = ${n(t1, 2)} K e ${n(t2c, 2)} °C = ${n(t2, 2)} K`, `2) V1 ÷ T1 = V2 ÷ T2`, `3) V2 = ${n(v1, 4)} × ${n(t2, 2)} ÷ ${n(t1, 2)} = ${n(v2, 5)}`],
            'Essa conta só funciona em kelvin. Usar Celsius direto dá resultado errado, inclusive negativo.')
    }
})

T({
    chave: 'equacaogeralgases', sub: 'Química', emoji: '🔀', titulo: 'Equação geral dos gases',
    descricao: 'Volume final mudando pressão e temperatura',
    usage: '<P1> <V1> <T1 °C> <P2> <T2 °C>',
    examples: ['1 10 27 2 127 — mudando tudo de uma vez', '2 5 0 1 100', '1 22,4 0 1,5 50'],
    intro: 'Quando pressão e temperatura mudam ao mesmo tempo, esta é a equação que junta tudo.',
    calcular: (args) => {
        const [p1, v1, t1c, p2, t2c] = numeros(args, 5, ['P1', 'V1', 'T1', 'P2', 'T2'])
        const t1 = t1c + 273.15, t2 = t2c + 273.15
        exigirPositivo(p2, 'pressão final')
        if (t1 <= 0 || t2 <= 0) erro('abaixo do zero absoluto não existe gás')
        const v2 = p1 * v1 * t2 / (t1 * p2)
        return resultado(
            `O volume final é *${n(v2, 5)}*.`,
            [`1) Temperaturas em kelvin: ${n(t1, 2)} K e ${n(t2, 2)} K`, `2) (P1 × V1) ÷ T1 = (P2 × V2) ÷ T2`, `3) V2 = (${n(p1, 3)} × ${n(v1, 3)} × ${n(t2, 2)}) ÷ (${n(t1, 2)} × ${n(p2, 3)})`, `4) V2 = ${n(v2, 5)}`],
            'Essa equação contém as leis de Boyle, Charles e Gay-Lussac: basta travar uma das grandezas.')
    }
})

T({
    chave: 'densidadegas', sub: 'Química', emoji: '💨', titulo: 'Densidade de um gás',
    descricao: 'Densidade de um gás e se ele sobe ou desce no ar',
    usage: '<fórmula ou massa molar> [pressão atm] [temperatura °C]',
    examples: ['CO2 — gás carbônico na CNTP', 'He — hélio', '44 1 25 — pela massa molar'],
    intro: 'A densidade de um gás vem da massa molar dividida pelo volume molar. É ela que diz se o gás sobe ou fica rente ao chão.',
    calcular: (args, texto) => {
        const primeiro = String(texto).trim().split(/\s+/)[0]
        let M, nomeGas = primeiro
        if (/^[A-Z]/.test(primeiro)) { M = massaMolar(primeiro).total }
        else { M = paraNumero(primeiro, 'massa molar'); nomeGas = `massa molar ${n(M, 2)}` }
        const vs = extrairNumeros(String(texto).replace(primeiro, ''))
        const p = vs.length > 0 ? vs[0] : 1
        const tc = vs.length > 1 ? vs[1] : 0
        const tk = tc + 273.15
        exigirPositivo(p, 'pressão')
        if (tk <= 0) erro('abaixo do zero absoluto não existe gás')
        const d = p * M / (R_GASES * tk)
        const dAr = p * 28.96 / (R_GASES * tk)
        return resultado(
            `A densidade de ${nomeGas} é *${n(d, 5)} g/L* a ${n(p, 2)} atm e ${n(tc, 1)} °C.`,
            [`1) Massa molar = ${n(M, 3)} g/mol`, `2) d = (P × M) ÷ (R × T) = (${n(p, 2)} × ${n(M, 3)}) ÷ (0,082 × ${n(tk, 2)})`, `3) d = ${n(d, 5)} g/L`],
            d > dAr ? `Mais denso que o ar (${n(dAr, 4)} g/L): esse gás desce e se acumula perto do chão.` : `Menos denso que o ar (${n(dAr, 4)} g/L): esse gás sobe.`)
    }
})

// ════════════════════════════════════════════════════════════
//  35. QUÍMICA — orgânica
// ════════════════════════════════════════════════════════════

T({
    chave: 'hidrocarboneto', sub: 'Química', emoji: '🛢️', titulo: 'Hidrocarboneto por número de carbonos',
    descricao: 'Nome, fórmula e massa molar de um hidrocarboneto',
    usage: '<número de carbonos> [alcano|alceno|alcino]',
    examples: ['1 alcano — o metano', '4 alcano — o butano do gás de cozinha', '2 alceno — o eteno'],
    intro: 'Diga quantos carbonos e o tipo de ligação que eu monto o nome, a fórmula e a massa molar.',
    dica: 'Alcano só tem ligação simples, alceno tem uma dupla, alcino tem uma tripla.',
    calcular: (args, texto) => {
        const [c] = numeros(args, 1, ['número de carbonos'])
        const nc = Math.round(c)
        exigirFaixa(nc, 1, 12, 'número de carbonos')
        const t = chaveBusca(texto)
        const tipo = /alcino|ino\b/.test(t) ? 'alcino' : /alceno|eno\b/.test(t) ? 'alceno' : 'alcano'
        if (tipo !== 'alcano' && nc < 2) erro('alceno e alcino precisam de pelo menos 2 carbonos')
        const h = tipo === 'alcano' ? 2 * nc + 2 : tipo === 'alceno' ? 2 * nc : 2 * nc - 2
        const sufixo = tipo === 'alcano' ? 'ano' : tipo === 'alceno' ? 'eno' : 'ino'
        const nome = PREFIXO_CARBONO[nc] + sufixo
        const formula = `C${nc > 1 ? nc : ''}H${h}`
        const { total } = massaMolar(formula)
        const estado = nc <= 4 ? 'gasoso' : nc <= 17 ? 'líquido' : 'sólido'
        return resultado(
            `São ${nc} carbono(s) num ${tipo}: *${nome}*, fórmula *${formula}*, massa molar *${n(total, 3)} g/mol*.`,
            [
                `1) Prefixo para ${nc} carbono(s): ${PREFIXO_CARBONO[nc]}-`,
                `2) Sufixo de ${tipo}: -${sufixo}`,
                `3) Fórmula geral do ${tipo}: ${tipo === 'alcano' ? 'CnH2n+2' : tipo === 'alceno' ? 'CnH2n' : 'CnH2n-2'} → ${formula}`,
                `4) Massa molar: ${n(total, 3)} g/mol`
            ],
            `À temperatura ambiente esse hidrocarboneto é ${estado}. Os de 1 a 4 carbonos são gases (o gás de cozinha é propano e butano).`)
    }
})

T({
    chave: 'funcaoorganica', sub: 'Química', emoji: '🧬', titulo: 'Funções orgânicas',
    descricao: 'Grupo característico, sufixo e exemplos reais',
    usage: '<nome da função>',
    examples: ['alcool — a função do etanol', 'ester — o cheiro das frutas', 'acido'],
    intro: 'Cada função orgânica tem um grupo de átomos que manda no comportamento da molécula inteira.',
    dica: 'Funções: álcool, fenol, aldeído, cetona, ácido, éster, éter, amina, amida, haleto, hidrocarboneto.',
    calcular: (args, texto) => {
        const busca = chaveBusca(texto)
        const achada = Object.entries(FUNCOES_ORGANICAS).find(([k, v]) => busca.includes(k) || k.includes(busca) || chaveBusca(v.nome).includes(busca))
        if (!achada) erro(`não conheço a função "${texto}"`)
        const f = achada[1]
        return {
            intro: `*${f.nome}* — grupo característico: *${f.grupo}*.`,
            secoes: [
                ficha('Como reconhecer', [F_campo('Grupo', f.grupo), F_campo('Terminação do nome', f.sufixo), F_campo('Exemplos', f.exemplos)]),
                ficha('O que isso muda', [f.nota], '💡')
            ],
            dica: 'O grupo funcional é o que define as reações: o resto da cadeia quase não interfere.'
        }
    }
})

T({
    chave: 'nomenclaturaorganica', sub: 'Química', emoji: '✍️', titulo: 'Montar o nome de um composto',
    descricao: 'Nome e fórmula pelo nº de carbonos e a função',
    usage: '<número de carbonos> <função>',
    examples: ['2 alcool — o etanol', '1 aldeido — o formol', '3 cetona — a acetona'],
    intro: 'A nomenclatura oficial é um quebra-cabeça de três peças: prefixo do número de carbonos, ligação e sufixo da função.',
    dica: 'Funções aceitas aqui: alcano, alcool, aldeido, cetona, acido, amina.',
    calcular: (args, texto) => {
        const [c] = numeros(args, 1, ['número de carbonos'])
        const nc = Math.round(c)
        exigirFaixa(nc, 1, 12, 'número de carbonos')
        const t = chaveBusca(texto)
        let funcao, sufixo, formula, obs
        if (/alcool|ol\b/.test(t)) {
            funcao = 'álcool'; sufixo = '-ol'; formula = `C${nc > 1 ? nc : ''}H${2 * nc + 2}O`
            obs = 'O grupo OH entra no lugar de um hidrogênio.'
        } else if (/aldeido|al\b/.test(t)) {
            funcao = 'aldeído'; sufixo = '-al'; formula = `C${nc > 1 ? nc : ''}H${2 * nc}O`
            obs = 'A carbonila fica sempre na ponta da cadeia.'
        } else if (/cetona|ona\b/.test(t)) {
            if (nc < 3) erro('cetona precisa de pelo menos 3 carbonos, porque a carbonila fica no meio')
            funcao = 'cetona'; sufixo = '-ona'; formula = `C${nc}H${2 * nc}O`
            obs = 'A carbonila fica entre dois carbonos.'
        } else if (/acido|oico/.test(t)) {
            funcao = 'ácido carboxílico'; sufixo = '-oico'; formula = `C${nc > 1 ? nc : ''}H${2 * nc}O2`
            obs = 'O grupo COOH é o que deixa a substância azeda.'
        } else if (/amina/.test(t)) {
            funcao = 'amina'; sufixo = '-amina'; formula = `C${nc > 1 ? nc : ''}H${2 * nc + 3}N`
            obs = 'Vem da amônia, trocando hidrogênio por cadeia de carbono.'
        } else {
            funcao = 'alcano'; sufixo = '-ano'; formula = `C${nc > 1 ? nc : ''}H${2 * nc + 2}`
            obs = 'Só ligações simples entre os carbonos.'
        }
        const nome = funcao === 'ácido carboxílico' ? `ácido ${PREFIXO_CARBONO[nc]}anoico`
            : PREFIXO_CARBONO[nc] + 'an' + sufixo.replace('-', '')
        const { total } = massaMolar(formula)
        return resultado(
            `Com ${nc} carbono(s), o ${funcao} é o *${nome}*, de fórmula *${formula}*.`,
            [`1) Prefixo de ${nc} carbono(s): ${PREFIXO_CARBONO[nc]}-`, `2) Ligação simples: -an-`, `3) Sufixo de ${funcao}: ${sufixo}`, `4) Fórmula: ${formula}, massa molar ${n(total, 3)} g/mol`, `5) ${obs}`],
            'Prefixo diz quantos carbonos, o meio diz o tipo de ligação e o sufixo diz a função. Sempre nessa ordem.')
    }
})

// ════════════════════════════════════════════════════════════
//  9. O que o resto do bot enxerga
// ════════════════════════════════════════════════════════════

/** Ordem de declaração = ordem dos comandos: LISTA[0] vira `mat1`. */
function listarTopicos() {
    return LISTA.map((t, i) => ({
        indice: i + 1,
        comando: `mat${i + 1}`,
        chave: t.chave,
        sub: t.sub,
        emoji: t.emoji,
        titulo: t.titulo,
        descricao: t.descricao,
        usage: t.usage,
        examples: t.examples.slice()
    }))
}

/** Busca um tópico pela posição (1 a 180), que é o número do comando. */
function topicoPorIndice(i) {
    return LISTA[Number(i) - 1] || null
}

module.exports = {
    responder,
    calcular,
    listarTopicos,
    topicoPorIndice,
    total: () => LISTA.length,
    EntradaInvalida,
    // expostos para o teste conferir conta por conta
    _interno: {
        mdc, mmc, fatoresPrimos, ehPrimo, fatorial, combinacoes, simplificar,
        coeficientes, coefsXY, massaMolar, balancear, distribuicaoEletronica,
        acharElemento, paraNumero, extrairNumeros, n, arred
    }
}
