/**
 * Análise de texto — medidas reais sobre o que a pessoa escreveu.
 *
 * Os comandos desta família prometiam "análise inteligente" e não analisavam
 * nada. Aqui as contas são de verdade e locais: frequência de palavras,
 * legibilidade, densidade, extração de trechos, comparação. Nenhuma delas
 * depende de serviço externo, então funcionam sempre e respondem na hora.
 *
 * O que este arquivo NÃO faz é fingir compreensão: não há "sentimento" nem
 * "intenção" adivinhados. Só medida — e o texto diz o que a medida significa.
 */

/** Palavras sem carga semântica, ignoradas nas contagens de relevância. */
const VAZIAS = new Set([
    'a', 'à', 'ao', 'aos', 'as', 'às', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'na', 'nas',
    'no', 'nos', 'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por', 'que', 'se',
    'um', 'uma', 'uns', 'umas', 'com', 'como', 'mas', 'mais', 'já', 'não', 'sim', 'é', 'foi',
    'ser', 'está', 'estão', 'era', 'são', 'tem', 'têm', 'the', 'of', 'to', 'and', 'in', 'is',
    'isso', 'isto', 'esse', 'essa', 'este', 'esta', 'aquele', 'aquela', 'seu', 'sua', 'seus',
    'suas', 'meu', 'minha', 'eu', 'você', 'ele', 'ela', 'nós', 'eles', 'elas', 'me', 'te', 'lhe'
])

/** Remove acento para comparar palavras sem depender de grafia. */
function semAcento(txt) {
    return String(txt || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function palavrasDe(texto) {
    return String(texto || '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean)
}

function frasesDe(texto) {
    return String(texto || '')
        .split(/(?<=[.!?…])\s+|\n+/)
        .map(f => f.trim())
        .filter(f => f.length > 1)
}

/** Conta sílabas de forma aproximada, pelos grupos de vogais. */
function silabas(palavra) {
    const p = semAcento(String(palavra || '').toLowerCase())
    const grupos = p.match(/[aeiouy]+/g)
    return Math.max(1, grupos ? grupos.length : 1)
}

/** Medidas básicas de um texto. */
function medidas(texto) {
    const t = String(texto || '')
    const palavras = palavrasDe(t)
    const frases = frasesDe(t)
    const unicas = new Set(palavras)
    const totalSilabas = palavras.reduce((a, p) => a + silabas(p), 0)

    return {
        caracteres: t.length,
        semEspacos: t.replace(/\s/g, '').length,
        palavras: palavras.length,
        unicas: unicas.size,
        frases: frases.length,
        paragrafos: t.split(/\n{2,}/).filter(s => s.trim()).length || (t.trim() ? 1 : 0),
        silabas: totalSilabas,
        mediaPalavrasPorFrase: frases.length ? palavras.length / frases.length : 0,
        mediaLetrasPorPalavra: palavras.length ? palavras.join('').length / palavras.length : 0,
        riqueza: palavras.length ? (unicas.size / palavras.length) * 100 : 0,
        leituraSegundos: Math.ceil(palavras.length / 3.3)
    }
}

/**
 * Índice de legibilidade adaptado do Flesch para o português.
 * Quanto maior, mais fácil de ler. Serve para dizer se um aviso do grupo está
 * escrito de forma acessível ou empolado.
 */
function legibilidade(texto) {
    const m = medidas(texto)
    if (!m.palavras || !m.frases) return { indice: null, nivel: 'texto curto demais para medir' }

    const indice = 248.835 - (1.015 * m.mediaPalavrasPorFrase) - (84.6 * (m.silabas / m.palavras))
    const valor = Math.max(0, Math.min(100, indice))

    let nivel
    if (valor >= 75) nivel = 'muito fácil'
    else if (valor >= 50) nivel = 'fácil'
    else if (valor >= 25) nivel = 'difícil'
    else nivel = 'muito difícil'

    return { indice: valor, nivel, palavrasPorFrase: m.mediaPalavrasPorFrase, silabasPorPalavra: m.silabas / m.palavras }
}

/** Palavras mais frequentes, ignorando as vazias. */
function frequencia(texto, limite = 15, incluirVazias = false) {
    const mapa = new Map()
    for (const p of palavrasDe(texto)) {
        if (!incluirVazias && (VAZIAS.has(p) || p.length < 3)) continue
        mapa.set(p, (mapa.get(p) || 0) + 1)
    }
    const total = [...mapa.values()].reduce((a, b) => a + b, 0)
    return [...mapa]
        .map(([palavra, n]) => ({ palavra, n, pct: total ? (n / total) * 100 : 0 }))
        .sort((a, b) => b.n - a.n)
        .slice(0, limite)
}

/** Pares de palavras que aparecem juntas com frequência. */
function bigramas(texto, limite = 10) {
    const p = palavrasDe(texto).filter(x => !VAZIAS.has(x) && x.length > 2)
    const mapa = new Map()
    for (let i = 0; i < p.length - 1; i++) {
        const par = p[i] + ' ' + p[i + 1]
        mapa.set(par, (mapa.get(par) || 0) + 1)
    }
    return [...mapa]
        .filter(([, n]) => n > 1)
        .map(([par, n]) => ({ par, n }))
        .sort((a, b) => b.n - a.n)
        .slice(0, limite)
}

/**
 * Resumo por extração: escolhe as frases que concentram mais palavras
 * relevantes. Não inventa texto — devolve frases que a pessoa escreveu.
 */
function resumir(texto, quantas = 3) {
    const frases = frasesDe(texto)
    if (frases.length <= quantas) return frases

    const pesos = new Map(frequencia(texto, 40).map(f => [f.palavra, f.n]))
    const pontuadas = frases.map((frase, ordem) => {
        const p = palavrasDe(frase).filter(x => !VAZIAS.has(x))
        const pontos = p.reduce((a, x) => a + (pesos.get(x) || 0), 0) / Math.max(1, Math.sqrt(p.length))
        return { frase, ordem, pontos }
    })

    return pontuadas
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, quantas)
        .sort((a, b) => a.ordem - b.ordem)
        .map(x => x.frase)
}

/** Termos que parecem ser o assunto: frequentes e distribuídos pelo texto. */
function palavrasChave(texto, limite = 8) {
    const frases = frasesDe(texto)
    const freq = frequencia(texto, 40)
    return freq
        .map(f => {
            const emQuantas = frases.filter(fr => palavrasDe(fr).includes(f.palavra)).length
            return { ...f, espalhamento: frases.length ? emQuantas / frases.length : 0, peso: f.n * (1 + (emQuantas / Math.max(1, frases.length))) }
        })
        .sort((a, b) => b.peso - a.peso)
        .slice(0, limite)
}

/** Extrai padrões úteis do texto. */
function extrair(texto) {
    const t = String(texto || '')
    return {
        urls: [...new Set(t.match(/https?:\/\/\S+/gi) || [])],
        emails: [...new Set(t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [])],
        numeros: [...new Set(t.match(/\d[\d.,]*/g) || [])].slice(0, 30),
        mencoes: [...new Set(t.match(/@\d{8,}/g) || [])],
        hashtags: [...new Set(t.match(/#[\p{L}\p{N}_]+/gu) || [])],
        datas: [...new Set(t.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g) || [])],
        horas: [...new Set(t.match(/\b\d{1,2}:\d{2}\b/g) || [])],
        maiusculas: [...new Set(t.match(/\b[A-ZÀ-Þ]{3,}\b/g) || [])].slice(0, 20)
    }
}

/** Compara dois textos e mede o quanto compartilham. */
function comparar(a, b) {
    const pa = new Set(palavrasDe(a).filter(x => !VAZIAS.has(x)))
    const pb = new Set(palavrasDe(b).filter(x => !VAZIAS.has(x)))
    if (!pa.size && !pb.size) return { semelhanca: 0, comuns: [], soA: [], soB: [] }

    const comuns = [...pa].filter(x => pb.has(x))
    const uniao = new Set([...pa, ...pb])
    return {
        semelhanca: uniao.size ? (comuns.length / uniao.size) * 100 : 0,
        comuns: comuns.slice(0, 20),
        soA: [...pa].filter(x => !pb.has(x)).slice(0, 15),
        soB: [...pb].filter(x => !pa.has(x)).slice(0, 15)
    }
}

/** Distribuição de letras, útil para cifras e curiosidade. */
function letras(texto) {
    const mapa = new Map()
    for (const c of semAcento(String(texto || '').toLowerCase())) {
        if (!/[a-z]/.test(c)) continue
        mapa.set(c, (mapa.get(c) || 0) + 1)
    }
    const total = [...mapa.values()].reduce((a, b) => a + b, 0)
    return [...mapa]
        .map(([letra, n]) => ({ letra, n, pct: total ? (n / total) * 100 : 0 }))
        .sort((a, b) => b.n - a.n)
}

/** Sinais de que o texto pode ser divulgação indesejada. */
function sinaisDeSpam(texto) {
    const t = String(texto || '')
    const sinais = []
    const maiusculas = (t.match(/[A-ZÀ-Þ]/g) || []).length
    const letrasTotal = (t.match(/[A-Za-zÀ-ÿ]/g) || []).length

    if (letrasTotal > 20 && maiusculas / letrasTotal > 0.6) sinais.push('Maioria em caixa alta')
    if ((t.match(/https?:\/\//gi) || []).length > 2) sinais.push('Muitos links')
    if ((t.match(/[!?]{3,}/g) || []).length) sinais.push('Pontuação exagerada')
    if (/\b(ganhe|grátis|promoção|clique aqui|imperdível|último dia|garanta já)\b/i.test(t)) sinais.push('Vocabulário de propaganda')
    if ((t.match(/(\p{Emoji_Presentation})/gu) || []).length > 15) sinais.push('Excesso de emojis')
    if (/(\b\w+\b)(\s+\1){3,}/i.test(t)) sinais.push('Palavra repetida em sequência')

    return { sinais, risco: sinais.length >= 3 ? 'alto' : sinais.length >= 1 ? 'médio' : 'baixo' }
}

module.exports = {
    VAZIAS,
    semAcento,
    palavrasDe,
    frasesDe,
    silabas,
    medidas,
    legibilidade,
    frequencia,
    bigramas,
    resumir,
    palavrasChave,
    extrair,
    comparar,
    letras,
    sinaisDeSpam
}
