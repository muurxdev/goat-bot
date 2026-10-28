/**
 * Comando .cargosbot — Quem tem cargo atribuído e quem deu o cargo
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

const CARGO = { OWNER: 'Dono', SUBOWNER: 'Subdono', ADMIN: 'Administrador', MOD: 'Moderador', TRUSTED: 'Confiável', USER: 'Comum' }
function nomeCargo(r) { return CARGO[String(r || '').toUpperCase()] || String(r || '—') }

module.exports = {
    name: 'cargosbot',
    aliases: ["listarcargos"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quem tem cargo atribuído e quem deu o cargo',
    examples: [' — lista os cargos atribuídos'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = G.cargos()
    if (!c.length) {
        return reply(F.tela({
            emoji: '🎖️',
            titulo: 'Nenhum cargo atribuído',
            intro: 'Esta tela lista quem tem cargo (dono, confiável…), quem deu e quando. Ainda não há nenhum.',
            secoes: [{ emoji: '🛠️', titulo: 'Para atribuir', linhas: [
                '• ' + F.cmd(prefix, 'setdono', '@pessoa') + ' — nomeia um dono',
                '• ' + F.cmd(prefix, 'trust', '@pessoa motivo') + ' — coloca na lista de confiança'
            ] }],
            prefix
        }))
    }
    const linhas = c.slice(0, 30).map(x => '• *' + nomeCargo(x.role) + '* — ' + G.nomeCurto(x.jid) + (x.assigned_by ? ' (por ' + G.nomeCurto(x.assigned_by) + (x.assigned_at ? ' em ' + String(x.assigned_at).slice(0, 10) : '') + ')' : ''))
    return reply(F.tela({
        emoji: '🎖️',
        titulo: plural(c.length, 'cargo atribuído', 'cargos atribuídos'),
        intro: 'Quem tem nível de permissão acima do comum.',
        secoes: [{ emoji: '📋', titulo: 'Cargos', linhas }],
        dica: 'Para tirar um cargo, use ' + F.cmd(prefix, 'deldono', '@pessoa') + '.',
        proximos: [{ nome: 'confiaveisbot', oque: 'a lista de confiança' }],
        prefix
    }))
    }
}
