/**
 * Comando .confiaveisbot — Quem está na lista de confiança e escapa de algumas restrições
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'confiaveisbot',
    aliases: ["listaconfianca"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quem está na lista de confiança e escapa de algumas restrições',
    examples: [' — lista quem está na lista de confiança'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = G.confiaveis()
    if (!c.length) {
        return reply(F.tela({
            emoji: '🤝',
            titulo: 'Lista de confiança vazia',
            intro: 'Esta tela lista quem escapa de algumas restrições, com a observação de cada um. Ainda não há ninguém.',
            secoes: [{ emoji: '🛠️', titulo: 'Para adicionar', linhas: ['• ' + F.cmd(prefix, 'trust', '@pessoa motivo') + ' — coloca a pessoa na lista'] }],
            prefix
        }))
    }
    const linhas = c.slice(0, 30).map(x => '• ' + G.nomeCurto(x.jid) + (x.notes ? ' — ' + x.notes : ''))
    return reply(F.tela({
        emoji: '🤝',
        titulo: plural(c.length, 'pessoa de confiança', 'pessoas de confiança'),
        intro: 'Estas pessoas escapam de algumas restrições.',
        secoes: [{ emoji: '📋', titulo: 'Lista', linhas }],
        dica: 'Para tirar alguém, use ' + F.cmd(prefix, 'trust', 'off @pessoa') + '.',
        proximos: [{ nome: 'cargosbot', oque: 'todos os cargos atribuídos' }],
        prefix
    }))
    }
}
