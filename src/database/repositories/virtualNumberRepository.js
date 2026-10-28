/**
 * Repositório SQLite para gerenciamento de Números Virtuais e Ativações SMS
 */

const { q, getDatabase } = require('../connection');
const logger = require('../../core/logger');

function createOrder(data) {
    const db = getDatabase();
    const stmt = q(`
        INSERT INTO virtual_numbers (
            user_jid, activation_id, phone_number, ddd, country_code,
            region_name, service, cost_credits, is_owner, status,
            sms_code, created_at, expires_at
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?
        )
    `);

    const info = stmt.run(
        data.userJid,
        data.activationId,
        data.phoneNumber,
        data.ddd,
        data.countryCode || '55',
        data.regionName || '',
        data.service || 'wa',
        Number(data.costCredits || 0),
        data.isOwner ? 1 : 0,
        data.status || 'PENDING',
        data.smsCode || null,
        data.createdAt || Date.now(),
        data.expiresAt || (Date.now() + 15 * 60 * 1000)
    );

    return getOrderById(info.lastInsertRowid);
}

function getOrderById(id) {
    const db = getDatabase();
    return q('SELECT * FROM virtual_numbers WHERE id = ?').get(id) || null;
}

function getOrderByActivationId(activationId) {
    const db = getDatabase();
    return q('SELECT * FROM virtual_numbers WHERE activation_id = ?').get(activationId) || null;
}

function getActiveOrderByUser(userJid) {
    const db = getDatabase();
    return q(`
        SELECT * FROM virtual_numbers 
        WHERE user_jid = ? AND status IN ('PENDING', 'RECEIVED')
        ORDER BY created_at DESC 
        LIMIT 1
    `).get(userJid) || null;
}

function updateStatus(id, { status, smsCode }) {
    const db = getDatabase();
    const updates = [];
    const params = [];

    if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
    }
    if (smsCode !== undefined) {
        updates.push('sms_code = ?');
        params.push(smsCode);
    }

    if (!updates.length) return false;

    params.push(id);
    const sql = `UPDATE virtual_numbers SET ${updates.join(', ')} WHERE id = ?`;
    return db.prepare(sql).run(...params).changes > 0;
}

function getPendingOrders() {
    const db = getDatabase();
    return q("SELECT * FROM virtual_numbers WHERE status = 'PENDING'").all() || [];
}

function listOrdersByUser(userJid, limit = 10) {
    const db = getDatabase();
    return q(`
        SELECT * FROM virtual_numbers 
        WHERE user_jid = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    `).all(userJid, limit) || [];
}

module.exports = {
    createOrder,
    getOrderById,
    getOrderByActivationId,
    getActiveOrderByUser,
    updateStatus,
    getPendingOrders,
    listOrdersByUser
};
