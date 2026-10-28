/**
 * Unidades de medida — conversão e referência.
 *
 * O `.converter` que existia cobria cinco pares fixos (km/mi, kg/lb, c/f…).
 * Aqui cada categoria tem sua unidade base e todas as outras se definem por um
 * fator até ela, então qualquer par dentro da categoria funciona sem escrever
 * uma linha nova.
 *
 * Temperatura é a exceção e está separada: Celsius, Fahrenheit e Kelvin não se
 * relacionam por multiplicação — têm deslocamento de zero. Tratar como fator
 * daria 0 °C = 0 °F, que está errado.
 */

const logger = require('../core/logger')

/**
 * Categorias com unidade base e fator de conversão.
 * `fator` responde: quantas unidades base cabem em 1 desta unidade.
 */
const CATEGORIAS = {
    comprimento: {
        nome: 'Comprimento', emoji: '📏', base: 'm',
        unidades: {
            mm: { nome: 'Milímetro', fator: 0.001, nota: 'Espessura de um cartão.' },
            cm: { nome: 'Centímetro', fator: 0.01, nota: 'Largura de um dedo.' },
            m: { nome: 'Metro', fator: 1, nota: 'A base do sistema internacional.' },
            km: { nome: 'Quilômetro', fator: 1000, nota: 'Distância entre cidades.' },
            pol: { nome: 'Polegada', fator: 0.0254, nota: 'Medida de telas e canos.' },
            pe: { nome: 'Pé', fator: 0.3048, nota: 'Doze polegadas. Altitude na aviação.' },
            jarda: { nome: 'Jarda', fator: 0.9144, nota: 'Três pés. Campo de futebol americano.' },
            milha: { nome: 'Milha', fator: 1609.344, nota: 'Distância em estradas dos EUA.' },
            milhanautica: { nome: 'Milha náutica', fator: 1852, nota: 'Um minuto de arco na Terra.' },
            anoluz: { nome: 'Ano-luz', fator: 9460730472580800, nota: 'O que a luz percorre em um ano.' }
        }
    },
    massa: {
        nome: 'Massa', emoji: '⚖️', base: 'kg',
        unidades: {
            mg: { nome: 'Miligrama', fator: 0.000001, nota: 'Dose de medicamento.' },
            g: { nome: 'Grama', fator: 0.001, nota: 'Um clipe de papel pesa cerca de 1 g.' },
            kg: { nome: 'Quilograma', fator: 1, nota: 'A base do sistema internacional.' },
            t: { nome: 'Tonelada', fator: 1000, nota: 'Mil quilos. Peso de um carro pequeno.' },
            onca: { nome: 'Onça', fator: 0.0283495, nota: 'Usada em receitas e metais preciosos.' },
            libra: { nome: 'Libra', fator: 0.453592, nota: 'Peso corporal nos EUA.' },
            arroba: { nome: 'Arroba', fator: 14.6883, nota: 'Usada na pecuária brasileira.' }
        }
    },
    volume: {
        nome: 'Volume', emoji: '🧪', base: 'l',
        unidades: {
            ml: { nome: 'Mililitro', fator: 0.001, nota: 'Uma colher de chá tem cerca de 5 ml.' },
            l: { nome: 'Litro', fator: 1, nota: 'Garrafa de refrigerante pequena.' },
            m3: { nome: 'Metro cúbico', fator: 1000, nota: 'Conta de água vem nesta unidade.' },
            xicara: { nome: 'Xícara', fator: 0.2366, nota: 'Medida de receita (padrão americano).' },
            colhersopa: { nome: 'Colher de sopa', fator: 0.015, nota: 'Cerca de 15 ml.' },
            galao: { nome: 'Galão', fator: 3.78541, nota: 'Combustível nos EUA.' },
            barril: { nome: 'Barril', fator: 158.987, nota: 'Unidade do petróleo.' }
        }
    },
    area: {
        nome: 'Área', emoji: '🟦', base: 'm2',
        unidades: {
            cm2: { nome: 'Centímetro quadrado', fator: 0.0001, nota: 'Área de um selo.' },
            m2: { nome: 'Metro quadrado', fator: 1, nota: 'Medida de imóveis.' },
            km2: { nome: 'Quilômetro quadrado', fator: 1000000, nota: 'Área de cidades.' },
            hectare: { nome: 'Hectare', fator: 10000, nota: 'Dez mil metros quadrados. Padrão rural.' },
            acre: { nome: 'Acre', fator: 4046.86, nota: 'Terra nos países de língua inglesa.' },
            alqueire: { nome: 'Alqueire paulista', fator: 24200, nota: '2,42 hectares. Varia por região.' }
        }
    },
    velocidade: {
        nome: 'Velocidade', emoji: '🏃', base: 'ms',
        unidades: {
            ms: { nome: 'Metro por segundo', fator: 1, nota: 'A base da física.' },
            kmh: { nome: 'Quilômetro por hora', fator: 0.277778, nota: 'Velocímetro no Brasil.' },
            mph: { nome: 'Milha por hora', fator: 0.44704, nota: 'Velocímetro nos EUA.' },
            no: { nome: 'Nó', fator: 0.514444, nota: 'Navegação e aviação.' },
            mach: { nome: 'Mach', fator: 343, nota: 'Velocidade do som no ar a 20 °C.' }
        }
    },
    tempo: {
        nome: 'Tempo', emoji: '⏱️', base: 's',
        unidades: {
            s: { nome: 'Segundo', fator: 1, nota: 'A base do sistema internacional.' },
            min: { nome: 'Minuto', fator: 60, nota: 'Sessenta segundos.' },
            h: { nome: 'Hora', fator: 3600, nota: 'Sessenta minutos.' },
            dia: { nome: 'Dia', fator: 86400, nota: 'Uma volta da Terra em si mesma.' },
            semana: { nome: 'Semana', fator: 604800, nota: 'Sete dias.' },
            mes: { nome: 'Mês', fator: 2629800, nota: 'Média de 30,44 dias.' },
            ano: { nome: 'Ano', fator: 31557600, nota: 'Média de 365,25 dias.' },
            decada: { nome: 'Década', fator: 315576000, nota: 'Dez anos.' },
            seculo: { nome: 'Século', fator: 3155760000, nota: 'Cem anos.' }
        }
    },
    dados: {
        nome: 'Dados digitais', emoji: '💾', base: 'byte',
        unidades: {
            bit: { nome: 'Bit', fator: 0.125, nota: 'A menor unidade: 0 ou 1.' },
            byte: { nome: 'Byte', fator: 1, nota: 'Oito bits. Guarda um caractere simples.' },
            kb: { nome: 'Kilobyte', fator: 1024, nota: 'Uma página de texto puro.' },
            mb: { nome: 'Megabyte', fator: 1048576, nota: 'Uma música comprimida.' },
            gb: { nome: 'Gigabyte', fator: 1073741824, nota: 'Um filme em boa qualidade.' },
            tb: { nome: 'Terabyte', fator: 1099511627776, nota: 'Um disco rígido comum.' },
            pb: { nome: 'Petabyte', fator: 1125899906842624, nota: 'Escala de centro de dados.' }
        }
    },
    energia: {
        nome: 'Energia', emoji: '⚡', base: 'j',
        unidades: {
            j: { nome: 'Joule', fator: 1, nota: 'A base do sistema internacional.' },
            cal: { nome: 'Caloria', fator: 4.184, nota: 'Energia para aquecer 1 g de água em 1 °C.' },
            kcal: { nome: 'Quilocaloria', fator: 4184, nota: 'A "caloria" dos rótulos de alimento.' },
            kwh: { nome: 'Quilowatt-hora', fator: 3600000, nota: 'A unidade da conta de luz.' },
            btu: { nome: 'BTU', fator: 1055.06, nota: 'Potência de ar-condicionado.' }
        }
    },
    pressao: {
        nome: 'Pressão', emoji: '🌡️', base: 'pa',
        unidades: {
            pa: { nome: 'Pascal', fator: 1, nota: 'A base do sistema internacional.' },
            hpa: { nome: 'Hectopascal', fator: 100, nota: 'Pressão atmosférica na meteorologia.' },
            bar: { nome: 'Bar', fator: 100000, nota: 'Quase uma atmosfera.' },
            atm: { nome: 'Atmosfera', fator: 101325, nota: 'Pressão ao nível do mar.' },
            psi: { nome: 'PSI', fator: 6894.76, nota: 'Calibragem de pneu.' },
            mmhg: { nome: 'Milímetro de mercúrio', fator: 133.322, nota: 'Pressão arterial.' }
        }
    },
    angulo: {
        nome: 'Ângulo', emoji: '📐', base: 'grau',
        unidades: {
            grau: { nome: 'Grau', fator: 1, nota: 'A volta completa tem 360.' },
            radiano: { nome: 'Radiano', fator: 57.2957795, nota: 'A volta completa tem 2π.' },
            grado: { nome: 'Grado', fator: 0.9, nota: 'A volta completa tem 400.' },
            volta: { nome: 'Volta', fator: 360, nota: 'Uma rotação inteira.' }
        }
    }
}

/**
 * Temperatura, à parte.
 * Escalas com zero deslocado não convertem por fator: precisam de fórmula.
 */
const TEMPERATURAS = {
    c: { nome: 'Celsius', simbolo: '°C', nota: 'Água congela a 0 e ferve a 100.' },
    f: { nome: 'Fahrenheit', simbolo: '°F', nota: 'Água congela a 32 e ferve a 212.' },
    k: { nome: 'Kelvin', simbolo: 'K', nota: 'Começa no zero absoluto. Não usa grau.' }
}

function paraCelsius(valor, de) {
    const v = Number(valor)
    if (de === 'c') return v
    if (de === 'f') return (v - 32) * 5 / 9
    if (de === 'k') return v - 273.15
    return null
}

function deCelsius(celsius, para) {
    if (para === 'c') return celsius
    if (para === 'f') return celsius * 9 / 5 + 32
    if (para === 'k') return celsius + 273.15
    return null
}

function converterTemperatura(valor, de, para) {
    const d = String(de || '').toLowerCase(), p = String(para || '').toLowerCase()
    if (!TEMPERATURAS[d] || !TEMPERATURAS[p]) return null
    const c = paraCelsius(valor, d)
    if (c === null || !Number.isFinite(c)) return null
    return { valor: deCelsius(c, p), de: TEMPERATURAS[d], para: TEMPERATURAS[p] }
}

/** Em que categoria uma unidade está. */
function categoriaDe(unidade) {
    const u = String(unidade || '').toLowerCase()
    for (const [chave, cat] of Object.entries(CATEGORIAS)) {
        if (cat.unidades[u]) return { chave, ...cat }
    }
    return null
}

/**
 * Converte entre duas unidades da MESMA categoria.
 * Recusa a conversão entre categorias diferentes em vez de devolver um número
 * sem sentido: quilo não vira metro.
 */
function converter(valor, de, para) {
    const v = Number(valor)
    if (!Number.isFinite(v)) return { ok: false, erro: 'Valor inválido.' }

    const d = String(de || '').toLowerCase(), p = String(para || '').toLowerCase()
    if (TEMPERATURAS[d] || TEMPERATURAS[p]) {
        const t = converterTemperatura(v, d, p)
        return t ? { ok: true, resultado: t.valor, de: t.de, para: t.para, categoria: 'temperatura' }
            : { ok: false, erro: 'Para temperatura, use c, f ou k nos dois lados.' }
    }

    const catA = categoriaDe(d), catB = categoriaDe(p)
    if (!catA) return { ok: false, erro: `Unidade "${de}" não existe no catálogo.` }
    if (!catB) return { ok: false, erro: `Unidade "${para}" não existe no catálogo.` }
    if (catA.chave !== catB.chave) {
        return { ok: false, erro: `"${de}" é ${catA.nome.toLowerCase()} e "${para}" é ${catB.nome.toLowerCase()}. Não dá para converter entre categorias.` }
    }

    const resultado = (v * catA.unidades[d].fator) / catA.unidades[p].fator
    return {
        ok: true,
        resultado,
        de: catA.unidades[d],
        para: catA.unidades[p],
        categoria: catA.chave,
        categoriaNome: catA.nome
    }
}

/** Uma unidade convertida para todas as outras da categoria. */
function tabelaDe(unidade, valor = 1) {
    const cat = categoriaDe(unidade)
    if (!cat) return null
    const u = String(unidade).toLowerCase()
    return {
        categoria: cat,
        linhas: Object.entries(cat.unidades)
            .filter(([k]) => k !== u)
            .map(([k, info]) => ({
                sigla: k,
                nome: info.nome,
                valor: (Number(valor) * cat.unidades[u].fator) / info.fator
            }))
            .sort((a, b) => b.valor - a.valor)
    }
}

/** Formata número evitando notação científica ilegível em valores comuns. */
function formatar(n) {
    const v = Number(n)
    if (!Number.isFinite(v)) return '—'
    if (v !== 0 && (Math.abs(v) < 0.0001 || Math.abs(v) >= 1e15)) return v.toExponential(4)
    const casas = Math.abs(v) >= 100 ? 2 : Math.abs(v) >= 1 ? 4 : 6
    return Number(v.toFixed(casas)).toLocaleString('pt-BR', { maximumFractionDigits: casas })
}

module.exports = {
    CATEGORIAS,
    TEMPERATURAS,
    converter,
    converterTemperatura,
    categoriaDe,
    tabelaDe,
    formatar
}
