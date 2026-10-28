/**
 * Comando .ambiente — Detalhes de um ambiente da lista (.ambientesbot).
 *
 * Junta os antigos .ambiente1 … .ambiente6, que eram o mesmo comando com o
 * número fixo (unificados em 2026-09-18). ".ambiente3" continua funcionando.
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
    name: 'ambiente',
    aliases: ["verambiente", "ambiente1", "ambiente2", "ambiente3", "ambiente4", "ambiente5", "ambiente6", "verambiente1", "verambiente2", "verambiente3", "verambiente4", "verambiente5", "verambiente6"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Detalhes de um ambiente da lista de ambientes',
    usage: '[número da lista]',
    examples: [' — mostra o primeiro ambiente', '3 — mostra o terceiro ambiente da lista'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
    const doAtalho = String(commandName).match(/(\d+)$/)
    const N = Math.max(1, parseInt(doAtalho ? doAtalho[1] : args[0], 10) || 1)
    const todos = G.ambientes()
    const a = todos[N - 1]
    if (!a) {
        return reply(F.tela({
            emoji: '🔎',
            titulo: 'Não existe o ambiente ' + N,
            intro: 'Esta tela mostra o que está ajustado no ambiente de número ' + N + ' (um grupo, um privado ou o ajuste global). ' +
                (todos.length ? 'Hoje só há ' + plural(todos.length, 'ambiente', 'ambientes') + ' com configuração própria.' : 'Hoje nenhum lugar tem configuração própria.'),
            secoes: [{ emoji: '🛠️', titulo: 'Como um ambiente aparece', linhas: [
                'Basta mudar algum ajuste num grupo ou no privado. Por exemplo, dentro de um grupo:',
                '• ' + F.cmd(prefix, 'setting', 'prefix !') + ' — troca o prefixo só ali'
            ] }],
            proximos: [
                { nome: 'ambientesbot', oque: 'a lista numerada de ambientes' },
                todos.length ? { nome: 'ambiente', args: '1', oque: 'o primeiro da lista' } : null
            ].filter(Boolean),
            prefix
        }))
    }
    const TIPO = { grupo: 'Grupo', privado: 'Privado', global: 'Ajuste global' }
    const chaves = a.chaves.map(k => '• ' + k)
    return reply(F.tela({
        emoji: '🔎',
        titulo: 'Ambiente ' + N + ': ' + apelidoDe(a.jid),
        intro: (TIPO[a.tipo] || a.tipo) + ' com ' + plural(a.opcoes, 'ajuste salvo', 'ajustes salvos') + '.',
        secoes: [
            { emoji: '📋', titulo: 'Resumo', linhas: [
                F.campo('Onde', apelidoDe(a.jid)),
                F.campo('Tipo', TIPO[a.tipo] || a.tipo),
                F.campo('Ajustes salvos', a.opcoes),
                F.campo('Última mudança', quando(a.atualizadoEm))
            ] },
            { emoji: '⚙️', titulo: 'Ajustes', linhas: chaves }
        ],
        dica: 'Para ver ou mudar um ajuste, entre nesse lugar e use ' + F.cmd(prefix, 'setting') + '.',
        proximos: [
            todos[N] ? { nome: 'ambiente', args: String(N + 1), oque: 'o próximo da lista' } : null,
            N > 1 ? { nome: 'ambiente', args: String(N - 1), oque: 'o anterior' } : null,
            { nome: 'ambientesbot', oque: 'a lista inteira' }
        ].filter(Boolean),
        prefix
    }))
    }
}
