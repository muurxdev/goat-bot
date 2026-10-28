/**
 * Comando .painelbot — Visão geral do reino: usuários, ambientes, aluguéis e permissões
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'painelbot',
    aliases: ["paineldono"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Visão geral do reino: usuários, ambientes, aluguéis e permissões',
    examples: [' — mostra o painel com os números principais'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = G.painel()
    const u = p.usuarios || {}
    const alertas = []
    if (p.vencendo) alertas.push('🟡 ' + plural(p.vencendo, 'aluguel vence', 'aluguéis vencem') + ' em 7 dias — ' + F.cmd(prefix, 'aluguelvencendo'))
    return reply(F.tela({
        emoji: '👑',
        titulo: 'Painel do reino',
        intro: plural(u.total || 0, 'pessoa conhecida', 'pessoas conhecidas') + ', ' + (u.registrados || 0) + ' com cadastro, em ' + plural(p.grupos, 'grupo configurado', 'grupos configurados') + '.',
        secoes: [
            alertas.length ? { emoji: '⚠️', titulo: 'Atenção', linhas: alertas } : null,
            { emoji: '👤', titulo: 'Pessoas', linhas: [
                F.campo('Conhecidas', u.total || 0),
                F.campo('Cadastradas', u.registrados || 0),
                F.campo('Com atividade', u.comAtividade || 0)
            ] },
            { emoji: '🌐', titulo: 'Lugares e aluguéis', linhas: [
                F.campo('Ambientes', p.ambientes + ' (' + plural(p.grupos, 'grupo', 'grupos') + ')'),
                F.campo('Aluguéis registrados', p.alugueis.total),
                F.campo('Vencendo em 7 dias', p.vencendo)
            ] },
            { emoji: '🎖️', titulo: 'Permissões', linhas: [
                F.campo('Cargos atribuídos', p.cargos),
                F.campo('Na lista de confiança', p.confiaveis),
                F.campo('Bloqueados', p.bloqueados)
            ] }
        ],
        proximos: [
            { nome: 'diagnosticobot', oque: 'aponta só o que precisa de atenção' },
            { nome: 'gestaoajuda', oque: 'todos os comandos de gestão' }
        ],
        prefix
    }))
    }
}
