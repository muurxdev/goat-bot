/**
 * Comando .aluguelvencidos — Aluguéis que passaram do prazo e continuam marcados como ativos
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

/** Nome legível de um ambiente, sem mostrar o identificador cru. */
function apelidoDe(jid, nome) {
    if (nome) return String(nome).slice(0, 24)
    const n = String(jid || '')
    if (n === 'global') return 'ajuste global'
    if (n.endsWith('@g.us')) return 'grupo final ' + n.split('@')[0].slice(-6)
    return 'privado ' + G.nomeCurto(n)
}

function quando(v) {
    if (!v) return '—'
    const d = new Date(Number(v) || v)
    return Number.isFinite(d.getTime()) ? d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }) : '—'
}

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'aluguelvencidos',
    aliases: ["alugueisvencidos"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Aluguéis que passaram do prazo e continuam marcados como ativos',
    examples: [' — lista os aluguéis vencidos'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = G.alugueis().filter(x => x.situacao === 'vencido')
    if (!a.length) {
        return reply(F.tela({
            emoji: '🟢',
            titulo: 'Nenhum aluguel vencido',
            intro: 'Esta tela lista os aluguéis cujo prazo já acabou mas continuam marcados como ativos. Está tudo em dia.',
            proximos: [
                { nome: 'aluguelvencendo', oque: 'os que acabam nos próximos dias' },
                { nome: 'listaalugueis', oque: 'todos os aluguéis' }
            ],
            prefix
        }))
    }
    const linhas = a.slice(0, 25).map(x => '• *' + apelidoDe(x.group_jid, x.group_name) + '* — venceu em ' + quando(x.expira))
    if (a.length > 25) linhas.push('_… e mais ' + (a.length - 25) + '_')
    return reply(F.tela({
        emoji: '🔴',
        titulo: plural(a.length, 'aluguel vencido', 'aluguéis vencidos'),
        intro: 'O prazo destes acabou, mas o registro segue marcado como ativo.',
        secoes: [{ emoji: '📋', titulo: 'Vencidos', linhas }],
        dica: 'Para renovar, entre no grupo e use ' + F.cmd(prefix, 'aluguel', 'add 30d') + '; para encerrar, ' + F.cmd(prefix, 'aluguel', 'del') + '.',
        proximos: [{ nome: 'listaalugueis', oque: 'todos os aluguéis' }],
        prefix
    }))
    }
}
