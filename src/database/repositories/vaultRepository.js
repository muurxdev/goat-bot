/**
 * Vault (Baú Global) Repository
 * Gerenciamento de itens e moedas armazenados com segurança no SQLite
 */

const { q, getDatabase } = require('../connection');
const logger = require('../../core/logger');

function getVaultItems(userJid) {
    if (!userJid) return [];
    try {
        const db = getDatabase();
        const rows = q(`
            SELECT id, item_id, item_name, quantity, item_type, metadata, created_at
            FROM vault_items
            WHERE user_jid = ?
            ORDER BY created_at DESC
        `).all(userJid);

        return rows.map(r => ({
            ...r,
            metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata || '{}') : (r.metadata || {})
        }));
    } catch (err) {
        logger.error(`[VAULT REPO ERROR] Falha ao obter itens do baú para ${userJid}:`, err);
        return [];
    }
}

function addVaultItem(userJid, item, quantity = 1, metadataOverride = null) {
    if (!userJid || !item) return false;
    try {
        const db = getDatabase();
        const itemId = typeof item === 'string' ? item : (item.id || item.nome || 'item');
        const itemName = typeof item === 'string' ? item : (item.nome || item.name || itemId);
        const itemType = typeof item === 'object' ? (item.tipo || item.slot || 'equipment') : 'loot';
        const metadata = metadataOverride || (typeof item === 'object' ? JSON.stringify(item) : '{}');

        const existing = q(`
            SELECT id, quantity FROM vault_items WHERE user_jid = ? AND item_id = ?
        `).get(userJid, itemId);

        if (existing) {
            q(`
                UPDATE vault_items
                SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(quantity, existing.id);
        } else {
            const id = `vault_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            q(`
                INSERT INTO vault_items (id, user_jid, item_id, item_name, quantity, item_type, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(id, userJid, itemId, itemName, quantity, itemType, metadata);
        }
        return true;
    } catch (err) {
        logger.error(`[VAULT REPO ERROR] Falha ao adicionar item ao baú:`, err);
        return false;
    }
}

function removeVaultItem(userJid, itemId, quantity = 1) {
    if (!userJid || !itemId) return false;
    try {
        const db = getDatabase();
        const existing = q(`
            SELECT id, quantity, item_name, metadata FROM vault_items WHERE user_jid = ? AND (item_id = ? OR item_name = ?)
        `).get(userJid, itemId, itemId);

        if (!existing || existing.quantity < quantity) return false;

        if (existing.quantity === quantity) {
            q(`DELETE FROM vault_items WHERE id = ?`).run(existing.id);
        } else {
            q(`
                UPDATE vault_items
                SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(quantity, existing.id);
        }
        return true;
    } catch (err) {
        logger.error(`[VAULT REPO ERROR] Falha ao remover item do baú:`, err);
        return false;
    }
}

function getVaultCoins(userJid) {
    if (!userJid) return 0;
    try {
        const db = getDatabase();
        const row = q(`SELECT vault_coins FROM users WHERE jid = ?`).get(userJid);
        return row?.vault_coins || 0;
    } catch (e) {
        const logger = require('../../core/logger');
        logger.warn(`[VAULT] getVaultCoins falhou para ${userJid}: ${e.message}`);
        return 0;
    }
}

function depositVaultCoins(userJid, amount) {
    const qty = Number(amount);
    if (!userJid || isNaN(qty) || qty <= 0) return false;
    try {
        const db = getDatabase();
        q(`
            INSERT INTO users (jid, vault_coins)
            VALUES (?, ?)
            ON CONFLICT(jid) DO UPDATE SET
                vault_coins = COALESCE(users.vault_coins, 0) + excluded.vault_coins,
                updated_at = CURRENT_TIMESTAMP
        `).run(userJid, qty);
        return true;
    } catch (err) {
        logger.error(`[VAULT REPO ERROR] Falha ao depositar coins no baú:`, err);
        return false;
    }
}

function withdrawVaultCoins(userJid, amount) {
    const qty = Number(amount);
    if (!userJid || isNaN(qty) || qty <= 0) return false;
    try {
        const db = getDatabase();
        const current = getVaultCoins(userJid);
        if (current < qty) return false;

        q(`
            UPDATE users
            SET vault_coins = vault_coins - ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE jid = ?
        `).run(qty, userJid);
        return true;
    } catch (err) {
        logger.error(`[VAULT REPO ERROR] Falha ao sacar coins do baú:`, err);
        return false;
    }
}

module.exports = {
    getVaultItems,
    addVaultItem,
    removeVaultItem,
    getVaultCoins,
    depositVaultCoins,
    withdrawVaultCoins
};
