/**
 * Title Repository (SQLite)
 * Catálogo e gerenciamento de títulos honorários e condecorações de RPG
 */

const { q, getDatabase } = require('../connection');

const DEFAULT_TITLES = [
    { id: 'iniciante', name: '🗡️ O Desbravador Novato', rarity: 'Comum', bonus_atk: 25, bonus_def: 15, bonus_cp: 150, requirement: 'Chegar ao Nível 5' },
    { id: 'cacador_monstros', name: '🏹 Caçador de Criaturas', rarity: 'Incomum', bonus_atk: 60, bonus_def: 40, bonus_cp: 450, requirement: 'Vencer 10 Monstros em .explorar' },
    { id: 'destruidor_bosses', name: '🐉 Algoz dos Titãs', rarity: 'Raro', bonus_atk: 180, bonus_def: 120, bonus_cp: 1500, requirement: 'Derrotar 5 chefes em batalhas de grupo' },
    { id: 'mestre_forjador', name: '⚒️ Mestre das Forjas', rarity: 'Épico', bonus_atk: 350, bonus_def: 280, bonus_cp: 3500, requirement: 'Alcançar Forja Nível 5' },
    { id: 'senhor_pecados', name: '👑 Cavaleiro Sagrado Lendário', rarity: 'Lendário', bonus_atk: 750, bonus_def: 600, bonus_cp: 8000, requirement: 'Alcançar Nível 50' },
    { id: 'mandamento_supremo', name: '☠️ O Mandamento Supremo', rarity: 'Mítico', bonus_atk: 1500, bonus_def: 1200, bonus_cp: 18000, requirement: 'Alcançar Nível 100' },
    { id: 'deus_supremo', name: '🌟 A Divindade Transcendental', rarity: 'Divino', bonus_atk: 3000, bonus_def: 2500, bonus_cp: 35000, requirement: 'Alcançar a Reencarnação Suprema' }
];

/**
 * Inicializa os títulos padrão no banco
 */
function seedDefaultTitles() {
    const db = getDatabase();
    const insert = q(`
        INSERT OR REPLACE INTO titles (id, name, rarity, bonus_atk, bonus_def, bonus_cp, requirement)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of DEFAULT_TITLES) {
        insert.run(t.id, t.name, t.rarity, t.bonus_atk, t.bonus_def, t.bonus_cp, t.requirement);
    }
}

/**
 * Retorna todos os títulos do catálogo
 */
function getAllTitles() {
    const db = getDatabase();
    seedDefaultTitles();
    return q(`SELECT * FROM titles ORDER BY bonus_cp ASC`).all();
}

/**
 * Retorna um título por ID
 */
function getTitleById(id) {
    const db = getDatabase();
    return q(`SELECT * FROM titles WHERE id = ?`).get(id);
}

/**
 * Desbloqueia um título para um usuário
 */
function unlockUserTitle(userJid, titleId) {
    const db = getDatabase();
    const stmt = q(`
        INSERT OR IGNORE INTO user_titles (user_jid, title_id)
        VALUES (?, ?)
    `);
    return stmt.run(userJid, titleId);
}

/**
 * Retorna os títulos desbloqueados de um usuário
 */
function getUserTitles(userJid) {
    const db = getDatabase();
    seedDefaultTitles();
    return q(`
        SELECT t.*, ut.unlocked_at
        FROM titles t
        INNER JOIN user_titles ut ON t.id = ut.title_id
        WHERE ut.user_jid = ?
        ORDER BY t.bonus_cp DESC
    `).all(userJid);
}

module.exports = {
    seedDefaultTitles,
    getAllTitles,
    getTitleById,
    unlockUserTitle,
    getUserTitles
};

