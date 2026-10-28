/**
 * Comando .aluguelvencendo — Aluguéis que acabam nos próximos dias (7 se você não disser quantos)
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

/** Linhas com os comandos prontos para cadastrar ou renovar um aluguel. */
function comoAlugar(prefix) {
    return [
        '• ' + F.cmd(prefix, 'aluguel', 'set 30d grupo') + ' — dentro do grupo, libera 30 dias',
        '• ' + F.cmd(prefix, 'aluguel', 'set 30d pv 5511999999999') + ' — libera o privado de um número',
        '• ' + F.cmd(prefix, 'aluguel', 'add 15d') + ' — dentro do grupo, soma 15 dias ao prazo atual'
    ]
}

module.exports = {
    name: 'aluguelvencendo',
    // Os antigos .aluguel1dias … .aluguel30dias eram este comando com os dias no
    // nome (unificados em 2026-09-18); o número do atalho vira os dias.
    aliases: ["alugueisvencendo", "aluguel1dias", "aluguel3dias", "aluguel15dias", "aluguel30dias", "vencendo1", "vencendo3", "vencendo15", "vencendo30"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Aluguéis que acabam nos próximos dias (7 se você não disser quantos)',
    usage: '[dias de 1 a 90]',
    examples: [' — aluguéis que acabam nos próximos 7 dias', '30 — aluguéis que acabam nos próximos 30 dias'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
    const doAtalho = String(commandName).match(/(\d+)(?:dias)?$/)
    const dias = Math.min(90, Math.max(1, parseInt(doAtalho ? doAtalho[1] : args[0], 10) || 7))
    const a = G.alugueisVencendo(dias).sort((x, y) => x.restanteMs - y.restanteMs)
    if (!a.length) {
        return reply(F.tela({
            emoji: '🟢',
            titulo: 'Nenhum aluguel vence em ' + dias + ' dias',
            intro: 'Esta tela lista os grupos e privados cujo aluguel acaba nos próximos ' + dias + ' dias, com quanto tempo falta. Agora não há nenhum.',
            secoes: [{ emoji: '📜', titulo: 'Para cadastrar ou renovar', linhas: comoAlugar(prefix) }],
            dica: dias < 90 ? 'Quer olhar mais longe? Diga os dias, de 1 a 90: ' + F.cmd(prefix, 'aluguelvencendo', dias < 30 ? '30' : '90') + '.' : '',
            proximos: [{ nome: 'listaalugueis', oque: 'todos os aluguéis e a situação de cada um' }],
            prefix
        }))
    }
    const linhas = a.slice(0, 25).map(x => '• *' + apelidoDe(x.group_jid, x.group_name) + '* — faltam ' + G.duracao(x.restanteMs) + ' (' + quando(x.expira) + ')')
    if (a.length > 25) linhas.push('_… e mais ' + (a.length - 25) + '_')
    return reply(F.tela({
        emoji: '⏳',
        titulo: plural(a.length, 'aluguel vence', 'aluguéis vencem') + ' em ' + dias + ' dias',
        intro: 'O mais próximo acaba em *' + G.duracao(a[0].restanteMs) + '*. Renove antes para o lugar não perder o acesso.',
        secoes: [{ emoji: '📆', titulo: 'Vencendo', linhas }],
        dica: 'Para renovar, entre no grupo e use ' + F.cmd(prefix, 'aluguel', 'add 30d') + '.',
        proximos: [
            { nome: 'aluguelvencidos', oque: 'os que já passaram do prazo' },
            { nome: 'listaalugueis', oque: 'todos os aluguéis' }
        ],
        prefix
    }))
    }
}
