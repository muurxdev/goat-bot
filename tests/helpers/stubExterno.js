/**
 * Isolamento de dependências externas para a auditoria de comandos.
 *
 * Motivo: NODE_ENV=test isola SÓ o banco. Nenhum serviço de rede é stubado,
 * e o .env do dev tem uma chave `rk_live_` da Stripe — rodar 4.593 comandos
 * sem isto dispara HTTP real e pode gerar cobrança de verdade.
 *
 * Intercepta em Module._load (antes de qualquer require de comando):
 *   - axios            → resposta permissiva, chamada registrada
 *   - global.fetch     → idem (llmService usa fetch, não axios)
 *   - http/https       → .request/.get bloqueados
 *   - child_process    → yt-dlp/curl/git bloqueados; ffmpeg/ffprobe opcionais
 *   - puppeteer-core   → launch() falso
 *
 * Quem toca rede fica REGISTRADO: o relatório separa "quebrou sozinho" de
 * "quebrou porque a resposta da rede era falsa" — senão o stub gera falso bug.
 */
const Module = require('module')
const path = require('path')
const { EventEmitter } = require('events')
const logger = require('../../src/core/logger')

const chamadas = { http: [], bin: [], puppeteer: [], disco: [] }
let comandoAtual = null

function marcarComando (nome) { comandoAtual = nome }

function registrar (tipo, detalhe) {
    chamadas[tipo].push({ comando: comandoAtual, detalhe: String(detalhe).slice(0, 120) })
}

/**
 * Objeto que aceita qualquer acesso sem lançar TypeError. Evita que o stub
 * de rede produza falsos "comando quebrado" só porque `data.items[0].x`
 * não existe na resposta falsa.
 * `then` devolve undefined de propósito: se devolvesse um proxy, todo `await`
 * em cima disso travaria para sempre.
 */
function permissivo () {
    const alvo = function () {}
    return new Proxy(alvo, {
        get (t, p) {
            if (p === 'then' || p === 'catch' || p === 'finally' || p === Symbol.asyncIterator) return undefined
            if (p === Symbol.toPrimitive) return () => ''
            if (p === Symbol.iterator) return function * () {}
            if (p === 'toString' || p === 'valueOf') return () => ''
            if (p === 'toJSON') return () => ({})
            if (p === 'length' || p === 'size' || p === 'status') return 0
            if (p === 'constructor') return Object
            if (['map', 'filter', 'slice', 'flat', 'concat', 'sort', 'reverse', 'splice'].includes(p)) return () => []
            if (['forEach', 'push', 'join', 'find', 'some', 'every', 'includes', 'indexOf'].includes(p)) return () => undefined
            return permissivo()
        },
        apply () { return permissivo() },
        construct () { return permissivo() }
    })
}

function respostaHttp () {
    return { data: permissivo(), status: 200, statusText: 'OK', headers: {}, config: {}, request: {} }
}

function criarAxiosFalso () {
    const ax = function (config) {
        registrar('http', (config && (config.url || config.baseURL)) || 'axios(config)')
        return Promise.resolve(respostaHttp())
    }
    for (const m of ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'request']) {
        ax[m] = (url) => { registrar('http', m.toUpperCase() + ' ' + url); return Promise.resolve(respostaHttp()) }
    }
    ax.create = () => criarAxiosFalso()
    ax.defaults = { headers: { common: {} } }
    ax.interceptors = { request: { use () {} }, response: { use () {} } }
    ax.isAxiosError = () => false
    ax.CancelToken = { source: () => ({ token: {}, cancel () {} }) }
    ax.all = (p) => Promise.all(p)
    return ax
}

function criarChildProcessFalso (real, permitirFfmpeg) {
    const liberado = (cmd) => permitirFfmpeg && /^(ffmpeg|ffprobe)(\.exe)?$/i.test(path.basename(String(cmd || '')))

    const falhaSync = (cmd) => ({
        status: 127,
        signal: null,
        pid: 0,
        stdout: '',
        stderr: '[STUB] binario bloqueado na auditoria: ' + cmd,
        output: ['', '', ''],
        error: new Error('[STUB] binario bloqueado: ' + cmd)
    })

    const falso = Object.create(real)

    falso.spawnSync = (cmd, ...r) => {
        if (liberado(cmd)) return real.spawnSync(cmd, ...r)
        registrar('bin', cmd)
        return falhaSync(cmd)
    }

    falso.execSync = (cmd, ...r) => {
        if (liberado(String(cmd).split(' ')[0])) return real.execSync(cmd, ...r)
        registrar('bin', cmd)
        throw new Error('[STUB] binario bloqueado: ' + cmd)
    }

    falso.spawn = (cmd, ...r) => {
        if (liberado(cmd)) return real.spawn(cmd, ...r)
        registrar('bin', cmd)
        const p = new EventEmitter()
        p.stdout = new EventEmitter()
        p.stderr = new EventEmitter()
        p.stdin = { write () {}, end () {} }
        p.kill = () => true
        setImmediate(() => {
            p.stderr.emit('data', Buffer.from('[STUB] bloqueado'))
            p.emit('close', 127)
            p.emit('exit', 127)
        })
        return p
    }

    // exec/execFile entregam o erro pelo CALLBACK. Uma versao anterior deste stub
    // delegava para spawn(cmd) sem args nem on('error'), e o evento 'error' sem
    // tratador derrubava o processo — parecia bug do bot e era do proprio stub.
    const processoInerte = () => {
        const p = new EventEmitter()
        p.stdout = new EventEmitter()
        p.stderr = new EventEmitter()
        p.stdin = { write () {}, end () {} }
        p.kill = () => true
        p.on('error', () => {})
        return p
    }

    falso.exec = (cmd, opts, cb) => {
        const done = typeof opts === 'function' ? opts : cb
        if (liberado(String(cmd).split(' ')[0])) return real.exec(cmd, opts, cb)
        registrar('bin', cmd)
        if (typeof done === 'function') {
            setImmediate(() => done(new Error('[STUB] binario bloqueado: ' + cmd), '', '[STUB]'))
        }
        return processoInerte()
    }

    falso.execFile = (cmd, args, opts, cb) => {
        if (liberado(cmd)) return real.execFile(cmd, args, opts, cb)
        const done = [args, opts, cb].find(x => typeof x === 'function')
        registrar('bin', cmd)
        if (typeof done === 'function') {
            setImmediate(() => done(new Error('[STUB] binario bloqueado: ' + cmd), '', '[STUB]'))
        }
        return processoInerte()
    }

    return falso
}

const originais = {}

/**
 * Escreve ignorando a proteção. É por aqui que o próprio relatório da auditoria
 * é gravado: a raiz do repositório está bloqueada de propósito, e sem esta via
 * o relatório era descartado em silêncio (aconteceu).
 */
function gravarSemProtecao (caminho, conteudo) {
    const escrever = originais.writeFileSync || require('fs').writeFileSync
    return escrever.call(require('fs'), caminho, conteudo)
}

/**
 * Impede que a auditoria grave fora das pastas descartáveis.
 * Sem isto, `.setwallpaper` rodando com contexto de dono sobrescreve
 * assets/wallpapers/main.jpg de verdade — aconteceu.
 */
function protegerDisco () {
    const fs = require('fs')
    const os = require('os')
    const raiz = path.join(__dirname, '..', '..')
    const permitidas = [
        os.tmpdir(),
        path.join(raiz, 'temp'),
        path.join(raiz, 'data'),
        path.join(raiz, 'logs'),
        path.join(raiz, 'backups-test')
    ].map(p => path.resolve(p).toLowerCase())

    // Caixa de areia: gravação barrada não é descartada, é DESVIADA para cá.
    // Descartar em silêncio fazia o comando que grava e relê em seguida falhar
    // com ENOENT e ser classificado como quebrado — o falso bug que este módulo
    // existe para evitar.
    const areia = path.join(os.tmpdir(), 'goat-areia-' + process.pid)

    const liberado = (alvo) => {
        try {
            const abs = path.resolve(String(alvo)).toLowerCase()
            // Compara com fronteira de separador: sem isto `<raiz>/temp-antigo`
            // e `<raiz>/datastore` passavam como se fossem `temp/` e `data/`.
            return permitidas.some(p => abs === p || abs.startsWith(p + path.sep))
        } catch (err) {
            logger.debug('[STUB] caminho ilegivel na protecao de disco: ' + err.message)
            return false
        }
    }

    originais.mkdirSync = fs.mkdirSync
    const desvios = new Map()

    const desviar = (alvo) => {
        const chave = path.resolve(String(alvo))
        if (desvios.has(chave)) return desvios.get(chave)
        const nome = path.basename(chave) || 'arquivo'
        const carimbo = Buffer.from(chave).toString('hex').slice(-12)
        if (!fs.existsSync(areia)) originais.mkdirSync.call(fs, areia, { recursive: true })
        const destino = path.join(areia, carimbo + '-' + nome)
        desvios.set(chave, destino)
        return destino
    }

    /** Leitura de caminho desviado cai na caixa de areia — só se já houve escrita lá. */
    const resolverLeitura = (alvo) => {
        try {
            const chave = path.resolve(String(alvo))
            const desviado = desvios.get(chave)
            return desviado && fs.existsSync(desviado) ? desviado : alvo
        } catch (err) {
            logger.debug('[STUB] caminho ilegivel na leitura: ' + err.message)
            return alvo
        }
    }

    // Um alvo por método: qual argumento é o caminho que vai ser ESCRITO.
    const alvoDoMetodo = {
        writeFileSync: 0, appendFileSync: 0, unlinkSync: 0, rmSync: 0, rmdirSync: 0,
        writeFile: 0, appendFile: 0, unlink: 0, createWriteStream: 0, truncateSync: 0,
        copyFileSync: 1, renameSync: 1, copyFile: 1, rename: 1
    }

    for (const [metodo, indice] of Object.entries(alvoDoMetodo)) {
        const real = fs[metodo]
        if (typeof real !== 'function') continue
        originais[metodo] = real
        fs[metodo] = function (...args) {
            const destino = args[indice]
            if (destino !== undefined && !liberado(destino)) {
                registrar('disco', metodo + ' ' + destino)
                args[indice] = desviar(destino)
            }
            return real.apply(fs, args)
        }
    }

    // Leitura: quem gravou num caminho desviado precisa conseguir reler, senão
    // a sequência "grava e relê" quebra com ENOENT e vira falso "quebrado".
    for (const metodo of ['readFileSync', 'existsSync', 'statSync', 'createReadStream']) {
        const real = fs[metodo]
        if (typeof real !== 'function') continue
        fs[metodo] = function (alvo, ...resto) {
            return real.call(fs, resolverLeitura(alvo), ...resto)
        }
    }

    // fs.promises é um objeto separado: patchar só o fs síncrono deixava
    // writeFile/rename assíncronos passarem direto para o disco real.
    if (fs.promises) {
        for (const [metodo, indice] of Object.entries({ writeFile: 0, appendFile: 0, unlink: 0, copyFile: 1, rename: 1 })) {
            const real = fs.promises[metodo]
            if (typeof real !== 'function') continue
            fs.promises[metodo] = function (...args) {
                const destino = args[indice]
                if (destino !== undefined && !liberado(destino)) {
                    registrar('disco', 'promises.' + metodo + ' ' + destino)
                    args[indice] = desviar(destino)
                }
                return real.apply(fs.promises, args)
            }
        }
    }
}

function instalar (opcoes = {}) {
    const permitirFfmpeg = opcoes.permitirFfmpeg === true
    if (opcoes.protegerDisco !== false) protegerDisco()

    const axiosFalso = criarAxiosFalso()
    const cpReal = require('child_process')
    const cpFalso = criarChildProcessFalso(cpReal, permitirFfmpeg)
    const puppeteerFalso = {
        launch: async () => { registrar('puppeteer', 'launch'); return permissivo() },
        connect: async () => { registrar('puppeteer', 'connect'); return permissivo() }
    }

    // Os exports do Baileys sao nao-configuraveis, entao nao da para sobrescrever
    // downloadMediaMessage depois de carregado: tem que ser aqui, na entrada.
    const trocasBaileys = opcoes.baileys || null
    let baileysEnvolvido = null

    const loadOriginal = Module._load
    Module._load = function (pedido) {
        if (pedido === 'axios') return axiosFalso
        if (pedido === 'child_process' || pedido === 'node:child_process') return cpFalso
        if (pedido === 'puppeteer-core' || pedido === 'puppeteer') return puppeteerFalso
        if (trocasBaileys && pedido === '@whiskeysockets/baileys') {
            if (!baileysEnvolvido) {
                const real = loadOriginal.apply(this, arguments)
                baileysEnvolvido = new Proxy(real, {
                    get: (alvo, chave) => (chave in trocasBaileys ? trocasBaileys[chave] : alvo[chave])
                })
            }
            return baileysEnvolvido
        }
        return loadOriginal.apply(this, arguments)
    }

    // llmService e vários serviços usam fetch global, não axios
    global.fetch = async (url) => {
        registrar('http', 'fetch ' + url)
        return {
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Map(),
            json: async () => permissivo(),
            text: async () => '',
            arrayBuffer: async () => new ArrayBuffer(0),
            buffer: async () => Buffer.alloc(0),
            body: null
        }
    }

    // rede crua: quem escapar do axios/fetch morre aqui, em vez de sair de verdade
    for (const mod of ['http', 'https']) {
        const m = require(mod)
        m.request = function (...a) {
            registrar('http', mod + '.request ' + (a[0] && (a[0].href || a[0].hostname || a[0])))
            throw new Error('[STUB] rede bloqueada na auditoria')
        }
        m.get = function (...a) {
            registrar('http', mod + '.get ' + a[0])
            throw new Error('[STUB] rede bloqueada na auditoria')
        }
    }

    logger.debug('[STUB] isolamento externo instalado (ffmpeg ' + (permitirFfmpeg ? 'liberado' : 'bloqueado') + ')')
    return { axiosFalso, loadOriginal }
}

module.exports = { instalar, chamadas, marcarComando, permissivo, gravarSemProtecao }
