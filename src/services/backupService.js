/**
 * SQLite Hot Backup & Disaster Recovery Service
 * Cria snapshots atômicos a quente, gerencia metadados, rotação e restauração de dados.
 */

const fs = require('fs')
const path = require('path')
const { getDatabase, closeDatabase, getDatabasePath } = require('../database/connection')
const { files } = require('../config/paths')
const logger = require('../core/logger')

// Os testes usam pasta própria: com a pasta real, a rotação (teto 3) da suíte
// apagava cópias de produção e o restore misturava snapshots de teste com os reais.
const BACKUP_DIR = process.env.BACKUP_DIR
    ? path.resolve(process.env.BACKUP_DIR)
    : path.resolve(__dirname, process.env.NODE_ENV === 'test' ? '../../backups-test' : '../../backups')

function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }
}

/**
 * Cria um snapshot a quente do banco de dados SQLite com metadados
 */
function createBackup(maxSnapshots = 7) {
    ensureBackupDir()

    const db = getDatabase()
    const timestamp = Date.now()
    const backupFileName = `bot_backup_${timestamp}.sqlite`
    const backupFilePath = path.join(BACKUP_DIR, backupFileName)
    const metaFilePath = path.join(BACKUP_DIR, `bot_backup_${timestamp}.meta.json`)

    try {
        // Executa VACUUM INTO para hot backup atômico e consistente
        db.exec(`VACUUM INTO '${backupFilePath}'`)

        const stats = fs.statSync(backupFilePath)

        // Coleta metadados operacionais
        let userCount = 0
        let scheduleCount = 0
        try {
            const uRow = db.prepare('SELECT COUNT(*) AS total FROM users').get()
            userCount = uRow ? uRow.total : 0
            const sRow = db.prepare('SELECT COUNT(*) AS total FROM bot_schedules').get()
            scheduleCount = sRow ? sRow.total : 0
        } catch (e) {
            logger.warn(`[BACKUP] ${backupFileName}: não consegui contar users/bot_schedules para os metadados: ${e.message}`)
        }

        const metadata = {
            filename: backupFileName,
            sizeKb: Math.round(stats.size / 1024),
            createdAt: new Date(timestamp).toISOString(),
            timestamp,
            stats: {
                users: userCount,
                schedules: scheduleCount
            }
        }

        fs.writeFileSync(metaFilePath, JSON.stringify(metadata, null, 2), 'utf8')
        logger.info(`[BACKUP] Snapshot criado com sucesso: ${backupFileName} (${metadata.sizeKb} KB)`)

        // Rotação de backups antigos
        rotateBackups(maxSnapshots)

        return metadata
    } catch (err) {
        logger.error(`[BACKUP ERROR] Falha ao criar snapshot SQLite:`, err)
        throw new Error(`Erro ao gerar backup: ${err.message}`)
    }
}

/**
 * Rotação automática de backups para preservar espaço em disco na VPS
 */
function rotateBackups(maxSnapshots = 7) {
    ensureBackupDir()

    const allFiles = fs.readdirSync(BACKUP_DIR)
    const sqliteFiles = allFiles
        .filter(f => (f.startsWith('meliodas_backup_') || f.startsWith('bot_backup_')) && f.endsWith('.sqlite'))
        .map(f => {
            const fullPath = path.join(BACKUP_DIR, f)
            return {
                filename: f,
                fullPath,
                mtime: fs.statSync(fullPath).mtimeMs
            }
        })
        .sort((a, b) => b.mtime - a.mtime)

    if (sqliteFiles.length > maxSnapshots) {
        const toDelete = sqliteFiles.slice(maxSnapshots)
        toDelete.forEach(item => {
            try {
                fs.unlinkSync(item.fullPath)
                const metaPath = item.fullPath.replace('.sqlite', '.meta.json')
                if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath)
                logger.info(`[BACKUP ROTATION] Backup antigo removido: ${item.filename}`)
            } catch (err) {
                logger.warn(`[BACKUP ROTATION] Falha ao remover ${item.filename}: ${err.message}`)
            }
        })
    }
}

/**
 * Lista todos os snapshots de backup disponíveis
 */
function listBackups() {
    ensureBackupDir()

    const allFiles = fs.readdirSync(BACKUP_DIR)
    const sqliteFiles = allFiles
        .filter(f => (f.startsWith('meliodas_backup_') || f.startsWith('bot_backup_')) && f.endsWith('.sqlite'))
        .map(f => {
            const fullPath = path.join(BACKUP_DIR, f)
            const stats = fs.statSync(fullPath)
            const metaPath = path.join(BACKUP_DIR, f.replace('.sqlite', '.meta.json'))

            let meta = null
            if (fs.existsSync(metaPath)) {
                try {
                    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
                } catch (e) {
                    logger.warn(`[BACKUP] listBackups: metadados ilegíveis em ${path.basename(metaPath)}: ${e.message}`)
                }
            }

            return {
                filename: f,
                sizeKb: Math.round(stats.size / 1024),
                createdAt: stats.mtime.toISOString(),
                metadata: meta
            }
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return sqliteFiles
}

/**
 * Resolve o nome digitado para um arquivo DENTRO da pasta de backups.
 * Só aceita nome de arquivo puro: "../", barras e caminhos absolutos são
 * recusados como "não encontrado", para ninguém apontar o restore para
 * qualquer arquivo do disco.
 * @returns {string} caminho absoluto do snapshot
 */
function resolverArquivoBackup(backupFileName) {
    const digitado = String(backupFileName || '').trim()
    const nome = path.basename(digitado)
    const naoEncontrado = () => new Error(`Arquivo de backup não encontrado: ${digitado}`)

    if (!nome || nome !== digitado || nome === '.' || nome === '..' || !nome.endsWith('.sqlite')) {
        throw naoEncontrado()
    }

    const pasta = path.resolve(BACKUP_DIR)
    const caminho = path.resolve(pasta, nome)
    if (!caminho.startsWith(pasta + path.sep)) throw naoEncontrado()
    if (!fs.existsSync(caminho) || !fs.statSync(caminho).isFile()) throw naoEncontrado()
    return caminho
}

/**
 * Restaura um snapshot específico de backup
 */
function restoreBackup(backupFileName) {
    ensureBackupDir()

    const backupFilePath = resolverArquivoBackup(backupFileName)
    const nomeBackup = path.basename(backupFilePath)

    // Usa o caminho do banco REALMENTE aberto. Antes files.database (sempre o
    // banco de produção) vinha primeiro e a suíte de testes sobrescrevia dados
    // reais. O caminho fixo só vale se nenhum banco foi aberto ainda.
    const activeDbPath = getDatabasePath()
        || files.database
        || path.resolve(__dirname, '../../data/database.sqlite')

    // 1. Fecha conexão SQLite para liberar handles de arquivo e flush
    closeDatabase()

    const preRestoreSafety = path.join(BACKUP_DIR, `pre_restore_safety_${Date.now()}.sqlite`)
    let copiaDeSeguranca = false
    let sobrescreveu = false

    try {
        // 2. Snapshot de segurança pré-restauração
        if (fs.existsSync(activeDbPath)) {
            fs.copyFileSync(activeDbPath, preRestoreSafety)
            copiaDeSeguranca = true
        }

        // 3. Remove arquivos WAL e SHM órfãos para evitar inconsistência
        const walPath = `${activeDbPath}-wal`
        const shmPath = `${activeDbPath}-shm`
        if (fs.existsSync(walPath)) {
            try { fs.unlinkSync(walPath) } catch (e) { logger.warn(`[BACKUP] restore: não consegui apagar ${walPath}: ${e.message}`) }
        }
        if (fs.existsSync(shmPath)) {
            try { fs.unlinkSync(shmPath) } catch (e) { logger.warn(`[BACKUP] restore: não consegui apagar ${shmPath}: ${e.message}`) }
        }

        // 4. Copia o snapshot restaurado
        sobrescreveu = true
        fs.copyFileSync(backupFilePath, activeDbPath)
    } catch (err) {
        logger.error(`[BACKUP RESTORE] Falha ao aplicar ${nomeBackup}; voltando o banco ao estado anterior`, err)
        if (sobrescreveu && copiaDeSeguranca) {
            try {
                fs.copyFileSync(preRestoreSafety, activeDbPath)
            } catch (e) {
                logger.error(`[BACKUP RESTORE] Não consegui recolocar o banco original a partir de ${path.basename(preRestoreSafety)}: ${e.message}`)
            }
        }
        // O bot não pode ficar sem banco aberto depois de uma falha.
        try {
            getDatabase(activeDbPath)
        } catch (e) {
            logger.error(`[BACKUP RESTORE] Não consegui reabrir o banco em ${activeDbPath}: ${e.message}`)
        }
        throw err
    }

    // 5. Reabre conexão limpa
    getDatabase(activeDbPath)
    logger.info(`[BACKUP RESTORE] Banco de dados restaurado a partir de ${nomeBackup}`)

    return {
        restoredFrom: nomeBackup,
        safetyBackup: path.basename(preRestoreSafety)
    }
}

module.exports = {
    createBackup,
    listBackups,
    restoreBackup,
    rotateBackups,
    BACKUP_DIR
}

