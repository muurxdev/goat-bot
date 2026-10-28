/**
 * Comando .bloqueadosbot — Quem está bloqueado e não pode usar nenhum comando meu
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'bloqueadosbot',
    aliases: ["listabloqueados"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quem está bloqueado e não pode usar nenhum comando meu',
    examples: [' — lista os bloqueados e o motivo'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const b = G.listaNegra()
    if (!b.length) {
        return reply(F.tela({
            emoji: '🟢',
            titulo: 'Ninguém bloqueado',
            intro: 'Esta tela lista quem está impedido de usar meus comandos em qualquer lugar, com o motivo. Não há ninguém.',
            secoes: [{ emoji: '🛠️', titulo: 'Para bloquear alguém', linhas: ['• ' + F.cmd(prefix, 'banglobal', '@pessoa motivo') + ' — bloqueia em todos os lugares'] }],
            prefix
        }))
    }
    const linhas = b.slice(0, 30).map(x => '• ' + G.nomeCurto(x.jid) + ' — ' + (x.motivo || 'sem motivo'))
    if (b.length > 30) linhas.push('_… e mais ' + (b.length - 30) + '_')
    return reply(F.tela({
        emoji: '🚫',
        titulo: plural(b.length, 'pessoa bloqueada', 'pessoas bloqueadas'),
        intro: 'Não uso nenhum comando para estas pessoas, em lugar nenhum.',
        secoes: [{ emoji: '📋', titulo: 'Bloqueados', linhas }],
        dica: 'Para liberar alguém, use ' + F.cmd(prefix, 'unban', '@pessoa') + '.',
        proximos: [{ nome: 'restricoespv', oque: 'quem só está barrado no privado' }],
        prefix
    }))
    }
}
