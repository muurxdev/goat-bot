/**
 * CONTEÚDO AUTOMÁTICO POR GRUPO.
 *
 * Entrega conteúdo no ritmo configurado, com o tema do grupo: livro de código
 * no grupo de dev, material de idioma no de idiomas, e assim por diante.
 *
 * Decisões que valem registrar:
 *   • Estado por GRUPO, nunca global — cada um tem tema, ritmo e histórico.
 *   • Guarda o que já enviou para não repetir o mesmo item.
 *   • Um relógio só varre todos os grupos, em vez de um timer por grupo:
 *     dez timers independentes seriam dez formas de vazar memória.
 *   • Entrega falha não trava o ciclo: erra, loga, marca o horário e segue —
 *     senão um grupo com problema pararia a fila de todos.
 */

const logger = require('../core/logger')
const { detectarTema, TEMA_BY_KEY, INTERVALO_PADRAO_MIN, INTERVALO_MINIMO_MIN } = require('../config/autoContent')

/** De quanto em quanto tempo o relógio confere quem está vencido. */
const TICK_MS = 5 * 60 * 1000

/** Quantos itens lembrar por grupo, para não repetir. */
const MEMORIA_ITENS = 40

let _timer = null
let _client = null

/** Configuração de conteúdo automático de um grupo. */
function getConfig(groupJid) {
    try {
        const dataService = require('./dataService')
        const configs = dataService.getConfigsData()
        return (configs[groupJid] && configs[groupJid].autoContent) || null
    } catch (err) {
        logger.warn(`[AUTO] Falha ao ler config de ${groupJid}: ${err.message}`)
        return null
    }
}

async function saveConfig(groupJid, cfg) {
    const dataService = require('./dataService')
    const configs = dataService.getConfigsData()
    if (!configs[groupJid]) configs[groupJid] = {}
    configs[groupJid].autoContent = cfg
    await dataService.saveConfigsData(configs)
    return cfg
}

/**
 * Liga o conteúdo automático num grupo.
 * @param {string} groupJid
 * @param {{tema?:string, intervaloMin?:number, nomeGrupo?:string}} opts
 */
async function ativar(groupJid, opts = {}) {
    const atual = getConfig(groupJid) || {}
    const tema = opts.tema || atual.tema || detectarTema(opts.nomeGrupo || '').chave
    const intervalo = Math.max(INTERVALO_MINIMO_MIN, Number(opts.intervaloMin) || atual.intervaloMin || INTERVALO_PADRAO_MIN)

    const cfg = {
        ativo: true,
        tema,
        intervaloMin: intervalo,
        // Marca agora para a primeira entrega respeitar o intervalo, em vez de
        // disparar no mesmo instante em que foi ligado.
        ultimaEm: atual.ultimaEm || Date.now(),
        enviados: Array.isArray(atual.enviados) ? atual.enviados : []
    }
    await saveConfig(groupJid, cfg)
    logger.info(`[AUTO] Ligado em ${groupJid} | tema=${tema} | a cada ${intervalo}min`)
    return cfg
}

async function desativar(groupJid) {
    const atual = getConfig(groupJid)
    // null = nada a desligar (nunca configurado ou já desligado), para a tela
    // dizer "já estava desligado" em vez de repetir "desligado"
    if (!atual || !atual.ativo) return null
    atual.ativo = false
    await saveConfig(groupJid, atual)
    logger.info(`[AUTO] Desligado em ${groupJid}`)
    return atual
}

/** Grupos com entrega vencida. */
function vencidos() {
    const dataService = require('./dataService')
    const configs = dataService.getConfigsData()
    const agora = Date.now()
    const lista = []

    for (const [jid, cfg] of Object.entries(configs)) {
        if (!String(jid).endsWith('@g.us')) continue
        const auto = cfg && cfg.autoContent
        if (!auto || !auto.ativo) continue
        const intervaloMs = Math.max(INTERVALO_MINIMO_MIN, auto.intervaloMin || INTERVALO_PADRAO_MIN) * 60 * 1000
        if (agora - (auto.ultimaEm || 0) >= intervaloMs) lista.push({ jid, auto })
    }
    return lista
}

/** Escolhe uma consulta do tema que ainda não foi usada recentemente. */
function proximaConsulta(tema, enviados = []) {
    const t = TEMA_BY_KEY[tema] || TEMA_BY_KEY.geral
    const naoUsadas = t.consultas.filter(c => !enviados.includes(c))
    const pool = naoUsadas.length ? naoUsadas : t.consultas
    return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Monta e envia uma entrega de LIVRO.
 * @returns {Promise<{ok:boolean, item?:string, motivo?:string}>}
 */
async function entregarLivro(groupJid, consulta) {
    const bookService = require('./bookService')
    const resultados = await bookService.searchBooks(consulta, 1, 'pt')
    if (!resultados || !resultados.length) return { ok: false, motivo: `nada encontrado para "${consulta}"` }

    const livro = resultados[0]
    const titulo = livro.title || livro.titulo || consulta
    const autor = livro.author || livro.autor || 'Autor desconhecido'
    const fonte = livro.source || livro.fonte || 'Open Library / Archive.org'
    const ano = livro.year || livro.ano || ''

    let doc = `╔══════════════════════════════╗\n`
    doc += `║   📚 *LEITURA DO DIA* 📚   ║\n`
    doc += `╚══════════════════════════════╝\n\n`
    doc += `📖 *${titulo}*\n`
    doc += `✍️ *Autor:* ${autor}\n`
    if (ano) doc += `📅 *Ano:* ${ano}\n`
    doc += `🔎 *Tema:* ${consulta}\n`
    doc += `🌐 *Fonte:* ${fonte}\n`
    if (livro.url) doc += `🔗 ${livro.url}\n`
    doc += `\n_Envio automático deste grupo._`

    await _client.sendMessage(groupJid, { text: doc })

    // O PDF é um extra: se não vier, a indicação já valeu — não é motivo de falha.
    try {
        const pdfUrl = await bookService.resolvePdfUrl(livro.identifier || livro.id || '', titulo, 'pt')
        if (pdfUrl) {
            const buffer = await bookService.downloadPdfBuffer(pdfUrl, livro)
            if (buffer && buffer.length) {
                await _client.sendMessage(groupJid, {
                    document: buffer,
                    mimetype: 'application/pdf',
                    fileName: `${String(titulo).slice(0, 60).replace(/[^\w\s.-]/g, '')}.pdf`,
                    caption: `📎 ${titulo}`
                })
            }
        }
    } catch (err) {
        logger.warn(`[AUTO] PDF de "${titulo}" não veio: ${err.message}`)
    }

    return { ok: true, item: consulta }
}

/** Entrega de MÚSICA (indicação; o download fica a cargo do `.play`). */
async function entregarMusica(groupJid, consulta) {
    let doc = `╔══════════════════════════════╗\n`
    doc += `║   🎵 *SELEÇÃO DO DIA* 🎵   ║\n`
    doc += `╚══════════════════════════════╝\n\n`
    doc += `🎧 *Tema:* ${consulta}\n\n`
    doc += `_Peça a faixa com_ \`.play <nome da música>\`\n`
    doc += `_Envio automático deste grupo._`
    await _client.sendMessage(groupJid, { text: doc })
    return { ok: true, item: consulta }
}

/** Entrega de VAGAS TECH em tempo real */
async function entregarVagas(groupJid, consulta) {
    const axios = require('axios')
    try {
        const repo = 'backend-br/vagas'
        const res = await axios.get(`https://api.github.com/repos/${repo}/issues?state=open&per_page=3`, {
            timeout: 6000,
            headers: { 'User-Agent': 'GOATBOT/2.0 (Skycode Community)' }
        })
        const items = res.data || []
        if (!items.length) return { ok: false, motivo: 'nenhuma vaga encontrada' }

        let doc = `💼 *RADAR AUTÔNOMO DE VAGAS TECH // SKYCODE*\n`
        doc += `_Oportunidades em aberto apuradas em tempo real:_\n\n`
        for (const it of items) {
            doc += `🔹 *${it.title.replace(/\[.*?\]/g, '').trim()}*\n`
            doc += `   🔗 ${it.html_url}\n\n`
        }
        doc += `💡 _Para pesquisar com filtros por área: \`.vagas backend\`, \`.vagas remoto\`._`

        await _client.sendMessage(groupJid, { text: doc })
        return { ok: true, item: consulta }
    } catch (e) {
        logger.warn(`[AUTO VAGAS] Falha ao enviar vagas em ${groupJid}: ${e.message}`)
        return { ok: false, motivo: e.message }
    }
}

/** Entrega de DICAS DE SEGURANÇA E REPUTAÇÃO COMERCIAL */
async function entregarVendas(groupJid, consulta) {
    let doc = `🛡️ *BALCÃO DE NEGÓCIOS & SEGURANÇA // SKYCODE*\n\n`
    doc += `Lembretes para transações 100% seguras na comunidade:\n\n`
    doc += `• *Consulte a Reputação:* Use \`.reputacao @vendedor\` antes de pagar.\n`
    doc += `• *Avalie Negócios:* Concluiu uma compra? Use \`.reputacao positivo @vendedor motivo\`.\n`
    doc += `• *Cuidado com Golpes:* Desconfie de ofertas mirabolantes ou perfis sem avaliações.\n`
    doc += `• *Alerta Comunitário:* Suspeita de fraude? Use \`.reputacao alertar @usuario motivo\`.\n\n`
    doc += `_Blindagem comercial ativa pelo SkyCode Vendas & Compras._`

    await _client.sendMessage(groupJid, { text: doc })
    return { ok: true, item: consulta }
}

/** Entrega de FUTEBOL & TABELAS DO GOAT */
async function entregarFutebol(groupJid, consulta) {
    const futebolService = require('./futebolService')
    const standings = await futebolService.getStandings(consulta || 'brasileirao')
    if (!standings.ok || !standings.entries.length) {
        return { ok: false, motivo: 'tabela indisponível' }
    }
    const text = futebolService.formatarTabela(standings, 6)
    await _client.sendMessage(groupJid, { text })
    return { ok: true, item: consulta }
}

/** Executa uma entrega pendente. */
async function entregar({ jid, auto }) {
    const tema = TEMA_BY_KEY[auto.tema] || TEMA_BY_KEY.geral
    const consulta = proximaConsulta(auto.tema, auto.enviados)

    let resultado
    try {
        if (tema.tipo === 'vagas') {
            resultado = await entregarVagas(jid, consulta)
        } else if (tema.tipo === 'vendas') {
            resultado = await entregarVendas(jid, consulta)
        } else if (tema.tipo === 'futebol') {
            resultado = await entregarFutebol(jid, consulta)
        } else if (tema.tipo === 'musica') {
            resultado = await entregarMusica(jid, consulta)
        } else {
            resultado = await entregarLivro(jid, consulta)
        }
    } catch (err) {
        logger.error(`[AUTO] Entrega falhou em ${jid}: ${err.message}`)
        resultado = { ok: false, motivo: err.message }
    }

    // Marca o horário SEMPRE, inclusive na falha: sem isto um grupo com erro
    // seria tentado a cada tick, virando spam de log.
    auto.ultimaEm = Date.now()
    if (resultado.ok) {
        auto.enviados = [...(auto.enviados || []), consulta].slice(-MEMORIA_ITENS)
        logger.info(`[AUTO] Entregue em ${jid}: ${consulta}`)
    } else {
        logger.warn(`[AUTO] Sem entrega em ${jid}: ${resultado.motivo}`)
    }
    await saveConfig(jid, auto)
    return resultado
}

/** Uma passada do relógio. */
async function tick() {
    if (!_client) return
    const pendentes = vencidos()
    if (!pendentes.length) return
    logger.info(`[AUTO] ${pendentes.length} grupo(s) com entrega pendente`)
    for (const p of pendentes) {
        await entregar(p)
    }
}

/** Liga o relógio. Chamado quando o bot conecta. */
function iniciar(client) {
    _client = client
    if (_timer) clearInterval(_timer)
    _timer = setInterval(() => { tick().catch(err => logger.error(`[AUTO] Tick falhou: ${err.message}`)) }, TICK_MS)
    if (_timer.unref) _timer.unref()
    logger.info(`[AUTO] Relógio de conteúdo automático iniciado (confere a cada ${TICK_MS / 60000}min)`)
    // Dispara conferência inicial suave para recuperar ciclos devidos durante reinicializações (24H Engine)
    setTimeout(() => { tick().catch(err => logger.warn(`[AUTO] Catch-up inicial: ${err.message}`)) }, 5000)
}

function parar() {
    if (_timer) { clearInterval(_timer); _timer = null }
}

/**
 * Ativa o conteúdo automático em todos os grupos participantes.
 * @param {object} client
 * @param {{ tema?: string, filtroSkycode?: boolean }} [opts]
 */
async function ativarTodos(client, opts = {}) {
    if (!client || !client.groupFetchAllParticipating) return { total: 0, ativados: 0, grupos: [] }
    const todos = await client.groupFetchAllParticipating()
    const lista = Object.values(todos || {})
    let ativados = 0
    const resultados = []

    for (const g of lista) {
        if (!g.id) continue
        const nome = String(g.subject || '')
        if (opts.filtroSkycode && !/skycode/i.test(nome)) continue

        const cfg = await ativar(g.id, {
            tema: opts.tema,
            nomeGrupo: nome
        })
        ativados++
        resultados.push({ id: g.id, nome, tema: cfg.tema })
    }

    return { total: lista.length, ativados, grupos: resultados }
}

/**
 * Desativa o conteúdo automático em todos os grupos participantes.
 * @param {object} client
 * @param {{ filtroSkycode?: boolean }} [opts]
 */
async function desativarTodos(client, opts = {}) {
    if (!client || !client.groupFetchAllParticipating) return { total: 0, desativados: 0 }
    const todos = await client.groupFetchAllParticipating()
    const lista = Object.values(todos || {})
    let desativados = 0

    for (const g of lista) {
        if (!g.id) continue
        const nome = String(g.subject || '')
        if (opts.filtroSkycode && !/skycode/i.test(nome)) continue

        const r = await desativar(g.id)
        if (r) desativados++
    }

    return { total: lista.length, desativados }
}

module.exports = {
    iniciar,
    parar,
    tick,
    ativar,
    desativar,
    ativarTodos,
    desativarTodos,
    getConfig,
    vencidos,
    proximaConsulta,
    TICK_MS
}
