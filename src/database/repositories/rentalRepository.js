/**
 * Rental Repository (SQLite WAL)
 * Gerencia a persistência de aluguéis de grupos com prazos e status
 */

const { q, getDatabase } = require('../connection')
const logger = require('../../core/logger')

function rowToRental(row) {
    if (!row) return null
    const jid = row.group_jid || ''
    const defaultType = jid.endsWith('@g.us') ? 'group' : 'pv'
    return {
        groupJid: jid,
        targetJid: jid,
        targetType: row.target_type || defaultType,
        isTrial: Boolean(row.is_trial),
        isLifetime: Boolean(row.is_lifetime),
        groupName: row.group_name || '',
        targetName: row.group_name || '',
        renterJid: row.renter_jid || '',
        rentedBy: row.rented_by || '',
        startsAt: Number(row.starts_at),
        expiresAt: Number(row.expires_at),
        isActive: Boolean(row.is_active),
        price: Number(row.price || 0),
        paymentMethod: row.payment_method || 'Pix',
        pixKey: row.pix_key || '',
        notes: row.notes || '',
        warned24h: Boolean(row.warned_24h),
        warned1h: Boolean(row.warned_1h),
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }
}

function getRental(targetJid, alternativeJids = []) {
    try {
        const db = getDatabase()
        const candidates = [targetJid, ...(Array.isArray(alternativeJids) ? alternativeJids : [alternativeJids])].filter(Boolean)
        if (candidates.length === 0) return null

        const placeholders = candidates.map(() => '?').join(',')
        const row = db.prepare(`SELECT * FROM rentals WHERE group_jid IN (${placeholders}) ORDER BY expires_at DESC LIMIT 1`).get(...candidates)
        return rowToRental(row)
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao buscar aluguel:', err)
        return null
    }
}

function getAllRentals(targetType = null) {
    try {
        const db = getDatabase()
        let query = 'SELECT * FROM rentals'
        const params = []
        if (targetType) {
            query += ' WHERE target_type = ?'
            params.push(targetType)
        }
        query += ' ORDER BY expires_at ASC'
        const rows = db.prepare(query).all(...params)
        return rows.map(rowToRental)
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao listar aluguéis:', err)
        return []
    }
}

function saveRental(rental) {
    try {
        const db = getDatabase()
        const jid = rental.targetJid || rental.groupJid
        const targetType = rental.targetType || (jid.endsWith('@g.us') ? 'group' : 'pv')
        const isTrial = rental.isTrial ? 1 : 0
        const duration = rental.expiresAt - (rental.startsAt || Date.now())
        const isLifetime = (rental.isLifetime || duration >= 50 * 365 * 86400 * 1000) ? 1 : 0

        const stmt = q(`
            INSERT OR REPLACE INTO rentals (
                group_jid, group_name, renter_jid, rented_by,
                starts_at, expires_at, is_active, price,
                payment_method, pix_key, notes,
                target_type, is_trial, is_lifetime, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `)

        stmt.run(
            jid,
            rental.targetName || rental.groupName || '',
            rental.renterJid || '',
            rental.rentedBy || '',
            rental.startsAt || Date.now(),
            rental.expiresAt,
            rental.isActive !== false ? 1 : 0,
            rental.price || 0,
            rental.paymentMethod || 'Pix',
            rental.pixKey || '',
            rental.notes || '',
            targetType,
            isTrial,
            isLifetime
        )
        return true
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao salvar aluguel:', err)
        return false
    }
}

function deleteRental(targetJid) {
    try {
        const db = getDatabase()
        q('DELETE FROM rentals WHERE group_jid = ?').run(targetJid)
        return true
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao deletar aluguel:', err)
        return false
    }
}

function hasUsedTrial(targetJid, alternativeJids = []) {
    try {
        const db = getDatabase()
        const candidates = [targetJid, ...(Array.isArray(alternativeJids) ? alternativeJids : [alternativeJids])].filter(Boolean)
        if (candidates.length === 0) return false

        const placeholders = candidates.map(() => '?').join(',')
        const row = db.prepare(`SELECT 1 FROM rental_trials WHERE target_jid IN (${placeholders}) LIMIT 1`).get(...candidates)
        return Boolean(row)
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao verificar trial:', err)
        return false
    }
}

function markTrialUsed(targetJid, targetType = 'group') {
    try {
        const db = getDatabase()
        q(`
            INSERT OR IGNORE INTO rental_trials (target_jid, target_type, used_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        `).run(targetJid, targetType)
        return true
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao registrar trial:', err)
        return false
    }
}

function setRentalWarning(groupJid, warningType) {
    try {
        const db = getDatabase()
        const col = warningType === '24h' ? 'warned_24h' : (warningType === '1h' ? 'warned_1h' : null)
        if (!col) return false
        db.prepare(`UPDATE rentals SET ${col} = 1, updated_at = CURRENT_TIMESTAMP WHERE group_jid = ?`).run(groupJid)
        return true
    } catch (err) {
        logger.error(`[RENTAL REPO ERROR] Falha ao atualizar aviso ${warningType} de ${groupJid}:`, err)
        return false
    }
}

function getActiveNonLifetimeRentals() {
    try {
        const db = getDatabase()
        const rows = q(`
            SELECT * FROM rentals
            WHERE is_active = 1 AND is_lifetime = 0
            ORDER BY expires_at ASC
        `).all()
        return rows.map(rowToRental)
    } catch (err) {
        logger.error('[RENTAL REPO ERROR] Falha ao listar aluguéis ativos:', err)
        return []
    }
}

module.exports = {
    getRental,
    getAllRentals,
    saveRental,
    deleteRental,
    hasUsedTrial,
    markTrialUsed,
    setRentalWarning,
    getActiveNonLifetimeRentals,
    rowToRental
}

