/**
 * Comando .contaralugueis — Quantos aluguéis existem, separados por situação
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

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
    name: 'contaralugueis',
    aliases: ["quantosalugueis"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantos aluguéis existem, separados por situação',
    examples: [' — conta os aluguéis registrados'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = G.alugueis()
    const n = lista.length
    if (!n) {
        return reply(F.tela({
            emoji: '📜',
            titulo: "Nenhum aluguel registrado",
            intro: "Cada aluguel libera um grupo ou privado por um prazo (ou para sempre).",
            secoes: [{ emoji: '🛠️', titulo: "Para cadastrar um aluguel", linhas: comoAlugar(prefix) }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '📜',
        titulo: plural(n, "aluguel registrado", "aluguéis registrados"),
        intro: "Cada aluguel libera um grupo ou privado por um prazo (ou para sempre).",
        secoes: [{ emoji: '📊', titulo: 'Por situação', linhas: ((campo) => { const m = new Map(); for (const x of lista) m.set(x[campo], (m.get(x[campo]) || 0) + 1); return [...m].map(([k, v]) => F.campo(String(k), v)) })('situacao') }],
        proximos: [{ nome: 'listaalugueis', oque: 'cada aluguel com nome e prazo' }, { nome: 'aluguelvencendo', oque: 'os que acabam logo' }],
        prefix
    }))
    }
}
