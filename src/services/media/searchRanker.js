/**
 * Ranqueamento de resultados de busca.
 *
 * O PROBLEMA QUE ISSO RESOLVE
 * ---------------------------
 * O código antigo pegava `videos[0]` — o primeiro que o YouTube devolvesse.
 * Quando alguém pedia "Coração Radiante - Sorriso Maroto", o algoritmo do
 * YouTube podia ranquear na frente um remix, um cover de karaokê ou uma música
 * estrangeira de título parecido. O usuário digitou o ARTISTA e recebeu outra
 * coisa, sem nem saber por quê.
 *
 * A ideia aqui: quem digita o nome do artista está dando a informação mais
 * confiável da busca. Se o artista aparece no canal, aquele resultado quase
 * certamente é o certo — mais confiável que a ordem do YouTube.
 *
 * O ranqueador NÃO faz busca; ele reordena candidatos já obtidos.
 */

// Ruído que quase nunca é o que se pede — a menos que a pessoa peça.
// "ao vivo" NÃO entra: é exatamente o que se quer em pagode/live.
const RUIDO = [
    { termos: ['karaoke', 'karaokê', 'playback', 'instrumental'], peso: 45 },
    { termos: ['cover', 'cover by'], peso: 30 },
    { termos: ['remix', 'nightcore', 'sped up', 'speed up', 'slowed', 'reverb', '8d', 'bass boosted'], peso: 35 },
    { termos: ['reaction', 'reagindo', 'react', 'análise', 'analise'], peso: 50 },
    { termos: ['tutorial', 'como tocar', 'aula de', 'cifra', 'violão simplificado'], peso: 45 },
    { termos: ['trailer', 'teaser', 'preview', 'making of', 'bastidores'], peso: 25 },
    { termos: ['ai cover', 'ia cover', 'inteligencia artificial'], peso: 55 }
]

// Sinais de que é a fonte oficial da obra.
const OFICIAL = ['official', 'oficial', 'vevo', ' - topic', 'videoclipe', 'clipe oficial', 'audio oficial', 'áudio oficial']

// Quando o usuário pede isso, resultados longos passam a ser desejáveis.
const PEDE_LONGO = ['ao vivo', 'live', 'dvd', 'show completo', 'completo', 'set', 'seleção', 'selecao',
    'as melhores', 'só as melhores', 'so as melhores', 'mix', 'playlist', 'especial', 'horas', 'hora']

/** Remove acentos e pontuação: "Coração" e "coracao" viram a mesma coisa. */
function normalizar(s) {
    return String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

// Palavras curtas demais ou vazias de significado não devem valer ponto.
const VAZIAS = new Set(['de', 'da', 'do', 'das', 'dos', 'a', 'o', 'e', 'em', 'no', 'na', 'um', 'uma',
    'para', 'pra', 'com', 'por', 'the', 'of', 'feat', 'ft', 'part', 'pt', 'official', 'video', 'audio',
    'musica', 'music', 'song', 'baixar', 'download'])

/** Palavras de título que não mudam QUAL vídeo é (versão oficial, legenda, resolução). */
const NEUTROS_TITULO = new Set(['oficial', 'clipe', 'clip', 'videoclipe', 'lyric', 'lyrics', 'letra', 'legendado',
    'legenda', 'hd', 'hq', '4k', '1080p', 'remaster', 'remastered', 'visualizer', 'mv'])

function tokens(s) {
    return normalizar(s).split(' ').filter(t => t.length > 0 && !VAZIAS.has(t))
}

/**
 * Separa o que parece ARTISTA do que parece TÍTULO.
 *
 * A convenção "Música - Artista" (ou o inverso) cobre a maioria dos pedidos.
 * Sem separador, tratamos a busca inteira como podendo conter as duas coisas —
 * o casamento com o nome do canal resolve de qualquer jeito.
 */
function separarConsulta(query) {
    const bruto = String(query || '').trim()
    const partes = bruto.split(/\s+[-–—]\s+|\s+\|\s+/).map(p => p.trim()).filter(Boolean)

    if (partes.length >= 2) {
        // Não dá para saber qual lado é o artista sem consultar uma base, então
        // guardamos os dois e pontuamos o que casar com o canal.
        return { ladoA: partes[0], ladoB: partes.slice(1).join(' '), temSeparador: true, bruto }
    }
    return { ladoA: bruto, ladoB: '', temSeparador: false, bruto }
}

/** Fração dos tokens de `alvo` presentes em `texto` (0 a 1). */
function cobertura(alvoTokens, textoTokens) {
    if (!alvoTokens.length) return 0
    const set = new Set(textoTokens)
    let achou = 0
    for (const t of alvoTokens) {
        if (set.has(t)) { achou++; continue }
        // Casamento por prefixo pega plural e flexão ("sorriso"/"sorrisos").
        if (t.length >= 5 && textoTokens.some(x => x.startsWith(t.slice(0, 5)))) achou += 0.7
    }
    return Math.min(1, achou / alvoTokens.length)
}

/**
 * Pontua um candidato de 0 a ~300. Quanto maior, mais provável ser o certo.
 * @param {object} candidato
 * @param {object} consulta
 * @param {object} [opts]
 * @param {string} [opts.expectedTitle] - Título esperado da música (ex: vindo do Spotify)
 * @param {string} [opts.expectedArtist] - Artista esperado da música
 * @param {number} [opts.expectedDuration] - Duração esperada em segundos
 * @returns {{score:number, motivos:string[]}}
 */
function pontuar(candidato, consulta, opts = {}) {
    const motivos = []
    let score = 0

    const titulo = candidato.title || ''
    const autor = candidato.author || ''
    const tTitulo = tokens(titulo)
    const tAutor = tokens(autor)
    const tTudo = [...tTitulo, ...tAutor]

    const qTokens = tokens(consulta.bruto)
    const nAutor = normalizar(autor)
    const nTitulo = normalizar(titulo)
    const nQuery = normalizar(consulta.bruto)

    // ── 1. Cobertura geral: quanto do que foi pedido aparece no resultado.
    const cob = cobertura(qTokens, tTudo)
    score += cob * 60
    if (cob >= 0.9) motivos.push('bate com tudo que você pediu')

    // ── 1.0 Título IGUAL ao pedido vale mais que título que só CONTÉM o pedido.
    // Sem isto, "me at the zoo" perdia o vídeo original para um vídeo SOBRE ele
    // ("'Me at the zoo' wasn't the first YouTube video…"): os dois contêm a frase.
    const tituloLimpo = tTitulo.filter(t => !NEUTROS_TITULO.has(t))
    const setAutorTokens = new Set(tAutor)
    const tituloExato = qTokens.length > 0
        && qTokens.every(t => tituloLimpo.includes(t))
        && tituloLimpo.filter(t => !qTokens.includes(t) && !setAutorTokens.has(t)).length === 0
    if (tituloExato) {
        score += 50
        motivos.push('título é exatamente o que foi pedido')
    } else if (cob >= 0.9) {
        // Tudo que foi pedido está lá, mas cercado de muita coisa a mais:
        // comentário, react, "a verdade sobre…". Pune de leve, pelo excesso.
        const extras = tituloLimpo.filter(t => !qTokens.includes(t) && !setAutorTokens.has(t)).length
        if (extras >= 4) {
            const pena = Math.min(30, (extras - 3) * 5)
            score -= pena
            motivos.push(`título com ${extras} palavras além do pedido`)
        }
    }

    // ── 1.1 Match exato de frase (Título ou Query inteira)
    if (opts.expectedTitle) {
        const nExpTitle = normalizar(opts.expectedTitle)
        if (nTitulo.includes(nExpTitle)) {
            score += 85
            motivos.push(`título contém exatamente "${opts.expectedTitle}"`)
        }
    } else if (nTitulo.includes(nQuery)) {
        score += 85
        motivos.push('título contém a busca exata')
    }

    // ── 2. O canal do artista & Proteção contra outra música do mesmo artista
    const ladoAtokens = tokens(consulta.ladoA)
    const ladoBtokens = tokens(consulta.ladoB)
    const casaAutorA = ladoAtokens.length ? cobertura(ladoAtokens, tAutor) : 0
    const casaAutorB = ladoBtokens.length ? cobertura(ladoBtokens, tAutor) : 0
    const casaAutor = Math.max(casaAutorA, casaAutorB)

    if (casaAutor >= 0.8) {
        score += 70
        motivos.push(`canal é do artista (${autor})`)
    } else if (casaAutor >= 0.5) {
        score += 35
        motivos.push('canal parece ser do artista')
    } else if (consulta.temSeparador) {
        // Pediu artista explicitamente e nenhum lado casa com o canal:
        // pode ser reupload de terceiro. Só penaliza se o artista também não
        // estiver no título — muita gente sobe como "Artista - Música".
        const noTitulo = Math.max(
            ladoAtokens.length ? cobertura(ladoAtokens, tTitulo) : 0,
            ladoBtokens.length ? cobertura(ladoBtokens, tTitulo) : 0
        )
        if (noTitulo < 0.5) {
            score -= 40
            motivos.push('não achei o artista no canal nem no título')
        }
    }

    // ── 2.1 Identificação da MÚSICA vs ARTISTA e Proteção Rigorosa Contra Outra Música do Mesmo Artista
    let tokensMusica = []
    let textoMusica = ''

    if (consulta.temSeparador) {
        textoMusica = casaAutorA >= casaAutorB ? consulta.ladoB : consulta.ladoA
        tokensMusica = tokens(textoMusica)
    } else if (casaAutor >= 0.4) {
        // Sem separador (ex: "99 enzo cello" ou "enzo cello 99"):
        // Se parte dos termos casou com o canal ou autor, os termos restantes são obrigatoriamente a música!
        const setAutor = new Set(tAutor)
        tokensMusica = qTokens.filter(t => !setAutor.has(t) && !tAutor.some(a => a.length >= 4 && a.startsWith(t.slice(0, 4))))
        textoMusica = tokensMusica.join(' ')
    }

    if (tokensMusica.length > 0) {
        const cobMusica = cobertura(tokensMusica, tTitulo)
        const nMusica = normalizar(textoMusica)
        const hasExactSub = nMusica.length >= 2 && nTitulo.includes(nMusica)

        if (hasExactSub || cobMusica >= 0.8) {
            score += 85
            motivos.push(`título contém a música específica solicitada ("${textoMusica}")`)
        } else if (cobMusica >= 0.4) {
            score += 35
            motivos.push(`título parece conter a música ("${textoMusica}")`)
        } else {
            // Se o canal ou autor casou com o artista da busca, mas o título NÃO TEM a música pedida,
            // é com certeza outra música do mesmo artista (ex: pediu "99", vídeo é "Kama Sutra").
            score -= 120
            motivos.push(`descartado: outra música do mesmo artista (falta "${textoMusica}")`)
        }
    } else if (opts.expectedTitle) {
        const tokensExp = tokens(opts.expectedTitle)
        if (tokensExp.length > 0) {
            const cobExp = cobertura(tokensExp, tTitulo)
            if (!nTitulo.includes(normalizar(opts.expectedTitle)) && cobExp < 0.3) {
                score -= 100
                motivos.push('título não corresponde à música esperada')
            }
        }
    }

    // ── 3. Fonte oficial.
    if (OFICIAL.some(o => nAutor.includes(normalizar(o)) || nTitulo.includes(normalizar(o)))) {
        score += 18
        motivos.push('fonte oficial')
    }

    // ── 4. Ruído (karaokê, remix, reaction...) — só pune se NÃO foi pedido.
    const qNorm = normalizar(consulta.bruto)
    for (const grupo of RUIDO) {
        const pedido = grupo.termos.some(t => qNorm.includes(normalizar(t)))
        if (pedido) continue
        const achado = grupo.termos.find(t => nTitulo.includes(normalizar(t)))
        if (achado) {
            score -= grupo.peso
            motivos.push(`descartado por "${achado}"`)
        }
    }

    // ── 5. Duração coerente & Casamento com duração esperada (se conhecida, ex: Spotify)
    const dur = Number(candidato.duration || 0)
    const querLongo = PEDE_LONGO.some(t => qNorm.includes(normalizar(t)))
    if (dur > 0) {
        if (opts.expectedDuration && opts.expectedDuration > 0) {
            const diff = Math.abs(dur - opts.expectedDuration)
            if (diff <= 3) {
                score += 60
                motivos.push(`duração idêntica (±${diff}s)`)
            } else if (diff <= 8) {
                score += 40
                motivos.push(`duração muito próxima (±${diff}s)`)
            } else if (diff <= 20) {
                score += 20
                motivos.push(`duração próxima (±${diff}s)`)
            } else if (diff > 45) {
                score -= 50
                motivos.push(`duração incompatível (±${diff}s)`)
            }
        } else if (querLongo) {
            // Pediu live/DVD/"as melhores": conteúdo longo é o alvo.
            if (dur >= 1800) { score += 25; motivos.push('duração de show/live') }
            else if (dur < 600) { score -= 20; motivos.push('curto demais para o que você pediu') }
        } else {
            // Música avulsa: shorts e vídeos de 20s quase nunca são a faixa.
            // Curto costuma ser short, mas quando o título é exatamente o pedido a
            // pessoa quer aquele vídeo (ex.: "Me at the zoo", 19 s): pena menor.
            if (dur < 45) { score -= tituloExato ? 10 : 35; motivos.push('curto demais (short)') }
            else if (dur >= 120 && dur <= 600) score += 10
            else if (dur > 3600) { score -= 10 }
        }
    }

    // ── 6. Artista esperado (se fornecido explicitamente)
    if (opts.expectedArtist) {
        const artTokens = tokens(opts.expectedArtist)
        const inChannel = artTokens.length ? cobertura(artTokens, tAutor) : 0
        const inTitle = artTokens.length ? cobertura(artTokens, tTitulo) : 0
        if (inChannel >= 0.5) {
            score += 30
            motivos.push('artista esperado no canal')
        } else if (inTitle >= 0.5) {
            score += 15
            motivos.push('artista esperado no título')
        }
    }

    // ── 7. Popularidade, em escala log e com peso pequeno: serve de desempate
    // entre dois resultados igualmente bons, nunca para dominar a relevância.
    const views = Number(candidato.views || 0)
    if (views > 0) score += Math.min(15, Math.log10(views) * 2.2)

    return { score: Math.round(score * 10) / 10, motivos }
}

/**
 * Reordena candidatos por relevância ao que foi pedido.
 *
 * @param {string} query termo original digitado pelo usuário
 * @param {Array<object>} candidatos resultados brutos (title, author, duration, views...)
 * @returns {Array<object>} mesma lista, ordenada, com `_score` e `_motivos`
 */
function ranquear(query, candidatos, opts = {}) {
    if (!Array.isArray(candidatos) || candidatos.length === 0) return []
    const consulta = separarConsulta(query)

    return candidatos
        .map(c => {
            const { score, motivos } = pontuar(c, consulta, opts)
            return { ...c, _score: score, _motivos: motivos }
        })
        .sort((a, b) => b._score - a._score)
        .map((c, i) => ({ ...c, index: i + 1 }))
}

/**
 * Melhor candidato + se a escolha foi confiante.
 *
 * Quando o primeiro colocado não abre vantagem sobre o segundo, o certo não é
 * chutar: é mostrar as opções para o usuário escolher.
 */
function melhorResultado(query, candidatos, opts = {}) {
    const lista = ranquear(query, candidatos, opts)
    if (!lista.length) return { escolhido: null, confiante: false, lista }

    const [primeiro, segundo] = lista
    const margem = segundo ? primeiro._score - segundo._score : Infinity
    // Score baixo = nada casou direito. Margem curta = empate técnico.
    const confiante = primeiro._score >= 45 && margem >= 15

    return { escolhido: primeiro, confiante, margem, lista }
}

module.exports = { ranquear, melhorResultado, pontuar, normalizar, tokens, separarConsulta }
