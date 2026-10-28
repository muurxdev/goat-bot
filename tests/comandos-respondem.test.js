process.env.NODE_ENV = 'test'
/**
 * Regressão: nenhum comando pode QUEBRAR, ficar MUDO ou TRAVAR.
 *
 * Roda os 4.593 com o argumento que o próprio comando documenta em `examples`,
 * com rede e binários isolados. É o piso: um comando novo que lance exceção ou
 * não responda nada derruba este teste.
 *
 * O relatório detalhado (por classe, por categoria) sai de:
 *   npm run test:comandos
 */
const os = require('os')
const path = require('path')

process.env.DB_PATH = path.join(os.tmpdir(), 'goat-regressao-' + Date.now() + '.sqlite')

const stub = require('./helpers/stubExterno')
const { criarCtx, lerFixture } = require('./helpers/ctxFalso')

const FIXTURE = lerFixture('imagem')
stub.instalar({
    permitirFfmpeg: false,
    baileys: FIXTURE
        ? {
            downloadMediaMessage: async () => FIXTURE,
            downloadContentFromMessage: async function * () { yield FIXTURE }
        }
        : null
})

const dispatcher = require('../src/handlers/commandDispatcher')

const NUNCA_RODAR = new Set(['shutdown', 'desligar', 'restart', 'reiniciar'])
const TEMPO_LIMITE = 5000

function argsDoExemplo (cmd) {
    if (Array.isArray(cmd.examples) && cmd.examples.length) {
        // Só travessão (— –), nunca hífen: o exemplo de .mat2 é
        // "2x² - 5x + 3 = 0 — duas raízes", e cortar no hífen deixava args=['2x²'],
        // testando o comando com uma entrada que ele nunca documentou.
        const antes = String(cmd.examples[0] || '').split(/\s[—–]\s/)[0].trim()
        return antes ? antes.split(/\s+/) : []
    }
    return []
}

async function comTempoLimite (fn, ms) {
    let timer
    const corrida = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('__TEMPO__')), ms) })
    try {
        return await Promise.race([Promise.resolve().then(fn), corrida])
    } finally {
        clearTimeout(timer)
    }
}

function respondeu (respostas, envios) {
    if (respostas.length > 0) return true
    return envios.some(e => {
        const c = e.conteudo || {}
        // `delete`/`forward` contam: o .clear apaga a mensagem e não responde
        // nada de propósito — você vê o efeito, confirmação seria ruído.
        return c.text || c.caption || c.poll || c.image || c.video ||
            c.audio || c.sticker || c.document || c.contacts || c.location ||
            c.delete || c.forward || c.react
    })
}

async function rodar () {
    console.log('🧪 Regressão: todos os comandos respondem...\n')

    const mediaService = require('../src/services/mediaService')
    if (FIXTURE && typeof mediaService.downloadWhatsAppMedia === 'function') {
        mediaService.downloadWhatsAppMedia = async () => FIXTURE
    }

    dispatcher.loadCommands()

    const vistos = new Set()
    const alvos = []
    for (const [nome, cmd] of dispatcher.getCommands()) {
        if (vistos.has(cmd)) continue
        vistos.add(cmd)
        if (NUNCA_RODAR.has(String(cmd.name).toLowerCase())) continue
        alvos.push({ nome, cmd })
    }

    const quebrados = []
    const mudos = []
    const travados = []

    // Comando que estourou o tempo continua rodando: se a promessa abandonada
    // rejeitar depois, sem estes tratadores ela derruba o npm test inteiro com
    // uma pilha sem relação com o teste.
    const assincronosSoltos = []
    const anotarSolto = (e) => assincronosSoltos.push(String(e && e.message ? e.message : e).slice(0, 120))
    process.on('uncaughtException', anotarSolto)
    process.on('unhandledRejection', anotarSolto)

    const logReal = { log: console.log, warn: console.warn, error: console.error }
    const exitReal = process.exit.bind(process)

    try {
        console.log = () => {}
        console.warn = () => {}
        console.error = () => {}
        process.exit = (c) => { throw new Error('process.exit(' + c + ') chamado pelo comando') }

        for (const { nome, cmd } of alvos) {
            // criarCtx e respondeu ficam DENTRO do try: se um deles lançar, o
            // finally ainda devolve console e process.exit. Sem isso o erro real
            // sumia no console silenciado e o teste morria dizendo
            // "process.exit(1) chamado pelo comando", que não é a causa.
            try {
                const { ctx, respostas, envios } = criarCtx({ cmd, args: argsDoExemplo(cmd), citada: 'imagem' })
                await comTempoLimite(() => cmd.execute(ctx), TEMPO_LIMITE)
                if (!respondeu(respostas, envios)) mudos.push({ nome, categoria: cmd.category })
            } catch (e) {
                const msg = (e && e.message) || String(e)
                if (msg === '__TEMPO__') travados.push(nome)
                else quebrados.push({ nome, categoria: cmd.category, msg: msg.slice(0, 120) })
            }
        }
    } finally {
        process.exit = exitReal
        console.log = logReal.log
        console.warn = logReal.warn
        console.error = logReal.error
        process.off('uncaughtException', anotarSolto)
        process.off('unhandledRejection', anotarSolto)
    }

    if (assincronosSoltos.length) {
        console.log('\n⚠ erros assíncronos de comandos abandonados no timeout: ' + assincronosSoltos.length)
        for (const a of [...new Set(assincronosSoltos)].slice(0, 5)) console.log('   ' + a)
    }

    const falhas = quebrados.length + mudos.length + travados.length

    console.log('  comandos testados: ' + alvos.length)
    console.log('  quebrados (lançaram erro): ' + quebrados.length)
    console.log('  mudos (não responderam): ' + mudos.length)
    console.log('  travados (timeout): ' + travados.length)

    if (quebrados.length) {
        console.log('\n❌ QUEBRADOS:')
        for (const q of quebrados.slice(0, 25)) console.log('   .' + q.nome + ' (' + q.categoria + '): ' + q.msg)
    }
    if (mudos.length) {
        console.log('\n❌ MUDOS:')
        for (const m of mudos.slice(0, 25)) console.log('   .' + m.nome + ' (' + m.categoria + ')')
    }
    if (travados.length) {
        console.log('\n❌ TRAVADOS:')
        for (const t of travados.slice(0, 25)) console.log('   .' + t)
    }

    console.log('\n========================================')
    console.log('📊 Comandos respondem: ' + (alvos.length - falhas) + ' ✅  ' + falhas + ' ❌')
    console.log('========================================')

    // O banco descartável não pode ficar entulhando o temp a cada npm test.
    // Precisa FECHAR a conexão antes: no Windows o unlink dá EBUSY com o
    // arquivo ainda aberto, e os .sqlite-wal/-shm ficam para trás.
    try {
        require('../src/database/connection').closeDatabase()
    } catch (err) {
        console.warn('[REGRESSAO] não consegui fechar o banco: ' + err.message)
    }
    for (const sufixo of ['', '-wal', '-shm']) {
        try {
            const arquivo = process.env.DB_PATH + sufixo
            if (require('fs').existsSync(arquivo)) require('fs').unlinkSync(arquivo)
        } catch (err) {
            console.warn('[REGRESSAO] não removi ' + process.env.DB_PATH + sufixo + ': ' + err.message)
        }
    }

    if (falhas > 0) process.exit(1)
}

rodar().catch(e => { console.error(e); process.exit(1) })
