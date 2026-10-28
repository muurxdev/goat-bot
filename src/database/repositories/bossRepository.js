const { q, getDatabase } = require('../connection')

function rowToBossFight(row) {
    if (!row) return null
    return {
        id: row.boss_id,
        dono: row.dono,
        nome: row.nome,
        tipo: row.tipo,
        raridade: row.raridade,
        vida: Number(row.vida),
        vidaMax: Number(row.vida_max),
        multiplicador: Number(row.multiplicador || 1.0),
        efeito: row.efeito,
        ativo: Boolean(row.ativo),
        dano: JSON.parse(row.dano_map || '{}'),
        loot: JSON.parse(row.loot_list || '[]')
    }
}

function getBossFight(idLuta) {
    const db = getDatabase()
    const row = q('SELECT * FROM boss_fights WHERE id = ?').get(idLuta)
    return row ? rowToBossFight(row) : null
}

function saveBossFight(idLuta, fight) {
    const db = getDatabase()
    const stmt = q(`
        INSERT OR REPLACE INTO boss_fights (
            id, dono, boss_id, nome, tipo, raridade,
            vida, vida_max, multiplicador, efeito, ativo, dano_map, loot_list
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
        idLuta,
        fight.dono || '',
        fight.id || '',
        fight.nome || '',
        fight.tipo || '',
        fight.raridade || '⚪ COMUM',
        fight.vida || 0,
        fight.vidaMax || fight.vida || 0,
        fight.multiplicador || 1.0,
        fight.efeito || 'normal',
        fight.ativo !== false ? 1 : 0,
        JSON.stringify(fight.dano || {}),
        JSON.stringify(fight.loot || [])
    )
}

function deleteBossFight(idLuta) {
    const db = getDatabase()
    q('DELETE FROM boss_fights WHERE id = ?').run(idLuta)
}

function getAllBossFights() {
    const db = getDatabase()
    const rows = q('SELECT * FROM boss_fights WHERE ativo = 1 AND vida > 0').all()
    const lutas = {}
    for (const row of rows) {
        lutas[row.id] = rowToBossFight(row)
    }
    return { lutas }
}

module.exports = {
    getBossFight,
    saveBossFight,
    deleteBossFight,
    getAllBossFights,
    rowToBossFight
}

