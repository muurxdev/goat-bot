/**
 * Comando .contarcargos — Quantos cargos estão atribuídos, separados por tipo
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

const CARGO = { OWNER: 'Dono', SUBOWNER: 'Subdono', ADMIN: 'Administrador', MOD: 'Moderador', TRUSTED: 'Confiável', USER: 'Comum' }
function nomeCargo(r) { return CARGO[String(r || '').toUpperCase()] || String(r || '—') }

module.exports = {
    name: 'contarcargos',
    aliases: ["quantoscargos"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantos cargos estão atribuídos, separados por tipo',
    examples: [' — conta os cargos atribuídos'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = G.cargos()
    const n = lista.length
    if (!n) {
        return reply(F.tela({
            emoji: '🎖️',
            titulo: "Nenhum cargo atribuído",
            intro: "Cargos são níveis de permissão acima do comum (dono, confiável…).",
            secoes: [{ emoji: '🛠️', titulo: "Para atribuir", linhas: ['• ' + F.cmd(prefix, 'setdono', '@pessoa') + ' — nomeia um dono', '• ' + F.cmd(prefix, 'trust', '@pessoa motivo') + ' — coloca na lista de confiança'] }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🎖️',
        titulo: plural(n, "cargo atribuído", "cargos atribuídos"),
        intro: "Cargos são níveis de permissão acima do comum (dono, confiável…).",
        secoes: [{ emoji: '📊', titulo: 'Por cargo', linhas: ((campo) => { const m = new Map(); for (const x of lista) m.set(x[campo], (m.get(x[campo]) || 0) + 1); return [...m].map(([k, v]) => F.campo(String(k), v)) })('role').map(l => l.replace(/^\*([^:]+):\*/, (m, r) => '*' + nomeCargo(r) + ':*')) }],
        proximos: [{ nome: 'cargosbot', oque: 'quem tem cada cargo' }],
        prefix
    }))
    }
}
