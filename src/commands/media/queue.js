/**
 * Comando .queue
 * Exibe o status da fila de downloads, concorrência e jobs em andamento
 */

const { mediaQueue } = require('../../services/mediaQueue')
const F = require('../../utils/formato')

module.exports = {
    name: 'queue',
    aliases: ['fila', 'downloads'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Mostra a fila de downloads: o que está baixando e o que está esperando',
    examples: [' — mostra a fila agora'],
    cooldownMs: 3000,
    execute: async ({ reply, prefix = '.' }) => {
        const stats = mediaQueue.getStats()
        const livres = Math.max(0, stats.maxConcurrency - stats.activeWorkers)
        const resumo = [
            F.campo('Baixando agora', `${stats.activeWorkers} de ${stats.maxConcurrency}`),
            F.campo('Esperando', String(stats.queueLength)),
            F.campo('Ocupação', F.barra(stats.maxConcurrency ? stats.activeWorkers / stats.maxConcurrency : 0))
        ]

        if (stats.activeJobs.length === 0 && stats.pendingJobs.length === 0) {
            return reply(F.tela({
                emoji: '🚦',
                titulo: 'Fila de downloads',
                intro: '🟢 Nenhum download em andamento. Pode pedir que começo na hora.',
                secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: resumo }],
                dica: `Consigo baixar ${stats.maxConcurrency} ao mesmo tempo; os pedidos a mais esperam aqui na ordem de chegada.`,
                proximos: [
                    { nome: 'play', args: 'nome da música', oque: 'baixar uma música' },
                    { nome: 'ytmp4', args: 'nome do vídeo', oque: 'baixar um vídeo' }
                ],
                prefix
            }))
        }

        const ativos = stats.activeJobs.map(j => `• \`${j.id}\` · há ${(j.runningForMs / 1000).toFixed(0)}s`)
        const esperando = stats.pendingJobs.map((j, i) =>
            `• ${i + 1}º \`${j.id}\` · ${j.format === 'mp3' ? 'áudio' : 'vídeo'} · esperando há ${(j.queuedForMs / 1000).toFixed(0)}s`)

        return reply(F.tela({
            emoji: '🚦',
            titulo: 'Fila de downloads',
            intro: stats.queueLength
                ? `Estou baixando *${stats.activeWorkers}* e com *${stats.queueLength}* esperando a vez.`
                : `Estou baixando *${stats.activeWorkers}*; ainda cabem *${livres}* sem esperar.`,
            secoes: [
                { emoji: '📋', titulo: 'Resumo', linhas: resumo },
                { emoji: '⬇️', titulo: 'Em andamento', linhas: ativos },
                { emoji: '⏳', titulo: 'Na fila', linhas: esperando }
            ],
            dica: 'Vídeos longos em alta qualidade demoram mais; se o seu não é urgente, dá para cancelar e pedir depois.',
            proximos: [{ nome: 'cancel', args: '<código>', oque: 'cancelar o seu download' }],
            prefix
        }))
    }
}
