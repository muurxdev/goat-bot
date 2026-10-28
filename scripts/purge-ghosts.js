/**
 * Purga usuários-fantasma: linhas sem QUALQUER progresso
 * (xp=0, messages=0, coins=0, level<=1) que também não têm cargo, confiança,
 * itens, transações, títulos, nem são donos. Elas reaparecem sozinhas na
 * próxima mensagem (saveUser cria a linha), então apagar é seguro e reversível.
 *
 * Uso: node scripts/purge-ghosts.js [--dry]
 */

require('dotenv').config()
const { getDatabase } = require('../src/database/connection')
const ownerService = require('../src/services/ownerService')
const env = require('../src/config/env')

const dry = process.argv.includes('--dry')
const db = getDatabase()

// Conjunto de JIDs protegidos (nunca apagar)
const protectedJids = new Set()
for (const o of ownerService.getOwners()) {
    if (o.jid) protectedJids.add(o.jid.replace(/\D/g, ''))
}
for (const t of ['user_roles', 'trust_list']) {
    try {
        for (const r of db.prepare(`SELECT jid FROM ${t}`).all()) {
            if (r.jid) protectedJids.add(r.jid.replace(/\D/g, ''))
        }
    } catch (_) {}
}

const ghosts = db.prepare(`
    SELECT jid FROM users
    WHERE xp = 0 AND messages = 0 AND coins = 0 AND level <= 1
      AND COALESCE(bank,0) = 0 AND COALESCE(vault_coins,0) = 0
      AND (inventario IS NULL OR inventario IN ('[]', '', 'null'))
      AND jid NOT IN (SELECT user_jid FROM transactions)
      AND jid NOT IN (SELECT user_jid FROM user_titles)
      AND jid NOT IN (SELECT user_jid FROM vault_items)
`).all()

let deleted = 0, skipped = 0
const del = db.prepare('DELETE FROM users WHERE jid = ?')
for (const { jid } of ghosts) {
    const digits = jid.replace(/\D/g, '')
    if (protectedJids.has(digits) || env.isOwnerJid(jid)) { skipped++; continue }
    if (!dry) del.run(jid)
    deleted++
}

const total = db.prepare('SELECT COUNT(*) c FROM users').get().c
console.log(`${dry ? '[DRY] ' : ''}fantasmas ${dry ? 'seriam apagados' : 'apagados'}: ${deleted} | protegidos preservados: ${skipped} | total de usuários agora: ${dry ? total : total}`)
