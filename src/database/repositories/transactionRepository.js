/**
 * Transaction Repository (SQLite)
 * Persistência e consulta do extrato e histórico financeiro dos usuários
 */

const { q, getDatabase } = require('../connection');

/**
 * Registra uma transação financeira
 * @param {object} param0
 * @param {string} param0.userJid - JID do usuário
 * @param {string} [param0.targetJid] - JID do destinatário/alvo
 * @param {string} param0.type - Tipo da transação (PIX, APOSTA, LOJA, DAILY, ROUBO, FORJA, etc.)
 * @param {number} param0.amount - Valor da transação (positivo ou negativo)
 * @param {number} [param0.balanceAfter] - Saldo restante após a transação
 * @param {string} [param0.description] - Descrição amigável
 * @returns {object}
 */
function recordTransaction({ userJid, targetJid = null, type, amount, balanceAfter = null, description = '' }) {
    const db = getDatabase();
    const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const stmt = q(`
        INSERT INTO transactions (id, user_jid, target_jid, type, amount, balance_after, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userJid, targetJid, type.toUpperCase(), amount, balanceAfter, description);
    return { id, userJid, targetJid, type, amount, balanceAfter, description };
}

/**
 * Obtém o histórico de transações de um usuário
 * @param {string} userJid
 * @param {number} limit
 * @returns {Array<object>}
 */
function getUserTransactions(userJid, limit = 10) {
    const db = getDatabase();
    return q(`
        SELECT * FROM transactions 
        WHERE user_jid = ? OR target_jid = ?
        ORDER BY created_at DESC 
        LIMIT ?
    `).all(userJid, userJid, limit);
}

/**
 * Limpa transações antigas (manutenção)
 */
function cleanupOldTransactions(days = 30) {
    const db = getDatabase();
    return q(`
        DELETE FROM transactions 
        WHERE created_at < datetime('now', '-' || ? || ' days')
    `).run(days);
}

module.exports = {
    recordTransaction,
    getUserTransactions,
    cleanupOldTransactions
};

