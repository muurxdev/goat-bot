/**
 * Fábrica das Insígnias do Reino (badge_trofeu_N). Cada arquivo em commands/profile/conquistas
 * só traz os dados que variam; texto, nome, alias e verificação de desbloqueio ficam aqui.
 */
const logger = require('../core/logger')
const M = require('./moldura')
const { getDatabase } = require('../database/connection')

function criarInsignia({ n, emoji, raridade }) {
    const id = `badge_trofeu_${n}`
    return {
        name: id,
        aliases: [`trofeu_${n}`],
        category: 'profile',
        subcategory: 'Insígnias do Reino',
        description: `Ficha da Insígnia #${n} [Grau: ${raridade}]`,
        cooldownMs: 2000,
        execute: async ({ reply, sender }) => {
            const db = getDatabase()
            const row = db.prepare('SELECT conquistas FROM users WHERE jid = ?').get(sender)
            let hasBadge = false
            if (row && row.conquistas) {
                try {
                    const list = JSON.parse(row.conquistas)
                    hasBadge = Array.isArray(list) && list.includes(id)
                } catch (err) { logger.warn(`[${id.toUpperCase()}] falha ignorada: ` + (err && err.message)) }
            }

            const doc = [
                M.cabecalho(emoji, `Insígnia #${n}: Conquistador Real`),
                `💎 *Raridade:* Grau ${raridade}`,
                `📜 *Título Associado:* _"Lorde da Ordem Real #${n}"_`,
                '⭐ *Status para você:* ' + (hasBadge ? '✅ *DESBLOQUEADA!*' : '🔒 *Bloqueada* (Atinja feitos no bot para liberar)'),
                M.assinatura('GOAT Royal Archives')
            ].join('\n\n')
            return reply(doc)
        }
    }
}

module.exports = { criarInsignia }
