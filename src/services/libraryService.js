/**
 * Estante pessoal — o que cada leitor está lendo, leu e quer ler.
 *
 * Os comandos que já existiam (`.livro`, `.buscarlivro`, `.resumolivro`)
 * procuram e trazem o livro, mas nada guardava o que aconteceu depois: quem
 * está lendo o quê, em que página parou, o que já terminou. Sem isso não dá
 * para responder "quanto falta?" nem "estou lendo mais que no mês passado?".
 *
 * Cada leitor tem sua estante guardada em `profile_data` no escopo do próprio
 * número, então a estante é dele — não do grupo onde ele digitou o comando.
 */

const perfilData = require('./profileDataService')
const logger = require('../core/logger')

const CHAVE_ESTANTE = 'biblioteca_estante'
const CHAVE_META = 'biblioteca_meta'

/** Quantos livros cabem numa estante. */
const TETO_LIVROS = 200

/** Situações possíveis de um livro. */
const SITUACOES = {
    fila: { emoji: '📥', nome: 'Quero ler' },
    lendo: { emoji: '📖', nome: 'Lendo' },
    lido: { emoji: '✅', nome: 'Lido' },
    parado: { emoji: '⏸️', nome: 'Abandonado' }
}

/** Páginas por minuto de leitura média, usada nas estimativas. */
const PAGINAS_POR_HORA = 40

/** Listas curadas por tema. Servem de sugestão para quem não sabe o que ler. */
const LISTAS = {
    dev: {
        nome: 'Fundamentos de Programação',
        livros: ['Código Limpo — Robert C. Martin', 'O Programador Pragmático — Hunt e Thomas',
            'Refatoração — Martin Fowler', 'Padrões de Projeto — Gang of Four',
            'Domain-Driven Design — Eric Evans', 'Trabalho Eficaz com Código Legado — Michael Feathers']
    },
    algoritmos: {
        nome: 'Algoritmos e Estruturas',
        livros: ['Algoritmos: Teoria e Prática — Cormen', 'Entendendo Algoritmos — Aditya Bhargava',
            'The Algorithm Design Manual — Skiena', 'Programming Pearls — Jon Bentley']
    },
    arquitetura: {
        nome: 'Arquitetura de Software',
        livros: ['Arquitetura Limpa — Robert C. Martin', 'Designing Data-Intensive Applications — Kleppmann',
            'Building Microservices — Sam Newman', 'Software Architecture in Practice — Bass']
    },
    carreira: {
        nome: 'Carreira em Tecnologia',
        livros: ['The Pragmatic Programmer — Hunt e Thomas', 'Soft Skills — John Sonmez',
            'The Manager\'s Path — Camille Fournier', 'Staff Engineer — Will Larson']
    },
    dados: {
        nome: 'Dados e Estatística',
        livros: ['Storytelling com Dados — Cole Knaflic', 'Python para Análise de Dados — Wes McKinney',
            'Estatística Prática para Cientistas de Dados — Bruce', 'The Art of Statistics — David Spiegelhalter']
    },
    seguranca: {
        nome: 'Segurança',
        livros: ['The Web Application Hacker\'s Handbook — Stuttard', 'Segurança de Redes — William Stallings',
            'Practical Cryptography — Ferguson e Schneier', 'The Art of Deception — Kevin Mitnick']
    },
    classicos: {
        nome: 'Clássicos da Literatura',
        livros: ['Dom Casmurro — Machado de Assis', 'Grande Sertão: Veredas — Guimarães Rosa',
            'Crime e Castigo — Dostoiévski', '1984 — George Orwell', 'Cem Anos de Solidão — García Márquez']
    },
    ficcao: {
        nome: 'Ficção e Fantasia',
        livros: ['O Senhor dos Anéis — Tolkien', 'Duna — Frank Herbert', 'Neuromancer — William Gibson',
            'A Guerra dos Tronos — George R. R. Martin', 'O Nome do Vento — Patrick Rothfuss']
    },
    negocios: {
        nome: 'Negócios e Produto',
        livros: ['A Startup Enxuta — Eric Ries', 'Inspirado — Marty Cagan',
            'Hooked — Nir Eyal', 'Zero to One — Peter Thiel']
    },
    produtividade: {
        nome: 'Foco e Produtividade',
        livros: ['Trabalho Focado — Cal Newport', 'Hábitos Atômicos — James Clear',
            'A Arte de Fazer Acontecer — David Allen', 'Essencialismo — Greg McKeown']
    }
}

function escopoDe(jid) {
    return String(jid || '').split('@')[0].split(':')[0] + '@estante'
}

function estante(jid) {
    try {
        const bruto = perfilData.getData(escopoDe(jid), CHAVE_ESTANTE, '[]')
        const dados = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
        return Array.isArray(dados) ? dados : []
    } catch (err) {
        logger.warn(`[BIBLIOTECA] Estante de ${jid} ilegível: ${err.message} — tratando como vazia.`)
        return []
    }
}

function salvarEstante(jid, livros) {
    try {
        perfilData.setData(escopoDe(jid), CHAVE_ESTANTE, JSON.stringify(livros.slice(0, TETO_LIVROS)))
        return true
    } catch (err) {
        logger.error(`[BIBLIOTECA] Falha ao salvar estante de ${jid}: ${err.message}`)
        return false
    }
}

/** Busca um livro na estante por trecho do título. */
function achar(jid, termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return null
    const livros = estante(jid)
    // Número direto seleciona pela posição, que é como a estante é exibida.
    const indice = parseInt(t, 10)
    if (indice && livros[indice - 1]) return { livro: livros[indice - 1], indice: indice - 1 }
    const pos = livros.findIndex(l => String(l.titulo).toLowerCase().includes(t))
    return pos >= 0 ? { livro: livros[pos], indice: pos } : null
}

function adicionar(jid, titulo, situacao = 'fila', paginas = 0) {
    const t = String(titulo || '').trim()
    if (!t) return { ok: false, erro: 'Informe o título do livro.' }
    if (t.length > 120) return { ok: false, erro: 'Título longo demais (máximo 120 caracteres).' }
    if (!SITUACOES[situacao]) return { ok: false, erro: 'Situação inválida.' }

    const livros = estante(jid)
    if (livros.length >= TETO_LIVROS) return { ok: false, erro: `A estante já tem ${TETO_LIVROS} livros.` }
    if (livros.some(l => String(l.titulo).toLowerCase() === t.toLowerCase())) {
        return { ok: false, erro: 'Esse livro já está na sua estante.' }
    }

    const livro = {
        titulo: t,
        situacao,
        paginas: Math.max(0, Number(paginas) || 0),
        pagina: 0,
        adicionadoEm: Date.now(),
        terminadoEm: situacao === 'lido' ? Date.now() : null,
        notas: []
    }
    livros.push(livro)
    salvarEstante(jid, livros)
    return { ok: true, livro, posicao: livros.length }
}

function remover(jid, termo) {
    const achado = achar(jid, termo)
    if (!achado) return { ok: false, erro: 'Livro não encontrado na sua estante.' }
    const livros = estante(jid)
    livros.splice(achado.indice, 1)
    salvarEstante(jid, livros)
    return { ok: true, livro: achado.livro }
}

function mudarSituacao(jid, termo, situacao) {
    if (!SITUACOES[situacao]) return { ok: false, erro: 'Situação inválida.' }
    const achado = achar(jid, termo)
    if (!achado) return { ok: false, erro: 'Livro não encontrado na sua estante.' }
    const livros = estante(jid)
    livros[achado.indice].situacao = situacao
    if (situacao === 'lido') {
        livros[achado.indice].terminadoEm = Date.now()
        if (livros[achado.indice].paginas) livros[achado.indice].pagina = livros[achado.indice].paginas
    }
    salvarEstante(jid, livros)
    return { ok: true, livro: livros[achado.indice] }
}

function marcarPagina(jid, termo, pagina) {
    const achado = achar(jid, termo)
    if (!achado) return { ok: false, erro: 'Livro não encontrado na sua estante.' }
    const p = Math.max(0, Number(pagina) || 0)
    const livros = estante(jid)
    const livro = livros[achado.indice]
    if (livro.paginas && p > livro.paginas) return { ok: false, erro: `O livro tem ${livro.paginas} páginas.` }
    livro.pagina = p
    if (livro.situacao === 'fila') livro.situacao = 'lendo'
    if (livro.paginas && p >= livro.paginas) { livro.situacao = 'lido'; livro.terminadoEm = Date.now() }
    salvarEstante(jid, livros)
    return { ok: true, livro }
}

function anotar(jid, termo, texto) {
    const achado = achar(jid, termo)
    if (!achado) return { ok: false, erro: 'Livro não encontrado na sua estante.' }
    const t = String(texto || '').trim()
    if (!t) return { ok: false, erro: 'A anotação está vazia.' }
    const livros = estante(jid)
    const livro = livros[achado.indice]
    livro.notas = livro.notas || []
    if (livro.notas.length >= 50) return { ok: false, erro: 'Esse livro já tem 50 anotações.' }
    livro.notas.push({ em: Date.now(), pagina: livro.pagina || null, texto: t.slice(0, 500) })
    salvarEstante(jid, livros)
    return { ok: true, livro, total: livro.notas.length }
}

/** Números da leitura: quantos livros, páginas e ritmo. */
function estatisticas(jid) {
    const livros = estante(jid)
    const lidos = livros.filter(l => l.situacao === 'lido')
    const lendo = livros.filter(l => l.situacao === 'lendo')
    const paginasLidas = livros.reduce((a, l) => a + (l.situacao === 'lido' ? (l.paginas || l.pagina || 0) : (l.pagina || 0)), 0)

    // Ritmo só faz sentido com livro terminado e data registrada.
    const comData = lidos.filter(l => l.terminadoEm && l.adicionadoEm)
    const diasMedios = comData.length
        ? comData.reduce((a, l) => a + Math.max(1, (l.terminadoEm - l.adicionadoEm) / 86400000), 0) / comData.length
        : null

    return {
        total: livros.length,
        lidos: lidos.length,
        lendo: lendo.length,
        fila: livros.filter(l => l.situacao === 'fila').length,
        parados: livros.filter(l => l.situacao === 'parado').length,
        paginasLidas,
        notas: livros.reduce((a, l) => a + (l.notas?.length || 0), 0),
        diasPorLivro: diasMedios
    }
}

/** Livros terminados dentro de uma janela de dias. */
function lidosNoPeriodo(jid, dias) {
    const corte = Date.now() - dias * 86400000
    return estante(jid).filter(l => l.situacao === 'lido' && (l.terminadoEm || 0) >= corte)
}

function meta(jid) {
    try {
        const bruto = perfilData.getData(escopoDe(jid), CHAVE_META, null)
        const dados = bruto ? (typeof bruto === 'string' ? JSON.parse(bruto) : bruto) : {}
        return { livrosPorAno: Number(dados.livrosPorAno) || 0, paginasPorDia: Number(dados.paginasPorDia) || 0 }
    } catch (err) {
        logger.warn(`[BIBLIOTECA] Meta de ${jid} ilegível: ${err.message}`)
        return { livrosPorAno: 0, paginasPorDia: 0 }
    }
}

function salvarMeta(jid, alteracoes) {
    const atual = meta(jid)
    const nova = { ...atual, ...alteracoes }
    perfilData.setData(escopoDe(jid), CHAVE_META, JSON.stringify(nova))
    return nova
}

/** Estimativa de tempo para terminar um livro no ritmo médio. */
function tempoRestante(livro) {
    const total = Number(livro?.paginas) || 0
    const atual = Number(livro?.pagina) || 0
    if (!total || atual >= total) return { horas: 0, restantes: 0 }
    const restantes = total - atual
    return { restantes, horas: restantes / PAGINAS_POR_HORA }
}

module.exports = {
    SITUACOES,
    LISTAS,
    TETO_LIVROS,
    PAGINAS_POR_HORA,
    estante,
    achar,
    adicionar,
    remover,
    mudarSituacao,
    marcarPagina,
    anotar,
    estatisticas,
    lidosNoPeriodo,
    meta,
    salvarMeta,
    tempoRestante
}
