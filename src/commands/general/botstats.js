/**
 * Comando .botstats / .topcomandos / .telemetria
 * Métricas e telemetria de uso dos comandos em tempo real persistidos no SQLite
 */

const { getTopCommands, getCategoryStats, getTotalExecutions } = require('../../database/repositories/analyticsRepository');
const { renderCard, formatNumber } = require('../../utils/uiEngine');
const os = require('os');

module.exports = {
    name: 'botstats',
    aliases: ['topcomandos', 'comandostats', 'botmetricas', 'telemetria', 'statsbot'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Mostra quanto já fui usado e os comandos mais pedidos',
    cooldownMs: 2000,
    execute: async ({ reply, sender }) => {
        const topCmds = getTopCommands(8);
        const catStats = getCategoryStats();
        const total = getTotalExecutions();

        const memUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
        const memTotal = (os.totalmem() / 1024 / 1024).toFixed(0);
        const uptimeH = (os.uptime() / 3600).toFixed(1);

        let topFields = [];
        if (topCmds.length === 0) {
            topFields.push("Ainda não anotei nenhum pedido. Assim que alguém usar um comando, ele aparece aqui.");
        } else {
            topCmds.forEach((c, i) => {
                topFields.push(`${i + 1}º \`.${c.command_name}\` _(${c.category})_ ➔ *${formatNumber(c.execution_count)} execuções*`);
            });
        }

        let catFields = [];
        if (catStats.length > 0) {
            for (const cat of catStats.slice(0, 5)) {
                catFields.push(`• *${cat.category.toUpperCase()}:* ${formatNumber(cat.total_executions)} execuções (${cat.command_count} comandos)`);
            }
        }

        const doc = renderCard({
            title: 'MEU MOVIMENTO NA TAVERNA',
            icon: '📊',
            subtitle: `⚡ *Total de Comandos Executados:* ${formatNumber(total)}`,
            sections: [
                {
                    title: 'TOP COMANDOS MAIS UTILIZADOS',
                    icon: '🔥',
                    fields: topFields
                },
                {
                    title: 'ATIVIDADE POR CATEGORIA',
                    icon: '📂',
                    fields: catFields
                },
                {
                    title: 'DESEMPENHO DO SISTEMA',
                    icon: '💻',
                    fields: [
                        { label: 'Memória em uso', value: `${memUsed} MB de ${memTotal} MB`, icon: '🧠' },
                        { label: 'Tempo Online', value: `${uptimeH} horas contínuas`, icon: '⏱️' }
                    ]
                }
            ],
            tip: 'Os números sobem a cada comando usado. Veja o que existe com .menu',
            mentions: [sender]
        });

        return reply(doc, [sender]);
    }
};

