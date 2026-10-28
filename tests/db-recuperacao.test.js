process.env.NODE_ENV = 'test'

/**
 * Recuperação do SQLite: nunca descarta dados em silêncio.
 * - arquivo corrompido + backup válido  → restaura e guarda cópia do corrompido (com WAL)
 * - arquivo corrompido sem backup       → ERRO e o arquivo fica intacto (nada de banco vazio)
 * - falha que NÃO é corrupção           → o erro sobe e nada é movido
 * - reinícios em loop não enchem o disco com cópias iguais
 */

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { DatabaseSync } = require('node:sqlite')
const { getDatabase, closeDatabase, ehCorrupcao } = require('../src/database/connection')

let ok = 0, falhou = 0
async function teste(nome, fn) {
    try { await fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

function pastaTemporaria() {
    const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'goat-db-'))
    fs.mkdirSync(path.join(raiz, 'data'))
    fs.mkdirSync(path.join(raiz, 'backups'))
    return raiz
}

/** Cria um banco válido (com as migrations do bot) e uma linha-sentinela. */
function criarBancoValido(arquivo, sentinela) {
    const db = getDatabase(arquivo)
    db.exec('CREATE TABLE IF NOT EXISTS sentinela (v TEXT)')
    db.prepare('INSERT INTO sentinela (v) VALUES (?)').run(sentinela)
    closeDatabase()
}

async function main() {
    console.log('\n🧪 Recuperação segura do SQLite...\n')

    await teste('ehCorrupcao: só reconhece corrupção de verdade (inclusive códigos estendidos)', () => {
        assert.strictEqual(ehCorrupcao({ errcode: 11 }), true)
        assert.strictEqual(ehCorrupcao({ errcode: 26 }), true)
        assert.strictEqual(ehCorrupcao({ errcode: 267 }), true, 'SQLITE_CORRUPT_VTAB (267) = 11 | 1<<8')
        assert.strictEqual(ehCorrupcao({ message: 'database disk image is malformed' }), true)
        assert.strictEqual(ehCorrupcao({ message: 'file is not a database' }), true)
        assert.strictEqual(ehCorrupcao({ errcode: 14, message: 'unable to open database file' }), false)
        assert.strictEqual(ehCorrupcao({ errcode: 5, message: 'database is locked' }), false)
        assert.strictEqual(ehCorrupcao({ errcode: 13, message: 'database or disk is full' }), false)
        assert.strictEqual(ehCorrupcao(new Error('erro qualquer de migration')), false)
        assert.strictEqual(ehCorrupcao(null), false)
    })

    await teste('corrompido + backup válido: restaura, e a cópia do corrompido fica guardada', async () => {
        const raiz = pastaTemporaria()
        const alvo = path.join(raiz, 'data', 'database.sqlite')
        criarBancoValido(path.join(raiz, 'backups', 'meliodas_backup_1.sqlite'), 'do-backup')
        fs.writeFileSync(alvo, Buffer.from('isto não é um banco sqlite, é lixo'.repeat(40)))
        fs.writeFileSync(alvo + '-wal', Buffer.from('wal com transações que não podem sumir'))

        const db = getDatabase(alvo)
        const linha = db.prepare('SELECT v FROM sentinela').get()
        closeDatabase()

        assert.strictEqual(linha.v, 'do-backup', 'não restaurou o backup')
        const quarentena = path.join(raiz, 'data', 'corrupted')
        const copias = fs.readdirSync(quarentena)
        assert.ok(copias.length === 1, 'não guardou a cópia do banco corrompido')
        const arquivos = fs.readdirSync(path.join(quarentena, copias[0]))
        assert.ok(arquivos.some(a => a.endsWith('-wal')), 'o WAL não foi preservado')
    })

    await teste('corrompido SEM backup: dá erro e o arquivo continua intacto (não sobe vazio)', async () => {
        const raiz = pastaTemporaria()
        const alvo = path.join(raiz, 'data', 'database.sqlite')
        const lixo = Buffer.from('lixo sem backup para restaurar'.repeat(50))
        fs.writeFileSync(alvo, lixo)

        assert.throws(() => getDatabase(alvo), /backup válido|corrompid/i)
        closeDatabase()
        assert.ok(fs.existsSync(alvo), 'o arquivo sumiu')
        assert.ok(fs.readFileSync(alvo).equals(lixo), 'o arquivo foi alterado ou trocado por um banco novo')
    })

    await teste('reiniciar em loop não multiplica a cópia do mesmo banco corrompido', async () => {
        const raiz = pastaTemporaria()
        const alvo = path.join(raiz, 'data', 'database.sqlite')
        fs.writeFileSync(alvo, Buffer.from('lixo repetido a cada restart'.repeat(60)))

        for (let i = 0; i < 4; i++) {
            assert.throws(() => getDatabase(alvo), /backup válido/i)
            closeDatabase()
        }
        const copias = fs.readdirSync(path.join(raiz, 'data', 'corrupted'))
        assert.strictEqual(copias.length, 1, `guardou ${copias.length} cópias idênticas`)
    })

    await teste('falha que não é corrupção (caminho é uma pasta): o erro sobe e nada é movido', async () => {
        const raiz = pastaTemporaria()
        const comoPasta = path.join(raiz, 'data', 'banco-que-e-pasta')
        fs.mkdirSync(comoPasta)

        assert.throws(() => getDatabase(comoPasta))
        closeDatabase()
        assert.ok(fs.statSync(comoPasta).isDirectory(), 'a pasta foi movida')
        assert.ok(!fs.existsSync(path.join(raiz, 'data', 'corrupted')), 'tratou falha comum como corrupção')
    })

    await teste('banco SAUDÁVEL cuja migration falha NÃO é movido (o bug que jogava 9 bancos bons fora)', async () => {
        const raiz = pastaTemporaria()
        const alvo = path.join(raiz, 'data', 'database.sqlite')
        // `users` incompatível com a migration 001 (sem a coluna `level`): o arquivo é um SQLite
        // perfeito e a migration falha. O código antigo tratava isso como "corrompido", renomeava o
        // arquivo e subia um banco vazio.
        const db = new DatabaseSync(alvo)
        db.exec('CREATE TABLE users (id TEXT PRIMARY KEY); INSERT INTO users VALUES (\'x\')')
        db.close()

        assert.throws(() => getDatabase(alvo), /level/i, 'a falha da migration deveria subir como erro')
        closeDatabase()
        assert.ok(fs.existsSync(alvo), 'o banco saudável sumiu')
        const depois = new DatabaseSync(alvo)
        try { assert.strictEqual(depois.prepare('SELECT id FROM users').get().id, 'x', 'a linha original sumiu') } finally { depois.close() }
        assert.ok(!fs.existsSync(path.join(raiz, 'data', 'corrupted')), 'banco saudável foi para a quarentena')
    })

    await teste('banco saudável abre normalmente e mantém as linhas que já tinha', async () => {
        const raiz = pastaTemporaria()
        const alvo = path.join(raiz, 'data', 'database.sqlite')
        const db = new DatabaseSync(alvo)
        db.exec('CREATE TABLE fixture_saudavel (id TEXT PRIMARY KEY); INSERT INTO fixture_saudavel VALUES (\'x\')')
        db.close()

        const aberto = getDatabase(alvo)
        assert.strictEqual(aberto.prepare('SELECT count(*) c FROM fixture_saudavel').get().c, 1, 'perdeu a linha original')
        closeDatabase()
        assert.ok(!fs.existsSync(path.join(raiz, 'data', 'corrupted')), 'banco saudável foi para a quarentena')
    })

    console.log(`\n📊 Recuperação do SQLite: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou > 0 ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
