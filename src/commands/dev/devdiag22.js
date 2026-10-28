/**
 * Comando .diagsaude — RELATÓRIO DE SAÚDE
 *
 * Resumo de saúde consolidado da telemetria.
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

const SITUACAO = { HEALTHY: '🟢 Saudável', DEGRADED: '🟡 Com problema', UNHEALTHY: '🔴 Fora do ar' }

module.exports = {
    name: 'diagsaude',
    aliases: ["diaghealth","cmd_diagsaude","alt_diagsaude","atalho_diagsaude","abrev_diagsaude","call_diagsaude","func_diagsaude"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Resumo de saúde: banco de dados, memória e máquina',
    examples: [' — mostra o relatório de saúde'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const t = D.telemetria()
    if (t.erro) return reply(semLeitura(prefix, '❤️‍🩹', 'Relatório de saúde', 'o relatório de saúde'))
    const s = t.saude || {}
    if (!Object.keys(s).length) {
        return reply(F.tela({ emoji: '❤️‍🩹', titulo: 'Relatório de saúde', intro: 'O relatório de saúde ainda não está disponível.', proximos: [{ nome: 'diagresumo', oque: 'resumo geral' }], prefix }))
    }
    const db = s.sqlite || {}, mem = s.memory || {}, sys = s.system || {}
    const dbOk = db.status === 'OK'
    return reply(F.tela({
        emoji: '❤️‍🩹',
        titulo: 'Relatório de saúde',
        intro: `Situação geral: *${SITUACAO[s.status] || s.status || 'desconhecida'}*`,
        secoes: [
            { emoji: '🗄️', titulo: 'Banco de dados', linhas: [F.campo('Situação', dbOk ? '🟢 respondendo' : '🔴 com erro'), db.sizeKb != null ? F.campo('Tamanho', D.tamanho(db.sizeKb * 1024)) : null] },
            { emoji: '🧠', titulo: 'Memória', linhas: [
                mem.rssMb != null ? F.campo('Total do processo', `${mem.rssMb} MB`) : null,
                mem.heapUsedMb != null ? F.campo('JavaScript', `${mem.heapUsedMb} MB de ${mem.heapTotalMb} MB`) : null
            ] },
            { emoji: '🖥️', titulo: 'Sistema', linhas: [
                sys.uptime ? F.campo('No ar há', sys.uptime) : null,
                sys.nodeVersion ? F.campo('Node.js', sys.nodeVersion) : null,
                sys.platform ? F.campo('Plataforma', sys.platform) : null,
                sys.loadAvg ? F.campo('Carga (1 min)', sys.loadAvg) : null
            ] }
        ],
        dica: dbOk ? 'Tudo que depende de dados (RPG, economia, ranking) funciona enquanto o banco responde.' : 'Com o banco em erro, RPG, economia e ranking falham. Comece pela verificação de integridade.',
        proximos: [
            dbOk ? { nome: 'diagmemoria', oque: 'memória em detalhe' } : { nome: 'diagintegridade', oque: 'verificar o banco' },
            { nome: 'diagconexao', oque: 'conexão com o WhatsApp' },
            { nome: 'diagresumo', oque: 'resumo geral' }
        ],
        prefix
    }))
    }
}
