/**
 * GOATBOT — Healthcheck Script
 * Executado pelo Docker ou monitoramento para verificar a saúde do processo e SQLite
 */

const path = require('path')
const { getDatabase } = require('../src/database/connection')

try {
    const db = getDatabase()
    const result = db.prepare('SELECT 1 as healthy').get()

    if (result && result.healthy === 1) {
        process.exit(0)
    } else {
        console.error('Healthcheck: Resposta inesperada do banco de dados.')
        process.exit(1)
    }
} catch (err) {
    console.error('Healthcheck Falhou:', err.message)
    process.exit(1)
}

