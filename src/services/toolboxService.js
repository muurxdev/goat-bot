/**
 * Caixa de ferramentas da família .ferr: calculadoras, documentos, geradores e datas.
 *
 * ─── PROCEDÊNCIA DOS NÚMEROS ───
 * INSS: tabela de contribuição progressiva vigente desde 1º de janeiro de 2025,
 * com teto de R$ 8.157,41 e contribuição máxima de R$ 951,63. Está em
 * VIGENCIA_INSS e aparece em toda resposta que usa desconto de INSS.
 *
 * IRRF: tabela mensal vigente desde maio de 2025 (faixa isenta até R$ 2.428,80,
 * dedução por dependente de R$ 189,59 e desconto simplificado de R$ 607,20).
 * Está em VIGENCIA_IRRF. Se houve reajuste depois dessa data, o número muda e a
 * resposta avisa para conferir.
 *
 * FGTS: 8% do salário bruto (Lei 8.036/1990); multa rescisória de 40% sobre o
 * saldo em dispensa sem justa causa.
 *
 * Feriados: os nove feriados civis e religiosos nacionais da Lei 662/1949, da
 * Lei 6.802/1980 e da Lei 14.759/2023 (Consciência Negra, nacional desde 2023).
 * Carnaval, Sexta-feira Santa e Corpus Christi são calculados a partir da
 * Páscoa pelo algoritmo de Meeus/Jones/Butcher. Carnaval e Corpus Christi são
 * ponto facultativo federal, não feriado — e a resposta diz isso.
 *
 * DDD: lista da Anatel de código de área por estado, com a cidade principal.
 *
 * Validação de documento: aqui só se CONFERE e se FORMATA. Nada neste arquivo
 * gera CPF, CNPJ, cartão ou qualquer documento que possa passar por válido de
 * uma pessoa real — é decisão de projeto, não esquecimento.
 *
 * Sorteio e senha usam crypto.randomInt e crypto.randomBytes. Math.random é
 * previsível e não serve para sorteio em que alguém ganha alguma coisa.
 *
 * Regra da casa: toda a conta mora aqui. O comando em src/commands/ferramentas
 * só chama responder() e entrega o resultado ao F.tela. Sem rede, sem banco.
 */

const crypto = require('node:crypto')
const logger = require('../core/logger')

const VIGENCIA_INSS = 'tabela do INSS vigente desde janeiro de 2025'
const VIGENCIA_IRRF = 'tabela do IRRF vigente desde maio de 2025'
const VIGENCIA_FERIADOS = 'feriados nacionais conforme a legislação em vigor em setembro de 2026'
const VIGENCIA_TABELAS = 'tabelas conferidas em setembro de 2026'

/* ───────────────────────────── Auxiliares ───────────────────────────── */

function falha(mensagem) {
    const e = new Error(mensagem)
    e.paraUsuario = true
    return e
}

/** Lê número no formato brasileiro ou americano. */
function num(texto) {
    let s = String(texto === null || texto === undefined ? '' : texto).trim().replace(/\s+/g, '')
    s = s.replace(/[^\d.,+-]/g, '')
    if (!s || !/\d/.test(s)) return NaN
    const temVirgula = s.includes(',')
    const temPonto = s.includes('.')
    if (temVirgula && temPonto) {
        s = s.lastIndexOf(',') > s.lastIndexOf('.')
            ? s.replace(/\./g, '').replace(/,/g, '.')
            : s.replace(/,/g, '')
    } else if (temVirgula) {
        s = s.replace(/,/g, '.')
    } else if (temPonto && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
        s = s.replace(/\./g, '')
    }
    const n = Number(s)
    return Number.isFinite(n) ? n : NaN
}

function exigirNumero(texto, rotulo, { minimo = null, maximo = null, permiteNegativo = true, permiteZero = true } = {}) {
    const n = num(texto)
    if (!Number.isFinite(n)) throw falha(`Não entendi "${String(texto ?? '').slice(0, 20) || 'nada'}" como ${rotulo}. Escreva só o número, por exemplo 1500 ou 1.500,50.`)
    if (!permiteNegativo && n < 0) throw falha(`O ${rotulo} não pode ser negativo.`)
    if (!permiteZero && n === 0) throw falha(`O ${rotulo} não pode ser zero — a conta ficaria sem resposta.`)
    if (minimo !== null && n < minimo) throw falha(`O ${rotulo} precisa ser no mínimo ${minimo}.`)
    if (maximo !== null && n > maximo) throw falha(`O ${rotulo} precisa ser no máximo ${maximo}.`)
    return n
}

function fmt(n, casas = 2) {
    if (!Number.isFinite(n)) return '—'
    const abs = Math.abs(n)
    let c = casas
    if (abs !== 0 && abs < 0.0001) return n.toExponential(3).replace('.', ',')
    if (abs >= 1e15) return n.toExponential(3).replace('.', ',')
    if (abs >= 100000) c = Math.min(c, 0)
    return Number(n.toFixed(c)).toLocaleString('pt-BR', { maximumFractionDigits: Math.max(c, 0) })
}

/** Dinheiro sempre com duas casas, do jeito brasileiro. */
function moeda(n) {
    const v = Number(n)
    if (!Number.isFinite(v)) return 'R$ —'
    return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function cap(t) {
    const s = String(t || '')
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function forte(valor, unidade, casas = 2) {
    return `*${fmt(valor, casas)}${unidade ? ' ' + unidade : ''}*`
}

/** Só os dígitos de um texto. */
function digitos(t) {
    return String(t || '').replace(/\D+/g, '')
}

/** Tira acento e deixa minúsculo — para comparar palavra que o usuário digitou. */
function chave(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

/* ─────────────────────────── Datas sem fuso ─────────────────────────── */

const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** Hoje, em data pura (sem hora), no fuso de Brasília. */
function hoje() {
    const s = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    const [y, m, d] = s.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d))
}

/**
 * Lê data escrita de vários jeitos e recusa data que não existe.
 * Aceita 17/09/2026, 17-09-2026, 2026-09-17, 17/09 e a palavra "hoje".
 */
function lerData(texto, rotulo = 'data') {
    const s = String(texto || '').trim()
    if (!s) throw falha(`Digite a ${rotulo} no formato dia/mês/ano, por exemplo 17/09/2026.`)
    if (chave(s) === 'hoje') return hoje()
    let y, m, d
    let mm = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
    if (mm) { y = +mm[1]; m = +mm[2]; d = +mm[3] } else {
        mm = s.match(/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2,4}))?$/)
        if (!mm) throw falha(`Não entendi "${s.slice(0, 20)}" como ${rotulo}. Escreva assim: 17/09/2026.`)
        d = +mm[1]; m = +mm[2]
        y = mm[3] === undefined ? hoje().getUTCFullYear() : +mm[3]
        if (y < 100) y += y < 50 ? 2000 : 1900
    }
    if (m < 1 || m > 12) throw falha(`Mês ${m} não existe. O mês vai de 1 a 12.`)
    if (d < 1 || d > 31) throw falha(`Dia ${d} não existe. O dia vai de 1 a 31.`)
    if (y < 1000 || y > 9999) throw falha(`O ano ${y} está fora do que eu calculo (de 1000 a 9999).`)
    const dt = new Date(Date.UTC(y, m - 1, d))
    if (dt.getUTCDate() !== d || dt.getUTCMonth() !== m - 1) {
        throw falha(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y} não existe no calendário. ${MESES[m - 1] ? cap(MESES[m - 1]) : 'Esse mês'} de ${y} tem ${new Date(Date.UTC(y, m, 0)).getUTCDate()} dias.`)
    }
    return dt
}

function fmtData(d) {
    return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

function dataExtenso(d) {
    return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}

function diaSemana(d) {
    return DIAS_SEMANA[d.getUTCDay()]
}

function somaDias(d, n) {
    return new Date(d.getTime() + Math.round(n) * 86400000)
}

function diasEntre(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function bissexto(ano) {
    return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0
}

/** Domingo de Páscoa pelo algoritmo de Meeus/Jones/Butcher. */
function pascoa(ano) {
    const a = ano % 19
    const b = Math.floor(ano / 100)
    const c = ano % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const mes = Math.floor((h + l - 7 * m + 114) / 31)
    const dia = ((h + l - 7 * m + 114) % 31) + 1
    return new Date(Date.UTC(ano, mes - 1, dia))
}

/** Os feriados e pontos facultativos nacionais de um ano. */
function feriadosDoAno(ano) {
    const p = pascoa(ano)
    const lista = [
        { data: new Date(Date.UTC(ano, 0, 1)), nome: 'Confraternização Universal', tipo: 'feriado' },
        { data: somaDias(p, -48), nome: 'Carnaval (segunda)', tipo: 'ponto facultativo' },
        { data: somaDias(p, -47), nome: 'Carnaval (terça)', tipo: 'ponto facultativo' },
        { data: somaDias(p, -2), nome: 'Sexta-feira Santa', tipo: 'feriado' },
        { data: p, nome: 'Domingo de Páscoa', tipo: 'data religiosa' },
        { data: new Date(Date.UTC(ano, 3, 21)), nome: 'Tiradentes', tipo: 'feriado' },
        { data: new Date(Date.UTC(ano, 4, 1)), nome: 'Dia do Trabalho', tipo: 'feriado' },
        { data: somaDias(p, 60), nome: 'Corpus Christi', tipo: 'ponto facultativo' },
        { data: new Date(Date.UTC(ano, 8, 7)), nome: 'Independência do Brasil', tipo: 'feriado' },
        { data: new Date(Date.UTC(ano, 9, 12)), nome: 'Nossa Senhora Aparecida', tipo: 'feriado' },
        { data: new Date(Date.UTC(ano, 10, 2)), nome: 'Finados', tipo: 'feriado' },
        { data: new Date(Date.UTC(ano, 10, 15)), nome: 'Proclamação da República', tipo: 'feriado' },
        { data: new Date(Date.UTC(ano, 10, 20)), nome: 'Consciência Negra', tipo: 'feriado' },
        { data: new Date(Date.UTC(ano, 11, 25)), nome: 'Natal', tipo: 'feriado' }
    ]
    return lista.sort((x, y) => x.data - y.data)
}

/** Só os feriados de verdade (sem ponto facultativo), como conjunto de chaves. */
function conjuntoFeriados(ano) {
    const s = new Set()
    for (const f of feriadosDoAno(ano)) if (f.tipo === 'feriado') s.add(fmtData(f.data))
    return s
}

/** Dia útil = de segunda a sexta e fora dos feriados nacionais. */
function ehDiaUtil(d, cacheFeriados = {}) {
    const dia = d.getUTCDay()
    if (dia === 0 || dia === 6) return false
    const ano = d.getUTCFullYear()
    if (!cacheFeriados[ano]) cacheFeriados[ano] = conjuntoFeriados(ano)
    return !cacheFeriados[ano].has(fmtData(d))
}

/* ───────────────────── Tabelas oficiais (com vigência) ───────────────────── */

const INSS_FAIXAS = [
    { ate: 1518.00, aliquota: 0.075 },
    { ate: 2793.88, aliquota: 0.09 },
    { ate: 4190.83, aliquota: 0.12 },
    { ate: 8157.41, aliquota: 0.14 }
]
const INSS_TETO_SALARIO = 8157.41

const IRRF_FAIXAS = [
    { ate: 2428.80, aliquota: 0, deducao: 0 },
    { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
    { ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
    { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
    { ate: Infinity, aliquota: 0.275, deducao: 908.73 }
]
const IRRF_DEDUCAO_DEPENDENTE = 189.59
const IRRF_DESCONTO_SIMPLIFICADO = 607.20

/** Contribuição do INSS, faixa por faixa (progressiva desde a reforma de 2019). */
function calcularInss(bruto) {
    let base = Math.min(bruto, INSS_TETO_SALARIO)
    let anterior = 0
    let total = 0
    const detalhe = []
    for (const f of INSS_FAIXAS) {
        if (base <= anterior) break
        const trecho = Math.min(base, f.ate) - anterior
        const valor = trecho * f.aliquota
        total += valor
        detalhe.push(`• ${moeda(trecho)} a ${fmt(f.aliquota * 100, 1)}% = ${moeda(valor)}`)
        anterior = f.ate
    }
    return { total: Math.round(total * 100) / 100, detalhe, teto: bruto > INSS_TETO_SALARIO }
}

/** Imposto de renda retido na fonte, na tabela mensal. */
function calcularIrrf(baseBruta, inss, dependentes = 0) {
    const baseCompleta = Math.max(0, baseBruta - inss - dependentes * IRRF_DEDUCAO_DEPENDENTE)
    const baseSimplificada = Math.max(0, baseBruta - IRRF_DESCONTO_SIMPLIFICADO)
    const aplicar = (base) => {
        const faixa = IRRF_FAIXAS.find(f => base <= f.ate)
        return { faixa, valor: Math.max(0, base * faixa.aliquota - faixa.deducao) }
    }
    const completa = aplicar(baseCompleta)
    const simplificada = aplicar(baseSimplificada)
    const usouSimplificado = simplificada.valor < completa.valor
    const escolhida = usouSimplificado ? simplificada : completa
    return {
        valor: Math.round(escolhida.valor * 100) / 100,
        base: usouSimplificado ? baseSimplificada : baseCompleta,
        aliquota: escolhida.faixa.aliquota,
        usouSimplificado
    }
}

/* ───────────────────────── DDD por estado (Anatel) ───────────────────────── */

const DDDS = {
    11: ['SP', 'São Paulo'], 12: ['SP', 'São José dos Campos'], 13: ['SP', 'Santos'], 14: ['SP', 'Bauru'],
    15: ['SP', 'Sorocaba'], 16: ['SP', 'Ribeirão Preto'], 17: ['SP', 'São José do Rio Preto'], 18: ['SP', 'Presidente Prudente'],
    19: ['SP', 'Campinas'], 21: ['RJ', 'Rio de Janeiro'], 22: ['RJ', 'Campos dos Goytacazes'], 24: ['RJ', 'Volta Redonda'],
    27: ['ES', 'Vitória'], 28: ['ES', 'Cachoeiro de Itapemirim'], 31: ['MG', 'Belo Horizonte'], 32: ['MG', 'Juiz de Fora'],
    33: ['MG', 'Governador Valadares'], 34: ['MG', 'Uberlândia'], 35: ['MG', 'Poços de Caldas'], 37: ['MG', 'Divinópolis'],
    38: ['MG', 'Montes Claros'], 41: ['PR', 'Curitiba'], 42: ['PR', 'Ponta Grossa'], 43: ['PR', 'Londrina'],
    44: ['PR', 'Maringá'], 45: ['PR', 'Foz do Iguaçu'], 46: ['PR', 'Francisco Beltrão'], 47: ['SC', 'Joinville'],
    48: ['SC', 'Florianópolis'], 49: ['SC', 'Chapecó'], 51: ['RS', 'Porto Alegre'], 53: ['RS', 'Pelotas'],
    54: ['RS', 'Caxias do Sul'], 55: ['RS', 'Santa Maria'], 61: ['DF', 'Brasília'], 62: ['GO', 'Goiânia'],
    63: ['TO', 'Palmas'], 64: ['GO', 'Rio Verde'], 65: ['MT', 'Cuiabá'], 66: ['MT', 'Rondonópolis'],
    67: ['MS', 'Campo Grande'], 68: ['AC', 'Rio Branco'], 69: ['RO', 'Porto Velho'], 71: ['BA', 'Salvador'],
    73: ['BA', 'Itabuna'], 74: ['BA', 'Juazeiro'], 75: ['BA', 'Feira de Santana'], 77: ['BA', 'Barreiras'],
    79: ['SE', 'Aracaju'], 81: ['PE', 'Recife'], 82: ['AL', 'Maceió'], 83: ['PB', 'João Pessoa'],
    84: ['RN', 'Natal'], 85: ['CE', 'Fortaleza'], 86: ['PI', 'Teresina'], 87: ['PE', 'Petrolina'],
    88: ['CE', 'Juazeiro do Norte'], 89: ['PI', 'Picos'], 91: ['PA', 'Belém'], 92: ['AM', 'Manaus'],
    93: ['PA', 'Santarém'], 94: ['PA', 'Marabá'], 95: ['RR', 'Boa Vista'], 96: ['AP', 'Macapá'],
    97: ['AM', 'Coari'], 98: ['MA', 'São Luís'], 99: ['MA', 'Imperatriz']
}

const ESTADOS_NOME = {
    AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
    ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
    RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
    SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
}

/* ──────────────────── Conferência de documento (só conferir) ──────────────────── */

/** Dígito verificador por módulo 11 com pesos decrescentes. */
function dvModulo11(numeros, pesoInicial) {
    let soma = 0
    let peso = pesoInicial
    for (const n of numeros) { soma += n * peso; peso-- }
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
}

function validarCpf(valor) {
    const d = digitos(valor)
    if (d.length !== 11) return { ok: false, motivo: `CPF tem 11 dígitos; esse tem ${d.length}.` }
    if (/^(\d)\1{10}$/.test(d)) return { ok: false, motivo: 'Todos os dígitos são iguais — esse padrão nunca é um CPF de verdade.' }
    const n = d.split('').map(Number)
    const dv1 = dvModulo11(n.slice(0, 9), 10)
    const dv2 = dvModulo11(n.slice(0, 10), 11)
    if (dv1 !== n[9] || dv2 !== n[10]) return { ok: false, motivo: `Os dígitos verificadores não batem: deveriam terminar em ${dv1}${dv2}.` }
    return { ok: true, formatado: `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`, digitos: d }
}

// Pesos do dígito verificador do CNPJ. O segundo dígito usa os 13 pesos; o
// primeiro usa os 12 finais. Fatiar pela ponta errada dá NaN — já deu.
const CNPJ_PESOS_13 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

function validarCnpj(valor) {
    const d = digitos(valor)
    if (d.length !== 14) return { ok: false, motivo: `CNPJ tem 14 dígitos; esse tem ${d.length}.` }
    if (/^(\d)\1{13}$/.test(d)) return { ok: false, motivo: 'Todos os dígitos são iguais — esse padrão nunca é um CNPJ de verdade.' }
    const n = d.split('').map(Number)
    const calc = (qtd) => {
        const pesos = CNPJ_PESOS_13.slice(13 - qtd)
        let soma = 0
        for (let i = 0; i < qtd; i++) soma += n[i] * pesos[i]
        const resto = soma % 11
        return resto < 2 ? 0 : 11 - resto
    }
    const dv1 = calc(12)
    const dv2 = calc(13)
    if (dv1 !== n[12] || dv2 !== n[13]) return { ok: false, motivo: `Os dígitos verificadores não batem: deveriam terminar em ${dv1}${dv2}.` }
    return { ok: true, formatado: `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`, digitos: d }
}

/** Algoritmo de Luhn — o mesmo que confere cartão de crédito e IMEI. */
function luhn(numero) {
    const d = digitos(numero)
    if (d.length < 12) return { ok: false, motivo: `Número curto demais (${d.length} dígitos). Cartão tem de 13 a 19.` }
    let soma = 0
    let dobra = false
    for (let i = d.length - 1; i >= 0; i--) {
        let n = Number(d[i])
        if (dobra) { n *= 2; if (n > 9) n -= 9 }
        soma += n
        dobra = !dobra
    }
    return soma % 10 === 0
        ? { ok: true, digitos: d }
        : { ok: false, motivo: 'A soma de Luhn não fecha em múltiplo de 10 — tem dígito trocado.', digitos: d }
}

function bandeiraCartao(d) {
    if (/^4/.test(d)) return 'Visa'
    if (/^5[1-5]/.test(d) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(d)) return 'Mastercard'
    if (/^3[47]/.test(d)) return 'American Express'
    if (/^(36|38|30[0-5])/.test(d)) return 'Diners Club'
    if (/^(6011|65|64[4-9])/.test(d)) return 'Discover'
    if (/^(606282|3841)/.test(d)) return 'Hipercard'
    if (/^(50|509|627780|636297|636368|438935)/.test(d)) return 'Elo'
    return 'não identificada'
}

/* ─────────────────────────── Sorteio com crypto ─────────────────────────── */

/** Inteiro de min a max, inclusive, sem viés. */
function aleatorio(min, max) {
    return crypto.randomInt(min, max + 1)
}

/** Embaralha uma cópia da lista (Fisher-Yates com fonte criptográfica). */
function embaralhar(lista) {
    const a = [...lista]
    for (let i = a.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1)
        const t = a[i]; a[i] = a[j]; a[j] = t
    }
    return a
}

/** Um item da lista, com sorteio uniforme. */
function sortear(lista) {
    return lista[crypto.randomInt(0, lista.length)]
}

/** Separa os argumentos em itens: por vírgula se houver, senão por espaço. */
function itens(args, minimo = 2, rotulo = 'itens') {
    const bruto = args.join(' ')
    const lista = (bruto.includes(',') ? bruto.split(',') : bruto.split(/\s+/))
        .map(s => s.trim()).filter(Boolean)
    if (lista.length < minimo) throw falha(`Preciso de pelo menos ${minimo} ${rotulo}. Separe por vírgula, por exemplo: ana, bruno, carla.`)
    if (lista.length > 200) throw falha(`São ${lista.length} ${rotulo} — demais para caber na resposta. Envie até 200.`)
    return lista
}

/**
 * Lista de NÚMEROS separados por espaço, ponto e vírgula ou vírgula.
 *
 * Existe separado de itens() porque em português a vírgula é a casa decimal:
 * "7, 8,5, 6" tem de virar [7; 8,5; 6] e não [7; 8; 5; 6]. A regra é simples —
 * vírgula colada em dígito é decimal, vírgula seguida de espaço (ou de nada)
 * separa itens. Usar itens() aqui quebrava toda média com número quebrado.
 */
function listaDeNumeros(args, minimo = 2, rotulo = 'números') {
    const bruto = args.join(' ').trim()
    const lista = bruto.split(/[;\s]+|,(?!\d)/).map(s => s.replace(/,$/, '').trim()).filter(Boolean)
    if (lista.length < minimo) throw falha(`Preciso de pelo menos ${minimo} ${rotulo}. Separe por espaço ou por vírgula, por exemplo: 7 8,5 6.`)
    if (lista.length > 200) throw falha(`São ${lista.length} ${rotulo} — demais para caber na resposta. Envie até 200.`)
    return lista
}

/* ────────────────────────────── O registro ────────────────────────────── */

const FERRAMENTAS = {}

/** Registra uma ferramenta já com a subcategoria certa. */
function registrar(sub) {
    return (chaveFerramenta, cfg) => { FERRAMENTAS[chaveFerramenta] = Object.assign({ sub }, cfg) }
}
const C = registrar('Calculadoras')
const D = registrar('Documentos')
const G = registrar('Geradores')
const H = registrar('Data e Hora')

/* ─────────────────────── Calculadoras: saúde (13) ─────────────────────── */

C('imc', {
    emoji: '⚖️', titulo: 'Índice de massa corporal',
    descricao: 'Calcula o IMC pelo peso e pela altura',
    uso: '<peso em kg> <altura em m>',
    exemplos: [{ args: '80 1,75', oque: 'oitenta quilos e um e setenta e cinco' }, { args: '62 1,60', oque: 'outro exemplo' }],
    dica: 'O IMC é um sinal, não um diagnóstico: quem tem muita massa muscular aparece acima do peso sem estar.',
    calcular(args) {
        const peso = exigirNumero(args[0], 'peso em kg', { permiteNegativo: false, permiteZero: false, maximo: 600 })
        const alt = exigirNumero(args[1], 'altura em metros', { permiteNegativo: false, permiteZero: false })
        const altura = alt > 3 ? alt / 100 : alt
        if (altura < 0.5 || altura > 2.6) throw falha(`Altura de ${fmt(altura, 2)} m não existe. Escreva em metros, por exemplo 1,75.`)
        const imc = peso / (altura * altura)
        const faixas = [[18.5, 'abaixo do peso'], [25, 'peso normal'], [30, 'sobrepeso'], [35, 'obesidade grau 1'], [40, 'obesidade grau 2'], [Infinity, 'obesidade grau 3']]
        const faixa = faixas.find(f => imc < f[0])[1]
        const pesoMin = 18.5 * altura * altura
        const pesoMax = 24.9 * altura * altura
        return {
            intro: `IMC de ${'*' + fmt(imc, 1) + '*'} — classificação: ${'*' + faixa + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*IMC:* ${fmt(imc, 2)}`, `*Classificação:* ${faixa}`, `*Peso de referência:* de ${fmt(pesoMin, 1)} a ${fmt(pesoMax, 1)} kg`, `*Diferença para a faixa:* ${imc < 18.5 ? 'faltam ' + fmt(pesoMin - peso, 1) + ' kg' : imc > 24.9 ? 'sobram ' + fmt(peso - pesoMax, 1) + ' kg' : 'você está dentro dela'}`] },
                { emoji: '📊', titulo: 'A tabela inteira', linhas: ['• Abaixo de 18,5: abaixo do peso', '• De 18,5 a 24,9: peso normal', '• De 25 a 29,9: sobrepeso', '• De 30 a 34,9: obesidade grau 1', '• De 35 a 39,9: obesidade grau 2', '• 40 ou mais: obesidade grau 3'] }
            ]
        }
    }
})

C('peso_ideal', {
    emoji: '🧍', titulo: 'Faixa de peso saudável',
    descricao: 'Mostra a faixa de peso saudável para a altura',
    uso: '<altura em m> [h ou m]',
    exemplos: [{ args: '1,75 h', oque: 'homem de um e setenta e cinco' }, { args: '1,62 m', oque: 'mulher de um e sessenta e dois' }],
    dica: 'A faixa vem do IMC entre 18,5 e 24,9. A fórmula de Devine dá um ponto de referência dentro dela.',
    calcular(args) {
        const alt = exigirNumero(args[0], 'altura em metros', { permiteNegativo: false, permiteZero: false })
        const altura = alt > 3 ? alt / 100 : alt
        if (altura < 1.2 || altura > 2.3) throw falha(`Altura de ${fmt(altura, 2)} m está fora da tabela. Escreva em metros, por exemplo 1,70.`)
        const homem = chave(args[1] || 'h').startsWith('h') || chave(args[1] || '').startsWith('m') === false
        const polAcima = Math.max(0, (altura * 100 - 152.4) / 2.54)
        const devine = (homem ? 50 : 45.5) + 2.3 * polAcima
        return {
            intro: `Para ${fmt(altura, 2)} m, a faixa saudável vai de ${'*' + fmt(18.5 * altura * altura, 1) + ' a ' + fmt(24.9 * altura * altura, 1) + ' kg*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Peso mínimo saudável:* ${fmt(18.5 * altura * altura, 1)} kg`, `*Peso máximo saudável:* ${fmt(24.9 * altura * altura, 1)} kg`, `*Meio da faixa:* ${fmt(21.7 * altura * altura, 1)} kg`, `*Fórmula de Devine (${homem ? 'homem' : 'mulher'}):* ${fmt(devine, 1)} kg`] },
                { emoji: '🧠', titulo: 'Como ler isso', linhas: ['Faixa é faixa: não existe um número único certo. Massa muscular, ossatura e idade mudam onde você se encaixa bem.'] }
            ]
        }
    }
})

C('tmb', {
    emoji: '🔥', titulo: 'Taxa metabólica basal',
    descricao: 'Calcula as calorias gastas em repouso',
    uso: '<peso kg> <altura cm> <idade> [h ou m]',
    exemplos: [{ args: '80 175 30 h', oque: 'homem de trinta anos' }, { args: '62 162 28 m', oque: 'mulher de vinte e oito' }],
    dica: 'Fórmula de Mifflin e St Jeor, a mais precisa para a maioria das pessoas. É o gasto parado, sem contar atividade.',
    calcular(args) {
        const peso = exigirNumero(args[0], 'peso em kg', { permiteNegativo: false, permiteZero: false, maximo: 600 })
        const altCm = exigirNumero(args[1], 'altura em cm', { permiteNegativo: false, permiteZero: false })
        const altura = altCm < 3 ? altCm * 100 : altCm
        const idade = exigirNumero(args[2], 'idade em anos', { permiteNegativo: false, minimo: 1, maximo: 120 })
        const homem = !chave(args[3] || 'h').startsWith('m')
        const tmb = 10 * peso + 6.25 * altura - 5 * idade + (homem ? 5 : -161)
        const niveis = [['Parado, sem exercício', 1.2], ['Exercício leve, 1 a 3 vezes', 1.375], ['Moderado, 3 a 5 vezes', 1.55], ['Pesado, 6 a 7 vezes', 1.725], ['Atleta ou trabalho braçal', 1.9]]
        return {
            intro: `Sua taxa metabólica basal é ${'*' + fmt(tmb, 0) + ' kcal por dia*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Gasto em repouso:* ${fmt(tmb, 0)} kcal por dia`, `*Por hora parado:* ${fmt(tmb / 24, 1)} kcal`, `*Fórmula:* Mifflin e St Jeor (${homem ? 'homem' : 'mulher'})`] },
                { emoji: '🏃', titulo: 'Gasto total por nível de atividade', linhas: niveis.map(([n, f]) => `• ${n}: ${fmt(tmb * f, 0)} kcal`) }
            ]
        }
    }
})

C('gasto_calorico', {
    emoji: '⚡', titulo: 'Gasto calórico do dia',
    descricao: 'Calcula quantas calorias você gasta por dia',
    uso: '<calorias em repouso> <nível de 1 a 5>',
    exemplos: [{ args: '1750 3', oque: 'metabolismo de 1750 e atividade moderada' }, { args: '1400 1', oque: 'vida parada' }],
    dica: 'Descubra a taxa em repouso primeiro. O nível vai de 1 (parado) a 5 (atleta).',
    calcular(args) {
        const tmb = exigirNumero(args[0], 'gasto em repouso', { permiteNegativo: false, permiteZero: false })
        const nivel = Math.round(exigirNumero(args[1], 'nível de atividade', { minimo: 1, maximo: 5 }))
        const fatores = [1.2, 1.375, 1.55, 1.725, 1.9]
        const nomes = ['parado', 'leve', 'moderado', 'pesado', 'atleta']
        const total = tmb * fatores[nivel - 1]
        return {
            intro: `Com atividade ${nomes[nivel - 1]}, seu gasto é de ${'*' + fmt(total, 0) + ' kcal por dia*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Gasto total:* ${fmt(total, 0)} kcal por dia`, `*Fator usado:* ${fatores[nivel - 1]}`, `*Para emagrecer (menos 20%):* ${fmt(total * 0.8, 0)} kcal`, `*Para ganhar massa (mais 15%):* ${fmt(total * 1.15, 0)} kcal`] },
                { emoji: '📉', titulo: 'Ritmo de perda', linhas: [`Um quilo de gordura guarda cerca de 7.700 kcal. Cortando 20% por dia, a perda fica perto de ${fmt(total * 0.2 * 7 / 7700, 2)} kg por semana.`] }
            ]
        }
    }
})

C('agua_dia', {
    emoji: '💧', titulo: 'Água por dia',
    descricao: 'Calcula quanta água beber por dia pelo peso',
    uso: '<peso em kg> [minutos de exercício]',
    exemplos: [{ args: '70', oque: 'setenta quilos, sem exercício' }, { args: '85 60', oque: 'com uma hora de treino' }],
    dica: 'A referência é 35 ml por quilo. Calor forte, febre e treino longo pedem mais.',
    calcular(args) {
        const peso = exigirNumero(args[0], 'peso em kg', { permiteNegativo: false, permiteZero: false, maximo: 600 })
        const minutos = args[1] ? exigirNumero(args[1], 'minutos de exercício', { permiteNegativo: false }) : 0
        const base = peso * 35
        const extra = (minutos / 30) * 350
        const total = base + extra
        const copos = total / 250
        return {
            intro: `Você precisa de cerca de ${'*' + fmt(total / 1000, 2) + ' litros de água por dia*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Total por dia:* ${fmt(total / 1000, 2)} litros`, `*Base pelo peso:* ${fmt(base / 1000, 2)} litros`, `*Extra do exercício:* ${fmt(extra / 1000, 2)} litros`, `*Em copos de 250 ml:* ${fmt(copos, 0)} copos`] },
                { emoji: '⏰', titulo: 'Como dividir no dia', linhas: [`Acordando às 7h e dormindo às 23h, dá cerca de ${fmt(total / 16 / 1000, 2)} litros por hora de vigília, ou um copo a cada ${fmt(16 * 60 / copos, 0)} minutos.`] }
            ]
        }
    }
})

C('gordura_corporal', {
    emoji: '📐', titulo: 'Percentual de gordura pelas medidas',
    descricao: 'Estima o percentual de gordura por fita métrica',
    uso: '<altura cm> <pescoço cm> <cintura cm> [quadril cm, mulher]',
    exemplos: [{ args: '175 38 90', oque: 'homem: altura, pescoço e cintura' }, { args: '162 32 74 98', oque: 'mulher: inclui o quadril' }],
    dica: 'Método da Marinha americana. Meça o pescoço abaixo do pomo de adão e a cintura na altura do umbigo.',
    calcular(args) {
        const altura = exigirNumero(args[0], 'altura em cm', { permiteNegativo: false, permiteZero: false })
        const pescoco = exigirNumero(args[1], 'medida do pescoço em cm', { permiteNegativo: false, permiteZero: false })
        const cintura = exigirNumero(args[2], 'medida da cintura em cm', { permiteNegativo: false, permiteZero: false })
        const quadril = args[3] ? exigirNumero(args[3], 'medida do quadril em cm', { permiteNegativo: false, permiteZero: false }) : null
        if (cintura <= pescoco) throw falha('A cintura precisa ser maior que o pescoço. Confira se não trocou as medidas de lugar.')
        let pct
        if (quadril === null) {
            pct = 495 / (1.0324 - 0.19077 * Math.log10(cintura - pescoco) + 0.15456 * Math.log10(altura)) - 450
        } else {
            pct = 495 / (1.29579 - 0.35004 * Math.log10(cintura + quadril - pescoco) + 0.221 * Math.log10(altura)) - 450
        }
        if (!Number.isFinite(pct) || pct <= 0 || pct > 70) throw falha('As medidas geraram um resultado impossível. Confira se todas estão em centímetros.')
        const sexo = quadril === null ? 'homem' : 'mulher'
        const faixas = quadril === null
            ? [[6, 'essencial'], [14, 'atleta'], [18, 'em forma'], [25, 'aceitável'], [Infinity, 'acima do recomendado']]
            : [[14, 'essencial'], [21, 'atleta'], [25, 'em forma'], [32, 'aceitável'], [Infinity, 'acima do recomendado']]
        return {
            intro: `Sua gordura corporal estimada é ${'*' + fmt(pct, 1) + '%*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Gordura estimada:* ${fmt(pct, 1)}%`, `*Classificação:* ${faixas.find(f => pct < f[0])[1]}`, `*Tabela usada:* ${sexo}`, `*Massa magra:* ${fmt(100 - pct, 1)}% do corpo`] },
                { emoji: '📊', titulo: 'Faixas de referência', linhas: faixas.map((f, i) => `• Até ${f[0] === Infinity ? 'acima disso' : f[0] + '%'}: ${f[1]}`) },
                { emoji: '⚠️', titulo: 'Limite do método', linhas: ['Fita métrica dá estimativa, não medida exata. Um erro de 1 cm na cintura muda o resultado em quase um ponto.'] }
            ]
        }
    }
})

C('fc_zonas', {
    emoji: '❤️', titulo: 'Zonas de frequência cardíaca',
    descricao: 'Calcula as zonas de treino pela sua idade',
    uso: '<idade> [batimento em repouso]',
    exemplos: [{ args: '30', oque: 'trinta anos' }, { args: '45 62', oque: 'com batimento de repouso medido' }],
    dica: 'Com o batimento de repouso, uso a fórmula de Karvonen, que é mais precisa que a porcentagem simples.',
    calcular(args) {
        const idade = exigirNumero(args[0], 'idade em anos', { minimo: 5, maximo: 110 })
        const repouso = args[1] ? exigirNumero(args[1], 'batimento em repouso', { minimo: 30, maximo: 120 }) : null
        const fcMax = 208 - 0.7 * idade
        const zona = (p) => repouso === null ? fcMax * p : repouso + (fcMax - repouso) * p
        const linhas = [['Aquecimento', 0.5, 0.6], ['Queima de gordura', 0.6, 0.7], ['Aeróbico', 0.7, 0.8], ['Limiar', 0.8, 0.9], ['Máximo', 0.9, 1.0]]
        return {
            intro: `Com ${fmt(idade, 0)} anos, seu batimento máximo estimado é ${'*' + fmt(fcMax, 0) + ' por minuto*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Batimento máximo:* ${fmt(fcMax, 0)} bpm`, `*Fórmula:* 208 menos 0,7 vezes a idade`, `*Método das zonas:* ${repouso === null ? 'porcentagem do máximo' : 'Karvonen, com repouso de ' + fmt(repouso, 0) + ' bpm'}`] },
                { emoji: '📊', titulo: 'Suas zonas de treino', linhas: linhas.map(([n, a, b]) => `• ${n}: de ${fmt(zona(a), 0)} a ${fmt(zona(b), 0)} bpm`) },
                { emoji: '⚠️', titulo: 'Antes de treinar forte', linhas: ['Fórmula é média de população. Quem tem problema de coração deve usar o número que o médico passou, não este.'] }
            ]
        }
    }
})

C('deficit_calorico', {
    emoji: '📉', titulo: 'Tempo para perder peso',
    descricao: 'Diz quanto tempo leva para perder X quilos',
    uso: '<quilos a perder> <déficit diário em kcal>',
    exemplos: [{ args: '8 500', oque: 'oito quilos cortando 500 kcal por dia' }, { args: '5 300', oque: 'corte mais suave' }],
    dica: 'Um quilo de gordura equivale a cerca de 7.700 kcal. Déficit acima de 1.000 kcal por dia costuma ser insustentável.',
    calcular(args) {
        const kg = exigirNumero(args[0], 'peso a perder em kg', { permiteNegativo: false, permiteZero: false })
        const deficit = exigirNumero(args[1], 'déficit diário em kcal', { permiteNegativo: false, permiteZero: false })
        const dias = (kg * 7700) / deficit
        const alvo = somaDias(hoje(), Math.ceil(dias))
        return {
            intro: `Perder ${fmt(kg, 1)} kg com ${fmt(deficit, 0)} kcal de déficit leva cerca de ${'*' + fmt(dias / 7, 0) + ' semanas*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Dias necessários:* ${fmt(Math.ceil(dias), 0)}`, `*Em semanas:* ${fmt(dias / 7, 1)}`, `*Em meses:* ${fmt(dias / 30.44, 1)}`, `*Data estimada:* ${fmtData(alvo)}`] },
                { emoji: '📊', titulo: 'Ritmo', linhas: [`*Por semana:* ${fmt(deficit * 7 / 7700, 2)} kg`, `*Por mês:* ${fmt(deficit * 30 / 7700, 2)} kg`, `*Total cortado:* ${fmt(kg * 7700, 0)} kcal`] },
                { emoji: '⚠️', titulo: 'Realidade da conta', linhas: ['O corpo se ajusta: conforme o peso cai, o gasto cai junto e o ritmo desacelera. Refaça a conta a cada poucos quilos.'] }
            ]
        }
    }
})

C('proteina_dia', {
    emoji: '🥩', titulo: 'Proteína por dia',
    descricao: 'Calcula quanta proteína comer por dia',
    uso: '<peso em kg> [objetivo: sedentario, treino ou massa]',
    exemplos: [{ args: '80 treino', oque: 'oitenta quilos treinando' }, { args: '62 massa', oque: 'ganho de massa' }],
    dica: 'Sedentário: 0,8 g por quilo. Quem treina: 1,6 g. Ganho de massa: 2,0 g. Acima disso não traz ganho extra.',
    calcular(args) {
        const peso = exigirNumero(args[0], 'peso em kg', { permiteNegativo: false, permiteZero: false, maximo: 600 })
        const obj = chave(args[1] || 'treino')
        const fatores = { sedentario: 0.8, treino: 1.6, massa: 2.0, emagrecer: 1.8 }
        const fator = fatores[obj]
        if (!fator) throw falha(`Não conheço o objetivo "${obj}". Use: sedentario, treino, massa ou emagrecer.`)
        const g = peso * fator
        return {
            intro: `Com ${fmt(peso, 1)} kg e objetivo ${obj}, mire em ${'*' + fmt(g, 0) + ' g de proteína por dia*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Proteína por dia:* ${fmt(g, 0)} g`, `*Fator usado:* ${fmt(fator, 1)} g por quilo`, `*Por refeição (4 refeições):* ${fmt(g / 4, 0)} g`, `*Em calorias:* ${fmt(g * 4, 0)} kcal`] },
                { emoji: '🍽️', titulo: 'Equivalência prática', linhas: [`• Frango grelhado: ${fmt(g / 0.31, 0)} g de peito`, `• Ovo inteiro: ${fmt(g / 6, 0)} ovos`, `• Feijão cozido: ${fmt(g / 0.05, 0)} g`] }
            ]
        }
    }
})

C('cintura_quadril', {
    emoji: '📏', titulo: 'Relação cintura e quadril',
    descricao: 'Calcula a relação entre cintura e quadril',
    uso: '<cintura cm> <quadril cm> [h ou m]',
    exemplos: [{ args: '90 100 h', oque: 'homem' }, { args: '74 98 m', oque: 'mulher' }],
    dica: 'Essa relação mostra onde a gordura se acumula. Barriga concentra mais risco que quadril.',
    calcular(args) {
        const cintura = exigirNumero(args[0], 'cintura em cm', { permiteNegativo: false, permiteZero: false })
        const quadril = exigirNumero(args[1], 'quadril em cm', { permiteNegativo: false, permiteZero: false })
        const homem = !chave(args[2] || 'h').startsWith('m')
        const rcq = cintura / quadril
        const limite = homem ? 0.90 : 0.85
        return {
            intro: `Sua relação cintura e quadril é ${'*' + fmt(rcq, 2) + '*'} — ${rcq > limite ? 'acima' : 'dentro'} da referência.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Relação:* ${fmt(rcq, 3)}`, `*Limite de referência (${homem ? 'homem' : 'mulher'}):* ${fmt(limite, 2)}`, `*Situação:* ${rcq > limite ? 'acima do limite' : 'dentro do esperado'}`, `*Cintura para ficar no limite:* ${fmt(quadril * limite, 1)} cm`] },
                { emoji: '📊', titulo: 'Como se lê', linhas: ['Valor alto significa gordura concentrada no abdômen, que é a que mais pesa no risco cardiovascular.'] }
            ]
        }
    }
})

C('superficie_corporal', {
    emoji: '🧮', titulo: 'Superfície corporal',
    descricao: 'Calcula a área de superfície do corpo em m²',
    uso: '<peso kg> <altura cm>',
    exemplos: [{ args: '80 175', oque: 'adulto médio' }, { args: '20 110', oque: 'criança' }],
    dica: 'Fórmula de Mosteller. Serve para calcular dose de medicamento e de soro em hospital.',
    calcular(args) {
        const peso = exigirNumero(args[0], 'peso em kg', { permiteNegativo: false, permiteZero: false, maximo: 600 })
        const altCm = exigirNumero(args[1], 'altura em cm', { permiteNegativo: false, permiteZero: false })
        const altura = altCm < 3 ? altCm * 100 : altCm
        const mosteller = Math.sqrt((altura * peso) / 3600)
        const dubois = 0.007184 * Math.pow(altura, 0.725) * Math.pow(peso, 0.425)
        return {
            intro: `Sua superfície corporal é de cerca de ${'*' + fmt(mosteller, 2) + ' m²*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Mosteller:* ${fmt(mosteller, 3)} m²`, `*Du Bois:* ${fmt(dubois, 3)} m²`, `*Diferença entre as duas:* ${fmt(Math.abs(mosteller - dubois), 3)} m²`] },
                { emoji: '💊', titulo: 'Para que serve', linhas: ['Dose de quimioterapia e cálculo de reposição de líquido usam m² em vez de quilo, porque acompanham melhor o metabolismo.'] }
            ]
        }
    }
})

C('dose_remedio', {
    emoji: '💊', titulo: 'Dose por peso',
    descricao: 'Calcula a dose de um remédio pelo peso',
    uso: '<peso kg> <dose em mg por kg> [concentração mg/ml]',
    exemplos: [{ args: '18 15', oque: 'criança de 18 kg, 15 mg por quilo' }, { args: '70 10 500', oque: 'com concentração do frasco' }],
    dica: 'Isto é uma conta, não uma receita. Quem decide dose é quem prescreveu o remédio.',
    calcular(args) {
        const peso = exigirNumero(args[0], 'peso em kg', { permiteNegativo: false, permiteZero: false, maximo: 600 })
        const mgkg = exigirNumero(args[1], 'dose em mg por kg', { permiteNegativo: false, permiteZero: false })
        const conc = args[2] ? exigirNumero(args[2], 'concentração em mg por ml', { permiteNegativo: false, permiteZero: false }) : null
        const doseMg = peso * mgkg
        const linhas = [`*Dose por tomada:* ${fmt(doseMg, 1)} mg`, `*Peso informado:* ${fmt(peso, 1)} kg`, `*Dose prescrita:* ${fmt(mgkg, 2)} mg por kg`]
        if (conc) linhas.push(`*Volume a medir:* ${fmt(doseMg / conc, 2)} ml`)
        return {
            intro: `Para ${fmt(peso, 1)} kg a ${fmt(mgkg, 2)} mg por kg, a dose é ${'*' + fmt(doseMg, 1) + ' mg*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas },
                { emoji: '🕐', titulo: 'Se for de 8 em 8 horas', linhas: [`*Doses por dia:* 3`, `*Total no dia:* ${fmt(doseMg * 3, 1)} mg`, conc ? `*Volume no dia:* ${fmt(doseMg * 3 / conc, 2)} ml` : '*Volume:* informe a concentração do frasco para eu calcular'] },
                { emoji: '⚠️', titulo: 'Leia antes de usar', linhas: ['Confira sempre com a bula e com quem receitou. Errar concentração de frasco é acidente comum e grave.'] }
            ]
        }
    }
})

C('racao_pet', {
    emoji: '🐕', titulo: 'Ração por dia',
    descricao: 'Calcula a ração diária pelo peso do bicho',
    uso: '<peso kg> [cao ou gato] [filhote, adulto ou idoso]',
    exemplos: [{ args: '12 cao adulto', oque: 'cachorro adulto de doze quilos' }, { args: '4 gato adulto', oque: 'gato adulto' }],
    dica: 'A conta usa a energia metabolizável média de ração seca premium, 3.800 kcal por quilo.',
    calcular(args) {
        const peso = exigirNumero(args[0], 'peso do animal em kg', { permiteNegativo: false, permiteZero: false, maximo: 120 })
        const especie = chave(args[1] || 'cao').startsWith('g') ? 'gato' : 'cão'
        const fase = chave(args[2] || 'adulto')
        const fatores = { filhote: 2.0, adulto: 1.0, idoso: 0.9, castrado: 0.8 }
        const fator = fatores[fase]
        if (!fator) throw falha(`Não conheço a fase "${fase}". Use: filhote, adulto, idoso ou castrado.`)
        const rer = 70 * Math.pow(peso, 0.75)
        const base = especie === 'gato' ? rer * 1.2 : rer * 1.6
        const kcal = base * fator
        const gramas = kcal / 3.8
        return {
            intro: `Um ${especie} ${fase} de ${fmt(peso, 1)} kg come cerca de ${'*' + fmt(gramas, 0) + ' g de ração por dia*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Ração por dia:* ${fmt(gramas, 0)} g`, `*Energia necessária:* ${fmt(kcal, 0)} kcal`, `*Em duas refeições:* ${fmt(gramas / 2, 0)} g cada`, `*Pacote de 10 kg dura:* ${fmt(10000 / gramas, 0)} dias`] },
                { emoji: '📋', titulo: 'Ajuste pela embalagem', linhas: [`Ração com energia diferente muda o peso: com 3.500 kcal por kg seriam ${fmt(kcal / 3.5, 0)} g; com 4.200, ${fmt(kcal / 4.2, 0)} g.`] },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [cap(VIGENCIA_TABELAS) + '.'] }
            ]
        }
    }
})

/* ────────────────────── Calculadoras: trabalho (17) ────────────────────── */

/** Bloco de seção que declara a vigência das tabelas usadas. */
function secaoVigencia(...textos) {
    return { emoji: '📅', titulo: 'De quando são os números', linhas: textos.map(t => cap(t) + '.').concat(['Confira se houve reajuste depois dessa data.']) }
}

C('salario_liquido', {
    emoji: '💰', titulo: 'Salário líquido',
    descricao: 'Calcula o salário na conta após INSS e imposto',
    uso: '<salário bruto> [dependentes] [outros descontos]',
    exemplos: [{ args: '5000', oque: 'cinco mil de salário bruto' }, { args: '8000 2 300', oque: 'com dois dependentes e desconto extra' }],
    dica: 'Vale-transporte, plano de saúde e adiantamento entram como outros descontos.',
    calcular(args) {
        const bruto = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const dep = args[1] ? Math.round(exigirNumero(args[1], 'número de dependentes', { permiteNegativo: false, maximo: 30 })) : 0
        const outros = args[2] ? exigirNumero(args[2], 'outros descontos', { permiteNegativo: false }) : 0
        const inss = calcularInss(bruto)
        const ir = calcularIrrf(bruto, inss.total, dep)
        const liquido = bruto - inss.total - ir.valor - outros
        if (liquido < 0) throw falha(`Os descontos (${moeda(inss.total + ir.valor + outros)}) passam do salário bruto. Confira o valor de outros descontos.`)
        return {
            intro: `De ${moeda(bruto)} brutos, caem ${'*' + moeda(liquido) + '*'} na sua conta.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Salário bruto:* ${moeda(bruto)}`, `*INSS:* ${moeda(inss.total)}`, `*Imposto de renda:* ${moeda(ir.valor)}`, outros ? `*Outros descontos:* ${moeda(outros)}` : '', `*Líquido:* ${moeda(liquido)}`] },
                { emoji: '📊', titulo: 'Quanto foi embora', linhas: [`*Total descontado:* ${moeda(bruto - liquido)}`, `*Percentual do bruto:* ${fmt((bruto - liquido) / bruto * 100, 1)}%`, `*Faixa do imposto:* ${fmt(ir.aliquota * 100, 1)}%`, `*Cálculo do imposto:* ${ir.usouSimplificado ? 'desconto simplificado (mais vantajoso)' : 'deduções legais'}`] },
                { emoji: '🧾', titulo: 'INSS faixa por faixa', linhas: inss.detalhe },
                secaoVigencia(VIGENCIA_INSS, VIGENCIA_IRRF)
            ]
        }
    }
})

C('inss', {
    emoji: '🏛️', titulo: 'Desconto do INSS',
    descricao: 'Calcula o desconto do INSS sobre o salário',
    uso: '<salário bruto>',
    exemplos: [{ args: '3000', oque: 'três mil de salário' }, { args: '12000', oque: 'salário acima do teto' }],
    dica: 'O desconto é progressivo desde 2019: cada faixa do salário paga a própria alíquota, não a maior de todas.',
    calcular(args) {
        const bruto = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const r = calcularInss(bruto)
        return {
            intro: `Sobre ${moeda(bruto)}, o INSS desconta ${'*' + moeda(r.total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Desconto do INSS:* ${moeda(r.total)}`, `*Alíquota efetiva:* ${fmt(r.total / bruto * 100, 2)}%`, `*Sobra do bruto:* ${moeda(bruto - r.total)}`, r.teto ? `*Teto atingido:* acima de ${moeda(INSS_TETO_SALARIO)} o desconto não sobe mais` : `*Teto do desconto:* ${moeda(951.63)}`] },
                { emoji: '🧾', titulo: 'Faixa por faixa', linhas: r.detalhe },
                secaoVigencia(VIGENCIA_INSS)
            ]
        }
    }
})

C('irrf', {
    emoji: '🧾', titulo: 'Imposto de renda na fonte',
    descricao: 'Calcula o imposto de renda descontado no mês',
    uso: '<salário bruto> [dependentes]',
    exemplos: [{ args: '6000', oque: 'seis mil de salário' }, { args: '9000 2', oque: 'com dois dependentes' }],
    dica: 'Eu comparo o desconto simplificado com as deduções legais e uso o que pagar menos imposto, como faz a folha.',
    calcular(args) {
        const bruto = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const dep = args[1] ? Math.round(exigirNumero(args[1], 'número de dependentes', { permiteNegativo: false, maximo: 30 })) : 0
        const inss = calcularInss(bruto)
        const ir = calcularIrrf(bruto, inss.total, dep)
        return {
            intro: ir.valor === 0
                ? `Com ${moeda(bruto)} de salário, ${'*você fica isento*'} de imposto na fonte.`
                : `Sobre ${moeda(bruto)}, o imposto na fonte é ${'*' + moeda(ir.valor) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Imposto retido:* ${moeda(ir.valor)}`, `*Base de cálculo:* ${moeda(ir.base)}`, `*Faixa aplicada:* ${fmt(ir.aliquota * 100, 1)}%`, `*Alíquota efetiva:* ${fmt(ir.valor / bruto * 100, 2)}% do bruto`] },
                { emoji: '🔍', titulo: 'Como cheguei aí', linhas: [`*INSS abatido antes:* ${moeda(inss.total)}`, `*Dependentes:* ${dep} (${moeda(dep * IRRF_DEDUCAO_DEPENDENTE)} de dedução)`, `*Método escolhido:* ${ir.usouSimplificado ? 'desconto simplificado de ' + moeda(IRRF_DESCONTO_SIMPLIFICADO) : 'deduções legais'}`] },
                { emoji: '📊', titulo: 'A tabela mensal', linhas: IRRF_FAIXAS.map(f => `• Até ${f.ate === Infinity ? 'acima' : moeda(f.ate)}: ${f.aliquota === 0 ? 'isento' : fmt(f.aliquota * 100, 1) + '%, deduz ' + moeda(f.deducao)}`) },
                secaoVigencia(VIGENCIA_IRRF)
            ]
        }
    }
})

C('ferias', {
    emoji: '🏖️', titulo: 'Férias com o terço',
    descricao: 'Calcula o valor das férias com o terço legal',
    uso: '<salário bruto> [dias de férias] [dependentes]',
    exemplos: [{ args: '4000', oque: 'trinta dias de férias' }, { args: '4000 20 1', oque: 'vinte dias e um dependente' }],
    dica: 'Vender dez dias das férias rende o abono pecuniário, que entra sem imposto de renda.',
    calcular(args) {
        const bruto = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const dias = args[1] ? Math.round(exigirNumero(args[1], 'dias de férias', { minimo: 1, maximo: 30 })) : 30
        const dep = args[2] ? Math.round(exigirNumero(args[2], 'número de dependentes', { permiteNegativo: false, maximo: 30 })) : 0
        const proporcional = bruto / 30 * dias
        const terco = proporcional / 3
        const brutoFerias = proporcional + terco
        const inss = calcularInss(brutoFerias)
        const ir = calcularIrrf(brutoFerias, inss.total, dep)
        const liquido = brutoFerias - inss.total - ir.valor
        return {
            intro: `${dias} dias de férias sobre ${moeda(bruto)} rendem ${'*' + moeda(liquido) + ' líquidos*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Férias proporcionais:* ${moeda(proporcional)}`, `*Terço constitucional:* ${moeda(terco)}`, `*Bruto das férias:* ${moeda(brutoFerias)}`, `*Líquido a receber:* ${moeda(liquido)}`] },
                { emoji: '🧾', titulo: 'Descontos', linhas: [`*INSS:* ${moeda(inss.total)}`, `*Imposto de renda:* ${moeda(ir.valor)}`, `*Total descontado:* ${moeda(inss.total + ir.valor)}`] },
                { emoji: '💡', titulo: 'Se vender dez dias', linhas: [`O abono de 10 dias somaria ${moeda(bruto / 30 * 10 * 4 / 3)} brutos, e esse pedaço não paga imposto de renda.`] },
                secaoVigencia(VIGENCIA_INSS, VIGENCIA_IRRF)
            ]
        }
    }
})

C('decimo_terceiro', {
    emoji: '🎁', titulo: 'Décimo terceiro salário',
    descricao: 'Calcula as duas parcelas do décimo terceiro',
    uso: '<salário bruto> [meses trabalhados] [dependentes]',
    exemplos: [{ args: '3500', oque: 'ano inteiro trabalhado' }, { args: '3500 7 1', oque: 'sete meses e um dependente' }],
    dica: 'A primeira parcela sai sem desconto; todo o INSS e o imposto caem na segunda. Por isso ela vem bem menor.',
    calcular(args) {
        const bruto = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const meses = args[1] ? Math.round(exigirNumero(args[1], 'meses trabalhados', { minimo: 1, maximo: 12 })) : 12
        const dep = args[2] ? Math.round(exigirNumero(args[2], 'número de dependentes', { permiteNegativo: false, maximo: 30 })) : 0
        const total = bruto / 12 * meses
        const primeira = total / 2
        const inss = calcularInss(total)
        const ir = calcularIrrf(total, inss.total, dep)
        const segunda = total - primeira - inss.total - ir.valor
        return {
            intro: `Com ${meses} meses trabalhados, o décimo terceiro soma ${'*' + moeda(total - inss.total - ir.valor) + ' líquidos*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Décimo terceiro bruto:* ${moeda(total)}`, `*Primeira parcela (até 30 de novembro):* ${moeda(primeira)}`, `*Segunda parcela (até 20 de dezembro):* ${moeda(segunda)}`, `*Total líquido:* ${moeda(total - inss.total - ir.valor)}`] },
                { emoji: '🧾', titulo: 'Descontos na segunda parcela', linhas: [`*INSS:* ${moeda(inss.total)}`, `*Imposto de renda:* ${moeda(ir.valor)}`, `*Avos contados:* ${meses} de 12`] },
                secaoVigencia(VIGENCIA_INSS, VIGENCIA_IRRF)
            ]
        }
    }
})

C('rescisao_sem_justa', {
    emoji: '📄', titulo: 'Rescisão sem justa causa',
    descricao: 'Estima a rescisão de quem foi mandado embora',
    uso: '<salário> <meses na empresa> [saldo do FGTS]',
    exemplos: [{ args: '3000 18', oque: 'três mil de salário, ano e meio de casa' }, { args: '5000 40 16000', oque: 'com saldo do FGTS informado' }],
    dica: 'Se não informar o saldo do FGTS, eu estimo em 8% de cada salário do período.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const meses = Math.round(exigirNumero(args[1], 'meses de trabalho', { minimo: 1, maximo: 600 }))
        const anos = Math.floor(meses / 12)
        const fgtsSaldo = args[2] ? exigirNumero(args[2], 'saldo do FGTS', { permiteNegativo: false }) : salario * 0.08 * meses
        const avisoDias = Math.min(90, 30 + anos * 3)
        const aviso = salario / 30 * avisoDias
        const saldoSalario = salario / 30 * 15
        const feriasProp = (salario / 12) * (meses % 12) * (4 / 3)
        const feriasVencidas = anos >= 1 ? salario * (4 / 3) : 0
        const decimo = (salario / 12) * (meses % 12)
        const multa = fgtsSaldo * 0.4
        const total = aviso + saldoSalario + feriasProp + feriasVencidas + decimo + multa + fgtsSaldo
        return {
            intro: `Com ${meses} meses de casa e ${moeda(salario)} de salário, a rescisão gira em torno de ${'*' + moeda(total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'O que compõe', linhas: [`*Aviso prévio (${avisoDias} dias):* ${moeda(aviso)}`, `*Saldo de salário (15 dias):* ${moeda(saldoSalario)}`, `*Férias proporcionais com terço:* ${moeda(feriasProp)}`, `*Férias vencidas com terço:* ${moeda(feriasVencidas)}`, `*Décimo terceiro proporcional:* ${moeda(decimo)}`] },
                { emoji: '🏦', titulo: 'FGTS', linhas: [`*Saldo estimado:* ${moeda(fgtsSaldo)}`, `*Multa de 40%:* ${moeda(multa)}`, `*Liberação:* saque total mais a multa`] },
                { emoji: '💰', titulo: 'Soma', linhas: [`*Total bruto estimado:* ${moeda(total)}`, `*Sem contar o saldo do FGTS:* ${moeda(total - fgtsSaldo)}`, `*Anos completos contados:* ${anos}`] },
                { emoji: '⚠️', titulo: 'Estimativa, não acerto oficial', linhas: ['O acerto real depende de faltas, convenção coletiva, descontos e da data exata da saída. Isto dá a ordem de grandeza.'] }
            ]
        }
    }
})

C('rescisao_pedido', {
    emoji: '🚪', titulo: 'Rescisão por pedido de demissão',
    descricao: 'Estima o acerto de quem pede para sair',
    uso: '<salário> <meses na empresa> [cumpre aviso: sim ou nao]',
    exemplos: [{ args: '3000 18 sim', oque: 'cumprindo o aviso prévio' }, { args: '4000 26 nao', oque: 'sem cumprir o aviso' }],
    dica: 'Quem pede demissão não saca o FGTS nem recebe a multa de 40%, e paga aviso se não cumprir.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const meses = Math.round(exigirNumero(args[1], 'meses de trabalho', { minimo: 1, maximo: 600 }))
        const cumpre = !chave(args[2] || 'sim').startsWith('n')
        const anos = Math.floor(meses / 12)
        const saldoSalario = salario / 30 * 15
        const feriasProp = (salario / 12) * (meses % 12) * (4 / 3)
        const feriasVencidas = anos >= 1 ? salario * (4 / 3) : 0
        const decimo = (salario / 12) * (meses % 12)
        const descontoAviso = cumpre ? 0 : salario
        const total = saldoSalario + feriasProp + feriasVencidas + decimo - descontoAviso
        return {
            intro: `Pedindo demissão com ${meses} meses de casa, o acerto fica perto de ${'*' + moeda(total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'O que você recebe', linhas: [`*Saldo de salário (15 dias):* ${moeda(saldoSalario)}`, `*Férias proporcionais com terço:* ${moeda(feriasProp)}`, `*Férias vencidas com terço:* ${moeda(feriasVencidas)}`, `*Décimo terceiro proporcional:* ${moeda(decimo)}`] },
                { emoji: '➖', titulo: 'O que você não recebe', linhas: [`*Multa de 40% do FGTS:* não cabe em pedido de demissão`, `*Saque do FGTS:* fica retido`, `*Seguro-desemprego:* não cabe`, cumpre ? '*Aviso prévio:* cumprido, sem desconto' : `*Aviso não cumprido:* desconto de ${moeda(descontoAviso)}`] },
                { emoji: '💰', titulo: 'Soma', linhas: [`*Total bruto estimado:* ${moeda(total)}`] },
                { emoji: '⚠️', titulo: 'Estimativa', linhas: ['O acerto real depende da convenção coletiva e da data exata da saída.'] }
            ]
        }
    }
})

C('hora_extra50', {
    emoji: '⏰', titulo: 'Hora extra de 50%',
    descricao: 'Calcula hora extra com adicional de 50%',
    uso: '<salário mensal> <horas extras> [jornada mensal]',
    exemplos: [{ args: '3000 10', oque: 'dez horas extras em jornada de 220' }, { args: '2500 8 180', oque: 'jornada menor' }],
    dica: 'A jornada padrão de 44 horas semanais dá 220 horas por mês. Jornada de 36 horas dá 180.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário mensal', { permiteNegativo: false, permiteZero: false })
        const horas = exigirNumero(args[1], 'quantidade de horas extras', { permiteNegativo: false, permiteZero: false })
        const jornada = args[2] ? exigirNumero(args[2], 'jornada mensal', { permiteNegativo: false, permiteZero: false }) : 220
        const valorHora = salario / jornada
        const valorExtra = valorHora * 1.5
        const total = valorExtra * horas
        return {
            intro: `${fmt(horas, 1)} horas extras a 50% rendem ${'*' + moeda(total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor da hora normal:* ${moeda(valorHora)}`, `*Valor da hora extra:* ${moeda(valorExtra)}`, `*Horas extras:* ${fmt(horas, 1)}`, `*Total a receber:* ${moeda(total)}`] },
                { emoji: '📊', titulo: 'No mês', linhas: [`*Salário com as extras:* ${moeda(salario + total)}`, `*Aumento no bruto:* ${fmt(total / salario * 100, 1)}%`, `*Reflexo no DSF (descanso):* cerca de ${moeda(total / 6)}`] },
                { emoji: '📘', titulo: 'Base legal', linhas: ['A Constituição garante no mínimo 50% sobre a hora normal. Convenção coletiva pode pedir mais, nunca menos.'] }
            ]
        }
    }
})

C('hora_extra100', {
    emoji: '🌙', titulo: 'Hora extra de 100%',
    descricao: 'Calcula hora extra de domingo e feriado',
    uso: '<salário mensal> <horas extras> [jornada mensal]',
    exemplos: [{ args: '3000 8', oque: 'oito horas em domingo' }, { args: '4200 6 180', oque: 'jornada de 180 horas' }],
    dica: 'Domingo e feriado sem folga compensatória costumam valer o dobro da hora normal.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário mensal', { permiteNegativo: false, permiteZero: false })
        const horas = exigirNumero(args[1], 'quantidade de horas extras', { permiteNegativo: false, permiteZero: false })
        const jornada = args[2] ? exigirNumero(args[2], 'jornada mensal', { permiteNegativo: false, permiteZero: false }) : 220
        const valorHora = salario / jornada
        const total = valorHora * 2 * horas
        return {
            intro: `${fmt(horas, 1)} horas a 100% rendem ${'*' + moeda(total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor da hora normal:* ${moeda(valorHora)}`, `*Valor da hora em dobro:* ${moeda(valorHora * 2)}`, `*Horas trabalhadas:* ${fmt(horas, 1)}`, `*Total a receber:* ${moeda(total)}`] },
                { emoji: '📊', titulo: 'Comparação', linhas: [`*Se fosse a 50%:* ${moeda(valorHora * 1.5 * horas)}`, `*Diferença a mais:* ${moeda(total - valorHora * 1.5 * horas)}`, `*Salário com as extras:* ${moeda(salario + total)}`] },
                { emoji: '📘', titulo: 'Quando cabe', linhas: ['Trabalho em domingo ou feriado sem folga na mesma semana. Se a empresa compensa com folga, o adicional pode não caber.'] }
            ]
        }
    }
})

C('adicional_noturno', {
    emoji: '🌛', titulo: 'Adicional noturno',
    descricao: 'Calcula o adicional noturno com hora reduzida',
    uso: '<salário mensal> <horas noturnas> [jornada mensal]',
    exemplos: [{ args: '3000 40', oque: 'quarenta horas noturnas no mês' }, { args: '2200 56 180', oque: 'outra jornada' }],
    dica: 'A hora noturna urbana dura 52 minutos e 30 segundos. Sete horas de relógio valem oito horas de folha.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário mensal', { permiteNegativo: false, permiteZero: false })
        const horasRelogio = exigirNumero(args[1], 'horas noturnas', { permiteNegativo: false, permiteZero: false })
        const jornada = args[2] ? exigirNumero(args[2], 'jornada mensal', { permiteNegativo: false, permiteZero: false }) : 220
        const valorHora = salario / jornada
        const horasFolha = horasRelogio * (60 / 52.5)
        const adicional = horasFolha * valorHora * 0.2
        const totalHoras = horasFolha * valorHora
        return {
            intro: `${fmt(horasRelogio, 1)} horas noturnas rendem ${'*' + moeda(adicional) + ' de adicional*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Adicional noturno (20%):* ${moeda(adicional)}`, `*Horas de relógio:* ${fmt(horasRelogio, 1)}`, `*Horas contadas na folha:* ${fmt(horasFolha, 2)}`, `*Valor das horas mais o adicional:* ${moeda(totalHoras + adicional)}`] },
                { emoji: '🕐', titulo: 'A hora reduzida', linhas: [`Cada hora entre 22h e 5h vale 52 minutos e 30 segundos. Suas ${fmt(horasRelogio, 1)} horas viram ${fmt(horasFolha, 2)} horas para pagamento.`, `*Ganho só da redução:* ${moeda((horasFolha - horasRelogio) * valorHora)}`] },
                { emoji: '📘', titulo: 'Base legal', linhas: ['Artigo 73 da CLT: 20% no mínimo para trabalhador urbano. No campo o horário e o percentual são outros.'] }
            ]
        }
    }
})

C('fgts_mensal', {
    emoji: '🏦', titulo: 'FGTS depositado',
    descricao: 'Calcula o FGTS depositado ao longo do tempo',
    uso: '<salário> <meses> [rendimento anual %]',
    exemplos: [{ args: '3000 24', oque: 'dois anos com o mesmo salário' }, { args: '5000 60 3', oque: 'cinco anos com rendimento de 3%' }],
    dica: 'O depósito é 8% do bruto todo mês, pago pela empresa, sem sair do seu salário.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const meses = Math.round(exigirNumero(args[1], 'quantidade de meses', { minimo: 1, maximo: 600 }))
        const taxaAno = args[2] ? exigirNumero(args[2], 'rendimento anual', { permiteNegativo: false }) : 3
        const deposito = salario * 0.08
        const taxaMes = Math.pow(1 + taxaAno / 100, 1 / 12) - 1
        let saldo = 0
        for (let i = 0; i < meses; i++) saldo = (saldo + deposito) * (1 + taxaMes)
        return {
            intro: `Em ${meses} meses o FGTS chega a cerca de ${'*' + moeda(saldo) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Depósito mensal (8%):* ${moeda(deposito)}`, `*Total depositado:* ${moeda(deposito * meses)}`, `*Rendimento acumulado:* ${moeda(saldo - deposito * meses)}`, `*Saldo estimado:* ${moeda(saldo)}`] },
                { emoji: '📊', titulo: 'Se sair sem justa causa', linhas: [`*Multa de 40%:* ${moeda(saldo * 0.4)}`, `*Saque mais multa:* ${moeda(saldo * 1.4)}`] },
                { emoji: '📘', titulo: 'Sobre o rendimento', linhas: ['O FGTS rende 3% ao ano mais a TR, e distribui parte do lucro do fundo. Por isso o saldo real costuma ficar um pouco acima desta conta.'] }
            ]
        }
    }
})

C('fgts_multa', {
    emoji: '💸', titulo: 'Multa de 40% do FGTS',
    descricao: 'Calcula a multa de 40% sobre o saldo do FGTS',
    uso: '<saldo do FGTS>',
    exemplos: [{ args: '12000', oque: 'saldo de doze mil' }, { args: '35000', oque: 'saldo maior' }],
    dica: 'A multa é paga pela empresa por cima do saldo: você saca o saldo inteiro mais a multa.',
    calcular(args) {
        const saldo = exigirNumero(args[0], 'saldo do FGTS', { permiteNegativo: false, permiteZero: false })
        return {
            intro: `Sobre ${moeda(saldo)} de saldo, a multa é ${'*' + moeda(saldo * 0.4) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Saldo do FGTS:* ${moeda(saldo)}`, `*Multa de 40%:* ${moeda(saldo * 0.4)}`, `*Total a sacar:* ${moeda(saldo * 1.4)}`] },
                { emoji: '📊', titulo: 'Em outros acordos', linhas: [`*Acordo entre as partes (20%):* ${moeda(saldo * 0.2)}, com saque de 80% do saldo`, `*Pedido de demissão:* sem multa e sem saque`, `*Justa causa:* sem multa e sem saque`] }
            ]
        }
    }
})

C('seguro_desemprego', {
    emoji: '🛟', titulo: 'Seguro-desemprego',
    descricao: 'Estima o valor e o número de parcelas do seguro',
    uso: '<média dos 3 últimos salários> [vezes que já pediu]',
    exemplos: [{ args: '2400', oque: 'média de dois mil e quatrocentos' }, { args: '3500 2', oque: 'terceira solicitação' }],
    dica: 'O número de parcelas depende do tempo de carteira assinada e de quantas vezes você já pediu.',
    calcular(args) {
        const media = exigirNumero(args[0], 'média salarial', { permiteNegativo: false, permiteZero: false })
        const vezes = args[1] ? Math.round(exigirNumero(args[1], 'número de solicitações anteriores', { permiteNegativo: false, maximo: 10 })) : 0
        const F1 = 2138.76, F2 = 3564.96
        let parcela
        if (media <= F1) parcela = media * 0.8
        else if (media <= F2) parcela = F1 * 0.8 + (media - F1) * 0.5
        else parcela = 2313.74
        parcela = Math.max(1518, Math.min(parcela, 2313.74))
        const parcelas = vezes === 0 ? 4 : vezes === 1 ? 4 : 3
        return {
            intro: `Com média de ${moeda(media)}, a parcela fica em cerca de ${'*' + moeda(parcela) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor de cada parcela:* ${moeda(parcela)}`, `*Parcelas prováveis:* ${parcelas}`, `*Total estimado:* ${moeda(parcela * parcelas)}`, `*Piso da parcela:* ${moeda(1518)} (um salário mínimo)`] },
                { emoji: '📊', titulo: 'Como a faixa funciona', linhas: [`• Até ${moeda(F1)}: 80% da média`, `• De ${moeda(F1)} a ${moeda(F2)}: 80% da primeira faixa mais 50% do que passar`, `• Acima de ${moeda(F2)}: teto fixo de ${moeda(2313.74)}`] },
                { emoji: '📋', titulo: 'Quantas parcelas', linhas: ['Na primeira e na segunda solicitação são 4 ou 5 parcelas conforme o tempo de carteira; da terceira em diante, 3 a 5. O número exato sai no requerimento.'] },
                secaoVigencia('tabela do seguro-desemprego vigente desde janeiro de 2025')
            ]
        }
    }
})

C('vale_transporte', {
    emoji: '🚌', titulo: 'Desconto do vale-transporte',
    descricao: 'Calcula o desconto legal do vale-transporte',
    uso: '<salário> <valor da passagem> [dias trabalhados no mês]',
    exemplos: [{ args: '2000 5,50', oque: 'passagem de cinco e cinquenta' }, { args: '3000 4,40 20', oque: 'vinte dias de trabalho' }],
    dica: 'A empresa desconta no máximo 6% do salário. O que passar disso é custo dela, não seu.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário bruto', { permiteNegativo: false, permiteZero: false })
        const passagem = exigirNumero(args[1], 'valor da passagem', { permiteNegativo: false, permiteZero: false })
        const dias = args[2] ? Math.round(exigirNumero(args[2], 'dias trabalhados', { minimo: 1, maximo: 31 })) : 22
        const custoTotal = passagem * 2 * dias
        const limite = salario * 0.06
        const descontado = Math.min(custoTotal, limite)
        return {
            intro: `Você paga ${'*' + moeda(descontado) + '*'} de vale-transporte no mês.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Custo total do transporte:* ${moeda(custoTotal)}`, `*Limite de 6% do salário:* ${moeda(limite)}`, `*Descontado de você:* ${moeda(descontado)}`, `*Pago pela empresa:* ${moeda(Math.max(0, custoTotal - descontado))}`] },
                { emoji: '📊', titulo: 'Detalhe', linhas: [`*Passagens por dia:* 2 (ida e volta)`, `*Dias contados:* ${dias}`, `*Custo por dia:* ${moeda(passagem * 2)}`] },
                { emoji: '📘', titulo: 'Base legal', linhas: ['Lei 7.418/1985: o desconto fica limitado a 6% do salário básico. O excedente é obrigação do empregador.'] }
            ]
        }
    }
})

C('valor_hora', {
    emoji: '🕐', titulo: 'Valor da sua hora',
    descricao: 'Descobre quanto vale uma hora do seu trabalho',
    uso: '<salário mensal> [horas por semana]',
    exemplos: [{ args: '4000', oque: 'jornada de 44 horas semanais' }, { args: '6000 30', oque: 'trinta horas por semana' }],
    dica: 'Para trabalho por conta própria, some férias, décimo terceiro e período sem cliente antes de fechar o preço.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário mensal', { permiteNegativo: false, permiteZero: false })
        const horasSemana = args[1] ? exigirNumero(args[1], 'horas por semana', { permiteNegativo: false, permiteZero: false, maximo: 168 }) : 44
        const horasMes = horasSemana * 5
        const hora = salario / horasMes
        return {
            intro: `Uma hora sua vale ${'*' + moeda(hora) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor da hora:* ${moeda(hora)}`, `*Horas no mês:* ${fmt(horasMes, 0)}`, `*Valor do dia (8h):* ${moeda(hora * 8)}`, `*Valor do minuto:* ${moeda(hora / 60)}`] },
                { emoji: '💼', titulo: 'Se fosse autônomo', linhas: [`Para manter o mesmo padrão sem carteira assinada, cobre cerca de ${moeda(hora * 1.8)} por hora: o acréscimo cobre férias, décimo terceiro, INSS e o tempo sem cliente.`] },
                { emoji: '🧠', titulo: 'Uso prático', linhas: [`Aquela tarefa chata de 3 horas custa ${moeda(hora * 3)} do seu tempo. Às vezes pagar alguém para fazer sai mais barato.`] }
            ]
        }
    }
})

C('salario_proporcional', {
    emoji: '📆', titulo: 'Salário proporcional aos dias',
    descricao: 'Calcula o salário por dias trabalhados no mês',
    uso: '<salário mensal> <dias trabalhados>',
    exemplos: [{ args: '3000 12', oque: 'entrou no meio do mês' }, { args: '4500 22', oque: 'mês quase todo' }],
    dica: 'Para salário mensal, a conta legal usa o mês de 30 dias, mesmo em fevereiro.',
    calcular(args) {
        const salario = exigirNumero(args[0], 'salário mensal', { permiteNegativo: false, permiteZero: false })
        const dias = exigirNumero(args[1], 'dias trabalhados', { minimo: 0, maximo: 31 })
        const valor = salario / 30 * dias
        return {
            intro: `${fmt(dias, 0)} dias de trabalho valem ${'*' + moeda(valor) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor proporcional:* ${moeda(valor)}`, `*Valor do dia:* ${moeda(salario / 30)}`, `*Dias contados:* ${fmt(dias, 0)} de 30`, `*Percentual do salário:* ${fmt(dias / 30 * 100, 1)}%`] },
                { emoji: '🎁', titulo: 'Reflexos do período', linhas: [`*Décimo terceiro proporcional:* ${moeda(salario / 12 * (dias >= 15 ? 1 : 0))}`, `*Férias proporcionais com terço:* ${moeda((salario / 12) * (dias >= 15 ? 1 : 0) * 4 / 3)}`, 'Mês com 15 dias ou mais trabalhados conta um avo cheio.'] }
            ]
        }
    }
})

C('aviso_previo', {
    emoji: '📢', titulo: 'Dias de aviso prévio',
    descricao: 'Calcula os dias de aviso prévio pelo tempo de casa',
    uso: '<anos completos na empresa>',
    exemplos: [{ args: '5', oque: 'cinco anos de casa' }, { args: '12', oque: 'doze anos de casa' }],
    dica: 'São 30 dias fixos mais 3 por ano completo, até o teto de 90 dias — ou seja, 20 anos de casa.',
    calcular(args) {
        const anos = Math.floor(exigirNumero(args[0], 'anos completos de trabalho', { permiteNegativo: false, maximo: 60 }))
        const dias = Math.min(90, 30 + anos * 3)
        const faltamAoTeto = Math.max(0, 20 - anos)
        return {
            intro: `Com ${anos} ano${anos === 1 ? '' : 's'} de casa, o aviso prévio é de ${'*' + dias + ' dias*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Dias de aviso:* ${dias}`, `*Base fixa:* 30 dias`, `*Acréscimo por tempo:* ${Math.min(60, anos * 3)} dias`, `*Data final se começar hoje:* ${fmtData(somaDias(hoje(), dias))}`] },
                { emoji: '📊', titulo: 'Como evolui', linhas: [1, 5, 10, 20].map(a => `• ${a} ano${a === 1 ? '' : 's'}: ${Math.min(90, 30 + a * 3)} dias`) },
                { emoji: '📘', titulo: 'Detalhe', linhas: [faltamAoTeto > 0 ? `Faltam ${faltamAoTeto} anos para você chegar ao teto de 90 dias.` : 'Você já está no teto de 90 dias.', 'Lei 12.506/2011. O acréscimo só vale quando a empresa dispensa, não quando você pede.'] }
            ]
        }
    }
})

/* ───────────────────── Calculadoras: dinheiro (21) ───────────────────── */

C('juros_simples', {
    emoji: '📈', titulo: 'Juros simples',
    descricao: 'Calcula juros simples sobre um valor',
    uso: '<capital> <taxa % ao mês> <meses>',
    exemplos: [{ args: '1000 2 12', oque: 'mil reais a 2% ao mês por um ano' }, { args: '5000 1,5 6', oque: 'cinco mil por seis meses' }],
    dica: 'No juro simples a base nunca muda: os juros do mês 10 são iguais aos do mês 1.',
    calcular(args) {
        const capital = exigirNumero(args[0], 'capital', { permiteNegativo: false, permiteZero: false })
        const taxa = exigirNumero(args[1], 'taxa mensal em porcento', { permiteNegativo: false }) / 100
        const meses = exigirNumero(args[2], 'número de meses', { permiteNegativo: false, permiteZero: false })
        const juros = capital * taxa * meses
        const composto = capital * Math.pow(1 + taxa, meses) - capital
        return {
            intro: `${moeda(capital)} a ${fmt(taxa * 100, 2)}% ao mês por ${fmt(meses, 0)} meses viram ${'*' + moeda(capital + juros) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Capital inicial:* ${moeda(capital)}`, `*Juros do período:* ${moeda(juros)}`, `*Montante final:* ${moeda(capital + juros)}`, `*Juros por mês:* ${moeda(capital * taxa)}`] },
                { emoji: '🔍', titulo: 'Se fosse juro composto', linhas: [`*Juros compostos:* ${moeda(composto)}`, `*Diferença:* ${moeda(composto - juros)} a mais no composto`] }
            ]
        }
    }
})

C('juros_compostos', {
    emoji: '🚀', titulo: 'Juros compostos',
    descricao: 'Calcula juros compostos sobre um valor',
    uso: '<capital> <taxa % ao mês> <meses>',
    exemplos: [{ args: '1000 1 120', oque: 'mil reais a 1% ao mês por dez anos' }, { args: '20000 0,9 36', oque: 'três anos de aplicação' }],
    dica: 'Aqui o juro rende sobre o juro. Quanto mais tempo, mais a curva sobe.',
    calcular(args) {
        const capital = exigirNumero(args[0], 'capital', { permiteNegativo: false, permiteZero: false })
        const taxa = exigirNumero(args[1], 'taxa mensal em porcento', { permiteNegativo: false }) / 100
        const meses = exigirNumero(args[2], 'número de meses', { permiteNegativo: false, permiteZero: false })
        const montante = capital * Math.pow(1 + taxa, meses)
        const simples = capital * taxa * meses
        return {
            intro: `${moeda(capital)} a ${fmt(taxa * 100, 2)}% ao mês por ${fmt(meses, 0)} meses viram ${'*' + moeda(montante) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Capital inicial:* ${moeda(capital)}`, `*Juros acumulados:* ${moeda(montante - capital)}`, `*Montante final:* ${moeda(montante)}`, `*Multiplicou por:* ${fmt(montante / capital, 2)} vezes`] },
                { emoji: '📊', titulo: 'No caminho', linhas: [Math.round(meses / 4), Math.round(meses / 2), Math.round(meses * 3 / 4)].filter(m => m > 0).map(m => `• Mês ${m}: ${moeda(capital * Math.pow(1 + taxa, m))}`) },
                { emoji: '🔍', titulo: 'Comparação', linhas: [`*No juro simples seria:* ${moeda(capital + simples)}`, `*O composto rendeu a mais:* ${moeda(montante - capital - simples)}`, `*Taxa equivalente ao ano:* ${fmt((Math.pow(1 + taxa, 12) - 1) * 100, 2)}%`] }
            ]
        }
    }
})

C('aporte_mensal', {
    emoji: '🏗️', titulo: 'Investir todo mês',
    descricao: 'Mostra quanto rende guardar um valor todo mês',
    uso: '<aporte mensal> <taxa % ao mês> <meses> [valor inicial]',
    exemplos: [{ args: '500 0,8 120', oque: 'quinhentos por mês durante dez anos' }, { args: '1000 1 60 10000', oque: 'com dez mil de partida' }],
    dica: 'O aporte constante costuma pesar mais que o valor inicial quando o prazo é longo.',
    calcular(args) {
        const aporte = exigirNumero(args[0], 'aporte mensal', { permiteNegativo: false, permiteZero: false })
        const taxa = exigirNumero(args[1], 'taxa mensal em porcento', { permiteNegativo: false }) / 100
        const meses = Math.round(exigirNumero(args[2], 'número de meses', { permiteNegativo: false, permiteZero: false, maximo: 1200 }))
        const inicial = args[3] ? exigirNumero(args[3], 'valor inicial', { permiteNegativo: false }) : 0
        const fatorInicial = inicial * Math.pow(1 + taxa, meses)
        const fatorAportes = taxa === 0 ? aporte * meses : aporte * ((Math.pow(1 + taxa, meses) - 1) / taxa)
        const total = fatorInicial + fatorAportes
        const investido = inicial + aporte * meses
        return {
            intro: `Guardando ${moeda(aporte)} por mês durante ${meses} meses você chega a ${'*' + moeda(total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Total investido:* ${moeda(investido)}`, `*Rendimento:* ${moeda(total - investido)}`, `*Valor final:* ${moeda(total)}`, `*Rendimento sobre o investido:* ${fmt((total / investido - 1) * 100, 1)}%`] },
                { emoji: '🧱', titulo: 'De onde vem o bolo', linhas: [`*Do valor inicial:* ${moeda(fatorInicial)}`, `*Dos aportes:* ${moeda(fatorAportes)}`, `*Renda mensal ao final (${fmt(taxa * 100, 2)}%):* ${moeda(total * taxa)}`] },
                { emoji: '📊', titulo: 'No caminho', linhas: [12, 60, 120].filter(m => m < meses).map(m => `• Mês ${m}: ${moeda(inicial * Math.pow(1 + taxa, m) + (taxa === 0 ? aporte * m : aporte * ((Math.pow(1 + taxa, m) - 1) / taxa)))}`) }
            ]
        }
    }
})

C('price', {
    emoji: '🏠', titulo: 'Financiamento pela tabela Price',
    descricao: 'Calcula a parcela fixa de um financiamento',
    uso: '<valor financiado> <taxa % ao mês> <meses>',
    exemplos: [{ args: '200000 0,8 360', oque: 'imóvel em trinta anos' }, { args: '40000 1,5 48', oque: 'carro em quatro anos' }],
    dica: 'Na Price a parcela nunca muda; o que muda é a mistura entre juros e amortização dentro dela.',
    calcular(args) {
        const valor = exigirNumero(args[0], 'valor financiado', { permiteNegativo: false, permiteZero: false })
        const taxa = exigirNumero(args[1], 'taxa mensal em porcento', { permiteNegativo: false }) / 100
        const n = Math.round(exigirNumero(args[2], 'número de parcelas', { permiteNegativo: false, permiteZero: false, maximo: 600 }))
        const parcela = taxa === 0 ? valor / n : valor * (taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1)
        const total = parcela * n
        const jurosPrimeira = valor * taxa
        return {
            intro: `Financiando ${moeda(valor)} em ${n} vezes, a parcela fixa é ${'*' + moeda(parcela) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Parcela fixa:* ${moeda(parcela)}`, `*Total pago:* ${moeda(total)}`, `*Só de juros:* ${moeda(total - valor)}`, `*Juros sobre o valor:* ${fmt((total / valor - 1) * 100, 1)}%`] },
                { emoji: '🔎', titulo: 'Dentro da primeira parcela', linhas: [`*Juros:* ${moeda(jurosPrimeira)}`, `*Amortização:* ${moeda(parcela - jurosPrimeira)}`, `*Sobra da dívida após pagar:* ${moeda(valor - (parcela - jurosPrimeira))}`] },
                { emoji: '📊', titulo: 'Se mudar o prazo', linhas: [Math.round(n / 2), n, Math.min(600, n * 2)].map(k => { const p = taxa === 0 ? valor / k : valor * (taxa * Math.pow(1 + taxa, k)) / (Math.pow(1 + taxa, k) - 1); return `• ${k} meses: ${moeda(p)} por mês, ${moeda(p * k)} no total` }) },
                { emoji: '💡', titulo: 'Sobre o total', linhas: ['Prazo mais longo alivia a parcela e engorda o total. Amortizar cedo é o que corta juros de verdade.'] }
            ]
        }
    }
})

C('sac', {
    emoji: '📉', titulo: 'Financiamento pelo sistema SAC',
    descricao: 'Calcula as parcelas decrescentes do sistema SAC',
    uso: '<valor financiado> <taxa % ao mês> <meses>',
    exemplos: [{ args: '200000 0,8 360', oque: 'imóvel em trinta anos' }, { args: '60000 1 60', oque: 'cinco anos' }],
    dica: 'No SAC a primeira parcela é a mais cara e cada uma vem menor que a anterior.',
    calcular(args) {
        const valor = exigirNumero(args[0], 'valor financiado', { permiteNegativo: false, permiteZero: false })
        const taxa = exigirNumero(args[1], 'taxa mensal em porcento', { permiteNegativo: false }) / 100
        const n = Math.round(exigirNumero(args[2], 'número de parcelas', { permiteNegativo: false, permiteZero: false, maximo: 600 }))
        const amortizacao = valor / n
        const primeira = amortizacao + valor * taxa
        const ultima = amortizacao + amortizacao * taxa
        const totalJuros = taxa * valor * (n + 1) / 2
        const price = taxa === 0 ? valor / n : valor * (taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1)
        return {
            intro: `No SAC, a primeira parcela é ${'*' + moeda(primeira) + '*'} e a última, ${'*' + moeda(ultima) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Amortização fixa:* ${moeda(amortizacao)}`, `*Primeira parcela:* ${moeda(primeira)}`, `*Última parcela:* ${moeda(ultima)}`, `*Queda por parcela:* ${moeda(amortizacao * taxa)}`] },
                { emoji: '💰', titulo: 'Total', linhas: [`*Juros no período:* ${moeda(totalJuros)}`, `*Total pago:* ${moeda(valor + totalJuros)}`, `*Parcela do meio:* ${moeda(amortizacao + (valor - amortizacao * Math.floor(n / 2)) * taxa)}`] },
                { emoji: '⚖️', titulo: 'SAC contra Price', linhas: [`*Parcela Price (fixa):* ${moeda(price)}`, `*Total na Price:* ${moeda(price * n)}`, `*O SAC economiza:* ${moeda(price * n - valor - totalJuros)}`, 'O SAC sai mais barato no total, mas exige aguentar as primeiras parcelas.'] }
            ]
        }
    }
})

C('parcelamento_taxa', {
    emoji: '💳', titulo: 'Juros escondidos no parcelamento',
    descricao: 'Descobre a taxa embutida em uma compra parcelada',
    uso: '<preço à vista> <valor da parcela> <número de parcelas>',
    exemplos: [{ args: '1000 95 12', oque: 'mil à vista ou doze de noventa e cinco' }, { args: '2500 230 12', oque: 'outra oferta' }],
    dica: 'Se o total parcelado for igual ao à vista, a taxa é zero e o parcelamento é vantagem pura.',
    calcular(args) {
        const vista = exigirNumero(args[0], 'preço à vista', { permiteNegativo: false, permiteZero: false })
        const parcela = exigirNumero(args[1], 'valor da parcela', { permiteNegativo: false, permiteZero: false })
        const n = Math.round(exigirNumero(args[2], 'número de parcelas', { permiteNegativo: false, permiteZero: false, maximo: 600 }))
        const total = parcela * n
        if (total < vista) throw falha(`O parcelado (${moeda(total)}) está abaixo do à vista (${moeda(vista)}). Confira os valores: assim não há juros a calcular.`)
        let taxa = 0.01
        for (let i = 0; i < 200; i++) {
            const f = taxa === 0 ? vista / n : vista * (taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1)
            const erro = f - parcela
            if (Math.abs(erro) < 0.0001) break
            taxa = Math.max(0, taxa - erro / (vista * n * 0.5) * 0.9)
        }
        const anual = (Math.pow(1 + taxa, 12) - 1) * 100
        return {
            intro: `Esse parcelamento cobra ${'*' + fmt(taxa * 100, 2) + '% ao mês*'} de juros escondidos.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Taxa mensal:* ${fmt(taxa * 100, 2)}%`, `*Taxa anual:* ${fmt(anual, 1)}%`, `*Total parcelado:* ${moeda(total)}`, `*Você paga a mais:* ${moeda(total - vista)}`] },
                { emoji: '⚖️', titulo: 'Vale a pena?', linhas: [`Se o seu dinheiro rende mais de ${fmt(taxa * 100, 2)}% ao mês, parcelar compensa. Se rende menos, pagar à vista sai melhor.`, `*Acréscimo sobre o à vista:* ${fmt((total / vista - 1) * 100, 1)}%`] }
            ]
        }
    }
})

C('desconto', {
    emoji: '🏷️', titulo: 'Preço com desconto',
    descricao: 'Calcula o preço final depois do desconto',
    uso: '<preço> <desconto em %>',
    exemplos: [{ args: '250 30', oque: 'duzentos e cinquenta com 30% off' }, { args: '89,90 15', oque: 'desconto de quinze por cento' }],
    dica: 'Compare sempre com o preço de antes da promoção, não com o preço riscado da etiqueta.',
    calcular(args) {
        const preco = exigirNumero(args[0], 'preço', { permiteNegativo: false, permiteZero: false })
        const pct = exigirNumero(args[1], 'desconto em porcento', { permiteNegativo: false, maximo: 100 })
        const valorDesconto = preco * pct / 100
        const final = preco - valorDesconto
        return {
            intro: `${moeda(preco)} com ${fmt(pct, 1)}% de desconto sai por ${'*' + moeda(final) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Preço original:* ${moeda(preco)}`, `*Desconto:* ${moeda(valorDesconto)}`, `*Preço final:* ${moeda(final)}`, `*Você paga:* ${fmt(100 - pct, 1)}% do original`] },
                { emoji: '📊', titulo: 'Outros descontos no mesmo preço', linhas: [10, 20, 50].map(p => `• ${p}% off: ${moeda(preco * (1 - p / 100))}`) },
                { emoji: '💡', titulo: 'Parcelando sem juros', linhas: [`Em 3 vezes daria ${moeda(final / 3)}; em 10 vezes, ${moeda(final / 10)}.`] }
            ]
        }
    }
})

C('aumento', {
    emoji: '📈', titulo: 'Preço com aumento',
    descricao: 'Calcula o valor depois de um aumento em %',
    uso: '<valor> <aumento em %>',
    exemplos: [{ args: '2000 8', oque: 'salário com 8% de reajuste' }, { args: '1500 4,62', oque: 'reajuste pela inflação' }],
    dica: 'Para voltar ao valor de antes, não basta tirar a mesma porcentagem: subir 20% e cair 20% não volta ao começo.',
    calcular(args) {
        const valor = exigirNumero(args[0], 'valor', { permiteNegativo: false, permiteZero: false })
        const pct = exigirNumero(args[1], 'aumento em porcento', { permiteNegativo: false })
        const aumento = valor * pct / 100
        const final = valor + aumento
        return {
            intro: `${moeda(valor)} com ${fmt(pct, 2)}% de aumento vira ${'*' + moeda(final) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor original:* ${moeda(valor)}`, `*Aumento:* ${moeda(aumento)}`, `*Valor novo:* ${moeda(final)}`, `*Multiplicador:* ${fmt(1 + pct / 100, 4)}`] },
                { emoji: '🔄', titulo: 'Caminho de volta', linhas: [`Para voltar de ${moeda(final)} a ${moeda(valor)} seria preciso um desconto de ${fmt(aumento / final * 100, 2)}%, não de ${fmt(pct, 2)}%.`] },
                { emoji: '📊', titulo: 'Se repetir todo ano', linhas: [2, 5, 10].map(a => `• Depois de ${a} anos: ${moeda(valor * Math.pow(1 + pct / 100, a))}`) }
            ]
        }
    }
})

C('margem_lucro', {
    emoji: '💹', titulo: 'Margem de lucro',
    descricao: 'Calcula a margem de lucro de uma venda',
    uso: '<custo> <preço de venda>',
    exemplos: [{ args: '40 100', oque: 'custa quarenta, vende por cem' }, { args: '18,50 29,90', oque: 'produto de revenda' }],
    dica: 'Margem é sobre a VENDA; markup é sobre o CUSTO. Confundir os dois quebra o preço do negócio.',
    calcular(args) {
        const custo = exigirNumero(args[0], 'custo', { permiteNegativo: false, permiteZero: false })
        const venda = exigirNumero(args[1], 'preço de venda', { permiteNegativo: false, permiteZero: false })
        const lucro = venda - custo
        const margem = lucro / venda * 100
        const markup = lucro / custo * 100
        return {
            intro: `Comprando por ${moeda(custo)} e vendendo por ${moeda(venda)}, a margem é ${'*' + fmt(margem, 1) + '%*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Lucro por unidade:* ${moeda(lucro)}`, `*Margem sobre a venda:* ${fmt(margem, 2)}%`, `*Markup sobre o custo:* ${fmt(markup, 2)}%`, `*Multiplicador do custo:* ${fmt(venda / custo, 2)} vezes`] },
                { emoji: '📊', titulo: 'Quanto vender para ganhar', linhas: [1000, 5000].map(meta => `• Para lucrar ${moeda(meta)}: ${fmt(meta / lucro, 0)} unidades`) },
                { emoji: '⚠️', titulo: 'Falta descontar', linhas: ['Imposto, frete, taxa de cartão e embalagem ainda saem daí. A margem limpa costuma ser bem menor que esta.'] }
            ]
        }
    }
})

C('markup', {
    emoji: '🧮', titulo: 'Preço de venda pelo markup',
    descricao: 'Descobre o preço de venda a partir do custo',
    uso: '<custo> <margem desejada em %>',
    exemplos: [{ args: '40 60', oque: 'custo quarenta, margem de 60%' }, { args: '12,90 45', oque: 'produto barato' }],
    dica: 'Para margem de 60% sobre a venda, o preço não é custo mais 60%: é custo dividido por 0,40.',
    calcular(args) {
        const custo = exigirNumero(args[0], 'custo', { permiteNegativo: false, permiteZero: false })
        const margem = exigirNumero(args[1], 'margem desejada em porcento', { permiteNegativo: false, maximo: 99.9 })
        const venda = custo / (1 - margem / 100)
        const erroComum = custo * (1 + margem / 100)
        return {
            intro: `Para ${fmt(margem, 1)}% de margem sobre ${moeda(custo)} de custo, venda por ${'*' + moeda(venda) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Preço de venda:* ${moeda(venda)}`, `*Lucro por unidade:* ${moeda(venda - custo)}`, `*Markup sobre o custo:* ${fmt((venda / custo - 1) * 100, 1)}%`, `*Índice de markup:* ${fmt(venda / custo, 3)}`] },
                { emoji: '⚠️', titulo: 'O erro mais comum', linhas: [`Somar ${fmt(margem, 1)}% ao custo daria ${moeda(erroComum)}, e a margem real seria só ${fmt((erroComum - custo) / erroComum * 100, 1)}%. Faltariam ${moeda(venda - erroComum)} por venda.`] },
                { emoji: '📊', titulo: 'Outras margens', linhas: [30, 40, 50].map(m => `• ${m}% de margem: ${moeda(custo / (1 - m / 100))}`) }
            ]
        }
    }
})

C('poupanca', {
    emoji: '🐷', titulo: 'Rendimento da poupança',
    descricao: 'Estima quanto rende dinheiro na poupança',
    uso: '<valor> <meses> [taxa % ao mês]',
    exemplos: [{ args: '10000 12', oque: 'dez mil por um ano' }, { args: '5000 24 0,5', oque: 'com taxa informada' }],
    dica: 'Com a Selic acima de 8,5% ao ano a poupança rende 0,5% ao mês mais a TR. Abaixo disso, rende 70% da Selic.',
    calcular(args) {
        const valor = exigirNumero(args[0], 'valor aplicado', { permiteNegativo: false, permiteZero: false })
        const meses = Math.round(exigirNumero(args[1], 'número de meses', { permiteNegativo: false, permiteZero: false, maximo: 1200 }))
        const taxa = (args[2] ? exigirNumero(args[2], 'taxa mensal em porcento', { permiteNegativo: false }) : 0.5) / 100
        const final = valor * Math.pow(1 + taxa, meses)
        return {
            intro: `${moeda(valor)} na poupança por ${meses} meses viram cerca de ${'*' + moeda(final) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor aplicado:* ${moeda(valor)}`, `*Rendimento:* ${moeda(final - valor)}`, `*Valor final:* ${moeda(final)}`, `*Taxa usada:* ${fmt(taxa * 100, 3)}% ao mês`] },
                { emoji: '📊', titulo: 'Comparações', linhas: [`*Se rendesse 1% ao mês:* ${moeda(valor * Math.pow(1.01, meses))}`, `*Rendimento ao ano:* ${fmt((Math.pow(1 + taxa, 12) - 1) * 100, 2)}%`, `*Ganho por mês (média):* ${moeda((final - valor) / meses)}`] },
                { emoji: '⚠️', titulo: 'O que a conta não mostra', linhas: ['A poupança só credita no aniversário do depósito: sacar um dia antes perde o mês inteiro. E a inflação come parte desse ganho.'] }
            ]
        }
    }
})

C('cdi', {
    emoji: '📊', titulo: 'Rendimento por percentual do CDI',
    descricao: 'Calcula o rendimento de aplicação atrelada ao CDI',
    uso: '<valor> <% do CDI> <meses> [CDI ao ano %]',
    exemplos: [{ args: '10000 100 12', oque: 'dez mil a 100% do CDI por um ano' }, { args: '50000 110 24 12', oque: 'com CDI de 12% ao ano' }],
    dica: 'CDB, LCI e LCA costumam ser vendidos como percentual do CDI. Informe o CDI do momento para acertar a conta.',
    calcular(args) {
        const valor = exigirNumero(args[0], 'valor aplicado', { permiteNegativo: false, permiteZero: false })
        const pctCdi = exigirNumero(args[1], 'percentual do CDI', { permiteNegativo: false, permiteZero: false })
        const meses = Math.round(exigirNumero(args[2], 'número de meses', { permiteNegativo: false, permiteZero: false, maximo: 1200 }))
        const cdiAno = args[3] ? exigirNumero(args[3], 'CDI ao ano em porcento', { permiteNegativo: false, permiteZero: false }) : 10.5
        const taxaAno = cdiAno * pctCdi / 100
        const taxaMes = Math.pow(1 + taxaAno / 100, 1 / 12) - 1
        const bruto = valor * Math.pow(1 + taxaMes, meses)
        const dias = meses * 30
        const aliq = dias <= 180 ? 0.225 : dias <= 360 ? 0.20 : dias <= 720 ? 0.175 : 0.15
        const ir = (bruto - valor) * aliq
        return {
            intro: `${moeda(valor)} a ${fmt(pctCdi, 0)}% do CDI por ${meses} meses viram ${'*' + moeda(bruto - ir) + ' líquidos*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor bruto final:* ${moeda(bruto)}`, `*Rendimento bruto:* ${moeda(bruto - valor)}`, `*Imposto de renda (${fmt(aliq * 100, 1)}%):* ${moeda(ir)}`, `*Valor líquido:* ${moeda(bruto - ir)}`] },
                { emoji: '📈', titulo: 'Taxas', linhas: [`*CDI considerado:* ${fmt(cdiAno, 2)}% ao ano`, `*Sua taxa:* ${fmt(taxaAno, 2)}% ao ano`, `*Equivale ao mês:* ${fmt(taxaMes * 100, 3)}%`] },
                { emoji: '📋', titulo: 'Tabela regressiva do imposto', linhas: ['• Até 180 dias: 22,5%', '• De 181 a 360 dias: 20%', '• De 361 a 720 dias: 17,5%', '• Acima de 720 dias: 15%', 'LCI e LCA são isentas de imposto de renda para pessoa física.'] }
            ]
        }
    }
})

C('regra72', {
    emoji: '⏳', titulo: 'Tempo para dobrar o dinheiro',
    descricao: 'Diz em quanto tempo o dinheiro dobra',
    uso: '<taxa % ao mês>',
    exemplos: [{ args: '1', oque: 'um por cento ao mês' }, { args: '0,6', oque: 'rendimento mais conservador' }],
    dica: 'A regra de 72 é um atalho de cabeça: divida 72 pela taxa e você tem o prazo aproximado.',
    calcular(args) {
        const taxa = exigirNumero(args[0], 'taxa em porcento ao mês', { permiteNegativo: false, permiteZero: false })
        const exato = Math.log(2) / Math.log(1 + taxa / 100)
        const regra = 72 / taxa
        return {
            intro: `A ${fmt(taxa, 2)}% ao mês, seu dinheiro dobra em ${'*' + fmt(exato, 1) + ' meses*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Cálculo exato:* ${fmt(exato, 2)} meses`, `*Regra de 72 (atalho):* ${fmt(regra, 1)} meses`, `*Em anos:* ${fmt(exato / 12, 2)}`, `*Erro do atalho:* ${fmt(Math.abs(regra - exato), 2)} meses`] },
                { emoji: '📊', titulo: 'Para multiplicar por', linhas: [3, 5, 10].map(k => `• ${k} vezes: ${fmt(Math.log(k) / Math.log(1 + taxa / 100), 1)} meses`) },
                { emoji: '🧠', titulo: 'Use de cabeça', linhas: ['Serve também para a inflação: com 6% ao ano, o preço das coisas dobra em uns 12 anos.'] }
            ]
        }
    }
})

C('meta_poupanca', {
    emoji: '🎯', titulo: 'Quanto guardar por mês para chegar na meta',
    descricao: 'Calcula o valor mensal para atingir uma meta',
    uso: '<meta> <meses> [taxa % ao mês]',
    exemplos: [{ args: '30000 24', oque: 'trinta mil em dois anos' }, { args: '100000 60 0,8', oque: 'cem mil em cinco anos rendendo' }],
    dica: 'Sem rendimento é divisão simples. Com rendimento, cada mês de antecedência derruba bastante o valor.',
    calcular(args) {
        const meta = exigirNumero(args[0], 'valor da meta', { permiteNegativo: false, permiteZero: false })
        const meses = Math.round(exigirNumero(args[1], 'número de meses', { permiteNegativo: false, permiteZero: false, maximo: 1200 }))
        const taxa = (args[2] ? exigirNumero(args[2], 'taxa mensal em porcento', { permiteNegativo: false }) : 0) / 100
        const aporte = taxa === 0 ? meta / meses : meta * taxa / (Math.pow(1 + taxa, meses) - 1)
        const investido = aporte * meses
        return {
            intro: `Para juntar ${moeda(meta)} em ${meses} meses, guarde ${'*' + moeda(aporte) + ' por mês*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Aporte mensal:* ${moeda(aporte)}`, `*Total que sai do bolso:* ${moeda(investido)}`, `*Rendimento no caminho:* ${moeda(meta - investido)}`, `*Taxa considerada:* ${fmt(taxa * 100, 2)}% ao mês`] },
                { emoji: '📊', titulo: 'Se mudar o prazo', linhas: [Math.max(1, Math.round(meses / 2)), meses, meses * 2].map(k => { const a = taxa === 0 ? meta / k : meta * taxa / (Math.pow(1 + taxa, k) - 1); return `• ${k} meses: ${moeda(a)} por mês` }) },
                { emoji: '📅', titulo: 'Data de chegada', linhas: [`Começando hoje, você bate a meta em ${fmtData(somaDias(hoje(), meses * 30))}.`] }
            ]
        }
    }
})

C('inflacao', {
    emoji: '🎈', titulo: 'Corrigir valor pela inflação',
    descricao: 'Corrige um valor por uma inflação anual',
    uso: '<valor> <inflação % ao ano> <anos>',
    exemplos: [{ args: '1000 4,5 10', oque: 'mil reais daqui a dez anos' }, { args: '5000 6 5', oque: 'inflação mais alta' }],
    dica: 'O valor corrigido é o que você precisaria ter para comprar a mesma coisa.',
    calcular(args) {
        const valor = exigirNumero(args[0], 'valor', { permiteNegativo: false, permiteZero: false })
        const inflacao = exigirNumero(args[1], 'inflação anual em porcento', { permiteNegativo: false }) / 100
        const anos = exigirNumero(args[2], 'número de anos', { permiteNegativo: false, permiteZero: false })
        const corrigido = valor * Math.pow(1 + inflacao, anos)
        const poder = valor / Math.pow(1 + inflacao, anos)
        return {
            intro: `${moeda(valor)} com ${fmt(inflacao * 100, 2)}% ao ano viram ${'*' + moeda(corrigido) + '*'} em ${fmt(anos, 0)} anos.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor corrigido:* ${moeda(corrigido)}`, `*Inflação acumulada:* ${fmt((Math.pow(1 + inflacao, anos) - 1) * 100, 1)}%`, `*Perda de poder de compra:* ${moeda(valor - poder)}`, `*O que ${moeda(valor)} comprará lá na frente:* ${moeda(poder)} de hoje`] },
                { emoji: '📊', titulo: 'No caminho', linhas: [1, Math.round(anos / 2), anos].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map(a => `• Ano ${a}: ${moeda(valor * Math.pow(1 + inflacao, a))}`) },
                { emoji: '🧠', titulo: 'Para que serve', linhas: ['Serve para saber se o aumento do salário cobriu a alta dos preços e para comparar valores de épocas diferentes.'] }
            ]
        }
    }
})

C('dividir_conta', {
    emoji: '🍽️', titulo: 'Dividir a conta',
    descricao: 'Divide a conta entre as pessoas da mesa',
    uso: '<valor total> <número de pessoas> [gorjeta %]',
    exemplos: [{ args: '340 5', oque: 'trezentos e quarenta entre cinco' }, { args: '520,50 7 10', oque: 'com dez por cento de gorjeta' }],
    dica: 'A gorjeta de 10% é opcional no Brasil, e precisa vir destacada na conta.',
    calcular(args) {
        const total = exigirNumero(args[0], 'valor total', { permiteNegativo: false, permiteZero: false })
        const pessoas = Math.round(exigirNumero(args[1], 'número de pessoas', { minimo: 1, maximo: 500 }))
        const gorjetaPct = args[2] ? exigirNumero(args[2], 'gorjeta em porcento', { permiteNegativo: false }) : 0
        const gorjeta = total * gorjetaPct / 100
        const comGorjeta = total + gorjeta
        const porPessoa = comGorjeta / pessoas
        const arredondado = Math.ceil(porPessoa)
        return {
            intro: `${moeda(comGorjeta)} entre ${pessoas} pessoas dá ${'*' + moeda(porPessoa) + ' para cada*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Conta:* ${moeda(total)}`, gorjetaPct ? `*Gorjeta de ${fmt(gorjetaPct, 0)}%:* ${moeda(gorjeta)}` : '*Gorjeta:* não incluída', `*Total a pagar:* ${moeda(comGorjeta)}`, `*Cada um paga:* ${moeda(porPessoa)}`] },
                { emoji: '💵', titulo: 'Para facilitar', linhas: [`*Arredondando para cima:* ${moeda(arredondado)} por pessoa`, `*Sobra nesse arredondamento:* ${moeda(arredondado * pessoas - comGorjeta)}`, `*Sem a gorjeta seria:* ${moeda(total / pessoas)} por pessoa`] }
            ]
        }
    }
})

C('gorjeta', {
    emoji: '🧾', titulo: 'Gorjeta',
    descricao: 'Calcula a gorjeta sobre o valor da conta',
    uso: '<valor da conta> [percentual]',
    exemplos: [{ args: '180', oque: 'dez por cento sobre cento e oitenta' }, { args: '250 15', oque: 'quinze por cento' }],
    dica: 'No Brasil o costume é 10%. A lei diz que a gorjeta é opcional e vai para a equipe.',
    calcular(args) {
        const conta = exigirNumero(args[0], 'valor da conta', { permiteNegativo: false, permiteZero: false })
        const pct = args[1] ? exigirNumero(args[1], 'percentual da gorjeta', { permiteNegativo: false, maximo: 100 }) : 10
        const gorjeta = conta * pct / 100
        return {
            intro: `Sobre ${moeda(conta)}, a gorjeta de ${fmt(pct, 0)}% é ${'*' + moeda(gorjeta) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Conta:* ${moeda(conta)}`, `*Gorjeta:* ${moeda(gorjeta)}`, `*Total:* ${moeda(conta + gorjeta)}`] },
                { emoji: '📊', titulo: 'Outros percentuais', linhas: [5, 10, 12, 15, 20].map(p => `• ${p}%: ${moeda(conta * p / 100)} (total ${moeda(conta * (1 + p / 100))})`) }
            ]
        }
    }
})

C('troco', {
    emoji: '🪙', titulo: 'Troco em notas e moedas',
    descricao: 'Calcula o troco e as notas para devolver',
    uso: '<valor da compra> <valor pago>',
    exemplos: [{ args: '73,40 100', oque: 'compra de setenta e três e quarenta' }, { args: '18,75 50', oque: 'pagando com cinquenta' }],
    dica: 'Eu monto o troco com o menor número possível de notas e moedas.',
    calcular(args) {
        const compra = exigirNumero(args[0], 'valor da compra', { permiteNegativo: false, permiteZero: false })
        const pago = exigirNumero(args[1], 'valor pago', { permiteNegativo: false, permiteZero: false })
        if (pago < compra) throw falha(`Faltam ${moeda(compra - pago)}: o valor pago (${moeda(pago)}) é menor que a compra (${moeda(compra)}).`)
        let centavos = Math.round((pago - compra) * 100)
        const troco = centavos / 100
        const CEDULAS = [[20000, 'nota de 200'], [10000, 'nota de 100'], [5000, 'nota de 50'], [2000, 'nota de 20'], [1000, 'nota de 10'], [500, 'nota de 5'], [200, 'nota de 2'], [100, 'moeda de 1 real'], [50, 'moeda de 50 centavos'], [25, 'moeda de 25 centavos'], [10, 'moeda de 10 centavos'], [5, 'moeda de 5 centavos'], [1, 'moeda de 1 centavo']]
        const partes = []
        for (const [v, nome] of CEDULAS) {
            const q = Math.floor(centavos / v)
            if (q > 0) { partes.push(`• ${q} ${nome}${q > 1 ? 's' : ''}`); centavos -= q * v }
        }
        return {
            intro: troco === 0 ? 'Valor exato: não há troco a devolver.' : `O troco é ${'*' + moeda(troco) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Compra:* ${moeda(compra)}`, `*Pago:* ${moeda(pago)}`, `*Troco:* ${moeda(troco)}`] },
                { emoji: '💵', titulo: 'Como devolver', linhas: partes.length ? partes : ['Nada a devolver: o valor foi exato.'] }
            ]
        }
    }
})

C('preco_por_kg', {
    emoji: '🛒', titulo: 'Qual embalagem compensa',
    descricao: 'Compara embalagens pelo preço por quilo ou litro',
    uso: '<preço1> <peso1> <preço2> <peso2>',
    exemplos: [{ args: '12,90 500 22,50 1000', oque: 'pacote de 500 g contra o de 1 kg' }, { args: '7,99 200 15,49 450', oque: 'outra comparação' }],
    dica: 'Use a mesma unidade nos dois pesos: grama com grama, mililitro com mililitro.',
    calcular(args) {
        const p1 = exigirNumero(args[0], 'preço da primeira embalagem', { permiteNegativo: false, permiteZero: false })
        const q1 = exigirNumero(args[1], 'quantidade da primeira embalagem', { permiteNegativo: false, permiteZero: false })
        const p2 = exigirNumero(args[2], 'preço da segunda embalagem', { permiteNegativo: false, permiteZero: false })
        const q2 = exigirNumero(args[3], 'quantidade da segunda embalagem', { permiteNegativo: false, permiteZero: false })
        const u1 = p1 / q1
        const u2 = p2 / q2
        const melhor = u1 <= u2 ? 1 : 2
        const economia = Math.abs(u1 - u2) * 1000
        return {
            intro: `A ${'*embalagem ' + melhor + '*'} compensa mais: sai a ${moeda(Math.min(u1, u2) * 1000)} por mil unidades de medida.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Embalagem 1:* ${moeda(p1)} por ${fmt(q1, 0)} = ${moeda(u1 * 1000)} por kg ou litro`, `*Embalagem 2:* ${moeda(p2)} por ${fmt(q2, 0)} = ${moeda(u2 * 1000)} por kg ou litro`, `*Mais barata:* embalagem ${melhor}`, `*Economia por kg ou litro:* ${moeda(economia)}`] },
                { emoji: '📊', titulo: 'Na prática', linhas: [`Comprando 5 kg ou 5 litros, a diferença chega a ${moeda(economia * 5)}.`, `*Diferença percentual:* ${fmt(Math.abs(u1 - u2) / Math.min(u1, u2) * 100, 1)}%`] }
            ]
        }
    }
})

C('vista_ou_parcelado', {
    emoji: '⚖️', titulo: 'À vista com desconto ou parcelado',
    descricao: 'Compara pagar à vista com desconto ou parcelar',
    uso: '<preço> <desconto à vista %> <parcelas> <taxa % ao mês>',
    exemplos: [{ args: '3000 10 10 0,8', oque: 'dez por cento à vista contra dez vezes' }, { args: '1200 5 6 1', oque: 'compra menor' }],
    dica: 'Parcelado sem juros com o dinheiro rendendo costuma ganhar. Com desconto alto à vista, geralmente não.',
    calcular(args) {
        const preco = exigirNumero(args[0], 'preço', { permiteNegativo: false, permiteZero: false })
        const desc = exigirNumero(args[1], 'desconto à vista em porcento', { permiteNegativo: false, maximo: 100 })
        const n = Math.round(exigirNumero(args[2], 'número de parcelas', { minimo: 1, maximo: 600 }))
        const taxa = exigirNumero(args[3], 'rendimento do seu dinheiro ao mês', { permiteNegativo: false }) / 100
        const aVista = preco * (1 - desc / 100)
        const parcela = preco / n
        let valorPresente = 0
        for (let i = 1; i <= n; i++) valorPresente += parcela / Math.pow(1 + taxa, i)
        const melhor = aVista <= valorPresente ? 'pagar à vista' : 'parcelar'
        return {
            intro: `Compensa mais ${'*' + melhor + '*'}, com diferença de ${'*' + moeda(Math.abs(aVista - valorPresente)) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Preço à vista:* ${moeda(aVista)}`, `*Valor de hoje das parcelas:* ${moeda(valorPresente)}`, `*Parcela:* ${moeda(parcela)} em ${n} vezes`, `*Melhor escolha:* ${melhor}`] },
                { emoji: '🔍', titulo: 'Como eu comparei', linhas: [`Trouxe cada parcela para o valor de hoje a ${fmt(taxa * 100, 2)}% ao mês. Dinheiro no futuro vale menos que dinheiro agora.`, `*Total nominal parcelado:* ${moeda(preco)}`, `*Desconto à vista:* ${moeda(preco - aVista)}`] },
                { emoji: '⚠️', titulo: 'Antes de decidir', linhas: ['Isto vale se o dinheiro fica mesmo rendendo. Parcelar e gastar o que sobrou é o caminho mais caro dos três.'] }
            ]
        }
    }
})

/* ─────────────────── Calculadoras: casa e obra (20) ─────────────────── */

C('tinta_parede', {
    emoji: '🎨', titulo: 'Tinta para pintar uma parede',
    descricao: 'Calcula litros de tinta para pintar uma área',
    uso: '<área em m²> [demãos]',
    exemplos: [{ args: '45', oque: 'quarenta e cinco metros quadrados, duas demãos' }, { args: '80 3', oque: 'três demãos' }],
    dica: 'Rendimento médio de tinta acrílica: 11 m² por litro em cada demão. Parede nova e porosa bebe mais.',
    calcular(args) {
        const area = exigirNumero(args[0], 'área em m²', { permiteNegativo: false, permiteZero: false })
        const demaos = args[1] ? Math.round(exigirNumero(args[1], 'número de demãos', { minimo: 1, maximo: 6 })) : 2
        const litros = area * demaos / 11
        return {
            intro: `Para ${fmt(area, 1)} m² em ${demaos} demãos você precisa de ${'*' + fmt(litros, 1) + ' litros de tinta*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Tinta necessária:* ${fmt(litros, 2)} litros`, `*Área total pintada:* ${fmt(area * demaos, 1)} m²`, `*Rendimento usado:* 11 m² por litro em cada demão`, `*Com 10% de folga:* ${fmt(litros * 1.1, 2)} litros`] },
                { emoji: '🪣', titulo: 'Como comprar', linhas: [`• Latas de 18 litros: ${Math.ceil(litros / 18)}`, `• Galões de 3,6 litros: ${Math.ceil(litros / 3.6)}`, `• Combinação econômica: ${Math.floor(litros / 18)} lata(s) e ${Math.ceil((litros % 18) / 3.6)} galão(ões)`] },
                { emoji: '💡', titulo: 'Antes de pintar', linhas: ['Parede nunca pintada pede selador antes, senão a primeira demão some. Cor escura sobre clara costuma pedir três demãos.'] }
            ]
        }
    }
})

C('piso_ceramico', {
    emoji: '🧱', titulo: 'Piso para um cômodo',
    descricao: 'Calcula caixas de piso para um cômodo',
    uso: '<largura m> <comprimento m> [m² por caixa]',
    exemplos: [{ args: '3 4', oque: 'cômodo de três por quatro metros' }, { args: '5 6,5 2,5', oque: 'com caixa de 2,5 m²' }],
    dica: 'Compre sempre com folga: peça quebrada, corte na parede e reposição futura saem do mesmo lote.',
    calcular(args) {
        const larg = exigirNumero(args[0], 'largura em metros', { permiteNegativo: false, permiteZero: false })
        const comp = exigirNumero(args[1], 'comprimento em metros', { permiteNegativo: false, permiteZero: false })
        const porCaixa = args[2] ? exigirNumero(args[2], 'metros quadrados por caixa', { permiteNegativo: false, permiteZero: false }) : 2
        const area = larg * comp
        const comPerda = area * 1.1
        const caixas = Math.ceil(comPerda / porCaixa)
        return {
            intro: `Um cômodo de ${fmt(larg, 2)} por ${fmt(comp, 2)} m pede ${'*' + caixas + ' caixas de piso*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Área do cômodo:* ${fmt(area, 2)} m²`, `*Com 10% de perda:* ${fmt(comPerda, 2)} m²`, `*Caixas a comprar:* ${caixas}`, `*Sobra prevista:* ${fmt(caixas * porCaixa - area, 2)} m²`] },
                { emoji: '📐', titulo: 'Também vai precisar', linhas: [`*Argamassa colante:* ${fmt(area * 4.5, 0)} kg`, `*Rejunte:* ${fmt(area * 0.4, 1)} kg`, `*Perímetro para rodapé:* ${fmt(2 * (larg + comp), 2)} m`] },
                { emoji: '💡', titulo: 'Sobre a perda', linhas: ['10% cobre corte reto. Assentamento na diagonal ou peça grande em ambiente pequeno pede 15%.'] }
            ]
        }
    }
})

C('rodape_metros', {
    emoji: '📏', titulo: 'Rodapé para um cômodo',
    descricao: 'Calcula metros de rodapé e barras a comprar',
    uso: '<largura m> <comprimento m> [portas]',
    exemplos: [{ args: '3 4', oque: 'cômodo com uma porta' }, { args: '4 5 2', oque: 'cômodo com duas portas' }],
    dica: 'Barra de rodapé costuma vir com 2,40 m. Desconto 80 cm por porta, que é o vão comum.',
    calcular(args) {
        const larg = exigirNumero(args[0], 'largura em metros', { permiteNegativo: false, permiteZero: false })
        const comp = exigirNumero(args[1], 'comprimento em metros', { permiteNegativo: false, permiteZero: false })
        const portas = args[2] ? Math.round(exigirNumero(args[2], 'número de portas', { permiteNegativo: false, maximo: 20 })) : 1
        const perimetro = 2 * (larg + comp)
        const util = Math.max(0, perimetro - portas * 0.8)
        const barras = Math.ceil(util * 1.05 / 2.4)
        return {
            intro: `Você precisa de ${'*' + fmt(util, 2) + ' metros de rodapé*'}, ou ${barras} barras.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Perímetro do cômodo:* ${fmt(perimetro, 2)} m`, `*Descontando ${portas} porta(s):* ${fmt(util, 2)} m`, `*Barras de 2,40 m:* ${barras}`, `*Sobra:* ${fmt(barras * 2.4 - util, 2)} m`] },
                { emoji: '🔨', titulo: 'Para instalar', linhas: [`*Cantos internos:* 4 (um em cada canto do cômodo)`, `*Cola ou massa:* cerca de ${fmt(util * 0.03, 2)} litros`, `*Emendas prováveis:* ${Math.max(0, barras - 4)}`] }
            ]
        }
    }
})

C('azulejo_parede', {
    emoji: '🚿', titulo: 'Azulejo para uma parede',
    descricao: 'Calcula azulejos para revestir uma parede',
    uso: '<largura m> <altura m> [m² por caixa]',
    exemplos: [{ args: '3 2,6', oque: 'parede de box' }, { args: '4 1,5 1,8', oque: 'meia parede de cozinha' }],
    dica: 'Meça parede por parede: cada uma tem altura diferente por causa de janela, box e bancada.',
    calcular(args) {
        const larg = exigirNumero(args[0], 'largura da parede em metros', { permiteNegativo: false, permiteZero: false })
        const alt = exigirNumero(args[1], 'altura da parede em metros', { permiteNegativo: false, permiteZero: false })
        const porCaixa = args[2] ? exigirNumero(args[2], 'metros quadrados por caixa', { permiteNegativo: false, permiteZero: false }) : 2
        const area = larg * alt
        const caixas = Math.ceil(area * 1.12 / porCaixa)
        return {
            intro: `Parede de ${fmt(larg, 2)} por ${fmt(alt, 2)} m pede ${'*' + caixas + ' caixas de azulejo*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Área da parede:* ${fmt(area, 2)} m²`, `*Com 12% de recorte:* ${fmt(area * 1.12, 2)} m²`, `*Caixas de ${fmt(porCaixa, 2)} m²:* ${caixas}`, `*Total comprado:* ${fmt(caixas * porCaixa, 2)} m²`] },
                { emoji: '🧰', titulo: 'Material de assentamento', linhas: [`*Argamassa AC-II:* ${fmt(area * 5, 0)} kg`, `*Rejunte:* ${fmt(area * 0.5, 1)} kg`, `*Espaçadores de 2 mm:* cerca de ${fmt(area * 25, 0)} unidades`] },
                { emoji: '💡', titulo: 'Recorte', linhas: ['Área molhada gasta mais que piso: tem recorte em torno de registro, ducha e nicho. Por isso 12% e não 10%.'] }
            ]
        }
    }
})

C('concreto_sacos', {
    emoji: '🏗️', titulo: 'Cimento, areia e brita para concreto',
    descricao: 'Calcula cimento, areia e brita de um concreto',
    uso: '<comprimento m> <largura m> <espessura cm>',
    exemplos: [{ args: '4 3 8', oque: 'contrapiso de oito centímetros' }, { args: '6 5 10', oque: 'piso de garagem' }],
    dica: 'Traço 1:2:3 (cimento, areia e brita), que é o mais usado em obra pequena de casa.',
    calcular(args) {
        const comp = exigirNumero(args[0], 'comprimento em metros', { permiteNegativo: false, permiteZero: false })
        const larg = exigirNumero(args[1], 'largura em metros', { permiteNegativo: false, permiteZero: false })
        const espCm = exigirNumero(args[2], 'espessura em centímetros', { permiteNegativo: false, permiteZero: false })
        const volume = comp * larg * (espCm / 100)
        const sacos = volume * 7
        const areia = volume * 0.56
        const brita = volume * 0.84
        return {
            intro: `São ${'*' + fmt(volume, 2) + ' m³ de concreto*'}, ou cerca de ${Math.ceil(sacos)} sacos de cimento.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Volume de concreto:* ${fmt(volume, 3)} m³`, `*Cimento (sacos de 50 kg):* ${Math.ceil(sacos)}`, `*Areia média:* ${fmt(areia, 2)} m³`, `*Brita 1:* ${fmt(brita, 2)} m³`] },
                { emoji: '💧', titulo: 'Água e traço', linhas: [`*Água aproximada:* ${fmt(sacos * 25, 0)} litros`, `*Traço usado:* 1 de cimento, 2 de areia, 3 de brita`, `*Área coberta:* ${fmt(comp * larg, 2)} m² com ${fmt(espCm, 1)} cm`] },
                { emoji: '💡', titulo: 'Concreto usinado', linhas: [`Acima de 2 m³ costuma valer mais a pena comprar usinado: menos desperdício e resistência garantida. O seu volume é ${fmt(volume, 2)} m³.`] }
            ]
        }
    }
})

C('tijolos_parede', {
    emoji: '🧱', titulo: 'Tijolos para levantar uma parede',
    descricao: 'Calcula tijolos e argamassa de uma parede',
    uso: '<largura m> <altura m> [comum ou bloco]',
    exemplos: [{ args: '5 2,8', oque: 'parede com tijolo comum' }, { args: '4 2,8 bloco', oque: 'com bloco de concreto' }],
    dica: 'Tijolo baiano de 9x19x19 rende cerca de 25 por m². Bloco de concreto de 14x19x39 rende 12,5 por m².',
    calcular(args) {
        const larg = exigirNumero(args[0], 'largura da parede em metros', { permiteNegativo: false, permiteZero: false })
        const alt = exigirNumero(args[1], 'altura da parede em metros', { permiteNegativo: false, permiteZero: false })
        const tipo = chave(args[2] || 'comum').startsWith('b') ? 'bloco' : 'comum'
        const porM2 = tipo === 'bloco' ? 12.5 : 25
        const area = larg * alt
        const pecas = Math.ceil(area * porM2 * 1.05)
        return {
            intro: `Parede de ${fmt(area, 2)} m² pede ${'*' + fmt(pecas, 0) + ' peças*'} de tijolo ${tipo}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Área da parede:* ${fmt(area, 2)} m²`, `*Peças por m²:* ${fmt(porM2, 1)}`, `*Total com 5% de quebra:* ${fmt(pecas, 0)}`, `*Tipo escolhido:* ${tipo}`] },
                { emoji: '🪣', titulo: 'Argamassa de assentamento', linhas: [`*Volume:* ${fmt(area * 0.02, 3)} m³`, `*Cimento:* ${Math.ceil(area * 0.02 * 7)} saco(s)`, `*Areia:* ${fmt(area * 0.02 * 1.1, 2)} m³`] },
                { emoji: '🎨', titulo: 'Se for rebocar', linhas: [`Reboco dos dois lados com 2 cm: mais ${fmt(area * 2 * 0.02, 2)} m³ de argamassa.`] }
            ]
        }
    }
})

C('argamassa_piso', {
    emoji: '🪣', titulo: 'Argamassa colante para assentar',
    descricao: 'Calcula sacos de argamassa colante por área',
    uso: '<área m²> [desempenadeira em mm]',
    exemplos: [{ args: '30', oque: 'trinta metros com dente de 8 mm' }, { args: '25 10', oque: 'peça grande, dente de 10 mm' }],
    dica: 'Dente maior consome mais: 6 mm gasta cerca de 3,5 kg por m², 8 mm gasta 4,5 e 10 mm gasta 6.',
    calcular(args) {
        const area = exigirNumero(args[0], 'área em m²', { permiteNegativo: false, permiteZero: false })
        const dente = args[1] ? exigirNumero(args[1], 'tamanho do dente em mm', { minimo: 4, maximo: 15 }) : 8
        const consumo = dente <= 6 ? 3.5 : dente <= 8 ? 4.5 : 6
        const kg = area * consumo
        return {
            intro: `Para ${fmt(area, 1)} m² você gasta ${'*' + fmt(kg, 0) + ' kg de argamassa*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Consumo por m²:* ${fmt(consumo, 1)} kg`, `*Total:* ${fmt(kg, 1)} kg`, `*Sacos de 20 kg:* ${Math.ceil(kg / 20)}`, `*Desempenadeira:* dente de ${fmt(dente, 0)} mm`] },
                { emoji: '📊', titulo: 'Se mudar o dente', linhas: [`• 6 mm: ${fmt(area * 3.5, 0)} kg`, `• 8 mm: ${fmt(area * 4.5, 0)} kg`, `• 10 mm: ${fmt(area * 6, 0)} kg`] },
                { emoji: '⏱️', titulo: 'Tempo de trabalho', linhas: ['Argamassa colante já misturada dura cerca de 2 horas e meia. Prepare só o que der para assentar nesse tempo.'] }
            ]
        }
    }
})

C('cerca_terreno', {
    emoji: '🚧', titulo: 'Cerca para um terreno',
    descricao: 'Calcula postes e arame para cercar um terreno',
    uso: '<comprimento m> <largura m> [metros entre postes]',
    exemplos: [{ args: '50 20', oque: 'terreno de mil metros quadrados' }, { args: '100 40 3', oque: 'postes a cada três metros' }],
    dica: 'Espaçamento comum é 2,5 m em cerca de tela e 3 m em cerca de arame liso.',
    calcular(args) {
        const comp = exigirNumero(args[0], 'comprimento em metros', { permiteNegativo: false, permiteZero: false })
        const larg = exigirNumero(args[1], 'largura em metros', { permiteNegativo: false, permiteZero: false })
        const vao = args[2] ? exigirNumero(args[2], 'espaçamento entre postes', { permiteNegativo: false, permiteZero: false, maximo: 20 }) : 2.5
        const perimetro = 2 * (comp + larg)
        const postes = Math.ceil(perimetro / vao)
        return {
            intro: `Cercar ${fmt(perimetro, 1)} m de perímetro pede ${'*' + postes + ' postes*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Perímetro:* ${fmt(perimetro, 2)} m`, `*Área do terreno:* ${fmt(comp * larg, 1)} m²`, `*Postes (a cada ${fmt(vao, 2)} m):* ${postes}`, `*Postes de canto e esticadores:* 8`] },
                { emoji: '🧵', titulo: 'Arame e tela', linhas: [`*Arame liso, 5 fios:* ${fmt(perimetro * 5, 0)} m`, `*Tela de 1,50 m de altura:* ${fmt(perimetro, 0)} m`, `*Grampos:* cerca de ${fmt(postes * 5, 0)} unidades`] },
                { emoji: '🕳️', titulo: 'Fundação dos postes', linhas: [`Cada poste enterrado a 50 cm pede um buraco de 30 cm de diâmetro. Para ${postes} postes, isso dá cerca de ${fmt(postes * 0.035, 2)} m³ de concreto.`] }
            ]
        }
    }
})

C('telhas_telhado', {
    emoji: '🏠', titulo: 'Telhas para um telhado',
    descricao: 'Calcula telhas pela área do telhado',
    uso: '<área da laje m²> [inclinação %] [ceramica ou fibrocimento]',
    exemplos: [{ args: '80', oque: 'casa de oitenta metros com telha cerâmica' }, { args: '120 30 fibrocimento', oque: 'telhado mais inclinado' }],
    dica: 'A área do telhado é maior que a da casa: a inclinação estica o plano. Uma inclinação de 30% aumenta cerca de 4%.',
    calcular(args) {
        const areaPlana = exigirNumero(args[0], 'área coberta em m²', { permiteNegativo: false, permiteZero: false })
        const incl = args[1] ? exigirNumero(args[1], 'inclinação em porcento', { permiteNegativo: false, maximo: 200 }) : 30
        const tipo = chave(args[2] || 'ceramica').startsWith('f') ? 'fibrocimento' : 'cerâmica'
        const fator = Math.sqrt(1 + Math.pow(incl / 100, 2))
        const areaReal = areaPlana * fator
        const porM2 = tipo === 'fibrocimento' ? 0.55 : 16
        const telhas = Math.ceil(areaReal * porM2 * 1.05)
        return {
            intro: `Com ${fmt(incl, 0)}% de inclinação, o telhado tem ${fmt(areaReal, 1)} m² e pede ${'*' + fmt(telhas, 0) + ' telhas*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Área coberta:* ${fmt(areaPlana, 1)} m²`, `*Área real do telhado:* ${fmt(areaReal, 2)} m²`, `*Telhas de ${tipo}:* ${fmt(telhas, 0)}`, `*Peças por m²:* ${fmt(porM2, 2)}`] },
                { emoji: '🪵', titulo: 'Estrutura', linhas: [`*Caibros e ripas:* cerca de ${fmt(areaReal * 2.2, 0)} metros lineares`, `*Peso do telhado (${tipo}):* ${fmt(areaReal * (tipo === 'fibrocimento' ? 18 : 45), 0)} kg`, `*Cumeeiras:* meça a linha do topo e divida por 0,33 m`] },
                { emoji: '⚠️', titulo: 'Inclinação mínima', linhas: ['Telha cerâmica comum pede pelo menos 30% de inclinação. Abaixo disso a chuva de vento entra por baixo.'] }
            ]
        }
    }
})

C('caixa_dagua', {
    emoji: '🚰', titulo: 'Tamanho da caixa de água',
    descricao: 'Diz o tamanho da caixa de água pela família',
    uso: '<moradores> [dias de reserva]',
    exemplos: [{ args: '4', oque: 'família de quatro pessoas' }, { args: '6 2', oque: 'seis pessoas e dois dias de reserva' }],
    dica: 'A referência de projeto é 150 litros por pessoa por dia, somando banho, cozinha, descarga e limpeza.',
    calcular(args) {
        const pessoas = Math.round(exigirNumero(args[0], 'número de moradores', { minimo: 1, maximo: 200 }))
        const dias = args[1] ? exigirNumero(args[1], 'dias de reserva', { minimo: 0.5, maximo: 10 }) : 1
        const litros = pessoas * 150 * dias
        const COMERCIAIS = [250, 310, 500, 750, 1000, 1500, 2000, 3000, 5000]
        const escolhida = COMERCIAIS.find(c => c >= litros) || COMERCIAIS[COMERCIAIS.length - 1]
        return {
            intro: `Para ${pessoas} pessoa(s) e ${fmt(dias, 1)} dia(s) de reserva, a caixa ideal é de ${'*' + fmt(escolhida, 0) + ' litros*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Consumo estimado por dia:* ${fmt(pessoas * 150, 0)} litros`, `*Reserva necessária:* ${fmt(litros, 0)} litros`, `*Caixa comercial indicada:* ${fmt(escolhida, 0)} litros`, `*Autonomia dessa caixa:* ${fmt(escolhida / (pessoas * 150), 1)} dia(s)`] },
                { emoji: '📊', titulo: 'Onde a água vai', linhas: ['• Descarga: cerca de 30%', '• Banho: cerca de 25%', '• Cozinha e limpeza: cerca de 25%', '• Torneira, tanque e perdas: o resto'] },
                { emoji: '🏗️', titulo: 'Peso na laje', linhas: [`Cheia, essa caixa pesa cerca de ${fmt(escolhida + escolhida * 0.05, 0)} kg. Laje e apoio precisam aguentar isso com folga.`] }
            ]
        }
    }
})

C('laje_volume', {
    emoji: '🏢', titulo: 'Concreto usinado para uma laje',
    descricao: 'Calcula o concreto usinado de uma laje',
    uso: '<comprimento m> <largura m> <espessura cm> [preço do m³]',
    exemplos: [{ args: '8 6 12', oque: 'laje de doze centímetros' }, { args: '10 7 10 450', oque: 'com preço do metro cúbico' }],
    dica: 'A concreteira entrega em múltiplos de meio metro cúbico e cobra taxa quando o caminhão sai com pouca carga.',
    calcular(args) {
        const comp = exigirNumero(args[0], 'comprimento em metros', { permiteNegativo: false, permiteZero: false })
        const larg = exigirNumero(args[1], 'largura em metros', { permiteNegativo: false, permiteZero: false })
        const espCm = exigirNumero(args[2], 'espessura em centímetros', { permiteNegativo: false, permiteZero: false, maximo: 100 })
        const preco = args[3] ? exigirNumero(args[3], 'preço do metro cúbico', { permiteNegativo: false }) : 0
        const volume = comp * larg * espCm / 100
        const pedido = Math.ceil(volume * 1.05 * 2) / 2
        return {
            intro: `Essa laje leva ${'*' + fmt(volume, 2) + ' m³ de concreto*'} — peça ${fmt(pedido, 1)} m³.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Área da laje:* ${fmt(comp * larg, 2)} m²`, `*Volume exato:* ${fmt(volume, 3)} m³`, `*Pedido com 5% de folga:* ${fmt(pedido, 1)} m³`, preco ? `*Custo estimado:* ${moeda(pedido * preco)}` : '*Custo:* informe o preço do m³ para eu calcular'] },
                { emoji: '🚚', titulo: 'Entrega', linhas: [`*Caminhões de 8 m³:* ${Math.ceil(pedido / 8)}`, `*Peso do concreto:* ${fmt(volume * 2400, 0)} kg`, `*Tempo de lançamento:* conte cerca de ${fmt(pedido * 12, 0)} minutos de bomba`] },
                { emoji: '💡', titulo: 'Cura', linhas: ['Molhe a laje por sete dias. Concreto que seca rápido demais fissura e perde resistência.'] }
            ]
        }
    }
})

C('grama_jardim', {
    emoji: '🌱', titulo: 'Grama em placa para o jardim',
    descricao: 'Calcula placas de grama para um jardim',
    uso: '<largura m> <comprimento m>',
    exemplos: [{ args: '5 8', oque: 'jardim de cinco por oito' }, { args: '12 20', oque: 'área grande' }],
    dica: 'Placa de grama comum mede 40 por 60 cm, ou seja 0,24 m². Rolo de grama cobre cerca de 0,75 m².',
    calcular(args) {
        const larg = exigirNumero(args[0], 'largura em metros', { permiteNegativo: false, permiteZero: false })
        const comp = exigirNumero(args[1], 'comprimento em metros', { permiteNegativo: false, permiteZero: false })
        const area = larg * comp
        const placas = Math.ceil(area * 1.05 / 0.24)
        return {
            intro: `Para ${fmt(area, 1)} m² de jardim você precisa de ${'*' + fmt(placas, 0) + ' placas de grama*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Área a gramar:* ${fmt(area, 2)} m²`, `*Placas de 0,24 m²:* ${fmt(placas, 0)}`, `*Em rolos de 0,75 m²:* ${Math.ceil(area * 1.05 / 0.75)}`, `*Área comprada:* ${fmt(placas * 0.24, 2)} m²`] },
                { emoji: '🪴', titulo: 'Preparo do terreno', linhas: [`*Terra vegetal (5 cm):* ${fmt(area * 0.05, 2)} m³`, `*Areia para nivelar:* ${fmt(area * 0.02, 2)} m³`, `*Adubo de plantio:* ${fmt(area * 0.1, 1)} kg`] },
                { emoji: '💧', titulo: 'Depois de plantar', linhas: ['Regue todo dia nas duas primeiras semanas e só pise depois que a raiz pegar, o que leva cerca de 20 dias.'] }
            ]
        }
    }
})

C('papel_parede', {
    emoji: '🖼️', titulo: 'Rolos de papel de parede',
    descricao: 'Calcula rolos de papel de parede necessários',
    uso: '<largura da parede m> <altura m> [largura do rolo em cm]',
    exemplos: [{ args: '4 2,7', oque: 'uma parede de quatro metros' }, { args: '6 2,8 60', oque: 'rolo mais largo' }],
    dica: 'O rolo importado comum tem 0,53 m de largura por 10 m de comprimento.',
    calcular(args) {
        const larg = exigirNumero(args[0], 'largura da parede em metros', { permiteNegativo: false, permiteZero: false })
        const alt = exigirNumero(args[1], 'altura da parede em metros', { permiteNegativo: false, permiteZero: false })
        const rolLarg = (args[2] ? exigirNumero(args[2], 'largura do rolo em cm', { permiteNegativo: false, permiteZero: false }) : 53) / 100
        const faixasPorRolo = Math.floor(10 / (alt + 0.1))
        if (faixasPorRolo < 1) throw falha(`Uma parede de ${fmt(alt, 2)} m de altura não cabe em rolo de 10 m. Confira a medida.`)
        const faixas = Math.ceil(larg / rolLarg)
        const rolos = Math.ceil(faixas / faixasPorRolo)
        return {
            intro: `Essa parede pede ${'*' + rolos + ' rolo(s)*'} de papel.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Área da parede:* ${fmt(larg * alt, 2)} m²`, `*Faixas verticais:* ${faixas}`, `*Faixas que saem de um rolo:* ${faixasPorRolo}`, `*Rolos a comprar:* ${rolos}`] },
                { emoji: '🧴', titulo: 'Cola', linhas: [`*Cola em pó:* cerca de ${fmt(rolos * 0.1, 2)} kg`, `*Rendimento:* um pacote de 500 g dá para uns 5 rolos`] },
                { emoji: '💡', titulo: 'Papel com estampa', linhas: ['Estampa que precisa casar desperdiça mais: some meio rolo a cada três, porque cada faixa começa em um ponto do desenho.'] }
            ]
        }
    }
})

C('piscina_agua', {
    emoji: '🏊', titulo: 'Água e cloro da piscina',
    descricao: 'Calcula o volume da piscina e o cloro do dia',
    uso: '<comprimento m> <largura m> <profundidade média m>',
    exemplos: [{ args: '8 4 1,4', oque: 'piscina retangular' }, { args: '6 3 1,2', oque: 'piscina menor' }],
    dica: 'Profundidade média é a soma da parte rasa com a funda dividida por dois.',
    calcular(args) {
        const comp = exigirNumero(args[0], 'comprimento em metros', { permiteNegativo: false, permiteZero: false })
        const larg = exigirNumero(args[1], 'largura em metros', { permiteNegativo: false, permiteZero: false })
        const prof = exigirNumero(args[2], 'profundidade média em metros', { permiteNegativo: false, permiteZero: false, maximo: 10 })
        const m3 = comp * larg * prof
        const litros = m3 * 1000
        return {
            intro: `Sua piscina tem ${'*' + fmt(litros, 0) + ' litros*'} de água.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Volume:* ${fmt(m3, 2)} m³`, `*Em litros:* ${fmt(litros, 0)}`, `*Área da lâmina de água:* ${fmt(comp * larg, 2)} m²`, `*Tempo para encher com mangueira comum:* cerca de ${fmt(litros / 900 / 60, 1)} horas`] },
                { emoji: '🧪', titulo: 'Tratamento por semana', linhas: [`*Cloro de manutenção:* ${fmt(litros / 1000 * 3, 0)} g por semana`, `*Choque (após festa ou chuva):* ${fmt(litros / 1000 * 8, 0)} g`, `*Clarificante:* ${fmt(litros / 1000 * 1.5, 0)} ml`] },
                { emoji: '🔁', titulo: 'Filtragem', linhas: [`A bomba precisa passar toda a água pelo filtro. Com motor de 1.500 litros por hora, são ${fmt(litros / 1500, 1)} horas por ciclo.`] }
            ]
        }
    }
})

C('escada_degraus', {
    emoji: '🪜', titulo: 'Degraus de uma escada',
    descricao: 'Calcula altura e quantidade de degraus',
    uso: '<altura total em cm> [profundidade do degrau em cm]',
    exemplos: [{ args: '280', oque: 'pé-direito de dois metros e oitenta' }, { args: '300 28', oque: 'degrau de 28 cm de pisada' }],
    dica: 'Regra de Blondel: duas vezes a altura do degrau mais a pisada deve ficar entre 63 e 65 cm.',
    calcular(args) {
        const altura = exigirNumero(args[0], 'altura total em cm', { permiteNegativo: false, permiteZero: false, minimo: 20 })
        const pisadaPedida = args[1] ? exigirNumero(args[1], 'profundidade do degrau', { minimo: 20, maximo: 40 }) : null
        const n = Math.max(1, Math.round(altura / 17.5))
        const espelho = altura / n
        const pisada = pisadaPedida === null ? 64 - 2 * espelho : pisadaPedida
        const blondel = 2 * espelho + pisada
        return {
            intro: `Para subir ${fmt(altura, 0)} cm, faça ${'*' + n + ' degraus de ' + fmt(espelho, 1) + ' cm*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Número de degraus:* ${n}`, `*Altura de cada degrau:* ${fmt(espelho, 2)} cm`, `*Profundidade (pisada):* ${fmt(pisada, 1)} cm`, `*Comprimento total ocupado:* ${fmt(pisada * (n - 1) / 100, 2)} m`] },
                { emoji: '📐', titulo: 'Conferência de Blondel', linhas: [`*Duas alturas mais a pisada:* ${fmt(blondel, 1)} cm`, blondel >= 62 && blondel <= 66 ? 'Está dentro da faixa confortável de 63 a 65 cm.' : 'Está fora da faixa de 63 a 65 cm: a escada vai parecer cansativa ou curta demais.', `*Inclinação:* ${fmt(Math.atan(espelho / pisada) * 180 / Math.PI, 1)} graus`] },
                { emoji: '💡', titulo: 'Conforto', linhas: ['Degrau entre 16 e 18 cm de altura é o que o corpo sobe sem pensar. Todos precisam ter a mesma altura, senão dá tropeço.'] }
            ]
        }
    }
})

C('ar_condicionado_btu', {
    emoji: '❄️', titulo: 'BTUs do ar-condicionado',
    descricao: 'Calcula os BTUs do ar para um ambiente',
    uso: '<área m²> [pessoas] [sol: sim ou nao]',
    exemplos: [{ args: '16', oque: 'quarto de dezesseis metros' }, { args: '30 4 sim', oque: 'sala com sol da tarde' }],
    dica: 'A base é 600 BTU por m² em ambiente sem sol, mais 600 por pessoa e por aparelho que esquenta.',
    calcular(args) {
        const area = exigirNumero(args[0], 'área em m²', { permiteNegativo: false, permiteZero: false, maximo: 500 })
        const pessoas = args[1] ? Math.round(exigirNumero(args[1], 'número de pessoas', { minimo: 1, maximo: 100 })) : 1
        const sol = chave(args[2] || 'nao').startsWith('s')
        const base = area * (sol ? 800 : 600)
        const extra = Math.max(0, pessoas - 1) * 600
        const total = base + extra
        const COMERCIAIS = [7000, 9000, 12000, 18000, 22000, 24000, 30000, 36000, 48000, 60000]
        const escolhido = COMERCIAIS.find(c => c >= total) || COMERCIAIS[COMERCIAIS.length - 1]
        return {
            intro: `Esse ambiente pede cerca de ${'*' + fmt(total, 0) + ' BTUs*'} — compre o de ${fmt(escolhido, 0)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Cálculo:* ${fmt(total, 0)} BTUs`, `*Aparelho comercial indicado:* ${fmt(escolhido, 0)} BTUs`, `*Base pela área:* ${fmt(base, 0)} (${sol ? 'com' : 'sem'} sol forte)`, `*Acréscimo por pessoas:* ${fmt(extra, 0)}`] },
                { emoji: '💡', titulo: 'Consumo estimado', linhas: [`*Potência aproximada:* ${fmt(escolhido / 3412 * 1000 / 3, 0)} W em modo inverter`, `*Gasto em 8 horas por dia:* cerca de ${fmt(escolhido / 3412 / 3 * 8 * 30, 0)} kWh por mês`] },
                { emoji: '⚠️', titulo: 'Nem maior nem menor', linhas: ['Aparelho pequeno demais fica ligado direto e não gela. Grande demais liga e desliga toda hora, gasta mais e deixa o ar úmido.'] }
            ]
        }
    }
})

C('consumo_kwh', {
    emoji: '🔌', titulo: 'Consumo de um aparelho',
    descricao: 'Calcula o consumo em kWh de um aparelho',
    uso: '<potência em watts> <horas por dia> [preço do kWh]',
    exemplos: [{ args: '1500 2', oque: 'chuveiro de 1500 W, duas horas' }, { args: '90 8 0,95', oque: 'geladeira com preço do kWh' }],
    dica: 'A potência vem na etiqueta do aparelho, em watts. O preço do kWh vem na conta de luz.',
    calcular(args) {
        const watts = exigirNumero(args[0], 'potência em watts', { permiteNegativo: false, permiteZero: false })
        const horas = exigirNumero(args[1], 'horas por dia', { permiteNegativo: false, permiteZero: false, maximo: 24 })
        const preco = args[2] ? exigirNumero(args[2], 'preço do kWh', { permiteNegativo: false, permiteZero: false }) : 0.85
        const kwhDia = watts * horas / 1000
        const kwhMes = kwhDia * 30
        return {
            intro: `Esse aparelho gasta ${'*' + fmt(kwhMes, 1) + ' kWh por mês*'}, ou ${moeda(kwhMes * preco)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Consumo por dia:* ${fmt(kwhDia, 3)} kWh`, `*Consumo por mês:* ${fmt(kwhMes, 2)} kWh`, `*Custo por mês:* ${moeda(kwhMes * preco)}`, `*Custo por ano:* ${moeda(kwhMes * 12 * preco)}`] },
                { emoji: '📊', titulo: 'Se mudar o uso', linhas: [0.5, 1, 2].map(k => `• ${fmt(horas * k, 1)} h por dia: ${moeda(kwhMes * k * preco)} no mês`) },
                { emoji: '💡', titulo: 'Preço usado', linhas: [`Usei ${moeda(preco)} por kWh. Confira o valor na sua conta, que muda por distribuidora e por bandeira tarifária.`] }
            ]
        }
    }
})

C('conta_luz', {
    emoji: '💡', titulo: 'Estimativa da conta de luz',
    descricao: 'Estima a conta de luz pelo consumo do mês',
    uso: '<consumo em kWh> [preço do kWh] [bandeira: verde, amarela ou vermelha]',
    exemplos: [{ args: '250', oque: 'consumo comum de apartamento' }, { args: '400 0,92 vermelha', oque: 'com bandeira vermelha' }],
    dica: 'A bandeira é cobrada por 100 kWh consumidos e muda todo mês conforme o custo de geração.',
    calcular(args) {
        const kwh = exigirNumero(args[0], 'consumo em kWh', { permiteNegativo: false, permiteZero: false })
        const preco = args[1] ? exigirNumero(args[1], 'preço do kWh', { permiteNegativo: false, permiteZero: false }) : 0.85
        const band = chave(args[2] || 'verde')
        const BANDEIRAS = { verde: 0, amarela: 1.885, vermelha: 4.463, 'vermelha2': 7.877 }
        const adicional = BANDEIRAS[band]
        if (adicional === undefined) throw falha(`Não conheço a bandeira "${band}". Use verde, amarela, vermelha ou vermelha2.`)
        const energia = kwh * preco
        const custoBandeira = (kwh / 100) * adicional
        const iluminacao = 12
        const total = energia + custoBandeira + iluminacao
        return {
            intro: `Com ${fmt(kwh, 0)} kWh e bandeira ${band}, a conta fica perto de ${'*' + moeda(total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Energia consumida:* ${moeda(energia)}`, `*Bandeira ${band}:* ${moeda(custoBandeira)}`, `*Iluminação pública (estimada):* ${moeda(iluminacao)}`, `*Total estimado:* ${moeda(total)}`] },
                { emoji: '📊', titulo: 'Se a bandeira mudasse', linhas: Object.entries(BANDEIRAS).map(([n, v]) => `• ${n}: ${moeda(energia + (kwh / 100) * v + iluminacao)}`) },
                { emoji: '📅', titulo: 'De quando são os números', linhas: [`Adicional de bandeira conforme a tabela em vigor (${VIGENCIA_TABELAS}). A taxa de iluminação varia por cidade.`] }
            ]
        }
    }
})

C('iluminacao_lumens', {
    emoji: '🔦', titulo: 'Lâmpadas para um cômodo',
    descricao: 'Calcula lúmens e lâmpadas de um cômodo',
    uso: '<área m²> [sala, quarto, cozinha, banheiro ou escritorio]',
    exemplos: [{ args: '12 quarto', oque: 'quarto de doze metros' }, { args: '9 cozinha', oque: 'cozinha' }],
    dica: 'Lúmen é a luz que sai; watt é a energia que entra. Lâmpada de LED de 9 W dá cerca de 800 lúmens.',
    calcular(args) {
        const area = exigirNumero(args[0], 'área em m²', { permiteNegativo: false, permiteZero: false, maximo: 500 })
        const amb = chave(args[1] || 'sala')
        const NIVEL = { sala: 150, quarto: 100, cozinha: 300, banheiro: 200, escritorio: 400, garagem: 100, corredor: 100 }
        const lux = NIVEL[amb]
        if (!lux) throw falha(`Não tenho referência para "${amb}". Use: ${Object.keys(NIVEL).join(', ')}.`)
        const lumens = area * lux
        return {
            intro: `Um ${amb} de ${fmt(area, 1)} m² precisa de ${'*' + fmt(lumens, 0) + ' lúmens*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Luz necessária:* ${fmt(lumens, 0)} lúmens`, `*Nível usado:* ${lux} lux para ${amb}`, `*Lâmpadas LED de 800 lúmens:* ${Math.ceil(lumens / 800)}`, `*Potência total em LED:* cerca de ${fmt(lumens / 90, 0)} W`] },
                { emoji: '📊', titulo: 'Referência por ambiente', linhas: Object.entries(NIVEL).map(([n, v]) => `• ${n}: ${v} lux (${fmt(area * v, 0)} lúmens nessa área)`) },
                { emoji: '💡', titulo: 'Divida a luz', linhas: ['Vários pontos fracos iluminam melhor que um ponto forte no meio do teto: some menos sombra e menos ofuscamento.'] }
            ]
        }
    }
})

C('energia_solar', {
    emoji: '☀️', titulo: 'Painéis solares para a casa',
    descricao: 'Calcula painéis solares pelo consumo mensal',
    uso: '<consumo mensal em kWh> [horas de sol por dia]',
    exemplos: [{ args: '300', oque: 'consumo de trezentos por mês' }, { args: '600 5,5', oque: 'região de sol mais forte' }],
    dica: 'A média brasileira fica entre 4,5 e 5,5 horas de sol pleno por dia, conforme a região.',
    calcular(args) {
        const kwhMes = exigirNumero(args[0], 'consumo mensal em kWh', { permiteNegativo: false, permiteZero: false })
        const horasSol = args[1] ? exigirNumero(args[1], 'horas de sol por dia', { minimo: 2, maximo: 9 }) : 4.8
        const kwhDia = kwhMes / 30
        const kwp = kwhDia / (horasSol * 0.78)
        const paineis = Math.ceil(kwp * 1000 / 550)
        return {
            intro: `Para ${fmt(kwhMes, 0)} kWh por mês você precisa de ${'*' + fmt(kwp, 2) + ' kWp*'}, ou ${paineis} painéis.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Potência do sistema:* ${fmt(kwp, 2)} kWp`, `*Painéis de 550 W:* ${paineis}`, `*Área de telhado:* cerca de ${fmt(paineis * 2.6, 1)} m²`, `*Geração estimada:* ${fmt(kwp * horasSol * 0.78 * 30, 0)} kWh por mês`] },
                { emoji: '💰', titulo: 'Conta de bolso', linhas: [`*Economia por mês (a R$ 0,85 o kWh):* ${moeda(kwhMes * 0.85)}`, `*Economia por ano:* ${moeda(kwhMes * 0.85 * 12)}`, `*Custo típico da instalação:* entre ${moeda(kwp * 3500)} e ${moeda(kwp * 5000)}`] },
                { emoji: '⚠️', titulo: 'O que a conta não vê', linhas: ['Sombra de árvore, orientação do telhado e taxa mínima da distribuidora mudam o resultado. Peça projeto antes de comprar.'] }
            ]
        }
    }
})

/* ──────────────── Calculadoras: veículo e viagem (10) ──────────────── */

C('combustivel_viagem', {
    emoji: '🛣️', titulo: 'Combustível de uma viagem',
    descricao: 'Calcula litros e gasto de combustível na viagem',
    uso: '<distância km> <consumo km/l> [preço do litro]',
    exemplos: [{ args: '420 12', oque: 'viagem de 420 km' }, { args: '1000 14 6,29', oque: 'com preço do combustível' }],
    dica: 'Use o consumo real do seu carro, medido em estrada. O número do fabricante costuma ser otimista.',
    calcular(args) {
        const km = exigirNumero(args[0], 'distância em km', { permiteNegativo: false, permiteZero: false })
        const kml = exigirNumero(args[1], 'consumo em km por litro', { permiteNegativo: false, permiteZero: false })
        const preco = args[2] ? exigirNumero(args[2], 'preço do litro', { permiteNegativo: false, permiteZero: false }) : 6
        const litros = km / kml
        return {
            intro: `${fmt(km, 0)} km a ${fmt(kml, 1)} km/l gastam ${'*' + fmt(litros, 1) + ' litros*'}, ou ${moeda(litros * preco)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Combustível:* ${fmt(litros, 2)} litros`, `*Custo da ida:* ${moeda(litros * preco)}`, `*Ida e volta:* ${moeda(litros * preco * 2)}`, `*Custo por km:* ${moeda(preco / kml)}`] },
                { emoji: '⛽', titulo: 'Paradas para abastecer', linhas: [`*Com tanque de 45 litros:* ${Math.max(1, Math.ceil(litros / 40))} abastecimento(s)`, `*Autonomia por tanque:* ${fmt(45 * kml, 0)} km`, `*Primeira parada sugerida:* por volta do km ${fmt(40 * kml, 0)}`] },
                { emoji: '💡', titulo: 'Na estrada', linhas: ['Acima de 110 km/h o consumo dispara. Cair de 120 para 100 costuma economizar mais de 15% do combustível.'] }
            ]
        }
    }
})

C('alcool_ou_gasolina', {
    emoji: '⛽', titulo: 'Álcool ou gasolina',
    descricao: 'Diz qual combustível compensa pelo preço',
    uso: '<preço do álcool> <preço da gasolina>',
    exemplos: [{ args: '3,99 5,89', oque: 'preços de bomba' }, { args: '4,49 6,10', oque: 'outra comparação' }],
    dica: 'A regra dos 70% vem do rendimento: o etanol roda cerca de 30% menos com o mesmo litro.',
    calcular(args) {
        const alcool = exigirNumero(args[0], 'preço do álcool', { permiteNegativo: false, permiteZero: false })
        const gasolina = exigirNumero(args[1], 'preço da gasolina', { permiteNegativo: false, permiteZero: false })
        const razao = alcool / gasolina
        const melhor = razao <= 0.7 ? 'álcool' : 'gasolina'
        const limite = gasolina * 0.7
        return {
            intro: `A ${moeda(alcool)} e ${moeda(gasolina)}, compensa mais abastecer com ${'*' + melhor + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Relação álcool sobre gasolina:* ${fmt(razao * 100, 1)}%`, `*Limite da vantagem:* ${moeda(limite)} no álcool`, `*Melhor escolha:* ${melhor}`, `*Diferença por litro equivalente:* ${moeda(Math.abs(alcool / 0.7 - gasolina))}`] },
                { emoji: '📊', titulo: 'Rodando 1.000 km a 12 km/l', linhas: [`• Com gasolina: ${moeda(1000 / 12 * gasolina)}`, `• Com álcool (a 8,4 km/l): ${moeda(1000 / 8.4 * alcool)}`, `• Economia do melhor: ${moeda(Math.abs(1000 / 12 * gasolina - 1000 / 8.4 * alcool))}`] },
                { emoji: '🧠', titulo: 'Fora do preço', linhas: ['O motor esquenta menos e rende mais potência com etanol. Em carro parado por semanas, gasolina evita problema de partida a frio.'] }
            ]
        }
    }
})

C('consumo_medio_carro', {
    emoji: '📊', titulo: 'Consumo real do carro',
    descricao: 'Mede o consumo real pelo abastecimento',
    uso: '<km rodados> <litros abastecidos> [preço do litro]',
    exemplos: [{ args: '480 38', oque: 'tanque cheio a tanque cheio' }, { args: '312 26 6,19', oque: 'com o preço pago' }],
    dica: 'Meça de tanque cheio a tanque cheio, sempre na mesma bomba, para o nível parar no mesmo ponto.',
    calcular(args) {
        const km = exigirNumero(args[0], 'quilômetros rodados', { permiteNegativo: false, permiteZero: false })
        const litros = exigirNumero(args[1], 'litros abastecidos', { permiteNegativo: false, permiteZero: false })
        const preco = args[2] ? exigirNumero(args[2], 'preço do litro', { permiteNegativo: false, permiteZero: false }) : 0
        const kml = km / litros
        const nota = kml >= 14 ? 'econômico' : kml >= 10 ? 'dentro da média' : kml >= 7 ? 'gastador' : 'muito alto, vale revisar o carro'
        return {
            intro: `Seu carro fez ${'*' + fmt(kml, 2) + ' km por litro*'} — ${nota}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Consumo:* ${fmt(kml, 2)} km/l`, `*Em litros por 100 km:* ${fmt(100 / kml, 2)}`, `*Avaliação:* ${nota}`, preco ? `*Custo por km:* ${moeda(preco / kml)}` : '*Custo por km:* informe o preço do litro'] },
                { emoji: '📅', titulo: 'No mês', linhas: [`*Rodando 1.000 km:* ${fmt(1000 / kml, 1)} litros`, preco ? `*Gasto em 1.000 km:* ${moeda(1000 / kml * preco)}` : '*Gasto:* depende do preço do litro', `*Autonomia com 45 litros:* ${fmt(45 * kml, 0)} km`] },
                { emoji: '🔧', titulo: 'Consumo caindo?', linhas: ['Pneu murcho, filtro de ar sujo e vela gasta derrubam o rendimento. Ar-condicionado no trânsito pesa uns 10%.'] }
            ]
        }
    }
})

C('custo_km', {
    emoji: '🚗', titulo: 'Custo por quilômetro rodado',
    descricao: 'Calcula quanto custa cada km do seu carro',
    uso: '<consumo km/l> <preço do litro> [custo fixo mensal] [km por mês]',
    exemplos: [{ args: '12 6', oque: 'só o combustível' }, { args: '11 6,29 900 1500', oque: 'com seguro, IPVA e manutenção' }],
    dica: 'Quem roda por aplicativo precisa somar depreciação, pneu e revisão: só o combustível engana.',
    calcular(args) {
        const kml = exigirNumero(args[0], 'consumo em km por litro', { permiteNegativo: false, permiteZero: false })
        const preco = exigirNumero(args[1], 'preço do litro', { permiteNegativo: false, permiteZero: false })
        const fixo = args[2] ? exigirNumero(args[2], 'custo fixo mensal', { permiteNegativo: false }) : 0
        const kmMes = args[3] ? exigirNumero(args[3], 'km rodados por mês', { permiteNegativo: false, permiteZero: false }) : 1000
        const combustivel = preco / kml
        const fixoPorKm = fixo / kmMes
        const total = combustivel + fixoPorKm
        return {
            intro: `Cada quilômetro custa ${'*' + moeda(total) + '*'} no seu carro.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Só combustível:* ${moeda(combustivel)} por km`, `*Custos fixos diluídos:* ${moeda(fixoPorKm)} por km`, `*Custo total por km:* ${moeda(total)}`, `*Gasto mensal em ${fmt(kmMes, 0)} km:* ${moeda(total * kmMes)}`] },
                { emoji: '📊', titulo: 'Em viagens comuns', linhas: [10, 100, 500].map(d => `• ${d} km: ${moeda(total * d)}`) },
                { emoji: '🧠', titulo: 'Para comparar', linhas: [`Antes de aceitar corrida ou frete, lembre que ${moeda(total)} por km é o seu piso. Abaixo disso você está pagando para trabalhar.`] }
            ]
        }
    }
})

C('tempo_viagem', {
    emoji: '🕰️', titulo: 'Tempo de uma viagem de carro',
    descricao: 'Calcula o tempo de viagem com as paradas',
    uso: '<distância km> <velocidade média km/h> [minutos de parada]',
    exemplos: [{ args: '430 90', oque: 'viagem de estrada' }, { args: '800 85 90', oque: 'com uma hora e meia de paradas' }],
    dica: 'Velocidade média real de estrada fica entre 80 e 90 km/h, mesmo em pista boa: pedágio e curva descontam.',
    calcular(args) {
        const km = exigirNumero(args[0], 'distância em km', { permiteNegativo: false, permiteZero: false })
        const vel = exigirNumero(args[1], 'velocidade média em km/h', { permiteNegativo: false, permiteZero: false, maximo: 400 })
        const paradas = args[2] ? exigirNumero(args[2], 'minutos de parada', { permiteNegativo: false }) : 0
        const horas = km / vel
        const totalMin = horas * 60 + paradas
        const h = Math.floor(totalMin / 60)
        const m = Math.round(totalMin % 60)
        return {
            intro: `A viagem leva ${'*' + h + ' h ' + String(m).padStart(2, '0') + ' min*'} com as paradas.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Tempo dirigindo:* ${fmt(horas, 2)} h`, `*Paradas:* ${fmt(paradas, 0)} min`, `*Tempo total:* ${h} h ${String(m).padStart(2, '0')} min`, `*Chegada saindo agora:* daqui a ${fmt(totalMin / 60, 1)} horas`] },
                { emoji: '📊', titulo: 'Se a média mudar', linhas: [vel - 10, vel, vel + 10].filter(v => v > 0).map(v => `• A ${fmt(v, 0)} km/h: ${fmt(km / v + paradas / 60, 1)} h`) },
                { emoji: '😴', titulo: 'Descanso', linhas: [`Pare a cada 2 horas. Nessa viagem, são cerca de ${Math.max(1, Math.round(horas / 2))} parada(s) de descanso.`] }
            ]
        }
    }
})

C('viagem_rateio', {
    emoji: '👥', titulo: 'Rateio do custo da viagem',
    descricao: 'Divide o custo da viagem entre os passageiros',
    uso: '<distância km> <consumo km/l> <preço do litro> <pessoas> [pedágio total]',
    exemplos: [{ args: '400 12 6 4', oque: 'quatro pessoas, sem pedágio' }, { args: '600 11 6,29 3 85', oque: 'com pedágio' }],
    dica: 'Combine antes se o rateio é só de ida ou de ida e volta. É a briga mais comum de viagem em grupo.',
    calcular(args) {
        const km = exigirNumero(args[0], 'distância em km', { permiteNegativo: false, permiteZero: false })
        const kml = exigirNumero(args[1], 'consumo em km por litro', { permiteNegativo: false, permiteZero: false })
        const preco = exigirNumero(args[2], 'preço do litro', { permiteNegativo: false, permiteZero: false })
        const pessoas = Math.round(exigirNumero(args[3], 'número de pessoas', { minimo: 1, maximo: 60 }))
        const pedagio = args[4] ? exigirNumero(args[4], 'pedágio total', { permiteNegativo: false }) : 0
        const combustivel = km / kml * preco
        const total = combustivel + pedagio
        return {
            intro: `A viagem custa ${moeda(total)} e cada um paga ${'*' + moeda(total / pessoas) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Combustível:* ${moeda(combustivel)}`, `*Pedágio:* ${moeda(pedagio)}`, `*Custo total:* ${moeda(total)}`, `*Por pessoa:* ${moeda(total / pessoas)}`] },
                { emoji: '🔁', titulo: 'Ida e volta', linhas: [`*Custo dobrado:* ${moeda(total * 2)}`, `*Por pessoa na ida e volta:* ${moeda(total * 2 / pessoas)}`, `*Litros na ida e volta:* ${fmt(km * 2 / kml, 1)}`] },
                { emoji: '💡', titulo: 'Sendo justo com o dono do carro', linhas: [`Quem leva o carro entra com desgaste e manutenção. Somar uns 20% (${moeda(total * 0.2)}) ao rateio costuma equilibrar.`] }
            ]
        }
    }
})

C('autonomia_tanque', {
    emoji: '🛢️', titulo: 'Autonomia do tanque',
    descricao: 'Diz quantos km o tanque cheio ainda roda',
    uso: '<litros no tanque> <consumo km/l> [reserva em litros]',
    exemplos: [{ args: '45 12', oque: 'tanque cheio' }, { args: '18 10,5 5', oque: 'tanque pela metade' }],
    dica: 'Reserve sempre uns 5 litros: rodar no fundo do tanque puxa sujeira e castiga a bomba de combustível.',
    calcular(args) {
        const litros = exigirNumero(args[0], 'litros no tanque', { permiteNegativo: false, permiteZero: false })
        const kml = exigirNumero(args[1], 'consumo em km por litro', { permiteNegativo: false, permiteZero: false })
        const reserva = args[2] ? exigirNumero(args[2], 'litros de reserva', { permiteNegativo: false }) : 5
        const usavel = Math.max(0, litros - reserva)
        return {
            intro: `Com ${fmt(litros, 1)} litros você roda cerca de ${'*' + fmt(usavel * kml, 0) + ' km*'} com segurança.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Autonomia segura:* ${fmt(usavel * kml, 0)} km`, `*Autonomia total (até secar):* ${fmt(litros * kml, 0)} km`, `*Reserva guardada:* ${fmt(reserva, 1)} litros`, `*Consumo usado:* ${fmt(kml, 1)} km/l`] },
                { emoji: '⛽', titulo: 'Planejando a parada', linhas: [`*Abasteça antes do km:* ${fmt(usavel * kml, 0)}`, `*Cada 10 litros rendem:* ${fmt(10 * kml, 0)} km`, `*Para rodar 300 km você precisa de:* ${fmt(300 / kml, 1)} litros`] }
            ]
        }
    }
})

C('pneu_medida', {
    emoji: '🛞', titulo: 'Medida do pneu',
    descricao: 'Explica a medida do pneu e o diâmetro dele',
    uso: '<medida, ex 185/65R15>',
    exemplos: [{ args: '185/65R15', oque: 'pneu de carro popular' }, { args: '205/55R16', oque: 'pneu de sedan' }],
    dica: 'A medida traz largura em milímetros, altura em porcento da largura e o aro em polegadas.',
    calcular(args) {
        const bruto = String(args.join('')).toUpperCase().replace(/\s/g, '')
        const m = bruto.match(/^(\d{3})[/-](\d{2})[RZ]?(\d{2})$/)
        if (!m) throw falha(`Não entendi "${bruto.slice(0, 15) || 'nada'}" como medida de pneu. Escreva assim: 185/65R15.`)
        const largura = Number(m[1])
        const perfil = Number(m[2])
        const aro = Number(m[3])
        const alturaLateral = largura * perfil / 100
        const diametro = aro * 25.4 + 2 * alturaLateral
        const circunferencia = Math.PI * diametro
        return {
            intro: `O pneu ${bruto} tem ${'*' + fmt(diametro, 0) + ' mm de diâmetro*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'O que cada número diz', linhas: [`*Largura da banda:* ${largura} mm`, `*Perfil:* ${perfil}% da largura, ou ${fmt(alturaLateral, 1)} mm de lateral`, `*Aro:* ${aro} polegadas`, `*Diâmetro total:* ${fmt(diametro, 1)} mm (${fmt(diametro / 25.4, 1)} polegadas)`] },
                { emoji: '📏', titulo: 'Na rodagem', linhas: [`*Circunferência:* ${fmt(circunferencia / 1000, 3)} m`, `*Voltas por km:* ${fmt(1000 / (circunferencia / 1000), 0)}`, `*Voltas por minuto a 100 km/h:* ${fmt(100000 / 60 / (circunferencia / 1000), 0)}`] },
                { emoji: '⚠️', titulo: 'Trocar de medida', linhas: ['Mudar o diâmetro em mais de 3% desregula o velocímetro e o controle de estabilidade. Marque a diferença antes de comprar.'] }
            ]
        }
    }
})

C('ipva_estimado', {
    emoji: '🧾', titulo: 'IPVA estimado',
    descricao: 'Estima o IPVA pelo valor e pela alíquota',
    uso: '<valor do veículo> [alíquota %]',
    exemplos: [{ args: '45000', oque: 'carro de quarenta e cinco mil, alíquota de 4%' }, { args: '30000 2', oque: 'estado com alíquota de 2%' }],
    dica: 'A alíquota é definida por estado e por tipo de veículo. Carro costuma pagar entre 2% e 4% da tabela.',
    calcular(args) {
        const valor = exigirNumero(args[0], 'valor do veículo', { permiteNegativo: false, permiteZero: false })
        const aliq = args[1] ? exigirNumero(args[1], 'alíquota em porcento', { permiteNegativo: false, maximo: 20 }) : 4
        const ipva = valor * aliq / 100
        return {
            intro: `Com valor de ${moeda(valor)} e alíquota de ${fmt(aliq, 1)}%, o IPVA fica em ${'*' + moeda(ipva) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*IPVA do ano:* ${moeda(ipva)}`, `*Em 3 parcelas:* ${moeda(ipva / 3)} cada`, `*Com 3% de desconto à vista:* ${moeda(ipva * 0.97)}`, `*Por mês guardando antes:* ${moeda(ipva / 12)}`] },
                { emoji: '📊', titulo: 'Se a alíquota fosse outra', linhas: [2, 2.5, 3, 4].map(a => `• ${fmt(a, 1)}%: ${moeda(valor * a / 100)}`) },
                { emoji: '📅', titulo: 'De quando é a estimativa', linhas: [`Alíquotas usuais conferidas em setembro de 2026. O valor oficial sai da tabela do seu estado com o preço médio de mercado.`] }
            ]
        }
    }
})

C('multa_transito', {
    emoji: '🚦', titulo: 'Valor e pontos de multa',
    descricao: 'Mostra valor e pontos de multa por gravidade',
    uso: '<leve, media, grave ou gravissima> [multiplicador]',
    exemplos: [{ args: 'grave', oque: 'infração grave' }, { args: 'gravissima 3', oque: 'gravíssima com fator três' }],
    dica: 'Algumas gravíssimas vêm multiplicadas por 3, 5, 10 ou 20 — é o caso de dirigir embriagado.',
    calcular(args) {
        const g = chave(args[0] || 'leve').replace(/í/g, 'i')
        const TABELA = {
            leve: { valor: 88.38, pontos: 3 },
            media: { valor: 130.16, pontos: 4 },
            grave: { valor: 195.23, pontos: 5 },
            gravissima: { valor: 293.47, pontos: 7 }
        }
        const item = TABELA[g]
        if (!item) throw falha(`Não conheço a gravidade "${g}". Use leve, media, grave ou gravissima.`)
        const fator = args[1] ? exigirNumero(args[1], 'multiplicador', { minimo: 1, maximo: 60 }) : 1
        const valor = item.valor * fator
        return {
            intro: `Infração ${g} custa ${'*' + moeda(valor) + '*'} e vale ${item.pontos} ponto(s) na carteira.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor da multa:* ${moeda(valor)}`, `*Pontos na carteira:* ${item.pontos}`, `*Multiplicador aplicado:* ${fmt(fator, 0)}`, `*Com 20% de desconto (pagando sem recorrer):* ${moeda(valor * 0.8)}`] },
                { emoji: '📊', titulo: 'A tabela inteira', linhas: Object.entries(TABELA).map(([n, v]) => `• ${n}: ${moeda(v.valor)} e ${v.pontos} pontos`) },
                { emoji: '⚠️', titulo: 'Limite de pontos', linhas: [`Suspende a carteira quem soma 20 pontos em 12 meses com uma gravíssima, 30 pontos sem nenhuma. Essa multa consome ${fmt(item.pontos / 20 * 100, 0)}% do limite mais apertado.`, `Valores do Código de Trânsito conferidos em setembro de 2026.`] }
            ]
        }
    }
})

/* ────────────── Calculadoras: matemática do dia a dia (20) ────────────── */

C('regra_tres', {
    emoji: '➗', titulo: 'Regra de três direta',
    descricao: 'Resolve regra de três direta com três valores',
    uso: '<a> <b> <c>',
    exemplos: [{ args: '3 12 7', oque: 'se 3 valem 12, quanto valem 7' }, { args: '250 35 400', oque: 'proporção de receita' }],
    dica: 'Direta é quando aumentar um lado aumenta o outro: mais pão, mais dinheiro.',
    calcular(args) {
        const a = exigirNumero(args[0], 'primeiro valor', { permiteZero: false })
        const b = exigirNumero(args[1], 'segundo valor')
        const c = exigirNumero(args[2], 'terceiro valor')
        const x = b * c / a
        return {
            intro: `Se ${fmt(a, 2)} está para ${fmt(b, 2)}, então ${fmt(c, 2)} está para ${'*' + fmt(x, 4) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor procurado:* ${fmt(x, 4)}`, `*Conta feita:* ${fmt(b, 2)} vezes ${fmt(c, 2)} dividido por ${fmt(a, 2)}`, `*Proporção:* cada unidade de a vale ${fmt(b / a, 4)} de b`] },
                { emoji: '📐', titulo: 'Como montar', linhas: [`${fmt(a, 2)} — ${fmt(b, 2)}`, `${fmt(c, 2)} — x`, 'Multiplique em cruz e divida pelo que sobrou.'] }
            ]
        }
    }
})

C('regra_tres_inversa', {
    emoji: '🔄', titulo: 'Regra de três inversa',
    descricao: 'Resolve regra de três inversamente proporcional',
    uso: '<a> <b> <c>',
    exemplos: [{ args: '4 6 8', oque: 'se 4 pessoas levam 6 dias, e 8 pessoas' }, { args: '2 120 5', oque: 'mais máquinas, menos tempo' }],
    dica: 'Inversa é quando aumentar um lado diminui o outro: mais gente na obra, menos dias de trabalho.',
    calcular(args) {
        const a = exigirNumero(args[0], 'primeiro valor', { permiteZero: false })
        const b = exigirNumero(args[1], 'segundo valor')
        const c = exigirNumero(args[2], 'terceiro valor', { permiteZero: false })
        const x = a * b / c
        return {
            intro: `Se ${fmt(a, 2)} levam ${fmt(b, 2)}, então ${fmt(c, 2)} levam ${'*' + fmt(x, 4) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor procurado:* ${fmt(x, 4)}`, `*Conta feita:* ${fmt(a, 2)} vezes ${fmt(b, 2)} dividido por ${fmt(c, 2)}`, `*Produto constante:* ${fmt(a * b, 4)}`] },
                { emoji: '🧠', titulo: 'Como saber se é inversa', linhas: ['Pergunte: dobrando o primeiro, o segundo dobra ou cai pela metade? Se cai, é inversa e a conta multiplica em linha, não em cruz.'] }
            ]
        }
    }
})

C('porcentagem_de', {
    emoji: '💯', titulo: 'Quanto é X por cento de um valor',
    descricao: 'Calcula quanto é uma porcentagem de um valor',
    uso: '<porcentagem> <valor>',
    exemplos: [{ args: '15 240', oque: 'quinze por cento de duzentos e quarenta' }, { args: '7,5 1890', oque: 'desconto de sete e meio' }],
    dica: 'Para fazer de cabeça: 10% é dividir por 10, e 5% é a metade disso.',
    calcular(args) {
        const pct = exigirNumero(args[0], 'porcentagem')
        const valor = exigirNumero(args[1], 'valor')
        const r = valor * pct / 100
        return {
            intro: `${fmt(pct, 2)}% de ${fmt(valor, 2)} é ${'*' + fmt(r, 2) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Resultado:* ${fmt(r, 4)}`, `*Valor menos essa parte:* ${fmt(valor - r, 2)}`, `*Valor mais essa parte:* ${fmt(valor + r, 2)}`] },
                { emoji: '📊', titulo: 'Outras fatias do mesmo valor', linhas: [5, 10, 25, 50].map(p => `• ${p}%: ${fmt(valor * p / 100, 2)}`) }
            ]
        }
    }
})

C('porcentagem_quanto', {
    emoji: '🔎', titulo: 'Um valor é quantos por cento do outro',
    descricao: 'Diz quantos por cento um valor é do outro',
    uso: '<parte> <total>',
    exemplos: [{ args: '45 300', oque: 'quarenta e cinco de trezentos' }, { args: '18 24', oque: 'dezoito acertos em vinte e quatro' }],
    dica: 'A parte vem primeiro e o total depois. Trocar a ordem inverte a resposta.',
    calcular(args) {
        const parte = exigirNumero(args[0], 'parte')
        const total = exigirNumero(args[1], 'total', { permiteZero: false })
        const pct = parte / total * 100
        return {
            intro: `${fmt(parte, 2)} é ${'*' + fmt(pct, 2) + '%*'} de ${fmt(total, 2)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Porcentagem:* ${fmt(pct, 3)}%`, `*Fração:* ${fmt(parte, 2)} de ${fmt(total, 2)}`, `*O que falta para o total:* ${fmt(total - parte, 2)} (${fmt(100 - pct, 2)}%)`] },
                { emoji: '🧠', titulo: 'Leitura rápida', linhas: [pct >= 100 ? 'A parte é maior que o total: confira se não trocou a ordem dos números.' : `A cada 10 unidades do total, ${fmt(pct / 10, 2)} são a sua parte.`] }
            ]
        }
    }
})

C('variacao_percentual', {
    emoji: '📐', titulo: 'Variação em porcentagem',
    descricao: 'Calcula a variação percentual entre dois valores',
    uso: '<valor antigo> <valor novo>',
    exemplos: [{ args: '250 310', oque: 'preço que subiu' }, { args: '80 60', oque: 'valor que caiu' }],
    dica: 'A base é sempre o valor antigo. Por isso subir de 50 para 100 é 100%, mas cair de 100 para 50 é 50%.',
    calcular(args) {
        const antigo = exigirNumero(args[0], 'valor antigo', { permiteZero: false })
        const novo = exigirNumero(args[1], 'valor novo')
        const var_ = (novo - antigo) / Math.abs(antigo) * 100
        const sentido = var_ > 0 ? 'aumento' : var_ < 0 ? 'queda' : 'sem mudança'
        return {
            intro: `De ${fmt(antigo, 2)} para ${fmt(novo, 2)} houve ${'*' + fmt(Math.abs(var_), 2) + '% de ' + sentido + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Variação:* ${fmt(var_, 3)}%`, `*Diferença absoluta:* ${fmt(novo - antigo, 2)}`, `*Multiplicador:* ${fmt(novo / antigo, 4)}`, `*Sentido:* ${sentido}`] },
                { emoji: '🔄', titulo: 'Para voltar ao valor antigo', linhas: [`Seria preciso uma variação de ${fmt((antigo - novo) / Math.abs(novo) * 100, 2)}% sobre o valor novo. Subir e descer a mesma porcentagem nunca volta ao ponto de partida.`] }
            ]
        }
    }
})

C('media_simples', {
    emoji: '📊', titulo: 'Média de uma lista de números',
    descricao: 'Calcula média, mediana e moda de números',
    uso: '<n1> <n2> <n3> ...',
    exemplos: [{ args: '7 8,5 6 9', oque: 'quatro notas' }, { args: '120, 95, 143, 88', oque: 'valores separados por vírgula' }],
    dica: 'Média some tudo e divida pela quantidade. Mediana é o valor do meio, que não se abala com número fora da curva.',
    calcular(args) {
        const lista = listaDeNumeros(args, 2, 'números').map((s, i) => exigirNumero(s, `${i + 1}º número`))
        const soma = lista.reduce((a, b) => a + b, 0)
        const media = soma / lista.length
        const ord = [...lista].sort((a, b) => a - b)
        const meio = Math.floor(ord.length / 2)
        const mediana = ord.length % 2 ? ord[meio] : (ord[meio - 1] + ord[meio]) / 2
        const desvio = Math.sqrt(lista.reduce((a, b) => a + Math.pow(b - media, 2), 0) / lista.length)
        return {
            intro: `A média desses ${lista.length} números é ${'*' + fmt(media, 4) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Média:* ${fmt(media, 4)}`, `*Mediana:* ${fmt(mediana, 4)}`, `*Soma:* ${fmt(soma, 4)}`, `*Quantidade:* ${lista.length}`] },
                { emoji: '📈', titulo: 'Como os números se espalham', linhas: [`*Menor:* ${fmt(ord[0], 4)}`, `*Maior:* ${fmt(ord[ord.length - 1], 4)}`, `*Amplitude:* ${fmt(ord[ord.length - 1] - ord[0], 4)}`, `*Desvio padrão:* ${fmt(desvio, 4)}`] }
            ]
        }
    }
})

C('media_ponderada', {
    emoji: '⚖️', titulo: 'Média ponderada por pesos',
    descricao: 'Calcula média com peso diferente em cada nota',
    uso: '<nota1> <peso1> <nota2> <peso2> ...',
    exemplos: [{ args: '7 2 9 3', oque: 'prova peso 2 e trabalho peso 3' }, { args: '6 1 8 1 10 2', oque: 'três avaliações' }],
    dica: 'A prova que vale mais puxa a média para o lado dela. Por isso ela muda tudo.',
    calcular(args) {
        const lista = listaDeNumeros(args, 2, 'valores')
        if (lista.length % 2 !== 0) throw falha(`Cada nota precisa de um peso. Você mandou ${lista.length} valores, que é número ímpar.`)
        let soma = 0
        let pesos = 0
        const linhas = []
        for (let i = 0; i < lista.length; i += 2) {
            const nota = exigirNumero(lista[i], `${i / 2 + 1}ª nota`)
            const peso = exigirNumero(lista[i + 1], `peso da ${i / 2 + 1}ª nota`, { permiteNegativo: false, permiteZero: false })
            soma += nota * peso
            pesos += peso
            linhas.push(`• Nota ${fmt(nota, 2)} com peso ${fmt(peso, 2)} contribui com ${fmt(nota * peso, 2)}`)
        }
        const media = soma / pesos
        return {
            intro: `A média ponderada é ${'*' + fmt(media, 4) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Média ponderada:* ${fmt(media, 4)}`, `*Soma dos produtos:* ${fmt(soma, 4)}`, `*Soma dos pesos:* ${fmt(pesos, 2)}`, `*Média simples seria:* ${fmt(linhas.length ? lista.filter((_, i) => i % 2 === 0).reduce((a, b) => a + num(b), 0) / linhas.length : 0, 4)}`] },
                { emoji: '🧮', titulo: 'Parcela por parcela', linhas: linhas }
            ]
        }
    }
})

C('media_para_passar', {
    emoji: '🎓', titulo: 'Nota que falta para passar',
    descricao: 'Diz a nota necessária na última avaliação',
    uso: '<média atual> <peso já feito> <peso que falta> [média para passar]',
    exemplos: [{ args: '6,5 3 1', oque: 'três bimestres feitos, falta um' }, { args: '5 2 1 7', oque: 'escola que exige média 7' }],
    dica: 'Peso é quanto cada etapa vale. Três bimestres feitos e um por fazer é peso 3 e peso 1.',
    calcular(args) {
        const atual = exigirNumero(args[0], 'média atual', { permiteNegativo: false })
        const pesoFeito = exigirNumero(args[1], 'peso do que já foi feito', { permiteNegativo: false, permiteZero: false })
        const pesoFalta = exigirNumero(args[2], 'peso do que falta', { permiteNegativo: false, permiteZero: false })
        const alvo = args[3] ? exigirNumero(args[3], 'média para passar', { permiteNegativo: false, permiteZero: false }) : 6
        const precisa = (alvo * (pesoFeito + pesoFalta) - atual * pesoFeito) / pesoFalta
        const situacao = precisa <= 0 ? 'você já passou, mesmo tirando zero' : precisa > 10 ? 'não dá para alcançar só com essa avaliação' : 'está ao alcance'
        return {
            intro: precisa <= 0
                ? `Você já garantiu a média ${fmt(alvo, 1)}: ${'*pode tirar zero e passa*'}.`
                : `Você precisa de ${'*' + fmt(precisa, 2) + '*'} na próxima avaliação.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Nota necessária:* ${fmt(Math.max(0, precisa), 2)}`, `*Média atual:* ${fmt(atual, 2)}`, `*Média exigida:* ${fmt(alvo, 2)}`, `*Situação:* ${situacao}`] },
                { emoji: '📊', titulo: 'Se você tirar', linhas: [5, 7, 10].map(n => `• ${n}: média final ${fmt((atual * pesoFeito + n * pesoFalta) / (pesoFeito + pesoFalta), 2)}`) },
                { emoji: '🧠', titulo: 'Leitura', linhas: [precisa > 10 ? 'Como a nota necessária passa de 10, só dá para recuperar com prova extra ou recuperação.' : 'Some as notas que faltam com o peso certo antes de comemorar: bimestre com peso maior muda o resultado.'] }
            ]
        }
    }
})

C('divisao_proporcional', {
    emoji: '🧩', titulo: 'Dividir um valor em partes proporcionais',
    descricao: 'Divide um valor em partes proporcionais dadas',
    uso: '<valor total> <parte1> <parte2> ...',
    exemplos: [{ args: '3000 2 3 5', oque: 'três sócios com cotas diferentes' }, { args: '1200 1 1 2', oque: 'divisão em quatro partes' }],
    dica: 'Serve para sociedade, herança e rateio de conta em que nem todo mundo entra igual.',
    calcular(args) {
        const total = exigirNumero(args[0], 'valor total', { permiteNegativo: false, permiteZero: false })
        const partes = listaDeNumeros(args.slice(1), 2, 'proporções').map((s, i) => exigirNumero(s, `${i + 1}ª proporção`, { permiteNegativo: false, permiteZero: false }))
        const soma = partes.reduce((a, b) => a + b, 0)
        const valores = partes.map(p => total * p / soma)
        return {
            intro: `${moeda(total)} dividido nessas proporções dá ${'*' + valores.map(v => moeda(v)).join(', ') + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Cada parte', linhas: partes.map((p, i) => `• Parte ${i + 1} (proporção ${fmt(p, 2)}): ${moeda(valores[i])} — ${fmt(p / soma * 100, 1)}%`) },
                { emoji: '🧮', titulo: 'Conferência', linhas: [`*Soma das proporções:* ${fmt(soma, 2)}`, `*Valor de cada ponto de proporção:* ${moeda(total / soma)}`, `*Soma das partes:* ${moeda(valores.reduce((a, b) => a + b, 0))}`] }
            ]
        }
    }
})

C('mmc_mdc', {
    emoji: '🔢', titulo: 'Mínimo múltiplo e máximo divisor',
    descricao: 'Calcula o MMC e o MDC de vários números',
    uso: '<n1> <n2> [n3 ...]',
    exemplos: [{ args: '12 18', oque: 'doze e dezoito' }, { args: '4 6 10', oque: 'três números' }],
    dica: 'MMC diz quando dois ciclos coincidem de novo; MDC diz o maior pedaço igual que cabe nos dois.',
    calcular(args) {
        const lista = listaDeNumeros(args, 2, 'números').map((s, i) => {
            const n = Math.round(exigirNumero(s, `${i + 1}º número`, { permiteNegativo: false, permiteZero: false }))
            if (n > 1e9) throw falha('Use números abaixo de um bilhão para a conta não travar.')
            return n
        })
        const mdc2 = (a, b) => b === 0 ? a : mdc2(b, a % b)
        const mdc = lista.reduce((a, b) => mdc2(a, b))
        const mmc = lista.reduce((a, b) => a / mdc2(a, b) * b)
        return {
            intro: `O MMC é ${'*' + fmt(mmc, 0) + '*'} e o MDC é ${'*' + fmt(mdc, 0) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Números:* ${lista.join(', ')}`, `*MMC (mínimo múltiplo comum):* ${fmt(mmc, 0)}`, `*MDC (máximo divisor comum):* ${fmt(mdc, 0)}`, `*Produto dividido pelo MDC:* ${fmt(lista.reduce((a, b) => a * b, 1) / mdc, 0)}`] },
                { emoji: '🧠', titulo: 'Para que serve', linhas: [`Dois ônibus que saem a cada ${lista[0]} e ${lista[1]} minutos voltam a sair juntos a cada ${fmt(mmc, 0)} minutos.`, `Uma fita de ${lista[0]} cm e outra de ${lista[1]} cm podem ser cortadas em pedaços iguais de no máximo ${fmt(mdc, 0)} cm.`] }
            ]
        }
    }
})

C('bhaskara', {
    emoji: '📈', titulo: 'Equação do segundo grau',
    descricao: 'Resolve equação do segundo grau por Bhaskara',
    uso: '<a> <b> <c>',
    exemplos: [{ args: '1 -5 6', oque: 'raízes 2 e 3' }, { args: '2 4 2', oque: 'raiz dupla' }],
    dica: 'Escreva os coeficientes na ordem da equação a x² mais b x mais c igual a zero.',
    calcular(args) {
        const a = exigirNumero(args[0], 'coeficiente a', { permiteZero: false })
        const b = exigirNumero(args[1], 'coeficiente b')
        const c = exigirNumero(args[2], 'coeficiente c')
        const delta = b * b - 4 * a * c
        const vx = -b / (2 * a)
        const vy = -delta / (4 * a)
        if (delta < 0) {
            return {
                intro: `O delta é ${'*' + fmt(delta, 4) + '*'}: essa equação não tem raiz real.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [`*Delta:* ${fmt(delta, 4)}`, '*Raízes reais:* nenhuma', `*Vértice da parábola:* (${fmt(vx, 4)}, ${fmt(vy, 4)})`, `*Concavidade:* ${a > 0 ? 'para cima' : 'para baixo'}`] },
                    { emoji: '🧠', titulo: 'O que isso quer dizer', linhas: ['Delta negativo significa que a parábola não cruza o eixo x: no conjunto dos números reais, não há solução.'] }
                ]
            }
        }
        const r1 = (-b + Math.sqrt(delta)) / (2 * a)
        const r2 = (-b - Math.sqrt(delta)) / (2 * a)
        return {
            intro: delta === 0
                ? `Raiz dupla em ${'*x = ' + fmt(r1, 4) + '*'}.`
                : `As raízes são ${'*x = ' + fmt(r1, 4) + '*'} e ${'*x = ' + fmt(r2, 4) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Delta:* ${fmt(delta, 4)}`, `*Primeira raiz:* ${fmt(r1, 6)}`, `*Segunda raiz:* ${fmt(r2, 6)}`, `*Soma e produto:* ${fmt(r1 + r2, 4)} e ${fmt(r1 * r2, 4)}`] },
                { emoji: '📐', titulo: 'A parábola', linhas: [`*Vértice:* (${fmt(vx, 4)}, ${fmt(vy, 4)})`, `*Concavidade:* ${a > 0 ? 'para cima, o vértice é mínimo' : 'para baixo, o vértice é máximo'}`, `*Corta o eixo y em:* ${fmt(c, 4)}`] }
            ]
        }
    }
})

C('area_circulo', {
    emoji: '⭕', titulo: 'Área e perímetro do círculo',
    descricao: 'Calcula área e volta de um círculo pelo raio',
    uso: '<raio> [diametro]',
    exemplos: [{ args: '3', oque: 'raio de três metros' }, { args: '40 diametro', oque: 'quando você mediu o diâmetro' }],
    dica: 'Se você mediu de ponta a ponta, isso é o diâmetro: escreva a palavra diametro depois do número.',
    calcular(args) {
        let raio = exigirNumero(args[0], 'medida', { permiteNegativo: false, permiteZero: false })
        const ehDiametro = chave(args[1] || '').startsWith('d')
        if (ehDiametro) raio = raio / 2
        const area = Math.PI * raio * raio
        const perimetro = 2 * Math.PI * raio
        return {
            intro: `Círculo de raio ${fmt(raio, 3)} tem área de ${'*' + fmt(area, 3) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Raio:* ${fmt(raio, 4)}`, `*Diâmetro:* ${fmt(raio * 2, 4)}`, `*Área:* ${fmt(area, 4)}`, `*Perímetro (volta):* ${fmt(perimetro, 4)}`] },
                { emoji: '📐', titulo: 'Se fosse um cilindro', linhas: [`*Volume com 1 de altura:* ${fmt(area, 4)}`, `*Volume com 10 de altura:* ${fmt(area * 10, 4)}`, `*Área da superfície lateral com 1 de altura:* ${fmt(perimetro, 4)}`] }
            ]
        }
    }
})

C('volume_caixa', {
    emoji: '📦', titulo: 'Volume de uma caixa',
    descricao: 'Calcula volume e litros de uma caixa',
    uso: '<comprimento> <largura> <altura> (em cm)',
    exemplos: [{ args: '40 30 25', oque: 'caixa de papelão média' }, { args: '100 50 60', oque: 'caixa grande' }],
    dica: 'Use centímetros nas três medidas. Eu converto para litros e metros cúbicos no final.',
    calcular(args) {
        const c = exigirNumero(args[0], 'comprimento em cm', { permiteNegativo: false, permiteZero: false })
        const l = exigirNumero(args[1], 'largura em cm', { permiteNegativo: false, permiteZero: false })
        const a = exigirNumero(args[2], 'altura em cm', { permiteNegativo: false, permiteZero: false })
        const cm3 = c * l * a
        return {
            intro: `Essa caixa tem ${'*' + fmt(cm3 / 1000, 2) + ' litros*'} de volume.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Volume:* ${fmt(cm3, 0)} cm³`, `*Em litros:* ${fmt(cm3 / 1000, 3)}`, `*Em metros cúbicos:* ${fmt(cm3 / 1e6, 5)}`, `*Área da superfície:* ${fmt(2 * (c * l + c * a + l * a), 0)} cm²`] },
                { emoji: '📮', titulo: 'Para envio', linhas: [`*Soma das três medidas:* ${fmt(c + l + a, 0)} cm`, `*Peso cubado (padrão 6.000):* ${fmt(cm3 / 6000, 2)} kg`, 'Transportadora cobra pelo maior entre peso real e peso cubado.'] }
            ]
        }
    }
})

C('pitagoras', {
    emoji: '📐', titulo: 'Teorema de Pitágoras',
    descricao: 'Calcula o lado que falta num triângulo reto',
    uso: '<cateto1> <cateto2> ou <hipotenusa> <cateto> h',
    exemplos: [{ args: '3 4', oque: 'dois catetos, acha a hipotenusa' }, { args: '5 3 h', oque: 'hipotenusa e um cateto' }],
    dica: 'Serve para esquadrejar parede: 3, 4 e 5 metros formam sempre um canto de 90 graus.',
    calcular(args) {
        const a = exigirNumero(args[0], 'primeira medida', { permiteNegativo: false, permiteZero: false })
        const b = exigirNumero(args[1], 'segunda medida', { permiteNegativo: false, permiteZero: false })
        const temHip = chave(args[2] || '').startsWith('h')
        if (temHip) {
            if (a <= b) throw falha('A hipotenusa precisa ser o maior lado. Coloque ela primeiro.')
            const cateto = Math.sqrt(a * a - b * b)
            return {
                intro: `O outro cateto mede ${'*' + fmt(cateto, 4) + '*'}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [`*Hipotenusa:* ${fmt(a, 4)}`, `*Cateto informado:* ${fmt(b, 4)}`, `*Cateto que faltava:* ${fmt(cateto, 6)}`, `*Área do triângulo:* ${fmt(b * cateto / 2, 4)}`] },
                    { emoji: '🧮', titulo: 'A conta', linhas: [`${fmt(a, 2)} ao quadrado menos ${fmt(b, 2)} ao quadrado dá ${fmt(a * a - b * b, 4)}. A raiz disso é o lado que faltava.`] }
                ]
            }
        }
        const hip = Math.hypot(a, b)
        return {
            intro: `A hipotenusa mede ${'*' + fmt(hip, 4) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Cateto 1:* ${fmt(a, 4)}`, `*Cateto 2:* ${fmt(b, 4)}`, `*Hipotenusa:* ${fmt(hip, 6)}`, `*Área do triângulo:* ${fmt(a * b / 2, 4)}`] },
                { emoji: '📐', titulo: 'Os ângulos', linhas: [`*Ângulo oposto ao cateto 1:* ${fmt(Math.atan(a / b) * 180 / Math.PI, 2)} graus`, `*Ângulo oposto ao cateto 2:* ${fmt(Math.atan(b / a) * 180 / Math.PI, 2)} graus`, '*Terceiro ângulo:* 90 graus'] }
            ]
        }
    }
})

C('juros_atraso', {
    emoji: '⏰', titulo: 'Multa e juros de conta atrasada',
    descricao: 'Calcula multa e juros de uma conta em atraso',
    uso: '<valor da conta> <dias de atraso> [multa %] [juros % ao mês]',
    exemplos: [{ args: '480 12', oque: 'multa de 2% e juros de 1% ao mês' }, { args: '1200 45 2 1', oque: 'com percentuais informados' }],
    dica: 'O padrão de contrato de consumo é multa de 2% e juros de 1% ao mês, calculados por dia de atraso.',
    calcular(args) {
        const valor = exigirNumero(args[0], 'valor da conta', { permiteNegativo: false, permiteZero: false })
        const dias = exigirNumero(args[1], 'dias de atraso', { permiteNegativo: false })
        const multaPct = args[2] ? exigirNumero(args[2], 'multa em porcento', { permiteNegativo: false, maximo: 100 }) : 2
        const jurosMes = args[3] ? exigirNumero(args[3], 'juros ao mês em porcento', { permiteNegativo: false, maximo: 100 }) : 1
        const multa = valor * multaPct / 100
        const juros = valor * (jurosMes / 100) * (dias / 30)
        const total = valor + multa + juros
        return {
            intro: `Com ${fmt(dias, 0)} dias de atraso, você paga ${'*' + moeda(total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor original:* ${moeda(valor)}`, `*Multa de ${fmt(multaPct, 1)}%:* ${moeda(multa)}`, `*Juros de ${fmt(dias, 0)} dias:* ${moeda(juros)}`, `*Total a pagar:* ${moeda(total)}`] },
                { emoji: '📊', titulo: 'Se demorar mais', linhas: [30, 60, 90].map(d => `• ${d} dias: ${moeda(valor + multa + valor * (jurosMes / 100) * (d / 30))}`) },
                { emoji: '💡', titulo: 'Acréscimo total', linhas: [`Você está pagando ${fmt((total / valor - 1) * 100, 2)}% a mais que o valor original. Juros por dia: ${moeda(valor * (jurosMes / 100) / 30)}.`] }
            ]
        }
    }
})

C('desconto_sucessivo', {
    emoji: '🏷️', titulo: 'Descontos um sobre o outro',
    descricao: 'Calcula o efeito de descontos em sequência',
    uso: '<preço> <desconto1 %> <desconto2 %> ...',
    exemplos: [{ args: '500 20 10', oque: 'vinte por cento e mais dez' }, { args: '1200 30 15 5', oque: 'três descontos seguidos' }],
    dica: 'Dois descontos de 20% não dão 40%: o segundo incide sobre o preço já abatido.',
    calcular(args) {
        const preco = exigirNumero(args[0], 'preço', { permiteNegativo: false, permiteZero: false })
        const descontos = listaDeNumeros(args.slice(1), 1, 'descontos').map((s, i) => exigirNumero(s, `${i + 1}º desconto`, { permiteNegativo: false, maximo: 100 }))
        let atual = preco
        const passos = []
        for (const d of descontos) {
            const antes = atual
            atual = atual * (1 - d / 100)
            passos.push(`• ${fmt(d, 1)}% sobre ${moeda(antes)}: tira ${moeda(antes - atual)} e fica ${moeda(atual)}`)
        }
        const equivalente = (1 - atual / preco) * 100
        const somaIngenua = descontos.reduce((a, b) => a + b, 0)
        return {
            intro: `O preço final é ${'*' + moeda(atual) + '*'}, um desconto real de ${fmt(equivalente, 2)}%.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Preço inicial:* ${moeda(preco)}`, `*Preço final:* ${moeda(atual)}`, `*Desconto real:* ${fmt(equivalente, 2)}%`, `*Economia:* ${moeda(preco - atual)}`] },
                { emoji: '🧮', titulo: 'Passo a passo', linhas: passos },
                { emoji: '⚠️', titulo: 'A armadilha', linhas: [`Somando os percentuais daria ${fmt(somaIngenua, 1)}%, mas o desconto real é ${fmt(equivalente, 2)}%. A diferença de ${moeda(preco * somaIngenua / 100 - (preco - atual))} é o que a propaganda esconde.`] }
            ]
        }
    }
})

C('fracao_para_decimal', {
    emoji: '🍕', titulo: 'Fração em decimal e porcentagem',
    descricao: 'Converte uma fração em decimal e porcentagem',
    uso: '<numerador> <denominador> ou 3/4',
    exemplos: [{ args: '3/4', oque: 'três quartos' }, { args: '7 8', oque: 'sete oitavos' }],
    dica: 'Fração, decimal e porcentagem são o mesmo número em três roupas diferentes.',
    calcular(args) {
        const bruto = args.join(' ').replace(/\s+/g, ' ').trim()
        let n, d
        const comBarra = bruto.match(/^(-?\d+(?:[.,]\d+)?)\s*[/:]\s*(\d+(?:[.,]\d+)?)$/)
        if (comBarra) { n = num(comBarra[1]); d = num(comBarra[2]) } else {
            n = exigirNumero(args[0], 'numerador')
            d = exigirNumero(args[1], 'denominador', { permiteZero: false })
        }
        if (!Number.isFinite(n) || !Number.isFinite(d)) throw falha('Escreva a fração como 3/4 ou como dois números separados por espaço.')
        if (d === 0) throw falha('O denominador não pode ser zero: divisão por zero não tem resultado.')
        const dec = n / d
        const mdc2 = (a, b) => b === 0 ? a : mdc2(b, a % b)
        const g = Number.isInteger(n) && Number.isInteger(d) ? Math.abs(mdc2(Math.round(n), Math.round(d))) : 1
        return {
            intro: `${fmt(n, 2)}/${fmt(d, 2)} é ${'*' + fmt(dec, 6) + '*'}, ou ${fmt(dec * 100, 2)}%.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Decimal:* ${fmt(dec, 8)}`, `*Porcentagem:* ${fmt(dec * 100, 4)}%`, `*Fração simplificada:* ${g > 1 ? `${Math.round(n / g)}/${Math.round(d / g)}` : `${fmt(n, 2)}/${fmt(d, 2)} já está simplificada`}`, `*Inverso:* ${fmt(d / n, 6)}`] },
                { emoji: '📊', titulo: 'Na prática', linhas: [`De uma pizza de 8 fatias, isso é ${fmt(dec * 8, 2)} fatias.`, `De R$ 100, isso é ${moeda(dec * 100)}.`, `Em uma hora, isso é ${fmt(dec * 60, 1)} minutos.`] }
            ]
        }
    }
})

C('escala_mapa', {
    emoji: '🗺️', titulo: 'Distância real pela escala do mapa',
    descricao: 'Converte medida do mapa em distância real',
    uso: '<medida em cm> <escala, ex 50000>',
    exemplos: [{ args: '7 50000', oque: 'sete centímetros em escala 1:50.000' }, { args: '12,5 25000', oque: 'carta topográfica' }],
    dica: 'Escala 1:50.000 quer dizer que 1 cm no papel vale 50.000 cm no mundo, ou seja meio quilômetro.',
    calcular(args) {
        const cm = exigirNumero(args[0], 'medida no mapa em cm', { permiteNegativo: false, permiteZero: false })
        const escala = exigirNumero(args[1], 'denominador da escala', { permiteNegativo: false, permiteZero: false })
        const realCm = cm * escala
        return {
            intro: `${fmt(cm, 2)} cm em escala 1:${fmt(escala, 0)} valem ${'*' + fmt(realCm / 100000, 3) + ' km*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Distância real:* ${fmt(realCm / 100, 1)} m`, `*Em quilômetros:* ${fmt(realCm / 100000, 4)}`, `*Cada centímetro do mapa vale:* ${fmt(escala / 100000, 4)} km`, `*Um quilômetro real ocupa no mapa:* ${fmt(100000 / escala, 3)} cm`] },
                { emoji: '📐', titulo: 'Área', linhas: [`Na área a escala entra ao quadrado: 1 cm² do mapa representa ${fmt(Math.pow(escala / 100000, 2), 6)} km² no terreno.`] }
            ]
        }
    }
})

C('probabilidade_sorteio', {
    emoji: '🎲', titulo: 'Chance em um sorteio',
    descricao: 'Calcula a chance de ganhar em um sorteio',
    uso: '<seus números de bilhetes> <total de bilhetes> [tentativas]',
    exemplos: [{ args: '5 200', oque: 'cinco bilhetes entre duzentos' }, { args: '1 60 10', oque: 'um bilhete em dez sorteios' }],
    dica: 'Comprar mais bilhete aumenta a chance em linha reta; repetir o sorteio aumenta bem mais devagar.',
    calcular(args) {
        const meus = exigirNumero(args[0], 'seus bilhetes', { permiteNegativo: false, permiteZero: false })
        const total = exigirNumero(args[1], 'total de bilhetes', { permiteNegativo: false, permiteZero: false })
        if (meus > total) throw falha(`Você não pode ter ${fmt(meus, 0)} bilhetes em um sorteio de ${fmt(total, 0)}. Confira a ordem dos números.`)
        const tentativas = args[2] ? Math.round(exigirNumero(args[2], 'número de tentativas', { minimo: 1, maximo: 100000 })) : 1
        const p = meus / total
        const acumulada = 1 - Math.pow(1 - p, tentativas)
        return {
            intro: `Sua chance é de ${'*' + fmt(p * 100, 3) + '%*'}, ou 1 em ${fmt(total / meus, 1)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Chance por sorteio:* ${fmt(p * 100, 4)}%`, `*Uma chance em:* ${fmt(total / meus, 2)}`, `*Em ${tentativas} tentativa(s):* ${fmt(acumulada * 100, 3)}%`, `*Chance de não ganhar nenhuma vez:* ${fmt((1 - acumulada) * 100, 3)}%`] },
                { emoji: '📊', titulo: 'Repetindo o sorteio', linhas: [1, 10, 100].map(t => `• ${t} vez(es): ${fmt((1 - Math.pow(1 - p, t)) * 100, 3)}%`) },
                { emoji: '🧠', titulo: 'Sobre acumular tentativas', linhas: ['Cada sorteio é independente: perder dez vezes não aumenta a chance da décima primeira.'] }
            ]
        }
    }
})

C('combinacoes', {
    emoji: '🧮', titulo: 'Combinações possíveis',
    descricao: 'Calcula quantas combinações saem de um grupo',
    uso: '<total de itens> <quantos escolher>',
    exemplos: [{ args: '60 6', oque: 'jogo de seis dezenas em sessenta' }, { args: '10 3', oque: 'três pessoas entre dez' }],
    dica: 'Combinação não liga para a ordem. Se a ordem importasse, o número seria muito maior.',
    calcular(args) {
        const n = Math.round(exigirNumero(args[0], 'total de itens', { minimo: 1, maximo: 1000 }))
        const k = Math.round(exigirNumero(args[1], 'quantos escolher', { minimo: 0, maximo: 1000 }))
        if (k > n) throw falha(`Não dá para escolher ${k} itens de um grupo de ${n}. O segundo número precisa ser menor ou igual ao primeiro.`)
        let comb = 1
        for (let i = 1; i <= k; i++) comb = comb * (n - k + i) / i
        comb = Math.round(comb)
        let arranjo = 1
        for (let i = 0; i < k; i++) arranjo *= (n - i)
        return {
            intro: `Escolhendo ${k} de ${n}, existem ${'*' + fmt(comb, 0) + ' combinações*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Combinações (ordem não importa):* ${fmt(comb, 0)}`, `*Arranjos (ordem importa):* ${fmt(arranjo, 0)}`, `*Chance de acertar uma delas:* ${fmt(1 / comb * 100, 8)}%`, `*Uma chance em:* ${fmt(comb, 0)}`] },
                { emoji: '📊', titulo: 'Escolhendo mais itens', linhas: [k, k + 1, k + 2].filter(q => q <= n).map(q => {
                    let c = 1
                    for (let i = 1; i <= q; i++) c = c * (n - q + i) / i
                    return `• ${q} de ${n}: ${fmt(Math.round(c), 0)} combinações`
                }) },
                { emoji: '💡', titulo: 'Custo de jogar tudo', linhas: [`Se cada combinação custasse R$ 5, cobrir todas sairia por ${moeda(comb * 5)}.`] }
            ]
        }
    }
})

/* ──────────── Calculadoras: cozinha, festa e consumo (10) ──────────── */

C('churrasco', {
    emoji: '🥩', titulo: 'Churrasco por pessoa',
    descricao: 'Calcula carne, bebida e carvão do churrasco',
    uso: '<adultos> [crianças] [horas de churrasco]',
    exemplos: [{ args: '12', oque: 'doze adultos' }, { args: '20 6 5', oque: 'com crianças e cinco horas' }],
    dica: 'A referência é 400 g de carne por adulto em churrasco de até 4 horas. Criança come metade.',
    calcular(args) {
        const adultos = Math.round(exigirNumero(args[0], 'número de adultos', { minimo: 1, maximo: 500 }))
        const criancas = args[1] ? Math.round(exigirNumero(args[1], 'número de crianças', { permiteNegativo: false, maximo: 500 })) : 0
        const horas = args[2] ? exigirNumero(args[2], 'horas de churrasco', { minimo: 1, maximo: 24 }) : 4
        const fatorTempo = horas > 4 ? 1 + (horas - 4) * 0.1 : 1
        const carne = (adultos * 0.4 + criancas * 0.2) * fatorTempo
        const equivalentes = adultos + criancas / 2
        return {
            intro: `Para ${adultos} adulto(s) e ${criancas} criança(s), compre ${'*' + fmt(carne, 1) + ' kg de carne*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Carne', linhas: [`*Total de carne:* ${fmt(carne, 2)} kg`, `*Carne bovina (60%):* ${fmt(carne * 0.6, 2)} kg`, `*Linguiça (25%):* ${fmt(carne * 0.25, 2)} kg`, `*Frango (15%):* ${fmt(carne * 0.15, 2)} kg`] },
                { emoji: '🥤', titulo: 'Bebida e acompanhamento', linhas: [`*Cerveja:* ${fmt(adultos * 1.5 * (horas / 4), 0)} litros`, `*Refrigerante e água:* ${fmt(equivalentes * 0.8, 0)} litros`, `*Pão de alho:* ${fmt(equivalentes * 1.5, 0)} unidades`, `*Farofa e vinagrete:* ${fmt(equivalentes * 0.1, 1)} kg de cada`] },
                { emoji: '🔥', titulo: 'Carvão e sal', linhas: [`*Carvão:* ${fmt(carne * 1.2, 1)} kg`, `*Sal grosso:* ${fmt(carne * 0.03, 2)} kg`, `*Tempo de brasa:* acenda ${fmt(40, 0)} minutos antes de começar a assar`] }
            ]
        }
    }
})

C('bebidas_festa', {
    emoji: '🥂', titulo: 'Bebidas para uma festa',
    descricao: 'Calcula bebidas por convidado em uma festa',
    uso: '<convidados> <horas> [porcentagem que bebe álcool]',
    exemplos: [{ args: '40 5', oque: 'quarenta pessoas em cinco horas' }, { args: '100 6 60', oque: 'com 60% bebendo álcool' }],
    dica: 'A conta clássica de bar é um drink por pessoa na primeira hora e um a cada hora seguinte.',
    calcular(args) {
        const pessoas = Math.round(exigirNumero(args[0], 'número de convidados', { minimo: 1, maximo: 5000 }))
        const horas = exigirNumero(args[1], 'horas de festa', { minimo: 1, maximo: 24 })
        const pctAlcool = args[2] ? exigirNumero(args[2], 'porcentagem que bebe álcool', { permiteNegativo: false, maximo: 100 }) : 70
        const bebem = pessoas * pctAlcool / 100
        const doses = bebem * horas
        const cerveja = doses * 0.35
        const refri = (pessoas - bebem) * horas * 0.3 + bebem * horas * 0.1
        const agua = pessoas * horas * 0.15
        const gelo = pessoas * 1.5
        return {
            intro: `Para ${pessoas} pessoas em ${fmt(horas, 0)} horas, separe ${'*' + fmt(cerveja, 0) + ' litros de cerveja*'}.`,
            secoes: [
                { emoji: '🍺', titulo: 'Com álcool', linhas: [`*Pessoas que bebem:* ${fmt(bebem, 0)}`, `*Doses no total:* ${fmt(doses, 0)}`, `*Cerveja:* ${fmt(cerveja, 1)} litros (${Math.ceil(cerveja / 0.35)} latas de 350 ml)`, `*Se for destilado:* ${fmt(doses * 0.06, 1)} litros`] },
                { emoji: '🧃', titulo: 'Sem álcool', linhas: [`*Refrigerante e suco:* ${fmt(refri, 1)} litros`, `*Água:* ${fmt(agua, 1)} litros`, `*Copos descartáveis:* ${fmt(pessoas * 3, 0)}`] },
                { emoji: '🧊', titulo: 'Gelo', linhas: [`*Gelo:* ${fmt(gelo, 0)} kg (conte 1,5 kg por pessoa entre resfriar e servir)`, 'Compre o gelo no mesmo dia: saco aberto em caixa térmica derrete em poucas horas.'] }
            ]
        }
    }
})

C('receita_porcoes', {
    emoji: '🍲', titulo: 'Ajustar receita para outro número de pessoas',
    descricao: 'Ajusta a quantidade de uma receita por porções',
    uso: '<quantidade original> <porções originais> <porções desejadas>',
    exemplos: [{ args: '500 4 7', oque: '500 g que serviam 4, agora para 7' }, { args: '2 6 10', oque: 'duas xícaras de seis para dez porções' }],
    dica: 'Tempero e fermento não sobem em linha reta: prove antes de dobrar o sal e o pimentão.',
    calcular(args) {
        const qtd = exigirNumero(args[0], 'quantidade original', { permiteNegativo: false, permiteZero: false })
        const de = exigirNumero(args[1], 'porções originais', { permiteNegativo: false, permiteZero: false })
        const para = exigirNumero(args[2], 'porções desejadas', { permiteNegativo: false, permiteZero: false })
        const fator = para / de
        const nova = qtd * fator
        return {
            intro: `Passando de ${fmt(de, 0)} para ${fmt(para, 0)} porções, use ${'*' + fmt(nova, 2) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Nova quantidade:* ${fmt(nova, 3)}`, `*Fator de ajuste:* ${fmt(fator, 3)} vezes`, `*Diferença:* ${fmt(nova - qtd, 3)}`, `*Porção por pessoa:* ${fmt(qtd / de, 3)}`] },
                { emoji: '🥄', titulo: 'Ajuste dos outros ingredientes', linhas: [`Multiplique cada ingrediente por ${fmt(fator, 3)}.`, `• 1 xícara vira ${fmt(fator, 2)} xícaras`, `• 1 colher de sopa vira ${fmt(fator * 3, 1)} colheres de chá`, `• 1 ovo vira ${fmt(fator, 1)} ovos (arredonde para cima)`] },
                { emoji: '⏱️', titulo: 'Tempo de forno', linhas: ['Dobrar a receita não dobra o tempo de forno. Aumente uns 15% e confira com palito antes de tirar.'] }
            ]
        }
    }
})

C('forma_bolo', {
    emoji: '🎂', titulo: 'Trocar a forma do bolo',
    descricao: 'Adapta a receita para outra forma de bolo',
    uso: '<diâmetro original cm> <diâmetro novo cm> [quadrada]',
    exemplos: [{ args: '20 24', oque: 'de forma de 20 para 24 cm' }, { args: '24 30 quadrada', oque: 'forma quadrada' }],
    dica: 'A área cresce ao quadrado do tamanho: mudar de 20 para 24 cm já exige quase 50% mais massa.',
    calcular(args) {
        const de = exigirNumero(args[0], 'tamanho da forma original em cm', { permiteNegativo: false, permiteZero: false })
        const para = exigirNumero(args[1], 'tamanho da forma nova em cm', { permiteNegativo: false, permiteZero: false })
        const quadrada = chave(args[2] || '').startsWith('q')
        const area = (d) => quadrada ? d * d : Math.PI * d * d / 4
        const fator = area(para) / area(de)
        return {
            intro: `Trocando de ${fmt(de, 0)} para ${fmt(para, 0)} cm, multiplique a receita por ${'*' + fmt(fator, 2) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Fator da receita:* ${fmt(fator, 3)}`, `*Área da forma original:* ${fmt(area(de), 1)} cm²`, `*Área da forma nova:* ${fmt(area(para), 1)} cm²`, `*Formato:* ${quadrada ? 'quadrada' : 'redonda'}`] },
                { emoji: '🥣', titulo: 'Ingredientes comuns', linhas: [`• 3 ovos viram ${fmt(3 * fator, 1)}`, `• 2 xícaras de farinha viram ${fmt(2 * fator, 2)}`, `• 1 xícara de açúcar vira ${fmt(fator, 2)}`] },
                { emoji: '⏱️', titulo: 'Forno', linhas: [fator > 1 ? 'Forma maior espalha a massa: a altura diminui e o bolo assa um pouco mais rápido. Comece a espetar 5 minutos antes do tempo da receita.' : 'Forma menor deixa a massa mais alta e o miolo demora mais. Some uns 10 minutos e cubra com papel se dourar cedo.'] }
            ]
        }
    }
})

C('assado_tempo', {
    emoji: '🍗', titulo: 'Tempo de forno por peso',
    descricao: 'Calcula o tempo de forno pelo peso da carne',
    uso: '<peso em kg> [frango, pernil, peru ou rosbife]',
    exemplos: [{ args: '2 frango', oque: 'frango de dois quilos' }, { args: '4,5 pernil', oque: 'pernil de quatro quilos e meio' }],
    dica: 'Tempo de forno é guia; o que manda é a temperatura no centro da peça, medida com termômetro.',
    calcular(args) {
        const peso = exigirNumero(args[0], 'peso em kg', { permiteNegativo: false, permiteZero: false, maximo: 30 })
        const tipo = chave(args[1] || 'frango')
        const TIPOS = {
            frango: { min: 45, temp: 180, interna: 75 },
            pernil: { min: 60, temp: 160, interna: 75 },
            peru: { min: 50, temp: 170, interna: 74 },
            rosbife: { min: 30, temp: 200, interna: 55 },
            lombo: { min: 45, temp: 180, interna: 70 }
        }
        const t = TIPOS[tipo]
        if (!t) throw falha(`Não tenho tempo de forno para "${tipo}". Use: ${Object.keys(TIPOS).join(', ')}.`)
        const minutos = peso * t.min + 20
        return {
            intro: `${fmt(peso, 2)} kg de ${tipo} levam cerca de ${'*' + Math.floor(minutos / 60) + ' h ' + String(Math.round(minutos % 60)).padStart(2, '0') + ' min*'} de forno.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Tempo total:* ${fmt(minutos, 0)} minutos`, `*Temperatura do forno:* ${t.temp} graus`, `*Temperatura interna certa:* ${t.interna} graus`, `*Ritmo:* ${t.min} minutos por quilo mais 20 de partida`] },
                { emoji: '🧂', titulo: 'Preparo', linhas: [`*Sal:* cerca de ${fmt(peso * 12, 0)} g`, `*Tempo de tempero na geladeira:* ${fmt(Math.min(24, peso * 4), 0)} horas`, `*Descanso depois de assar:* ${fmt(Math.max(10, peso * 5), 0)} minutos antes de cortar`] },
                { emoji: '⚠️', titulo: 'Segurança', linhas: ['Carne de ave e de porco precisa chegar a 74 graus no centro. Abaixo disso, o tempo de forno não substitui o termômetro.'] }
            ]
        }
    }
})

C('pizza_comparar', {
    emoji: '🍕', titulo: 'Qual pizza compensa mais',
    descricao: 'Compara duas pizzas por área e preço',
    uso: '<diâmetro1 cm> <preço1> <diâmetro2 cm> <preço2>',
    exemplos: [{ args: '30 45 40 70', oque: 'média contra grande' }, { args: '25 35 35 60', oque: 'outra comparação' }],
    dica: 'Pizza cresce em área: a de 40 cm tem quase o dobro da massa da de 30 cm, não um terço a mais.',
    calcular(args) {
        const d1 = exigirNumero(args[0], 'diâmetro da primeira pizza', { permiteNegativo: false, permiteZero: false })
        const p1 = exigirNumero(args[1], 'preço da primeira pizza', { permiteNegativo: false, permiteZero: false })
        const d2 = exigirNumero(args[2], 'diâmetro da segunda pizza', { permiteNegativo: false, permiteZero: false })
        const p2 = exigirNumero(args[3], 'preço da segunda pizza', { permiteNegativo: false, permiteZero: false })
        const a1 = Math.PI * d1 * d1 / 4
        const a2 = Math.PI * d2 * d2 / 4
        const c1 = p1 / a1 * 100
        const c2 = p2 / a2 * 100
        const melhor = c1 <= c2 ? 1 : 2
        return {
            intro: `A ${'*pizza ' + melhor + '*'} compensa mais: sai a ${moeda(Math.min(c1, c2))} a cada 100 cm².`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Pizza 1 (${fmt(d1, 0)} cm):* ${fmt(a1, 0)} cm² por ${moeda(p1)} — ${moeda(c1)} por 100 cm²`, `*Pizza 2 (${fmt(d2, 0)} cm):* ${fmt(a2, 0)} cm² por ${moeda(p2)} — ${moeda(c2)} por 100 cm²`, `*Mais vantajosa:* pizza ${melhor}`, `*Economia:* ${fmt(Math.abs(c1 - c2) / Math.max(c1, c2) * 100, 1)}%`] },
                { emoji: '📐', titulo: 'Tamanho real', linhas: [`*A maior tem:* ${fmt(Math.max(a1, a2) / Math.min(a1, a2), 2)} vezes a área da menor`, `*Duas pizzas ${fmt(Math.min(d1, d2), 0)} cm:* ${fmt(Math.min(a1, a2) * 2, 0)} cm² por ${moeda(Math.min(a1, a2) === a1 ? p1 * 2 : p2 * 2)}`] },
                { emoji: '🧠', titulo: 'Regra de bolso', linhas: ['Uma pizza de 45 cm tem mais massa que duas de 30 cm. Antes de pedir duas médias, confira a grande.'] }
            ]
        }
    }
})

C('cafe_coado', {
    emoji: '☕', titulo: 'Café em pó por litro de água',
    descricao: 'Calcula o pó de café para a água do coador',
    uso: '<litros de água> [forte, medio ou fraco]',
    exemplos: [{ args: '1', oque: 'um litro de café médio' }, { args: '0,5 forte', oque: 'meio litro bem forte' }],
    dica: 'A referência da associação brasileira de café é 60 a 80 g de pó por litro de água.',
    calcular(args) {
        const litros = exigirNumero(args[0], 'litros de água', { permiteNegativo: false, permiteZero: false, maximo: 100 })
        const forca = chave(args[1] || 'medio')
        const FORCA = { fraco: 50, medio: 70, forte: 90 }
        const gL = FORCA[forca]
        if (!gL) throw falha(`Não conheço a força "${forca}". Use fraco, medio ou forte.`)
        const gramas = litros * gL
        return {
            intro: `Para ${fmt(litros, 2)} litro(s) de água, use ${'*' + fmt(gramas, 0) + ' g de pó*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Pó de café:* ${fmt(gramas, 1)} g`, `*Em colheres de sopa:* ${fmt(gramas / 7, 1)}`, `*Força escolhida:* ${forca} (${gL} g por litro)`, `*Xícaras de 150 ml que saem:* ${fmt(litros * 1000 / 150, 1)}`] },
                { emoji: '📊', titulo: 'Se mudar a força', linhas: Object.entries(FORCA).map(([n, v]) => `• ${n}: ${fmt(litros * v, 0)} g`) },
                { emoji: '🌡️', titulo: 'Água', linhas: ['Deixe a água ferver e espere um minuto antes de coar. Água fervendo em cima do pó queima o café e amarga.'] }
            ]
        }
    }
})

C('consumo_agua_casa', {
    emoji: '🚿', titulo: 'Conta de água da casa',
    descricao: 'Estima o consumo de água e a conta do mês',
    uso: '<moradores> [preço do m³] [minutos de banho]',
    exemplos: [{ args: '4', oque: 'família de quatro' }, { args: '3 9,50 15', oque: 'com preço e banho de quinze minutos' }],
    dica: 'Chuveiro elétrico gasta cerca de 5 litros por minuto; o de pressurizador passa de 12.',
    calcular(args) {
        const pessoas = Math.round(exigirNumero(args[0], 'número de moradores', { minimo: 1, maximo: 100 }))
        const preco = args[1] ? exigirNumero(args[1], 'preço do metro cúbico', { permiteNegativo: false, permiteZero: false }) : 8.5
        const banho = args[2] ? exigirNumero(args[2], 'minutos de banho', { permiteNegativo: false, maximo: 180 }) : 10
        const litrosBanho = pessoas * banho * 6
        const outros = pessoas * 90
        const litrosDia = litrosBanho + outros
        const m3 = litrosDia * 30 / 1000
        return {
            intro: `Sua casa gasta cerca de ${'*' + fmt(m3, 1) + ' m³ por mês*'}, o que dá ${moeda(m3 * preco)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Consumo por dia:* ${fmt(litrosDia, 0)} litros`, `*Consumo no mês:* ${fmt(m3, 2)} m³`, `*Conta estimada:* ${moeda(m3 * preco)}`, `*Por pessoa por dia:* ${fmt(litrosDia / pessoas, 0)} litros`] },
                { emoji: '🚰', titulo: 'Onde a água vai', linhas: [`*Banho (${fmt(banho, 0)} min por pessoa):* ${fmt(litrosBanho, 0)} litros por dia`, `*Descarga, cozinha e limpeza:* ${fmt(outros, 0)} litros por dia`, `*Vazamento de torneira pingando:* até 50 litros por dia`] },
                { emoji: '💡', titulo: 'Economia', linhas: [`Cortar 3 minutos de banho por pessoa economiza ${fmt(pessoas * 3 * 6 * 30 / 1000, 2)} m³ por mês, ou ${moeda(pessoas * 3 * 6 * 30 / 1000 * preco)}.`] }
            ]
        }
    }
})

C('gas_botijao', {
    emoji: '🔥', titulo: 'Duração do botijão de gás',
    descricao: 'Estima quanto tempo dura um botijão de gás',
    uso: '<moradores> [horas de fogão por dia]',
    exemplos: [{ args: '4', oque: 'família de quatro, uso normal' }, { args: '2 1', oque: 'casal que cozinha uma hora por dia' }],
    dica: 'Um botijão de 13 kg guarda cerca de 13 kg de gás, e uma boca média gasta 0,18 kg por hora.',
    calcular(args) {
        const pessoas = Math.round(exigirNumero(args[0], 'número de moradores', { minimo: 1, maximo: 50 }))
        const horas = args[1] ? exigirNumero(args[1], 'horas de fogão por dia', { permiteNegativo: false, permiteZero: false, maximo: 24 }) : Math.min(3, 0.5 + pessoas * 0.35)
        const consumoDia = horas * 0.18
        const dias = 13 / consumoDia
        return {
            intro: `Com ${fmt(horas, 1)} hora(s) de fogão por dia, o botijão dura cerca de ${'*' + fmt(dias, 0) + ' dias*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Consumo por dia:* ${fmt(consumoDia, 3)} kg`, `*Duração do botijão de 13 kg:* ${fmt(dias, 1)} dias`, `*Em meses:* ${fmt(dias / 30, 2)}`, `*Botijões por ano:* ${fmt(365 / dias, 1)}`] },
                { emoji: '📊', titulo: 'Se o uso mudar', linhas: [0.5, 1, 2, 3].map(h => `• ${fmt(h, 1)} h por dia: ${fmt(13 / (h * 0.18), 0)} dias`) },
                { emoji: '💡', titulo: 'Gastar menos', linhas: ['Panela tampada cozinha no fogo baixo e corta quase um terço do gás. Chama que passa da borda da panela é gás indo para o ar.'] }
            ]
        }
    }
})

C('comida_pessoa', {
    emoji: '🍽️', titulo: 'Comida por pessoa em um evento',
    descricao: 'Calcula a comida do buffet por convidado',
    uso: '<convidados> [almoco ou jantar] [horas]',
    exemplos: [{ args: '50', oque: 'cinquenta convidados no almoço' }, { args: '80 jantar 4', oque: 'jantar de quatro horas' }],
    dica: 'Buffet de almoço gasta mais que o de jantar: as pessoas chegam com mais fome e ficam mais tempo.',
    calcular(args) {
        const pessoas = Math.round(exigirNumero(args[0], 'número de convidados', { minimo: 1, maximo: 5000 }))
        const refeicao = chave(args[1] || 'almoco').startsWith('j') ? 'jantar' : 'almoço'
        const horas = args[2] ? exigirNumero(args[2], 'horas de evento', { minimo: 1, maximo: 24 }) : 4
        const base = refeicao === 'jantar' ? 0.42 : 0.5
        const porPessoa = base * (horas > 4 ? 1 + (horas - 4) * 0.08 : 1)
        const total = pessoas * porPessoa
        return {
            intro: `Para ${pessoas} convidados no ${refeicao}, prepare ${'*' + fmt(total, 1) + ' kg de comida*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Divisão do prato', linhas: [`*Carne (250 g por pessoa):* ${fmt(pessoas * 0.25, 1)} kg`, `*Arroz cru:* ${fmt(pessoas * 0.08, 1)} kg`, `*Feijão cru:* ${fmt(pessoas * 0.05, 1)} kg`, `*Salada e guarnição:* ${fmt(pessoas * 0.12, 1)} kg`] },
                { emoji: '🍰', titulo: 'Doce e salgado de festa', linhas: [`*Salgadinhos:* ${fmt(pessoas * 8, 0)} unidades`, `*Docinhos:* ${fmt(pessoas * 4, 0)} unidades`, `*Bolo:* ${fmt(pessoas * 0.1, 1)} kg`] },
                { emoji: '📋', titulo: 'Ajustes', linhas: [`*Comida por pessoa:* ${fmt(porPessoa, 2)} kg`, `*Duração considerada:* ${fmt(horas, 0)} horas`, 'Se houver muita criança, tire 30% da parte delas. Churrasco no lugar do buffet muda tudo: use a conta de churrasco.'] }
            ]
        }
    }
})

/* ──────────── Calculadoras: dinheiro e rotina pessoal (10) ──────────── */

C('horas_sono', {
    emoji: '😴', titulo: 'Horário de dormir por ciclos de sono',
    descricao: 'Sugere horários de dormir e de acordar',
    uso: '<hora de acordar, ex 06:30>',
    exemplos: [{ args: '06:30', oque: 'acordar seis e meia' }, { args: '05:00', oque: 'acordar cedo' }],
    dica: 'Cada ciclo de sono dura cerca de 90 minutos. Acordar no fim de um ciclo cansa menos que no meio.',
    calcular(args) {
        const bruto = args.join('')
        const m = bruto.match(/^(\d{1,2})[:h.]?(\d{2})?$/)
        if (!m) throw falha(`Não entendi "${bruto.slice(0, 10) || 'nada'}" como horário. Escreva assim: 06:30.`)
        const h = Number(m[1])
        const min = Number(m[2] || 0)
        if (h > 23 || min > 59) throw falha(`Horário impossível: ${h}:${String(min).padStart(2, '0')}. A hora vai de 0 a 23.`)
        const acordar = h * 60 + min
        const formatar = (minutos) => {
            const t = ((minutos % 1440) + 1440) % 1440
            return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
        }
        const opcoes = [6, 5, 4, 3].map(c => ({ ciclos: c, hora: formatar(acordar - c * 90 - 15), horas: c * 1.5 }))
        return {
            intro: `Para acordar às ${formatar(acordar)}, o melhor é dormir às ${'*' + opcoes[0].hora + '*'} ou ${'*' + opcoes[1].hora + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Horários para deitar', linhas: opcoes.map(o => `• ${o.hora} — ${o.ciclos} ciclos, ${fmt(o.horas, 1)} h de sono`) },
                { emoji: '🧠', titulo: 'Como a conta funciona', linhas: ['Somei 15 minutos para pegar no sono e voltei de 90 em 90 minutos a partir da hora de acordar.'] },
                { emoji: '💡', titulo: 'Para dormir melhor', linhas: ['Adulto precisa de 5 a 6 ciclos, ou seja de 7 horas e meia a 9 horas. Tela forte na última hora atrasa o início do sono.'] }
            ]
        }
    }
})

C('leitura_tempo', {
    emoji: '📖', titulo: 'Tempo para ler um livro',
    descricao: 'Calcula o tempo para terminar uma leitura',
    uso: '<páginas> [páginas por dia] [palavras por minuto]',
    exemplos: [{ args: '320', oque: 'livro de 320 páginas' }, { args: '480 20', oque: 'lendo vinte páginas por dia' }],
    dica: 'A leitura média de adulto fica entre 200 e 250 palavras por minuto, e uma página tem cerca de 300 palavras.',
    calcular(args) {
        const paginas = exigirNumero(args[0], 'número de páginas', { permiteNegativo: false, permiteZero: false })
        const porDia = args[1] ? exigirNumero(args[1], 'páginas por dia', { permiteNegativo: false, permiteZero: false }) : 20
        const ppm = args[2] ? exigirNumero(args[2], 'palavras por minuto', { minimo: 50, maximo: 2000 }) : 220
        const minutosTotais = paginas * 300 / ppm
        const dias = Math.ceil(paginas / porDia)
        return {
            intro: `Lendo ${fmt(porDia, 0)} páginas por dia, você termina em ${'*' + dias + ' dias*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Dias para terminar:* ${dias}`, `*Tempo total de leitura:* ${fmt(minutosTotais / 60, 1)} horas`, `*Minutos por dia:* ${fmt(minutosTotais / dias, 0)}`, `*Data de término:* ${fmtData(somaDias(hoje(), dias))}`] },
                { emoji: '📊', titulo: 'Em outros ritmos', linhas: [10, 30, 50].map(p => `• ${p} páginas por dia: ${Math.ceil(paginas / p)} dias`) },
                { emoji: '📚', titulo: 'No ano', linhas: [`Mantendo ${fmt(porDia, 0)} páginas por dia, dá cerca de ${fmt(365 * porDia / paginas, 1)} livros desse tamanho por ano.`] }
            ]
        }
    }
})

C('estudo_cronograma', {
    emoji: '📚', titulo: 'Cronograma de estudo até a prova',
    descricao: 'Divide as matérias no tempo até a prova',
    uso: '<dias até a prova> <horas por dia> <matérias separadas por vírgula>',
    exemplos: [{ args: '30 3 matemática, português, história', oque: 'trinta dias, três horas por dia' }, { args: '14 2 física, química', oque: 'duas semanas' }],
    dica: 'Estudar a mesma matéria em dias separados fixa mais que maratonar tudo de uma vez.',
    calcular(args) {
        const dias = Math.round(exigirNumero(args[0], 'dias até a prova', { minimo: 1, maximo: 3650 }))
        const horasDia = exigirNumero(args[1], 'horas de estudo por dia', { permiteNegativo: false, permiteZero: false, maximo: 16 })
        const materias = itens(args.slice(2), 1, 'matérias')
        const totalHoras = dias * horasDia
        const porMateria = totalHoras / materias.length
        return {
            intro: `Você tem ${'*' + fmt(totalHoras, 0) + ' horas*'} até a prova, ou ${fmt(porMateria, 1)} h por matéria.`,
            secoes: [
                { emoji: '🎯', titulo: 'Divisão do tempo', linhas: materias.map(m => `• ${m}: ${fmt(porMateria, 1)} h no total, ${fmt(porMateria / dias * 60, 0)} min por dia`) },
                { emoji: '📅', titulo: 'Calendário', linhas: [`*Dias disponíveis:* ${dias}`, `*Horas por dia:* ${fmt(horasDia, 1)}`, `*Data da prova:* ${fmtData(somaDias(hoje(), dias))}`, `*Blocos de 50 minutos:* ${fmt(totalHoras * 60 / 50, 0)}`] },
                { emoji: '🧠', titulo: 'Como distribuir', linhas: [`Faça um rodízio: ${materias.slice(0, 3).join(', ')}${materias.length > 3 ? ' e as demais' : ''}, uma por bloco. Guarde os últimos ${Math.max(1, Math.round(dias * 0.2))} dias só para revisão e questões.`] }
            ]
        }
    }
})

C('aposentadoria_pontos', {
    emoji: '👵', titulo: 'Pontos para a aposentadoria',
    descricao: 'Calcula os pontos da regra de idade mais tempo',
    uso: '<idade> <anos de contribuição> [h ou m]',
    exemplos: [{ args: '58 32 m', oque: 'mulher com 32 anos de contribuição' }, { args: '61 35 h', oque: 'homem com 35 anos' }],
    dica: 'A regra de pontos soma idade e tempo de contribuição, e a exigência sobe um ponto por ano até 2033.',
    calcular(args) {
        const idade = exigirNumero(args[0], 'idade em anos', { minimo: 16, maximo: 110 })
        const contrib = exigirNumero(args[1], 'anos de contribuição', { permiteNegativo: false, maximo: 70 })
        const homem = !chave(args[2] || 'h').startsWith('m')
        const anoAtual = hoje().getUTCFullYear()
        const exigidoBase = homem ? 105 : 95
        const exigido = Math.min(homem ? 105 : 100, exigidoBase + Math.max(0, Math.min(anoAtual - 2028, homem ? 0 : 5)))
        const pontos = idade + contrib
        const minimoContrib = homem ? 35 : 30
        const faltam = Math.max(0, exigido - pontos)
        return {
            intro: `Você soma ${'*' + fmt(pontos, 0) + ' pontos*'} e a regra pede ${exigido}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Seus pontos:* ${fmt(pontos, 0)} (${fmt(idade, 0)} de idade mais ${fmt(contrib, 0)} de contribuição)`, `*Pontos exigidos:* ${exigido}`, `*Faltam:* ${fmt(faltam, 0)} ponto(s)`, `*Tempo mínimo de contribuição:* ${minimoContrib} anos (você tem ${fmt(contrib, 0)})`] },
                { emoji: '📅', titulo: 'Quando você chega lá', linhas: [faltam === 0 && contrib >= minimoContrib ? 'Você já cumpre a regra de pontos e o tempo mínimo de contribuição.' : `Trabalhando sem parar, cada ano soma 2 pontos: faltam cerca de ${fmt(Math.ceil(faltam / 2), 0)} ano(s).`, `*Idade estimada na aposentadoria:* ${fmt(idade + Math.ceil(faltam / 2), 0)} anos`] },
                { emoji: '📋', titulo: 'De quando é a regra', linhas: ['Regra de transição por pontos da reforma de 2019, conferida em setembro de 2026. Existem outras regras de transição e a mais vantajosa varia caso a caso: confira no meu INSS.'] }
            ]
        }
    }
})

C('horas_para_comprar', {
    emoji: '⏳', titulo: 'Horas de trabalho para comprar algo',
    descricao: 'Diz quantas horas de trabalho custa um produto',
    uso: '<preço do produto> <salário mensal> [horas por semana]',
    exemplos: [{ args: '4500 3000', oque: 'celular caro com salário de três mil' }, { args: '250 2200 40', oque: 'compra pequena' }],
    dica: 'Pensar o preço em horas de vida muda a decisão mais que pensar em reais.',
    calcular(args) {
        const preco = exigirNumero(args[0], 'preço do produto', { permiteNegativo: false, permiteZero: false })
        const salario = exigirNumero(args[1], 'salário mensal', { permiteNegativo: false, permiteZero: false })
        const horasSemana = args[2] ? exigirNumero(args[2], 'horas por semana', { permiteNegativo: false, permiteZero: false, maximo: 168 }) : 44
        const horasMes = horasSemana * 4.33
        const valorHora = salario / horasMes
        const horas = preco / valorHora
        return {
            intro: `Esse produto custa ${'*' + fmt(horas, 1) + ' horas do seu trabalho*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Horas de trabalho:* ${fmt(horas, 1)}`, `*Dias de 8 horas:* ${fmt(horas / 8, 1)}`, `*Valor da sua hora:* ${moeda(valorHora)}`, `*Fração do salário:* ${fmt(preco / salario * 100, 1)}%`] },
                { emoji: '📊', titulo: 'Guardando para comprar', linhas: [10, 20, 30].map(p => `• Guardando ${p}% do salário: ${fmt(preco / (salario * p / 100), 1)} mês(es)`) },
                { emoji: '🧠', titulo: 'Antes de decidir', linhas: [`Se esse produto dura 2 anos, ele custa ${moeda(preco / 24)} por mês de uso. Compare com o que você usaria no lugar.`] }
            ]
        }
    }
})

C('gastos_casal', {
    emoji: '💑', titulo: 'Dividir contas conforme a renda',
    descricao: 'Divide as contas da casa conforme cada renda',
    uso: '<despesa total> <renda1> <renda2> [renda3 ...]',
    exemplos: [{ args: '3000 5000 3000', oque: 'casal com rendas diferentes' }, { args: '4500 4000 4000 2000', oque: 'três moradores' }],
    dica: 'Dividir meio a meio pesa muito mais para quem ganha menos. Proporcional à renda dói igual para todos.',
    calcular(args) {
        const despesa = exigirNumero(args[0], 'despesa total', { permiteNegativo: false, permiteZero: false })
        const rendas = listaDeNumeros(args.slice(1), 2, 'rendas').map((s, i) => exigirNumero(s, `${i + 1}ª renda`, { permiteNegativo: false, permiteZero: false }))
        const soma = rendas.reduce((a, b) => a + b, 0)
        const partes = rendas.map(r => despesa * r / soma)
        const igual = despesa / rendas.length
        return {
            intro: `Proporcional à renda, cada um paga ${'*' + partes.map(p => moeda(p)).join(', ') + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Quanto cada um paga', linhas: rendas.map((r, i) => `• Renda ${moeda(r)}: paga ${moeda(partes[i])} (${fmt(r / soma * 100, 1)}% da despesa, ${fmt(partes[i] / r * 100, 1)}% do que ganha)`) },
                { emoji: '⚖️', titulo: 'Comparando com meio a meio', linhas: rendas.map((r, i) => `• Renda ${moeda(r)}: pagaria ${moeda(igual)}, uma diferença de ${moeda(igual - partes[i])}`) },
                { emoji: '💰', titulo: 'Sobra para cada um', linhas: rendas.map((r, i) => `• ${moeda(r - partes[i])} depois de pagar a parte da casa`) }
            ]
        }
    }
})

C('orcamento_503020', {
    emoji: '📋', titulo: 'Orçamento em três fatias',
    descricao: 'Divide a renda em necessidades, desejos e poupança',
    uso: '<renda líquida mensal>',
    exemplos: [{ args: '3500', oque: 'renda de três mil e quinhentos' }, { args: '8000', oque: 'renda maior' }],
    dica: 'A regra é 50% para o que você precisa, 30% para o que você quer e 20% para guardar e quitar dívida.',
    calcular(args) {
        const renda = exigirNumero(args[0], 'renda líquida mensal', { permiteNegativo: false, permiteZero: false })
        return {
            intro: `Com ${moeda(renda)} por mês: ${'*' + moeda(renda * 0.5) + '*'} para necessidades, ${moeda(renda * 0.3)} para desejos e ${moeda(renda * 0.2)} para guardar.`,
            secoes: [
                { emoji: '🏠', titulo: 'Necessidades (50%)', linhas: [`*Total:* ${moeda(renda * 0.5)}`, `*Aluguel ou prestação (até 30%):* ${moeda(renda * 0.3)}`, `*Mercado (até 12%):* ${moeda(renda * 0.12)}`, `*Transporte e contas:* ${moeda(renda * 0.08)}`] },
                { emoji: '🎉', titulo: 'Desejos (30%)', linhas: [`*Total:* ${moeda(renda * 0.3)}`, `*Lazer e restaurante:* ${moeda(renda * 0.15)}`, `*Assinaturas e compras:* ${moeda(renda * 0.1)}`, `*Reserva para imprevisto do mês:* ${moeda(renda * 0.05)}`] },
                { emoji: '🏦', titulo: 'Futuro (20%)', linhas: [`*Total:* ${moeda(renda * 0.2)}`, `*Em um ano:* ${moeda(renda * 0.2 * 12)}`, `*Em cinco anos rendendo 0,8% ao mês:* ${moeda(renda * 0.2 * ((Math.pow(1.008, 60) - 1) / 0.008))}`] }
            ]
        }
    }
})

C('reserva_emergencia', {
    emoji: '🛡️', titulo: 'Reserva de emergência',
    descricao: 'Calcula a reserva de emergência e o prazo dela',
    uso: '<gasto mensal> [meses de reserva] [quanto guarda por mês]',
    exemplos: [{ args: '3000', oque: 'gasto de três mil por mês' }, { args: '4500 12 800', oque: 'autônomo guardando oitocentos' }],
    dica: 'Quem tem carteira assinada mira 6 meses; autônomo e quem depende de comissão, 12 meses.',
    calcular(args) {
        const gasto = exigirNumero(args[0], 'gasto mensal', { permiteNegativo: false, permiteZero: false })
        const meses = args[1] ? Math.round(exigirNumero(args[1], 'meses de reserva', { minimo: 1, maximo: 60 })) : 6
        const aporte = args[2] ? exigirNumero(args[2], 'quanto guarda por mês', { permiteNegativo: false, permiteZero: false }) : gasto * 0.2
        const alvo = gasto * meses
        const tempo = alvo / aporte
        return {
            intro: `Sua reserva ideal é de ${'*' + moeda(alvo) + '*'}, guardando ${moeda(aporte)} por mês.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Reserva alvo:* ${moeda(alvo)}`, `*Meses cobertos:* ${meses}`, `*Aporte mensal:* ${moeda(aporte)}`, `*Tempo para juntar:* ${fmt(tempo, 1)} meses`] },
                { emoji: '📅', titulo: 'Linha do tempo', linhas: [`*Data de chegada:* ${fmtData(somaDias(hoje(), Math.ceil(tempo * 30)))}`, `*Em 6 meses você terá:* ${moeda(aporte * 6)}`, `*Em 12 meses:* ${moeda(aporte * 12)}`] },
                { emoji: '🏦', titulo: 'Onde deixar', linhas: ['Reserva precisa render e sair no mesmo dia: aplicação de liquidez diária resolve. Deixar em investimento que trava o dinheiro tira o sentido da reserva.'] }
            ]
        }
    }
})

C('divida_quitacao', {
    emoji: '🧯', titulo: 'Tempo para quitar uma dívida',
    descricao: 'Calcula em quanto tempo a dívida é quitada',
    uso: '<saldo devedor> <juros % ao mês> <quanto paga por mês>',
    exemplos: [{ args: '5000 3 500', oque: 'cinco mil a 3% pagando quinhentos' }, { args: '12000 8 1500', oque: 'dívida de cartão' }],
    dica: 'Se a parcela for menor que o juro do mês, a dívida cresce para sempre. Eu aviso quando é o caso.',
    calcular(args) {
        const saldo = exigirNumero(args[0], 'saldo devedor', { permiteNegativo: false, permiteZero: false })
        const taxa = exigirNumero(args[1], 'juros ao mês em porcento', { permiteNegativo: false }) / 100
        const parcela = exigirNumero(args[2], 'quanto paga por mês', { permiteNegativo: false, permiteZero: false })
        const jurosMes = saldo * taxa
        if (parcela <= jurosMes) {
            throw falha(`Pagando ${moeda(parcela)} por mês você não cobre nem o juro, que é de ${moeda(jurosMes)}. A dívida cresce todo mês: renegocie ou aumente o valor pago.`)
        }
        const meses = taxa === 0 ? saldo / parcela : Math.log(parcela / (parcela - saldo * taxa)) / Math.log(1 + taxa)
        const totalPago = parcela * meses
        return {
            intro: `Pagando ${moeda(parcela)} por mês, você quita em ${'*' + fmt(Math.ceil(meses), 0) + ' meses*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Meses até quitar:* ${fmt(Math.ceil(meses), 0)}`, `*Total pago:* ${moeda(totalPago)}`, `*Só de juros:* ${moeda(totalPago - saldo)}`, `*Juros do primeiro mês:* ${moeda(jurosMes)}`] },
                { emoji: '📊', titulo: 'Se pagar mais por mês', linhas: [1.25, 1.5, 2].map(k => {
                    const p = parcela * k
                    const m = taxa === 0 ? saldo / p : Math.log(p / (p - saldo * taxa)) / Math.log(1 + taxa)
                    return `• ${moeda(p)} por mês: ${fmt(Math.ceil(m), 0)} meses e ${moeda(p * m - saldo)} de juros`
                }) },
                { emoji: '📅', titulo: 'Data da liberdade', linhas: [`Mantendo ${moeda(parcela)}, a última parcela cai em ${fmtData(somaDias(hoje(), Math.ceil(meses) * 30))}.`] }
            ]
        }
    }
})

C('freelancer_preco', {
    emoji: '💼', titulo: 'Preço da hora de autônomo',
    descricao: 'Calcula quanto cobrar por hora como autônomo',
    uso: '<quanto quer receber por mês> [horas faturáveis por semana] [custos mensais]',
    exemplos: [{ args: '6000', oque: 'seis mil por mês' }, { args: '9000 25 1200', oque: 'com custos e horas informadas' }],
    dica: 'Ninguém fatura 40 horas por semana: proposta, cobrança e administração comem boa parte do tempo.',
    calcular(args) {
        const desejado = exigirNumero(args[0], 'quanto quer receber por mês', { permiteNegativo: false, permiteZero: false })
        const horasSemana = args[1] ? exigirNumero(args[1], 'horas faturáveis por semana', { permiteNegativo: false, permiteZero: false, maximo: 100 }) : 25
        const custos = args[2] ? exigirNumero(args[2], 'custos mensais', { permiteNegativo: false }) : 0
        const horasMes = horasSemana * 4.33
        const bruto = (desejado + custos) / 0.85
        const hora = bruto / horasMes
        return {
            intro: `Para tirar ${moeda(desejado)} por mês, cobre ${'*' + moeda(hora) + ' por hora*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Preço da hora:* ${moeda(hora)}`, `*Faturamento necessário:* ${moeda(bruto)}`, `*Horas faturáveis no mês:* ${fmt(horasMes, 0)}`, `*Custos fixos incluídos:* ${moeda(custos)}`] },
                { emoji: '🧾', titulo: 'O que já está embutido', linhas: [`*Imposto e taxa (15%):* ${moeda(bruto * 0.15)}`, `*Valor do dia (8 h):* ${moeda(hora * 8)}`, `*Projeto de 40 horas:* ${moeda(hora * 40)}`] },
                { emoji: '📅', titulo: 'Férias e imprevisto', linhas: [`Você não fatura em férias nem doente. Guardar 10% de cada recebimento (${moeda(bruto * 0.1)} por mês) cobre um mês parado por ano.`] }
            ]
        }
    }
})

/* ═══════════════════════════ DOCUMENTOS ═══════════════════════════
 * Aqui só se CONFERE e se FORMATA. Nenhuma função deste bloco monta um
 * documento válido de pessoa — é decisão de projeto, não esquecimento.
 * Os números que aparecem em exemplo são os de documentação pública
 * (o 123.456.789-09 dos manuais, o cartão 4111... de teste de loja).
 */

/** Dígito verificador por módulo 10 (o do boleto bancário). */
function mod10Bloco(bloco) {
    let soma = 0
    let peso = 2
    for (let i = bloco.length - 1; i >= 0; i--) {
        let v = Number(bloco[i]) * peso
        if (v > 9) v -= 9
        soma += v
        peso = peso === 2 ? 1 : 2
    }
    return (10 - (soma % 10)) % 10
}

/** Módulo 11 com pesos de 2 a 9 girando da direita para a esquerda. */
function mod11Girando(texto, { zeroVira = 0 } = {}) {
    const p = [2, 3, 4, 5, 6, 7, 8, 9]
    let soma = 0
    let j = 0
    for (let i = texto.length - 1; i >= 0; i--) { soma += Number(texto[i]) * p[j % 8]; j++ }
    const resto = soma % 11
    const dv = 11 - resto
    if (dv === 10 || dv === 11 || resto === 0) return zeroVira
    return dv
}

const PIS_PESOS = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

function validarPis(valor) {
    const d = digitos(valor)
    if (d.length !== 11) return { ok: false, motivo: `PIS tem 11 dígitos; esse tem ${d.length}.` }
    if (/^(\d)\1{10}$/.test(d)) return { ok: false, motivo: 'Todos os dígitos iguais: esse padrão nunca é um PIS de verdade.' }
    let soma = 0
    for (let i = 0; i < 10; i++) soma += Number(d[i]) * PIS_PESOS[i]
    const resto = soma % 11
    const dv = resto < 2 ? 0 : 11 - resto
    if (dv !== Number(d[10])) return { ok: false, motivo: `O dígito verificador deveria ser ${dv}, e não ${d[10]}.` }
    return { ok: true, digitos: d, formatado: `${d.slice(0, 3)}.${d.slice(3, 8)}.${d.slice(8, 10)}-${d.slice(10)}` }
}

const TITULO_UF = {
    '01': 'SP', '02': 'MG', '03': 'RJ', '04': 'RS', '05': 'BA', '06': 'PR', '07': 'CE',
    '08': 'PE', '09': 'SC', '10': 'GO', '11': 'MA', '12': 'PB', '13': 'PA', '14': 'ES',
    '15': 'PI', '16': 'RN', '17': 'AL', '18': 'MT', '19': 'MS', '20': 'DF', '21': 'SE',
    '22': 'AM', '23': 'RO', '24': 'AC', '25': 'AP', '26': 'RR', '27': 'TO', '28': 'Exterior'
}

function validarTitulo(valor) {
    const d = digitos(valor).padStart(12, '0')
    if (digitos(valor).length < 10 || d.length !== 12) return { ok: false, motivo: `O título tem 12 dígitos; esse tem ${digitos(valor).length}.` }
    const seq = d.slice(0, 8)
    const uf = d.slice(8, 10)
    if (!TITULO_UF[uf]) return { ok: false, motivo: `O código de estado "${uf}" não existe. Ele fica na 9ª e 10ª posição e vai de 01 a 28.` }
    const especial = uf === '01' || uf === '02'
    let s1 = 0
    for (let i = 0; i < 8; i++) s1 += Number(seq[i]) * (i + 2)
    let dv1 = s1 % 11
    if (dv1 === 10) dv1 = 0
    if (dv1 === 0 && especial) dv1 = 1
    const s2 = Number(uf[0]) * 7 + Number(uf[1]) * 8 + dv1 * 9
    let dv2 = s2 % 11
    if (dv2 === 10) dv2 = 0
    if (dv2 === 0 && especial) dv2 = 1
    if (String(dv1) !== d[10] || String(dv2) !== d[11]) {
        return { ok: false, motivo: `Os dígitos verificadores deveriam ser ${dv1}${dv2}, e não ${d.slice(10)}.`, uf: TITULO_UF[uf] }
    }
    return { ok: true, digitos: d, uf: TITULO_UF[uf], codigoUf: uf, formatado: `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8)}` }
}

function validarRenavam(valor) {
    const bruto = digitos(valor)
    if (!bruto || bruto.length > 11) return { ok: false, motivo: `O RENAVAM tem até 11 dígitos; esse tem ${bruto.length}.` }
    const d = bruto.padStart(11, '0')
    const base = d.slice(0, 10)
    let soma = 0
    for (let i = 0; i < 10; i++) soma += Number(base[i]) * PIS_PESOS[i]
    let dv = 11 - (soma % 11)
    if (dv >= 10) dv = 0
    if (String(dv) !== d[10]) return { ok: false, motivo: `O dígito verificador deveria ser ${dv}, e não ${d[10]}.` }
    return { ok: true, digitos: d, formatado: `${d.slice(0, 5)}.${d.slice(5, 10)}-${d.slice(10)}` }
}

function validarCnh(valor) {
    const d = digitos(valor)
    if (d.length !== 11) return { ok: false, motivo: `A CNH tem 11 dígitos; essa tem ${d.length}.` }
    if (/^(\d)\1{10}$/.test(d)) return { ok: false, motivo: 'Todos os dígitos iguais: esse padrão não é uma CNH de verdade.' }
    let s1 = 0
    for (let i = 0; i < 9; i++) s1 += Number(d[i]) * (9 - i)
    let dv1 = s1 % 11
    let ajuste = false
    if (dv1 >= 10) { dv1 = 0; ajuste = true }
    let s2 = 0
    for (let i = 0; i < 9; i++) s2 += Number(d[i]) * (i + 1)
    let dv2 = s2 % 11
    if (ajuste) dv2 -= 2
    if (dv2 < 0) dv2 += 11
    if (dv2 >= 10) dv2 = 0
    if (String(dv1) !== d[9] || String(dv2) !== d[10]) return { ok: false, motivo: `Os dois últimos dígitos deveriam ser ${dv1}${dv2}, e não ${d.slice(9)}.` }
    return { ok: true, digitos: d }
}

function validarCns(valor) {
    const d = digitos(valor)
    if (d.length !== 15) return { ok: false, motivo: `O cartão do SUS tem 15 dígitos; esse tem ${d.length}.` }
    if (!'12789'.includes(d[0])) return { ok: false, motivo: `Número do SUS começa com 1, 2, 7, 8 ou 9. Esse começa com ${d[0]}.` }
    let soma = 0
    for (let i = 0; i < 15; i++) soma += Number(d[i]) * (15 - i)
    if (soma % 11 !== 0) return { ok: false, motivo: 'A soma de conferência não fecha: tem dígito trocado.' }
    return { ok: true, digitos: d, definitivo: d[0] === '1' || d[0] === '2', formatado: `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7, 11)} ${d.slice(11)}` }
}

const UF_IBGE = {
    11: 'RO', 12: 'AC', 13: 'AM', 14: 'RR', 15: 'PA', 16: 'AP', 17: 'TO', 21: 'MA', 22: 'PI',
    23: 'CE', 24: 'RN', 25: 'PB', 26: 'PE', 27: 'AL', 28: 'SE', 29: 'BA', 31: 'MG', 32: 'ES',
    33: 'RJ', 35: 'SP', 41: 'PR', 42: 'SC', 43: 'RS', 50: 'MS', 51: 'MT', 52: 'GO', 53: 'DF'
}

function validarChaveNfe(valor) {
    const d = digitos(valor)
    if (d.length !== 44) return { ok: false, motivo: `A chave da nota tem 44 dígitos; essa tem ${d.length}.` }
    const dv = mod11Girando(d.slice(0, 43))
    if (String(dv) !== d[43]) return { ok: false, motivo: `O último dígito deveria ser ${dv}, e não ${d[43]}.` }
    return { ok: true, digitos: d }
}

function lerChaveNfe(d) {
    const uf = UF_IBGE[Number(d.slice(0, 2))] || 'desconhecido'
    const ano = 2000 + Number(d.slice(2, 4))
    const mes = Number(d.slice(4, 6))
    return {
        uf,
        emissao: `${String(mes).padStart(2, '0')}/${ano}`,
        cnpj: `${d.slice(6, 8)}.${d.slice(8, 11)}.${d.slice(11, 14)}/${d.slice(14, 18)}-${d.slice(18, 20)}`,
        modelo: d.slice(20, 22),
        serie: d.slice(22, 25),
        numero: d.slice(25, 34),
        codigo: d.slice(35, 43)
    }
}

const CNJ_TRIBUNAL = { 1: 'Supremo Tribunal Federal', 2: 'Conselho Nacional de Justiça', 3: 'Superior Tribunal de Justiça', 4: 'Justiça Federal', 5: 'Justiça do Trabalho', 6: 'Justiça Eleitoral', 7: 'Justiça Militar da União', 8: 'Justiça Estadual', 9: 'Justiça Militar Estadual' }

function validarProcessoCnj(valor) {
    const d = digitos(valor)
    if (d.length !== 20) return { ok: false, motivo: `O número único do processo tem 20 dígitos; esse tem ${d.length}.` }
    const nnn = d.slice(0, 7)
    const dd = d.slice(7, 9)
    const resto = d.slice(9)
    let rem = 0
    for (const c of nnn + resto + '00') rem = (rem * 10 + Number(c)) % 97
    const esperado = String(98 - rem).padStart(2, '0')
    if (esperado !== dd) return { ok: false, motivo: `Os dois dígitos verificadores deveriam ser ${esperado}, e não ${dd}.` }
    return { ok: true, digitos: d }
}

function lerProcessoCnj(d) {
    return {
        numero: d.slice(0, 7),
        dv: d.slice(7, 9),
        ano: d.slice(9, 13),
        segmento: Number(d.slice(13, 14)),
        tribunal: d.slice(14, 16),
        origem: d.slice(16, 20),
        formatado: `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16, 20)}`
    }
}

/** Dígito de EAN-8, EAN-13 e ISBN-13: pesos 1 e 3 alternados. */
function dvEan(base) {
    let soma = 0
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (i % 2 === 0 ? 1 : 3)
    return (10 - (soma % 10)) % 10
}

/** CRC-16/CCITT-FALSE — o que fecha o código PIX copia e cola. */
function crc16(texto) {
    let crc = 0xFFFF
    for (let i = 0; i < texto.length; i++) {
        crc ^= texto.charCodeAt(i) << 8
        for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF
    }
    return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** Lê os campos do código PIX copia e cola (formato EMV). */
function lerBrCode(texto) {
    const campos = {}
    let i = 0
    while (i + 4 <= texto.length) {
        const id = texto.slice(i, i + 2)
        const tam = Number(texto.slice(i + 2, i + 4))
        if (!Number.isFinite(tam)) break
        campos[id] = texto.slice(i + 4, i + 4 + tam)
        i += 4 + tam
    }
    return campos
}

const CEP_FAIXAS = [
    [1000000, 19999999, 'SP'], [20000000, 28999999, 'RJ'], [29000000, 29999999, 'ES'],
    [30000000, 39999999, 'MG'], [40000000, 48999999, 'BA'], [49000000, 49999999, 'SE'],
    [50000000, 56999999, 'PE'], [57000000, 57999999, 'AL'], [58000000, 58999999, 'PB'],
    [59000000, 59999999, 'RN'], [60000000, 63999999, 'CE'], [64000000, 64999999, 'PI'],
    [65000000, 65999999, 'MA'], [66000000, 68899999, 'PA'], [68900000, 68999999, 'AP'],
    [69000000, 69299999, 'AM'], [69300000, 69399999, 'RR'], [69400000, 69899999, 'AM'],
    [69900000, 69999999, 'AC'], [70000000, 72799999, 'DF'], [72800000, 72999999, 'GO'],
    [73000000, 73699999, 'DF'], [73700000, 76799999, 'GO'], [76800000, 76999999, 'RO'],
    [77000000, 77999999, 'TO'], [78000000, 78899999, 'MT'], [78900000, 78999999, 'RO'],
    [79000000, 79999999, 'MS'], [80000000, 87999999, 'PR'], [88000000, 89999999, 'SC'],
    [90000000, 99999999, 'RS']
]

function estadoDoCep(d) {
    const n = Number(d)
    const faixa = CEP_FAIXAS.find(f => n >= f[0] && n <= f[1])
    return faixa ? faixa[2] : null
}

const CPF_REGIAO = {
    0: ['RS'], 1: ['DF', 'GO', 'MS', 'MT', 'TO'], 2: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR'],
    3: ['CE', 'MA', 'PI'], 4: ['AL', 'PB', 'PE', 'RN'], 5: ['BA', 'SE'], 6: ['MG'],
    7: ['ES', 'RJ'], 8: ['SP'], 9: ['PR', 'SC']
}

/** Placa antiga (ABC1234) ou Mercosul (ABC1D23). */
function lerPlaca(valor) {
    const s = String(valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (s.length !== 7) return { ok: false, motivo: `Placa tem 7 caracteres; essa tem ${s.length}.` }
    if (/^[A-Z]{3}\d{4}$/.test(s)) return { ok: true, padrao: 'antigo', texto: s, formatado: `${s.slice(0, 3)}-${s.slice(3)}` }
    if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(s)) return { ok: true, padrao: 'Mercosul', texto: s, formatado: s }
    return { ok: false, motivo: 'A placa não segue nem o padrão antigo (три letras e quatro números) nem o Mercosul (letra no lugar do segundo número).' }
}

/** Faixa de letras da placa antiga por estado (convênio Denatran). */
const PLACA_FAIXAS = [
    ['AAA', 'BEZ', 'PR'], ['BFA', 'GKI', 'SP'], ['GKJ', 'HOK', 'MG'], ['HOL', 'HQE', 'MA'],
    ['HQF', 'HTW', 'MS'], ['HTX', 'HZA', 'CE'], ['HZB', 'IAP', 'SE'], ['IAQ', 'ITB', 'RS'],
    ['ITC', 'JDO', 'DF'], ['JDP', 'JKR', 'BA'], ['JKS', 'JSZ', 'PA'], ['JTA', 'JWE', 'AM'],
    ['JWF', 'JXY', 'MT'], ['JXZ', 'KAU', 'GO'], ['KAV', 'KFC', 'PE'], ['KFD', 'KME', 'CE'],
    ['KMF', 'LVE', 'SC'], ['LVF', 'LWQ', 'RN'], ['LWR', 'MMM', 'RJ'], ['MMN', 'MOW', 'ES'],
    ['MOX', 'MTZ', 'MG'], ['MUA', 'MZM', 'BA'], ['MZN', 'NAG', 'PB'], ['NAH', 'NBA', 'AL'],
    ['NBB', 'NEH', 'PI'], ['NEI', 'NFB', 'RO'], ['NFC', 'NFZ', 'AC'], ['NGA', 'NHZ', 'GO'],
    ['NIA', 'NJZ', 'PR'], ['NKA', 'NOF', 'MG'], ['NOG', 'NTZ', 'SP'], ['NUA', 'NWZ', 'RJ'],
    ['NXA', 'NYZ', 'MG'], ['OAA', 'OGZ', 'SP'], ['OHA', 'OKZ', 'RS'], ['OLA', 'ONZ', 'PA'],
    ['OOA', 'OQZ', 'SC'], ['ORA', 'OTZ', 'MG'], ['OUA', 'OZZ', 'SP'], ['PAA', 'PGZ', 'SP'],
    ['PHA', 'PNZ', 'MG'], ['POA', 'PTZ', 'RJ'], ['PUA', 'PWZ', 'PR'], ['PXA', 'QDZ', 'SP'],
    ['QEA', 'QIZ', 'MG'], ['QJA', 'QNZ', 'RS'], ['QOA', 'QRZ', 'BA'], ['QSA', 'QTZ', 'GO'],
    ['QUA', 'QZZ', 'SP'], ['RAA', 'RFZ', 'SP'], ['RGA', 'RJZ', 'RJ'], ['RKA', 'RMZ', 'MG'],
    ['RNA', 'RQZ', 'PR'], ['RRA', 'RTZ', 'SC'], ['RUA', 'RZZ', 'SP']
]

function estadoDaPlaca(letras) {
    const f = PLACA_FAIXAS.find(x => letras >= x[0] && letras <= x[1])
    return f ? f[2] : null
}

function lerTelefone(valor) {
    let d = digitos(valor)
    if (d.startsWith('55') && d.length > 11) d = d.slice(2)
    if (d.length !== 10 && d.length !== 11) return { ok: false, motivo: `Telefone brasileiro tem 10 ou 11 dígitos com o DDD; esse tem ${d.length}.` }
    const ddd = d.slice(0, 2)
    if (!DDDS[Number(ddd)]) return { ok: false, motivo: `O DDD ${ddd} não existe na lista da Anatel.` }
    const numero = d.slice(2)
    const celular = numero.length === 9
    if (celular && numero[0] !== '9') return { ok: false, motivo: 'Número de 9 dígitos precisa começar com 9: é a regra do celular no Brasil.' }
    if (!celular && !'2345'.includes(numero[0])) return { ok: false, motivo: `Telefone fixo começa com 2, 3, 4 ou 5. Esse começa com ${numero[0]}.` }
    return {
        ok: true, digitos: d, ddd, numero, tipo: celular ? 'celular' : 'fixo',
        formatado: `(${ddd}) ${celular ? numero.slice(0, 5) + '-' + numero.slice(5) : numero.slice(0, 4) + '-' + numero.slice(4)}`,
        internacional: `+55${ddd}${numero}`,
        local: DDDS[Number(ddd)]
    }
}

function lerEmail(valor) {
    const s = String(valor || '').trim()
    if (!s) return { ok: false, motivo: 'Digite o endereço de e-mail.' }
    if (/\s/.test(s)) return { ok: false, motivo: 'E-mail não pode ter espaço no meio.' }
    const partes = s.split('@')
    if (partes.length !== 2) return { ok: false, motivo: `O endereço precisa de exatamente um arroba. Esse tem ${partes.length - 1}.` }
    const [usuario, dominio] = partes
    if (!usuario) return { ok: false, motivo: 'Falta o nome antes do arroba.' }
    if (usuario.length > 64) return { ok: false, motivo: `A parte antes do arroba passa de 64 caracteres (tem ${usuario.length}).` }
    if (!/^[A-Za-z0-9._%+-]+$/.test(usuario)) return { ok: false, motivo: 'A parte antes do arroba tem caractere que não é aceito. Valem letras, números, ponto, hífen, mais e sublinhado.' }
    if (usuario.startsWith('.') || usuario.endsWith('.') || usuario.includes('..')) return { ok: false, motivo: 'Ponto não pode abrir, fechar nem aparecer dobrado antes do arroba.' }
    if (!dominio.includes('.')) return { ok: false, motivo: 'Falta o ponto no domínio, como em exemplo.com.br.' }
    if (!/^[A-Za-z0-9.-]+$/.test(dominio) || dominio.startsWith('-') || dominio.includes('..')) return { ok: false, motivo: 'O domínio tem caractere inválido ou ponto dobrado.' }
    const ext = dominio.split('.').pop()
    if (ext.length < 2) return { ok: false, motivo: `A terminação "${ext}" é curta demais: precisa de pelo menos duas letras.` }
    return { ok: true, usuario, dominio, extensao: ext, endereco: s.toLowerCase() }
}

D('doc_cpf_validar', {
    emoji: '🪪', titulo: 'Conferir CPF',
    descricao: 'Confere se os dígitos de um CPF fecham',
    uso: '<número do CPF>',
    exemplos: [{ args: '123.456.789-09', oque: 'o CPF que aparece em manual' }, { args: '111.111.111-11', oque: 'um padrão que nunca é válido' }],
    dica: 'Conferir os dígitos não diz de quem é o CPF nem se ele está ativo na Receita: só que a conta fecha.',
    calcular(args) {
        const bruto = args.join('')
        const r = validarCpf(bruto)
        const d = digitos(bruto)
        return {
            intro: r.ok ? `O CPF ${'*' + r.formatado + '*'} passa na conferência dos dígitos.` : `Esse número ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Número recebido:* ${d || 'nenhum dígito'}`, `*Situação:* ${r.ok ? 'dígitos corretos' : 'dígitos incorretos'}`, r.ok ? `*Formatado:* ${r.formatado}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🔍', titulo: 'O que isso quer dizer', linhas: ['O CPF tem 9 números e 2 dígitos calculados a partir deles. Eu refaço essa conta e comparo.', 'Isso pega erro de digitação. Não pega CPF cancelado, suspenso nem que pertence a outra pessoa.'] },
                { emoji: '🔒', titulo: 'Cuidado com documento alheio', linhas: ['Não passe CPF de outra pessoa em grupo. Documento é dado pessoal e circula rápido demais no WhatsApp.'] }
            ]
        }
    }
})

D('doc_cpf_formatar', {
    emoji: '✍️', titulo: 'Formatar CPF com pontos',
    descricao: 'Põe pontos e traço em um CPF digitado solto',
    uso: '<11 dígitos do CPF>',
    exemplos: [{ args: '12345678909', oque: 'onze dígitos sem pontuação' }, { args: '123 456 789 09', oque: 'com espaços no meio' }],
    dica: 'Formatar é só arrumar a pontuação. A conferência dos dígitos é outro comando.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 11) throw falha(`Preciso de 11 dígitos para formatar um CPF. Você mandou ${d.length}.`)
        const r = validarCpf(d)
        return {
            intro: `Formatado: ${'*' + d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9) + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Formas de escrever', linhas: [`*Com pontuação:* ${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`, `*Só números:* ${d}`, `*Com espaço:* ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`] },
                { emoji: '🔎', titulo: 'De quebra, a conferência', linhas: [r.ok ? 'Os dígitos verificadores batem.' : `Atenção: ${r.motivo}`] }
            ]
        }
    }
})

D('doc_cpf_regiao', {
    emoji: '🗺️', titulo: 'Região fiscal do CPF',
    descricao: 'Diz em que região o CPF foi emitido',
    uso: '<número do CPF>',
    exemplos: [{ args: '123.456.789-09', oque: 'vê a região pelo nono dígito' }, { args: '12345678909', oque: 'sem pontuação' }],
    dica: 'O nono dígito guarda a região fiscal da emissão. Ele não muda quando a pessoa se muda de estado.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 11) throw falha(`Preciso dos 11 dígitos do CPF. Você mandou ${d.length}.`)
        const regiao = Number(d[8])
        const estados = CPF_REGIAO[regiao]
        return {
            intro: `Esse CPF foi emitido na região fiscal ${'*' + regiao + '*'}, que cobre ${estados.join(', ')}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Nono dígito:* ${regiao}`, `*Estados da região:* ${estados.join(', ')}`, `*Dígitos verificadores:* ${d.slice(9)}`, `*Conferência:* ${validarCpf(d).ok ? 'dígitos corretos' : 'dígitos não batem'}`] },
                { emoji: '📊', titulo: 'Todas as regiões', linhas: Object.entries(CPF_REGIAO).map(([n, e]) => `• ${n}: ${e.join(', ')}`) },
                { emoji: '💡', titulo: 'Detalhe', linhas: ['A região é a do local em que o CPF foi tirado, não a de moradia atual nem a de nascimento.'] }
            ]
        }
    }
})

D('doc_cpf_digito', {
    emoji: '🧮', titulo: 'Como o dígito do CPF é calculado',
    descricao: 'Mostra passo a passo o cálculo do dígito do CPF',
    uso: '<número do CPF>',
    exemplos: [{ args: '123.456.789-09', oque: 'vê a conta completa' }, { args: '11144477735', oque: 'outro número de manual' }],
    dica: 'É módulo 11: multiplica cada dígito por um peso, soma, divide por 11 e olha o resto.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length < 9) throw falha(`Preciso de pelo menos os 9 primeiros dígitos do CPF. Você mandou ${d.length}.`)
        const n = d.slice(0, 9).split('').map(Number)
        let soma1 = 0
        const linhas1 = []
        for (let i = 0; i < 9; i++) { soma1 += n[i] * (10 - i); linhas1.push(`• ${n[i]} vezes ${10 - i} = ${n[i] * (10 - i)}`) }
        const resto1 = soma1 % 11
        const dv1 = resto1 < 2 ? 0 : 11 - resto1
        const base2 = [...n, dv1]
        let soma2 = 0
        for (let i = 0; i < 10; i++) soma2 += base2[i] * (11 - i)
        const resto2 = soma2 % 11
        const dv2 = resto2 < 2 ? 0 : 11 - resto2
        return {
            intro: `Para ${d.slice(0, 9)}, os dígitos verificadores são ${'*' + dv1 + dv2 + '*'}.`,
            secoes: [
                { emoji: '1️⃣', titulo: 'Primeiro dígito', linhas: linhas1.concat([`*Soma:* ${soma1}`, `*Resto da divisão por 11:* ${resto1}`, `*Dígito:* ${dv1} (resto menor que 2 vira zero)`]) },
                { emoji: '2️⃣', titulo: 'Segundo dígito', linhas: [`Repete a conta com dez dígitos e pesos de 11 a 2.`, `*Soma:* ${soma2}`, `*Resto:* ${resto2}`, `*Dígito:* ${dv2}`] },
                { emoji: '🔎', titulo: 'Conferência', linhas: [d.length === 11 ? (d.slice(9) === `${dv1}${dv2}` ? 'Os dígitos informados batem com o cálculo.' : `Os dígitos informados (${d.slice(9)}) não batem com o cálculo (${dv1}${dv2}).`) : 'Você mandou só a base: o cálculo acima mostra quais dígitos fechariam esse número.'] }
            ]
        }
    }
})

D('doc_cpf_mascarar', {
    emoji: '🕶️', titulo: 'Esconder parte do CPF',
    descricao: 'Esconde os dígitos do meio do CPF para enviar',
    uso: '<número do CPF>',
    exemplos: [{ args: '123.456.789-09', oque: 'deixa só as pontas à mostra' }, { args: '12345678909', oque: 'sem pontuação' }],
    dica: 'É o formato que empresa séria usa para confirmar identidade sem expor o documento inteiro.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 11) throw falha(`Preciso dos 11 dígitos do CPF. Você mandou ${d.length}.`)
        return {
            // Dígito escondido vira "•", não "*": no WhatsApp o asterisco é negrito
            // e "***.456.789-**" saía com a formatação embaralhada.
            intro: `Versão para mostrar: ${'*' + '•••.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-••' + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Formas de esconder', linhas: [`*Padrão da Receita:* •••.${d.slice(3, 6)}.${d.slice(6, 9)}-••`, `*Só o começo:* ${d.slice(0, 3)}.•••.•••-••`, `*Só o fim:* •••.•••.${d.slice(6, 9)}-${d.slice(9)}`] },
                { emoji: '🔒', titulo: 'Por que isso importa', linhas: ['Com CPF inteiro e nome, dá para abrir conta e fazer compra no nome de alguém. Mandar mascarado resolve na maioria dos atendimentos.'] }
            ]
        }
    }
})

D('doc_cnpj_validar', {
    emoji: '🏢', titulo: 'Conferir CNPJ',
    descricao: 'Confere se os dígitos de um CNPJ fecham',
    uso: '<número do CNPJ>',
    exemplos: [{ args: '11.222.333/0001-81', oque: 'o CNPJ usado em manual' }, { args: '11.222.333/0001-82', oque: 'o mesmo com um dígito trocado' }],
    dica: 'CNPJ tem 14 dígitos: 8 de raiz, 4 de filial e 2 verificadores.',
    calcular(args) {
        const bruto = args.join('')
        const r = validarCnpj(bruto)
        const d = digitos(bruto)
        return {
            intro: r.ok ? `O CNPJ ${'*' + r.formatado + '*'} passa na conferência.` : `Esse número ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Número recebido:* ${d || 'nenhum dígito'}`, `*Situação:* ${r.ok ? 'dígitos corretos' : 'dígitos incorretos'}`, r.ok ? `*Formatado:* ${r.formatado}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🧩', titulo: 'As partes do número', linhas: d.length === 14 ? [`*Raiz da empresa:* ${d.slice(0, 8)}`, `*Ordem da unidade:* ${d.slice(8, 12)}`, `*Dígitos verificadores:* ${d.slice(12)}`] : ['Mande os 14 dígitos para eu separar as partes.'] },
                { emoji: '🔍', titulo: 'O que a conta não vê', linhas: ['Dígito certo não quer dizer empresa ativa. Situação cadastral só na consulta oficial da Receita Federal.'] }
            ]
        }
    }
})

D('doc_cnpj_formatar', {
    emoji: '🖋️', titulo: 'Formatar CNPJ',
    descricao: 'Põe a pontuação certa em um CNPJ solto',
    uso: '<14 dígitos do CNPJ>',
    exemplos: [{ args: '11222333000181', oque: 'catorze dígitos sem pontuação' }, { args: '11 222 333 0001 81', oque: 'com espaços' }],
    dica: 'A pontuação do CNPJ é ponto, ponto, barra e traço, nessa ordem.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 14) throw falha(`Preciso de 14 dígitos para formatar um CNPJ. Você mandou ${d.length}.`)
        const r = validarCnpj(d)
        return {
            intro: `Formatado: ${'*' + d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) + '/' + d.slice(8, 12) + '-' + d.slice(12) + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Formas de escrever', linhas: [`*Com pontuação:* ${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`, `*Só números:* ${d}`, `*Raiz (usada em consulta):* ${d.slice(0, 8)}`] },
                { emoji: '🔎', titulo: 'Conferência', linhas: [r.ok ? 'Os dígitos verificadores batem.' : `Atenção: ${r.motivo}`] }
            ]
        }
    }
})

D('doc_cnpj_filial', {
    emoji: '🏬', titulo: 'Matriz ou filial pelo CNPJ',
    descricao: 'Diz se o CNPJ é da matriz ou de uma filial',
    uso: '<número do CNPJ>',
    exemplos: [{ args: '11.222.333/0001-81', oque: 'termina em 0001, então é matriz' }, { args: '11.222.333/0002-62', oque: 'a segunda unidade' }],
    dica: 'Os quatro dígitos depois da barra são a ordem da unidade: 0001 é sempre a matriz.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 14) throw falha(`Preciso dos 14 dígitos do CNPJ. Você mandou ${d.length}.`)
        const ordem = d.slice(8, 12)
        const matriz = ordem === '0001'
        return {
            intro: matriz ? `Esse CNPJ é da ${'*matriz*'} da empresa.` : `Esse CNPJ é da ${'*filial número ' + Number(ordem) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Raiz da empresa:* ${d.slice(0, 8)}`, `*Ordem da unidade:* ${ordem}`, `*Tipo:* ${matriz ? 'matriz' : 'filial'}`, `*Conferência dos dígitos:* ${validarCnpj(d).ok ? 'batem' : 'não batem'}`] },
                { emoji: '🧩', titulo: 'Como o número se organiza', linhas: ['As 8 primeiras casas identificam a empresa e não mudam nunca.', 'As 4 seguintes numeram cada estabelecimento: 0001 matriz, 0002 primeira filial e assim por diante.', 'Os 2 últimos são calculados sobre tudo isso.'] }
            ]
        }
    }
})

D('doc_cnpj_digito', {
    emoji: '🔢', titulo: 'Como o dígito do CNPJ é calculado',
    descricao: 'Mostra o cálculo dos dígitos do CNPJ',
    uso: '<número do CNPJ>',
    exemplos: [{ args: '11222333000181', oque: 'vê a conta completa' }, { args: '11.222.333/0001', oque: 'só a base, sem os verificadores' }],
    dica: 'Os pesos do CNPJ giram de 2 a 9 e recomeçam, da direita para a esquerda.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length < 12) throw falha(`Preciso de pelo menos os 12 primeiros dígitos do CNPJ. Você mandou ${d.length}.`)
        const n = d.slice(0, 12).split('').map(Number)
        const calc = (arr) => {
            const pesos = CNPJ_PESOS_13.slice(13 - arr.length)
            let soma = 0
            for (let i = 0; i < arr.length; i++) soma += arr[i] * pesos[i]
            const resto = soma % 11
            return { soma, resto, dv: resto < 2 ? 0 : 11 - resto, pesos }
        }
        const p1 = calc(n)
        const p2 = calc([...n, p1.dv])
        return {
            intro: `Para a base ${d.slice(0, 12)}, os verificadores são ${'*' + p1.dv + p2.dv + '*'}.`,
            secoes: [
                { emoji: '1️⃣', titulo: 'Primeiro dígito', linhas: [`*Pesos usados:* ${p1.pesos.join(', ')}`, `*Soma:* ${p1.soma}`, `*Resto por 11:* ${p1.resto}`, `*Dígito:* ${p1.dv}`] },
                { emoji: '2️⃣', titulo: 'Segundo dígito', linhas: [`*Pesos usados:* ${p2.pesos.join(', ')}`, `*Soma:* ${p2.soma}`, `*Resto por 11:* ${p2.resto}`, `*Dígito:* ${p2.dv}`] },
                { emoji: '🔎', titulo: 'Conferência', linhas: [d.length === 14 ? (d.slice(12) === `${p1.dv}${p2.dv}` ? 'Os dígitos informados batem.' : `Os informados (${d.slice(12)}) não batem com o cálculo (${p1.dv}${p2.dv}).`) : 'Você mandou só a base: os dígitos acima são os que fechariam esse CNPJ.'] }
            ]
        }
    }
})

D('doc_cep_validar', {
    emoji: '📮', titulo: 'Conferir CEP',
    descricao: 'Confere o formato do CEP e a faixa de estado',
    uso: '<número do CEP>',
    exemplos: [{ args: '01310-100', oque: 'CEP da Avenida Paulista' }, { args: '99999999', oque: 'fim da faixa nacional' }],
    dica: 'O CEP não tem dígito verificador: o que dá para conferir é o formato e a faixa de cada estado.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 8) throw falha(`CEP tem 8 dígitos. Você mandou ${d.length}.`)
        const uf = estadoDoCep(d)
        return {
            intro: uf ? `O CEP ${'*' + d.slice(0, 5) + '-' + d.slice(5) + '*'} fica em ${ESTADOS_NOME[uf] || uf}.` : `O CEP ${d} está fora das faixas conhecidas.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Formatado:* ${d.slice(0, 5)}-${d.slice(5)}`, `*Estado pela faixa:* ${uf ? `${uf} (${ESTADOS_NOME[uf]})` : 'fora das faixas'}`, `*Prefixo da região:* ${d.slice(0, 5)}`, `*Sufixo (rua ou trecho):* ${d.slice(5)}`] },
                { emoji: '🧩', titulo: 'Como o CEP se organiza', linhas: ['O primeiro dígito marca a região do país, os dois seguintes a sub-região, e assim por diante até a rua.', 'Os três últimos identificam o logradouro, o trecho ou o grande cliente.'] },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [`Faixas dos Correios por estado, ${VIGENCIA_TABELAS}.`] }
            ]
        }
    }
})

D('doc_cep_formatar', {
    emoji: '✉️', titulo: 'Formatar CEP',
    descricao: 'Põe o traço no lugar certo de um CEP',
    uso: '<8 dígitos do CEP>',
    exemplos: [{ args: '01310100', oque: 'oito dígitos sem traço' }, { args: '30 130 010', oque: 'com espaços' }],
    dica: 'O formato oficial é cinco dígitos, traço e mais três.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 8) throw falha(`CEP tem 8 dígitos. Você mandou ${d.length}.`)
        const uf = estadoDoCep(d)
        return {
            intro: `Formatado: ${'*' + d.slice(0, 5) + '-' + d.slice(5) + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Formas de escrever', linhas: [`*Com traço:* ${d.slice(0, 5)}-${d.slice(5)}`, `*Só números:* ${d}`, `*Para etiqueta:* CEP ${d.slice(0, 5)}-${d.slice(5)}`] },
                { emoji: '📍', titulo: 'Onde fica', linhas: [uf ? `Pela faixa, é ${ESTADOS_NOME[uf]} (${uf}).` : 'Esse número está fora das faixas conhecidas dos Correios.'] }
            ]
        }
    }
})

D('doc_cep_estado', {
    emoji: '🧭', titulo: 'Estado pela faixa de CEP',
    descricao: 'Mostra a faixa de CEP de cada estado',
    uso: '<sigla do estado ou CEP>',
    exemplos: [{ args: 'MG', oque: 'faixa de Minas Gerais' }, { args: '69900000', oque: 'descobre o estado pelo número' }],
    dica: 'Alguns estados têm mais de uma faixa, porque o Amazonas e Rondônia foram cortados por Roraima e Mato Grosso.',
    calcular(args) {
        const bruto = String(args[0] || '').trim().toUpperCase()
        const d = digitos(bruto)
        if (d.length === 8) {
            const uf = estadoDoCep(d)
            if (!uf) throw falha(`O CEP ${d} não cai em nenhuma faixa conhecida.`)
            const faixas = CEP_FAIXAS.filter(f => f[2] === uf)
            return {
                intro: `O CEP ${d.slice(0, 5)}-${d.slice(5)} é de ${'*' + ESTADOS_NOME[uf] + '*'}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [`*Estado:* ${ESTADOS_NOME[uf]} (${uf})`, `*Faixas desse estado:* ${faixas.length}`] },
                    { emoji: '📊', titulo: 'Faixas do estado', linhas: faixas.map(f => `• de ${String(f[0]).padStart(8, '0').slice(0, 5)}-${String(f[0]).padStart(8, '0').slice(5)} a ${String(f[1]).padStart(8, '0').slice(0, 5)}-${String(f[1]).padStart(8, '0').slice(5)}`) }
                ]
            }
        }
        const uf = bruto.slice(0, 2)
        const faixas = CEP_FAIXAS.filter(f => f[2] === uf)
        if (!faixas.length) throw falha(`Não achei "${bruto.slice(0, 10) || 'nada'}". Mande a sigla do estado (como MG) ou um CEP de 8 dígitos.`)
        return {
            intro: `${'*' + ESTADOS_NOME[uf] + '*'} usa ${faixas.length === 1 ? 'uma faixa de CEP' : faixas.length + ' faixas de CEP'}.`,
            secoes: [
                { emoji: '📊', titulo: 'Faixas', linhas: faixas.map(f => `• de ${String(f[0]).padStart(8, '0').slice(0, 5)}-${String(f[0]).padStart(8, '0').slice(5)} a ${String(f[1]).padStart(8, '0').slice(0, 5)}-${String(f[1]).padStart(8, '0').slice(5)}`) },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [`Faixas dos Correios, ${VIGENCIA_TABELAS}.`] }
            ]
        }
    }
})

D('doc_pis_validar', {
    emoji: '🧾', titulo: 'Conferir PIS ou PASEP',
    descricao: 'Confere o dígito do PIS, PASEP ou NIS',
    uso: '<número do PIS>',
    exemplos: [{ args: '120.61341.23-5', oque: 'número de manual' }, { args: '12061341234', oque: 'o mesmo com dígito errado' }],
    dica: 'PIS, PASEP e NIS usam o mesmo cálculo: pesos 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 e módulo 11.',
    calcular(args) {
        const r = validarPis(args.join(''))
        const d = digitos(args.join(''))
        return {
            intro: r.ok ? `O número ${'*' + r.formatado + '*'} passa na conferência.` : `Esse número ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Número recebido:* ${d || 'nenhum dígito'}`, `*Situação:* ${r.ok ? 'dígito correto' : 'dígito incorreto'}`, r.ok ? `*Formatado:* ${r.formatado}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🔍', titulo: 'Onde esse número aparece', linhas: ['Na carteira de trabalho, no extrato do FGTS e no cadastro de programas sociais. É o mesmo número com nomes diferentes.'] }
            ]
        }
    }
})

D('doc_pis_formatar', {
    emoji: '📝', titulo: 'Formatar PIS',
    descricao: 'Põe a pontuação certa no número do PIS',
    uso: '<11 dígitos do PIS>',
    exemplos: [{ args: '12061341235', oque: 'onze dígitos sem pontuação' }, { args: '120 61341 23 5', oque: 'com espaços' }],
    dica: 'A pontuação do PIS é três dígitos, ponto, cinco, ponto, dois, traço e o verificador.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 11) throw falha(`PIS tem 11 dígitos. Você mandou ${d.length}.`)
        const r = validarPis(d)
        return {
            intro: `Formatado: ${'*' + d.slice(0, 3) + '.' + d.slice(3, 8) + '.' + d.slice(8, 10) + '-' + d.slice(10) + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Formas de escrever', linhas: [`*Com pontuação:* ${d.slice(0, 3)}.${d.slice(3, 8)}.${d.slice(8, 10)}-${d.slice(10)}`, `*Só números:* ${d}`, `*Com espaço:* ${d.slice(0, 3)} ${d.slice(3, 8)} ${d.slice(8, 10)} ${d.slice(10)}`] },
                { emoji: '🔎', titulo: 'Conferência', linhas: [r.ok ? 'O dígito verificador bate.' : `Atenção: ${r.motivo}`] }
            ]
        }
    }
})

D('doc_titulo_validar', {
    emoji: '🗳️', titulo: 'Conferir título de eleitor',
    descricao: 'Confere os dígitos do título de eleitor',
    uso: '<número do título>',
    exemplos: [{ args: '1234 5678 0191', oque: 'número de exemplo de São Paulo' }, { args: '876543210221', oque: 'exemplo de Minas Gerais' }],
    dica: 'O título tem 12 dígitos: 8 de sequência, 2 do estado e 2 verificadores.',
    calcular(args) {
        const r = validarTitulo(args.join(''))
        const d = digitos(args.join(''))
        return {
            intro: r.ok ? `O título ${'*' + r.formatado + '*'} passa na conferência.` : `Esse número ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Número recebido:* ${d || 'nenhum dígito'}`, `*Situação:* ${r.ok ? 'dígitos corretos' : 'dígitos incorretos'}`, r.ok ? `*Estado de emissão:* ${r.uf}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🧩', titulo: 'As partes do número', linhas: d.length === 12 ? [`*Sequência:* ${d.slice(0, 8)}`, `*Código do estado:* ${d.slice(8, 10)}`, `*Verificadores:* ${d.slice(10)}`] : ['Mande os 12 dígitos para eu separar as partes.'] },
                { emoji: '🔍', titulo: 'O que a conta não vê', linhas: ['Dígito certo não quer dizer título regular. Situação eleitoral só no site do Tribunal Superior Eleitoral.'] }
            ]
        }
    }
})

D('doc_titulo_uf', {
    emoji: '🏛️', titulo: 'Estado do título de eleitor',
    descricao: 'Diz o estado que emitiu o título de eleitor',
    uso: '<número do título ou código de 01 a 28>',
    exemplos: [{ args: '123456780191', oque: 'descobre o estado pelo número' }, { args: '06', oque: 'o que é o código 06' }],
    dica: 'O código do estado fica na nona e décima casa, e vai de 01 (São Paulo) a 28 (exterior).',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length === 12) {
            const r = validarTitulo(d)
            const uf = TITULO_UF[d.slice(8, 10)]
            if (!uf) throw falha(`O código "${d.slice(8, 10)}" não corresponde a estado nenhum.`)
            return {
                intro: `Esse título foi emitido em ${'*' + uf + '*'}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [`*Código do estado:* ${d.slice(8, 10)}`, `*Estado:* ${uf}${ESTADOS_NOME[uf] ? ' (' + ESTADOS_NOME[uf] + ')' : ''}`, `*Conferência dos dígitos:* ${r.ok ? 'batem' : 'não batem'}`] },
                    { emoji: '📊', titulo: 'Códigos vizinhos', linhas: Object.entries(TITULO_UF).slice(Math.max(0, Number(d.slice(8, 10)) - 3), Number(d.slice(8, 10)) + 2).map(([c, u]) => `• ${c}: ${u}`) }
                ]
            }
        }
        const cod = d.padStart(2, '0')
        const uf = TITULO_UF[cod]
        if (!uf) throw falha(`Não conheço o código "${cod}". Ele vai de 01 a 28, ou mande o título completo com 12 dígitos.`)
        return {
            intro: `O código ${'*' + cod + '*'} é de ${'*' + uf + '*'}.`,
            secoes: [
                { emoji: '📊', titulo: 'Tabela de códigos', linhas: Object.entries(TITULO_UF).map(([c, u]) => `• ${c}: ${u}`) }
            ]
        }
    }
})

D('doc_renavam_validar', {
    emoji: '🚙', titulo: 'Conferir RENAVAM',
    descricao: 'Confere o dígito verificador do RENAVAM',
    uso: '<número do RENAVAM>',
    exemplos: [{ args: '12345678900', oque: 'número de exemplo' }, { args: '12345678901', oque: 'o mesmo com dígito errado' }],
    dica: 'RENAVAM tem 11 dígitos. Número antigo com 9 dígitos entra completado com zeros à esquerda.',
    calcular(args) {
        const r = validarRenavam(args.join(''))
        const d = digitos(args.join(''))
        return {
            intro: r.ok ? `O RENAVAM ${'*' + r.digitos + '*'} passa na conferência.` : `Esse número ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Número recebido:* ${d || 'nenhum dígito'}`, `*Com 11 dígitos:* ${d ? d.padStart(11, '0') : '—'}`, `*Situação:* ${r.ok ? 'dígito correto' : 'dígito incorreto'}`, r.ok ? `*Formatado:* ${r.formatado}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🔍', titulo: 'Onde encontrar', linhas: ['O RENAVAM vem no documento do veículo e é ele, não a placa, que identifica o carro no sistema nacional.'] }
            ]
        }
    }
})

D('doc_renavam_formatar', {
    emoji: '📋', titulo: 'Formatar RENAVAM',
    descricao: 'Completa e pontua um número de RENAVAM',
    uso: '<número do RENAVAM>',
    exemplos: [{ args: '123456789', oque: 'número antigo de nove dígitos' }, { args: '12345678900', oque: 'número atual completo' }],
    dica: 'RENAVAM antigo tinha 9 dígitos. Ele continua valendo, completado com zeros à esquerda.',
    calcular(args) {
        const bruto = digitos(args.join(''))
        if (!bruto) throw falha('Digite o número do RENAVAM.')
        if (bruto.length > 11) throw falha(`RENAVAM tem no máximo 11 dígitos. Você mandou ${bruto.length}.`)
        const d = bruto.padStart(11, '0')
        const r = validarRenavam(d)
        return {
            intro: `Formatado: ${'*' + d.slice(0, 5) + '.' + d.slice(5, 10) + '-' + d.slice(10) + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Formas de escrever', linhas: [`*Com 11 dígitos:* ${d}`, `*Com pontuação:* ${d.slice(0, 5)}.${d.slice(5, 10)}-${d.slice(10)}`, `*Como você digitou:* ${bruto}`] },
                { emoji: '🔎', titulo: 'Conferência', linhas: [r.ok ? 'O dígito verificador bate.' : `Atenção: ${r.motivo}`] }
            ]
        }
    }
})

D('doc_placa_validar', {
    emoji: '🚘', titulo: 'Conferir placa de veículo',
    descricao: 'Confere se a placa segue um padrão válido',
    uso: '<placa>',
    exemplos: [{ args: 'ABC1D23', oque: 'placa no padrão Mercosul' }, { args: 'ABC-1234', oque: 'placa no padrão antigo' }],
    dica: 'Placa não tem dígito verificador: o que dá para conferir é o formato das letras e dos números.',
    calcular(args) {
        const r = lerPlaca(args.join(''))
        const bruto = String(args.join('')).toUpperCase().replace(/[^A-Z0-9]/g, '')
        if (!r.ok) {
            return {
                intro: `A placa ${'*não está em um padrão válido*'}.`,
                secoes: [
                    { emoji: '❌', titulo: 'Resultado', linhas: [`*Recebido:* ${bruto || 'nada'}`, `*Motivo:* ${r.motivo}`] },
                    { emoji: '📋', titulo: 'Os dois padrões aceitos', linhas: ['• Antigo: três letras e quatro números, como ABC1234', '• Mercosul: três letras, número, letra e dois números, como ABC1D23'] }
                ]
            }
        }
        return {
            intro: `A placa ${'*' + r.formatado + '*'} está no padrão ${r.padrao}.`,
            secoes: [
                { emoji: '✅', titulo: 'Resultado', linhas: [`*Placa:* ${r.formatado}`, `*Padrão:* ${r.padrao}`, `*Letras:* ${r.texto.slice(0, 3)}`, `*Parte numérica:* ${r.texto.slice(3)}`] },
                { emoji: '🔍', titulo: 'O que a conferência não vê', linhas: ['Formato certo não diz se o veículo existe, se tem multa ou se está em dia. Isso só na consulta do Detran.'] }
            ]
        }
    }
})

D('doc_placa_padrao', {
    emoji: '🔤', titulo: 'Placa antiga e Mercosul',
    descricao: 'Converte a placa entre o padrão antigo e o novo',
    uso: '<placa>',
    exemplos: [{ args: 'ABC1234', oque: 'vê como ficaria no Mercosul' }, { args: 'ABC1D23', oque: 'vê de onde ela veio' }],
    dica: 'Na conversão, o segundo número vira letra pela ordem: 0 vira A, 1 vira B, 2 vira C, e assim por diante.',
    calcular(args) {
        const r = lerPlaca(args.join(''))
        if (!r.ok) throw falha(r.motivo)
        const LETRAS = 'ABCDEFGHIJ'
        if (r.padrao === 'antigo') {
            const t = r.texto
            const nova = t.slice(0, 4) + LETRAS[Number(t[4])] + t.slice(5)
            return {
                intro: `A placa ${'*' + r.formatado + '*'} vira ${'*' + nova + '*'} no padrão Mercosul.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [`*Padrão antigo:* ${r.formatado}`, `*Padrão Mercosul:* ${nova}`, `*Letra que entrou:* ${LETRAS[Number(t[4])]} (veio do número ${t[4]})`] },
                    { emoji: '🧩', titulo: 'A regra da troca', linhas: ['Só o quinto caractere muda: o número vira letra na ordem do alfabeto, de 0 para A até 9 para J. O resto fica igual.'] }
                ]
            }
        }
        const t = r.texto
        const idx = LETRAS.indexOf(t[4])
        const antiga = t.slice(0, 4) + (idx >= 0 ? idx : '?') + t.slice(5)
        return {
            intro: `A placa ${'*' + t + '*'} veio de ${'*' + antiga.slice(0, 3) + '-' + antiga.slice(3) + '*'} no padrão antigo.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Padrão Mercosul:* ${t}`, `*Equivalente antigo:* ${antiga.slice(0, 3)}-${antiga.slice(3)}`, `*Número que a letra ${t[4]} representa:* ${idx >= 0 ? idx : 'letra fora da faixa de A a J'}`] },
                { emoji: '💡', titulo: 'Detalhe', linhas: ['Placa Mercosul emitida do zero pode ter letra fora da faixa de A a J: nesse caso não existe equivalente antigo.'] }
            ]
        }
    }
})

D('doc_placa_uf', {
    emoji: '📍', titulo: 'Estado da placa antiga',
    descricao: 'Descobre o estado pela faixa de letras da placa',
    uso: '<placa antiga>',
    exemplos: [{ args: 'HAA1234', oque: 'faixa de Minas Gerais' }, { args: 'KMF5678', oque: 'faixa de Santa Catarina' }],
    dica: 'Vale só para placa do padrão antigo: a Mercosul não guarda mais o estado nas letras.',
    calcular(args) {
        const r = lerPlaca(args.join(''))
        if (!r.ok) throw falha(r.motivo)
        const letras = r.texto.slice(0, 3)
        const uf = estadoDaPlaca(letras)
        return {
            intro: uf ? `A faixa ${'*' + letras + '*'} é de ${'*' + ESTADOS_NOME[uf] + '*'}.` : `Não achei a faixa ${letras} na tabela de estados.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Placa:* ${r.formatado}`, `*Letras:* ${letras}`, `*Estado provável:* ${uf ? `${ESTADOS_NOME[uf]} (${uf})` : 'fora da tabela'}`, `*Padrão:* ${r.padrao}`] },
                { emoji: '⚠️', titulo: 'Limite dessa leitura', linhas: ['A faixa mostra onde a placa foi emitida pela primeira vez, não onde o carro está hoje.', 'Placa Mercosul não segue mais faixa por estado: nela essa leitura não vale.'] }
            ]
        }
    }
})

D('doc_cartao_validar', {
    emoji: '💳', titulo: 'Conferir número de cartão',
    descricao: 'Confere um número de cartão pelo teste de Luhn',
    uso: '<número do cartão>',
    exemplos: [{ args: '4111 1111 1111 1111', oque: 'número de teste de loja virtual' }, { args: '4111111111111112', oque: 'o mesmo com um dígito trocado' }],
    dica: 'Nunca mande o número do seu cartão de verdade em grupo. Esse teste existe para pegar erro de digitação.',
    calcular(args) {
        const bruto = args.join('')
        const r = luhn(bruto)
        const d = digitos(bruto)
        return {
            intro: r.ok ? `O número ${'*passa no teste de Luhn*'}.` : `O número ${'*não passa no teste de Luhn*'}.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Dígitos:* ${d.length}`, `*Situação:* ${r.ok ? 'soma fecha em múltiplo de 10' : 'soma não fecha'}`, r.ok ? `*Bandeira provável:* ${bandeiraCartao(d)}` : `*Motivo:* ${r.motivo}`, `*Final:* ${d.slice(-4) || '—'}`] },
                { emoji: '🧮', titulo: 'Como o teste funciona', linhas: ['Dobra um dígito sim, um não, da direita para a esquerda; quando passa de 9, subtrai 9. A soma de tudo precisa terminar em zero.'] },
                { emoji: '🔒', titulo: 'O que isso não faz', linhas: ['Passar no teste não quer dizer que o cartão existe, tem saldo ou está ativo. Só que a sequência é coerente.'] }
            ]
        }
    }
})

D('doc_cartao_bandeira', {
    emoji: '🏳️', titulo: 'Bandeira do cartão',
    descricao: 'Identifica a bandeira pelos primeiros dígitos',
    uso: '<número ou primeiros dígitos do cartão>',
    exemplos: [{ args: '4111111111111111', oque: 'começa com 4' }, { args: '5412', oque: 'só o começo do número' }],
    dica: 'A bandeira está nos primeiros dígitos: 4 é Visa, 51 a 55 é Mastercard, 34 e 37 é American Express.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length < 4) throw falha(`Preciso de pelo menos 4 dígitos para identificar a bandeira. Você mandou ${d.length}.`)
        const band = bandeiraCartao(d)
        const tamanhos = { Visa: '13, 16 ou 19', Mastercard: '16', 'American Express': '15', 'Diners Club': '14', Discover: '16', Hipercard: '16 ou 19', Elo: '16' }
        return {
            intro: `Esse número parece ser da bandeira ${'*' + band + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Início do número:* ${d.slice(0, 6)}`, `*Bandeira:* ${band}`, `*Tamanho esperado:* ${tamanhos[band] || 'varia'} dígitos`, `*Dígitos informados:* ${d.length}`] },
                { emoji: '📊', titulo: 'Como cada bandeira começa', linhas: ['• Visa: 4', '• Mastercard: 51 a 55, ou 2221 a 2720', '• American Express: 34 ou 37', '• Elo, Hipercard e Diners: faixas próprias'] },
                { emoji: '🔒', titulo: 'Segurança', linhas: ['Para descobrir a bandeira bastam os 6 primeiros dígitos. Não precisa mandar o número inteiro para ninguém.'] }
            ]
        }
    }
})

D('doc_cartao_mascarar', {
    emoji: '🎭', titulo: 'Esconder o número do cartão',
    descricao: 'Mostra só o final do cartão, como na fatura',
    uso: '<número do cartão>',
    exemplos: [{ args: '4111111111111111', oque: 'deixa só os quatro últimos' }, { args: '5412 7512 3412 3456', oque: 'com espaços' }],
    dica: 'Fatura e comprovante mostram só os quatro últimos dígitos. É o único formato que deve circular.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length < 12) throw falha(`Cartão tem de 13 a 19 dígitos. Você mandou ${d.length}.`)
        const fim = d.slice(-4)
        return {
            intro: `Versão para mostrar: ${'*' + '•••• •••• •••• ' + fim + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Formas de esconder', linhas: [`*Padrão de fatura:* •••• •••• •••• ${fim}`, `*Com início e fim:* ${d.slice(0, 4)} •••• •••• ${fim}`, `*Só o final:* final ${fim}`] },
                { emoji: '🏳️', titulo: 'De quebra', linhas: [`*Bandeira provável:* ${bandeiraCartao(d)}`, `*Teste de Luhn:* ${luhn(d).ok ? 'passa' : 'não passa'}`] },
                { emoji: '🔒', titulo: 'Nunca mande junto', linhas: ['Número completo, validade e código de três dígitos juntos permitem compra. Separados, não.'] }
            ]
        }
    }
})

D('doc_cartao_validade', {
    emoji: '📆', titulo: 'Validade do cartão',
    descricao: 'Confere se a validade do cartão já passou',
    uso: '<mês/ano, ex 08/27>',
    exemplos: [{ args: '08/27', oque: 'agosto de 2027' }, { args: '12/2024', oque: 'validade já vencida' }],
    dica: 'O cartão vale até o último dia do mês impresso: 08/27 funciona até 31 de agosto de 2027.',
    calcular(args) {
        const s = args.join('').replace(/\s/g, '')
        const m = s.match(/^(\d{1,2})[/\-.]?(\d{2}|\d{4})$/)
        if (!m) throw falha(`Não entendi "${s.slice(0, 10) || 'nada'}" como validade. Escreva assim: 08/27.`)
        const mes = Number(m[1])
        let ano = Number(m[2])
        if (ano < 100) ano += 2000
        if (mes < 1 || mes > 12) throw falha(`O mês ${mes} não existe. Ele vai de 1 a 12.`)
        const ultimoDia = new Date(Date.UTC(ano, mes, 0))
        const h = hoje()
        const dias = diasEntre(h, ultimoDia)
        return {
            intro: dias >= 0
                ? `Esse cartão vale até ${'*' + fmtData(ultimoDia) + '*'}, faltam ${fmt(dias, 0)} dias.`
                : `Esse cartão ${'*venceu*'} em ${fmtData(ultimoDia)}, há ${fmt(-dias, 0)} dias.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Validade informada:* ${String(mes).padStart(2, '0')}/${ano}`, `*Último dia de uso:* ${fmtData(ultimoDia)}`, `*Situação:* ${dias >= 0 ? 'dentro da validade' : 'vencido'}`, `*Dias ${dias >= 0 ? 'restantes' : 'desde o vencimento'}:* ${fmt(Math.abs(dias), 0)}`] },
                { emoji: '📅', titulo: 'Planejamento', linhas: dias >= 0 ? [`Peça a renovação cerca de 30 dias antes, ou seja a partir de ${fmtData(somaDias(ultimoDia, -30))}.`, `*Meses restantes:* ${fmt(dias / 30.44, 1)}`] : ['Cartão vencido continua com a conta ativa: peça a segunda via no aplicativo do banco.'] }
            ]
        }
    }
})

D('doc_boleto_validar', {
    emoji: '🧾', titulo: 'Conferir linha digitável do boleto',
    descricao: 'Confere os dígitos da linha digitável do boleto',
    uso: '<linha digitável com 47 dígitos>',
    exemplos: [{ args: '34191234546789012345767890123457910000000125050', oque: 'boleto de exemplo' }, { args: '34191234546789012345767890123457910000000125051', oque: 'com um dígito trocado' }],
    dica: 'Boleto de banco tem 47 dígitos. Conta de luz, água e telefone tem 48 e é outro comando.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 47) throw falha(`A linha digitável de boleto bancário tem 47 dígitos. Você mandou ${d.length}.${d.length === 48 ? ' Com 48 dígitos é conta de consumo: use o comando de conta de concessionária.' : ''}`)
        const c1 = d.slice(0, 9), dv1 = Number(d[9])
        const c2 = d.slice(10, 20), dv2 = Number(d[20])
        const c3 = d.slice(21, 31), dv3 = Number(d[31])
        const dvGeral = Number(d[32])
        const campo5 = d.slice(33)
        const ok1 = mod10Bloco(c1) === dv1
        const ok2 = mod10Bloco(c2) === dv2
        const ok3 = mod10Bloco(c3) === dv3
        const barra = d.slice(0, 4) + d[32] + campo5 + d.slice(4, 9) + c2 + c3
        const dvBarra = mod11Girando(barra.slice(0, 4) + barra.slice(5), { zeroVira: 1 })
        const okGeral = dvBarra === dvGeral
        const tudo = ok1 && ok2 && ok3 && okGeral
        return {
            intro: tudo ? `A linha digitável ${'*passa em todas as conferências*'}.` : `A linha digitável ${'*tem dígito que não fecha*'}.`,
            secoes: [
                { emoji: tudo ? '✅' : '❌', titulo: 'Campo por campo', linhas: [`*Campo 1:* ${ok1 ? 'confere' : `não confere (deveria terminar em ${mod10Bloco(c1)})`}`, `*Campo 2:* ${ok2 ? 'confere' : `não confere (deveria terminar em ${mod10Bloco(c2)})`}`, `*Campo 3:* ${ok3 ? 'confere' : `não confere (deveria terminar em ${mod10Bloco(c3)})`}`, `*Dígito geral:* ${okGeral ? 'confere' : `não confere (deveria ser ${dvBarra})`}`] },
                { emoji: '🏦', titulo: 'O que dá para ler', linhas: [`*Banco:* ${d.slice(0, 3)}`, `*Moeda:* ${d[3]} (9 é real)`, `*Valor:* ${moeda(Number(campo5.slice(4)) / 100)}`, `*Fator de vencimento:* ${campo5.slice(0, 4)}`] },
                { emoji: '⚠️', titulo: 'Antes de pagar', linhas: ['Dígito certo não garante boleto legítimo. Confira sempre o beneficiário na tela do banco antes de confirmar o pagamento.'] }
            ]
        }
    }
})

D('doc_boleto_valor', {
    emoji: '💵', titulo: 'Valor e vencimento do boleto',
    descricao: 'Lê valor e vencimento na linha do boleto',
    uso: '<linha digitável com 47 dígitos>',
    exemplos: [{ args: '34191234546789012345767890123457910000000125050', oque: 'lê valor e data' }, { args: '00190500954014481606906809350314337370000000100', oque: 'outro boleto' }],
    dica: 'O vencimento vem como fator: número de dias desde 7 de outubro de 1997.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 47) throw falha(`A linha digitável tem 47 dígitos. Você mandou ${d.length}.`)
        const fator = Number(d.slice(33, 37))
        const centavos = Number(d.slice(37))
        const base = new Date(Date.UTC(1997, 9, 7))
        const vencimento = fator === 0 ? null : somaDias(base, fator < 1000 ? fator + 9000 : fator)
        const h = hoje()
        return {
            intro: `Esse boleto é de ${'*' + moeda(centavos / 100) + '*'}${vencimento ? `, com vencimento em ${fmtData(vencimento)}` : ' e sem data de vencimento'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Valor:* ${moeda(centavos / 100)}`, `*Fator de vencimento:* ${fator}`, `*Vencimento:* ${vencimento ? fmtData(vencimento) : 'boleto sem vencimento definido'}`, vencimento ? `*Situação:* ${diasEntre(h, vencimento) >= 0 ? `faltam ${diasEntre(h, vencimento)} dia(s)` : `vencido há ${-diasEntre(h, vencimento)} dia(s)`}` : '*Situação:* não dá para dizer sem a data'] },
                { emoji: '🧮', titulo: 'Como o fator funciona', linhas: ['O fator conta os dias desde 7 de outubro de 1997. Quando chegou a 9999, a contagem voltou para 1000: por isso fator baixo é data recente.'] },
                { emoji: '🏦', titulo: 'Origem', linhas: [`*Banco emissor:* ${d.slice(0, 3)}`, `*Moeda:* ${d[3]} (9 é real)`] }
            ]
        }
    }
})

D('doc_boleto_banco', {
    emoji: '🏦', titulo: 'Banco que emitiu o boleto',
    descricao: 'Diz qual banco emitiu o boleto pelo código',
    uso: '<linha digitável ou código de 3 dígitos>',
    exemplos: [{ args: '341', oque: 'código de três dígitos' }, { args: '34191234546789012345767890123457910000000125050', oque: 'linha inteira' }],
    dica: 'Os três primeiros dígitos do boleto são o código do banco no sistema financeiro.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (!d) throw falha('Digite o código do banco ou a linha digitável.')
        const cod = d.slice(0, 3).padStart(3, '0')
        const BANCOS = {
            '001': 'Banco do Brasil', '033': 'Santander', '104': 'Caixa Econômica Federal',
            '237': 'Bradesco', '341': 'Itaú Unibanco', '356': 'Banco Real', '389': 'Banco Mercantil',
            '399': 'HSBC', '422': 'Safra', '453': 'Banco Rural', '633': 'Rendimento',
            '652': 'Itaú Unibanco Holding', '745': 'Citibank', '748': 'Sicredi', '756': 'Sicoob',
            '077': 'Banco Inter', '212': 'Banco Original', '260': 'Nu Pagamentos', '336': 'C6 Bank',
            '655': 'Votorantim', '070': 'BRB', '021': 'Banestes', '041': 'Banrisul'
        }
        const nome = BANCOS[cod]
        return {
            intro: nome ? `O boleto é do ${'*' + nome + '*'} (código ${cod}).` : `Não tenho o código ${cod} na minha lista de bancos.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Código:* ${cod}`, `*Banco:* ${nome || 'não está na lista'}`, d.length === 47 ? `*Valor do boleto:* ${moeda(Number(d.slice(37)) / 100)}` : '*Linha completa:* mande os 47 dígitos para eu ler o valor também'] },
                { emoji: '📊', titulo: 'Os códigos mais vistos', linhas: ['• 001: Banco do Brasil', '• 033: Santander', '• 104: Caixa', '• 237: Bradesco', '• 341: Itaú', '• 260: Nubank'] },
                { emoji: '📅', titulo: 'De quando é a lista', linhas: [`Códigos conferidos em setembro de 2026. Banco novo entra na lista da Febraban antes de aparecer aqui.`] }
            ]
        }
    }
})

D('doc_arrecadacao_validar', {
    emoji: '💡', titulo: 'Conferir conta de consumo',
    descricao: 'Confere o código de conta de luz, água ou tributo',
    uso: '<código com 48 dígitos>',
    exemplos: [{ args: '826200000014255012341236456789012345567890123456', oque: 'conta de exemplo' }, { args: '826200000014255012341236456789012345567890123457', oque: 'com dígito trocado' }],
    dica: 'Conta de concessionária e tributo tem 48 dígitos e começa com 8. Boleto de banco tem 47.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 48) throw falha(`Código de arrecadação tem 48 dígitos. Você mandou ${d.length}.${d.length === 47 ? ' Com 47 é boleto bancário: use o comando de boleto.' : ''}`)
        if (d[0] !== '8') throw falha(`Código de arrecadação começa com 8. O seu começa com ${d[0]}.`)
        const SEGMENTOS = { 1: 'prefeitura', 2: 'saneamento', 3: 'energia elétrica e gás', 4: 'telecomunicações', 5: 'órgão do governo', 6: 'carnê ou assemelhado', 7: 'multa de trânsito', 9: 'uso exclusivo do banco' }
        const segmento = Number(d[1])
        const blocos = [d.slice(0, 12), d.slice(12, 24), d.slice(24, 36), d.slice(36, 48)]
        const conferidos = blocos.map(b => mod10Bloco(b.slice(0, 11)) === Number(b[11]))
        const tudo = conferidos.every(Boolean)
        const barra = blocos.map(b => b.slice(0, 11)).join('')
        const valor = Number(barra.slice(4, 15)) / 100
        return {
            intro: tudo ? `O código ${'*passa nas quatro conferências*'}.` : `O código ${'*tem bloco que não fecha*'}.`,
            secoes: [
                { emoji: tudo ? '✅' : '❌', titulo: 'Bloco por bloco', linhas: conferidos.map((c, i) => `*Bloco ${i + 1}:* ${c ? 'confere' : `não confere (deveria terminar em ${mod10Bloco(blocos[i].slice(0, 11))})`}`) },
                { emoji: '🧩', titulo: 'O que dá para ler', linhas: [`*Segmento:* ${segmento} — ${SEGMENTOS[segmento] || 'não identificado'}`, `*Valor:* ${moeda(valor)}`, `*Tipo de conferência:* ${'67'.includes(d[2]) ? 'módulo 10' : 'módulo 11'}`, `*Identificação da empresa:* ${barra.slice(15, 19)}`] },
                { emoji: '⚠️', titulo: 'Antes de pagar', linhas: ['Conta de consumo com código válido ainda pode ser golpe. Confira o nome do beneficiário na tela do banco.'] }
            ]
        }
    }
})

D('doc_telefone_validar', {
    emoji: '📱', titulo: 'Conferir telefone brasileiro',
    descricao: 'Confere DDD, tamanho e tipo de um telefone',
    uso: '<número com DDD>',
    exemplos: [{ args: '11 98765-4321', oque: 'celular de São Paulo' }, { args: '3132123456', oque: 'fixo de Belo Horizonte' }],
    dica: 'Celular tem 9 dígitos e começa com 9. Fixo tem 8 e começa com 2, 3, 4 ou 5.',
    calcular(args) {
        const r = lerTelefone(args.join(''))
        if (!r.ok) {
            return {
                intro: `Esse número ${'*não passa na conferência*'}.`,
                secoes: [
                    { emoji: '❌', titulo: 'Resultado', linhas: [`*Recebido:* ${digitos(args.join('')) || 'nada'}`, `*Motivo:* ${r.motivo}`] },
                    { emoji: '📋', titulo: 'O formato certo', linhas: ['• Celular: DDD mais 9 dígitos começando com 9', '• Fixo: DDD mais 8 dígitos começando com 2, 3, 4 ou 5'] }
                ]
            }
        }
        return {
            intro: `O número ${'*' + r.formatado + '*'} é um ${r.tipo} de ${r.local[1]}.`,
            secoes: [
                { emoji: '✅', titulo: 'Resultado', linhas: [`*Formatado:* ${r.formatado}`, `*Tipo:* ${r.tipo}`, `*DDD:* ${r.ddd} — ${r.local[1]} (${r.local[0]})`, `*Com código do país:* ${r.internacional}`] },
                { emoji: '🔍', titulo: 'O que a conferência não vê', linhas: ['Formato certo não diz se a linha existe ou está ativa. E o DDD é o de origem do número, não o de onde a pessoa está agora.'] }
            ]
        }
    }
})

D('doc_telefone_formatar', {
    emoji: '☎️', titulo: 'Formatar telefone',
    descricao: 'Escreve o telefone em vários formatos usuais',
    uso: '<número com DDD>',
    exemplos: [{ args: '11987654321', oque: 'onze dígitos sem pontuação' }, { args: '+55 31 3212-3456', oque: 'com código do país' }],
    dica: 'O formato internacional, com mais cinquenta e cinco na frente, é o que o WhatsApp usa.',
    calcular(args) {
        const r = lerTelefone(args.join(''))
        if (!r.ok) throw falha(r.motivo)
        return {
            intro: `Formatado: ${'*' + r.formatado + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Formas de escrever', linhas: [`*Brasileiro:* ${r.formatado}`, `*Só números:* ${r.digitos}`, `*Internacional:* ${r.internacional}`, `*Para link:* wa.me/55${r.digitos}`] },
                { emoji: '📍', titulo: 'De onde é', linhas: [`*DDD ${r.ddd}:* ${r.local[1]}, ${ESTADOS_NOME[r.local[0]] || r.local[0]}`, `*Tipo:* ${r.tipo}`] }
            ]
        }
    }
})

D('doc_ddd_cidade', {
    emoji: '📞', titulo: 'Cidade e estado de um DDD',
    descricao: 'Diz a cidade e o estado de um código de área',
    uso: '<DDD>',
    exemplos: [{ args: '35', oque: 'DDD do sul de Minas' }, { args: '71', oque: 'DDD de Salvador' }],
    dica: 'O DDD cobre uma região inteira, não só a cidade principal que aparece aqui.',
    calcular(args) {
        const d = digitos(args.join(''))
        const ddd = Number(d.slice(0, 2))
        const info = DDDS[ddd]
        if (!info) throw falha(`O DDD ${d.slice(0, 2) || 'informado'} não existe na lista da Anatel. Os códigos vão de 11 a 99, com faltas no meio.`)
        const irmaos = Object.entries(DDDS).filter(([, v]) => v[0] === info[0]).map(([k, v]) => `• ${k}: ${v[1]}`)
        return {
            intro: `O DDD ${'*' + ddd + '*'} é de ${'*' + info[1] + '*'}, em ${ESTADOS_NOME[info[0]]}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*DDD:* ${ddd}`, `*Cidade principal:* ${info[1]}`, `*Estado:* ${ESTADOS_NOME[info[0]]} (${info[0]})`, `*Outros DDDs do estado:* ${irmaos.length}`] },
                { emoji: '📊', titulo: `DDDs de ${ESTADOS_NOME[info[0]]}`, linhas: irmaos },
                { emoji: '📅', titulo: 'De quando é a lista', linhas: [`Lista da Anatel, ${VIGENCIA_TABELAS}.`] }
            ]
        }
    }
})

D('doc_uf_ddds', {
    emoji: '🗺️', titulo: 'DDDs de um estado',
    descricao: 'Lista todos os códigos de área de um estado',
    uso: '<sigla do estado>',
    exemplos: [{ args: 'MG', oque: 'todos os DDDs de Minas' }, { args: 'SP', oque: 'todos os de São Paulo' }],
    dica: 'São Paulo tem nove códigos, e estados pequenos como Sergipe e Alagoas têm um só.',
    calcular(args) {
        const uf = String(args[0] || '').trim().toUpperCase().slice(0, 2)
        if (!ESTADOS_NOME[uf]) throw falha(`Não conheço a sigla "${uf || 'vazia'}". Use duas letras, como MG, SP ou BA.`)
        const lista = Object.entries(DDDS).filter(([, v]) => v[0] === uf)
        return {
            intro: `${'*' + ESTADOS_NOME[uf] + '*'} tem ${'*' + lista.length + ' DDD(s)*'}.`,
            secoes: [
                { emoji: '📊', titulo: 'Códigos e cidades', linhas: lista.map(([k, v]) => `• ${k}: ${v[1]}`) },
                { emoji: '🎯', titulo: 'Resumo', linhas: [`*Estado:* ${ESTADOS_NOME[uf]} (${uf})`, `*Quantidade de códigos:* ${lista.length}`, `*Menor código:* ${lista[0] ? lista[0][0] : '—'}`, `*Maior código:* ${lista.length ? lista[lista.length - 1][0] : '—'}`] },
                { emoji: '📅', titulo: 'De quando é a lista', linhas: [`Lista da Anatel, ${VIGENCIA_TABELAS}.`] }
            ]
        }
    }
})

D('doc_email_validar', {
    emoji: '📧', titulo: 'Conferir endereço de e-mail',
    descricao: 'Confere se um endereço de e-mail está bem escrito',
    uso: '<endereço de e-mail>',
    exemplos: [{ args: 'contato@exemplo.com.br', oque: 'endereço bem formado' }, { args: 'contato@@exemplo', oque: 'endereço com erro' }],
    dica: 'Eu confiro a escrita. Saber se a caixa existe mesmo só mandando uma mensagem para ela.',
    calcular(args) {
        const r = lerEmail(args.join(' '))
        if (!r.ok) {
            return {
                intro: `Esse endereço ${'*está mal escrito*'}.`,
                secoes: [
                    { emoji: '❌', titulo: 'Resultado', linhas: [`*Recebido:* ${String(args.join(' ')).slice(0, 60)}`, `*Motivo:* ${r.motivo}`] },
                    { emoji: '📋', titulo: 'A forma certa', linhas: ['nome@dominio.com — sem espaço, com um arroba só e com ponto no domínio.'] }
                ]
            }
        }
        return {
            intro: `O endereço ${'*' + r.endereco + '*'} está bem escrito.`,
            secoes: [
                { emoji: '✅', titulo: 'Resultado', linhas: [`*Antes do arroba:* ${r.usuario}`, `*Domínio:* ${r.dominio}`, `*Terminação:* ${r.extensao}`, `*Tamanho total:* ${r.endereco.length} caracteres`] },
                { emoji: '🔍', titulo: 'O que eu não consigo ver', linhas: ['Se a caixa existe, se está cheia ou se aceita mensagem. Escrita certa é só o primeiro passo.'] }
            ]
        }
    }
})

D('doc_email_provedor', {
    emoji: '🌐', titulo: 'Provedor do e-mail',
    descricao: 'Identifica o provedor e o tipo de domínio',
    uso: '<endereço de e-mail>',
    exemplos: [{ args: 'pessoa@gmail.com', oque: 'provedor conhecido' }, { args: 'contato@prefeitura.sp.gov.br', oque: 'domínio de governo' }],
    dica: 'Terminação .gov.br, .jus.br e .mil.br só existe em órgão oficial: serve para farejar golpe.',
    calcular(args) {
        const r = lerEmail(args.join(' '))
        if (!r.ok) throw falha(r.motivo)
        const CONHECIDOS = { 'gmail.com': 'Google', 'outlook.com': 'Microsoft', 'hotmail.com': 'Microsoft', 'live.com': 'Microsoft', 'yahoo.com': 'Yahoo', 'yahoo.com.br': 'Yahoo', 'icloud.com': 'Apple', 'bol.com.br': 'UOL', 'uol.com.br': 'UOL', 'terra.com.br': 'Terra', 'proton.me': 'Proton' }
        const provedor = CONHECIDOS[r.dominio] || 'domínio próprio ou provedor fora da lista'
        const tipo = r.dominio.endsWith('.gov.br') ? 'órgão de governo' : r.dominio.endsWith('.edu.br') ? 'instituição de ensino' : r.dominio.endsWith('.org.br') || r.dominio.endsWith('.org') ? 'organização' : r.dominio.endsWith('.jus.br') ? 'Poder Judiciário' : r.dominio.endsWith('.mil.br') ? 'Forças Armadas' : CONHECIDOS[r.dominio] ? 'caixa pessoal de provedor grande' : 'domínio comum'
        return {
            intro: `O domínio ${'*' + r.dominio + '*'} é ${'*' + tipo + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Domínio:* ${r.dominio}`, `*Provedor:* ${provedor}`, `*Tipo de domínio:* ${tipo}`, `*Terminação:* ${r.extensao}`] },
                { emoji: '🕵️', titulo: 'Para desconfiar de golpe', linhas: ['Banco não manda mensagem de conta no Gmail nem no Hotmail.', 'Olhe letra por letra: trocar o l pelo 1 ou somar um hífen é o truque mais usado em domínio falso.'] }
            ]
        }
    }
})

D('doc_cnh_validar', {
    emoji: '🚗', titulo: 'Conferir número de CNH',
    descricao: 'Confere os dois dígitos do número da CNH',
    uso: '<número de registro da CNH>',
    exemplos: [{ args: '02345678929', oque: 'número de exemplo' }, { args: '02345678928', oque: 'com dígito trocado' }],
    dica: 'O número de registro tem 11 dígitos e fica no campo de registro da carteira, não é o número do Renach.',
    calcular(args) {
        const r = validarCnh(args.join(''))
        const d = digitos(args.join(''))
        return {
            intro: r.ok ? `O registro ${'*' + d + '*'} passa na conferência.` : `Esse número ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Número recebido:* ${d || 'nenhum dígito'}`, `*Situação:* ${r.ok ? 'dígitos corretos' : 'dígitos incorretos'}`, r.ok ? `*Base:* ${d.slice(0, 9)} — *verificadores:* ${d.slice(9)}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🔍', titulo: 'O que a conta não vê', linhas: ['Validade, pontos e bloqueio da carteira não estão no número: isso só na consulta do Detran ou no aplicativo da carteira digital.'] }
            ]
        }
    }
})

D('doc_rg_sp', {
    emoji: '🆔', titulo: 'Conferir RG de São Paulo',
    descricao: 'Confere o dígito do RG emitido em São Paulo',
    uso: '<número do RG>',
    exemplos: [{ args: '24.738.214-0', oque: 'número de exemplo' }, { args: '11.222.333-8', oque: 'outro exemplo' }],
    dica: 'Só o RG de São Paulo tem dígito calculado. Cada estado emite do jeito dele, e a maioria não tem verificador.',
    calcular(args) {
        const bruto = String(args.join('')).toUpperCase().replace(/[^0-9X]/g, '')
        if (bruto.length !== 9) throw falha(`O RG de São Paulo tem 9 caracteres (8 números e o dígito). Você mandou ${bruto.length}.`)
        const base = bruto.slice(0, 8)
        if (!/^\d{8}$/.test(base)) throw falha('Os oito primeiros caracteres precisam ser números.')
        let soma = 0
        for (let i = 0; i < 8; i++) soma += Number(base[i]) * (9 - i)
        const resto = soma % 11
        const calculado = resto === 1 ? 'X' : resto === 0 ? '0' : String(11 - resto)
        const ok = calculado === bruto[8]
        return {
            intro: ok ? `O RG ${'*' + base.slice(0, 2) + '.' + base.slice(2, 5) + '.' + base.slice(5) + '-' + bruto[8] + '*'} passa na conferência.` : `Esse RG ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Base:* ${base}`, `*Dígito informado:* ${bruto[8]}`, `*Dígito calculado:* ${calculado}`, `*Situação:* ${ok ? 'confere' : 'não confere'}`] },
                { emoji: '🧮', titulo: 'Como a conta funciona', linhas: [`Multiplica cada número por 2 a 9 da direita para a esquerda, soma (${soma}), divide por 11 e tira o resto (${resto}).`, 'Resto 1 vira X e resto 0 vira zero.'] },
                { emoji: '⚠️', titulo: 'Fora de São Paulo', linhas: ['RG de outro estado tem outra numeração e não tem como conferir por cálculo.'] }
            ]
        }
    }
})

D('doc_sus_validar', {
    emoji: '🏥', titulo: 'Conferir cartão do SUS',
    descricao: 'Confere o número do cartão nacional de saúde',
    uso: '<número do cartão do SUS>',
    exemplos: [{ args: '201234567890018', oque: 'número de exemplo' }, { args: '201234567890019', oque: 'com dígito trocado' }],
    dica: 'Número começado em 1 ou 2 é definitivo. Começado em 7, 8 ou 9 é provisório, de quem ainda não tem CPF no cadastro.',
    calcular(args) {
        const r = validarCns(args.join(''))
        const d = digitos(args.join(''))
        return {
            intro: r.ok ? `O número ${'*' + r.formatado + '*'} passa na conferência.` : `Esse número ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Número recebido:* ${d || 'nenhum dígito'}`, `*Situação:* ${r.ok ? 'soma de conferência fecha' : 'não fecha'}`, r.ok ? `*Tipo:* ${r.definitivo ? 'definitivo' : 'provisório'}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🧮', titulo: 'Como funciona', linhas: ['Os 15 dígitos são multiplicados por pesos de 15 a 1 e somados. A soma precisa ser divisível por 11.'] },
                { emoji: '🔒', titulo: 'Dado de saúde', linhas: ['Cartão do SUS liga a pessoa ao prontuário dela. Não compartilhe o número de terceiro.'] }
            ]
        }
    }
})

D('doc_nfe_validar', {
    emoji: '🧾', titulo: 'Conferir chave da nota fiscal',
    descricao: 'Confere o dígito da chave de acesso da nota',
    uso: '<chave com 44 dígitos>',
    exemplos: [{ args: '35260911222333000181550010000123451123456784', oque: 'chave de exemplo' }, { args: '35260911222333000181550010000123451123456785', oque: 'com dígito trocado' }],
    dica: 'A chave de acesso fica no rodapé do documento auxiliar da nota, em 11 blocos de 4 dígitos.',
    calcular(args) {
        const r = validarChaveNfe(args.join(''))
        const d = digitos(args.join(''))
        return {
            intro: r.ok ? `A chave ${'*passa na conferência*'}.` : `A chave ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Dígitos informados:* ${d.length}`, `*Situação:* ${r.ok ? 'dígito verificador correto' : 'dígito incorreto'}`, r.ok ? `*Chave em blocos:* ${(d.match(/.{1,4}/g) || []).join(' ')}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🔍', titulo: 'Para conferir de verdade', linhas: ['Dígito certo só diz que a chave é coerente. Para saber se a nota existe, consulte a chave no portal da nota fiscal eletrônica.'] }
            ]
        }
    }
})

D('doc_nfe_ler', {
    emoji: '🔎', titulo: 'Ler a chave da nota fiscal',
    descricao: 'Extrai estado, data e emitente da chave da nota',
    uso: '<chave com 44 dígitos>',
    exemplos: [{ args: '35260911222333000181550010000123451123456784', oque: 'lê todos os campos' }, { args: '3526 0911 2223 3300 0181 5500 1000 0123 4511 2345 6784', oque: 'chave em blocos' }],
    dica: 'A chave guarda estado, mês da emissão, CNPJ do emitente, modelo, série e número da nota.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 44) throw falha(`A chave tem 44 dígitos. Você mandou ${d.length}.`)
        const info = lerChaveNfe(d)
        const r = validarChaveNfe(d)
        const MODELOS = { '55': 'nota fiscal eletrônica', '65': 'nota fiscal de consumidor', '57': 'conhecimento de transporte' }
        return {
            intro: `Nota de ${'*' + info.uf + '*'}, emitida em ${'*' + info.emissao + '*'}, número ${Number(info.numero)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'O que a chave diz', linhas: [`*Estado do emitente:* ${info.uf}${ESTADOS_NOME[info.uf] ? ' (' + ESTADOS_NOME[info.uf] + ')' : ''}`, `*Mês e ano da emissão:* ${info.emissao}`, `*CNPJ do emitente:* ${info.cnpj}`, `*Modelo:* ${info.modelo} — ${MODELOS[info.modelo] || 'outro documento'}`] },
                { emoji: '📄', titulo: 'Identificação da nota', linhas: [`*Série:* ${Number(info.serie)}`, `*Número:* ${Number(info.numero)}`, `*Código numérico:* ${info.codigo}`, `*Dígito verificador:* ${d[43]} (${r.ok ? 'confere' : 'não confere'})`] },
                { emoji: '🏢', titulo: 'Sobre o emitente', linhas: [`*CNPJ confere?* ${validarCnpj(info.cnpj).ok ? 'sim, os dígitos batem' : 'não, os dígitos não batem'}`, `*Unidade:* ${info.cnpj.slice(11, 15) === '0001' ? 'matriz' : 'filial'}`] }
            ]
        }
    }
})

D('doc_processo_validar', {
    emoji: '⚖️', titulo: 'Conferir número de processo',
    descricao: 'Confere os dígitos do número único do processo',
    uso: '<número do processo>',
    exemplos: [{ args: '0001234-03.2026.8.26.0100', oque: 'processo de exemplo' }, { args: '0001234-04.2026.8.26.0100', oque: 'com dígito trocado' }],
    dica: 'O número único tem 20 dígitos e segue a resolução do Conselho Nacional de Justiça desde 2008.',
    calcular(args) {
        const r = validarProcessoCnj(args.join(''))
        const d = digitos(args.join(''))
        return {
            intro: r.ok ? `O processo ${'*' + lerProcessoCnj(d).formatado + '*'} passa na conferência.` : `Esse número ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Dígitos informados:* ${d.length}`, `*Situação:* ${r.ok ? 'verificadores corretos' : 'verificadores incorretos'}`, r.ok ? `*Formatado:* ${lerProcessoCnj(d).formatado}` : `*Motivo:* ${r.motivo}`] },
                { emoji: '🧮', titulo: 'Como funciona', linhas: ['Os dois dígitos depois do traço saem de uma divisão por 97 do resto do número. É o mesmo método usado em conta bancária internacional.'] }
            ]
        }
    }
})

D('doc_processo_ler', {
    emoji: '📚', titulo: 'Ler o número do processo',
    descricao: 'Explica cada parte do número do processo',
    uso: '<número do processo>',
    exemplos: [{ args: '0001234-03.2026.8.26.0100', oque: 'processo estadual de São Paulo' }, { args: '00012340320265020001', oque: 'sem pontuação' }],
    dica: 'O número traz a numeração, o ano, o ramo da Justiça, o tribunal e a unidade de origem.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 20) throw falha(`O número único tem 20 dígitos. Você mandou ${d.length}.`)
        const p = lerProcessoCnj(d)
        const r = validarProcessoCnj(d)
        const ramo = CNJ_TRIBUNAL[p.segmento] || 'ramo não identificado'
        return {
            intro: `Processo de ${'*' + ramo + '*'}, do ano de ${'*' + p.ano + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'As partes do número', linhas: [`*Numeração do processo:* ${p.numero}`, `*Dígitos verificadores:* ${p.dv} (${r.ok ? 'conferem' : 'não conferem'})`, `*Ano de autuação:* ${p.ano}`, `*Ramo da Justiça:* ${p.segmento} — ${ramo}`] },
                { emoji: '🏛️', titulo: 'Origem', linhas: [`*Tribunal:* código ${p.tribunal}`, `*Unidade de origem:* ${p.origem}`, `*Formatado:* ${p.formatado}`] },
                { emoji: '📖', titulo: 'Os ramos da Justiça', linhas: Object.entries(CNJ_TRIBUNAL).map(([k, v]) => `• ${k}: ${v}`) }
            ]
        }
    }
})

D('doc_ean_validar', {
    emoji: '🏷️', titulo: 'Conferir código de barras de produto',
    descricao: 'Confere o dígito de um código de barras EAN',
    uso: '<código de barras>',
    exemplos: [{ args: '7891000315507', oque: 'produto brasileiro' }, { args: '7891000315508', oque: 'com dígito trocado' }],
    dica: 'Código que começa com 789 ou 790 foi registrado no Brasil.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 13 && d.length !== 8) throw falha(`Código de barras de produto tem 13 dígitos (EAN-13) ou 8 (EAN-8). Você mandou ${d.length}.`)
        const dv = dvEan(d.slice(0, -1))
        const ok = String(dv) === d[d.length - 1]
        const pais = d.length === 13 ? (d.startsWith('789') || d.startsWith('790') ? 'Brasil' : d.startsWith('0') ? 'Estados Unidos ou Canadá' : d.startsWith('45') || d.startsWith('49') ? 'Japão' : d.startsWith('69') ? 'China' : 'outro país') : 'não identificado em EAN-8'
        return {
            intro: ok ? `O código ${'*' + d + '*'} passa na conferência.` : `Esse código ${'*não passa*'}: o dígito deveria ser ${dv}.`,
            secoes: [
                { emoji: ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Tipo:* EAN-${d.length}`, `*Dígito informado:* ${d[d.length - 1]}`, `*Dígito calculado:* ${dv}`, `*Situação:* ${ok ? 'confere' : 'não confere'}`] },
                { emoji: '🌎', titulo: 'Origem do registro', linhas: [`*Prefixo:* ${d.slice(0, 3)}`, `*País do registro:* ${pais}`, 'O prefixo diz onde a empresa registrou o código, não onde o produto foi fabricado.'] },
                { emoji: '🧮', titulo: 'Como o dígito sai', linhas: ['Cada dígito é multiplicado por 1 e por 3, alternando. O verificador é o que falta para a soma chegar ao próximo múltiplo de 10.'] }
            ]
        }
    }
})

D('doc_isbn_validar', {
    emoji: '📕', titulo: 'Conferir ISBN de livro',
    descricao: 'Confere o dígito de um ISBN de 10 ou 13 dígitos',
    uso: '<ISBN>',
    exemplos: [{ args: '978-85-359-0277-8', oque: 'ISBN de treze dígitos' }, { args: '8535902775', oque: 'ISBN antigo de dez dígitos' }],
    dica: 'ISBN de 13 dígitos usa o mesmo cálculo do código de barras. O de 10 usa módulo 11, e por isso pode terminar em X.',
    calcular(args) {
        const bruto = String(args.join('')).toUpperCase().replace(/[^0-9X]/g, '')
        if (bruto.length !== 10 && bruto.length !== 13) throw falha(`ISBN tem 10 ou 13 caracteres. Você mandou ${bruto.length}.`)
        if (bruto.length === 13) {
            const dv = dvEan(bruto.slice(0, 12))
            const ok = String(dv) === bruto[12]
            return {
                intro: ok ? `O ISBN ${'*' + bruto + '*'} passa na conferência.` : `Esse ISBN ${'*não passa*'}: o dígito deveria ser ${dv}.`,
                secoes: [
                    { emoji: ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Formato:* ISBN-13`, `*Prefixo:* ${bruto.slice(0, 3)}`, `*Grupo de país ou idioma:* ${bruto.slice(3, 5)}${bruto.slice(3, 5) === '85' ? ' (Brasil)' : ''}`, `*Situação:* ${ok ? 'confere' : 'não confere'}`] },
                    { emoji: '🧮', titulo: 'A conta', linhas: ['Pesos 1 e 3 alternados, como no código de barras de supermercado.'] }
                ]
            }
        }
        let soma = 0
        for (let i = 0; i < 9; i++) soma += Number(bruto[i]) * (10 - i)
        const r = (11 - (soma % 11)) % 11
        const calculado = r === 10 ? 'X' : String(r)
        const ok = calculado === bruto[9]
        return {
            intro: ok ? `O ISBN ${'*' + bruto + '*'} passa na conferência.` : `Esse ISBN ${'*não passa*'}: o dígito deveria ser ${calculado}.`,
            secoes: [
                { emoji: ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Formato:* ISBN-10`, `*Dígito informado:* ${bruto[9]}`, `*Dígito calculado:* ${calculado}`, `*Situação:* ${ok ? 'confere' : 'não confere'}`] },
                { emoji: '🔄', titulo: 'Convertendo para 13 dígitos', linhas: [`*Com o prefixo 978:* 978${bruto.slice(0, 9)}${dvEan('978' + bruto.slice(0, 9))}`, 'Todo ISBN-10 vira ISBN-13 colocando 978 na frente e recalculando o último dígito.'] }
            ]
        }
    }
})

D('doc_imei_validar', {
    emoji: '📲', titulo: 'Conferir IMEI de celular',
    descricao: 'Confere o dígito do IMEI de um celular',
    uso: '<IMEI com 15 dígitos>',
    exemplos: [{ args: '490154203237518', oque: 'IMEI de teste' }, { args: '490154203237519', oque: 'com dígito trocado' }],
    dica: 'Para ver o IMEI do seu aparelho, disque asterisco cerquilha zero seis cerquilha no teclado do telefone.',
    calcular(args) {
        const d = digitos(args.join(''))
        if (d.length !== 15) throw falha(`IMEI tem 15 dígitos. Você mandou ${d.length}.`)
        const r = luhn(d)
        return {
            intro: r.ok ? `O IMEI ${'*' + d + '*'} passa na conferência.` : `Esse IMEI ${'*não passa*'} na conferência.`,
            secoes: [
                { emoji: r.ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*IMEI:* ${d}`, `*Situação:* ${r.ok ? 'dígito correto' : 'dígito incorreto'}`, `*Código do modelo (primeiros 8):* ${d.slice(0, 8)}`, `*Série do aparelho:* ${d.slice(8, 14)}`] },
                { emoji: '🔒', titulo: 'Para que serve saber o IMEI', linhas: ['É o número que bloqueia o aparelho roubado na operadora e na polícia. Anote o seu antes de precisar.', 'Guarde em lugar seguro: quem tem o IMEI pode tentar bloquear o aparelho de outra pessoa.'] }
            ]
        }
    }
})

D('doc_pix_chave', {
    emoji: '🔑', titulo: 'Tipo de chave PIX',
    descricao: 'Descobre e confere o tipo de uma chave PIX',
    uso: '<chave PIX>',
    exemplos: [{ args: '123.456.789-09', oque: 'chave de CPF' }, { args: 'contato@exemplo.com.br', oque: 'chave de e-mail' }],
    dica: 'Existem cinco tipos: CPF, CNPJ, e-mail, telefone e chave aleatória.',
    calcular(args) {
        const bruto = args.join(' ').trim()
        if (!bruto) throw falha('Digite a chave PIX que você quer conferir.')
        const d = digitos(bruto)
        let tipo, situacao, detalhe
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bruto)) {
            tipo = 'chave aleatória'
            situacao = 'formato correto'
            detalhe = 'São 32 caracteres em cinco blocos, gerados pelo banco. Não revelam nada sobre você.'
        } else if (bruto.includes('@')) {
            const r = lerEmail(bruto)
            tipo = 'e-mail'
            situacao = r.ok ? 'formato correto' : r.motivo
            detalhe = r.ok ? `Domínio: ${r.dominio}` : 'Confira a escrita antes de cadastrar.'
        } else if (d.length === 11 && validarCpf(d).ok) {
            tipo = 'CPF'
            situacao = 'dígitos corretos'
            detalhe = `Formatado: ${validarCpf(d).formatado}`
        } else if (d.length === 14) {
            const r = validarCnpj(d)
            tipo = 'CNPJ'
            situacao = r.ok ? 'dígitos corretos' : r.motivo
            detalhe = r.ok ? `Formatado: ${r.formatado}` : 'Confira os dígitos.'
        } else if (d.length === 12 || d.length === 13 || d.length === 11 || d.length === 10) {
            const r = lerTelefone(d)
            tipo = 'telefone'
            situacao = r.ok ? 'formato correto' : r.motivo
            detalhe = r.ok ? `Chave cadastrada como ${r.internacional}` : 'Telefone de chave PIX entra com código do país e DDD.'
        } else {
            throw falha(`Não reconheci "${bruto.slice(0, 30)}" como chave PIX. Os tipos aceitos são CPF, CNPJ, e-mail, telefone e chave aleatória.`)
        }
        return {
            intro: `Essa é uma chave do tipo ${'*' + tipo + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Tipo:* ${tipo}`, `*Conferência:* ${situacao}`, `*Detalhe:* ${detalhe}`] },
                { emoji: '📋', titulo: 'Os cinco tipos', linhas: ['• CPF e CNPJ: o número do documento', '• E-mail e telefone: precisam ser confirmados por código', '• Aleatória: gerada pelo banco, não expõe dado seu'] },
                { emoji: '🔒', titulo: 'Qual usar', linhas: ['Para receber de desconhecido, a chave aleatória é a mais segura: ela não conta seu CPF nem seu telefone para quem paga.'] }
            ]
        }
    }
})

D('doc_pix_brcode', {
    emoji: '📲', titulo: 'Conferir código PIX copia e cola',
    descricao: 'Confere e lê um código PIX copia e cola',
    uso: '<código copia e cola>',
    exemplos: [{ args: '00020126420014BR.GOV.BCB.PIX0120goat@exemplo.com.br520400005303986540525.505802BR5910LOJA TESTE6008BRASILIA62070503***630428E4', oque: 'código de exemplo' }, { args: '00020126', oque: 'código cortado pela metade' }],
    dica: 'Antes de pagar, confira o nome do recebedor. O código guarda essa informação e o aplicativo mostra na tela.',
    calcular(args) {
        const texto = args.join(' ').trim().replace(/\s+/g, ' ')
        if (texto.length < 20) throw falha(`Esse código tem só ${texto.length} caracteres: código PIX de verdade passa de 80.`)
        const idx = texto.lastIndexOf('6304')
        if (idx < 0) throw falha('Não achei o campo de verificação (6304) no fim do código. Confira se copiou tudo.')
        const semCrc = texto.slice(0, idx + 4)
        const crcInformado = texto.slice(idx + 4).toUpperCase()
        const crcCalculado = crc16(semCrc)
        const ok = crcInformado === crcCalculado
        const campos = lerBrCode(texto)
        const valor = campos['54']
        return {
            intro: ok ? `O código ${'*passa na verificação*'}.` : `O código ${'*não passa na verificação*'}: ele pode ter sido cortado ou alterado.`,
            secoes: [
                { emoji: ok ? '✅' : '❌', titulo: 'Verificação', linhas: [`*Código de verificação informado:* ${crcInformado || 'nenhum'}`, `*Calculado por mim:* ${crcCalculado}`, `*Situação:* ${ok ? 'confere' : 'não confere'}`, `*Tamanho:* ${texto.length} caracteres`] },
                { emoji: '🧾', titulo: 'O que o código diz', linhas: [`*Recebedor:* ${campos['59'] || 'não informado'}`, `*Cidade:* ${campos['60'] || 'não informada'}`, `*Valor:* ${valor ? moeda(Number(valor)) : 'em aberto, você digita na hora'}`, `*Identificador:* ${(campos['62'] || '').slice(4) || 'não informado'}`] },
                { emoji: '⚠️', titulo: 'Antes de confirmar', linhas: ['Código válido não quer dizer cobrança legítima. Compare o nome do recebedor com quem te mandou a cobrança.'] }
            ]
        }
    }
})

D('doc_rastreio_correios', {
    emoji: '📦', titulo: 'Conferir código de rastreio dos Correios',
    descricao: 'Confere o formato do código de rastreio postal',
    uso: '<código de rastreio>',
    exemplos: [{ args: 'PY123456785BR', oque: 'código de exemplo' }, { args: 'PY123456781BR', oque: 'com dígito trocado' }],
    dica: 'O código tem duas letras de serviço, oito números, um dígito verificador e duas letras do país.',
    calcular(args) {
        const s = String(args.join('')).toUpperCase().replace(/\s/g, '')
        const m = s.match(/^([A-Z]{2})(\d{8})(\d)([A-Z]{2})$/)
        if (!m) throw falha(`"${s.slice(0, 16) || 'nada'}" não está no formato de rastreio. O certo é duas letras, nove números e duas letras, como PY123456785BR.`)
        const [, servico, numero, dvInformado, pais] = m
        const pesos = [8, 6, 4, 2, 3, 5, 9, 7]
        let soma = 0
        for (let i = 0; i < 8; i++) soma += Number(numero[i]) * pesos[i]
        const resto = soma % 11
        const dv = resto === 0 ? 5 : resto === 1 ? 0 : 11 - resto
        const ok = String(dv) === dvInformado
        return {
            intro: ok ? `O código ${'*' + s + '*'} passa na conferência.` : `Esse código ${'*não passa*'}: o dígito deveria ser ${dv}.`,
            secoes: [
                { emoji: ok ? '✅' : '❌', titulo: 'Resultado', linhas: [`*Serviço:* ${servico}`, `*Número:* ${numero}`, `*Dígito informado:* ${dvInformado}`, `*Dígito calculado:* ${dv}`] },
                { emoji: '🌎', titulo: 'País de origem', linhas: [`*Sigla:* ${pais}${pais === 'BR' ? ' (Brasil)' : ''}`, 'Encomenda de fora chega com a sigla do país de partida e muda de código ao entrar no Brasil.'] },
                { emoji: '🔍', titulo: 'Para acompanhar', linhas: ['Formato certo não garante que o objeto foi postado. O rastreamento só aparece depois que a agência registra a postagem.'] }
            ]
        }
    }
})

D('doc_lote_validar', {
    emoji: '📑', titulo: 'Conferir vários documentos de uma vez',
    descricao: 'Confere uma lista de CPF ou CNPJ de uma vez',
    uso: '<documento1>, <documento2>, ...',
    exemplos: [{ args: '12345678909, 11144477735, 11222333000181', oque: 'três documentos' }, { args: '11111111111, 12345678909', oque: 'um inválido e um válido' }],
    dica: 'Separe por vírgula. Eu identifico sozinho se cada um é CPF ou CNPJ pelo tamanho.',
    calcular(args) {
        const lista = itens(args, 1, 'documentos')
        if (lista.length > 30) throw falha(`São ${lista.length} documentos: mande até 30 por vez para a resposta caber na tela.`)
        const linhas = []
        let validos = 0
        for (const item of lista) {
            const d = digitos(item)
            if (d.length === 11) {
                const r = validarCpf(d)
                if (r.ok) validos++
                linhas.push(`• CPF ${d}: ${r.ok ? 'confere' : 'não confere'}`)
            } else if (d.length === 14) {
                const r = validarCnpj(d)
                if (r.ok) validos++
                linhas.push(`• CNPJ ${d}: ${r.ok ? 'confere' : 'não confere'}`)
            } else {
                linhas.push(`• ${d || item.slice(0, 12)}: ${d.length} dígitos, não é CPF nem CNPJ`)
            }
        }
        return {
            intro: `De ${lista.length} documento(s), ${'*' + validos + ' passaram*'} na conferência.`,
            secoes: [
                { emoji: '📋', titulo: 'Documento por documento', linhas },
                { emoji: '🎯', titulo: 'Resumo', linhas: [`*Conferidos:* ${lista.length}`, `*Passaram:* ${validos}`, `*Não passaram:* ${lista.length - validos}`] },
                { emoji: '🔒', titulo: 'Sobre lista de documento', linhas: ['Planilha com CPF de cliente é dado pessoal. Conferir formato aqui tudo bem; mandar a lista para grupo, não.'] }
            ]
        }
    }
})

D('doc_detectar', {
    emoji: '🕵️', titulo: 'Descobrir que documento é esse número',
    descricao: 'Descobre que tipo de documento é o número dado',
    uso: '<número qualquer>',
    exemplos: [{ args: '12345678909', oque: 'onze dígitos, testa CPF e outros' }, { args: '01310100', oque: 'oito dígitos, parece CEP' }],
    dica: 'Quando o tamanho serve para mais de um documento, eu testo os dígitos de cada um e digo qual fecha.',
    calcular(args) {
        const bruto = args.join(' ').trim()
        const d = digitos(bruto)
        if (!d) throw falha('Digite um número para eu identificar.')
        const achados = []
        if (d.length === 8) achados.push(`CEP: formato correto${estadoDoCep(d) ? `, faixa de ${estadoDoCep(d)}` : ', mas fora das faixas conhecidas'}`)
        if (d.length === 10 || d.length === 11) { const t = lerTelefone(d); if (t.ok) achados.push(`Telefone: ${t.formatado}, ${t.tipo} de ${t.local[1]}`) }
        if (d.length === 11) {
            if (validarCpf(d).ok) achados.push(`CPF: dígitos conferem (${validarCpf(d).formatado})`)
            if (validarPis(d).ok) achados.push(`PIS ou NIS: dígito confere (${validarPis(d).formatado})`)
            if (validarRenavam(d).ok) achados.push('RENAVAM: dígito confere')
            if (validarCnh(d).ok) achados.push('CNH: dígitos conferem')
        }
        if (d.length === 12 && validarTitulo(d).ok) achados.push(`Título de eleitor: confere, emitido em ${validarTitulo(d).uf}`)
        if (d.length === 13 && dvEan(d.slice(0, 12)) === Number(d[12])) achados.push('Código de barras de produto (EAN-13): dígito confere')
        if (d.length === 14 && validarCnpj(d).ok) achados.push(`CNPJ: dígitos conferem (${validarCnpj(d).formatado})`)
        if (d.length === 15) {
            if (validarCns(d).ok) achados.push('Cartão do SUS: soma confere')
            if (luhn(d).ok) achados.push('IMEI: dígito confere')
        }
        if (d.length >= 13 && d.length <= 19 && luhn(d).ok) achados.push(`Cartão (teste de Luhn): confere, bandeira provável ${bandeiraCartao(d)}`)
        if (d.length === 20 && validarProcessoCnj(d).ok) achados.push(`Processo judicial: confere, ano ${d.slice(9, 13)}`)
        if (d.length === 44 && validarChaveNfe(d).ok) achados.push('Chave de nota fiscal: dígito confere')
        if (d.length === 47) achados.push('Boleto bancário: tamanho de linha digitável')
        if (d.length === 48) achados.push('Conta de consumo ou tributo: tamanho de código de arrecadação')
        return {
            intro: achados.length
                ? `Esse número tem cara de ${'*' + achados[0].split(':')[0] + '*'}.`
                : `Não reconheci esse número como documento conhecido.`,
            secoes: [
                { emoji: '🎯', titulo: 'O que eu achei', linhas: achados.length ? achados.map(a => `• ${a}`) : ['Nenhum documento da minha lista bate com esse número.'] },
                { emoji: '📏', titulo: 'Pistas', linhas: [`*Dígitos:* ${d.length}`, `*Tem letra?* ${/[a-zA-Z]/.test(bruto) ? 'sim' : 'não'}`, `*Começa com:* ${d.slice(0, 4)}`] },
                { emoji: '📋', titulo: 'O que eu sei conferir', linhas: ['CPF, CNPJ, CEP, PIS, título de eleitor, RENAVAM, CNH, cartão do SUS, IMEI, cartão, código de barras, nota fiscal, processo, boleto e conta de consumo.'] }
            ]
        }
    }
})

/* ═══════════════════════════ GERADORES ═══════════════════════════
 * Tudo aqui sorteia com crypto.randomInt e crypto.randomBytes. Math.random é
 * previsível a partir de poucas saídas e não serve para sorteio em que alguém
 * ganha alguma coisa. Nada neste bloco gera documento de pessoa.
 */

const MAIUSCULAS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ'
const MINUSCULAS = 'abcdefghijkmnopqrstuvwxyz'
const NUMEROS = '23456789'
// Sem asterisco, sublinhado e til: o WhatsApp usa esses três para formatar texto
// e a senha apareceria em negrito, itálico ou riscada, com o caractere sumindo.
const SIMBOLOS = '!@#$%&+-=?.:'

/** Repete a geração até a saída não parecer marcador de código. */
function semMarcador(gerar) {
    for (let i = 0; i < 20; i++) {
        const v = gerar()
        if (!/\b(TODO|FIXME|XXX)\b/.test(String(v))) return v
    }
    return gerar()
}

/** Sorteia n caracteres de um alfabeto, sem viés. */
function letrasSorteadas(alfabeto, n) {
    let s = ''
    for (let i = 0; i < n; i++) s += alfabeto[crypto.randomInt(0, alfabeto.length)]
    return s
}

const PALAVRAS_SENHA = ['abacaxi', 'bicicleta', 'caneca', 'dinossauro', 'espelho', 'foguete', 'girassol', 'hipopotamo', 'igreja', 'janela', 'kiwi', 'lanterna', 'martelo', 'navio', 'oceano', 'panela', 'quadro', 'relogio', 'sanfona', 'tartaruga', 'uva', 'violao', 'xicara', 'zebra', 'muralha', 'cachoeira', 'formiga', 'geladeira', 'telhado', 'bandeira', 'caderno', 'estrela', 'floresta', 'guitarra', 'montanha', 'pipoca', 'sabonete', 'trovao', 'vulcao', 'bolacha']
const ADJETIVOS = ['veloz', 'calmo', 'antigo', 'dourado', 'gelado', 'macio', 'forte', 'noturno', 'quieto', 'brilhante', 'sereno', 'astuto', 'bravo', 'leve', 'fundo', 'raro', 'agudo', 'firme']
const ANIMAIS = ['lobo', 'tigre', 'coruja', 'raposa', 'falcao', 'jaguar', 'tubarao', 'urso', 'corvo', 'panda', 'gaviao', 'lince', 'onca', 'condor', 'bisao', 'arara']
const CORES_NOMES = [
    ['vermelho', 'E53935'], ['azul', '1E88E5'], ['verde', '43A047'], ['amarelo', 'FDD835'],
    ['roxo', '8E24AA'], ['laranja', 'FB8C00'], ['rosa', 'D81B60'], ['turquesa', '00ACC1'],
    ['cinza', '757575'], ['marrom', '6D4C41'], ['bege', 'D7CCC8'], ['vinho', '880E4F'],
    ['petróleo', '00695C'], ['lavanda', 'B39DDB'], ['areia', 'E0C097'], ['grafite', '37474F']
]
const LOREM_PALAVRAS = ['casa', 'tempo', 'vida', 'dia', 'gente', 'olho', 'mão', 'noite', 'agora', 'terra', 'rua', 'cidade', 'porta', 'mundo', 'palavra', 'coisa', 'parte', 'lugar', 'trabalho', 'jeito', 'forma', 'caminho', 'voz', 'silêncio', 'janela', 'mesa', 'água', 'fogo', 'vento', 'chuva', 'manhã', 'tarde', 'história', 'lembrança', 'começo', 'fim', 'passo', 'sombra', 'luz', 'canto', 'campo', 'rio', 'mar', 'pedra', 'árvore', 'folha', 'corpo', 'rosto', 'nome', 'povo']

G('ger_senha', {
    emoji: '🔐', titulo: 'Senha forte',
    descricao: 'Gera uma senha forte com letras, números e símbolos',
    uso: '[tamanho, de 8 a 64]',
    exemplos: [{ args: '16', oque: 'senha de dezesseis caracteres' }, { args: '24', oque: 'senha bem longa' }],
    dica: 'Tamanho vale mais que complicação: uma senha de 20 caracteres simples é mais difícil que uma de 8 cheia de símbolo.',
    rodaSemArgumento: true,
    calcular(args) {
        const n = args[0] ? Math.round(exigirNumero(args[0], 'tamanho da senha', { minimo: 8, maximo: 64 })) : 16
        const alfabeto = MAIUSCULAS + MINUSCULAS + NUMEROS + SIMBOLOS
        const senha = semMarcador(() => {
            let s = MAIUSCULAS[crypto.randomInt(0, MAIUSCULAS.length)] + MINUSCULAS[crypto.randomInt(0, MINUSCULAS.length)] + NUMEROS[crypto.randomInt(0, NUMEROS.length)] + SIMBOLOS[crypto.randomInt(0, SIMBOLOS.length)]
            s += letrasSorteadas(alfabeto, n - 4)
            return embaralhar(s.split('')).join('')
        })
        const bits = n * Math.log2(alfabeto.length)
        return {
            intro: `Sua senha: ${'*' + senha + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre essa senha', linhas: [`*Tamanho:* ${n} caracteres`, `*Alfabeto usado:* ${alfabeto.length} símbolos diferentes`, `*Força estimada:* ${fmt(bits, 0)} bits`, `*Combinações possíveis:* 10 elevado a ${fmt(bits / 3.32, 0)}`] },
                { emoji: '🔒', titulo: 'Como guardar', linhas: ['Use um gerenciador de senhas. Senha boa é senha que você não precisa decorar.', 'Nunca repita a mesma senha em dois lugares: um vazamento derruba todos os outros.'] },
                { emoji: '🎲', titulo: 'De onde vem o sorteio', linhas: ['Sorteio criptográfico do próprio sistema, não o gerador comum. Rodar de novo dá outra senha.'] }
            ]
        }
    }
})

G('ger_senha_pin', {
    emoji: '🔢', titulo: 'Senha só de números',
    descricao: 'Gera um PIN numérico sorteado com segurança',
    uso: '[quantidade de dígitos, de 4 a 12]',
    exemplos: [{ args: '6', oque: 'PIN de seis dígitos' }, { args: '4', oque: 'PIN curto de cartão' }],
    dica: 'Datas de aniversário e sequências como 1234 são as primeiras tentativas de quem tenta adivinhar.',
    rodaSemArgumento: true,
    calcular(args) {
        const n = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de dígitos', { minimo: 4, maximo: 12 })) : 6
        let pin = ''
        for (let i = 0; i < n; i++) pin += crypto.randomInt(0, 10)
        return {
            intro: `Seu PIN: ${'*' + pin + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre esse PIN', linhas: [`*Dígitos:* ${n}`, `*Combinações possíveis:* ${fmt(Math.pow(10, n), 0)}`, `*Chance de acertar em uma tentativa:* 1 em ${fmt(Math.pow(10, n), 0)}`] },
                { emoji: '⚠️', titulo: 'O que evitar', linhas: ['Data de nascimento, ano, 0000, 1234 e o número repetido estão no topo das tentativas de quem invade.'] }
            ]
        }
    }
})

G('ger_senha_frase', {
    emoji: '🗝️', titulo: 'Frase-senha fácil de lembrar',
    descricao: 'Gera uma frase-senha com palavras sorteadas',
    uso: '[quantidade de palavras, de 3 a 8]',
    exemplos: [{ args: '4', oque: 'quatro palavras' }, { args: '6', oque: 'frase mais longa' }],
    dica: 'Quatro palavras sorteadas já são mais difíceis de quebrar que oito caracteres embaralhados, e você lembra.',
    rodaSemArgumento: true,
    calcular(args) {
        const n = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de palavras', { minimo: 3, maximo: 8 })) : 4
        const palavras = []
        for (let i = 0; i < n; i++) palavras.push(sortear(PALAVRAS_SENHA))
        const numero = crypto.randomInt(10, 100)
        const frase = palavras.join('-') + '-' + numero
        const bits = n * Math.log2(PALAVRAS_SENHA.length) + Math.log2(90)
        return {
            intro: `Sua frase-senha: ${'*' + frase + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre essa frase', linhas: [`*Palavras:* ${n}`, `*Caracteres:* ${frase.length}`, `*Força estimada:* ${fmt(bits, 0)} bits`, `*Lista usada:* ${PALAVRAS_SENHA.length} palavras`] },
                { emoji: '🧠', titulo: 'Como decorar', linhas: [`Monte uma cena boba com as palavras: ${palavras.slice(0, 3).join(', ')}. Imagem absurda gruda na memória.`] },
                { emoji: '🔒', titulo: 'Onde usar', linhas: ['Boa para a senha mestra do gerenciador e para o computador, em que você digita todo dia.'] }
            ]
        }
    }
})

G('ger_senha_wifi', {
    emoji: '📶', titulo: 'Senha de wi-fi fácil de ditar',
    descricao: 'Gera senha de wi-fi sem letra que confunde',
    uso: '[tamanho, de 8 a 32]',
    exemplos: [{ args: '12', oque: 'senha de doze caracteres' }, { args: '20', oque: 'senha mais longa' }],
    dica: 'Deixei de fora o zero, o O, o um, o l e o i: são os que a visita erra ao digitar.',
    rodaSemArgumento: true,
    calcular(args) {
        const n = args[0] ? Math.round(exigirNumero(args[0], 'tamanho da senha', { minimo: 8, maximo: 32 })) : 12
        const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ' + 'abcdefghjkmnpqrstuvwxyz' + '23456789'
        const senha = semMarcador(() => letrasSorteadas(alfabeto, n))
        return {
            intro: `Senha do wi-fi: ${'*' + senha + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre essa senha', linhas: [`*Tamanho:* ${n} caracteres`, `*Só letras e números:* sem símbolo, que trava em televisão e console`, `*Força estimada:* ${fmt(n * Math.log2(alfabeto.length), 0)} bits`] },
                { emoji: '📋', titulo: 'Para ditar em voz alta', linhas: [senha.split('').map(c => /[A-Z]/.test(c) ? c + ' maiúsculo' : c).join(', ')] },
                { emoji: '💡', titulo: 'Rede de visita', linhas: ['Se o roteador tiver rede de visitante, coloque essa senha lá e deixe a rede principal com outra.'] }
            ]
        }
    }
})

G('ger_senha_forca', {
    emoji: '🛡️', titulo: 'Força de uma senha',
    descricao: 'Avalia a força de uma senha que você já usa',
    uso: '<senha para avaliar>',
    exemplos: [{ args: 'joao1985', oque: 'senha fraca comum' }, { args: 'Trovao-Panela-42', oque: 'frase-senha' }],
    dica: 'Não digite aqui a senha do seu banco. Teste um padrão parecido, não a senha de verdade.',
    calcular(args) {
        const senha = args.join(' ')
        if (!senha) throw falha('Digite a senha que você quer avaliar.')
        let alfabeto = 0
        if (/[a-z]/.test(senha)) alfabeto += 26
        if (/[A-Z]/.test(senha)) alfabeto += 26
        if (/\d/.test(senha)) alfabeto += 10
        if (/[^A-Za-z0-9]/.test(senha)) alfabeto += 20
        const bits = senha.length * Math.log2(Math.max(2, alfabeto))
        const nota = bits < 28 ? 'muito fraca' : bits < 40 ? 'fraca' : bits < 60 ? 'razoável' : bits < 80 ? 'forte' : 'muito forte'
        const tentativasPorSegundo = 1e10
        const segundos = Math.pow(2, bits) / 2 / tentativasPorSegundo
        const tempo = segundos < 60 ? `${fmt(segundos, 1)} segundos` : segundos < 3600 ? `${fmt(segundos / 60, 1)} minutos` : segundos < 86400 ? `${fmt(segundos / 3600, 1)} horas` : segundos < 3.15e7 ? `${fmt(segundos / 86400, 1)} dias` : `${fmt(segundos / 3.15e7, 1)} anos`
        const problemas = []
        if (senha.length < 12) problemas.push('• Tem menos de 12 caracteres')
        if (!/[A-Z]/.test(senha)) problemas.push('• Não tem letra maiúscula')
        if (!/\d/.test(senha)) problemas.push('• Não tem número')
        if (/^\d+$/.test(senha)) problemas.push('• É só número: quebra em segundos')
        if (/(19|20)\d{2}/.test(senha)) problemas.push('• Tem um ano dentro, que é o primeiro palpite de quem tenta')
        return {
            intro: `Essa senha é ${'*' + nota + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Avaliação', linhas: [`*Tamanho:* ${senha.length} caracteres`, `*Tipos de caractere:* ${[/[a-z]/.test(senha) && 'minúscula', /[A-Z]/.test(senha) && 'maiúscula', /\d/.test(senha) && 'número', /[^A-Za-z0-9]/.test(senha) && 'símbolo'].filter(Boolean).join(', ')}`, `*Força estimada:* ${fmt(bits, 0)} bits`, `*Tempo para quebrar por força bruta:* ${tempo}`] },
                { emoji: '🔍', titulo: 'Pontos fracos', linhas: problemas.length ? problemas : ['Nenhum ponto fraco óbvio nessa senha.'] },
                { emoji: '⚠️', titulo: 'O que essa conta não vê', linhas: ['Senha que é palavra de dicionário, nome próprio ou que já vazou cai muito antes do tempo calculado. A conta acima supõe que ninguém adivinha o padrão.'] }
            ]
        }
    }
})

G('ger_senha_regra', {
    emoji: '⚙️', titulo: 'Senha sob medida',
    descricao: 'Gera senha escolhendo o que pode entrar nela',
    uso: '<tamanho> [sem-simbolo] [sem-numero] [sem-maiuscula]',
    exemplos: [{ args: '14 sem-simbolo', oque: 'sem caractere especial' }, { args: '10 sem-simbolo sem-maiuscula', oque: 'só minúscula e número' }],
    dica: 'Alguns sistemas antigos recusam símbolo ou limitam o tamanho. Aqui você monta a senha no formato que eles aceitam.',
    calcular(args) {
        const n = Math.round(exigirNumero(args[0], 'tamanho da senha', { minimo: 4, maximo: 64 }))
        const pedido = args.slice(1).map(a => chave(a)).join(' ')
        let alfabeto = MINUSCULAS
        const partes = ['minúsculas']
        if (!pedido.includes('sem-maiuscula')) { alfabeto += MAIUSCULAS; partes.push('maiúsculas') }
        if (!pedido.includes('sem-numero')) { alfabeto += NUMEROS; partes.push('números') }
        if (!pedido.includes('sem-simbolo')) { alfabeto += SIMBOLOS; partes.push('símbolos') }
        const senha = semMarcador(() => letrasSorteadas(alfabeto, n))
        return {
            intro: `Sua senha: ${'*' + senha + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Como ela foi montada', linhas: [`*Tamanho:* ${n}`, `*Entrou na senha:* ${partes.join(', ')}`, `*Alfabeto:* ${alfabeto.length} símbolos`, `*Força estimada:* ${fmt(n * Math.log2(alfabeto.length), 0)} bits`] },
                { emoji: '📋', titulo: 'Palavras que eu entendo', linhas: ['• sem-simbolo', '• sem-numero', '• sem-maiuscula'] }
            ]
        }
    }
})

G('ger_numero', {
    emoji: '🎲', titulo: 'Sortear um número',
    descricao: 'Sorteia um número de 1 até o que você mandar',
    uso: '[número máximo]',
    exemplos: [{ args: '100', oque: 'sorteia de 1 a 100' }, { args: '6', oque: 'como um dado' }],
    dica: 'Sorteio criptográfico: cada número tem exatamente a mesma chance, sem tendência.',
    rodaSemArgumento: true,
    calcular(args) {
        const max = args[0] ? Math.round(exigirNumero(args[0], 'número máximo', { minimo: 1, maximo: 1e9 })) : 100
        const n = aleatorio(1, max)
        return {
            intro: `O número sorteado é ${'*' + fmt(n, 0) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre o sorteio', linhas: [`*Resultado:* ${fmt(n, 0)}`, `*Faixa:* de 1 a ${fmt(max, 0)}`, `*Chance de cada número:* ${fmt(100 / max, 4)}%`, `*Posição na faixa:* ${fmt(n / max * 100, 1)}%`] },
                { emoji: '🎲', titulo: 'Sorteio limpo', linhas: ['Uso o sorteio criptográfico do sistema. Ele não repete padrão nem favorece número, mesmo rodando mil vezes.'] }
            ]
        }
    }
})

G('ger_numero_faixa', {
    emoji: '📏', titulo: 'Sortear número entre dois valores',
    descricao: 'Sorteia um número entre dois valores dados',
    uso: '<mínimo> <máximo> [quantidade]',
    exemplos: [{ args: '10 50', oque: 'entre dez e cinquenta' }, { args: '1 60 6', oque: 'seis números entre um e sessenta' }],
    dica: 'Os dois extremos entram no sorteio: mandar 1 e 10 pode sortear o 1 e o 10.',
    calcular(args) {
        const min = Math.round(exigirNumero(args[0], 'valor mínimo'))
        const max = Math.round(exigirNumero(args[1], 'valor máximo'))
        if (max < min) throw falha(`O máximo (${max}) está abaixo do mínimo (${min}). Inverta a ordem.`)
        if (max - min > 1e9) throw falha('A faixa é grande demais. Fique abaixo de um bilhão de diferença.')
        const qtd = args[2] ? Math.round(exigirNumero(args[2], 'quantidade de números', { minimo: 1, maximo: 50 })) : 1
        const saidas = []
        for (let i = 0; i < qtd; i++) saidas.push(aleatorio(min, max))
        return {
            intro: qtd === 1 ? `Sorteado: ${'*' + fmt(saidas[0], 0) + '*'}.` : `Sorteados: ${'*' + saidas.join(', ') + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre o sorteio', linhas: [`*Faixa:* de ${fmt(min, 0)} a ${fmt(max, 0)}`, `*Quantidade sorteada:* ${qtd}`, `*Números possíveis:* ${fmt(max - min + 1, 0)}`, `*Resultado:* ${saidas.join(', ')}`] },
                { emoji: '🔁', titulo: 'Sobre repetição', linhas: ['Cada número é sorteado por conta própria, então pode repetir. Para sortear sem repetir, use o comando de números distintos.'] }
            ]
        }
    }
})

G('ger_numeros_distintos', {
    emoji: '🔢', titulo: 'Sortear números sem repetir',
    descricao: 'Sorteia vários números diferentes de uma faixa',
    uso: '<quantos> <de 1 até>',
    exemplos: [{ args: '6 60', oque: 'seis números de 1 a 60' }, { args: '5 25', oque: 'cinco entre vinte e cinco' }],
    dica: 'Serve para rifa, bingo e jogo de loteria: nenhum número sai duas vezes.',
    calcular(args) {
        const quantos = Math.round(exigirNumero(args[0], 'quantidade de números', { minimo: 1, maximo: 100 }))
        const ate = Math.round(exigirNumero(args[1], 'número máximo', { minimo: 1, maximo: 10000 }))
        if (quantos > ate) throw falha(`Não dá para sortear ${quantos} números diferentes indo só até ${ate}.`)
        const pool = Array.from({ length: ate }, (_, i) => i + 1)
        const sorteados = embaralhar(pool).slice(0, quantos).sort((a, b) => a - b)
        return {
            intro: `Números sorteados: ${'*' + sorteados.join(' - ') + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre o sorteio', linhas: [`*Quantidade:* ${quantos}`, `*Faixa:* de 1 a ${ate}`, `*Em ordem:* ${sorteados.join(', ')}`, `*Soma dos sorteados:* ${sorteados.reduce((a, b) => a + b, 0)}`] },
                { emoji: '📊', titulo: 'Sobre a chance', linhas: [`Existem ${fmt((() => { let c = 1; for (let i = 1; i <= quantos; i++) c = c * (ate - quantos + i) / i; return Math.round(c) })(), 0)} combinações possíveis nessa faixa.`, 'Repetir o sorteio dá outro resultado: a chance de sair igual é a mesma de acertar por acaso.'] }
            ]
        }
    }
})

G('ger_sequencia', {
    emoji: '📜', titulo: 'Lista de números em sequência',
    descricao: 'Monta uma lista de números, embaralhada ou não',
    uso: '<de> <até> [passo] [embaralhar]',
    exemplos: [{ args: '1 20', oque: 'de um a vinte' }, { args: '0 100 10 embaralhar', oque: 'de dez em dez, fora de ordem' }],
    dica: 'Serve para numerar rifa, montar ordem de chamada e criar lista de conferência.',
    calcular(args) {
        const de = Math.round(exigirNumero(args[0], 'valor inicial'))
        const ate = Math.round(exigirNumero(args[1], 'valor final'))
        const passo = args[2] && num(args[2]) ? Math.abs(Math.round(exigirNumero(args[2], 'passo', { permiteZero: false }))) : 1
        const misturar = args.some(a => chave(a).startsWith('embaralh'))
        if (Math.abs(ate - de) / passo > 300) throw falha('Essa lista passaria de 300 números e não cabe na resposta. Aumente o passo ou diminua a faixa.')
        const lista = []
        if (ate >= de) { for (let i = de; i <= ate; i += passo) lista.push(i) } else { for (let i = de; i >= ate; i -= passo) lista.push(i) }
        const saida = misturar ? embaralhar(lista) : lista
        return {
            intro: `Lista com ${'*' + saida.length + ' números*'}, de ${de} a ${ate}.`,
            secoes: [
                { emoji: '🎯', titulo: 'A lista', linhas: [saida.join(', ')] },
                { emoji: '📊', titulo: 'Sobre ela', linhas: [`*Quantidade:* ${saida.length}`, `*Passo:* ${passo}`, `*Ordem:* ${misturar ? 'embaralhada' : 'crescente'}`, `*Soma:* ${fmt(lista.reduce((a, b) => a + b, 0), 0)}`] }
            ]
        }
    }
})

G('ger_sortear_nome', {
    emoji: '🏆', titulo: 'Sortear um nome da lista',
    descricao: 'Sorteia uma pessoa entre os nomes da lista',
    uso: '<nome1>, <nome2>, <nome3> ...',
    exemplos: [{ args: 'ana, bruno, carla, diego', oque: 'sorteia entre quatro' }, { args: 'joão maria pedro', oque: 'separado por espaço' }],
    dica: 'Separe por vírgula quando os nomes tiverem sobrenome, senão eu conto cada palavra como uma pessoa.',
    calcular(args) {
        const lista = itens(args, 2, 'nomes')
        const ganhador = sortear(lista)
        return {
            intro: `O nome sorteado é ${'*' + ganhador + '*'}!`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Sorteado:* ${ganhador}`, `*Participantes:* ${lista.length}`, `*Chance de cada um:* ${fmt(100 / lista.length, 2)}%`] },
                { emoji: '📋', titulo: 'Quem estava na lista', linhas: [lista.join(', ')] },
                { emoji: '🎲', titulo: 'Sorteio limpo', linhas: ['Sorteio criptográfico, sem tendência. Quem mandou a lista não tem vantagem nenhuma.'] }
            ]
        }
    }
})

G('ger_sortear_ganhadores', {
    emoji: '🥇', titulo: 'Sortear vários ganhadores',
    descricao: 'Sorteia mais de um ganhador sem repetir ninguém',
    uso: '<quantidade> <nome1>, <nome2>, ...',
    exemplos: [{ args: '2 ana, bruno, carla, diego', oque: 'dois ganhadores entre quatro' }, { args: '3 a, b, c, d, e, f', oque: 'três de seis' }],
    dica: 'Ninguém ganha duas vezes: quem sai da urna não volta para ela.',
    calcular(args) {
        const quantos = Math.round(exigirNumero(args[0], 'quantidade de ganhadores', { minimo: 1, maximo: 50 }))
        const lista = itens(args.slice(1), 2, 'nomes')
        if (quantos >= lista.length) throw falha(`Você pediu ${quantos} ganhadores entre ${lista.length} nomes. Sobrariam ${lista.length - quantos}: diminua a quantidade.`)
        const ordem = embaralhar(lista)
        const ganhadores = ordem.slice(0, quantos)
        const suplentes = ordem.slice(quantos, quantos + 3)
        return {
            intro: `Ganhadores: ${'*' + ganhadores.join(', ') + '*'}`,
            secoes: [
                { emoji: '🏅', titulo: 'Colocação', linhas: ganhadores.map((g, i) => `${i + 1}º lugar: ${g}`) },
                { emoji: '📋', titulo: 'Suplentes', linhas: suplentes.length ? suplentes.map((s, i) => `${i + 1}º suplente: ${s}`) : ['Não sobrou ninguém para a suplência.'] },
                { emoji: '🎯', titulo: 'Sobre o sorteio', linhas: [`*Participantes:* ${lista.length}`, `*Ganhadores:* ${quantos}`, `*Chance de cada um:* ${fmt(quantos / lista.length * 100, 2)}%`] }
            ]
        }
    }
})

G('ger_embaralhar', {
    emoji: '🔀', titulo: 'Embaralhar uma lista',
    descricao: 'Embaralha os itens de uma lista qualquer',
    uso: '<item1>, <item2>, <item3> ...',
    exemplos: [{ args: 'ana, bruno, carla, diego', oque: 'embaralha quatro nomes' }, { args: 'sacola pia lixo roupa', oque: 'ordem das tarefas' }],
    dica: 'Uso o embaralhamento de Fisher e Yates, o mesmo que garante baralho honesto.',
    calcular(args) {
        const lista = itens(args, 2, 'itens')
        const misturada = embaralhar(lista)
        return {
            intro: `Ordem embaralhada: ${'*' + misturada.join(', ') + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Nova ordem', linhas: misturada.map((item, i) => `${i + 1}. ${item}`) },
                { emoji: '📋', titulo: 'Como estava antes', linhas: [lista.join(', ')] },
                { emoji: '🎲', titulo: 'Sobre o embaralhamento', linhas: [`Existem ${fmt((() => { let f = 1; for (let i = 2; i <= Math.min(lista.length, 20); i++) f *= i; return f })(), 0)} ordens possíveis para ${Math.min(lista.length, 20)} itens. Cada uma tem a mesma chance.`] }
            ]
        }
    }
})

G('ger_times', {
    emoji: '⚽', titulo: 'Dividir em times',
    descricao: 'Divide os nomes em times equilibrados no tamanho',
    uso: '<quantidade de times> <nome1>, <nome2>, ...',
    exemplos: [{ args: '2 ana, bruno, carla, diego, edu, fabio', oque: 'dois times de três' }, { args: '3 a, b, c, d, e, f, g, h, i', oque: 'três times' }],
    dica: 'Quando o número não divide certinho, os primeiros times ficam com um jogador a mais.',
    calcular(args) {
        const qtdTimes = Math.round(exigirNumero(args[0], 'quantidade de times', { minimo: 2, maximo: 20 }))
        const lista = itens(args.slice(1), 2, 'nomes')
        if (lista.length < qtdTimes) throw falha(`Você tem ${lista.length} nomes para ${qtdTimes} times: alguém ficaria sozinho sem time.`)
        const misturada = embaralhar(lista)
        const times = Array.from({ length: qtdTimes }, () => [])
        misturada.forEach((n, i) => times[i % qtdTimes].push(n))
        const NOMES_TIME = ['Time A', 'Time B', 'Time C', 'Time D', 'Time E', 'Time F', 'Time G', 'Time H', 'Time I', 'Time J']
        return {
            intro: `${lista.length} pessoas divididas em ${'*' + qtdTimes + ' times*'}.`,
            secoes: times.map((t, i) => ({ emoji: '👥', titulo: NOMES_TIME[i] || `Time ${i + 1}`, linhas: t.map(n => `• ${n}`) })).concat([
                { emoji: '🎯', titulo: 'Resumo', linhas: [`*Participantes:* ${lista.length}`, `*Times:* ${qtdTimes}`, `*Tamanho dos times:* ${times.map(t => t.length).join(', ')}`, lista.length % qtdTimes === 0 ? 'Divisão exata, todos com o mesmo número.' : 'Divisão com sobra: os primeiros times ficaram com um a mais.'] }
            ])
        }
    }
})

G('ger_grupos', {
    emoji: '🧑‍🤝‍🧑', titulo: 'Dividir em grupos de tamanho fixo',
    descricao: 'Separa a lista em grupos de tamanho escolhido',
    uso: '<pessoas por grupo> <nome1>, <nome2>, ...',
    exemplos: [{ args: '3 a, b, c, d, e, f, g', oque: 'grupos de três' }, { args: '4 ana, bruno, carla, diego, edu', oque: 'grupos de quatro' }],
    dica: 'A diferença para o comando de times: aqui você manda o tamanho do grupo, não quantos grupos quer.',
    calcular(args) {
        const tamanho = Math.round(exigirNumero(args[0], 'pessoas por grupo', { minimo: 1, maximo: 50 }))
        const lista = itens(args.slice(1), 2, 'nomes')
        const misturada = embaralhar(lista)
        const grupos = []
        for (let i = 0; i < misturada.length; i += tamanho) grupos.push(misturada.slice(i, i + tamanho))
        return {
            intro: `${lista.length} pessoas em ${'*' + grupos.length + ' grupo(s)*'} de até ${tamanho}.`,
            secoes: grupos.map((g, i) => ({ emoji: '👥', titulo: `Grupo ${i + 1}`, linhas: g.map(n => `• ${n}`) })).concat([
                { emoji: '🎯', titulo: 'Resumo', linhas: [`*Total de pessoas:* ${lista.length}`, `*Tamanho pedido:* ${tamanho}`, `*Grupos formados:* ${grupos.length}`, `*Último grupo:* ${grupos[grupos.length - 1].length} pessoa(s)`] }
            ])
        }
    }
})

G('ger_escolher', {
    emoji: '🤔', titulo: 'Escolher entre opções',
    descricao: 'Escolhe uma opção quando você está em dúvida',
    uso: '<opção1>, <opção2>, ...',
    exemplos: [{ args: 'pizza, hambúrguer, comida japonesa', oque: 'escolhe o jantar' }, { args: 'praia, montanha, ficar em casa', oque: 'decide o passeio' }],
    dica: 'Se você torcer para dar outra coisa quando o resultado sair, já sabe o que queria de verdade.',
    calcular(args) {
        const lista = itens(args, 2, 'opções')
        const escolhida = sortear(lista)
        return {
            intro: `A escolhida é ${'*' + escolhida + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Escolhida:* ${escolhida}`, `*Opções na disputa:* ${lista.length}`, `*Chance de cada uma:* ${fmt(100 / lista.length, 1)}%`] },
                { emoji: '📋', titulo: 'Todas as opções', linhas: lista.map(o => `• ${o}${o === escolhida ? ' — escolhida' : ''}`) },
                { emoji: '🧠', titulo: 'Truque antigo', linhas: ['Prestar atenção na sua reação ao resultado costuma resolver a dúvida melhor que o sorteio em si.'] }
            ]
        }
    }
})

G('ger_ordem_fala', {
    emoji: '🗣️', titulo: 'Ordem de fala ou apresentação',
    descricao: 'Monta a ordem de quem fala ou se apresenta',
    uso: '<nome1>, <nome2>, ... [minutos por pessoa]',
    exemplos: [{ args: 'ana, bruno, carla', oque: 'ordem de três pessoas' }, { args: 'time1, time2, time3, time4', oque: 'ordem de apresentação' }],
    dica: 'Sorteio de ordem evita a briga do primeiro e do último, que costuma ser a parte mais demorada da reunião.',
    calcular(args) {
        const lista = itens(args, 2, 'nomes')
        const ordem = embaralhar(lista)
        const minutos = 5
        return {
            intro: `Quem abre é ${'*' + ordem[0] + '*'} e quem fecha é ${'*' + ordem[ordem.length - 1] + '*'}.`,
            secoes: [
                { emoji: '📋', titulo: 'Ordem sorteada', linhas: ordem.map((n, i) => `${i + 1}º — ${n}`) },
                { emoji: '⏱️', titulo: 'Se cada um tiver 5 minutos', linhas: ordem.map((n, i) => `• ${n}: começa no minuto ${i * minutos}`) },
                { emoji: '🎯', titulo: 'Resumo', linhas: [`*Participantes:* ${lista.length}`, `*Duração total a 5 min cada:* ${lista.length * minutos} minutos`] }
            ]
        }
    }
})

G('ger_escala_tarefas', {
    emoji: '🧹', titulo: 'Escala de tarefas entre pessoas',
    descricao: 'Monta uma escala de tarefas girando entre todos',
    uso: '<tarefas separadas por vírgula> ; <pessoas separadas por vírgula>',
    exemplos: [{ args: 'louça, lixo, banheiro ; ana, bruno, carla', oque: 'três tarefas e três pessoas' }, { args: 'cozinha, sala ; joão, maria', oque: 'duas de cada' }],
    dica: 'Use ponto e vírgula para separar a lista de tarefas da lista de pessoas.',
    calcular(args) {
        const bruto = args.join(' ')
        if (!bruto.includes(';')) throw falha('Separe as tarefas das pessoas com ponto e vírgula. Exemplo: louça, lixo ; ana, bruno.')
        const [parteTarefas, partePessoas] = bruto.split(';')
        const tarefas = parteTarefas.split(',').map(s => s.trim()).filter(Boolean)
        const pessoas = partePessoas.split(',').map(s => s.trim()).filter(Boolean)
        if (tarefas.length < 1) throw falha('Preciso de pelo menos uma tarefa antes do ponto e vírgula.')
        if (pessoas.length < 2) throw falha('Preciso de pelo menos duas pessoas depois do ponto e vírgula.')
        const ordem = embaralhar(pessoas)
        const semanas = 4
        const secoes = []
        for (let s = 0; s < semanas; s++) {
            secoes.push({ emoji: '📅', titulo: `Semana ${s + 1}`, linhas: tarefas.map((t, i) => `• ${t}: ${ordem[(i + s) % ordem.length]}`) })
        }
        return {
            intro: `Escala de ${'*' + tarefas.length + ' tarefa(s)*'} entre ${'*' + pessoas.length + ' pessoa(s)*'}, girando a cada semana.`,
            secoes: secoes.concat([
                { emoji: '🎯', titulo: 'Como a escala gira', linhas: ['Cada semana todo mundo anda uma casa na lista. Depois de uma volta completa, todos passaram por todas as tarefas.', `*Volta completa em:* ${pessoas.length} semanas`] }
            ])
        }
    }
})

G('ger_amigo_secreto', {
    emoji: '🎁', titulo: 'Sorteio de amigo secreto',
    descricao: 'Sorteia os pares do amigo secreto sem repetir',
    uso: '<nome1>, <nome2>, <nome3> ...',
    exemplos: [{ args: 'ana, bruno, carla, diego', oque: 'quatro participantes' }, { args: 'a, b, c', oque: 'o mínimo de três' }],
    dica: 'Mande esta lista só para quem organiza: o resultado revela quem tirou quem.',
    calcular(args) {
        const lista = itens(args, 3, 'nomes')
        if (new Set(lista.map(n => chave(n))).size !== lista.length) throw falha('Tem nome repetido na lista. Use apelido ou sobrenome para diferenciar.')
        const ordem = embaralhar(lista)
        const pares = ordem.map((n, i) => `• ${n} tirou ${ordem[(i + 1) % ordem.length]}`)
        return {
            intro: `Sorteio feito com ${'*' + lista.length + ' participantes*'}, ninguém tirou a si mesmo.`,
            secoes: [
                { emoji: '🤫', titulo: 'Quem tirou quem', linhas: pares },
                { emoji: '🎯', titulo: 'Sobre o sorteio', linhas: [`*Participantes:* ${lista.length}`, '*Método:* ciclo único, então todo mundo dá e recebe exatamente um presente', '*Ninguém tira a si mesmo:* garantido pelo formato do ciclo'] },
                { emoji: '📋', titulo: 'Para organizar', linhas: ['Combine o valor máximo do presente e a data antes de mandar os pares. Isso evita presente de valor muito diferente.'] }
            ]
        }
    }
})

G('ger_dado', {
    emoji: '🎲', titulo: 'Jogar um dado comum',
    descricao: 'Joga dados de seis faces e soma o resultado',
    uso: '[quantidade de dados]',
    exemplos: [{ args: '2', oque: 'dois dados, como no gamão' }, { args: '1', oque: 'um dado só' }],
    dica: 'Com dois dados, o 7 é o resultado mais provável: ele sai de seis combinações diferentes.',
    rodaSemArgumento: true,
    calcular(args) {
        const qtd = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de dados', { minimo: 1, maximo: 20 })) : 1
        const CARAS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
        const saidas = []
        for (let i = 0; i < qtd; i++) saidas.push(aleatorio(1, 6))
        const soma = saidas.reduce((a, b) => a + b, 0)
        return {
            intro: qtd === 1 ? `Saiu ${'*' + soma + '*'} ${CARAS[soma - 1]}.` : `Saiu ${'*' + soma + '*'} na soma: ${saidas.join(' + ')}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Dados jogados:* ${qtd}`, `*Valores:* ${saidas.map(v => `${v} ${CARAS[v - 1]}`).join(', ')}`, `*Soma:* ${soma}`, `*Média por dado:* ${fmt(soma / qtd, 2)}`] },
                { emoji: '📊', titulo: 'O que era esperado', linhas: [`*Mínimo possível:* ${qtd}`, `*Máximo possível:* ${qtd * 6}`, `*Média esperada:* ${fmt(qtd * 3.5, 1)}`, `*Seu resultado ficou:* ${soma > qtd * 3.5 ? 'acima' : soma < qtd * 3.5 ? 'abaixo' : 'em cima'} da média`] }
            ]
        }
    }
})

G('ger_dado_rpg', {
    emoji: '🐉', titulo: 'Rolar dado de mesa de RPG',
    descricao: 'Rola dados no formato 2d6 mais modificador',
    uso: '<quantidade e faces, ex 2d6+3>',
    exemplos: [{ args: '1d20', oque: 'o dado de vinte faces' }, { args: '3d6+2', oque: 'três dados de seis com bônus' }],
    dica: 'O formato é quantidade, a letra d, o número de faces e, se quiser, mais ou menos um número fixo.',
    rodaSemArgumento: true,
    calcular(args) {
        const bruto = (args.join('') || '1d20').toLowerCase().replace(/\s/g, '')
        const m = bruto.match(/^(\d{0,3})d(\d{1,4})([+-]\d{1,4})?$/)
        if (!m) throw falha(`Não entendi "${bruto.slice(0, 15)}". Escreva assim: 2d6+3.`)
        const qtd = m[1] ? Number(m[1]) : 1
        const faces = Number(m[2])
        const mod = m[3] ? Number(m[3]) : 0
        if (qtd < 1 || qtd > 50) throw falha('A quantidade de dados vai de 1 a 50.')
        if (faces < 2 || faces > 1000) throw falha('O número de faces vai de 2 a 1000.')
        const saidas = []
        for (let i = 0; i < qtd; i++) saidas.push(aleatorio(1, faces))
        const soma = saidas.reduce((a, b) => a + b, 0)
        const total = soma + mod
        const critico = faces === 20 && qtd === 1 ? (saidas[0] === 20 ? 'acerto crítico!' : saidas[0] === 1 ? 'falha crítica!' : null) : null
        return {
            intro: `Resultado: ${'*' + total + '*'}${critico ? ' — ' + critico : ''}`,
            secoes: [
                { emoji: '🎯', titulo: 'Rolagem', linhas: [`*Fórmula:* ${qtd}d${faces}${mod ? (mod > 0 ? '+' + mod : mod) : ''}`, `*Dados:* ${saidas.join(', ')}`, `*Soma dos dados:* ${soma}`, `*Total com modificador:* ${total}`] },
                { emoji: '📊', titulo: 'A faixa dessa rolagem', linhas: [`*Mínimo:* ${qtd + mod}`, `*Máximo:* ${qtd * faces + mod}`, `*Média esperada:* ${fmt(qtd * (faces + 1) / 2 + mod, 1)}`, `*Maior dado da rolagem:* ${Math.max(...saidas)}`] }
            ]
        }
    }
})

G('ger_moeda', {
    emoji: '🪙', titulo: 'Cara ou coroa',
    descricao: 'Joga uma moeda para tirar cara ou coroa',
    uso: '[quantidade de jogadas]',
    exemplos: [{ args: '1', oque: 'uma jogada' }, { args: '10', oque: 'dez jogadas seguidas' }],
    dica: 'Moeda não tem memória: depois de cinco caras seguidas, a próxima continua com metade de chance.',
    rodaSemArgumento: true,
    calcular(args) {
        const qtd = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de jogadas', { minimo: 1, maximo: 50 })) : 1
        const saidas = []
        for (let i = 0; i < qtd; i++) saidas.push(crypto.randomInt(0, 2) ? 'cara' : 'coroa')
        const caras = saidas.filter(s => s === 'cara').length
        return {
            intro: qtd === 1 ? `Deu ${'*' + saidas[0] + '*'}!` : `Deu ${'*' + caras + ' cara(s)*'} e ${qtd - caras} coroa(s).`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: qtd === 1 ? [`*Resultado:* ${saidas[0]}`, '*Chance de cada lado:* 50%'] : [`*Jogadas:* ${qtd}`, `*Sequência:* ${saidas.join(', ')}`, `*Caras:* ${caras} (${fmt(caras / qtd * 100, 1)}%)`, `*Coroas:* ${qtd - caras} (${fmt((qtd - caras) / qtd * 100, 1)}%)`] },
                { emoji: '📊', titulo: 'Sobre o acaso', linhas: ['Em poucas jogadas é normal ficar longe do meio a meio. A proporção só se aproxima de 50% em centenas de jogadas.'] }
            ]
        }
    }
})

G('ger_jokenpo', {
    emoji: '✌️', titulo: 'Pedra, papel ou tesoura',
    descricao: 'Sorteia pedra, papel ou tesoura para decidir',
    uso: '[pedra, papel ou tesoura para eu responder]',
    exemplos: [{ args: 'pedra', oque: 'você joga pedra' }, { args: 'tesoura', oque: 'você joga tesoura' }],
    dica: 'Serve para desempatar quando não dá para jogar de verdade, com cada um em um lugar.',
    rodaSemArgumento: true,
    calcular(args) {
        const OPCOES = ['pedra', 'papel', 'tesoura']
        const EMOJI = { pedra: '🪨', papel: '📄', tesoura: '✂️' }
        const meu = sortear(OPCOES)
        const seu = args.length ? chave(args[0]) : null
        if (!seu) {
            return {
                intro: `Eu escolhi ${'*' + meu + '*'} ${EMOJI[meu]}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Minha jogada', linhas: [`*Escolha:* ${meu}`, '*Chance de cada opção:* 33,3%', 'Mande a sua jogada junto do comando para eu dizer quem venceu.'] },
                    { emoji: '📋', titulo: 'As regras', linhas: ['• Pedra quebra tesoura', '• Tesoura corta papel', '• Papel embrulha pedra'] }
                ]
            }
        }
        if (!OPCOES.includes(seu)) throw falha(`Não entendi "${seu}". Jogue pedra, papel ou tesoura.`)
        const vence = { pedra: 'tesoura', papel: 'pedra', tesoura: 'papel' }
        const resultado = seu === meu ? 'empate' : vence[seu] === meu ? 'você venceu' : 'eu venci'
        return {
            intro: `Você ${EMOJI[seu]} contra eu ${EMOJI[meu]}: ${'*' + resultado + '*'}!`,
            secoes: [
                { emoji: '🎯', titulo: 'A partida', linhas: [`*Sua jogada:* ${seu}`, `*Minha jogada:* ${meu}`, `*Resultado:* ${resultado}`] },
                { emoji: '📋', titulo: 'As regras', linhas: ['• Pedra quebra tesoura', '• Tesoura corta papel', '• Papel embrulha pedra'] }
            ]
        }
    }
})

G('ger_roleta_sim_nao', {
    emoji: '🎯', titulo: 'Decidir sim ou não',
    descricao: 'Responde sim ou não quando você não decide',
    uso: '[sua pergunta]',
    exemplos: [{ args: 'devo sair hoje', oque: 'pergunta direta' }, { args: 'compro agora', oque: 'outra dúvida' }],
    dica: 'Vale para decisão pequena. Coisa grande merece uma lista de prós e contras, não um sorteio.',
    rodaSemArgumento: true,
    calcular(args) {
        const pergunta = args.join(' ').trim()
        const RESPOSTAS = ['sim', 'não', 'sim, sem dúvida', 'melhor não', 'sim, mas depois', 'não agora', 'talvez, pense mais um dia', 'sim, vá em frente']
        const r = sortear(RESPOSTAS)
        return {
            intro: pergunta ? `Sobre "${pergunta}": ${'*' + r + '*'}.` : `A resposta é ${'*' + r + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Resposta sorteada:* ${r}`, `*Pergunta:* ${pergunta || 'você não escreveu, mas a resposta vale assim mesmo'}`, `*Respostas possíveis:* ${RESPOSTAS.length}`] },
                { emoji: '🧠', titulo: 'Antes de obedecer', linhas: ['Se você leu a resposta e sentiu alívio ou decepção, essa sensação vale mais que o sorteio.'] }
            ]
        }
    }
})

G('ger_bingo_numero', {
    emoji: '🔠', titulo: 'Sortear número de bingo',
    descricao: 'Sorteia um número de bingo com a letra dele',
    uso: '[número máximo, 75 ou 90]',
    exemplos: [{ args: '75', oque: 'bingo americano de 75 bolas' }, { args: '90', oque: 'bingo de 90 bolas' }],
    dica: 'No bingo de 75, cada letra cobre 15 números: B de 1 a 15, I de 16 a 30, e assim por diante.',
    rodaSemArgumento: true,
    calcular(args) {
        const max = args[0] ? Math.round(exigirNumero(args[0], 'número máximo', { minimo: 10, maximo: 999 })) : 75
        const n = aleatorio(1, max)
        const letras = 'BINGO'
        const faixa = Math.ceil(max / 5)
        const letra = letras[Math.min(4, Math.floor((n - 1) / faixa))]
        return {
            intro: `Bola sorteada: ${'*' + letra + '-' + n + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Número:* ${n}`, `*Letra:* ${letra}`, `*Faixa da letra:* de ${Math.floor((n - 1) / faixa) * faixa + 1} a ${Math.min(max, (Math.floor((n - 1) / faixa) + 1) * faixa)}`, `*Bolas no jogo:* ${max}`] },
                { emoji: '📊', titulo: 'As cinco faixas', linhas: Array.from({ length: 5 }, (_, i) => `• ${letras[i]}: de ${i * faixa + 1} a ${Math.min(max, (i + 1) * faixa)}`) }
            ]
        }
    }
})

G('ger_bingo_cartela', {
    emoji: '🎟️', titulo: 'Cartela de bingo',
    descricao: 'Monta uma cartela de bingo de cinco colunas',
    uso: '[quantidade de cartelas, até 3]',
    exemplos: [{ args: '1', oque: 'uma cartela' }, { args: '2', oque: 'duas cartelas diferentes' }],
    dica: 'Cada coluna sorteia da faixa dela, sem repetir número dentro da mesma cartela.',
    rodaSemArgumento: true,
    calcular(args) {
        const qtd = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de cartelas', { minimo: 1, maximo: 3 })) : 1
        const letras = 'BINGO'
        const secoes = []
        for (let c = 0; c < qtd; c++) {
            const colunas = []
            for (let i = 0; i < 5; i++) {
                const pool = Array.from({ length: 15 }, (_, k) => i * 15 + k + 1)
                colunas.push(embaralhar(pool).slice(0, 5).sort((a, b) => a - b))
            }
            const linhas = []
            for (let linha = 0; linha < 5; linha++) {
                const valores = colunas.map((col, i) => (i === 2 && linha === 2) ? ' livre' : String(col[linha]).padStart(5, ' '))
                linhas.push(valores.join(' '))
            }
            secoes.push({ emoji: '🎟️', titulo: `Cartela ${c + 1} — ${letras.split('').join('  ')}`, linhas })
        }
        return {
            intro: `${'*' + qtd + ' cartela(s)*'} de bingo, prontas para jogar.`,
            secoes: secoes.concat([
                { emoji: '🎯', titulo: 'Como ler', linhas: ['Cada coluna vem da faixa da letra: B de 1 a 15, I de 16 a 30, N de 31 a 45, G de 46 a 60 e O de 61 a 75.', 'O centro é o espaço livre, que já conta como marcado.'] }
            ])
        }
    }
})

G('ger_megasena', {
    emoji: '🍀', titulo: 'Jogo da Mega-Sena',
    descricao: 'Monta jogos de seis a quinze dezenas sorteadas',
    uso: '[dezenas por jogo, de 6 a 15] [quantidade de jogos]',
    exemplos: [{ args: '6', oque: 'um jogo simples' }, { args: '7 3', oque: 'três jogos de sete dezenas' }],
    dica: 'Jogo com mais dezenas custa muito mais: de 6 para 7 o preço multiplica por 7.',
    rodaSemArgumento: true,
    calcular(args) {
        const dezenas = args[0] ? Math.round(exigirNumero(args[0], 'dezenas por jogo', { minimo: 6, maximo: 15 })) : 6
        const jogos = args[1] ? Math.round(exigirNumero(args[1], 'quantidade de jogos', { minimo: 1, maximo: 10 })) : 1
        const pool = Array.from({ length: 60 }, (_, i) => i + 1)
        const linhas = []
        for (let j = 0; j < jogos; j++) {
            const nums = embaralhar(pool).slice(0, dezenas).sort((a, b) => a - b)
            linhas.push(`• Jogo ${j + 1}: ${nums.map(n => String(n).padStart(2, '0')).join(' - ')}`)
        }
        let comb = 1
        for (let i = 1; i <= 6; i++) comb = comb * (60 - 6 + i) / i
        let minhas = 1
        for (let i = 1; i <= 6; i++) minhas = minhas * (dezenas - 6 + i) / i
        return {
            intro: `${'*' + jogos + ' jogo(s)*'} de ${dezenas} dezenas, sorteados com segurança.`,
            secoes: [
                { emoji: '🎰', titulo: 'Seus jogos', linhas },
                { emoji: '📊', titulo: 'Sobre a chance', linhas: [`*Combinações possíveis:* ${fmt(Math.round(comb), 0)}`, `*Jogos de 6 dentro de cada aposta:* ${fmt(Math.round(minhas), 0)}`, `*Sua chance por aposta:* 1 em ${fmt(Math.round(comb / minhas), 0)}`] },
                { emoji: '🧠', titulo: 'Sem ilusão', linhas: ['Número que saiu pouco não está atrasado: cada sorteio recomeça do zero. Aposte só o que não faz falta.'] }
            ]
        }
    }
})

G('ger_loteria', {
    emoji: '🎰', titulo: 'Jogo de outras loterias',
    descricao: 'Monta jogo de Quina, Lotofácil ou Lotomania',
    uso: '<quina, lotofacil, lotomania ou duplasena>',
    exemplos: [{ args: 'lotofacil', oque: 'quinze dezenas de 1 a 25' }, { args: 'quina', oque: 'cinco dezenas de 1 a 80' }],
    dica: 'Cada loteria tem faixa e quantidade próprias. Eu uso a aposta mínima de cada uma.',
    calcular(args) {
        const nome = chave(args[0] || 'quina').replace(/[^a-z]/g, '')
        const JOGOS = {
            quina: { ate: 80, quantos: 5, premio: 'acertar 5 dezenas' },
            lotofacil: { ate: 25, quantos: 15, premio: 'acertar 15 dezenas' },
            lotomania: { ate: 100, quantos: 50, premio: 'acertar 20, ou nenhuma' },
            duplasena: { ate: 50, quantos: 6, premio: 'acertar 6 em um dos dois sorteios' },
            timemania: { ate: 80, quantos: 10, premio: 'acertar 7 dezenas' }
        }
        const j = JOGOS[nome]
        if (!j) throw falha(`Não conheço a loteria "${nome}". Escolha: ${Object.keys(JOGOS).join(', ')}.`)
        const pool = Array.from({ length: j.ate }, (_, i) => (nome === 'lotomania' ? i : i + 1))
        const nums = embaralhar(pool).slice(0, j.quantos).sort((a, b) => a - b)
        let comb = 1
        for (let i = 1; i <= j.quantos; i++) comb = comb * (j.ate - j.quantos + i) / i
        return {
            intro: `Seu jogo da ${'*' + nome + '*'}: ${'*' + nums.slice(0, 10).map(n => String(n).padStart(2, '0')).join(' - ') + (nums.length > 10 ? ' ...' : '') + '*'}`,
            secoes: [
                { emoji: '🎰', titulo: 'Dezenas sorteadas', linhas: [nums.map(n => String(n).padStart(2, '0')).join(' - ')] },
                { emoji: '🎯', titulo: 'Sobre o jogo', linhas: [`*Loteria:* ${nome}`, `*Dezenas por aposta:* ${j.quantos}`, `*Faixa:* de ${pool[0]} a ${pool[pool.length - 1]}`, `*Prêmio principal:* ${j.premio}`] },
                { emoji: '📊', titulo: 'Sobre a chance', linhas: [`Existem ${fmt(Math.round(comb), 0)} combinações possíveis nessa faixa.`, 'Aposte por diversão, com valor que não faz falta no orçamento.'] }
            ]
        }
    }
})

G('ger_cor', {
    emoji: '🎨', titulo: 'Sortear uma cor',
    descricao: 'Sorteia uma cor com o código dela',
    uso: '[quantidade de cores]',
    exemplos: [{ args: '1', oque: 'uma cor' }, { args: '3', oque: 'três cores de uma vez' }],
    dica: 'O código em cerquilha serve em editor de imagem, site e apresentação.',
    rodaSemArgumento: true,
    calcular(args) {
        const qtd = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de cores', { minimo: 1, maximo: 10 })) : 1
        const cores = []
        for (let i = 0; i < qtd; i++) {
            const r = crypto.randomInt(0, 256), g = crypto.randomInt(0, 256), b = crypto.randomInt(0, 256)
            const hex = [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
            const luz = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            cores.push({ hex, r, g, b, luz })
        }
        const c = cores[0]
        return {
            intro: `Cor sorteada: ${'*#' + c.hex + '*'}`,
            secoes: [
                { emoji: '🎨', titulo: 'As cores', linhas: cores.map(x => `• #${x.hex} — vermelho ${x.r}, verde ${x.g}, azul ${x.b}`) },
                { emoji: '🎯', titulo: 'Sobre a primeira', linhas: [`*Código:* #${c.hex}`, `*Em RGB:* ${c.r}, ${c.g}, ${c.b}`, `*Brilho:* ${fmt(c.luz * 100, 0)}%`, `*Texto que fica legível em cima:* ${c.luz > 0.55 ? 'preto' : 'branco'}`] },
                { emoji: '💡', titulo: 'Onde usar', linhas: ['Copie o código com a cerquilha para o editor de imagem, para a planilha ou para o site.'] }
            ]
        }
    }
})

G('ger_paleta', {
    emoji: '🖌️', titulo: 'Paleta de cores que combinam',
    descricao: 'Monta uma paleta de cores a partir de uma base',
    uso: '[cor base em hexadecimal]',
    exemplos: [{ args: '1E88E5', oque: 'paleta a partir de um azul' }, { args: 'E53935', oque: 'a partir de um vermelho' }],
    dica: 'A paleta usa o círculo de cores: a complementar fica no lado oposto, e as análogas, ao lado.',
    rodaSemArgumento: true,
    calcular(args) {
        let hex = String(args[0] || '').replace(/[^0-9a-fA-F]/g, '').toUpperCase()
        let nomeBase = null
        if (!hex) { const escolhida = sortear(CORES_NOMES); hex = escolhida[1]; nomeBase = escolhida[0] }
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
        if (hex.length !== 6) throw falha(`"${String(args[0] || '').slice(0, 10)}" não é uma cor em hexadecimal. Escreva seis caracteres, como 1E88E5.`)
        const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16)
        const paraHex = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0').toUpperCase()
        const girar = (graus) => {
            const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255
            const l = (max + min) / 2
            const d = max - min
            const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
            let h = 0
            if (d !== 0) {
                if (max === r / 255) h = ((g - b) / 255 / d) % 6
                else if (max === g / 255) h = (b - r) / 255 / d + 2
                else h = (r - g) / 255 / d + 4
            }
            h = (h * 60 + graus + 360) % 360
            const c2 = (1 - Math.abs(2 * l - 1)) * s
            const x = c2 * (1 - Math.abs((h / 60) % 2 - 1))
            const m = l - c2 / 2
            let rr = 0, gg = 0, bb = 0
            if (h < 60) { rr = c2; gg = x } else if (h < 120) { rr = x; gg = c2 } else if (h < 180) { gg = c2; bb = x } else if (h < 240) { gg = x; bb = c2 } else if (h < 300) { rr = x; bb = c2 } else { rr = c2; bb = x }
            return paraHex((rr + m) * 255) + paraHex((gg + m) * 255) + paraHex((bb + m) * 255)
        }
        return {
            intro: `Paleta a partir de ${'*#' + hex + '*'}${nomeBase ? ` (${nomeBase})` : ''}.`,
            secoes: [
                { emoji: '🎨', titulo: 'A paleta', linhas: [`• Base: #${hex}`, `• Complementar: #${girar(180)}`, `• Análoga à esquerda: #${girar(-30)}`, `• Análoga à direita: #${girar(30)}`, `• Tríade 1: #${girar(120)}`, `• Tríade 2: #${girar(240)}`] },
                { emoji: '🎯', titulo: 'Sobre a base', linhas: [`*Em RGB:* ${r}, ${g}, ${b}`, `*Brilho:* ${fmt((0.299 * r + 0.587 * g + 0.114 * b) / 255 * 100, 0)}%`, `*Cor de texto por cima:* ${(0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? 'preto' : 'branco'}`] },
                { emoji: '💡', titulo: 'Como usar', linhas: ['Use a base em 60% do espaço, a análoga em 30% e a complementar só nos detalhes que precisam chamar atenção.'] }
            ]
        }
    }
})

G('ger_apelido', {
    emoji: '😎', titulo: 'Sugestão de apelido',
    descricao: 'Sorteia sugestões de apelido para usar em jogo',
    uso: '[quantidade de sugestões]',
    exemplos: [{ args: '5', oque: 'cinco sugestões' }, { args: '3', oque: 'três sugestões' }],
    dica: 'Apelido bom é curto e fácil de falar em voz alta.',
    rodaSemArgumento: true,
    calcular(args) {
        const qtd = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de sugestões', { minimo: 1, maximo: 15 })) : 5
        const lista = []
        for (let i = 0; i < qtd; i++) {
            const a = sortear(ADJETIVOS)
            const b = sortear(ANIMAIS)
            lista.push(cap(b) + cap(a) + (crypto.randomInt(0, 2) ? crypto.randomInt(10, 100) : ''))
        }
        return {
            intro: `Que tal ${'*' + lista[0] + '*'}?`,
            secoes: [
                { emoji: '📋', titulo: 'Sugestões', linhas: lista.map(n => `• ${n}`) },
                { emoji: '🎯', titulo: 'Como elas nascem', linhas: [`*Adjetivos na lista:* ${ADJETIVOS.length}`, `*Animais na lista:* ${ANIMAIS.length}`, `*Combinações possíveis:* mais de ${fmt(ADJETIVOS.length * ANIMAIS.length * 91, 0)}`] },
                { emoji: '💡', titulo: 'Antes de escolher', linhas: ['Procure o apelido na internet antes de adotar: ele pode já significar alguma coisa que você não quer.'] }
            ]
        }
    }
})

G('ger_usuario', {
    emoji: '🧑‍💻', titulo: 'Sugestão de nome de usuário',
    descricao: 'Monta sugestões de nome de usuário a partir do seu',
    uso: '<seu nome>',
    exemplos: [{ args: 'maria silva', oque: 'sugestões com nome e sobrenome' }, { args: 'joão', oque: 'só com o primeiro nome' }],
    dica: 'Nome de usuário sem número é mais fácil de ditar. Número no fim costuma ser o último recurso.',
    calcular(args) {
        const bruto = args.join(' ').trim()
        if (!bruto) throw falha('Digite o seu nome para eu montar as sugestões.')
        const limpo = chave(bruto).replace(/[^a-z\s]/g, '').trim()
        const partes = limpo.split(/\s+/).filter(Boolean)
        if (!partes.length) throw falha('Preciso de pelo menos uma palavra com letras para montar o nome de usuário.')
        const nome = partes[0]
        const sobre = partes[partes.length - 1]
        const sugestoes = new Set()
        sugestoes.add(nome + (partes.length > 1 ? sobre : ''))
        if (partes.length > 1) { sugestoes.add(nome + '.' + sobre); sugestoes.add(nome[0] + sobre); sugestoes.add(nome + '_' + sobre) }
        sugestoes.add(nome + crypto.randomInt(10, 100))
        sugestoes.add(sortear(ADJETIVOS) + cap(nome))
        sugestoes.add(nome + sortear(ANIMAIS))
        const lista = [...sugestoes].slice(0, 8)
        return {
            intro: `Sugestões para ${'*' + bruto + '*'}: a primeira é ${'*' + lista[0] + '*'}.`,
            secoes: [
                { emoji: '📋', titulo: 'Sugestões', linhas: lista.map(s => `• ${s}`) },
                { emoji: '🎯', titulo: 'Detalhes', linhas: [`*Nome usado:* ${nome}`, partes.length > 1 ? `*Sobrenome usado:* ${sobre}` : '*Sobrenome:* você mandou só um nome', `*Sugestões geradas:* ${lista.length}`] },
                { emoji: '🔒', titulo: 'Cuidado', linhas: ['Não use ano de nascimento no nome de usuário: ele entrega sua idade e ajuda quem tenta adivinhar sua senha.'] }
            ]
        }
    }
})

G('ger_nome_time', {
    emoji: '🏁', titulo: 'Nome para time ou grupo',
    descricao: 'Sorteia nomes para time, grupo ou equipe',
    uso: '[quantidade de sugestões]',
    exemplos: [{ args: '5', oque: 'cinco nomes' }, { args: '8', oque: 'oito nomes' }],
    dica: 'Nome de grupo funciona melhor quando é fácil de gritar na torcida.',
    rodaSemArgumento: true,
    calcular(args) {
        const qtd = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de sugestões', { minimo: 1, maximo: 15 })) : 5
        const PREFIXOS = ['Os', 'As', 'Esquadrão', 'Time', 'Grupo', 'Aliança', 'Tropa', 'Clube']
        const NUCLEOS = ['Trovão', 'Relâmpago', 'Muralha', 'Foguete', 'Pantera', 'Tempestade', 'Estrela', 'Flecha', 'Coragem', 'Vitória', 'Farol', 'Chama']
        const lista = []
        for (let i = 0; i < qtd; i++) {
            const p = sortear(PREFIXOS)
            const n = sortear(NUCLEOS)
            lista.push(crypto.randomInt(0, 2) ? `${p} ${n}` : `${n} ${cap(sortear(ADJETIVOS))}`)
        }
        return {
            intro: `Sugestão principal: ${'*' + lista[0] + '*'}`,
            secoes: [
                { emoji: '📋', titulo: 'Sugestões', linhas: lista.map(n => `• ${n}`) },
                { emoji: '🎯', titulo: 'Como escolher', linhas: ['Fale o nome em voz alta antes de decidir. Se travar na língua, a torcida não vai gritar.', `*Combinações possíveis:* mais de ${fmt(PREFIXOS.length * NUCLEOS.length + NUCLEOS.length * ADJETIVOS.length, 0)}`] }
            ]
        }
    }
})

G('ger_codigo', {
    emoji: '🔣', titulo: 'Código de confirmação',
    descricao: 'Gera um código curto de confirmação',
    uso: '[tamanho, de 4 a 12]',
    exemplos: [{ args: '6', oque: 'código de seis caracteres' }, { args: '8', oque: 'código mais longo' }],
    dica: 'Serve para confirmar retirada, entrega e presença sem depender de aplicativo.',
    rodaSemArgumento: true,
    calcular(args) {
        const n = args[0] ? Math.round(exigirNumero(args[0], 'tamanho do código', { minimo: 4, maximo: 12 })) : 6
        const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        const codigo = semMarcador(() => letrasSorteadas(alfabeto, n))
        return {
            intro: `Código: ${'*' + codigo + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre o código', linhas: [`*Código:* ${codigo}`, `*Tamanho:* ${n} caracteres`, `*Combinações possíveis:* ${fmt(Math.pow(alfabeto.length, n), 0)}`, '*Sem caractere que confunde:* fora o zero, o O, o um e o I'] },
                { emoji: '💡', titulo: 'Para usar', linhas: ['Combine a validade junto: código sem prazo de validade acaba usado duas vezes.'] }
            ]
        }
    }
})

G('ger_cupom', {
    emoji: '🏷️', titulo: 'Código de cupom promocional',
    descricao: 'Monta códigos de cupom com prefixo de campanha',
    uso: '[prefixo] [quantidade]',
    exemplos: [{ args: 'NATAL 5', oque: 'cinco cupons de Natal' }, { args: 'BEMVINDO', oque: 'um cupom de boas-vindas' }],
    dica: 'Prefixo com nome da campanha facilita a conferência depois, na hora de contar quantos foram usados.',
    rodaSemArgumento: true,
    calcular(args) {
        const prefixo = (String(args[0] || 'CUPOM').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'CUPOM').slice(0, 12)
        const qtd = args[1] ? Math.round(exigirNumero(args[1], 'quantidade de cupons', { minimo: 1, maximo: 20 })) : 1
        const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        const lista = []
        for (let i = 0; i < qtd; i++) lista.push(prefixo + '-' + semMarcador(() => letrasSorteadas(alfabeto, 5)))
        return {
            intro: `Cupom: ${'*' + lista[0] + '*'}`,
            secoes: [
                { emoji: '🎟️', titulo: 'Cupons gerados', linhas: lista.map(c => `• ${c}`) },
                { emoji: '🎯', titulo: 'Sobre eles', linhas: [`*Prefixo:* ${prefixo}`, `*Quantidade:* ${qtd}`, `*Parte sorteada:* 5 caracteres`, `*Chance de dois saírem iguais:* muito baixa, com ${fmt(Math.pow(32, 5), 0)} combinações`] },
                { emoji: '📋', titulo: 'Antes de divulgar', linhas: ['Defina validade, limite de uso e valor mínimo de compra. Cupom sem regra clara vira prejuízo.'] }
            ]
        }
    }
})

G('ger_uuid', {
    emoji: '🆔', titulo: 'Identificador único',
    descricao: 'Gera um identificador único no formato UUID',
    uso: '[quantidade]',
    exemplos: [{ args: '1', oque: 'um identificador' }, { args: '3', oque: 'três de uma vez' }],
    dica: 'É o mesmo formato de chave aleatória do PIX e de identificador de banco de dados.',
    rodaSemArgumento: true,
    calcular(args) {
        const qtd = args[0] ? Math.round(exigirNumero(args[0], 'quantidade', { minimo: 1, maximo: 10 })) : 1
        const lista = []
        for (let i = 0; i < qtd; i++) lista.push(crypto.randomUUID())
        return {
            intro: `Identificador: ${'*' + lista[0] + '*'}`,
            secoes: [
                { emoji: '🆔', titulo: 'Gerados', linhas: lista.map(u => `• ${u}`) },
                { emoji: '🎯', titulo: 'Sobre o formato', linhas: ['*Versão:* 4, sorteada por inteiro', '*Tamanho:* 36 caracteres com os traços', '*Combinações:* mais de 5 seguido de 36 zeros', '*Chance de repetir:* na prática, nenhuma'] },
                { emoji: '💡', titulo: 'Onde usar', linhas: ['Serve como número de pedido, de protocolo e de chave em sistema, sem depender de contador central.'] }
            ]
        }
    }
})

G('ger_token', {
    emoji: '🔗', titulo: 'Chave aleatória em hexadecimal',
    descricao: 'Gera uma chave aleatória longa em hexadecimal',
    uso: '[bytes, de 8 a 64]',
    exemplos: [{ args: '16', oque: 'chave de 32 caracteres' }, { args: '32', oque: 'chave de 64 caracteres' }],
    dica: 'Cada byte vira dois caracteres. Para chave de sistema, 32 bytes é o tamanho usual.',
    rodaSemArgumento: true,
    calcular(args) {
        const bytes = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de bytes', { minimo: 8, maximo: 64 })) : 16
        const hex = crypto.randomBytes(bytes).toString('hex')
        const base64 = crypto.randomBytes(bytes).toString('base64url')
        return {
            intro: `Chave: ${'*' + hex + '*'}`,
            secoes: [
                { emoji: '🎯', titulo: 'Sobre a chave', linhas: [`*Em hexadecimal:* ${hex}`, `*Bytes de sorteio:* ${bytes}`, `*Caracteres:* ${hex.length}`, `*Força:* ${bytes * 8} bits`] },
                { emoji: '🔤', titulo: 'Outra forma', linhas: [`*Em base 64 para link:* ${base64}`, 'A versão para link é mais curta e não usa caractere que precisa ser escapado.'] },
                { emoji: '🔒', titulo: 'Cuidado', linhas: ['Chave de sistema não vai para mensagem nem para arquivo de código. Guarde em variável de ambiente ou em cofre de senha.'] }
            ]
        }
    }
})

G('ger_id_curto', {
    emoji: '🎫', titulo: 'Código curto para identificar',
    descricao: 'Gera um código curto para numerar pedido ou ficha',
    uso: '[tamanho, de 4 a 16] [quantidade]',
    exemplos: [{ args: '8', oque: 'um código de oito' }, { args: '6 5', oque: 'cinco códigos de seis' }],
    dica: 'Usa letras e números misturados: cabe em pouco espaço e quase nunca repete.',
    rodaSemArgumento: true,
    calcular(args) {
        const n = args[0] ? Math.round(exigirNumero(args[0], 'tamanho do código', { minimo: 4, maximo: 16 })) : 8
        const qtd = args[1] ? Math.round(exigirNumero(args[1], 'quantidade', { minimo: 1, maximo: 20 })) : 1
        const alfabeto = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        const lista = []
        for (let i = 0; i < qtd; i++) lista.push(semMarcador(() => letrasSorteadas(alfabeto, n)))
        return {
            intro: `Código curto: ${'*' + lista[0] + '*'}`,
            secoes: [
                { emoji: '🎫', titulo: 'Códigos', linhas: lista.map(c => `• ${c}`) },
                { emoji: '🎯', titulo: 'Sobre eles', linhas: [`*Tamanho:* ${n}`, `*Alfabeto:* ${alfabeto.length} caracteres`, `*Combinações:* ${fmt(Math.pow(alfabeto.length, n), 0)}`, `*Força:* ${fmt(n * Math.log2(alfabeto.length), 0)} bits`] },
                { emoji: '💡', titulo: 'Sobre repetição', linhas: [`Gerando mil códigos desse tamanho, a chance de dois saírem iguais é praticamente zero. Mesmo assim, confira antes de gravar em banco.`] }
            ]
        }
    }
})

G('ger_nome_arquivo', {
    emoji: '🗂️', titulo: 'Nome de arquivo com data',
    descricao: 'Monta um nome de arquivo com data e hora',
    uso: '[descrição] [extensão]',
    exemplos: [{ args: 'relatorio vendas pdf', oque: 'nome para um relatório' }, { args: 'backup zip', oque: 'nome para um backup' }],
    dica: 'Data no começo, no formato ano, mês e dia, faz a pasta ficar em ordem sozinha.',
    rodaSemArgumento: true,
    calcular(args) {
        const EXTENSOES = ['pdf', 'zip', 'jpg', 'png', 'csv', 'txt', 'docx', 'xlsx', 'mp4', 'json']
        const palavras = args.map(a => chave(a).replace(/[^a-z0-9]/g, '')).filter(Boolean)
        let ext = 'txt'
        if (palavras.length && EXTENSOES.includes(palavras[palavras.length - 1])) ext = palavras.pop()
        const base = palavras.length ? palavras.join('-') : 'arquivo'
        const agora = new Date()
        const data = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora).replace(/-/g, '')
        const hora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(agora).replace(':', '')
        const sufixo = letrasSorteadas('abcdefghijkmnpqrstuvwxyz23456789', 4)
        return {
            intro: `Nome sugerido: ${'*' + data + '-' + base + '.' + ext + '*'}`,
            secoes: [
                { emoji: '🗂️', titulo: 'Três formatos', linhas: [`• Por data: ${data}-${base}.${ext}`, `• Com hora: ${data}-${hora}-${base}.${ext}`, `• Com código único: ${base}-${data}-${sufixo}.${ext}`] },
                { emoji: '🎯', titulo: 'Detalhes', linhas: [`*Descrição usada:* ${base}`, `*Extensão:* ${ext}`, `*Data de hoje:* ${data}`, '*Tudo em minúscula e com hífen:* evita problema entre sistemas'] },
                { emoji: '💡', titulo: 'Por que sem acento e sem espaço', linhas: ['Espaço e acento quebram link, atrapalham envio por servidor e viram código estranho em outro sistema.'] }
            ]
        }
    }
})

G('ger_lorem', {
    emoji: '📄', titulo: 'Parágrafos falsos em português',
    descricao: 'Monta parágrafos falsos para testar um layout',
    uso: '[parágrafos, de 1 a 5]',
    exemplos: [{ args: '1', oque: 'um parágrafo' }, { args: '3', oque: 'três parágrafos' }],
    dica: 'Serve para ver como o texto fica no espaço antes de escrever o conteúdo de verdade.',
    rodaSemArgumento: true,
    calcular(args) {
        const qtd = args[0] ? Math.round(exigirNumero(args[0], 'quantidade de parágrafos', { minimo: 1, maximo: 5 })) : 1
        const CONECTIVOS = ['porque', 'quando', 'embora', 'enquanto', 'assim que', 'ainda que', 'depois que']
        const VERBOS = ['passa', 'volta', 'cresce', 'muda', 'espera', 'guarda', 'atravessa', 'encontra', 'segura', 'devolve']
        const paragrafos = []
        let totalPalavras = 0
        for (let p = 0; p < qtd; p++) {
            const frases = []
            const qtdFrases = crypto.randomInt(3, 6)
            for (let f = 0; f < qtdFrases; f++) {
                const n1 = sortear(LOREM_PALAVRAS), n2 = sortear(LOREM_PALAVRAS), n3 = sortear(LOREM_PALAVRAS)
                const v = sortear(VERBOS), c = sortear(CONECTIVOS)
                const frase = `A ${n1} ${v} pela ${n2} ${c} a ${n3} não responde`
                frases.push(cap(frase) + '.')
                totalPalavras += frase.split(' ').length
            }
            paragrafos.push(frases.join(' '))
        }
        return {
            intro: `${'*' + qtd + ' parágrafo(s)*'} de teste, com ${totalPalavras} palavras.`,
            secoes: paragrafos.map((t, i) => ({ emoji: '📄', titulo: `Parágrafo ${i + 1}`, linhas: [t] })).concat([
                { emoji: '🎯', titulo: 'Sobre o texto', linhas: [`*Parágrafos:* ${qtd}`, `*Palavras:* ${totalPalavras}`, `*Caracteres:* ${paragrafos.join(' ').length}`, '*Idioma:* português, para o teste mostrar o tamanho real das palavras'] },
                { emoji: '💡', titulo: 'Por que em português', linhas: ['Texto de teste em latim engana a medida: palavra em português é mais longa e ocupa mais linha no mesmo espaço.'] }
            ])
        }
    }
})

/* ═══════════════════════════ DATA E HORA ═══════════════════════════
 * Toda data aqui é calculada em UTC puro, sem hora, para o resultado não mudar
 * com horário de verão. O "hoje" vem do relógio de Brasília.
 */

const RELOGIOS = [
    ['Brasília', 'America/Sao_Paulo'], ['Manaus', 'America/Manaus'], ['Rio Branco', 'America/Rio_Branco'],
    ['Fernando de Noronha', 'America/Noronha'], ['Lisboa', 'Europe/Lisbon'], ['Nova York', 'America/New_York'],
    ['Londres', 'Europe/London'], ['Tóquio', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney'], ['Luanda', 'Africa/Luanda']
]

function horaEm(tz, quando) {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(quando)
}

function diaEm(tz, quando) {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit', weekday: 'short' }).format(quando)
}

/** Lê "8:30", "8h30" ou "830" como minutos do dia. */
function lerHorario(texto, rotulo = 'horário', { maxHora = 23 } = {}) {
    const s = String(texto || '').trim().toLowerCase().replace(/\s/g, '')
    let m = s.match(/^(\d{1,3})[:h.](\d{1,2})$/)
    if (!m) m = s.match(/^(\d{1,3})h$/)
    if (!m && /^\d{3,4}$/.test(s)) m = [s, s.slice(0, s.length - 2), s.slice(-2)]
    if (!m && /^\d{1,2}$/.test(s)) m = [s, s, '0']
    if (!m) throw falha(`Não entendi "${s.slice(0, 10) || 'nada'}" como ${rotulo}. Escreva assim: 14:30.`)
    const h = Number(m[1])
    const min = Number(m[2] || 0)
    // maxHora 23 para relógio de parede; mais alto para duração, que pode passar de um dia.
    if (h > maxHora || min > 59) throw falha(`Horário impossível: ${h}:${String(min).padStart(2, '0')}. ${maxHora === 23 ? 'A hora do relógio vai de 0 a 23' : `A duração aqui vai até ${maxHora} horas`} e o minuto de 0 a 59.`)
    return h * 60 + min
}

function minutosParaTexto(minutos) {
    const sinal = minutos < 0 ? '-' : ''
    const t = Math.abs(Math.round(minutos))
    return `${sinal}${Math.floor(t / 60)}h${String(t % 60).padStart(2, '0')}`
}

/** Conta dias úteis entre duas datas, sem contar a de partida. */
function contarDiasUteis(de, ate) {
    const cache = {}
    let dias = 0
    const passo = de <= ate ? 1 : -1
    let atual = somaDias(de, passo)
    let guarda = 0
    while ((passo > 0 ? atual <= ate : atual >= ate) && guarda < 40000) {
        if (ehDiaUtil(atual, cache)) dias++
        atual = somaDias(atual, passo)
        guarda++
    }
    return dias * passo
}

H('dh_dias_entre', {
    emoji: '📅', titulo: 'Dias entre duas datas',
    descricao: 'Conta os dias entre duas datas do calendário',
    uso: '<data inicial> <data final>',
    exemplos: [{ args: '01/01/2026 25/12/2026', oque: 'do ano-novo ao Natal' }, { args: 'hoje 31/12/2026', oque: 'de hoje ao fim do ano' }],
    dica: 'Aceito 17/09/2026, 2026-09-17 e a palavra hoje.',
    calcular(args) {
        const a = lerData(args[0], 'data inicial')
        const b = lerData(args[1], 'data final')
        const dias = diasEntre(a, b)
        const uteis = contarDiasUteis(a, b)
        return {
            intro: `De ${fmtData(a)} a ${fmtData(b)} são ${'*' + fmt(Math.abs(dias), 0) + ' dias*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Dias corridos:* ${fmt(Math.abs(dias), 0)}`, `*Dias úteis:* ${fmt(Math.abs(uteis), 0)}`, `*Semanas:* ${fmt(Math.abs(dias) / 7, 2)}`, `*Meses aproximados:* ${fmt(Math.abs(dias) / 30.44, 2)}`] },
                { emoji: '⏱️', titulo: 'Na conta miúda', linhas: [`*Horas:* ${fmt(Math.abs(dias) * 24, 0)}`, `*Minutos:* ${fmt(Math.abs(dias) * 1440, 0)}`, `*Anos:* ${fmt(Math.abs(dias) / 365.25, 3)}`] },
                { emoji: '📆', titulo: 'As duas datas', linhas: [`*Início:* ${fmtData(a)}, ${diaSemana(a)}`, `*Fim:* ${fmtData(b)}, ${diaSemana(b)}`, dias < 0 ? 'A segunda data vem antes da primeira: contei do mesmo jeito.' : 'A contagem não inclui o dia de partida.'] }
            ]
        }
    }
})

H('dh_idade', {
    emoji: '🎂', titulo: 'Idade exata',
    descricao: 'Calcula a idade em anos, meses e dias',
    uso: '<data de nascimento> [data de referência]',
    exemplos: [{ args: '15/03/1990', oque: 'idade hoje' }, { args: '01/01/2000 01/01/2030', oque: 'idade em outra data' }],
    dica: 'A idade legal muda no dia do aniversário, não no mês: até a véspera ainda vale a idade anterior.',
    calcular(args) {
        const nasc = lerData(args[0], 'data de nascimento')
        const ref = args[1] ? lerData(args[1], 'data de referência') : hoje()
        if (nasc > ref) throw falha(`${fmtData(nasc)} vem depois de ${fmtData(ref)}. Para data futura, use a contagem regressiva.`)
        let anos = ref.getUTCFullYear() - nasc.getUTCFullYear()
        let meses = ref.getUTCMonth() - nasc.getUTCMonth()
        let dias = ref.getUTCDate() - nasc.getUTCDate()
        if (dias < 0) { meses--; dias += new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 0)).getUTCDate() }
        if (meses < 0) { anos--; meses += 12 }
        const totalDias = diasEntre(nasc, ref)
        let prox = new Date(Date.UTC(ref.getUTCFullYear(), nasc.getUTCMonth(), nasc.getUTCDate()))
        if (prox < ref) prox = new Date(Date.UTC(ref.getUTCFullYear() + 1, nasc.getUTCMonth(), nasc.getUTCDate()))
        return {
            intro: `São ${'*' + anos + ' anos, ' + meses + ' meses e ' + dias + ' dias*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Idade:* ${anos} anos, ${meses} meses e ${dias} dias`, `*Só em anos:* ${anos}`, `*Em meses:* ${anos * 12 + meses}`, `*Em dias:* ${fmt(totalDias, 0)}`] },
                { emoji: '📆', titulo: 'Sobre o nascimento', linhas: [`*Data:* ${dataExtenso(nasc)}`, `*Dia da semana:* ${diaSemana(nasc)}`, `*Próximo aniversário:* ${fmtData(prox)} (${diaSemana(prox)})`, `*Faltam:* ${diasEntre(ref, prox)} dias`] },
                { emoji: '⏱️', titulo: 'Em outras contas', linhas: [`*Semanas vividas:* ${fmt(totalDias / 7, 0)}`, `*Horas:* ${fmt(totalDias * 24, 0)}`, `*Batimentos do coração (a 70 por minuto):* cerca de ${fmt(totalDias * 1440 * 70 / 1e6, 0)} milhões`] }
            ]
        }
    }
})

H('dh_dia_semana', {
    emoji: '🗓️', titulo: 'Dia da semana de uma data',
    descricao: 'Diz em que dia da semana caiu ou cai uma data',
    uso: '<data>',
    exemplos: [{ args: '07/09/2026', oque: 'feriado da Independência' }, { args: '01/01/2000', oque: 'virada do milênio' }],
    dica: 'Funciona para o passado e para o futuro, de 1583 em diante, quando o calendário atual já valia.',
    calcular(args) {
        const d = lerData(args[0], 'data')
        const hj = hoje()
        const dif = diasEntre(hj, d)
        const feriado = feriadosDoAno(d.getUTCFullYear()).find(f => fmtData(f.data) === fmtData(d))
        return {
            intro: `${fmtData(d)} ${dif > 0 ? 'cai' : 'caiu'} em uma ${'*' + diaSemana(d) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Data:* ${dataExtenso(d)}`, `*Dia da semana:* ${diaSemana(d)}`, `*É dia útil?* ${ehDiaUtil(d) ? 'sim' : 'não'}`, feriado ? `*Data especial:* ${feriado.nome} (${feriado.tipo})` : '*Data especial:* não é feriado nacional'] },
                { emoji: '📆', titulo: 'Onde ela fica no ano', linhas: [`*Dia do ano:* ${diasEntre(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), d) + 1} de ${bissexto(d.getUTCFullYear()) ? 366 : 365}`, `*Semana do ano:* ${Math.ceil((diasEntre(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), d) + 1 + new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).getUTCDay()) / 7)}`, `*Trimestre:* ${Math.floor(d.getUTCMonth() / 3) + 1}º`] },
                { emoji: '⏳', titulo: 'Distância de hoje', linhas: [dif === 0 ? 'É hoje.' : dif > 0 ? `Faltam ${fmt(dif, 0)} dias.` : `Passaram ${fmt(-dif, 0)} dias.`] }
            ]
        }
    }
})

H('dh_proximo_aniversario', {
    emoji: '🎈', titulo: 'Quanto falta para o aniversário',
    descricao: 'Diz quanto falta para o próximo aniversário',
    uso: '<dia/mês ou data completa>',
    exemplos: [{ args: '25/12', oque: 'dia e mês' }, { args: '15/03/1990', oque: 'com o ano de nascimento' }],
    dica: 'Se o dia já passou este ano, eu conto para o ano que vem.',
    calcular(args) {
        const d = lerData(args[0], 'data de aniversário')
        const hj = hoje()
        let prox = new Date(Date.UTC(hj.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
        if (prox < hj) prox = new Date(Date.UTC(hj.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate()))
        const faltam = diasEntre(hj, prox)
        const fezAnos = d.getUTCFullYear() < hj.getUTCFullYear() - 1 ? prox.getUTCFullYear() - d.getUTCFullYear() : null
        return {
            intro: faltam === 0
                ? `É ${'*hoje*'}! Parabéns.`
                : `Faltam ${'*' + fmt(faltam, 0) + ' dias*'} para ${fmtData(prox)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Próxima data:* ${fmtData(prox)}`, `*Dia da semana:* ${diaSemana(prox)}`, `*Faltam:* ${fmt(faltam, 0)} dias`, fezAnos ? `*Vai completar:* ${fezAnos} anos` : '*Idade:* mande o ano de nascimento para eu calcular'] },
                { emoji: '📆', titulo: 'Para se organizar', linhas: [`*Em semanas:* ${fmt(faltam / 7, 1)}`, `*Em meses:* ${fmt(faltam / 30.44, 1)}`, `*Cai em dia útil?* ${ehDiaUtil(prox) ? 'sim' : 'não, é fim de semana ou feriado'}`, `*Para comprar presente com antecedência:* a partir de ${fmtData(somaDias(prox, -15))}`] }
            ]
        }
    }
})

H('dh_contagem_regressiva', {
    emoji: '⏳', titulo: 'Contagem regressiva para uma data',
    descricao: 'Mostra a contagem regressiva até uma data',
    uso: '<data> [nome do evento]',
    exemplos: [{ args: '31/12/2026 ano-novo', oque: 'até a virada do ano' }, { args: '25/12/2026', oque: 'até o Natal' }],
    dica: 'Serve para prova, viagem, casamento e qualquer coisa que dê frio na barriga.',
    calcular(args) {
        const d = lerData(args[0], 'data do evento')
        const nome = args.slice(1).join(' ').trim() || 'o evento'
        const hj = hoje()
        const dias = diasEntre(hj, d)
        if (dias < 0) {
            return {
                intro: `${cap(nome)} já passou: foi há ${'*' + fmt(-dias, 0) + ' dias*'}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [`*Data:* ${fmtData(d)} (${diaSemana(d)})`, `*Passaram:* ${fmt(-dias, 0)} dias`, `*Em semanas:* ${fmt(-dias / 7, 1)}`, `*Em meses:* ${fmt(-dias / 30.44, 1)}`] }
                ]
            }
        }
        const uteis = contarDiasUteis(hj, d)
        return {
            intro: dias === 0 ? `${cap(nome)} é ${'*hoje*'}!` : `Faltam ${'*' + fmt(dias, 0) + ' dias*'} para ${nome}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Quanto falta', linhas: [`*Dias corridos:* ${fmt(dias, 0)}`, `*Dias úteis:* ${fmt(uteis, 0)}`, `*Semanas:* ${fmt(dias / 7, 1)}`, `*Horas:* ${fmt(dias * 24, 0)}`] },
                { emoji: '📆', titulo: 'A data', linhas: [`*Dia:* ${dataExtenso(d)}`, `*Dia da semana:* ${diaSemana(d)}`, `*Metade do caminho:* ${fmtData(somaDias(hj, Math.floor(dias / 2)))}`, `*Última semana começa em:* ${fmtData(somaDias(d, -7))}`] },
                { emoji: '📋', titulo: 'Para planejar', linhas: [`Dividindo o preparo em ${Math.max(1, Math.ceil(dias / 7))} semana(s), dá para atacar uma parte por semana em vez de tudo no fim.`] }
            ]
        }
    }
})

H('dh_dias_uteis', {
    emoji: '💼', titulo: 'Dias úteis entre duas datas',
    descricao: 'Conta dias úteis descontando feriados nacionais',
    uso: '<data inicial> <data final>',
    exemplos: [{ args: '01/09/2026 30/09/2026', oque: 'dias úteis de setembro' }, { args: 'hoje 31/12/2026', oque: 'até o fim do ano' }],
    dica: 'Eu tiro sábado, domingo e feriado nacional. Feriado de estado e de cidade não entram na conta.',
    calcular(args) {
        const a = lerData(args[0], 'data inicial')
        const b = lerData(args[1], 'data final')
        if (Math.abs(diasEntre(a, b)) > 3650) throw falha('O intervalo passa de dez anos e a conta fica lenta. Divida em pedaços menores.')
        const ini = a <= b ? a : b
        const fim = a <= b ? b : a
        // Conta os dois extremos: quem pergunta "de 01/09 a 30/09" quer o mês inteiro.
        const uteis = Math.abs(contarDiasUteis(somaDias(ini, -1), fim))
        const corridos = Math.abs(diasEntre(ini, fim)) + 1
        const feriados = []
        for (let ano = ini.getUTCFullYear(); ano <= fim.getUTCFullYear(); ano++) {
            for (const f of feriadosDoAno(ano)) {
                if (f.tipo === 'feriado' && f.data > ini && f.data <= fim && f.data.getUTCDay() !== 0 && f.data.getUTCDay() !== 6) feriados.push(`• ${fmtData(f.data)} — ${f.nome}`)
            }
        }
        return {
            intro: `De ${fmtData(a)} a ${fmtData(b)} há ${'*' + fmt(uteis, 0) + ' dias úteis*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Dias úteis:* ${fmt(uteis, 0)}`, `*Dias corridos:* ${fmt(corridos, 0)}`, `*Fins de semana e feriados:* ${fmt(corridos - uteis, 0)}`, `*Horas de trabalho (8 h por dia):* ${fmt(uteis * 8, 0)}`, '*Contagem:* os dois extremos entram na conta'] },
                { emoji: '🎉', titulo: 'Feriados que caíram em dia de semana', linhas: feriados.length ? feriados.slice(0, 12) : ['Nenhum feriado nacional em dia de semana nesse intervalo.'] },
                { emoji: '📅', titulo: 'De quando é a lista', linhas: [cap(VIGENCIA_FERIADOS) + '.'] }
            ]
        }
    }
})

H('dh_somar_dias', {
    emoji: '➕', titulo: 'Somar dias a uma data',
    descricao: 'Soma uma quantidade de dias corridos a uma data',
    uso: '<data> <dias>',
    exemplos: [{ args: 'hoje 90', oque: 'daqui a noventa dias' }, { args: '01/03/2026 45', oque: 'quarenta e cinco dias depois' }],
    dica: 'Prazo de contrato e de garantia costuma ser em dias corridos, não úteis.',
    calcular(args) {
        const d = lerData(args[0], 'data')
        const n = Math.round(exigirNumero(args[1], 'quantidade de dias', { minimo: -36500, maximo: 36500 }))
        const r = somaDias(d, n)
        return {
            intro: `${fmtData(d)} mais ${n} dias dá ${'*' + fmtData(r) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Data final:* ${fmtData(r)}`, `*Dia da semana:* ${diaSemana(r)}`, `*Por extenso:* ${dataExtenso(r)}`, `*É dia útil?* ${ehDiaUtil(r) ? 'sim' : 'não'}`] },
                { emoji: '📊', titulo: 'Outros prazos a partir da mesma data', linhas: [15, 30, 60, 90].map(k => `• ${k} dias: ${fmtData(somaDias(d, k))}`) },
                { emoji: '💼', titulo: 'Se o prazo fosse em dias úteis', linhas: [`Contando só dia útil, ${Math.abs(n)} dias levariam até cerca de ${fmtData(somaDias(d, Math.round(n * 1.4)))}.`] }
            ]
        }
    }
})

H('dh_somar_uteis', {
    emoji: '🗂️', titulo: 'Prazo em dias úteis',
    descricao: 'Calcula a data final de um prazo em dias úteis',
    uso: '<data inicial> <dias úteis>',
    exemplos: [{ args: 'hoje 15', oque: 'prazo de quinze dias úteis' }, { args: '01/12/2026 5', oque: 'cinco dias úteis em dezembro' }],
    dica: 'Prazo em dia útil começa a contar no primeiro dia útil depois da data de partida.',
    calcular(args) {
        const d = lerData(args[0], 'data inicial')
        const n = Math.round(exigirNumero(args[1], 'dias úteis', { minimo: 1, maximo: 2000 }))
        const cache = {}
        let atual = d
        let contados = 0
        let pulados = 0
        while (contados < n) {
            atual = somaDias(atual, 1)
            if (ehDiaUtil(atual, cache)) contados++
            else pulados++
        }
        return {
            intro: `${n} dias úteis a partir de ${fmtData(d)} terminam em ${'*' + fmtData(atual) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Data final:* ${fmtData(atual)} (${diaSemana(atual)})`, `*Dias úteis contados:* ${n}`, `*Dias pulados (fim de semana e feriado):* ${pulados}`, `*Dias corridos no total:* ${diasEntre(d, atual)}`] },
                { emoji: '📊', titulo: 'Outros prazos comuns', linhas: [5, 10, 30].map(k => {
                    const c = {}
                    let a = d
                    let i = 0
                    while (i < k) { a = somaDias(a, 1); if (ehDiaUtil(a, c)) i++ }
                    return `• ${k} dias úteis: ${fmtData(a)}`
                }) },
                { emoji: '📅', titulo: 'De quando é a lista', linhas: [cap(VIGENCIA_FERIADOS) + '. Feriado de estado e de cidade não entra nessa conta.'] }
            ]
        }
    }
})

H('dh_subtrair_dias', {
    emoji: '➖', titulo: 'Voltar dias no calendário',
    descricao: 'Descobre a data de X dias atrás',
    uso: '<data> <dias para voltar>',
    exemplos: [{ args: 'hoje 30', oque: 'trinta dias atrás' }, { args: '25/12/2026 100', oque: 'cem dias antes do Natal' }],
    dica: 'Serve para achar o começo de um prazo já vencido e para conferir data de exame e de documento.',
    calcular(args) {
        const d = lerData(args[0], 'data')
        const n = Math.round(exigirNumero(args[1], 'dias para voltar', { minimo: 0, maximo: 36500 }))
        const r = somaDias(d, -n)
        return {
            intro: `${n} dias antes de ${fmtData(d)} era ${'*' + fmtData(r) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Data:* ${fmtData(r)}`, `*Dia da semana:* ${diaSemana(r)}`, `*Por extenso:* ${dataExtenso(r)}`, `*Dias úteis nesse intervalo:* ${Math.abs(contarDiasUteis(r, d))}`] },
                { emoji: '📊', titulo: 'Outras voltas no tempo', linhas: [30, 90, 180, 365].map(k => `• ${k} dias antes: ${fmtData(somaDias(d, -k))}`) }
            ]
        }
    }
})

H('dh_feriados_ano', {
    emoji: '🎉', titulo: 'Feriados nacionais do ano',
    descricao: 'Lista os feriados nacionais de um ano',
    uso: '[ano]',
    exemplos: [{ args: '2026', oque: 'feriados de 2026' }, { args: '2027', oque: 'feriados do ano seguinte' }],
    dica: 'Carnaval e Corpus Christi são ponto facultativo federal, não feriado: quem decide é cada empregador.',
    rodaSemArgumento: true,
    calcular(args) {
        const ano = args[0] ? Math.round(exigirNumero(args[0], 'ano', { minimo: 1900, maximo: 2200 })) : hoje().getUTCFullYear()
        const lista = feriadosDoAno(ano)
        const feriados = lista.filter(f => f.tipo === 'feriado')
        const facultativos = lista.filter(f => f.tipo !== 'feriado')
        const emDiaUtil = feriados.filter(f => f.data.getUTCDay() !== 0 && f.data.getUTCDay() !== 6)
        return {
            intro: `${ano} tem ${'*' + feriados.length + ' feriados nacionais*'}, sendo ${emDiaUtil.length} em dia de semana.`,
            secoes: [
                { emoji: '📅', titulo: 'Feriados nacionais', linhas: feriados.map(f => `• ${fmtData(f.data)} — ${f.nome} (${diaSemana(f.data)})`) },
                { emoji: '🏖️', titulo: 'Ponto facultativo e data religiosa', linhas: facultativos.map(f => `• ${fmtData(f.data)} — ${f.nome} (${diaSemana(f.data)})`) },
                { emoji: '🎯', titulo: 'Resumo do ano', linhas: [`*Feriados em dia de semana:* ${emDiaUtil.length}`, `*Feriados em fim de semana:* ${feriados.length - emDiaUtil.length}`, `*Feriados que emendam (segunda ou sexta):* ${feriados.filter(f => f.data.getUTCDay() === 1 || f.data.getUTCDay() === 5).length}`, `*Ano bissexto?* ${bissexto(ano) ? 'sim' : 'não'}`] },
                { emoji: '📋', titulo: 'De quando é a lista', linhas: [cap(VIGENCIA_FERIADOS) + '. Feriado de estado e de cidade não está aqui.'] }
            ]
        }
    }
})

H('dh_proximo_feriado', {
    emoji: '🏖️', titulo: 'Próximo feriado',
    descricao: 'Diz qual é o próximo feriado e quanto falta',
    uso: '[data de referência]',
    exemplos: [{ args: 'hoje', oque: 'a partir de hoje' }, { args: '01/10/2026', oque: 'a partir de outubro' }],
    dica: 'Feriado que cai na terça ou na quinta costuma virar emenda com a segunda ou com a sexta.',
    rodaSemArgumento: true,
    calcular(args) {
        const ref = args[0] ? lerData(args[0], 'data de referência') : hoje()
        const candidatos = [...feriadosDoAno(ref.getUTCFullYear()), ...feriadosDoAno(ref.getUTCFullYear() + 1)]
            .filter(f => f.data > ref)
            .sort((a, b) => a.data - b.data)
        const prox = candidatos[0]
        const dias = diasEntre(ref, prox.data)
        const emenda = prox.data.getUTCDay() === 2 ? 'dá para emendar a segunda' : prox.data.getUTCDay() === 4 ? 'dá para emendar a sexta' : prox.data.getUTCDay() === 1 || prox.data.getUTCDay() === 5 ? 'já cria fim de semana prolongado' : 'cai em fim de semana'
        return {
            intro: `O próximo é ${'*' + prox.nome + '*'}, em ${fmtData(prox.data)}: faltam ${'*' + fmt(dias, 0) + ' dias*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Feriado:* ${prox.nome}`, `*Data:* ${fmtData(prox.data)} (${diaSemana(prox.data)})`, `*Tipo:* ${prox.tipo}`, `*Faltam:* ${fmt(dias, 0)} dias, ou ${fmt(dias / 7, 1)} semanas`] },
                { emoji: '📆', titulo: 'Os próximos da fila', linhas: candidatos.slice(0, 5).map(f => `• ${fmtData(f.data)} — ${f.nome} (em ${diasEntre(ref, f.data)} dias)`) },
                { emoji: '💡', titulo: 'Sobre a emenda', linhas: [`Esse feriado ${emenda}.`, cap(VIGENCIA_FERIADOS) + '.'] }
            ]
        }
    }
})

H('dh_feriado_e', {
    emoji: '❓', titulo: 'Essa data é feriado',
    descricao: 'Diz se uma data é feriado, ponto facultativo ou útil',
    uso: '<data>',
    exemplos: [{ args: '12/10/2026', oque: 'Nossa Senhora Aparecida' }, { args: '20/11/2026', oque: 'Consciência Negra' }],
    dica: 'Consciência Negra virou feriado nacional em 2023. Antes disso era feriado só em parte dos estados.',
    calcular(args) {
        const d = lerData(args[0], 'data')
        const lista = feriadosDoAno(d.getUTCFullYear())
        const achado = lista.find(f => fmtData(f.data) === fmtData(d))
        const fimDeSemana = d.getUTCDay() === 0 || d.getUTCDay() === 6
        return {
            intro: achado
                ? `${fmtData(d)} é ${'*' + achado.nome + '*'} — ${achado.tipo}.`
                : fimDeSemana
                    ? `${fmtData(d)} não é feriado nacional, mas cai em ${'*' + diaSemana(d) + '*'}.`
                    : `${fmtData(d)} é um ${'*dia útil comum*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Data:* ${dataExtenso(d)}`, `*Dia da semana:* ${diaSemana(d)}`, `*Feriado nacional?* ${achado && achado.tipo === 'feriado' ? 'sim' : 'não'}`, `*Conta como dia útil?* ${ehDiaUtil(d) ? 'sim' : 'não'}`] },
                { emoji: '📆', titulo: 'Feriados perto dessa data', linhas: lista.filter(f => Math.abs(diasEntre(d, f.data)) <= 45).map(f => `• ${fmtData(f.data)} — ${f.nome} (${diasEntre(d, f.data) >= 0 ? 'em ' + diasEntre(d, f.data) + ' dias' : 'há ' + -diasEntre(d, f.data) + ' dias'})`).slice(0, 8) },
                { emoji: '📋', titulo: 'Atenção', linhas: ['Só olho feriado nacional. A sua cidade pode ter feriado de padroeiro e de aniversário de fundação.', cap(VIGENCIA_FERIADOS) + '.'] }
            ]
        }
    }
})

H('dh_semana_ano', {
    emoji: '📈', titulo: 'Semana do ano',
    descricao: 'Diz em que semana do ano uma data cai',
    uso: '[data]',
    exemplos: [{ args: 'hoje', oque: 'a semana de hoje' }, { args: '01/07/2026', oque: 'metade do ano' }],
    dica: 'A numeração aqui é a da norma internacional: a semana começa na segunda-feira.',
    rodaSemArgumento: true,
    calcular(args) {
        const d = args[0] ? lerData(args[0], 'data') : hoje()
        const alvo = new Date(d.getTime())
        const diaSem = (alvo.getUTCDay() + 6) % 7
        alvo.setUTCDate(alvo.getUTCDate() - diaSem + 3)
        const primeiraQuinta = new Date(Date.UTC(alvo.getUTCFullYear(), 0, 4))
        const diaSem2 = (primeiraQuinta.getUTCDay() + 6) % 7
        primeiraQuinta.setUTCDate(primeiraQuinta.getUTCDate() - diaSem2 + 3)
        const semana = 1 + Math.round(diasEntre(primeiraQuinta, alvo) / 7)
        const inicioSemana = somaDias(d, -diaSem)
        const diaDoAno = diasEntre(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), d) + 1
        const totalDias = bissexto(d.getUTCFullYear()) ? 366 : 365
        return {
            intro: `${fmtData(d)} está na ${'*semana ' + semana + '*'} do ano.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Semana:* ${semana} de ${Math.ceil(totalDias / 7)}`, `*Começa em:* ${fmtData(inicioSemana)} (segunda)`, `*Termina em:* ${fmtData(somaDias(inicioSemana, 6))} (domingo)`, `*Dia do ano:* ${diaDoAno} de ${totalDias}`] },
                { emoji: '📊', titulo: 'Quanto do ano já passou', linhas: [`*Percentual do ano:* ${fmt(diaDoAno / totalDias * 100, 1)}%`, `*Dias restantes:* ${totalDias - diaDoAno}`, `*Semanas restantes:* ${fmt((totalDias - diaDoAno) / 7, 1)}`, `*Trimestre:* ${Math.floor(d.getUTCMonth() / 3) + 1}º`] }
            ]
        }
    }
})

H('dh_calendario_mes', {
    emoji: '🗒️', titulo: 'Calendário de um mês',
    descricao: 'Mostra o calendário de um mês com os feriados',
    uso: '[mês] [ano]',
    exemplos: [{ args: '12 2026', oque: 'dezembro de 2026' }, { args: '9', oque: 'setembro deste ano' }],
    dica: 'Os feriados nacionais do mês aparecem listados embaixo do calendário.',
    rodaSemArgumento: true,
    calcular(args) {
        const hj = hoje()
        const mes = args[0] ? Math.round(exigirNumero(args[0], 'mês', { minimo: 1, maximo: 12 })) : hj.getUTCMonth() + 1
        const ano = args[1] ? Math.round(exigirNumero(args[1], 'ano', { minimo: 1900, maximo: 2200 })) : hj.getUTCFullYear()
        const primeiro = new Date(Date.UTC(ano, mes - 1, 1))
        const totalDias = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
        const linhas = ['dom seg ter qua qui sex sab']
        let linha = '    '.repeat(primeiro.getUTCDay())
        for (let dia = 1; dia <= totalDias; dia++) {
            linha += String(dia).padStart(3, ' ') + ' '
            if ((primeiro.getUTCDay() + dia) % 7 === 0) { linhas.push(linha.trimEnd()); linha = '' }
        }
        if (linha.trim()) linhas.push(linha.trimEnd())
        const feriadosMes = feriadosDoAno(ano).filter(f => f.data.getUTCMonth() === mes - 1)
        const uteis = Math.abs(contarDiasUteis(somaDias(primeiro, -1), new Date(Date.UTC(ano, mes - 1, totalDias))))
        return {
            intro: `Calendário de ${'*' + MESES[mes - 1] + ' de ' + ano + '*'}.`,
            secoes: [
                { emoji: '🗓️', titulo: `${cap(MESES[mes - 1])} de ${ano}`, linhas },
                { emoji: '🎉', titulo: 'Feriados e datas do mês', linhas: feriadosMes.length ? feriadosMes.map(f => `• ${String(f.data.getUTCDate()).padStart(2, '0')} — ${f.nome} (${f.tipo})`) : ['Nenhum feriado nacional neste mês.'] },
                { emoji: '🎯', titulo: 'Resumo', linhas: [`*Dias no mês:* ${totalDias}`, `*Dias úteis:* ${uteis}`, `*Primeiro dia:* ${diaSemana(primeiro)}`, `*Último dia:* ${diaSemana(new Date(Date.UTC(ano, mes - 1, totalDias)))}`] }
            ]
        }
    }
})

H('dh_dias_no_mes', {
    emoji: '📏', titulo: 'Quantos dias tem o mês',
    descricao: 'Diz quantos dias e dias úteis tem um mês',
    uso: '<mês> [ano]',
    exemplos: [{ args: '2 2028', oque: 'fevereiro de ano bissexto' }, { args: '10', oque: 'outubro deste ano' }],
    dica: 'Fevereiro tem 29 dias em ano bissexto, que é quase todo ano múltiplo de quatro.',
    calcular(args) {
        const hj = hoje()
        const mes = Math.round(exigirNumero(args[0], 'mês', { minimo: 1, maximo: 12 }))
        const ano = args[1] ? Math.round(exigirNumero(args[1], 'ano', { minimo: 1900, maximo: 2200 })) : hj.getUTCFullYear()
        const total = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
        const primeiro = new Date(Date.UTC(ano, mes - 1, 1))
        const ultimo = new Date(Date.UTC(ano, mes - 1, total))
        const uteis = Math.abs(contarDiasUteis(somaDias(primeiro, -1), ultimo))
        const contagem = {}
        for (let d = 1; d <= total; d++) {
            const nome = DIAS_SEMANA[new Date(Date.UTC(ano, mes - 1, d)).getUTCDay()]
            contagem[nome] = (contagem[nome] || 0) + 1
        }
        return {
            intro: `${cap(MESES[mes - 1])} de ${ano} tem ${'*' + total + ' dias*'}, sendo ${uteis} úteis.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Dias no mês:* ${total}`, `*Dias úteis:* ${uteis}`, `*Fins de semana e feriados:* ${total - uteis}`, `*Primeiro dia:* ${fmtData(primeiro)} (${diaSemana(primeiro)})`] },
                { emoji: '📊', titulo: 'Quantos de cada dia da semana', linhas: Object.entries(contagem).map(([n, q]) => `• ${n}: ${q}`) },
                { emoji: '📅', titulo: 'Sobre o ano', linhas: [`*${ano} é bissexto?* ${bissexto(ano) ? 'sim, fevereiro tem 29 dias' : 'não, fevereiro tem 28 dias'}`, `*Dias no ano:* ${bissexto(ano) ? 366 : 365}`] }
            ]
        }
    }
})

H('dh_bissexto', {
    emoji: '🔁', titulo: 'Ano bissexto',
    descricao: 'Diz se um ano é bissexto e explica a regra',
    uso: '<ano>',
    exemplos: [{ args: '2028', oque: 'ano bissexto' }, { args: '2100', oque: 'múltiplo de 100 que não é bissexto' }],
    dica: 'A regra completa: é bissexto se divide por 4, menos se divide por 100, salvo se divide por 400.',
    calcular(args) {
        const ano = Math.round(exigirNumero(args[0], 'ano', { minimo: 1, maximo: 9999 }))
        const eh = bissexto(ano)
        const proximos = []
        for (let a = ano + 1; proximos.length < 4; a++) if (bissexto(a)) proximos.push(a)
        return {
            intro: `${ano} ${eh ? '*é bissexto*' : '*não é bissexto*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Ano:* ${ano}`, `*Bissexto?* ${eh ? 'sim' : 'não'}`, `*Dias no ano:* ${eh ? 366 : 365}`, `*Fevereiro tem:* ${eh ? 29 : 28} dias`] },
                { emoji: '🧮', titulo: 'Passo a passo da regra', linhas: [`• Divide por 4? ${ano % 4 === 0 ? 'sim' : 'não'}`, `• Divide por 100? ${ano % 100 === 0 ? 'sim' : 'não'}`, `• Divide por 400? ${ano % 400 === 0 ? 'sim' : 'não'}`, eh ? 'Passou na regra: é bissexto.' : 'Não passou na regra: ano comum.'] },
                { emoji: '📆', titulo: 'Os próximos bissextos', linhas: [proximos.join(', ')] },
                { emoji: '🌍', titulo: 'Por que existe', linhas: ['A Terra leva 365 dias e quase 6 horas para dar a volta no Sol. O dia extra a cada quatro anos paga essa sobra.'] }
            ]
        }
    }
})

H('dh_data_extenso', {
    emoji: '✒️', titulo: 'Data por extenso',
    descricao: 'Escreve a data por extenso para documento',
    uso: '[data] [cidade]',
    exemplos: [{ args: 'hoje', oque: 'a data de hoje por extenso' }, { args: '07/09/2026 Brasília', oque: 'com cidade, para documento' }],
    dica: 'Em documento, a fórmula é cidade, vírgula, dia de mês de ano.',
    rodaSemArgumento: true,
    calcular(args) {
        const temData = args[0] && (/\d/.test(args[0]) || chave(args[0]) === 'hoje')
        const d = temData ? lerData(args[0], 'data') : hoje()
        const cidade = (temData ? args.slice(1) : args).join(' ').trim()
        const extenso = dataExtenso(d)
        return {
            intro: `${'*' + (cidade ? cidade + ', ' : '') + extenso + '.*'}`,
            secoes: [
                { emoji: '✍️', titulo: 'Formas de escrever', linhas: [`• ${cidade ? cidade + ', ' : ''}${extenso}.`, `• ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`, `• ${fmtData(d)}`, `• ${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`] },
                { emoji: '🎯', titulo: 'Detalhes da data', linhas: [`*Dia da semana:* ${diaSemana(d)}`, `*Mês:* ${MESES[d.getUTCMonth()]}`, `*Dia do ano:* ${diasEntre(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), d) + 1}`, `*É dia útil?* ${ehDiaUtil(d) ? 'sim' : 'não'}`] },
                { emoji: '💡', titulo: 'Em documento', linhas: ['Mês vai em letra minúscula em português. O primeiro dia do mês pode ser escrito como 1º.'] }
            ]
        }
    }
})

H('dh_hora_capitais', {
    emoji: '🕐', titulo: 'Que horas são em cada capital',
    descricao: 'Mostra a hora atual em várias capitais de uma vez',
    uso: '[sem argumento]',
    exemplos: [{ args: 'agora', oque: 'a hora em todas as capitais da lista' }, { args: '', oque: 'o mesmo, sem digitar nada' }],
    dica: 'Brasília, Manaus e Rio Branco marcam horas diferentes: o Brasil tem quatro fusos.',
    rodaSemArgumento: true,
    calcular() {
        const agora = new Date()
        return {
            intro: `Agora são ${'*' + horaEm('America/Sao_Paulo', agora) + '*'} em Brasília.`,
            secoes: [
                { emoji: '🇧🇷', titulo: 'No Brasil', linhas: RELOGIOS.slice(0, 4).map(([nome, tz]) => `• ${nome}: ${horaEm(tz, agora)} (${diaEm(tz, agora)})`) },
                { emoji: '🌍', titulo: 'No mundo', linhas: RELOGIOS.slice(4).map(([nome, tz]) => `• ${nome}: ${horaEm(tz, agora)} (${diaEm(tz, agora)})`) },
                { emoji: '📅', titulo: 'Data de referência', linhas: [`Hoje é ${dataExtenso(hoje())}, ${diaSemana(hoje())}.`, 'O horário de verão de cada país já entra na conta, porque uso o fuso real da data.'] }
            ]
        }
    }
})

H('dh_fuso_diferenca', {
    emoji: '🌐', titulo: 'Diferença de fuso para Brasília',
    descricao: 'Diz a diferença de horas entre uma cidade e Brasília',
    uso: '<cidade da lista>',
    exemplos: [{ args: 'toquio', oque: 'diferença para Tóquio' }, { args: 'lisboa', oque: 'diferença para Lisboa' }],
    dica: 'Cidades que eu conheço: brasilia, manaus, riobranco, noronha, lisboa, novayork, londres, toquio, sydney e luanda.',
    calcular(args) {
        const alvo = chave(args.join('')).replace(/[^a-z]/g, '')
        const achado = RELOGIOS.find(([nome]) => chave(nome).replace(/[^a-z]/g, '').startsWith(alvo) && alvo.length >= 3)
        if (!achado) throw falha(`Não conheço a cidade "${alvo || 'nada'}". Escolha uma destas: ${RELOGIOS.map(r => chave(r[0]).replace(/[^a-z]/g, '')).join(', ')}.`)
        const agora = new Date()
        const dtf = (tz) => {
            const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(agora).filter(x => x.type !== 'literal').map(x => [x.type, x.value]))
            return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour) % 24, Number(p.minute))
        }
        const dif = (dtf(achado[1]) - dtf('America/Sao_Paulo')) / 3600000
        return {
            intro: `${'*' + achado[0] + '*'} está ${dif === 0 ? '*no mesmo horário*' : '*' + fmt(Math.abs(dif), 1) + ' h ' + (dif > 0 ? 'à frente' : 'atrás') + '*'} de Brasília.`,
            secoes: [
                { emoji: '🕐', titulo: 'Os dois relógios agora', linhas: [`*Brasília:* ${horaEm('America/Sao_Paulo', agora)} (${diaEm('America/Sao_Paulo', agora)})`, `*${achado[0]}:* ${horaEm(achado[1], agora)} (${diaEm(achado[1], agora)})`, `*Diferença:* ${fmt(dif, 1)} h`] },
                { emoji: '📞', titulo: 'Boa hora para falar', linhas: [`Quando é meio-dia em Brasília, lá são ${fmt((12 + dif + 24) % 24, 0)} h.`, `Quando são 9 h lá, aqui são ${fmt((9 - dif + 24) % 24, 0)} h.`] },
                { emoji: '💡', titulo: 'Sobre horário de verão', linhas: ['A diferença muda ao longo do ano quando o outro país adota horário de verão. Esta conta usa o fuso de hoje.'] }
            ]
        }
    }
})

H('dh_tempo_ate_hora', {
    emoji: '⏰', titulo: 'Quanto falta para um horário',
    descricao: 'Diz quanto falta para um horário de hoje',
    uso: '<horário, ex 18:00>',
    exemplos: [{ args: '18:00', oque: 'até o fim do expediente' }, { args: '00:00', oque: 'até a meia-noite' }],
    dica: 'Se o horário já passou hoje, eu conto para o mesmo horário de amanhã.',
    calcular(args) {
        const alvo = lerHorario(args[0], 'horário')
        const agora = new Date()
        const relogio = horaEm('America/Sao_Paulo', agora)
        const [hAtual, mAtual] = relogio.split(':').map(Number)
        const atual = hAtual * 60 + mAtual
        let falta = alvo - atual
        let amanha = false
        if (falta < 0) { falta += 1440; amanha = true }
        return {
            intro: falta === 0
                ? `É exatamente ${'*' + relogio + '*'} agora.`
                : `Faltam ${'*' + minutosParaTexto(falta) + '*'} para as ${String(Math.floor(alvo / 60)).padStart(2, '0')}:${String(alvo % 60).padStart(2, '0')}${amanha ? ' de amanhã' : ''}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Agora em Brasília:* ${relogio}`, `*Horário alvo:* ${String(Math.floor(alvo / 60)).padStart(2, '0')}:${String(alvo % 60).padStart(2, '0')}${amanha ? ' (amanhã)' : ''}`, `*Falta:* ${minutosParaTexto(falta)}`, `*Em minutos:* ${falta}`] },
                { emoji: '📊', titulo: 'Para se organizar', linhas: [`*Em horas decimais:* ${fmt(falta / 60, 2)} h`, `*Blocos de 25 minutos que cabem:* ${Math.floor(falta / 25)}`, `*Metade do tempo:* ${minutosParaTexto(falta / 2)}`] }
            ]
        }
    }
})

H('dh_soma_horas', {
    emoji: '🧮', titulo: 'Somar horários e durações',
    descricao: 'Soma vários tempos no formato horas e minutos',
    uso: '<1h30> <45min> <2:15> ...',
    exemplos: [{ args: '1:30 2:45 0:50', oque: 'três durações' }, { args: '8:00 7:30', oque: 'dois dias de trabalho' }],
    dica: 'Aceito 1:30, 1h30 e 90 (que eu leio como uma hora e trinta, não como noventa minutos).',
    calcular(args) {
        const lista = listaDeNumeros(args, 1, 'durações')
        let total = 0
        const linhas = []
        for (const item of lista) {
            const min = lerHorario(item, 'duração', { maxHora: 999 })
            total += min
            linhas.push(`• ${item} = ${minutosParaTexto(min)}`)
        }
        return {
            intro: `A soma dá ${'*' + minutosParaTexto(total) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Total:* ${minutosParaTexto(total)}`, `*Em minutos:* ${total}`, `*Em horas decimais:* ${fmt(total / 60, 2)}`, `*Em dias de 8 horas:* ${fmt(total / 480, 2)}`] },
                { emoji: '🧾', titulo: 'Parcela por parcela', linhas },
                { emoji: '📊', titulo: 'Média', linhas: [`*Duração média:* ${minutosParaTexto(total / lista.length)}`, `*Quantidade somada:* ${lista.length}`] }
            ]
        }
    }
})

H('dh_diferenca_horas', {
    emoji: '⏱️', titulo: 'Tempo entre dois horários',
    descricao: 'Calcula quanto tempo passa entre dois horários',
    uso: '<horário inicial> <horário final>',
    exemplos: [{ args: '08:00 17:30', oque: 'um dia de trabalho' }, { args: '22:00 06:00', oque: 'turno que vira a noite' }],
    dica: 'Se o horário final for menor que o inicial, eu entendo que virou o dia.',
    calcular(args) {
        const a = lerHorario(args[0], 'horário inicial')
        const b = lerHorario(args[1], 'horário final')
        let dif = b - a
        let virou = false
        if (dif < 0) { dif += 1440; virou = true }
        return {
            intro: `De ${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')} a ${String(Math.floor(b / 60)).padStart(2, '0')}:${String(b % 60).padStart(2, '0')} são ${'*' + minutosParaTexto(dif) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Tempo decorrido:* ${minutosParaTexto(dif)}`, `*Em minutos:* ${dif}`, `*Em horas decimais:* ${fmt(dif / 60, 2)}`, virou ? '*Virou o dia:* sim, o fim caiu no dia seguinte' : '*Virou o dia:* não'] },
                { emoji: '💼', titulo: 'Se fosse jornada de trabalho', linhas: [`*Descontando 1 hora de almoço:* ${minutosParaTexto(Math.max(0, dif - 60))}`, `*Extras sobre 8 horas:* ${dif > 480 ? minutosParaTexto(dif - 480) : 'nenhuma'}`, `*Percentual de um dia:* ${fmt(dif / 1440 * 100, 1)}%`] }
            ]
        }
    }
})

H('dh_jornada_ponto', {
    emoji: '🕰️', titulo: 'Horas trabalhadas no dia',
    descricao: 'Calcula as horas do dia pelas marcações do ponto',
    uso: '<entrada> <saída almoço> <volta almoço> <saída>',
    exemplos: [{ args: '08:00 12:00 13:00 17:30', oque: 'dia com uma hora de almoço' }, { args: '09:15 12:30 13:30 18:00', oque: 'outro dia' }],
    dica: 'A CLT pede pelo menos 1 hora de intervalo em jornada acima de 6 horas.',
    calcular(args) {
        const marcas = [args[0], args[1], args[2], args[3]].filter(Boolean)
        if (marcas.length !== 4) throw falha(`Preciso das quatro marcações: entrada, saída para o almoço, volta e saída. Você mandou ${marcas.length}.`)
        const [e1, s1, e2, s2] = marcas.map(m => lerHorario(m, 'marcação do ponto'))
        const manha = s1 - e1
        const tarde = s2 - e2
        const intervalo = e2 - s1
        if (manha < 0 || tarde < 0 || intervalo < 0) throw falha('As marcações estão fora de ordem. Mande entrada, saída para o almoço, volta e saída, nessa sequência.')
        const trabalhado = manha + tarde
        const jornada = 8 * 60
        const saldo = trabalhado - jornada
        return {
            intro: `Você trabalhou ${'*' + minutosParaTexto(trabalhado) + '*'} nesse dia.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Trabalhado:* ${minutosParaTexto(trabalhado)}`, `*Manhã:* ${minutosParaTexto(manha)}`, `*Tarde:* ${minutosParaTexto(tarde)}`, `*Intervalo:* ${minutosParaTexto(intervalo)}`] },
                { emoji: '⚖️', titulo: 'Contra a jornada de 8 horas', linhas: [`*Saldo do dia:* ${saldo >= 0 ? 'mais ' : 'menos '}${minutosParaTexto(Math.abs(saldo))}`, `*Permanência na empresa:* ${minutosParaTexto(s2 - e1)}`, `*Horário de saída para fechar 8 horas:* ${String(Math.floor(((e2 + jornada - manha) % 1440) / 60)).padStart(2, '0')}:${String((e2 + jornada - manha) % 60).padStart(2, '0')}`] },
                { emoji: '📘', titulo: 'Sobre o intervalo', linhas: [intervalo < 60 && trabalhado > 360 ? 'O intervalo ficou abaixo de 1 hora em jornada de mais de 6 horas. A CLT pede pelo menos uma hora nesse caso.' : 'O intervalo está dentro do que a CLT pede para essa jornada.'] }
            ]
        }
    }
})

H('dh_banco_horas', {
    emoji: '🏦', titulo: 'Saldo do banco de horas',
    descricao: 'Soma o saldo de horas positivas e negativas',
    uso: '<+1:30> <-0:45> <+2:00> ...',
    exemplos: [{ args: '+1:30 -0:45 +2:00', oque: 'três lançamentos' }, { args: '+8:00 -4:30', oque: 'um crédito e um débito' }],
    dica: 'Use mais e menos na frente de cada tempo. Sem sinal, eu conto como hora positiva.',
    calcular(args) {
        const lista = listaDeNumeros(args, 1, 'lançamentos')
        let saldo = 0
        let creditos = 0
        let debitos = 0
        const linhas = []
        for (const item of lista) {
            const negativo = item.trim().startsWith('-')
            const min = lerHorario(item.replace(/^[+-]/, ''), 'lançamento', { maxHora: 999 })
            const valor = negativo ? -min : min
            saldo += valor
            if (valor >= 0) creditos += valor
            else debitos += -valor
            linhas.push(`• ${negativo ? 'débito' : 'crédito'} de ${minutosParaTexto(min)}`)
        }
        return {
            intro: `Seu saldo é de ${'*' + (saldo >= 0 ? '+' : '-') + minutosParaTexto(Math.abs(saldo)) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Saldo:* ${saldo >= 0 ? 'positivo de ' : 'negativo de '}${minutosParaTexto(Math.abs(saldo))}`, `*Créditos:* ${minutosParaTexto(creditos)}`, `*Débitos:* ${minutosParaTexto(debitos)}`, `*Em dias de 8 horas:* ${fmt(saldo / 480, 2)}`] },
                { emoji: '🧾', titulo: 'Lançamentos', linhas },
                { emoji: '📘', titulo: 'Sobre o banco de horas', linhas: ['Acordo individual permite compensar em até 6 meses; por convenção coletiva, em até 1 ano.', 'Hora não compensada no prazo tem de ser paga como hora extra.'] }
            ]
        }
    }
})

H('dh_trimestre', {
    emoji: '📊', titulo: 'Trimestre e semestre de uma data',
    descricao: 'Diz o bimestre, trimestre e semestre de uma data',
    uso: '[data]',
    exemplos: [{ args: 'hoje', oque: 'o período de hoje' }, { args: '15/08/2026', oque: 'meados de agosto' }],
    dica: 'Serve para fechar relatório, imposto e meta, que costumam seguir trimestre.',
    rodaSemArgumento: true,
    calcular(args) {
        const d = args[0] ? lerData(args[0], 'data') : hoje()
        const mes = d.getUTCMonth()
        const tri = Math.floor(mes / 3) + 1
        const bi = Math.floor(mes / 2) + 1
        const sem = mes < 6 ? 1 : 2
        const fimTri = new Date(Date.UTC(d.getUTCFullYear(), tri * 3, 0))
        const inicioTri = new Date(Date.UTC(d.getUTCFullYear(), (tri - 1) * 3, 1))
        return {
            intro: `${fmtData(d)} está no ${'*' + tri + 'º trimestre*'} de ${d.getUTCFullYear()}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Trimestre:* ${tri}º`, `*Bimestre:* ${bi}º`, `*Semestre:* ${sem}º`, `*Mês:* ${MESES[mes]}`] },
                { emoji: '📆', titulo: 'O trimestre', linhas: [`*Começa em:* ${fmtData(inicioTri)}`, `*Termina em:* ${fmtData(fimTri)}`, `*Dias já passados:* ${diasEntre(inicioTri, d)}`, `*Dias restantes:* ${diasEntre(d, fimTri)}`] },
                { emoji: '📈', titulo: 'Andamento', linhas: [`*Do trimestre:* ${fmt(diasEntre(inicioTri, d) / diasEntre(inicioTri, fimTri) * 100, 0)}% concluído`, `*Do ano:* ${fmt((diasEntre(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), d) + 1) / (bissexto(d.getUTCFullYear()) ? 366 : 365) * 100, 1)}% concluído`] }
            ]
        }
    }
})

H('dh_signo', {
    emoji: '⭐', titulo: 'Signo pela data de nascimento',
    descricao: 'Diz o signo e o período dele pela data',
    uso: '<dia/mês>',
    exemplos: [{ args: '15/03', oque: 'meados de março' }, { args: '25/12/1990', oque: 'com ano, tanto faz' }],
    dica: 'As datas de troca de signo variam um dia para mais ou para menos conforme o ano.',
    calcular(args) {
        const d = lerData(args[0], 'data de nascimento')
        const dia = d.getUTCDate()
        const mes = d.getUTCMonth() + 1
        const SIGNOS = [
            [1, 20, 'Capricórnio', 'de 22 de dezembro a 20 de janeiro', 'terra'],
            [2, 18, 'Aquário', 'de 21 de janeiro a 18 de fevereiro', 'ar'],
            [3, 20, 'Peixes', 'de 19 de fevereiro a 20 de março', 'água'],
            [4, 20, 'Áries', 'de 21 de março a 20 de abril', 'fogo'],
            [5, 20, 'Touro', 'de 21 de abril a 20 de maio', 'terra'],
            [6, 20, 'Gêmeos', 'de 21 de maio a 20 de junho', 'ar'],
            [7, 22, 'Câncer', 'de 21 de junho a 22 de julho', 'água'],
            [8, 22, 'Leão', 'de 23 de julho a 22 de agosto', 'fogo'],
            [9, 22, 'Virgem', 'de 23 de agosto a 22 de setembro', 'terra'],
            [10, 22, 'Libra', 'de 23 de setembro a 22 de outubro', 'ar'],
            [11, 21, 'Escorpião', 'de 23 de outubro a 21 de novembro', 'água'],
            [12, 21, 'Sagitário', 'de 22 de novembro a 21 de dezembro', 'fogo'],
            [12, 31, 'Capricórnio', 'de 22 de dezembro a 20 de janeiro', 'terra']
        ]
        const achado = SIGNOS.find(s => mes < s[0] || (mes === s[0] && dia <= s[1]))
        const signo = achado || SIGNOS[SIGNOS.length - 1]
        return {
            intro: `Quem nasce em ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')} é de ${'*' + signo[2] + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Signo:* ${signo[2]}`, `*Período:* ${signo[3]}`, `*Elemento:* ${signo[4]}`, `*Data informada:* ${String(dia).padStart(2, '0')} de ${MESES[mes - 1]}`] },
                { emoji: '📅', titulo: 'Sobre as datas de troca', linhas: ['O Sol muda de signo em uma hora exata, que varia um dia para mais ou para menos a cada ano.', 'Quem nasceu bem na virada precisa da hora do nascimento para ter certeza.'] }
            ]
        }
    }
})

H('dh_gestacao', {
    emoji: '🤰', titulo: 'Semanas de gestação e data provável',
    descricao: 'Calcula semanas de gestação e a data provável',
    uso: '<data da última menstruação>',
    exemplos: [{ args: '10/03/2026', oque: 'data da última menstruação' }, { args: '01/06/2026', oque: 'outra data' }],
    dica: 'A regra de Naegele soma 280 dias à última menstruação. Só o exame confirma a data de verdade.',
    calcular(args) {
        const dum = lerData(args[0], 'data da última menstruação')
        const hj = hoje()
        const dias = diasEntre(dum, hj)
        if (dias < 0) throw falha(`${fmtData(dum)} está no futuro. Mande a data da última menstruação que já passou.`)
        if (dias > 320) throw falha(`Passaram ${dias} dias desde ${fmtData(dum)}, o que vai além de qualquer gestação. Confira a data.`)
        const dpp = somaDias(dum, 280)
        const semanas = Math.floor(dias / 7)
        const diasSobra = dias % 7
        const trimestre = semanas < 14 ? 1 : semanas < 28 ? 2 : 3
        return {
            intro: `São ${'*' + semanas + ' semanas e ' + diasSobra + ' dias*'} de gestação.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Idade gestacional:* ${semanas} semanas e ${diasSobra} dias`, `*Trimestre:* ${trimestre}º`, `*Data provável do parto:* ${fmtData(dpp)} (${diaSemana(dpp)})`, `*Faltam:* ${Math.max(0, diasEntre(hj, dpp))} dias`] },
                { emoji: '📆', titulo: 'Marcos do caminho', linhas: [`*Fim do 1º trimestre (13 semanas):* ${fmtData(somaDias(dum, 13 * 7))}`, `*Fim do 2º trimestre (27 semanas):* ${fmtData(somaDias(dum, 27 * 7))}`, `*A termo (37 semanas):* ${fmtData(somaDias(dum, 37 * 7))}`, `*41 semanas:* ${fmtData(somaDias(dum, 41 * 7))}`] },
                { emoji: '⚠️', titulo: 'Isto é uma conta, não um exame', linhas: ['A regra de Naegele supõe ciclo de 28 dias. Ultrassom do primeiro trimestre é o que define a idade gestacional de verdade.'] }
            ]
        }
    }
})

H('dh_fins_de_semana', {
    emoji: '🏝️', titulo: 'Sábados e domingos entre datas',
    descricao: 'Conta sábados e domingos em um intervalo',
    uso: '<data inicial> <data final>',
    exemplos: [{ args: '01/01/2026 31/12/2026', oque: 'o ano inteiro' }, { args: 'hoje 31/12/2026', oque: 'até o fim do ano' }],
    dica: 'Serve para planejar viagem, plantão e escala de fim de semana.',
    calcular(args) {
        const a = lerData(args[0], 'data inicial')
        const b = lerData(args[1], 'data final')
        const ini = a <= b ? a : b
        const fim = a <= b ? b : a
        if (diasEntre(ini, fim) > 3650) throw falha('O intervalo passa de dez anos. Divida em pedaços menores.')
        const contagem = {}
        let sabados = 0
        let domingos = 0
        for (let d = ini; d <= fim; d = somaDias(d, 1)) {
            const nome = DIAS_SEMANA[d.getUTCDay()]
            contagem[nome] = (contagem[nome] || 0) + 1
            if (d.getUTCDay() === 6) sabados++
            if (d.getUTCDay() === 0) domingos++
        }
        return {
            intro: `De ${fmtData(ini)} a ${fmtData(fim)} há ${'*' + sabados + ' sábados*'} e ${'*' + domingos + ' domingos*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Sábados:* ${sabados}`, `*Domingos:* ${domingos}`, `*Fins de semana completos:* ${Math.min(sabados, domingos)}`, `*Dias corridos:* ${diasEntre(ini, fim) + 1}`] },
                { emoji: '📊', titulo: 'Cada dia da semana', linhas: DIAS_SEMANA.map(n => `• ${n}: ${contagem[n] || 0}`) },
                { emoji: '📆', titulo: 'Primeiro e último', linhas: [`*Primeiro sábado:* ${(() => { let d = ini; while (d.getUTCDay() !== 6 && d <= fim) d = somaDias(d, 1); return d <= fim ? fmtData(d) : 'nenhum no intervalo' })()}`, `*Último domingo:* ${(() => { let d = fim; while (d.getUTCDay() !== 0 && d >= ini) d = somaDias(d, -1); return d >= ini ? fmtData(d) : 'nenhum no intervalo' })()}`] }
            ]
        }
    }
})

H('dh_aniversario_semanas', {
    emoji: '🎊', titulo: 'Em que dia cai o aniversário nos próximos anos',
    descricao: 'Mostra o dia da semana do aniversário por vários anos',
    uso: '<dia/mês> [quantos anos olhar]',
    exemplos: [{ args: '25/12', oque: 'o Natal nos próximos anos' }, { args: '15/03 8', oque: 'oito anos à frente' }],
    dica: 'A data anda um dia da semana por ano, e dois quando passa por 29 de fevereiro.',
    calcular(args) {
        const d = lerData(args[0], 'data')
        const quantos = args[1] ? Math.round(exigirNumero(args[1], 'quantidade de anos', { minimo: 1, maximo: 20 })) : 6
        const hj = hoje()
        const linhas = []
        const contagem = {}
        for (let i = 0; i < quantos; i++) {
            const ano = hj.getUTCFullYear() + i
            const data = new Date(Date.UTC(ano, d.getUTCMonth(), d.getUTCDate()))
            const nome = diaSemana(data)
            contagem[nome] = (contagem[nome] || 0) + 1
            const bom = data.getUTCDay() === 5 || data.getUTCDay() === 6 ? ' — bom para festa' : ''
            linhas.push(`• ${ano}: ${nome}${bom}`)
        }
        return {
            intro: `Em ${quantos} anos, ${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')} cai ${'*' + Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0] + '*'} mais vezes.`,
            secoes: [
                { emoji: '📆', titulo: 'Ano a ano', linhas },
                { emoji: '🎯', titulo: 'Resumo', linhas: [`*Anos analisados:* ${quantos}`, `*Cai em sexta ou sábado:* ${linhas.filter(l => l.includes('bom para festa')).length} vez(es)`, `*Próximo fim de semana com essa data:* ${linhas.find(l => l.includes('bom para festa')) ? linhas.find(l => l.includes('bom para festa')).slice(2, 6) : 'nenhum nesse período'}`] },
                { emoji: '🧠', titulo: 'Por que anda um dia', linhas: ['O ano tem 52 semanas e um dia. Esse dia sobrando empurra a data para o dia seguinte da semana, e dois dias quando o ano é bissexto.'] }
            ]
        }
    }
})

H('dh_tempo_vivido', {
    emoji: '🌍', titulo: 'Quanto tempo você já viveu',
    descricao: 'Mostra o tempo vivido em várias unidades',
    uso: '<data de nascimento>',
    exemplos: [{ args: '15/03/1990', oque: 'em dias, horas e voltas ao Sol' }, { args: '01/01/2000', oque: 'outra data' }],
    dica: 'Serve para marcar comemoração diferente: mil dias de vida, dez mil dias, e por aí.',
    calcular(args) {
        const nasc = lerData(args[0], 'data de nascimento')
        const hj = hoje()
        const dias = diasEntre(nasc, hj)
        if (dias < 0) throw falha(`${fmtData(nasc)} está no futuro. Mande a data de nascimento que já passou.`)
        const marcos = [1000, 5000, 10000, 15000, 20000, 25000, 30000].filter(m => m > dias).slice(0, 3)
        return {
            intro: `Você já viveu ${'*' + fmt(dias, 0) + ' dias*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Em várias unidades', linhas: [`*Dias:* ${fmt(dias, 0)}`, `*Semanas:* ${fmt(dias / 7, 0)}`, `*Meses:* ${fmt(dias / 30.44, 0)}`, `*Anos:* ${fmt(dias / 365.25, 2)}`] },
                { emoji: '⏱️', titulo: 'Na conta miúda', linhas: [`*Horas:* ${fmt(dias * 24, 0)}`, `*Minutos:* ${fmt(dias * 1440, 0)}`, `*Voltas da Terra ao redor do Sol:* ${fmt(dias / 365.25, 2)}`, `*Luas cheias vistas:* cerca de ${fmt(dias / 29.53, 0)}`] },
                { emoji: '🎉', titulo: 'Próximos marcos', linhas: marcos.map(m => `• ${fmt(m, 0)} dias: ${fmtData(somaDias(nasc, m))} (faltam ${m - dias} dias)`) },
                { emoji: '😴', titulo: 'Curiosidade', linhas: [`Dormindo 8 horas por noite, você passou cerca de ${fmt(dias / 3 / 365.25, 1)} anos dormindo.`] }
            ]
        }
    }
})

/* ──────────────────────────── Porta de entrada ──────────────────────────── */

function chaves() {
    return Object.keys(FERRAMENTAS)
}

function meta(chaveFerramenta) {
    const f = FERRAMENTAS[chaveFerramenta]
    if (!f) return null
    return {
        emoji: f.emoji,
        sub: f.sub,
        titulo: f.titulo,
        descricao: f.descricao,
        uso: f.uso,
        exemplos: f.exemplos.map(e => `${e.args} — ${e.oque}`)
    }
}

function telaDeUso(item, nome, prefix) {
    return {
        emoji: item.emoji,
        titulo: item.titulo,
        prefix,
        intro: `${item.descricao}. Escreva o que eu preciso saber logo depois do comando.`,
        secoes: [
            { emoji: '✍️', titulo: 'Escreva assim', linhas: ['`' + prefix + nome + ' ' + item.uso + '`'] },
            { emoji: '📋', titulo: 'Detalhes que ajudam', linhas: item.ajuda || ['• Número pode ser 1.234,56 ou 1234.56', '• O que estiver entre colchetes é opcional'] }
        ],
        dica: item.dica,
        proximos: item.exemplos.map(e => ({ nome, args: e.args, oque: e.oque }))
    }
}

/**
 * Executa a ferramenta e devolve um objeto pronto para o F.tela.
 * Nunca lança: erro de entrada vira tela explicando o que corrigir.
 */
function responder(chaveFerramenta, args, contexto = {}) {
    const nome = contexto.nome || 'ferr'
    const prefix = contexto.prefix || '.'
    const item = FERRAMENTAS[chaveFerramenta]
    if (!item) {
        logger.error(`[toolboxService] chave desconhecida: ${chaveFerramenta} (comando ${nome})`)
        return {
            emoji: '⚠️', titulo: 'Ferramenta fora do ar', prefix,
            intro: 'Essa ferramenta não está registrada no serviço. Avise quem cuida do bot.',
            secoes: [{ emoji: '🔧', titulo: 'Detalhe técnico', linhas: [`Chave procurada: ${chaveFerramenta}`] }]
        }
    }

    const limpos = (Array.isArray(args) ? args : []).map(a => String(a)).filter(a => a.trim() !== '')
    if (!limpos.length && !item.rodaSemArgumento) return telaDeUso(item, nome, prefix)

    try {
        const r = item.calcular(limpos)
        return {
            emoji: item.emoji,
            titulo: item.titulo,
            prefix,
            intro: r.intro,
            secoes: r.secoes || [],
            dica: r.dica || item.dica,
            proximos: item.exemplos.map(e => ({ nome, args: e.args, oque: e.oque }))
        }
    } catch (e) {
        if (!e.paraUsuario) logger.error(`[toolboxService] ${chaveFerramenta} quebrou com "${limpos.join(' ')}": ${e.stack || e.message}`)
        else logger.warn(`[toolboxService] ${chaveFerramenta} recusou "${limpos.join(' ')}": ${e.message}`)
        return {
            emoji: '⚠️',
            titulo: item.titulo,
            prefix,
            intro: e.paraUsuario ? e.message : 'Não consegui completar essa tarefa com o que você digitou. Confira os valores e tente de novo.',
            secoes: [{ emoji: '✍️', titulo: 'Escreva assim', linhas: ['`' + prefix + nome + ' ' + item.uso + '`'] }],
            dica: item.dica,
            proximos: item.exemplos.map(ex => ({ nome, args: ex.args, oque: ex.oque }))
        }
    }
}

module.exports = {
    responder, chaves, meta,
    VIGENCIA_INSS, VIGENCIA_IRRF, VIGENCIA_FERIADOS, VIGENCIA_TABELAS,
    // expostos para teste
    num, fmt, moeda, lerData, fmtData, diasEntre, pascoa, feriadosDoAno, ehDiaUtil, bissexto,
    calcularInss, calcularIrrf, validarCpf, validarCnpj, luhn, bandeiraCartao, DDDS, ESTADOS_NOME
}
