/**
 * Comando .diagagendaresumo — AGENDA POR SITUAÇÃO
 *
 * Quantas tarefas em cada situação.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

/** Tela para quando a leitura falha (o detalhe já foi para o logger pela sonda). */
function semLeitura(prefix, emoji, titulo, oque) {
    return F.tela({ emoji, titulo, intro: 'Não consegui ler ' + oque + ' agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagresumo', oque: 'resumo geral' }], prefix })
}

const SITUACAO = { pending: 'pendente', sent: 'enviada', done: 'concluída', failed: 'falhou', cancelled: 'cancelada', canceled: 'cancelada', active: 'ativa' }

module.exports = {
    name: 'diagagendaresumo',
    aliases: ["diagagendastatus","cmd_diagagendaresumo","alt_diagagendaresumo","atalho_diagagendaresumo","abrev_diagagendaresumo","call_diagagendaresumo","func_diagagendaresumo"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Quantas tarefas agendadas existem em cada situação',
    examples: [' — conta as tarefas por situação'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const r = D.agendaResumo()
    if (r.erro) return reply(semLeitura(prefix, '🗓️', 'Agenda por situação', 'a agenda'))
    if (!r.length) {
        return reply(F.tela({
            emoji: '🗓️',
            titulo: 'Agenda por situação',
            intro: 'Nenhuma tarefa agendada ainda.',
            secoes: [{ emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Quantas tarefas estão pendentes, foram enviadas ou falharam. Ajuda a ver se os avisos automáticos estão saindo.'] }],
            proximos: [
                { nome: 'agendarmensagem', oque: 'programar um aviso no grupo' },
                { nome: 'diagagenda', oque: 'lista das tarefas' }
            ],
            prefix
        }))
    }
    const total = r.reduce((s, x) => s + Number(x.n || 0), 0)
    const falhas = r.filter(x => /fail/i.test(String(x.status))).reduce((s, x) => s + Number(x.n || 0), 0)
    return reply(F.tela({
        emoji: '🗓️',
        titulo: 'Agenda por situação',
        intro: `*${total}* tarefa(s) no total${falhas ? `, *${falhas}* com falha` : ''}.`,
        secoes: [{
            emoji: '📊', titulo: 'Situações',
            linhas: r.map(x => F.campo(SITUACAO[x.status] || x.status || 'sem situação', `${x.n} · ${F.barra(Number(x.n) / Math.max(1, total), 8)}`))
        }],
        dica: falhas ? 'Veja na lista quais falharam; o grupo pode ter me removido ou eu posso ter perdido a permissão de enviar.' : '',
        proximos: [{ nome: 'diagagenda', oque: 'lista das tarefas' }],
        prefix
    }))
    }
}
