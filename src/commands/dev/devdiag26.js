/**
 * Comando .diagagenda — TAREFAS AGENDADAS
 *
 * Agendamentos gravados e seus horários.
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
    name: 'diagagenda',
    aliases: ["diagschedules","cmd_diagagenda","alt_diagagenda","atalho_diagagenda","abrev_diagagenda","call_diagagenda","func_diagagenda"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Mensagens e tarefas agendadas, com a situação de cada uma',
    examples: [' — lista as últimas tarefas agendadas'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const a = D.agendamentos()
    if (a.erro) return reply(semLeitura(prefix, '📅', 'Tarefas agendadas', 'a agenda'))
    if (!a.total) {
        return reply(F.tela({
            emoji: '📅',
            titulo: 'Tarefas agendadas',
            intro: 'Nenhuma tarefa agendada ainda.',
            secoes: [{ emoji: '📋', titulo: 'O que aparece aqui', linhas: ['As últimas 10 tarefas gravadas (avisos programados nos grupos), com número e situação: pendente, enviada ou com falha.'] }],
            dica: 'Um administrador de grupo cria avisos automáticos com o comando abaixo.',
            proximos: [
                { nome: 'agendarmensagem', oque: 'programar um aviso no grupo' },
                { nome: 'diagagendaresumo', oque: 'contagem por situação' }
            ],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '📅',
        titulo: 'Tarefas agendadas',
        intro: `*${a.total}* tarefa(s) gravada(s).`,
        secoes: [{
            emoji: '📋', titulo: 'Últimas',
            linhas: F.lista(a.proximos.map(x => `#${x.id} ${x.action || '?'} · ${SITUACAO[x.status] || x.status || 'sem situação'}`))
        }],
        dica: 'Tarefa que fica pendente depois do horário costuma indicar que eu estava desconectado na hora.',
        proximos: [{ nome: 'diagagendaresumo', oque: 'contagem por situação' }],
        prefix
    }))
    }
}
