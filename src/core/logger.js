/**
 * Logger do bot: console sempre, e arquivo diário em logs/ para WARN e ERROR.
 *
 * Por que grava em disco: `docker logs` some quando o container é recriado, e
 * a pasta logs/ já é montada no container (docker-compose: ./logs:/app/logs).
 *
 *   LOG_FILE_LEVEL = debug | info | warn (padrão) | error — nível mínimo no arquivo
 *   LOG_DIR        = pasta dos arquivos (padrão: <raiz>/logs)
 *   LOG_TO_FILE    = 0 desliga o arquivo; 1 força ligar (inclusive em teste)
 *
 * Em NODE_ENV=test o arquivo fica desligado, para a suíte não sujar logs/.
 * Rotação: um arquivo por dia (bot-AAAA-MM-DD.log, data UTC), mantém 7 dias;
 * os mais antigos são apagados no boot e a cada virada de dia.
 * Se o disco falhar, avisa uma vez no console e segue só no console.
 */

const fs = require('fs')
const path = require('path')
const env = require('../config/env')
const { rootDir } = require('../config/paths')

const NIVEIS = { debug: 10, info: 20, warn: 30, error: 40 }
const RETENCAO_DIAS = 7
const PADRAO_ARQUIVO = /^bot-(\d{4}-\d{2}-\d{2})\.log$/

function diaUtc(data) {
    return data.toISOString().slice(0, 10)
}

/**
 * Destino em arquivo com rotação diária. Exportado para teste com pasta/relógio próprios.
 * @param {{dir: string, minLevel?: string, retentionDays?: number, clock?: () => Date}} opts
 */
function createFileSink({ dir, minLevel = 'warn', retentionDays = RETENCAO_DIAS, clock = () => new Date() }) {
    const minimo = NIVEIS[minLevel] || NIVEIS.warn
    let stream = null
    let diaAtual = null
    let quebrado = false
    let avisou = false

    function falhar(err) {
        if (!avisou) {
            avisou = true
            console.warn(`[WARN] ${new Date().toISOString()} [LOGGER] não consegui gravar log em ${dir} (${err && err.message}); sigo só no console.`)
        }
        quebrado = true
        if (stream) {
            stream.destroy()
            stream = null
        }
    }

    /** Apaga arquivos com data anterior à janela de retenção. Nunca lança. */
    async function limparAntigos(agora = clock()) {
        const limite = new Date(agora.getTime() - (retentionDays - 1) * 86400000)
        const corte = diaUtc(limite)
        const removidos = []
        try {
            const nomes = await fs.promises.readdir(dir)
            for (const nome of nomes) {
                const m = PADRAO_ARQUIVO.exec(nome)
                if (!m || m[1] >= corte) continue
                try {
                    await fs.promises.unlink(path.join(dir, nome))
                    removidos.push(nome)
                } catch (err) {
                    // ENOENT = outra limpeza concorrente já apagou: é o resultado desejado.
                    if (err.code !== 'ENOENT') {
                        console.warn(`[WARN] ${new Date().toISOString()} [LOGGER] não consegui apagar log antigo ${nome}: ${err.message}`)
                    }
                }
            }
        } catch (err) {
            console.warn(`[WARN] ${new Date().toISOString()} [LOGGER] não consegui listar ${dir} para rotação: ${err.message}`)
        }
        return removidos
    }

    function abrir(agora) {
        diaAtual = diaUtc(agora)
        if (stream) {
            stream.end()
            stream = null
        }
        quebrado = false
        fs.mkdirSync(dir, { recursive: true })
        stream = fs.createWriteStream(path.join(dir, `bot-${diaAtual}.log`), { flags: 'a' })
        stream.on('error', falhar)
        limparAntigos(agora)
    }

    function write(level, linha) {
        if ((NIVEIS[level] || 0) < minimo) return
        try {
            const agora = clock()
            // Na virada do dia reabre (e tenta de novo se o disco tinha falhado).
            if (diaUtc(agora) !== diaAtual) abrir(agora)
            if (quebrado || !stream) return
            stream.write(linha + '\n')
        } catch (err) {
            falhar(err)
        }
    }

    function close() {
        return new Promise(resolve => {
            if (!stream) return resolve()
            const s = stream
            stream = null
            s.end(resolve)
        })
    }

    return {
        write,
        close,
        limparAntigos,
        dir,
        get broken() { return quebrado },
        arquivoDoDia: (data = clock()) => path.join(dir, `bot-${diaUtc(data)}.log`)
    }
}

function arquivoLigado() {
    if (process.env.LOG_TO_FILE === '0') return false
    if (process.env.LOG_TO_FILE === '1') return true
    return process.env.NODE_ENV !== 'test'
}

const sink = arquivoLigado()
    ? createFileSink({
        dir: process.env.LOG_DIR ? path.resolve(process.env.LOG_DIR) : path.join(rootDir, 'logs'),
        minLevel: String(process.env.LOG_FILE_LEVEL || 'warn').toLowerCase()
    })
    : null

function detalhe(x) {
    if (x === undefined || x === null || x === '') return ''
    if (x instanceof Error) return x.stack || x.message
    if (typeof x === 'object') {
        if (x.stack || x.message) return x.stack || x.message
        try { return JSON.stringify(x) } catch (err) { return String(x) }
    }
    return String(x)
}

function montar(nivel, msg, extras) {
    const resto = extras.map(detalhe).filter(Boolean).join(' ')
    return `[${nivel.toUpperCase()}] ${new Date().toISOString()} ${msg}${resto ? ' ' + resto : ''}`
}

function emitir(nivel, msg, extras) {
    const linha = montar(nivel, msg, extras)
    if (nivel === 'error') console.error(linha)
    else if (nivel === 'warn') console.warn(linha)
    else console.log(linha)
    if (sink) sink.write(nivel, linha)
}

const jaAvisados = new Set()

const logger = {
    error: (msg, ...extras) => emitir('error', msg, extras),
    warn: (msg, ...extras) => emitir('warn', msg, extras),
    info: (msg, ...extras) => emitir('info', msg, extras),
    debug: (msg, ...extras) => { if (env.debug) emitir('debug', msg, extras) },

    /**
     * Para caminhos quentes: avisa em WARN na primeira vez de cada `chave` e,
     * dali em diante, só em DEBUG. Não esconde o problema nem inunda o log.
     */
    warnOnce: (chave, msg, ...extras) => {
        if (jaAvisados.has(chave)) return logger.debug(msg, ...extras)
        if (jaAvisados.size > 5000) jaAvisados.clear()
        jaAvisados.add(chave)
        emitir('warn', msg, extras)
    },

    /** Estado do arquivo de log (diagnóstico e testes). */
    fileState: () => ({ enabled: !!sink, dir: sink ? sink.dir : null, broken: sink ? sink.broken : false }),
    createFileSink
}

module.exports = logger
