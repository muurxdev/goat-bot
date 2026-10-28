/**
 * Comando .aluguelsituacao — Quantos aluguéis estão ativos, vencidos, vitalícios ou inativos
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

const ICONE = { ativo: '🟢', vencido: '🔴', 'vitalício': '♾️', inativo: '⚪' }

/** Linhas com os comandos prontos para cadastrar ou renovar um aluguel. */
function comoAlugar(prefix) {
    return [
        '• ' + F.cmd(prefix, 'aluguel', 'set 30d grupo') + ' — dentro do grupo, libera 30 dias',
        '• ' + F.cmd(prefix, 'aluguel', 'set 30d pv 5511999999999') + ' — libera o privado de um número',
        '• ' + F.cmd(prefix, 'aluguel', 'add 15d') + ' — dentro do grupo, soma 15 dias ao prazo atual'
    ]
}

module.exports = {
    name: 'aluguelsituacao',
    aliases: ["resumoalugueis"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantos aluguéis estão ativos, vencidos, vitalícios ou inativos',
    examples: [' — mostra a contagem de aluguéis por situação'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const r = G.alugueisPorSituacao()
    if (!r.total) {
        return reply(F.tela({
            emoji: '📊',
            titulo: 'Nenhum aluguel registrado',
            intro: 'Esta tela conta os aluguéis por situação (ativo, vencido, vitalício, inativo). Ainda não há nenhum para contar.',
            secoes: [{ emoji: '📝', titulo: 'Para cadastrar um aluguel', linhas: comoAlugar(prefix) }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '📊',
        titulo: 'Aluguéis por situação',
        intro: r.total + ' aluguel(is) registrados no total.',
        secoes: [{ emoji: '📋', titulo: 'Situação', linhas: r.porSituacao.map(s => F.campo((ICONE[s.situacao] || '⚪') + ' ' + s.situacao, s.n)) }],
        dica: 'Vencido quer dizer que o prazo acabou mas o registro continua marcado como ativo.',
        proximos: [
            { nome: 'listaalugueis', oque: 'cada aluguel com nome e prazo' },
            { nome: 'aluguelvencidos', oque: 'só os vencidos' }
        ],
        prefix
    }))
    }
}
