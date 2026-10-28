/**
 * Comando .health
 * Diagnóstico de integridade e saúde operacional (SQLite, RAM, Heap, Uptime)
 */

const { getHealthReport } = require('../../services/telemetryService')

module.exports = {
    name: 'health',
    aliases: ['saude', 'statusbot', 'healthcheck'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Mostra se estou funcionando bem: dados, memória e tempo ligado',
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
        const report = getHealthReport()

        const saudavel = report.status === 'HEALTHY'
        const F = require('../../utils/formato')
        const msg = F.tela({
            emoji: saudavel ? '🟢' : '🔴',
            titulo: saudavel ? 'Estou funcionando bem' : 'Estou com problema nos dados',
            intro: saudavel
                ? `Meus registros respondem normalmente e estou ligado há ${report.system.uptime}.`
                : 'Não consegui ler meus registros agora. Alguns comandos podem falhar até isso ser resolvido.',
            secoes: [
                { emoji: '💾', titulo: 'Registros', linhas: [
                    F.campo('Situação', saudavel ? 'tudo certo' : 'com falha'),
                    F.campo('Tamanho', `${report.sqlite.sizeKb.toLocaleString('pt-BR')} KB`)
                ] },
                { emoji: '🧠', titulo: 'Memória', linhas: [
                    F.campo('Em uso', `${report.memory.rssMb} MB de 512 MB`),
                    F.barra(report.memory.rssMb / 512),
                    F.campo('Trabalho ativo', `${report.memory.heapUsedMb} MB de ${report.memory.heapTotalMb} MB`)
                ] },
                { emoji: '⏱️', titulo: 'Máquina', linhas: [
                    F.campo('Ligado há', report.system.uptime),
                    F.campo('Carga do último minuto', report.system.loadAvg),
                    F.campo('Sistema', `${report.system.platform} · Node ${report.system.nodeVersion}`)
                ] }
            ],
            dica: saudavel ? 'Carga abaixo de 1,00 quer dizer que sobra fôlego para mais pedidos.' : `Avise um dos meus donos com ${prefix}dono para eles darem uma olhada.`,
            proximos: [
                { nome: 'ping', oque: 'ver quanto tempo levo para responder' },
                { nome: 'botstats', oque: 'ver os comandos mais usados' }
            ],
            prefix
        })

        await reply(msg)
    }
}

