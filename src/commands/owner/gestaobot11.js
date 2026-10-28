/**
 * Comando .usuariosbot — Quantas pessoas eu conheço e quantas têm cadastro e usam de fato
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'usuariosbot',
    aliases: ["numerosusuarios"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantas pessoas eu conheço e quantas têm cadastro e usam de fato',
    examples: [' — mostra os números da base de usuários'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const u = G.usuarios() || {}
    const total = u.total || 0
    const registrados = u.registrados || 0
    const semCadastro = total - registrados
    return reply(F.tela({
        emoji: '👤',
        titulo: 'Base de usuários',
        intro: plural(total, 'pessoa conhecida', 'pessoas conhecidas') + ', ' + registrados + ' com cadastro (' + F.barra(total ? registrados / total : 0) + ').',
        secoes: [
            { emoji: '📋', titulo: 'Números', linhas: [
                F.campo('Conhecidas', total),
                F.campo('Cadastradas', registrados),
                F.campo('Com atividade', u.comAtividade || 0),
                F.campo('Nível 10 ou mais', u.acima10 || 0),
                F.campo('Com RPG desligado', u.rpgDesligado || 0)
            ] }
        ],
        dica: semCadastro > 0 ? semCadastro + ' pessoas conhecidas ainda não têm cadastro e não conseguem usar os comandos. Elas entram com ' + F.cmd(prefix, 'login', 'SeuNick') + '.' : '',
        proximos: [
            { nome: 'novosusuarios', oque: 'quem chegou nos últimos dias' },
            { nome: 'faixasnivel', oque: 'como os jogadores se espalham pelos níveis' }
        ],
        prefix
    }))
    }
}
