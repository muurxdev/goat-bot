/**
 * Conversores de unidade da família .ferr (Conversões).
 *
 * ─── PROCEDÊNCIA DOS NÚMEROS ───
 * Os fatores exatos (por definição internacional) são: polegada = 25,4 mm,
 * pé = 0,3048 m, jarda = 0,9144 m, milha terrestre = 1.609,344 m, milha náutica
 * = 1.852 m, libra = 0,45359237 kg, onça = 1/16 de libra, galão americano =
 * 3,785411784 L, acre = 4.046,8564224 m², caloria = 4,184 J, atmosfera =
 * 101.325 Pa. Esses não mudam.
 *
 * Os aproximados são: cavalo-vapor métrico (cv) = 735,49875 W, horsepower
 * mecânico (hp) = 745,699872 W, psi = 6.894,757 Pa, mmHg = 133,322 Pa,
 * BTU (IT) = 1.055,05585 J, Mach 1 ao nível do mar a 15 °C = 1.234,8 km/h.
 *
 * Medidas brasileiras: arroba = 15 kg (a portuguesa é 14,7 kg; no Brasil o boi
 * é pesado em arrobas de 15 kg); alqueire paulista = 24.200 m² (2,42 ha).
 *
 * Tabela de densidade de ingrediente (xícara/colher para grama): valores médios
 * de xícara de 240 ml, colher de sopa de 15 ml e colher de chá de 5 ml, na
 * referência usada por receita brasileira. Farinha peneirada dá menos que
 * farinha compactada — por isso a resposta sempre diz que é média.
 * VIGENCIA_TABELAS marca a data em que essas tabelas foram conferidas.
 *
 * Tabela de numeração de calçado e roupa: equivalência comercial usual
 * BR/EUA/EU. Numeração de fabricante varia, e a resposta avisa isso.
 *
 * Regra da casa: toda a conta mora aqui. O comando em src/commands/ferramentas
 * só chama responder() e entrega o resultado ao F.tela. Sem rede, sem banco.
 */

const logger = require('../core/logger')

const VIGENCIA_TABELAS = 'tabelas conferidas em setembro de 2026'

/* ───────────────────────────── Auxiliares ───────────────────────────── */

/** Erro que pode ser mostrado ao usuário sem susto. */
function falha(mensagem) {
    const e = new Error(mensagem)
    e.paraUsuario = true
    return e
}

/**
 * Lê número escrito do jeito brasileiro ou americano.
 * Aceita "1.234,56", "1234.56", "2,5", "2,5kg" e "-3".
 * @returns {number} NaN quando não dá para ler.
 */
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

/** Exige um número; explica em português o que faltou. */
function exigirNumero(texto, rotulo, { minimo = null, permiteNegativo = true, permiteZero = true } = {}) {
    const n = num(texto)
    if (!Number.isFinite(n)) throw falha(`Não entendi "${String(texto ?? '').slice(0, 20) || 'nada'}" como ${rotulo}. Escreva só o número, por exemplo 12,5.`)
    if (!permiteNegativo && n < 0) throw falha(`O ${rotulo} não pode ser negativo.`)
    if (!permiteZero && n === 0) throw falha(`O ${rotulo} não pode ser zero.`)
    if (minimo !== null && n < minimo) throw falha(`O ${rotulo} precisa ser no mínimo ${minimo}.`)
    return n
}

/** Número no formato brasileiro, com casas decimais úteis e sem zero à toa. */
function fmt(n, casas = 4) {
    if (!Number.isFinite(n)) return '—'
    const abs = Math.abs(n)
    let c = casas
    if (abs !== 0 && abs < 0.0001) return n.toExponential(3).replace('.', ',')
    if (abs >= 1e15) return n.toExponential(3).replace('.', ',')
    if (abs >= 1000) c = Math.min(casas, 2)
    if (abs >= 100000) c = 0
    return Number(n.toFixed(c)).toLocaleString('pt-BR', { maximumFractionDigits: Math.max(c, 0) })
}

/** Primeira letra maiúscula. */
function cap(t) {
    const s = String(t || '')
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Valor com unidade, em negrito. */
function forte(valor, unidade, casas = 4) {
    return `*${fmt(valor, casas)} ${unidade}*`
}

/* ─────────────────── Fábrica das conversões proporcionais ─────────────────── */

/**
 * Monta uma conversão de fator fixo (a grande maioria delas).
 * @param {object} cfg
 * @param {number} cfg.fator quanto vale 1 unidade de origem na unidade de destino
 */
function linear(cfg) {
    const {
        emoji, deNome, paraNome, deSigla, paraSigla, fator,
        casas = 4, exemplo = '10', exemploTexto, dica, descricao, permiteNegativo = false
    } = cfg
    const titulo = `${cap(deNome)} para ${paraNome}`
    return {
        emoji,
        sub: 'Conversões',
        titulo,
        descricao: descricao || `Converte ${deNome} em ${paraNome}`,
        uso: `<valor em ${deSigla}>`,
        exemplos: [
            { args: exemplo, oque: exemploTexto || `${exemplo} ${deSigla} convertido` },
            { args: '1', oque: `quanto vale 1 ${deSigla}` }
        ],
        dica: dica || `O caminho de volta é dividir por ${fmt(fator, 6)}.`,
        calcular(args) {
            const v = exigirNumero(args[0], `valor em ${deSigla}`, { permiteNegativo })
            const r = v * fator
            const tabela = [1, 10, 100].map(k => `• ${fmt(k, 0)} ${deSigla} = ${fmt(k * fator, casas)} ${paraSigla}`)
            return {
                intro: `${fmt(v, casas)} ${deSigla} equivale a ${forte(r, paraSigla, casas)}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [
                        `*Você digitou:* ${fmt(v, casas)} ${deSigla}`,
                        `*Equivale a:* ${forte(r, paraSigla, casas)}`,
                        `*Caminho de volta:* ${fmt(r, casas)} ${paraSigla} = ${fmt(v, casas)} ${deSigla}`
                    ] },
                    { emoji: '📊', titulo: 'Para ter na cabeça', linhas: tabela }
                ]
            }
        }
    }
}

/* ────────────────────────── Conversões especiais ────────────────────────── */

/** Temperatura: cada escala tem zero e passo próprios, então não é fator simples. */
function temperatura({ emoji = '🌡️', de, para, paraCelsius, deCelsius, exemplo, nota }) {
    const NOMES = { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin', R: 'Rankine' }
    const SIGLAS = { C: '°C', F: '°F', K: 'K', R: '°R' }
    return {
        emoji,
        sub: 'Conversões',
        titulo: `${NOMES[de]} para ${NOMES[para]}`,
        descricao: `Converte ${NOMES[de]} em ${NOMES[para]}`,
        uso: `<temperatura em ${SIGLAS[de]}>`,
        exemplos: [
            { args: exemplo, oque: `${exemplo} ${SIGLAS[de]} na outra escala` },
            { args: '0', oque: `quanto é 0 ${SIGLAS[de]}` }
        ],
        dica: nota || 'Zero absoluto é −273,15 °C: abaixo disso não existe temperatura.',
        calcular(args) {
            const v = exigirNumero(args[0], `temperatura em ${SIGLAS[de]}`)
            const c = paraCelsius(v)
            if (c < -273.15 - 1e-9) throw falha(`${fmt(v, 2)} ${SIGLAS[de]} fica abaixo do zero absoluto (−273,15 °C). Essa temperatura não existe.`)
            const r = deCelsius(c)
            const refs = [-40, 0, 37, 100].map(t => `• ${fmt(t, 1)} °C = ${fmt(deCelsius(t), 2)} ${SIGLAS[para]}`)
            return {
                intro: `${fmt(v, 2)} ${SIGLAS[de]} equivale a ${forte(r, SIGLAS[para], 2)}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [
                        `*Você digitou:* ${fmt(v, 2)} ${SIGLAS[de]}`,
                        `*Equivale a:* ${forte(r, SIGLAS[para], 2)}`,
                        `*Em Celsius:* ${fmt(c, 2)} °C`
                    ] },
                    { emoji: '📊', titulo: 'Pontos de referência', linhas: refs },
                    { emoji: '🧭', titulo: 'Como sentir', linhas: [sensacao(c)] }
                ]
            }
        }
    }
}

function sensacao(c) {
    if (c <= -20) return 'Frio extremo: congela em minutos, perigo de hipotermia.'
    if (c <= 0) return 'Congelante: a água vira gelo nesse ponto.'
    if (c <= 12) return 'Muito frio: casaco pesado.'
    if (c <= 20) return 'Frio ameno: friozinho de manhã.'
    if (c <= 26) return 'Agradável: temperatura de conforto.'
    if (c <= 32) return 'Quente: dia de calor de verdade.'
    if (c <= 40) return 'Muito quente: beba água e evite sol forte.'
    if (c < 100) return 'Calor de forno baixo: já queima a pele.'
    return 'Acima da fervura da água ao nível do mar.'
}

/** Numeração de calçado e roupa: tabela de equivalência, não fórmula. */
const CALCADO_FEM = { 33: '3', 34: '4', 35: '5', 36: '6', 37: '6,5', 38: '7,5', 39: '8,5', 40: '9', 41: '10', 42: '11' }
const CALCADO_MASC = { 37: '5,5', 38: '6', 39: '7', 40: '7,5', 41: '8,5', 42: '9', 43: '10', 44: '11', 45: '12', 46: '13' }
const CALCADO_EU = { 33: '34', 34: '35', 35: '36', 36: '37', 37: '38', 38: '39', 39: '40', 40: '41', 41: '42', 42: '43', 43: '44', 44: '45', 45: '46', 46: '47' }
const ROUPA_FEM = { pp: { br: '36', eua: '2 (XS)', eu: '32' }, p: { br: '38', eua: '4 (S)', eu: '34' }, m: { br: '40', eua: '6 (M)', eu: '36' }, g: { br: '42', eua: '8 (L)', eu: '38' }, gg: { br: '44', eua: '10 (XL)', eu: '40' }, xgg: { br: '46', eua: '12 (XXL)', eu: '42' } }

/** Tabela de medida caseira para grama, por ingrediente. */
const INGREDIENTES = {
    farinha: { nome: 'farinha de trigo', xicara: 120, sopa: 7.5, cha: 2.5, ml: 0.5 },
    acucar: { nome: 'açúcar refinado', xicara: 200, sopa: 12, cha: 4, ml: 0.83 },
    'acucar-mascavo': { nome: 'açúcar mascavo', xicara: 180, sopa: 11, cha: 3.7, ml: 0.75 },
    arroz: { nome: 'arroz cru', xicara: 180, sopa: 11, cha: 3.7, ml: 0.75 },
    leite: { nome: 'leite', xicara: 245, sopa: 15, cha: 5, ml: 1.02 },
    agua: { nome: 'água', xicara: 240, sopa: 15, cha: 5, ml: 1 },
    oleo: { nome: 'óleo', xicara: 216, sopa: 13.5, cha: 4.5, ml: 0.9 },
    manteiga: { nome: 'manteiga', xicara: 227, sopa: 14, cha: 4.7, ml: 0.95 },
    sal: { nome: 'sal', xicara: 288, sopa: 18, cha: 6, ml: 1.2 },
    cacau: { nome: 'cacau em pó', xicara: 100, sopa: 6, cha: 2, ml: 0.42 },
    aveia: { nome: 'aveia em flocos', xicara: 90, sopa: 5.6, cha: 1.9, ml: 0.38 },
    mel: { nome: 'mel', xicara: 340, sopa: 21, cha: 7, ml: 1.42 },
    fuba: { nome: 'fubá', xicara: 160, sopa: 10, cha: 3.3, ml: 0.67 },
    feijao: { nome: 'feijão cru', xicara: 190, sopa: 12, cha: 4, ml: 0.79 }
}

/** Uma conversão de medida caseira fixa (ex.: xícara de farinha para grama). */
function cozinha({ chaveIngrediente, medida, emoji = '🥄' }) {
    const ing = INGREDIENTES[chaveIngrediente]
    const MED = { xicara: { nome: 'xícara', plural: 'xícaras', ml: 240 }, sopa: { nome: 'colher de sopa', plural: 'colheres de sopa', ml: 15 }, cha: { nome: 'colher de chá', plural: 'colheres de chá', ml: 5 } }
    const m = MED[medida]
    const gramasPorMedida = ing[medida]
    return {
        emoji,
        sub: 'Conversões',
        titulo: `${cap(m.plural)} de ${ing.nome} em gramas`,
        descricao: `${cap(m.nome)} de ${ing.nome} para gramas`.slice(0, 55),
        uso: `<quantidade de ${m.plural}>`,
        exemplos: [
            { args: '2', oque: `2 ${m.plural} de ${ing.nome}` },
            { args: '0,5', oque: `meia ${m.nome}` }
        ],
        dica: `Peso médio (${VIGENCIA_TABELAS}). Ingrediente peneirado pesa menos que compactado.`,
        calcular(args) {
            const q = exigirNumero(args[0], `quantidade de ${m.plural}`, { permiteNegativo: false, permiteZero: false })
            const g = q * gramasPorMedida
            const ml = q * m.ml
            return {
                intro: `${fmt(q, 2)} ${q === 1 ? m.nome : m.plural} de ${ing.nome} dá cerca de ${forte(g, 'g', 1)}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [
                        `*Peso:* ${forte(g, 'g', 1)}`,
                        `*Volume:* ${fmt(ml, 1)} ml`,
                        `*Referência:* 1 ${m.nome} de ${ing.nome} = ${fmt(gramasPorMedida, 1)} g`
                    ] },
                    { emoji: '📊', titulo: 'Medidas próximas', linhas: [0.5, 1, 2, 3].map(k => `• ${fmt(k, 2)} ${k === 1 ? m.nome : m.plural} = ${fmt(k * gramasPorMedida, 1)} g`) },
                    { emoji: '📅', titulo: 'De quando é a tabela', linhas: [cap(VIGENCIA_TABELAS) + '.'] }
                ]
            }
        }
    }
}

/* ─────────────────────── Fusos horários de capitais ─────────────────────── */

const FUSOS = {
    brasilia: { nome: 'Brasília', tz: 'America/Sao_Paulo' },
    manaus: { nome: 'Manaus', tz: 'America/Manaus' },
    riobranco: { nome: 'Rio Branco', tz: 'America/Rio_Branco' },
    noronha: { nome: 'Fernando de Noronha', tz: 'America/Noronha' },
    belem: { nome: 'Belém', tz: 'America/Belem' },
    lisboa: { nome: 'Lisboa', tz: 'Europe/Lisbon' },
    londres: { nome: 'Londres', tz: 'Europe/London' },
    madri: { nome: 'Madri', tz: 'Europe/Madrid' },
    paris: { nome: 'Paris', tz: 'Europe/Paris' },
    berlim: { nome: 'Berlim', tz: 'Europe/Berlin' },
    roma: { nome: 'Roma', tz: 'Europe/Rome' },
    moscou: { nome: 'Moscou', tz: 'Europe/Moscow' },
    novayork: { nome: 'Nova York', tz: 'America/New_York' },
    losangeles: { nome: 'Los Angeles', tz: 'America/Los_Angeles' },
    chicago: { nome: 'Chicago', tz: 'America/Chicago' },
    cidadedomexico: { nome: 'Cidade do México', tz: 'America/Mexico_City' },
    buenosaires: { nome: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' },
    santiago: { nome: 'Santiago', tz: 'America/Santiago' },
    bogota: { nome: 'Bogotá', tz: 'America/Bogota' },
    toquio: { nome: 'Tóquio', tz: 'Asia/Tokyo' },
    pequim: { nome: 'Pequim', tz: 'Asia/Shanghai' },
    seul: { nome: 'Seul', tz: 'Asia/Seoul' },
    dubai: { nome: 'Dubai', tz: 'Asia/Dubai' },
    india: { nome: 'Nova Délhi', tz: 'Asia/Kolkata' },
    sydney: { nome: 'Sydney', tz: 'Australia/Sydney' },
    joanesburgo: { nome: 'Joanesburgo', tz: 'Africa/Johannesburg' },
    luanda: { nome: 'Luanda', tz: 'Africa/Luanda' }
}

/** Deslocamento do fuso, em minutos, para um instante. */
function offsetMinutos(tz, quando) {
    const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
    const p = Object.fromEntries(dtf.formatToParts(quando).filter(x => x.type !== 'literal').map(x => [x.type, x.value]))
    const comoUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour) % 24, Number(p.minute), Number(p.second))
    return Math.round((comoUtc - quando.getTime()) / 60000)
}

/** Relógio "HH:MM" de uma cidade em um instante. */
function relogio(tz, quando) {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(quando)
}

/** Data curta de uma cidade em um instante. */
function dataCurta(tz, quando) {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit', weekday: 'short' }).format(quando)
}

/** Lê "14:30", "14h30", "1430" ou "14" como minutos do dia. */
function lerHora(texto) {
    const s = String(texto || '').trim().toLowerCase().replace(/\s/g, '')
    let m = s.match(/^(\d{1,2})[:h.](\d{1,2})$/)
    if (!m) m = s.match(/^(\d{1,2})h$/)
    if (!m && /^\d{3,4}$/.test(s)) m = [s, s.slice(0, s.length - 2), s.slice(-2)]
    if (!m && /^\d{1,2}$/.test(s)) m = [s, s, '0']
    if (!m) throw falha(`Não entendi "${s.slice(0, 10)}" como horário. Escreva assim: 14:30.`)
    const h = Number(m[1]); const min = Number(m[2] || 0)
    if (h > 23 || min > 59) throw falha(`Horário impossível: ${h}:${String(min).padStart(2, '0')}. A hora vai de 0 a 23 e o minuto de 0 a 59.`)
    return h * 60 + min
}

/** Conversão de horário entre duas cidades fixas. */
function fuso({ origem, destino, emoji = '🌍' }) {
    const o = FUSOS[origem]; const d = FUSOS[destino]
    return {
        emoji,
        sub: 'Conversões',
        titulo: `Horário de ${o.nome} em ${d.nome}`,
        descricao: `Que horas são em ${d.nome} quando é X em ${o.nome}`.slice(0, 55),
        uso: '<hora em ' + o.nome + '>',
        exemplos: [
            { args: '14:30', oque: `14h30 de ${o.nome} em ${d.nome}` },
            { args: 'agora', oque: 'o horário deste instante' }
        ],
        dica: 'O horário de verão de cada país entra na conta sozinho, porque uso o fuso real da data.',
        calcular(args) {
            const entrada = String(args[0] || '').toLowerCase()
            const agora = new Date()
            let instante = agora
            let rotulo = 'agora'
            if (entrada !== 'agora') {
                const minutos = lerHora(args.join(''))
                const offO = offsetMinutos(o.tz, agora)
                const hojeNaOrigem = new Intl.DateTimeFormat('en-CA', { timeZone: o.tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora)
                const [ay, am, ad] = hojeNaOrigem.split('-').map(Number)
                instante = new Date(Date.UTC(ay, am - 1, ad, 0, minutos - offO, 0))
                rotulo = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
            } else {
                rotulo = relogio(o.tz, agora)
            }
            const difMin = offsetMinutos(d.tz, instante) - offsetMinutos(o.tz, instante)
            const sinal = difMin === 0 ? 'mesmo horário' : (difMin > 0 ? `${fmt(difMin / 60, 1)} h à frente` : `${fmt(Math.abs(difMin) / 60, 1)} h atrás`)
            return {
                intro: `Quando é ${rotulo} em ${o.nome}, em ${d.nome} são ${'*' + relogio(d.tz, instante) + '*'}.`,
                secoes: [
                    { emoji: '🕐', titulo: 'Os dois relógios', linhas: [
                        `*${o.nome}:* ${relogio(o.tz, instante)} (${dataCurta(o.tz, instante)})`,
                        `*${d.nome}:* ${relogio(d.tz, instante)} (${dataCurta(d.tz, instante)})`,
                        `*Diferença:* ${d.nome} está ${sinal}`
                    ] },
                    { emoji: '📆', titulo: 'Atenção ao dia', linhas: [
                        dataCurta(o.tz, instante) === dataCurta(d.tz, instante)
                            ? 'As duas cidades estão no mesmo dia.'
                            : 'As duas cidades estão em dias diferentes do calendário.'
                    ] }
                ]
            }
        }
    }
}

/* ─────────────────────────── Números romanos ─────────────────────────── */

const ROMANOS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]

function paraRomano(n) {
    if (!Number.isInteger(n) || n < 1 || n > 3999) throw falha('O número romano vai de 1 a 3999. Fora disso o sistema não tem símbolo.')
    let resto = n; let saida = ''
    for (const [valor, letra] of ROMANOS) {
        while (resto >= valor) { saida += letra; resto -= valor }
    }
    return saida
}

function deRomano(texto) {
    const s = String(texto || '').trim().toUpperCase()
    if (!/^[MDCLXVI]+$/.test(s)) throw falha(`"${s.slice(0, 12) || 'vazio'}" não é romano. Use só as letras M D C L X V I.`)
    const VAL = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
    let total = 0
    for (let i = 0; i < s.length; i++) {
        const v = VAL[s[i]]; const prox = VAL[s[i + 1]] || 0
        total += v < prox ? -v : v
    }
    if (paraRomano(total) !== s) throw falha(`"${s}" tem letras fora de ordem. O jeito certo de escrever ${total} é ${paraRomano(total)}.`)
    return total
}

/* ────────────────────────────── O registro ────────────────────────────── */

const FERRAMENTAS = {}

/* Comprimento (12) */
FERRAMENTAS.comp_m_cm = linear({ emoji: '📏', deNome: 'metros', paraNome: 'centímetros', deSigla: 'm', paraSigla: 'cm', fator: 100, exemplo: '2,5', exemploTexto: 'dois metros e meio' })
FERRAMENTAS.comp_km_m = linear({ emoji: '📏', deNome: 'quilômetros', paraNome: 'metros', deSigla: 'km', paraSigla: 'm', fator: 1000, exemplo: '7,5' })
FERRAMENTAS.comp_cm_mm = linear({ emoji: '📏', deNome: 'centímetros', paraNome: 'milímetros', deSigla: 'cm', paraSigla: 'mm', fator: 10, exemplo: '18' })
FERRAMENTAS.comp_m_pe = linear({ emoji: '📏', deNome: 'metros', paraNome: 'pés', deSigla: 'm', paraSigla: 'pés', fator: 3.280839895, exemplo: '1,75', dica: 'Altura de pessoa em pés e polegadas: 1,75 m é 5 pés e 9 polegadas.' })
FERRAMENTAS.comp_pe_m = linear({ emoji: '📏', deNome: 'pés', paraNome: 'metros', deSigla: 'pés', paraSigla: 'm', fator: 0.3048, exemplo: '6' })
FERRAMENTAS.comp_pol_cm = linear({ emoji: '📏', deNome: 'polegadas', paraNome: 'centímetros', deSigla: 'pol', paraSigla: 'cm', fator: 2.54, exemplo: '15', dica: 'A polegada vale 25,4 mm por definição desde 1959.' })
FERRAMENTAS.comp_cm_pol = linear({ emoji: '📏', deNome: 'centímetros', paraNome: 'polegadas', deSigla: 'cm', paraSigla: 'pol', fator: 1 / 2.54, exemplo: '30' })
FERRAMENTAS.comp_mi_km = linear({ emoji: '🛣️', deNome: 'milhas', paraNome: 'quilômetros', deSigla: 'mi', paraSigla: 'km', fator: 1.609344, exemplo: '26,2', exemploTexto: 'distância de uma maratona em milhas' })
FERRAMENTAS.comp_km_mi = linear({ emoji: '🛣️', deNome: 'quilômetros', paraNome: 'milhas', deSigla: 'km', paraSigla: 'mi', fator: 1 / 1.609344, exemplo: '42,195' })
FERRAMENTAS.comp_jd_m = linear({ emoji: '🏈', deNome: 'jardas', paraNome: 'metros', deSigla: 'jd', paraSigla: 'm', fator: 0.9144, exemplo: '100' })
FERRAMENTAS.comp_m_jd = linear({ emoji: '🏈', deNome: 'metros', paraNome: 'jardas', deSigla: 'm', paraSigla: 'jd', fator: 1 / 0.9144, exemplo: '50' })
FERRAMENTAS.comp_nm_km = linear({ emoji: '⛵', deNome: 'milhas náuticas', paraNome: 'quilômetros', deSigla: 'nm', paraSigla: 'km', fator: 1.852, exemplo: '12', dica: 'A milha náutica é um minuto de arco do meridiano: 1.852 m exatos.' })

/* Massa (8) */
FERRAMENTAS.mas_kg_g = linear({ emoji: '⚖️', deNome: 'quilos', paraNome: 'gramas', deSigla: 'kg', paraSigla: 'g', fator: 1000, exemplo: '2,5' })
FERRAMENTAS.mas_g_mg = linear({ emoji: '⚖️', deNome: 'gramas', paraNome: 'miligramas', deSigla: 'g', paraSigla: 'mg', fator: 1000, exemplo: '0,5' })
FERRAMENTAS.mas_kg_lb = linear({ emoji: '🏋️', deNome: 'quilos', paraNome: 'libras', deSigla: 'kg', paraSigla: 'lb', fator: 1 / 0.45359237, exemplo: '80' })
FERRAMENTAS.mas_lb_kg = linear({ emoji: '🏋️', deNome: 'libras', paraNome: 'quilos', deSigla: 'lb', paraSigla: 'kg', fator: 0.45359237, exemplo: '185' })
FERRAMENTAS.mas_oz_g = linear({ emoji: '⚖️', deNome: 'onças', paraNome: 'gramas', deSigla: 'oz', paraSigla: 'g', fator: 28.349523125, exemplo: '8' })
FERRAMENTAS.mas_g_oz = linear({ emoji: '⚖️', deNome: 'gramas', paraNome: 'onças', deSigla: 'g', paraSigla: 'oz', fator: 1 / 28.349523125, exemplo: '500' })
FERRAMENTAS.mas_t_kg = linear({ emoji: '🚚', deNome: 'toneladas', paraNome: 'quilos', deSigla: 't', paraSigla: 'kg', fator: 1000, exemplo: '1,8' })
FERRAMENTAS.mas_arroba_kg = linear({ emoji: '🐂', deNome: 'arrobas', paraNome: 'quilos', deSigla: '@', paraSigla: 'kg', fator: 15, exemplo: '18', dica: 'No Brasil a arroba do boi é 15 kg. A arroba portuguesa antiga era 14,7 kg.' })

/* Volume (8) */
FERRAMENTAS.vol_l_ml = linear({ emoji: '🧃', deNome: 'litros', paraNome: 'mililitros', deSigla: 'L', paraSigla: 'ml', fator: 1000, exemplo: '1,5' })
FERRAMENTAS.vol_m3_l = linear({ emoji: '🛢️', deNome: 'metros cúbicos', paraNome: 'litros', deSigla: 'm³', paraSigla: 'L', fator: 1000, exemplo: '0,5', dica: 'A conta de água vem em m³: 1 m³ é mil litros.' })
FERRAMENTAS.vol_l_m3 = linear({ emoji: '🛢️', deNome: 'litros', paraNome: 'metros cúbicos', deSigla: 'L', paraSigla: 'm³', fator: 0.001, exemplo: '5000' })
FERRAMENTAS.vol_l_gal = linear({ emoji: '⛽', deNome: 'litros', paraNome: 'galões americanos', deSigla: 'L', paraSigla: 'gal', fator: 1 / 3.785411784, exemplo: '50' })
FERRAMENTAS.vol_gal_l = linear({ emoji: '⛽', deNome: 'galões americanos', paraNome: 'litros', deSigla: 'gal', paraSigla: 'L', fator: 3.785411784, exemplo: '15' })
FERRAMENTAS.vol_csopa_ml = linear({ emoji: '🥄', deNome: 'colheres de sopa', paraNome: 'mililitros', deSigla: 'colheres', paraSigla: 'ml', fator: 15, exemplo: '3' })
FERRAMENTAS.vol_ml_ozfl = linear({ emoji: '🥤', deNome: 'mililitros', paraNome: 'onças fluidas', deSigla: 'ml', paraSigla: 'fl oz', fator: 1 / 29.5735295625, exemplo: '350' })
FERRAMENTAS.vol_xicara_ml = linear({ emoji: '☕', deNome: 'xícaras', paraNome: 'mililitros', deSigla: 'xíc', paraSigla: 'ml', fator: 240, exemplo: '2', dica: 'Xícara de receita americana é 240 ml. A brasileira costuma ser 200 ml.' })

/* Área (6) */
FERRAMENTAS.area_m2_cm2 = linear({ emoji: '⬛', deNome: 'metros quadrados', paraNome: 'centímetros quadrados', deSigla: 'm²', paraSigla: 'cm²', fator: 10000, exemplo: '2', descricao: 'Converte metro quadrado em centímetro quadrado' })
FERRAMENTAS.area_km2_m2 = linear({ emoji: '🗺️', deNome: 'quilômetros quadrados', paraNome: 'metros quadrados', deSigla: 'km²', paraSigla: 'm²', fator: 1e6, exemplo: '0,5', descricao: 'Converte quilômetro quadrado em metro quadrado' })
FERRAMENTAS.area_ha_m2 = linear({ emoji: '🌾', deNome: 'hectares', paraNome: 'metros quadrados', deSigla: 'ha', paraSigla: 'm²', fator: 10000, exemplo: '3' })
FERRAMENTAS.area_alq_ha = linear({ emoji: '🌾', deNome: 'alqueires paulistas', paraNome: 'hectares', deSigla: 'alq', paraSigla: 'ha', fator: 2.42, exemplo: '5', dica: 'Alqueire paulista tem 24.200 m². O mineiro tem 48.400 m², o dobro.' })
FERRAMENTAS.area_acre_m2 = linear({ emoji: '🌱', deNome: 'acres', paraNome: 'metros quadrados', deSigla: 'acres', paraSigla: 'm²', fator: 4046.8564224, exemplo: '2' })
FERRAMENTAS.area_m2_pe2 = linear({ emoji: '🏠', deNome: 'metros quadrados', paraNome: 'pés quadrados', deSigla: 'm²', paraSigla: 'pés²', fator: 10.7639104167, exemplo: '65', descricao: 'Converte metro quadrado em pé quadrado' })

/* Temperatura (6) */
FERRAMENTAS.temp_c_f = temperatura({ de: 'C', para: 'F', paraCelsius: v => v, deCelsius: c => c * 9 / 5 + 32, exemplo: '36,5' })
FERRAMENTAS.temp_f_c = temperatura({ de: 'F', para: 'C', paraCelsius: v => (v - 32) * 5 / 9, deCelsius: c => c, exemplo: '98,6' })
FERRAMENTAS.temp_c_k = temperatura({ de: 'C', para: 'K', paraCelsius: v => v, deCelsius: c => c + 273.15, exemplo: '25' })
FERRAMENTAS.temp_k_c = temperatura({ de: 'K', para: 'C', paraCelsius: v => v - 273.15, deCelsius: c => c, exemplo: '300' })
FERRAMENTAS.temp_f_k = temperatura({ de: 'F', para: 'K', paraCelsius: v => (v - 32) * 5 / 9, deCelsius: c => c + 273.15, exemplo: '212' })
FERRAMENTAS.temp_c_r = temperatura({ de: 'C', para: 'R', paraCelsius: v => v, deCelsius: c => (c + 273.15) * 9 / 5, exemplo: '20', nota: 'Rankine é o Kelvin com o passo do Fahrenheit. Aparece em engenharia americana.' })

/* Velocidade (8) */
FERRAMENTAS.vel_kmh_ms = linear({ emoji: '🚗', deNome: 'quilômetros por hora', paraNome: 'metros por segundo', deSigla: 'km/h', paraSigla: 'm/s', fator: 1 / 3.6, exemplo: '108', descricao: 'Converte km por hora em metros por segundo' })
FERRAMENTAS.vel_ms_kmh = linear({ emoji: '🚗', deNome: 'metros por segundo', paraNome: 'quilômetros por hora', deSigla: 'm/s', paraSigla: 'km/h', fator: 3.6, exemplo: '10', descricao: 'Converte metros por segundo em km por hora' })
FERRAMENTAS.vel_kmh_mph = linear({ emoji: '🏎️', deNome: 'quilômetros por hora', paraNome: 'milhas por hora', deSigla: 'km/h', paraSigla: 'mph', fator: 1 / 1.609344, exemplo: '100', descricao: 'Converte km por hora em milhas por hora' })
FERRAMENTAS.vel_mph_kmh = linear({ emoji: '🏎️', deNome: 'milhas por hora', paraNome: 'quilômetros por hora', deSigla: 'mph', paraSigla: 'km/h', fator: 1.609344, exemplo: '65', descricao: 'Converte milhas por hora em km por hora' })
FERRAMENTAS.vel_no_kmh = linear({ emoji: '⚓', deNome: 'nós', paraNome: 'quilômetros por hora', deSigla: 'nós', paraSigla: 'km/h', fator: 1.852, exemplo: '20', descricao: 'Converte nós em quilômetros por hora' })
FERRAMENTAS.vel_kmh_no = linear({ emoji: '⚓', deNome: 'quilômetros por hora', paraNome: 'nós', deSigla: 'km/h', paraSigla: 'nós', fator: 1 / 1.852, exemplo: '90', descricao: 'Converte quilômetros por hora em nós' })
FERRAMENTAS.vel_mach_kmh = linear({ emoji: '✈️', deNome: 'mach', paraNome: 'quilômetros por hora', deSigla: 'mach', paraSigla: 'km/h', fator: 1234.8, exemplo: '2', dica: 'Mach 1 ao nível do mar, a 15 °C, é 1.234,8 km/h. A altitude muda esse valor.' })
FERRAMENTAS.vel_pace_kmh = {
    emoji: '🏃',
    sub: 'Conversões',
    titulo: 'Ritmo de corrida em velocidade',
    descricao: 'Converte ritmo min por km em km por hora',
    uso: '<minutos por km, ex 5:30>',
    exemplos: [{ args: '5:30', oque: 'ritmo de cinco e meio por quilômetro' }, { args: '4:00', oque: 'ritmo de quatro minutos' }],
    dica: 'Ritmo menor é corrida mais rápida: 4:00 é bem mais veloz que 6:00.',
    calcular(args) {
        const bruto = String(args[0] || '').replace(/\s/g, '')
        const m = bruto.match(/^(\d{1,2})[:.'](\d{1,2})$/) || bruto.match(/^(\d{1,2})$/)
        if (!m) throw falha('Escreva o ritmo como minutos e segundos por quilômetro, por exemplo 5:30.')
        const minutos = Number(m[1]) + Number(m[2] || 0) / 60
        if (minutos <= 0) throw falha('O ritmo precisa ser maior que zero, senão a velocidade seria infinita.')
        const kmh = 60 / minutos
        const tempos = [5, 10, 21.0975, 42.195].map(d => {
            const t = d * minutos
            return `• ${fmt(d, 3)} km em ${Math.floor(t / 60)}h${String(Math.round(t % 60)).padStart(2, '0')}`
        })
        return {
            intro: `Ritmo de ${bruto} por km é ${forte(kmh, 'km/h', 2)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Velocidade:* ${forte(kmh, 'km/h', 2)}`, `*Em m/s:* ${fmt(kmh / 3.6, 2)} m/s`, `*Ritmo por milha:* ${fmt(minutos * 1.609344, 2)} min`] },
                { emoji: '🏁', titulo: 'Nesse ritmo você faz', linhas: tempos }
            ]
        }
    }
}

/* Pressão (5) */
FERRAMENTAS.pre_atm_pa = linear({ emoji: '🎈', deNome: 'atmosferas', paraNome: 'pascals', deSigla: 'atm', paraSigla: 'Pa', fator: 101325, exemplo: '1' })
FERRAMENTAS.pre_bar_psi = linear({ emoji: '🛞', deNome: 'bar', paraNome: 'psi', deSigla: 'bar', paraSigla: 'psi', fator: 14.5037738, exemplo: '2,2' })
FERRAMENTAS.pre_psi_bar = linear({ emoji: '🛞', deNome: 'psi', paraNome: 'bar', deSigla: 'psi', paraSigla: 'bar', fator: 1 / 14.5037738, exemplo: '32', dica: 'Pneu de carro de passeio costuma pedir de 30 a 35 psi.' })
FERRAMENTAS.pre_mmhg_atm = linear({ emoji: '🩺', deNome: 'milímetros de mercúrio', paraNome: 'atmosferas', deSigla: 'mmHg', paraSigla: 'atm', fator: 1 / 760, exemplo: '760', descricao: 'Converte mmHg em atmosferas' })
FERRAMENTAS.pre_kgfcm2_psi = linear({ emoji: '🛞', deNome: 'quilos-força por cm²', paraNome: 'psi', deSigla: 'kgf/cm²', paraSigla: 'psi', fator: 14.2233433, exemplo: '2,2', descricao: 'Converte kgf por cm² em psi (calibragem)' })

/* Energia (5) */
FERRAMENTAS.ene_cal_j = linear({ emoji: '🔥', deNome: 'calorias', paraNome: 'joules', deSigla: 'cal', paraSigla: 'J', fator: 4.184, exemplo: '500' })
FERRAMENTAS.ene_j_cal = linear({ emoji: '🔥', deNome: 'joules', paraNome: 'calorias', deSigla: 'J', paraSigla: 'cal', fator: 1 / 4.184, exemplo: '2000' })
FERRAMENTAS.ene_kcal_kj = linear({ emoji: '🍽️', deNome: 'quilocalorias', paraNome: 'quilojoules', deSigla: 'kcal', paraSigla: 'kJ', fator: 4.184, exemplo: '2000', dica: 'A "caloria" do rótulo de alimento é, na verdade, a quilocaloria.' })
FERRAMENTAS.ene_kwh_j = linear({ emoji: '💡', deNome: 'quilowatt-hora', paraNome: 'joules', deSigla: 'kWh', paraSigla: 'J', fator: 3.6e6, exemplo: '1' })
FERRAMENTAS.ene_btu_kj = linear({ emoji: '❄️', deNome: 'BTU', paraNome: 'quilojoules', deSigla: 'BTU', paraSigla: 'kJ', fator: 1.05505585, exemplo: '12000' })

/* Potência (4) */
FERRAMENTAS.pot_cv_kw = linear({ emoji: '🐎', deNome: 'cavalos-vapor', paraNome: 'quilowatts', deSigla: 'cv', paraSigla: 'kW', fator: 0.73549875, exemplo: '150' })
FERRAMENTAS.pot_kw_cv = linear({ emoji: '🐎', deNome: 'quilowatts', paraNome: 'cavalos-vapor', deSigla: 'kW', paraSigla: 'cv', fator: 1 / 0.73549875, exemplo: '110' })
FERRAMENTAS.pot_hp_kw = linear({ emoji: '🏁', deNome: 'horsepower', paraNome: 'quilowatts', deSigla: 'hp', paraSigla: 'kW', fator: 0.745699872, exemplo: '300', dica: 'hp americano e cv métrico não são iguais: 1 hp vale 1,0139 cv.' })
FERRAMENTAS.pot_w_btuh = linear({ emoji: '❄️', deNome: 'watts', paraNome: 'BTU por hora', deSigla: 'W', paraSigla: 'BTU/h', fator: 3.412141633, exemplo: '1000' })

/* Tempo (6) */
FERRAMENTAS.tmp_h_min = linear({ emoji: '⏱️', deNome: 'horas', paraNome: 'minutos', deSigla: 'h', paraSigla: 'min', fator: 60, exemplo: '2,5' })
FERRAMENTAS.tmp_d_h = linear({ emoji: '📆', deNome: 'dias', paraNome: 'horas', deSigla: 'dias', paraSigla: 'h', fator: 24, exemplo: '7' })
FERRAMENTAS.tmp_min_s = linear({ emoji: '⏱️', deNome: 'minutos', paraNome: 'segundos', deSigla: 'min', paraSigla: 's', fator: 60, exemplo: '90' })
FERRAMENTAS.tmp_sem_d = linear({ emoji: '📆', deNome: 'semanas', paraNome: 'dias', deSigla: 'semanas', paraSigla: 'dias', fator: 7, exemplo: '6' })
FERRAMENTAS.tmp_ano_d = linear({ emoji: '📅', deNome: 'anos', paraNome: 'dias', deSigla: 'anos', paraSigla: 'dias', fator: 365.25, exemplo: '3', dica: 'Uso 365,25 dias por ano para já embutir o ano bissexto.' })
FERRAMENTAS.tmp_s_legivel = {
    emoji: '⏳',
    sub: 'Conversões',
    titulo: 'Segundos em tempo legível',
    descricao: 'Transforma segundos em dias, horas e minutos',
    uso: '<quantidade de segundos>',
    exemplos: [{ args: '100000', oque: 'cem mil segundos' }, { args: '5400', oque: 'uma hora e meia' }],
    dica: 'Serve para ler duração de vídeo, de processo e de cronômetro.',
    calcular(args) {
        const s = exigirNumero(args[0], 'número de segundos', { permiteNegativo: false })
        let resto = Math.floor(s)
        const dias = Math.floor(resto / 86400); resto -= dias * 86400
        const horas = Math.floor(resto / 3600); resto -= horas * 3600
        const min = Math.floor(resto / 60); const seg = resto - min * 60
        const partes = []
        if (dias) partes.push(`${dias} dia${dias > 1 ? 's' : ''}`)
        if (horas) partes.push(`${horas} hora${horas > 1 ? 's' : ''}`)
        if (min) partes.push(`${min} minuto${min > 1 ? 's' : ''}`)
        if (seg || !partes.length) partes.push(`${seg} segundo${seg !== 1 ? 's' : ''}`)
        return {
            intro: `${fmt(s, 0)} segundos são ${'*' + partes.join(', ') + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Por extenso:* ${partes.join(', ')}`,
                    `*Relógio:* ${String(dias * 24 + horas).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`,
                    `*Em horas:* ${fmt(s / 3600, 2)} h`,
                    `*Em dias:* ${fmt(s / 86400, 3)} dias`
                ] }
            ]
        }
    }
}

/* Ângulo (4) */
FERRAMENTAS.ang_grau_rad = linear({ emoji: '📐', deNome: 'graus', paraNome: 'radianos', deSigla: '°', paraSigla: 'rad', fator: Math.PI / 180, exemplo: '180', permiteNegativo: true })
FERRAMENTAS.ang_rad_grau = linear({ emoji: '📐', deNome: 'radianos', paraNome: 'graus', deSigla: 'rad', paraSigla: '°', fator: 180 / Math.PI, exemplo: '3,14159', permiteNegativo: true })
FERRAMENTAS.ang_dec_gms = {
    emoji: '🧭',
    sub: 'Conversões',
    titulo: 'Graus decimais em grau, minuto e segundo',
    descricao: 'Converte grau decimal em grau, minuto e segundo',
    uso: '<graus decimais, ex -23,5505>',
    exemplos: [{ args: '-23,5505', oque: 'latitude de São Paulo' }, { args: '45,75', oque: 'quarenta e cinco graus e três quartos' }],
    dica: 'Coordenada de GPS costuma vir decimal; carta náutica e mapa antigo vêm em GMS.',
    calcular(args) {
        const v = exigirNumero(args[0], 'valor em graus')
        const sinal = v < 0 ? -1 : 1
        const abs = Math.abs(v)
        const g = Math.floor(abs)
        const mFloat = (abs - g) * 60
        const m = Math.floor(mFloat)
        const s = (mFloat - m) * 60
        const texto = `${sinal < 0 ? '-' : ''}${g}° ${m}' ${fmt(s, 2)}"`
        return {
            intro: `${fmt(v, 6)}° em grau, minuto e segundo é ${'*' + texto + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Graus:* ${sinal < 0 ? '-' : ''}${g}`,
                    `*Minutos:* ${m}`,
                    `*Segundos:* ${fmt(s, 3)}`,
                    `*Escrito junto:* ${texto}`
                ] },
                { emoji: '📐', titulo: 'Conferência', linhas: [`1 grau tem 60 minutos e 1 minuto tem 60 segundos, então ${fmt(v, 6)}° volta a dar o mesmo valor.`] }
            ]
        }
    }
}
FERRAMENTAS.ang_gms_dec = {
    emoji: '🧭',
    sub: 'Conversões',
    titulo: 'Grau, minuto e segundo em decimal',
    descricao: 'Converte grau minuto segundo em grau decimal',
    uso: '<grau> <minuto> <segundo>',
    exemplos: [{ args: '23 33 18', oque: 'vinte e três graus, 33 minutos e 18 segundos' }, { args: '45 45 0', oque: 'quarenta e cinco e três quartos' }],
    dica: 'Para latitude sul ou longitude oeste, coloque o sinal de menos no grau.',
    calcular(args) {
        const g = exigirNumero(args[0], 'valor dos graus')
        const m = args.length > 1 ? exigirNumero(args[1], 'valor dos minutos', { permiteNegativo: false }) : 0
        const s = args.length > 2 ? exigirNumero(args[2], 'valor dos segundos', { permiteNegativo: false }) : 0
        if (m >= 60) throw falha('Os minutos vão de 0 a 59. Acima disso, some 1 grau.')
        if (s >= 60) throw falha('Os segundos vão de 0 a 59,99. Acima disso, some 1 minuto.')
        const sinal = String(args[0]).trim().startsWith('-') ? -1 : 1
        const dec = sinal * (Math.abs(g) + m / 60 + s / 3600)
        return {
            intro: `${Math.trunc(g)}° ${fmt(m, 0)}' ${fmt(s, 2)}" em decimal é ${'*' + fmt(dec, 6) + '°*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Grau decimal:* ${fmt(dec, 6)}°`,
                    `*Em radianos:* ${fmt(dec * Math.PI / 180, 6)} rad`,
                    `*Parte dos minutos:* ${fmt(m / 60, 6)}°`,
                    `*Parte dos segundos:* ${fmt(s / 3600, 6)}°`
                ] }
            ]
        }
    }
}

/* Dados digitais (8) */
FERRAMENTAS.dig_mb_gb = linear({ emoji: '💾', deNome: 'megabytes', paraNome: 'gigabytes', deSigla: 'MB', paraSigla: 'GB', fator: 1 / 1024, exemplo: '2048' })
FERRAMENTAS.dig_gb_mb = linear({ emoji: '💾', deNome: 'gigabytes', paraNome: 'megabytes', deSigla: 'GB', paraSigla: 'MB', fator: 1024, exemplo: '16' })
FERRAMENTAS.dig_gb_tb = linear({ emoji: '🗄️', deNome: 'gigabytes', paraNome: 'terabytes', deSigla: 'GB', paraSigla: 'TB', fator: 1 / 1024, exemplo: '500' })
FERRAMENTAS.dig_kb_mb = linear({ emoji: '📁', deNome: 'kilobytes', paraNome: 'megabytes', deSigla: 'KB', paraSigla: 'MB', fator: 1 / 1024, exemplo: '5000' })
FERRAMENTAS.dig_byte_bit = linear({ emoji: '🔢', deNome: 'bytes', paraNome: 'bits', deSigla: 'bytes', paraSigla: 'bits', fator: 8, exemplo: '1024' })
FERRAMENTAS.dig_mbps_mbs = linear({ emoji: '📶', deNome: 'megabits por segundo', paraNome: 'megabytes por segundo', deSigla: 'Mbps', paraSigla: 'MB/s', fator: 1 / 8, exemplo: '300', dica: 'A operadora vende em megabit; o download aparece em megabyte. Por isso "parece" oito vezes menor.' })
FERRAMENTAS.dig_download = {
    emoji: '⬇️',
    sub: 'Conversões',
    titulo: 'Tempo de download',
    descricao: 'Calcula quanto demora baixar um arquivo',
    uso: '<tamanho em GB> <velocidade em Mbps>',
    exemplos: [{ args: '50 300', oque: 'jogo de 50 GB em link de 300 megas' }, { args: '1,5 20', oque: 'filme em internet lenta' }],
    dica: 'A conta usa a velocidade cheia. Na prática o resultado costuma ser de 10% a 20% maior.',
    calcular(args) {
        const gb = exigirNumero(args[0], 'tamanho em GB', { permiteNegativo: false, permiteZero: false })
        const mbps = exigirNumero(args[1], 'velocidade em Mbps', { permiteNegativo: false, permiteZero: false })
        const mbytesPorSeg = mbps / 8
        const segundos = (gb * 1024) / mbytesPorSeg
        const h = Math.floor(segundos / 3600); const m = Math.floor((segundos % 3600) / 60); const s = Math.round(segundos % 60)
        const legivel = h ? `${h} h ${m} min` : (m ? `${m} min ${s} s` : `${s} s`)
        return {
            intro: `Baixar ${fmt(gb, 2)} GB a ${fmt(mbps, 0)} Mbps leva cerca de ${'*' + legivel + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Tempo estimado:* ${legivel}`,
                    `*Velocidade real:* ${fmt(mbytesPorSeg, 2)} MB por segundo`,
                    `*Com 20% de perda:* ${fmt(segundos * 1.2 / 60, 1)} min`
                ] },
                { emoji: '📊', titulo: 'Nessa mesma velocidade', linhas: [1, 10, 100].map(k => `• ${k} GB em ${fmt((k * 1024 / mbytesPorSeg) / 60, 1)} min`) }
            ]
        }
    }
}
FERRAMENTAS.dig_bytes_legivel = {
    emoji: '📦',
    sub: 'Conversões',
    titulo: 'Bytes em tamanho legível',
    descricao: 'Transforma um monte de bytes em KB, MB ou GB',
    uso: '<quantidade de bytes>',
    exemplos: [{ args: '1234567890', oque: 'mais de um bilhão de bytes' }, { args: '4096', oque: 'tamanho de um bloco de disco' }],
    dica: 'Fabricante de HD usa mil; o sistema usa 1024. Por isso o HD de 1 TB aparece com 931 GB.',
    calcular(args) {
        const b = exigirNumero(args[0], 'quantidade de bytes', { permiteNegativo: false })
        const bin = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB']
        let i = 0; let v = b
        while (v >= 1024 && i < bin.length - 1) { v /= 1024; i++ }
        const dec = ['bytes', 'KB', 'MB', 'GB', 'TB']
        let j = 0; let w = b
        while (w >= 1000 && j < dec.length - 1) { w /= 1000; j++ }
        return {
            intro: `${fmt(b, 0)} bytes são ${forte(v, bin[i], 2)} na conta do sistema.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Base 1024 (sistema):* ${fmt(v, 2)} ${bin[i]}`,
                    `*Base 1000 (fabricante):* ${fmt(w, 2)} ${dec[j]}`,
                    `*Em bits:* ${fmt(b * 8, 0)}`
                ] },
                { emoji: '🔍', titulo: 'Por que os dois números', linhas: ['O disco é vendido contando de mil em mil e lido de 1024 em 1024. A diferença cresce a cada degrau.'] }
            ]
        }
    }
}

/* Combustível (4) */
FERRAMENTAS.comb_kml_l100 = {
    emoji: '⛽',
    sub: 'Conversões',
    titulo: 'Quilômetros por litro em litros por 100 km',
    descricao: 'Converte km por litro em litros por 100 km',
    uso: '<consumo em km/l>',
    exemplos: [{ args: '12,5', oque: 'carro popular na cidade' }, { args: '18', oque: 'carro econômico na estrada' }],
    dica: 'O jeito europeu é l/100 km: quanto MENOR, mais econômico. É o contrário do km/l.',
    calcular(args) {
        const kml = exigirNumero(args[0], 'consumo em km por litro', { permiteNegativo: false, permiteZero: false })
        const l100 = 100 / kml
        return {
            intro: `${fmt(kml, 2)} km/l é o mesmo que ${forte(l100, 'l/100 km', 2)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Consumo europeu:* ${forte(l100, 'l/100 km', 2)}`,
                    `*Para 500 km:* ${fmt(500 / kml, 1)} litros`,
                    `*Tanque de 45 litros roda:* ${fmt(45 * kml, 0)} km`
                ] },
                { emoji: '📊', titulo: 'Comparação', linhas: [8, 12, 16, 20].map(k => `• ${k} km/l = ${fmt(100 / k, 2)} l/100 km`) }
            ]
        }
    }
}
FERRAMENTAS.comb_l100_kml = {
    emoji: '⛽',
    sub: 'Conversões',
    titulo: 'Litros por 100 km em quilômetros por litro',
    descricao: 'Converte litros por 100 km em km por litro',
    uso: '<consumo em l/100 km>',
    exemplos: [{ args: '8', oque: 'consumo comum de carro europeu' }, { args: '5,5', oque: 'carro bem econômico' }],
    dica: 'No Brasil o número usado é km/l: quanto MAIOR, melhor.',
    calcular(args) {
        const l100 = exigirNumero(args[0], 'consumo em litros por 100 km', { permiteNegativo: false, permiteZero: false })
        const kml = 100 / l100
        return {
            intro: `${fmt(l100, 2)} l/100 km é o mesmo que ${forte(kml, 'km/l', 2)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Consumo brasileiro:* ${forte(kml, 'km/l', 2)}`,
                    `*Para 1.000 km:* ${fmt(l100 * 10, 1)} litros`,
                    `*Tanque de 50 litros roda:* ${fmt(50 * kml, 0)} km`
                ] },
                { emoji: '📊', titulo: 'Comparação', linhas: [5, 7, 9, 12].map(k => `• ${k} l/100 km = ${fmt(100 / k, 2)} km/l`) }
            ]
        }
    }
}
FERRAMENTAS.comb_mpg_kml = linear({ emoji: '🚙', deNome: 'milhas por galão', paraNome: 'quilômetros por litro', deSigla: 'mpg', paraSigla: 'km/l', fator: 1.609344 / 3.785411784, exemplo: '30', descricao: 'Converte milhas por galão em km por litro' })
FERRAMENTAS.comb_kml_mpg = linear({ emoji: '🚙', deNome: 'quilômetros por litro', paraNome: 'milhas por galão', deSigla: 'km/l', paraSigla: 'mpg', fator: 3.785411784 / 1.609344, exemplo: '12', descricao: 'Converte km por litro em milhas por galão' })

/* Cozinha (10) */
FERRAMENTAS.coz_xic_farinha = cozinha({ chaveIngrediente: 'farinha', medida: 'xicara', emoji: '🍞' })
FERRAMENTAS.coz_xic_acucar = cozinha({ chaveIngrediente: 'acucar', medida: 'xicara', emoji: '🍬' })
FERRAMENTAS.coz_xic_arroz = cozinha({ chaveIngrediente: 'arroz', medida: 'xicara', emoji: '🍚' })
FERRAMENTAS.coz_xic_leite = cozinha({ chaveIngrediente: 'leite', medida: 'xicara', emoji: '🥛' })
FERRAMENTAS.coz_xic_oleo = cozinha({ chaveIngrediente: 'oleo', medida: 'xicara', emoji: '🫒' })
FERRAMENTAS.coz_xic_cacau = cozinha({ chaveIngrediente: 'cacau', medida: 'xicara', emoji: '🍫' })
FERRAMENTAS.coz_sopa_manteiga = cozinha({ chaveIngrediente: 'manteiga', medida: 'sopa', emoji: '🧈' })
FERRAMENTAS.coz_sopa_acucar = cozinha({ chaveIngrediente: 'acucar', medida: 'sopa', emoji: '🍬' })
FERRAMENTAS.coz_cha_sal = cozinha({ chaveIngrediente: 'sal', medida: 'cha', emoji: '🧂' })
FERRAMENTAS.coz_g_para_medida = {
    emoji: '🥣',
    sub: 'Conversões',
    titulo: 'Gramas em medida caseira',
    descricao: 'Diz quantas xícaras e colheres dão X gramas',
    uso: '<gramas> <ingrediente>',
    exemplos: [{ args: '250 farinha', oque: '250 gramas de farinha em xícaras' }, { args: '100 acucar', oque: 'cem gramas de açúcar' }],
    dica: 'Ingredientes que eu conheço: ' + Object.keys(INGREDIENTES).join(', ') + '.',
    calcular(args) {
        const g = exigirNumero(args[0], 'peso em gramas', { permiteNegativo: false, permiteZero: false })
        const chave = String(args[1] || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        const ing = INGREDIENTES[chave]
        if (!ing) throw falha(`Não tenho a densidade de "${chave || 'nada'}". Ingredientes que eu conheço: ${Object.keys(INGREDIENTES).join(', ')}.`)
        const xic = g / ing.xicara
        const sopa = g / ing.sopa
        const inteiras = Math.floor(xic)
        const sobra = (xic - inteiras) * ing.xicara
        return {
            intro: `${fmt(g, 0)} g de ${ing.nome} dão cerca de ${forte(xic, 'xícaras', 2)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Em xícaras:* ${fmt(xic, 2)}`,
                    `*Em colheres de sopa:* ${fmt(sopa, 1)}`,
                    `*Medida prática:* ${inteiras} xícara${inteiras === 1 ? '' : 's'} + ${fmt(sobra / ing.sopa, 1)} colheres de sopa`,
                    `*Volume aproximado:* ${fmt(g / ing.ml, 0)} ml`
                ] },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [cap(VIGENCIA_TABELAS) + '. Xícara de 240 ml, colher de sopa de 15 ml.'] }
            ]
        }
    }
}

/* Roupa e calçado (7) */
FERRAMENTAS.tam_calcado_br_eua_f = {
    emoji: '👠',
    sub: 'Conversões',
    titulo: 'Calçado feminino do Brasil para os Estados Unidos',
    descricao: 'Numeração de calçado feminino BR para EUA',
    uso: '<número brasileiro, 33 a 42>',
    exemplos: [{ args: '37', oque: 'número mais comum no Brasil' }, { args: '35', oque: 'pé menor' }],
    dica: `Equivalência comercial usual (${VIGENCIA_TABELAS}). Cada marca varia meio número.`,
    calcular(args) {
        const n = Math.round(exigirNumero(args[0], 'número do calçado', { permiteNegativo: false }))
        const eua = CALCADO_FEM[n]
        if (!eua) throw falha(`Tenho a tabela feminina de 33 a 42. O número ${n} está fora dela.`)
        return {
            intro: `O ${n} brasileiro feminino equivale ao ${'*' + eua + ' americano*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Brasil:* ${n}`, `*Estados Unidos:* ${eua}`, `*Europa:* ${CALCADO_EU[n] || '—'}`, `*Comprimento do pé:* cerca de ${fmt(n * 0.667 + 2, 1)} cm`] },
                { emoji: '📊', titulo: 'Vizinhos na tabela', linhas: [n - 1, n, n + 1].filter(k => CALCADO_FEM[k]).map(k => `• BR ${k} = EUA ${CALCADO_FEM[k]} = EU ${CALCADO_EU[k]}`) },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [cap(VIGENCIA_TABELAS) + '.'] }
            ]
        }
    }
}
FERRAMENTAS.tam_calcado_br_eua_m = {
    emoji: '👞',
    sub: 'Conversões',
    titulo: 'Calçado masculino do Brasil para os Estados Unidos',
    descricao: 'Numeração de calçado masculino BR para EUA',
    uso: '<número brasileiro, 37 a 46>',
    exemplos: [{ args: '41', oque: 'número mais comum no Brasil' }, { args: '44', oque: 'pé maior' }],
    dica: `Equivalência comercial usual (${VIGENCIA_TABELAS}). Tênis costuma calçar meio número maior.`,
    calcular(args) {
        const n = Math.round(exigirNumero(args[0], 'número do calçado', { permiteNegativo: false }))
        const eua = CALCADO_MASC[n]
        if (!eua) throw falha(`Tenho a tabela masculina de 37 a 46. O número ${n} está fora dela.`)
        return {
            intro: `O ${n} brasileiro masculino equivale ao ${'*' + eua + ' americano*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Brasil:* ${n}`, `*Estados Unidos:* ${eua}`, `*Europa:* ${CALCADO_EU[n] || '—'}`, `*Comprimento do pé:* cerca de ${fmt(n * 0.667 + 2, 1)} cm`] },
                { emoji: '📊', titulo: 'Vizinhos na tabela', linhas: [n - 1, n, n + 1].filter(k => CALCADO_MASC[k]).map(k => `• BR ${k} = EUA ${CALCADO_MASC[k]} = EU ${CALCADO_EU[k]}`) },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [cap(VIGENCIA_TABELAS) + '.'] }
            ]
        }
    }
}
FERRAMENTAS.tam_calcado_br_eu = {
    emoji: '🥾',
    sub: 'Conversões',
    titulo: 'Calçado do Brasil para a Europa',
    descricao: 'Numeração de calçado do Brasil para a Europa',
    uso: '<número brasileiro, 33 a 46>',
    exemplos: [{ args: '40', oque: 'número brasileiro 40 na Europa' }, { args: '36', oque: 'número menor' }],
    dica: `A europeia costuma ser um número acima da brasileira (${VIGENCIA_TABELAS}).`,
    calcular(args) {
        const n = Math.round(exigirNumero(args[0], 'número do calçado', { permiteNegativo: false }))
        const eu = CALCADO_EU[n]
        if (!eu) throw falha(`Tenho a tabela de 33 a 46. O número ${n} está fora dela.`)
        return {
            intro: `O ${n} brasileiro equivale ao ${'*' + eu + ' europeu*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Brasil:* ${n}`, `*Europa:* ${eu}`, `*Estados Unidos (fem.):* ${CALCADO_FEM[n] || '—'}`, `*Estados Unidos (masc.):* ${CALCADO_MASC[n] || '—'}`] },
                { emoji: '📊', titulo: 'Vizinhos na tabela', linhas: [n - 1, n, n + 1].filter(k => CALCADO_EU[k]).map(k => `• BR ${k} = EU ${CALCADO_EU[k]}`) },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [cap(VIGENCIA_TABELAS) + '.'] }
            ]
        }
    }
}
FERRAMENTAS.tam_calcado_eua_br = {
    emoji: '👟',
    sub: 'Conversões',
    titulo: 'Calçado dos Estados Unidos para o Brasil',
    descricao: 'Numeração de calçado dos EUA para o Brasil',
    uso: '<número americano> [f ou m]',
    exemplos: [{ args: '9 m', oque: 'número 9 masculino americano' }, { args: '7,5 f', oque: 'número 7,5 feminino' }],
    dica: `Diga f para feminino e m para masculino: as duas tabelas são diferentes (${VIGENCIA_TABELAS}).`,
    calcular(args) {
        const alvo = String(args[0] || '').replace(',', '.').trim()
        const sexo = String(args[1] || 'm').toLowerCase().startsWith('f') ? 'f' : 'm'
        const tabela = sexo === 'f' ? CALCADO_FEM : CALCADO_MASC
        const achado = Object.entries(tabela).find(([, v]) => v.replace(',', '.') === alvo)
        if (!achado) throw falha(`Não achei o número americano "${alvo || 'nada'}" na tabela ${sexo === 'f' ? 'feminina' : 'masculina'}. Valores possíveis: ${Object.values(tabela).join(', ')}.`)
        const br = Number(achado[0])
        return {
            intro: `O ${alvo} americano ${sexo === 'f' ? 'feminino' : 'masculino'} equivale ao ${'*' + br + ' brasileiro*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Estados Unidos:* ${achado[1]}`, `*Brasil:* ${br}`, `*Europa:* ${CALCADO_EU[br] || '—'}`, `*Tabela usada:* ${sexo === 'f' ? 'feminina' : 'masculina'}`] },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [cap(VIGENCIA_TABELAS) + '.'] }
            ]
        }
    }
}
FERRAMENTAS.tam_roupa_br = {
    emoji: '👕',
    sub: 'Conversões',
    titulo: 'Tamanho de roupa entre Brasil, Estados Unidos e Europa',
    descricao: 'Tamanho de roupa PP a XGG em BR, EUA e Europa',
    uso: '<PP, P, M, G, GG ou XGG>',
    exemplos: [{ args: 'M', oque: 'tamanho médio' }, { args: 'GG', oque: 'tamanho extra grande' }],
    dica: `Tabela feminina adulta de uso comercial (${VIGENCIA_TABELAS}).`,
    calcular(args) {
        const k = String(args[0] || '').toLowerCase().trim()
        const t = ROUPA_FEM[k]
        if (!t) throw falha(`Use PP, P, M, G, GG ou XGG. Recebi "${String(args[0] || '').slice(0, 10) || 'nada'}".`)
        return {
            intro: `O tamanho ${k.toUpperCase()} corresponde ao ${'*' + t.br + ' brasileiro*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Letra:* ${k.toUpperCase()}`, `*Brasil:* ${t.br}`, `*Estados Unidos:* ${t.eua}`, `*Europa:* ${t.eu}`] },
                { emoji: '📊', titulo: 'Tabela inteira', linhas: Object.entries(ROUPA_FEM).map(([letra, v]) => `• ${letra.toUpperCase()}: BR ${v.br} / EUA ${v.eua} / EU ${v.eu}`) },
                { emoji: '📅', titulo: 'De quando é a tabela', linhas: [cap(VIGENCIA_TABELAS) + '.'] }
            ]
        }
    }
}
FERRAMENTAS.tam_sutia = {
    emoji: '👙',
    sub: 'Conversões',
    titulo: 'Tamanho de sutiã pela medida do corpo',
    descricao: 'Calcula o tamanho do sutiã por tórax e busto',
    uso: '<tórax em cm> <busto em cm>',
    exemplos: [{ args: '78 92', oque: 'tórax 78 e busto 92' }, { args: '84 96', oque: 'outra combinação' }],
    dica: 'Meça o tórax logo abaixo do busto e o busto na parte mais cheia, sem apertar a fita.',
    calcular(args) {
        const torax = exigirNumero(args[0], 'medida do tórax em cm', { permiteNegativo: false, permiteZero: false })
        const busto = exigirNumero(args[1], 'medida do busto em cm', { permiteNegativo: false, permiteZero: false })
        if (busto < torax) throw falha('O busto precisa ser maior que o tórax. Confira se não trocou a ordem das medidas.')
        const banda = Math.round((torax + 12) / 2) * 2
        const dif = busto - torax
        const TACAS = [[0, 'AA'], [10, 'A'], [12.5, 'B'], [15, 'C'], [17.5, 'D'], [20, 'DD'], [22.5, 'E'], [25, 'F']]
        let taca = 'AA'
        for (const [lim, letra] of TACAS) if (dif >= lim) taca = letra
        const brNumero = Math.max(36, Math.min(52, banda))
        return {
            intro: `Com tórax de ${fmt(torax, 0)} cm e busto de ${fmt(busto, 0)} cm, o tamanho é ${'*' + brNumero + taca + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Tamanho brasileiro:* ${brNumero}${taca}`,
                    `*Banda (faixa do tórax):* ${brNumero}`,
                    `*Taça:* ${taca}`,
                    `*Diferença busto e tórax:* ${fmt(dif, 1)} cm`
                ] },
                { emoji: '📏', titulo: 'Como a conta funciona', linhas: ['A banda vem do tórax arredondado para o par mais próximo. A taça vem da diferença entre busto e tórax, uma letra a cada 2,5 cm.'] }
            ]
        }
    }
}
FERRAMENTAS.tam_anel = {
    emoji: '💍',
    sub: 'Conversões',
    titulo: 'Aro de anel pela circunferência do dedo',
    descricao: 'Descobre o aro brasileiro do anel pelo dedo',
    uso: '<circunferência do dedo em mm>',
    exemplos: [{ args: '54', oque: 'dedo com 54 mm de volta' }, { args: '62', oque: 'dedo mais grosso' }],
    dica: 'Enrole uma tira de papel no dedo, marque onde encontra e meça em milímetros com régua.',
    calcular(args) {
        const mm = exigirNumero(args[0], 'circunferência em mm', { permiteNegativo: false, permiteZero: false })
        if (mm < 38 || mm > 80) throw falha(`${fmt(mm, 0)} mm está fora do que existe em anel de dedo (de 38 a 80 mm). Confira se mediu a volta e não o diâmetro.`)
        const diametro = mm / Math.PI
        const aroBr = Math.round(mm - 40)
        const eua = (diametro - 11.63) / 0.8128 + 1
        return {
            intro: `Dedo de ${fmt(mm, 0)} mm de volta usa ${'*aro ' + aroBr + '*'} no Brasil.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Aro brasileiro:* ${aroBr}`,
                    `*Diâmetro interno:* ${fmt(diametro, 1)} mm`,
                    `*Medida americana:* ${fmt(Math.max(1, eua), 1)}`,
                    `*Medida europeia:* ${fmt(mm, 0)}`
                ] },
                { emoji: '💡', titulo: 'Antes de comprar', linhas: ['Meça no fim do dia, quando o dedo está mais inchado. Anel largo aperta mais que anel fino do mesmo aro.'] }
            ]
        }
    }
}

/* Tela (4) */
FERRAMENTAS.tela_pol_cm = {
    emoji: '📺',
    sub: 'Conversões',
    titulo: 'Polegadas de tela em centímetros',
    descricao: 'Mostra largura e altura de uma tela em cm',
    uso: '<polegadas> [proporção, ex 16:9]',
    exemplos: [{ args: '55', oque: 'televisão de 55 polegadas' }, { args: '6,1 19,5:9', oque: 'celular com tela alongada' }],
    dica: 'A polegada da tela é a DIAGONAL, não a largura. Por isso duas telas de 55 podem ter formatos diferentes.',
    calcular(args) {
        const pol = exigirNumero(args[0], 'tamanho em polegadas', { permiteNegativo: false, permiteZero: false })
        const prop = String(args[1] || '16:9')
        const m = prop.match(/^(\d+(?:[.,]\d+)?)[:x/](\d+(?:[.,]\d+)?)$/i)
        if (!m) throw falha(`Não entendi a proporção "${prop}". Escreva assim: 16:9.`)
        const a = num(m[1]); const b = num(m[2])
        if (!a || !b) throw falha('A proporção precisa ter dois números maiores que zero, por exemplo 16:9.')
        const diagCm = pol * 2.54
        const k = diagCm / Math.hypot(a, b)
        const larg = a * k; const alt = b * k
        return {
            intro: `Uma tela de ${fmt(pol, 1)} polegadas em ${prop} mede ${'*' + fmt(larg, 1) + ' por ' + fmt(alt, 1) + ' cm*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Largura:* ${fmt(larg, 1)} cm`,
                    `*Altura:* ${fmt(alt, 1)} cm`,
                    `*Diagonal:* ${fmt(diagCm, 1)} cm`,
                    `*Área da tela:* ${fmt(larg * alt, 0)} cm²`
                ] },
                { emoji: '🛋️', titulo: 'Onde cabe', linhas: [`Some uns 5 cm de moldura de cada lado: o móvel precisa ter pelo menos ${fmt(larg + 10, 0)} cm de vão livre.`] }
            ]
        }
    }
}
FERRAMENTAS.tela_cm_pol = {
    emoji: '📐',
    sub: 'Conversões',
    titulo: 'Diagonal em centímetros para polegadas',
    descricao: 'Descobre quantas polegadas tem uma tela medida',
    uso: '<diagonal em cm>',
    exemplos: [{ args: '139,7', oque: 'diagonal medida com fita métrica' }, { args: '80', oque: 'monitor menor' }],
    dica: 'Meça de canto a canto do vidro, sem incluir a moldura.',
    calcular(args) {
        const cm = exigirNumero(args[0], 'diagonal em cm', { permiteNegativo: false, permiteZero: false })
        const pol = cm / 2.54
        const comuns = [24, 32, 43, 50, 55, 65, 75]
        const perto = comuns.reduce((p, c) => Math.abs(c - pol) < Math.abs(p - pol) ? c : p, comuns[0])
        return {
            intro: `${fmt(cm, 1)} cm de diagonal dão ${forte(pol, 'polegadas', 1)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Polegadas:* ${fmt(pol, 1)}`,
                    `*Tamanho comercial mais perto:* ${perto} polegadas`,
                    `*Largura em 16:9:* ${fmt(cm * 16 / Math.hypot(16, 9), 1)} cm`,
                    `*Altura em 16:9:* ${fmt(cm * 9 / Math.hypot(16, 9), 1)} cm`
                ] }
            ]
        }
    }
}
FERRAMENTAS.tela_ppi = {
    emoji: '🔍',
    sub: 'Conversões',
    titulo: 'Densidade da tela em pontos por polegada',
    descricao: 'Calcula os pontos por polegada de uma tela',
    uso: '<largura px> <altura px> <polegadas>',
    exemplos: [{ args: '1920 1080 24', oque: 'monitor Full HD de 24 polegadas' }, { args: '2556 1179 6,1', oque: 'celular moderno' }],
    dica: 'Acima de 300 pontos por polegada o olho já não separa os pixels à distância normal de leitura.',
    calcular(args) {
        const w = exigirNumero(args[0], 'largura em pixels', { permiteNegativo: false, permiteZero: false })
        const h = exigirNumero(args[1], 'altura em pixels', { permiteNegativo: false, permiteZero: false })
        const pol = exigirNumero(args[2], 'tamanho em polegadas', { permiteNegativo: false, permiteZero: false })
        const ppi = Math.hypot(w, h) / pol
        const qualidade = ppi >= 300 ? 'altíssima, os pixels somem' : ppi >= 200 ? 'muito boa' : ppi >= 130 ? 'boa para monitor' : 'baixa, dá para ver os pontos de perto'
        return {
            intro: `Tela de ${fmt(w, 0)} por ${fmt(h, 0)} em ${fmt(pol, 1)} polegadas tem ${forte(ppi, 'pontos por polegada', 1)}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Pontos por polegada:* ${fmt(ppi, 1)}`,
                    `*Total de pixels:* ${fmt(w * h / 1e6, 2)} milhões`,
                    `*Proporção:* ${fmt(w / h, 2)} para 1`,
                    `*Nitidez:* ${qualidade}`
                ] },
                { emoji: '📏', titulo: 'Tamanho de cada ponto', linhas: [`Cada pixel mede cerca de ${fmt(25.4 / ppi, 3)} mm.`] }
            ]
        }
    }
}
FERRAMENTAS.tela_distancia = {
    emoji: '🛋️',
    sub: 'Conversões',
    titulo: 'Distância ideal do sofá para a televisão',
    descricao: 'Diz a que distância sentar de uma TV',
    uso: '<polegadas da TV>',
    exemplos: [{ args: '55', oque: 'televisão de 55 polegadas' }, { args: '75', oque: 'televisão grande' }],
    dica: 'Quanto maior a resolução, mais perto dá para sentar sem enxergar os pontos da imagem.',
    calcular(args) {
        const pol = exigirNumero(args[0], 'tamanho em polegadas', { permiteNegativo: false, permiteZero: false })
        const diagM = pol * 0.0254
        return {
            intro: `Para uma TV de ${fmt(pol, 0)} polegadas, o melhor é sentar entre ${'*' + fmt(diagM * 1.2, 2) + ' e ' + fmt(diagM * 1.6, 2) + ' m*'} dela.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Faixa confortável (4K):* de ${fmt(diagM * 1.0, 2)} a ${fmt(diagM * 1.5, 2)} m`,
                    `*Faixa confortável (Full HD):* de ${fmt(diagM * 1.6, 2)} a ${fmt(diagM * 2.5, 2)} m`,
                    `*Altura do centro da tela:* cerca de 1,05 m do chão`,
                    `*Diagonal em metros:* ${fmt(diagM, 2)} m`
                ] },
                { emoji: '🧭', titulo: 'Caminho inverso', linhas: [`Se o seu sofá está a 3 m, a TV ideal em 4K tem perto de ${fmt(3 / 0.0254 / 1.3, 0)} polegadas.`] }
            ]
        }
    }
}

/* Bases numéricas (7) */
function baseSimples({ emoji, deNome, paraNome, base, paraBase, exemplo, dica }) {
    return {
        emoji,
        sub: 'Conversões',
        titulo: `${cap(deNome)} para ${paraNome}`,
        descricao: `Converte ${deNome} em ${paraNome}`,
        uso: `<número em ${deNome}>`,
        exemplos: [{ args: exemplo, oque: `${exemplo} convertido` }, { args: base === 10 ? '255' : (255).toString(base).toUpperCase(), oque: 'o valor 255' }],
        dica: dica || 'Números grandes demais perdem precisão: fique abaixo de 9 quatrilhões.',
        calcular(args) {
            const bruto = String(args[0] || '').trim().replace(/^0[bxo]/i, '')
            if (!bruto) throw falha('Digite o número que você quer converter.')
            const valido = base === 10 ? /^-?\d+$/ : base === 2 ? /^[01]+$/ : base === 8 ? /^[0-7]+$/ : /^[0-9a-fA-F]+$/
            if (!valido.test(bruto)) throw falha(`"${bruto.slice(0, 16)}" não é um número válido em ${deNome}.`)
            const decimal = parseInt(bruto, base)
            if (!Number.isSafeInteger(decimal)) throw falha('Esse número é grande demais para converter sem perder dígito.')
            const saida = paraBase === 10 ? String(decimal) : decimal.toString(paraBase).toUpperCase()
            return {
                intro: `${bruto.toUpperCase()} em ${deNome} vale ${'*' + saida + '*'} em ${paraNome}.`,
                secoes: [
                    { emoji: '🎯', titulo: 'Resultado', linhas: [`*Entrada (${deNome}):* ${bruto.toUpperCase()}`, `*Saída (${paraNome}):* ${saida}`] },
                    { emoji: '🔢', titulo: 'Em todas as bases', linhas: [
                        `• Decimal: ${decimal}`,
                        `• Binário: ${decimal.toString(2)}`,
                        `• Octal: ${decimal.toString(8)}`,
                        `• Hexadecimal: ${decimal.toString(16).toUpperCase()}`
                    ] },
                    { emoji: '📦', titulo: 'Quanto ocupa', linhas: [`Precisa de ${decimal.toString(2).length} bits para guardar esse valor.`] }
                ]
            }
        }
    }
}
FERRAMENTAS.base_dec_bin = baseSimples({ emoji: '🔢', deNome: 'decimal', paraNome: 'binário', base: 10, paraBase: 2, exemplo: '42' })
FERRAMENTAS.base_bin_dec = baseSimples({ emoji: '🔢', deNome: 'binário', paraNome: 'decimal', base: 2, paraBase: 10, exemplo: '101010' })
FERRAMENTAS.base_dec_hex = baseSimples({ emoji: '🎨', deNome: 'decimal', paraNome: 'hexadecimal', base: 10, paraBase: 16, exemplo: '255' })
FERRAMENTAS.base_hex_dec = baseSimples({ emoji: '🎨', deNome: 'hexadecimal', paraNome: 'decimal', base: 16, paraBase: 10, exemplo: 'FF' })
FERRAMENTAS.base_dec_oct = baseSimples({ emoji: '🧮', deNome: 'decimal', paraNome: 'octal', base: 10, paraBase: 8, exemplo: '64' })
FERRAMENTAS.base_texto_bin = {
    emoji: '🔤',
    sub: 'Conversões',
    titulo: 'Texto em binário',
    descricao: 'Transforma uma frase em zeros e uns',
    uso: '<texto>',
    exemplos: [{ args: 'oi', oque: 'a palavra oi em binário' }, { args: '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤', oque: 'um nome em binário' }],
    dica: 'Cada caractere vira um grupo de 8 zeros e uns. Acento ocupa dois grupos.',
    calcular(args) {
        const texto = args.join(' ')
        if (!texto.trim()) throw falha('Digite o texto que você quer transformar em binário.')
        if (texto.length > 60) throw falha(`Texto longo demais (${texto.length} caracteres). Envie até 60 para a resposta caber na tela.`)
        const bytes = Array.from(Buffer.from(texto, 'utf8'))
        const bin = bytes.map(b => b.toString(2).padStart(8, '0'))
        return {
            intro: `O texto "${texto}" tem ${bytes.length} bytes em binário.`,
            secoes: [
                { emoji: '🎯', titulo: 'Em binário', linhas: [bin.join(' ')] },
                { emoji: '📊', titulo: 'Contagem', linhas: [
                    `*Caracteres:* ${Array.from(texto).length}`,
                    `*Bytes:* ${bytes.length}`,
                    `*Bits:* ${bytes.length * 8}`,
                    `*Em hexadecimal:* ${bytes.map(b => b.toString(16).padStart(2, '0')).join(' ')}`
                ] }
            ]
        }
    }
}
FERRAMENTAS.base_qualquer = {
    emoji: '♾️',
    sub: 'Conversões',
    titulo: 'Conversão entre bases quaisquer',
    descricao: 'Converte número entre duas bases de 2 a 36',
    uso: '<número> <base de origem> <base de destino>',
    exemplos: [{ args: 'ZZ 36 10', oque: 'base 36 para decimal' }, { args: '777 8 16', oque: 'octal para hexadecimal' }],
    dica: 'A base 36 usa 0 a 9 e A a Z. É o máximo que cabe em letra e número.',
    calcular(args) {
        const bruto = String(args[0] || '').trim()
        const de = Math.round(exigirNumero(args[1], 'base de origem'))
        const para = Math.round(exigirNumero(args[2], 'base de destino'))
        if (de < 2 || de > 36 || para < 2 || para > 36) throw falha('As bases vão de 2 a 36. Fora disso não existe símbolo para representar o número.')
        const decimal = parseInt(bruto, de)
        if (!Number.isFinite(decimal) || Number.isNaN(decimal)) throw falha(`"${bruto.slice(0, 16) || 'nada'}" não é um número válido na base ${de}.`)
        if (!Number.isSafeInteger(decimal)) throw falha('Número grande demais para converter sem perder dígito.')
        return {
            intro: `${bruto.toUpperCase()} na base ${de} vale ${'*' + decimal.toString(para).toUpperCase() + '*'} na base ${para}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [
                    `*Entrada:* ${bruto.toUpperCase()} (base ${de})`,
                    `*Saída:* ${decimal.toString(para).toUpperCase()} (base ${para})`,
                    `*Em decimal:* ${decimal}`
                ] },
                { emoji: '🔢', titulo: 'Bases mais usadas', linhas: [2, 8, 16, 36].map(b => `• Base ${b}: ${decimal.toString(b).toUpperCase()}`) }
            ]
        }
    }
}

/* Romanos (2) */
FERRAMENTAS.rom_num_rom = {
    emoji: '🏛️',
    sub: 'Conversões',
    titulo: 'Número em algarismo romano',
    descricao: 'Escreve um número em algarismos romanos',
    uso: '<número de 1 a 3999>',
    exemplos: [{ args: '2026', oque: 'o ano atual em romano' }, { args: '1994', oque: 'um ano com subtração' }],
    dica: 'Não existe zero nem número negativo em romano, e o maior que dá para escrever é 3999.',
    calcular(args) {
        const n = exigirNumero(args[0], 'número')
        if (!Number.isInteger(n)) throw falha('O romano só escreve número inteiro. Arredonde antes.')
        const r = paraRomano(n)
        return {
            intro: `${fmt(n, 0)} em algarismo romano é ${'*' + r + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Número:* ${fmt(n, 0)}`, `*Romano:* ${r}`, `*Letras usadas:* ${r.length}`] },
                { emoji: '🔤', titulo: 'Como se lê', linhas: [
                    'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000.',
                    'Letra menor antes de maior subtrai: IV é 4, IX é 9, XC é 90.'
                ] }
            ]
        }
    }
}
FERRAMENTAS.rom_rom_num = {
    emoji: '🏛️',
    sub: 'Conversões',
    titulo: 'Algarismo romano em número',
    descricao: 'Lê um algarismo romano e diz o valor',
    uso: '<algarismo romano>',
    exemplos: [{ args: 'MMXXVI', oque: 'o ano de 2026' }, { args: 'XLII', oque: 'quarenta e dois' }],
    dica: 'Se eu reclamar da ordem das letras, é porque existe um jeito certo de escrever aquele valor.',
    calcular(args) {
        const bruto = String(args[0] || '').trim().toUpperCase()
        const n = deRomano(bruto)
        return {
            intro: `${bruto} vale ${'*' + fmt(n, 0) + '*'}.`,
            secoes: [
                { emoji: '🎯', titulo: 'Resultado', linhas: [`*Romano:* ${bruto}`, `*Número:* ${fmt(n, 0)}`, `*Por extenso em letras:* ${bruto.split('').join(' + ')}`] },
                { emoji: '🧮', titulo: 'Soma por letra', linhas: [`O valor final ${fmt(n, 0)} sai somando cada letra e subtraindo as que vêm antes de uma maior.`] }
            ]
        }
    }
}

/* Fusos (6) */
FERRAMENTAS.fuso_br_lisboa = fuso({ origem: 'brasilia', destino: 'lisboa', emoji: '🇵🇹' })
FERRAMENTAS.fuso_br_novayork = fuso({ origem: 'brasilia', destino: 'novayork', emoji: '🗽' })
FERRAMENTAS.fuso_br_toquio = fuso({ origem: 'brasilia', destino: 'toquio', emoji: '🗼' })
FERRAMENTAS.fuso_br_londres = fuso({ origem: 'brasilia', destino: 'londres', emoji: '🇬🇧' })
FERRAMENTAS.fuso_br_manaus = fuso({ origem: 'brasilia', destino: 'manaus', emoji: '🌳' })
FERRAMENTAS.fuso_entre_capitais = {
    emoji: '🌐',
    sub: 'Conversões',
    titulo: 'Horário entre duas cidades',
    descricao: 'Converte um horário entre duas cidades da lista',
    uso: '<cidade de origem> <cidade de destino> [hora]',
    exemplos: [{ args: 'brasilia toquio 09:00', oque: 'nove da manhã daqui em Tóquio' }, { args: 'lisboa novayork', oque: 'agora nas duas cidades' }],
    dica: 'Cidades que eu conheço: ' + Object.keys(FUSOS).join(', ') + '.',
    calcular(args) {
        const limpa = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
        const o = FUSOS[limpa(args[0])]
        const d = FUSOS[limpa(args[1])]
        if (!o) throw falha(`Não conheço a cidade "${String(args[0] || '').slice(0, 20) || 'nada'}". Escolha uma destas: ${Object.keys(FUSOS).join(', ')}.`)
        if (!d) throw falha(`Não conheço a cidade "${String(args[1] || '').slice(0, 20) || 'nada'}". Escolha uma destas: ${Object.keys(FUSOS).join(', ')}.`)
        const agora = new Date()
        let instante = agora
        let rotulo = relogio(o.tz, agora)
        if (args[2]) {
            const minutos = lerHora(args.slice(2).join(''))
            const offO = offsetMinutos(o.tz, agora)
            const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: o.tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora)
            const [ay, am, ad] = hoje.split('-').map(Number)
            instante = new Date(Date.UTC(ay, am - 1, ad, 0, minutos - offO, 0))
            rotulo = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
        }
        const difMin = offsetMinutos(d.tz, instante) - offsetMinutos(o.tz, instante)
        return {
            intro: `${rotulo} em ${o.nome} é ${'*' + relogio(d.tz, instante) + '*'} em ${d.nome}.`,
            secoes: [
                { emoji: '🕐', titulo: 'Os dois relógios', linhas: [
                    `*${o.nome}:* ${relogio(o.tz, instante)} (${dataCurta(o.tz, instante)})`,
                    `*${d.nome}:* ${relogio(d.tz, instante)} (${dataCurta(d.tz, instante)})`,
                    `*Diferença:* ${fmt(difMin / 60, 1)} h`
                ] },
                { emoji: '📞', titulo: 'Boa hora para ligar', linhas: [
                    `Entre 9h e 18h em ${d.nome} corresponde a ${relogio(d.tz, new Date(instante.getTime() - difMin * 60000))} daqui em diante. Evite ligar de madrugada para lá.`
                ] }
            ]
        }
    }
}

/* ──────────────────────────── Porta de entrada ──────────────────────────── */

/** Lista ordenada das chaves, na ordem em que foram declaradas. */
function chaves() {
    return Object.keys(FERRAMENTAS)
}

/** Metadados de uma ferramenta (usados pelo gerador de comandos). */
function meta(chave) {
    const f = FERRAMENTAS[chave]
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

/** Tela de instruções, mostrada quando a pessoa chama o comando sem nada. */
function telaDeUso(item, nome, prefix) {
    return {
        emoji: item.emoji,
        titulo: item.titulo,
        prefix,
        intro: `${item.descricao}. Digite o valor logo depois do comando e eu faço a conta.`,
        secoes: [
            { emoji: '✍️', titulo: 'Escreva assim', linhas: ['`' + prefix + nome + ' ' + item.uso + '`'] },
            { emoji: '📋', titulo: 'Aceito número nos dois formatos', linhas: ['• Brasileiro: 1.234,56', '• Americano: 1234.56'] }
        ],
        dica: item.dica,
        proximos: item.exemplos.map(e => ({ nome, args: e.args, oque: e.oque }))
    }
}

/**
 * Faz a conta e devolve um objeto pronto para o F.tela.
 * Nunca lança: erro de entrada vira tela explicando o que fazer.
 * @param {string} chave
 * @param {string[]} args
 * @param {{nome: string, prefix?: string}} contexto
 */
function responder(chave, args, contexto = {}) {
    const nome = contexto.nome || 'ferr'
    const prefix = contexto.prefix || '.'
    const item = FERRAMENTAS[chave]
    if (!item) {
        logger.error(`[converterService] chave desconhecida: ${chave} (comando ${nome})`)
        return {
            emoji: '⚠️', titulo: 'Ferramenta fora do ar', prefix,
            intro: 'Essa conversão não está registrada no serviço. Avise quem cuida do bot.',
            secoes: [{ emoji: '🔧', titulo: 'Detalhe técnico', linhas: [`Chave procurada: ${chave}`] }]
        }
    }

    const limpos = (Array.isArray(args) ? args : []).map(a => String(a)).filter(a => a.trim() !== '')
    if (!limpos.length) return telaDeUso(item, nome, prefix)

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
        if (!e.paraUsuario) logger.error(`[converterService] ${chave} quebrou com "${limpos.join(' ')}": ${e.stack || e.message}`)
        else logger.warn(`[converterService] ${chave} recusou "${limpos.join(' ')}": ${e.message}`)
        return {
            emoji: '⚠️',
            titulo: item.titulo,
            prefix,
            intro: e.paraUsuario ? e.message : 'Não consegui fazer essa conta com o que você digitou. Confira os valores e tente de novo.',
            secoes: [{ emoji: '✍️', titulo: 'Escreva assim', linhas: ['`' + prefix + nome + ' ' + item.uso + '`'] }],
            dica: item.dica,
            proximos: item.exemplos.map(ex => ({ nome, args: ex.args, oque: ex.oque }))
        }
    }
}

module.exports = {
    responder, chaves, meta,
    VIGENCIA_TABELAS,
    // exportados para teste
    num, fmt, paraRomano, deRomano, offsetMinutos, lerHora, INGREDIENTES, FUSOS
}
