/**
 * Falhas persistidas de comando + comando .falhas + log em arquivo.
 *
 * O que precisa continuar verdadeiro:
 *  - A migração 021 cria error_count/last_error/last_error_at e é idempotente.
 *  - Um comando que lança incrementa error_count e grava o erro curto (sem stack).
 *  - Se gravar a métrica falhar, o usuário ainda recebe a resposta de erro.
 *  - O .falhas lista os comandos, sem moldura e sem caixa alta.
 *  - Em NODE_ENV=test o logger não grava em logs/; o sink rotaciona 7 dias
 *    e não derruba o processo se o disco falhar.
 */

process.env.NODE_ENV = 'test'
delete process.env.LOG_TO_FILE

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { DatabaseSync } = require('node:sqlite')

// Banco próprio, aberto ANTES de qualquer serviço: getDatabase cacheia a 1ª instância.
const dbPath = path.join(os.tmpdir(), `falhas-test-${process.pid}-${Date.now()}.sqlite`)
const { getDatabase, closeDatabase } = require('../src/database/connection')
const db = getDatabase(dbPath)

const logger = require('../src/core/logger')
const { migrations } = require('../src/database/migrator')
const analyticsRepo = require('../src/database/repositories/analyticsRepository')
const dispatcher = require('../src/handlers/commandDispatcher')
const falhasCmd = require('../src/commands/owner/falhas')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${nome}`); pass++ }
    catch (e) { console.error(`  ❌ FAIL: ${nome}\n     ${e.stack || e.message}`); fail++ }
}

const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const EMOJI = /\p{Extended_Pictographic}/gu
const OWNER = '5511900000001@s.whatsapp.net'

function ctxDono(nome, replies) {
    return {
        commandName: nome,
        sender: OWNER,
        from: OWNER,
        isGroup: false,
        isAdmin: false,
        isBotAdmin: false,
        isOwner: true,
        args: [],
        prefix: '.',
        reply: async (t) => { replies.push(t) }
    }
}

function linha(nome) {
    return db.prepare('SELECT * FROM command_analytics WHERE command_name = ?').get(nome)
}

async function main() {
    console.log('🧪 Testes de falhas persistidas, .falhas e log em arquivo...\n')

    console.log('--- 1. Migração 021 ---')
    const mig = migrations.find(m => m.id === '021_command_analytics_failures')

    await test('migração 021 existe e foi aplicada no banco de teste', () => {
        assert(mig, 'migração 021 não encontrada')
        const cols = db.prepare('PRAGMA table_info(command_analytics)').all().map(c => c.name)
        for (const c of ['error_count', 'last_error', 'last_error_at']) assert(cols.includes(c), `falta ${c}`)
        assert(db.prepare("SELECT 1 FROM schema_migrations WHERE id = '021_command_analytics_failures'").get())
    })

    await test('migração 021 é idempotente numa tabela antiga (roda 2x sem lançar)', () => {
        const mem = new DatabaseSync(':memory:')
        mem.exec(`CREATE TABLE command_analytics (command_name TEXT PRIMARY KEY, category TEXT,
                  execution_count INTEGER DEFAULT 0, last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP);
                  INSERT INTO command_analytics (command_name, category, execution_count) VALUES ('ping', 'geral', 4);`)
        mig.up(mem)
        mig.up(mem)
        const row = mem.prepare("SELECT * FROM command_analytics WHERE command_name = 'ping'").get()
        assert.strictEqual(Number(row.error_count), 0)
        assert.strictEqual(Number(row.execution_count), 4, 'dados existentes preservados')
        mem.close()
    })

    console.log('\n--- 2. Dispatcher registra falha ---')
    // Os comandos de teste são da categoria dev, desligada num PV novo; liga no PV do dono.
    require('../src/services/moduleStateService').setModule('dev', true, 'pv')
    const longo = 'x'.repeat(1000)
    dispatcher.commands.set('explodeteste', {
        name: 'explodeteste',
        category: 'dev',
        execute: async () => { throw new TypeError(`deu ruim de propósito\n    at linha falsa ${longo}`) }
    })

    await test('comando que lança incrementa error_count e grava last_error curto', async () => {
        const replies = []
        const antes = Date.now()
        const r1 = await dispatcher.dispatch(ctxDono('explodeteste', replies))
        await dispatcher.dispatch(ctxDono('explodeteste', replies))
        assert.strictEqual(r1, true)
        assert(replies.length === 2 && replies[0].includes('Algo deu errado'), `resposta: ${replies[0]}`)

        const row = linha('explodeteste')
        assert(row, 'linha não criada')
        assert.strictEqual(Number(row.error_count), 2)
        assert.strictEqual(Number(row.execution_count), 0, 'falha não conta como execução')
        assert(row.last_error.startsWith('TypeError: deu ruim de propósito'), row.last_error)
        assert(row.last_error.length <= analyticsRepo.MAX_ERRO, `tamanho ${row.last_error.length}`)
        assert(!row.last_error.includes('\n'), 'sem quebra de linha/stack')
        assert(Number(row.last_error_at) >= antes && Number(row.last_error_at) <= Date.now())
    })

    await test('falha ao gravar a métrica não impede a resposta ao usuário', async () => {
        const original = analyticsRepo.recordCommandFailure
        analyticsRepo.recordCommandFailure = () => { throw new Error('disco cheio simulado') }
        try {
            const replies = []
            const r = await dispatcher.dispatch(ctxDono('explodeteste', replies))
            assert.strictEqual(r, true)
            assert(replies[0] && replies[0].includes('Algo deu errado'))
        } finally {
            analyticsRepo.recordCommandFailure = original
        }
        assert.strictEqual(Number(linha('explodeteste').error_count), 2, 'não gravou nada extra')
    })

    await test('sucesso continua indo para execution_count sem mexer em error_count', async () => {
        dispatcher.commands.set('okteste', { name: 'okteste', category: 'dev', execute: async ({ reply }) => reply('ok') })
        await dispatcher.dispatch(ctxDono('okteste', []))
        const row = linha('okteste')
        assert.strictEqual(Number(row.execution_count), 1)
        assert.strictEqual(Number(row.error_count || 0), 0)
    })

    console.log('\n--- 3. Comando .falhas ---')
    await test('.falhas tem schema de dono', () => {
        assert.strictEqual(falhasCmd.name, 'falhas')
        assert.strictEqual(falhasCmd.ownerOnly, true)
        assert.strictEqual(falhasCmd.category, 'owner')
    })

    await test('.falhas lista o comando que falhou, com contagem e erro resumido', async () => {
        analyticsRepo.recordCommandFailure('outroteste', 'geral', new Error('timeout falso'), Date.now() - 3 * 3600 * 1000)
        const replies = []
        await falhasCmd.execute({ reply: async t => replies.push(t), args: [], prefix: '.' })
        const txt = replies[0]
        assert(txt.includes('`.explodeteste` com 2 falhas'), txt)
        assert(txt.includes('`.outroteste`') && txt.includes('há 3 h'), txt)
        assert(txt.includes('`TypeError: deu ruim de propósito'), txt)
        assert(!CAIXA.test(txt), 'sem moldura')
        assert((txt.match(EMOJI) || []).length <= 1, 'no máximo 1 emoji')
        assert(/^\p{Extended_Pictographic}/u.test(txt), 'emoji no início')
        for (const l of txt.split('\n')) {
            const semCodigo = l.replace(/`[^`]*`/g, '')
            assert(!/\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{5,}\b/.test(semCodigo), `caixa alta: ${l}`)
        }
        // recente primeiro na lista de recentes
        const recentes = txt.split('*As mais recentes*')[1]
        assert(recentes.indexOf('.explodeteste') < recentes.indexOf('.outroteste'), recentes)
    })

    console.log('\n--- 4. Logger em arquivo ---')
    await test('em NODE_ENV=test o logger não grava em logs/', async () => {
        assert.strictEqual(logger.fileState().enabled, false)
        const hoje = path.join(__dirname, '..', 'logs', `bot-${new Date().toISOString().slice(0, 10)}.log`)
        const antes = fs.existsSync(hoje) ? fs.statSync(hoje).size : -1
        logger.warn('[FALHAS TEST] aviso que não pode ir para o disco')
        logger.error('[FALHAS TEST] erro que não pode ir para o disco', new Error('x'))
        await new Promise(r => setTimeout(r, 50))
        const depois = fs.existsSync(hoje) ? fs.statSync(hoje).size : -1
        assert.strictEqual(depois, antes)
    })

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'falhas-logs-'))
    await test('sink grava WARN/ERROR e ignora INFO com nível padrão', async () => {
        const sink = logger.createFileSink({ dir: tmp, clock: () => new Date('2026-09-15T12:00:00Z') })
        sink.write('info', 'linha info')
        sink.write('warn', 'linha warn')
        sink.write('error', 'linha error')
        await sink.close()
        const conteudo = fs.readFileSync(path.join(tmp, 'bot-2026-09-15.log'), 'utf8')
        assert(conteudo.includes('linha warn') && conteudo.includes('linha error'))
        assert(!conteudo.includes('linha info'))
    })

    await test('rotação mantém 7 dias e apaga os mais antigos', async () => {
        const dias = ['2026-09-01', '2026-09-08', '2026-09-09', '2026-09-14']
        for (const d of dias) fs.writeFileSync(path.join(tmp, `bot-${d}.log`), 'antigo\n')
        fs.writeFileSync(path.join(tmp, 'outro-arquivo.txt'), 'não é log')
        const sink = logger.createFileSink({ dir: tmp, clock: () => new Date('2026-09-15T12:00:00Z') })
        const removidos = await sink.limparAntigos()
        await sink.close()
        assert.deepStrictEqual(removidos.sort(), ['bot-2026-09-01.log', 'bot-2026-09-08.log'])
        const restam = fs.readdirSync(tmp).sort()
        assert(restam.includes('bot-2026-09-09.log') && restam.includes('bot-2026-09-14.log') && restam.includes('outro-arquivo.txt'))
    })

    await test('virada de dia troca de arquivo', async () => {
        let agora = new Date('2026-09-20T23:59:59Z')
        const sink = logger.createFileSink({ dir: tmp, clock: () => agora })
        sink.write('warn', 'antes da meia-noite')
        agora = new Date('2026-09-21T00:00:01Z')
        sink.write('warn', 'depois da meia-noite')
        await sink.close()
        await new Promise(r => setTimeout(r, 30))
        assert(fs.readFileSync(path.join(tmp, 'bot-2026-09-20.log'), 'utf8').includes('antes da meia-noite'))
        assert(fs.readFileSync(path.join(tmp, 'bot-2026-09-21.log'), 'utf8').includes('depois da meia-noite'))
    })

    await test('disco com falha não lança: vira só console', async () => {
        const naoPasta = path.join(tmp, 'sou-um-arquivo')
        fs.writeFileSync(naoPasta, 'x')
        const sink = logger.createFileSink({ dir: path.join(naoPasta, 'logs') })
        const warnOriginal = console.warn
        let avisos = 0
        console.warn = () => { avisos++ }
        try {
            sink.write('error', 'um')
            sink.write('error', 'dois')
        } finally {
            console.warn = warnOriginal
        }
        assert.strictEqual(sink.broken, true)
        assert.strictEqual(avisos, 1, 'avisa uma vez só')
        await sink.close()
    })
    fs.rmSync(tmp, { recursive: true, force: true })

    closeDatabase()
    for (const f of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
        if (fs.existsSync(f)) fs.unlinkSync(f)
    }

    console.log(`\n📊 falhas: ${pass} passaram, ${fail} falharam`)
    process.exit(fail ? 1 : 0)
}

main().catch(err => {
    console.error('Erro fatal na suíte de falhas:', err)
    process.exit(1)
})
