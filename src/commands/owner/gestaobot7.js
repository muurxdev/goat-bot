/**
 * Comando .listaalugueis — Todos os aluguéis registrados e a situação de cada um
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

const ICONE = { ativo: '🟢', vencido: '🔴', 'vitalício': '♾️', inativo: '⚪' }

/** Nome legível de um ambiente, sem mostrar o identificador cru. */
function apelidoDe(jid, nome) {
    if (nome) return String(nome).slice(0, 24)
    const n = String(jid || '')
    if (n === 'global') return 'ajuste global'
    if (n.endsWith('@g.us')) return 'grupo final ' + n.split('@')[0].slice(-6)
    return 'privado ' + G.nomeCurto(n)
}

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

/** Linhas com os comandos prontos para cadastrar ou renovar um aluguel. */
function comoAlugar(prefix) {
    return [
        '• ' + F.cmd(prefix, 'aluguel', 'set 30d grupo') + ' — dentro do grupo, libera 30 dias',
        '• ' + F.cmd(prefix, 'aluguel', 'set 30d pv 5511999999999') + ' — libera o privado de um número',
        '• ' + F.cmd(prefix, 'aluguel', 'add 15d') + ' — dentro do grupo, soma 15 dias ao prazo atual'
    ]
}

module.exports = {
    name: 'listaalugueis',
    aliases: ["todososalugueis"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Todos os aluguéis registrados e a situação de cada um',
    examples: [' — lista os aluguéis, do que vence por último ao primeiro'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = G.alugueis()
    if (!a.length) {
        return reply(F.tela({
            emoji: '📜',
            titulo: 'Nenhum aluguel registrado',
            intro: 'Esta tela lista cada grupo ou privado alugado, com a situação e quanto tempo falta. Ainda não há nenhum.',
            secoes: [{ emoji: '📝', titulo: 'Para cadastrar um aluguel', linhas: comoAlugar(prefix) }],
            proximos: [{ nome: 'aluguel', oque: 'todas as opções de aluguel e planos' }],
            prefix
        }))
    }
    const linhas = a.slice(0, 20).map(x => (ICONE[x.situacao] || '⚪') + ' *' + apelidoDe(x.group_jid, x.group_name) + '* — ' + x.situacao + (x.restanteMs > 0 ? ', faltam ' + G.duracao(x.restanteMs) : ''))
    if (a.length > 20) linhas.push('_… e mais ' + (a.length - 20) + '_')
    const vencidos = a.filter(x => x.situacao === 'vencido').length
    return reply(F.tela({
        emoji: '📜',
        titulo: plural(a.length, 'aluguel registrado', 'aluguéis registrados'),
        intro: vencidos === 1 ? '🔴 1 já passou do prazo e segue marcado como ativo.' : vencidos ? '🔴 ' + vencidos + ' já passaram do prazo e seguem marcados como ativos.' : 'Nenhum aluguel ativo passou do prazo.',
        secoes: [{ emoji: '📋', titulo: 'Aluguéis', linhas }],
        dica: 'Para estender um prazo, entre no grupo e use ' + F.cmd(prefix, 'aluguel', 'add 30d') + '.',
        proximos: [
            { nome: 'aluguelvencendo', oque: 'os que acabam nos próximos dias' },
            { nome: 'aluguelsituacao', oque: 'a contagem por situação' }
        ],
        prefix
    }))
    }
}
