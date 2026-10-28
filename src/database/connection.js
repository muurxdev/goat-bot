const { DatabaseSync } = require('node:sqlite')
const path = require('path')
const fs = require('fs')
const { dataDir } = require('../config/paths')
const logger = require('../core/logger')

let dbInstance = null
// Caminho REAL do banco aberto. Quem precisa mexer no arquivo (backup/restore)
// tem que usar este valor — hardcodar 'data/database.sqlite' faz o restore
// sobrescrever o banco errado quando o path vem de DB_PATH ou do modo de teste.
let dbPathAtual = null

// Cache de prepared statements por SQL. node:sqlite não expõe .transaction()
// e getDatabase() é lazy, então não dá para preparar em escopo de módulo.
// Memoizar por string de SQL evita recompilar o mesmo statement a cada chamada.
const _stmtCache = new Map()

function q(sql) {
    let stmt = _stmtCache.get(sql)
    if (!stmt) {
        stmt = getDatabase().prepare(sql)
        _stmtCache.set(sql, stmt)
    }
    return stmt
}

/**
 * Só isto é "banco corrompido": SQLITE_CORRUPT (11) e SQLITE_NOTADB (26), inclusive os códigos
 * estendidos (267, 523, 779...: o código base fica nos 8 bits de baixo). Disco cheio, arquivo
 * travado, caminho inválido ou erro de migration NÃO são — mover o banco por causa deles foi o que
 * jogou fora 9 bancos íntegros (todos passam no quick_check). A mensagem entra como reserva para
 * runtimes que não expõem `errcode`.
 */
function ehCorrupcao(err) {
    if (!err) return false
    if (err.ehCorrupcao === true) return true
    if (typeof err.errcode === 'number') {
        const base = err.errcode & 0xff
        if (base === 11 || base === 26) return true
    }
    return /SQLITE_CORRUPT|SQLITE_NOTADB|file is not a database|database disk image is malformed/i
        .test(String(err.message || ''))
}

/** Pasta dos backups: BACKUP_DIR (a mesma do backupService) ou, por padrão, <raiz>/backups ao lado de data/. */
function pastaBackupsDe(targetPath) {
    return process.env.BACKUP_DIR
        ? path.resolve(process.env.BACKUP_DIR)
        : path.join(path.dirname(targetPath), '..', 'backups')
}

/**
 * Copia (sem apagar nada) o banco, o -wal e o -shm para <pasta do banco>/corrupted/<ts>/.
 * Se o mesmo estado já foi guardado (mesmo tamanho e data), reaproveita: o Docker reinicia o
 * processo em loop e cada volta não pode somar outra cópia no disco pequeno da VPS.
 */
function guardarCopiaDoBanco(targetPath, sidecarsAntes = {}) {
    const base = path.join(path.dirname(targetPath), 'corrupted')
    const nome = path.basename(targetPath)
    const st = fs.existsSync(targetPath) ? fs.statSync(targetPath) : null
    // O -wal/-shm do disco, ou (se o SQLite já os apagou ao fechar a abertura que falhou) o que foi lido antes.
    const sufixos = ['-wal', '-shm'].filter(s => fs.existsSync(targetPath + s) || sidecarsAntes[s])
    const assinatura = [
        st ? `db:${st.size}:${Math.floor(st.mtimeMs)}` : 'db:ausente',
        ...sufixos.map(s => `${s}:${fs.existsSync(targetPath + s) ? fs.statSync(targetPath + s).size : sidecarsAntes[s].length}`),
    ].join('|')

    if (fs.existsSync(base)) {
        for (const pasta of fs.readdirSync(base)) {
            const marca = path.join(base, pasta, '.assinatura')
            try {
                if (fs.existsSync(marca) && fs.readFileSync(marca, 'utf8') === assinatura) return path.join(base, pasta)
            } catch (e) {
                logger.warn(`[CONNECTION] Não consegui ler ${marca}: ${e.message}`)
            }
        }
    }

    const destino = path.join(base, String(Date.now()))
    fs.mkdirSync(destino, { recursive: true })
    if (st) fs.copyFileSync(targetPath, path.join(destino, nome))
    for (const s of sufixos) {
        if (fs.existsSync(targetPath + s)) fs.copyFileSync(targetPath + s, path.join(destino, nome + s))
        else fs.writeFileSync(path.join(destino, nome + s), sidecarsAntes[s])
    }
    fs.writeFileSync(path.join(destino, '.assinatura'), assinatura)
    return destino
}

/**
 * Lê o -wal e o -shm ANTES da primeira abertura. Ao fechar a conexão que falhou o SQLite pode apagar
 * o -wal sozinho, e é nele que ficam as últimas transações ainda não gravadas no arquivo principal.
 * Costuma ter poucos MB (o WAL é limpo em checkpoints); acima de 256 MB não vale guardar na memória.
 */
function lerSidecars(targetPath) {
    const lidos = {}
    for (const s of ['-wal', '-shm']) {
        try {
            const arquivo = targetPath + s
            if (!fs.existsSync(arquivo)) continue
            if (fs.statSync(arquivo).size > 256 * 1024 * 1024) {
                logger.warn(`[CONNECTION] ${path.basename(arquivo)} grande demais para guardar antes de abrir; será copiado do disco se ainda existir.`)
                continue
            }
            lidos[s] = fs.readFileSync(arquivo)
        } catch (e) {
            logger.warn(`[CONNECTION] Não consegui ler ${path.basename(targetPath)}${s} antes de abrir: ${e.message}`)
        }
    }
    return lidos
}

/** Backup mais novo que ABRE e passa no quick_check; null se nenhum serve. */
function acharBackupValido(targetPath) {
    const pasta = pastaBackupsDe(targetPath)
    if (!fs.existsSync(pasta)) return null
    const candidatos = fs.readdirSync(pasta)
        .filter(n => n.endsWith('.sqlite'))
        .map(n => ({ n, t: fs.statSync(path.join(pasta, n)).mtimeMs }))
        .sort((a, b) => b.t - a.t)
    for (const { n } of candidatos) {
        const arquivo = path.join(pasta, n)
        let db = null
        try {
            db = new DatabaseSync(arquivo)
            const r = db.prepare('PRAGMA quick_check;').get()
            if (r && r.quick_check === 'ok') return arquivo
        } catch (e) {
            logger.warn(`[CONNECTION] Backup ${n} descartado: ${e.message}`)
        } finally {
            try { if (db) db.close() } catch (e) { logger.warn(`[CONNECTION] Falha ao fechar ${n}: ${e.message}`) }
        }
    }
    return null
}

function getDatabase(dbPath = null) {
    if (dbInstance) return dbInstance

    // Banco SEPARADO durante os testes. Os testes já setavam NODE_ENV='test',
    // mas isto aqui ignorava: como getDatabase() cacheia a primeira instância e
    // os serviços a chamam sem argumento, a suíte inteira acabava escrevendo no
    // banco de PRODUÇÃO — foi assim que o __command_state__ encheu de escopos
    // de fixture (123@g.us, grupo@g.us...) e o estado real virou lixo.
    // DB_PATH permite apontar para outro arquivo explicitamente.
    const targetPath = dbPath
        || (process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : null)
        || path.join(dataDir, process.env.NODE_ENV === 'test' ? 'database.test.sqlite' : 'database.sqlite')

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }

    function initDb(filePath) {
        const db = new DatabaseSync(filePath)
        const origPrepare = db.prepare.bind(db)

        function normalizeVal(v) {
            if (typeof v === 'bigint') {
                if (v <= BigInt(Number.MAX_SAFE_INTEGER) && v >= BigInt(Number.MIN_SAFE_INTEGER)) {
                    return Number(v)
                }
                return v.toString()
            }
            return v
        }

        function normalizeRow(row) {
            if (!row || typeof row !== 'object') return row
            for (const k of Object.keys(row)) {
                row[k] = normalizeVal(row[k])
            }
            return row
        }

        db.prepare = function(sql) {
            const stmt = origPrepare(sql)
            stmt.setReadBigInts(true)
            const origGet = stmt.get.bind(stmt)
            const origAll = stmt.all.bind(stmt)
            const origIterate = stmt.iterate.bind(stmt)

            stmt.get = (...args) => normalizeRow(origGet(...args))
            stmt.all = (...args) => {
                const rows = origAll(...args)
                for (let i = 0; i < rows.length; i++) {
                    normalizeRow(rows[i])
                }
                return rows
            }
            stmt.iterate = function* (...args) {
                for (const r of origIterate(...args)) {
                    yield normalizeRow(r)
                }
            }
            return stmt
        }

        try {
            db.exec('PRAGMA journal_mode = WAL;')
            db.exec('PRAGMA synchronous = NORMAL;')
            db.exec('PRAGMA foreign_keys = ON;')
            db.exec('PRAGMA temp_store = MEMORY;')
            db.exec('PRAGMA cache_size = -32000;')   // ~32MB de cache de páginas
            db.exec('PRAGMA mmap_size = 268435456;') // 256MB de I/O mapeado em memória
            db.exec('PRAGMA busy_timeout = 5000;')   // espera locks em vez de falhar na hora

            // Quick integrity check
            const check = db.prepare('PRAGMA quick_check;').get()
            if (check && check.quick_check !== 'ok') {
                const erro = new Error('Integrity check failed: ' + JSON.stringify(check))
                erro.ehCorrupcao = true
                throw erro
            }

            const { runMigrations } = require('./migrator')
            runMigrations(db)
            return db
        } catch (err) {
            // Solta o arquivo antes de propagar: no Windows (e com o WAL aberto em qualquer SO) a
            // quarentena/restauração não consegue copiar nem apagar um arquivo que ainda está aberto.
            try { db.close() } catch (errFechar) { logger.warn(`[CONNECTION] Falha ao fechar o banco após erro: ${errFechar.message}`) }
            throw err
        }
    }

    // Antes de abrir: se a abertura falhar o SQLite pode apagar o -wal ao fechar, e ele guarda as últimas gravações.
    const sidecarsAntes = lerSidecars(targetPath)

    try {
        dbInstance = initDb(targetPath)
        dbPathAtual = targetPath
        logger.info(`💾 Conexão SQLite estabelecida com sucesso: ${targetPath}`)
        return dbInstance
    } catch (err) {
        _stmtCache.clear()
        dbInstance = null
        if (!ehCorrupcao(err)) {
            // Disco cheio, arquivo travado, bug de migration: NÃO é motivo para trocar o banco.
            logger.error(`❌ SQLite falhou, mas não é corrupção (${err.message}). Nada foi movido.`)
            throw err
        }

        logger.error(`⚠️ SQLite corrompido (${err.message}). Guardando cópia e tentando restaurar backup válido...`)
        const guardado = guardarCopiaDoBanco(targetPath, sidecarsAntes)
        logger.info(`📦 Cópia do banco corrompido (com WAL) guardada em ${guardado}`)

        const backup = acharBackupValido(targetPath)
        if (!backup) {
            const msg = `Banco corrompido e nenhum backup válido em ${pastaBackupsDe(targetPath)}. `
                + `A cópia está em ${guardado}. Não vou iniciar com banco vazio.`
            logger.error(`❌ ${msg}`)
            throw new Error(msg)
        }

        fs.copyFileSync(backup, targetPath)
        // O WAL antigo pertence ao arquivo corrompido (já guardado acima): aplicado ao backup, estragaria o restaurado.
        for (const sufixo of ['-wal', '-shm']) {
            try { fs.unlinkSync(targetPath + sufixo) } catch (e) { if (e.code !== 'ENOENT') logger.warn(`[CONNECTION] ${sufixo}: ${e.message}`) }
        }
        dbInstance = initDb(targetPath)
        dbPathAtual = targetPath
        logger.warn(`♻️ Banco restaurado do backup ${path.basename(backup)}. Dados posteriores ao backup estão na cópia guardada.`)
        return dbInstance
    }
}

function closeDatabase() {
    if (dbInstance) {
        try {
            _stmtCache.clear()
            dbInstance.close()
            dbInstance = null
            logger.info('💾 Conexão SQLite encerrada.')
        } catch (e) {
            logger.error('Erro ao fechar conexão SQLite:', e)
        }
    }
}

/** Caminho do arquivo de banco atualmente aberto (null se ainda não abriu). */
function getDatabasePath() {
    return dbPathAtual
}

module.exports = {
    getDatabase,
    getDatabasePath,
    closeDatabase,
    ehCorrupcao,
    q
}
