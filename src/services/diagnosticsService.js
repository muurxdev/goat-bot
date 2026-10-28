/**
 * Sondas de DIAGNÓSTICO.
 *
 * Reúne num lugar só as leituras de estado que os comandos `.diag*` mostram.
 * Cada sonda devolve dados crus; formatar é problema do comando. Assim a mesma
 * leitura serve para o comando, para o healthcheck e para um relatório futuro
 * sem ninguém reimplementar a consulta.
 *
 * Regras da casa aqui:
 *  - Toda sonda é defensiva: um diagnóstico que derruba o bot é pior que a
 *    ausência do diagnóstico. Falha vira `{ erro: '...' }`, nunca exceção.
 *  - Nada de operação cara sem limite: `integridade()` e `contarLinhas()` são
 *    os únicos que tocam o banco inteiro, e ambos avisam o custo.
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { q, getDatabase, getDatabasePath } = require('../database/connection')
const logger = require('../core/logger')

const RAIZ = path.join(__dirname, '..', '..')

/** Executa uma sonda protegendo o chamador de qualquer exceção. */
function sonda(nome, fn) {
    try {
        return fn()
    } catch (err) {
        logger.warn(`[DIAG] Sonda "${nome}" falhou: ${err.message}`)
        return { erro: err.message }
    }
}

/** Formata bytes em unidade legível. */
function tamanho(bytes) {
    return require('../utils/tamanho').formatarTamanho(Number(bytes) || 0)
}

/** Formata uma duração em segundos como "3d 4h 12m". */
function duracao(segundos) {
    const s = Math.max(0, Math.floor(Number(segundos) || 0))
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    const partes = []
    if (d) partes.push(`${d}d`)
    if (h) partes.push(`${h}h`)
    if (m || !partes.length) partes.push(`${m}m`)
    return partes.join(' ')
}

// ══════════════════════════════════════════════════════════════
// PROCESSO
// ══════════════════════════════════════════════════════════════

function memoria() {
    return sonda('memoria', () => {
        const m = process.memoryUsage()
        return {
            rss: m.rss,
            heapUsado: m.heapUsed,
            heapTotal: m.heapTotal,
            externo: m.external,
            arrayBuffers: m.arrayBuffers || 0,
            sistemaLivre: os.freemem(),
            sistemaTotal: os.totalmem()
        }
    })
}

function tempoDeVida() {
    return sonda('tempoDeVida', () => ({
        processoSegundos: process.uptime(),
        maquinaSegundos: os.uptime(),
        iniciadoEm: new Date(Date.now() - process.uptime() * 1000)
    }))
}

function versoes() {
    return sonda('versoes', () => {
        const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8'))
        return {
            bot: pkg.version,
            node: process.version,
            v8: process.versions.v8,
            dependencias: pkg.dependencies || {}
        }
    })
}

function ambiente() {
    return sonda('ambiente', () => ({
        plataforma: process.platform,
        arquitetura: process.arch,
        nucleos: os.cpus().length,
        modelo: os.cpus()[0]?.model || 'desconhecido',
        ambienteNode: process.env.NODE_ENV || 'production',
        diretorio: process.cwd(),
        pid: process.pid,
        usuario: os.userInfo().username
    }))
}

/**
 * Mede o atraso do laço de eventos.
 *
 * Um atraso alto explica "o bot está lento" melhor que qualquer outra métrica:
 * significa que algo síncrono está bloqueando o processo inteiro.
 */
function atrasoDoLaco(amostras = 5) {
    return new Promise((resolve) => {
        const medidas = []
        let restantes = amostras
        const medir = () => {
            const inicio = process.hrtime.bigint()
            setImmediate(() => {
                medidas.push(Number(process.hrtime.bigint() - inicio) / 1e6)
                if (--restantes > 0) return medir()
                const media = medidas.reduce((a, b) => a + b, 0) / medidas.length
                resolve({ mediaMs: media, maiorMs: Math.max(...medidas), amostras: medidas.length })
            })
        }
        medir()
    })
}

function usoDeCpu() {
    return sonda('usoDeCpu', () => {
        const u = process.cpuUsage()
        const vida = process.uptime() * 1e6
        return {
            usuarioMs: u.user / 1000,
            sistemaMs: u.system / 1000,
            percentual: vida > 0 ? ((u.user + u.system) / vida) * 100 : 0,
            carga: os.loadavg()
        }
    })
}

function recursosAtivos() {
    return sonda('recursosAtivos', () => ({
        // APIs internas: podem sumir entre versões do Node, por isso o fallback.
        handles: typeof process._getActiveHandles === 'function' ? process._getActiveHandles().length : null,
        requisicoes: typeof process._getActiveRequests === 'function' ? process._getActiveRequests().length : null
    }))
}

// ══════════════════════════════════════════════════════════════
// BANCO
// ══════════════════════════════════════════════════════════════

function arquivoDoBanco() {
    return sonda('arquivoDoBanco', () => {
        // getDatabase() antes de getDatabasePath(): o caminho só é registrado
        // quando a conexão abre, e vem null se a sonda rodar antes disso.
        const db = getDatabase()
        const caminho = getDatabasePath()
        const st = fs.statSync(caminho)
        const modo = db.prepare('PRAGMA journal_mode').get()
        const paginas = db.prepare('PRAGMA page_count').get()
        const tamanhoPagina = db.prepare('PRAGMA page_size').get()
        const livres = db.prepare('PRAGMA freelist_count').get()
        return {
            caminho,
            bytes: st.size,
            modificadoEm: st.mtime,
            journal: Object.values(modo || {})[0],
            paginas: Object.values(paginas || {})[0],
            bytesPorPagina: Object.values(tamanhoPagina || {})[0],
            paginasLivres: Object.values(livres || {})[0]
        }
    })
}

function tabelas() {
    return sonda('tabelas', () => {
        const nomes = getDatabase()
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
            .all().map(r => r.name)
        return nomes.map(nome => {
            try {
                // Nome vem do catálogo do próprio banco, não de entrada externa.
                const n = getDatabase().prepare(`SELECT COUNT(*) AS n FROM "${nome}"`).get()
                return { nome, linhas: n.n }
            } catch (err) {
                return { nome, linhas: null, erro: err.message }
            }
        })
    })
}

/** PRAGMA integrity_check — varre o arquivo inteiro. Caro em banco grande. */
function integridade() {
    return sonda('integridade', () => {
        const r = getDatabase().prepare('PRAGMA integrity_check').all()
        const linhas = r.map(x => Object.values(x)[0])
        return { ok: linhas.length === 1 && linhas[0] === 'ok', mensagens: linhas.slice(0, 10) }
    })
}

function indices() {
    return sonda('indices', () => getDatabase()
        .prepare("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY tbl_name, name")
        .all())
}

function migracoes() {
    return sonda('migracoes', () => q('SELECT * FROM schema_migrations ORDER BY rowid DESC LIMIT 15').all())
}

function estatisticasDeUsuarios() {
    return sonda('estatisticasDeUsuarios', () => q(`SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN registered = 1 THEN 1 ELSE 0 END) AS registrados,
            SUM(CASE WHEN COALESCE(messages, 0) > 0 THEN 1 ELSE 0 END) AS ativos,
            SUM(COALESCE(messages, 0)) AS mensagens,
            SUM(COALESCE(xp, 0)) AS xpTotal,
            MAX(COALESCE(level, 0)) AS maiorNivel
        FROM users`).get())
}

// ══════════════════════════════════════════════════════════════
// ARQUIVOS
// ══════════════════════════════════════════════════════════════

/** Soma o tamanho de um diretório, com teto de arquivos para não travar. */
function pesoDoDiretorio(relativo, teto = 5000) {
    return sonda(`pesoDoDiretorio:${relativo}`, () => {
        const base = path.join(RAIZ, relativo)
        if (!fs.existsSync(base)) return { existe: false, bytes: 0, arquivos: 0 }
        let bytes = 0, arquivos = 0, truncado = false
        const pilha = [base]
        while (pilha.length) {
            const dir = pilha.pop()
            for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
                if (arquivos >= teto) { truncado = true; break }
                const p = path.join(dir, e.name)
                if (e.isDirectory()) { pilha.push(p); continue }
                try { bytes += fs.statSync(p).size; arquivos++ } catch { /* arquivo sumiu no meio da varredura */ }
            }
            if (truncado) break
        }
        return { existe: true, bytes, arquivos, truncado, caminho: base }
    })
}

/** Lista os arquivos mais recentes de um diretório. */
function arquivosRecentes(relativo, limite = 10) {
    return sonda(`arquivosRecentes:${relativo}`, () => {
        const base = path.join(RAIZ, relativo)
        if (!fs.existsSync(base)) return []
        return fs.readdirSync(base, { withFileTypes: true })
            .filter(e => e.isFile())
            .map(e => {
                const st = fs.statSync(path.join(base, e.name))
                return { nome: e.name, bytes: st.size, modificadoEm: st.mtime }
            })
            .sort((a, b) => b.modificadoEm - a.modificadoEm)
            .slice(0, limite)
    })
}


// ══════════════════════════════════════════════════════════════
// COMANDOS E USO
// ══════════════════════════════════════════════════════════════

/** Percorre o registro de comandos em disco e resume o estado dele. */
function registroDeComandos() {
    return sonda('registroDeComandos', () => {
        const base = path.join(RAIZ, 'src', 'commands')
        const nomes = new Map()
        const problemas = []
        const colisoes = []
        const porCategoria = new Map()
        let arquivos = 0

        const pilha = [base]
        while (pilha.length) {
            const dir = pilha.pop()
            for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
                const p = path.join(dir, e.name)
                if (e.isDirectory()) { pilha.push(p); continue }
                if (!e.name.endsWith('.js')) continue
                arquivos++
                let mod
                try { mod = require(p) } catch (err) { problemas.push(`${e.name}: ${err.message}`); continue }
                if (!mod || !mod.name) { problemas.push(`${e.name}: sem name`); continue }
                if (typeof mod.execute !== 'function') { problemas.push(`${mod.name}: sem execute`); continue }
                const cat = String(mod.category || 'sem-categoria').toLowerCase()
                porCategoria.set(cat, (porCategoria.get(cat) || 0) + 1)
                for (const chave of [mod.name, ...(mod.aliases || [])]) {
                    const k = String(chave).toLowerCase()
                    if (nomes.has(k)) colisoes.push(`${k}: ${nomes.get(k)} × ${mod.name}`)
                    else nomes.set(k, mod.name)
                }
            }
        }
        return {
            arquivos,
            chaves: nomes.size,
            comandos: [...porCategoria.values()].reduce((a, b) => a + b, 0),
            categorias: [...porCategoria].sort((a, b) => b[1] - a[1]),
            problemas,
            colisoes
        }
    })
}

function telemetria() {
    return sonda('telemetria', () => {
        const t = require('./telemetryService')
        return {
            resumo: typeof t.getMetricsSummary === 'function' ? t.getMetricsSummary() : null,
            topo: typeof t.getTopCommands === 'function' ? t.getTopCommands(10) : [],
            saude: typeof t.getHealthReport === 'function' ? t.getHealthReport() : null
        }
    })
}

function usoDeComandos(limite = 10) {
    return sonda('usoDeComandos', () => {
        const a = require('../database/repositories/analyticsRepository')
        return {
            topo: typeof a.getTopCommands === 'function' ? a.getTopCommands(limite) : [],
            categorias: typeof a.getCategoryStats === 'function' ? a.getCategoryStats() : [],
            total: typeof a.getTotalExecutions === 'function' ? a.getTotalExecutions() : 0
        }
    })
}

// ══════════════════════════════════════════════════════════════
// BOT
// ══════════════════════════════════════════════════════════════

function estadoDaConexao() {
    return sonda('estadoDaConexao', () => {
        const { getClient } = require('../core/connection')
        const c = getClient()
        if (!c) return { conectado: false }
        return {
            conectado: !!c.user,
            eu: c.user?.id || null,
            nome: c.user?.name || null,
            plataforma: c.authState?.creds?.platform || null,
            registrado: c.authState?.creds?.registered ?? null
        }
    })
}

function escoposConfigurados() {
    return sonda('escoposConfigurados', () => {
        // A tabela configs é uma linha por ambiente (group_jid), com as opções
        // em JSON na coluna settings — não é um par chave/valor.
        const linhas = q('SELECT group_jid, settings FROM configs').all()
        let comDominios = 0
        const porEscopo = []

        for (const l of linhas) {
            let dados = null
            try { dados = JSON.parse(l.settings || '{}') } catch (err) {
                logger.warn(`[DIAG] settings ilegível em ${l.group_jid}: ${err.message}`)
                continue
            }
            const estado = dados.__command_state__ || dados.modules || null
            const ligados = estado ? Object.values(estado).filter(Boolean).length : 0
            if (ligados) comDominios++
            porEscopo.push({ escopo: l.group_jid, opcoes: Object.keys(dados).length, dominios: ligados })
        }

        return { ambientes: linhas.length, comDominios, porEscopo: porEscopo.slice(0, 20) }
    })
}

function agendaResumo() {
    return sonda('agendaResumo', () => q(`SELECT status, COUNT(*) AS n FROM bot_schedules GROUP BY status`).all())
}

function listaNegra() {
    return sonda('listaNegra', () => ({
        total: q('SELECT COUNT(*) AS n FROM blacklist').get().n,
        amostra: q('SELECT * FROM blacklist LIMIT 10').all()
    }))
}

function agendamentos() {
    return sonda('agendamentos', () => ({
        total: q('SELECT COUNT(*) AS n FROM bot_schedules').get().n,
        proximos: q('SELECT * FROM bot_schedules ORDER BY rowid DESC LIMIT 10').all()
    }))
}

// ══════════════════════════════════════════════════════════════
// REDE
// ══════════════════════════════════════════════════════════════

/** Mede o tempo de resposta de um endereço externo. */
async function alcancarHost(url, msLimite = 5000) {
    const inicio = Date.now()
    try {
        const ctrl = new AbortController()
        const t = setTimeout(() => ctrl.abort(), msLimite)
        const r = await fetch(url, { method: 'HEAD', signal: ctrl.signal })
        clearTimeout(t)
        return { url, ok: r.ok, status: r.status, ms: Date.now() - inicio }
    } catch (err) {
        return { url, ok: false, erro: err.message, ms: Date.now() - inicio }
    }
}

/** Resolve um nome para conferir se a saída de DNS funciona. */
async function resolverNome(nome = 'google.com') {
    try {
        const dns = require('node:dns').promises
        const inicio = Date.now()
        const enderecos = await dns.resolve4(nome)
        return { nome, ok: true, enderecos: enderecos.slice(0, 5), ms: Date.now() - inicio }
    } catch (err) {
        return { nome, ok: false, erro: err.message }
    }
}

module.exports = {
    sonda,
    tamanho,
    duracao,
    memoria,
    tempoDeVida,
    versoes,
    ambiente,
    atrasoDoLaco,
    usoDeCpu,
    recursosAtivos,
    arquivoDoBanco,
    tabelas,
    integridade,
    indices,
    migracoes,
    estatisticasDeUsuarios,
    pesoDoDiretorio,
    arquivosRecentes,
    registroDeComandos,
    telemetria,
    usoDeComandos,
    estadoDaConexao,
    escoposConfigurados,
    listaNegra,
    agendamentos,
    agendaResumo,
    alcancarHost,
    resolverNome
}
