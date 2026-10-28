/**
 * Comando .restricoespv — Quem está impedido de falar comigo no privado
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'restricoespv',
    aliases: ["bloqueiospv"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quem está impedido de falar comigo no privado',
    examples: [' — lista as restrições de privado'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const r = G.restricoesPv()
    if (!r.length) {
        return reply(F.tela({
            emoji: '🟢',
            titulo: 'Nenhuma restrição no privado',
            intro: 'Esta tela lista quem não pode falar comigo no privado, com o motivo. Não há ninguém.',
            secoes: [{ emoji: '🛠️', titulo: 'Para restringir alguém', linhas: ['• ' + F.cmd(prefix, 'bandm', '@pessoa motivo') + ' — barra a pessoa no privado'] }],
            prefix
        }))
    }
    const linhas = r.slice(0, 30).map(x => '• ' + G.nomeCurto(x.jid) + ' — ' + (x.reason || 'sem motivo'))
    return reply(F.tela({
        emoji: '🔒',
        titulo: plural(r.length, 'restrição no privado', 'restrições no privado'),
        intro: 'Estas pessoas não conseguem me usar no privado.',
        secoes: [{ emoji: '📋', titulo: 'Restritos', linhas }],
        dica: 'Para liberar alguém, use ' + F.cmd(prefix, 'opendm', '@pessoa') + '.',
        proximos: [{ nome: 'bloqueadosbot', oque: 'quem está bloqueado em todo lugar' }],
        prefix
    }))
    }
}
