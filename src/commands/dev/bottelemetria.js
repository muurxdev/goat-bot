/**
 * Comando .bottelemetria — Mostra uso de memória, tempo ligado e máquina: .bottelemetria
 *
 * Antes exibia "1.000 Comandos Ativos" fixo e o nome antigo do bot; agora a
 * contagem vem do registro real de comandos e o nome de getBotName().
 */
const F = require('../../utils/formato')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

/** Quantidade de comandos únicos carregados (sem contar aliases). */
function contarComandos() {
    try {
        const { getCommands } = require('../../handlers/commandDispatcher')
        return new Set([...getCommands().values()]).size
    } catch (err) {
        logger.warn(`[BOTTELEMETRIA] Não consegui contar os comandos: ${err.message}`)
        return null
    }
}

module.exports = {
    name: "bottelemetria",
    aliases: ["bottelemetria-cmd","cmd-bottelemetria","cmd_bottelemetria","alt_bottelemetria","atalho_bottelemetria","abrev_bottelemetria","call_bottelemetria","func_bottelemetria"],
    category: "dev",
    subcategory: "Telemetria",
    description: "Mostra meu uso de memória, tempo ligado e dados da máquina",
    examples: [' — mostra o painel de telemetria'],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
            const os = require("os");
            const mem = process.memoryUsage();
            const memUsed = Math.round(mem.heapUsed / 1024 / 1024);
            const memTotal = Math.round(mem.heapTotal / 1024 / 1024);
            const rss = Math.round(mem.rss / 1024 / 1024);
            const uptime = Math.floor(process.uptime());
            const hrs = Math.floor(uptime / 3600);
            const mins = Math.floor((uptime % 3600) / 60);
            const secs = uptime % 60;
            const comandos = contarComandos();
            const livreMaquina = os.freemem() / os.totalmem();
            return reply(F.tela({
                emoji: '📡',
                titulo: 'Telemetria',
                intro: `${getBotName()} está no ar há *${hrs}h ${mins}m ${secs}s*, usando *${rss} MB* de memória.`,
                secoes: [
                    {
                        emoji: '🧠', titulo: 'Processo',
                        linhas: [
                            F.campo('Memória JavaScript', `${memUsed} MB de ${memTotal} MB`),
                            F.campo('Uso da reserva', F.barra(memTotal ? memUsed / memTotal : 0)),
                            F.campo('Memória total do processo', `${rss} MB`),
                            comandos !== null ? F.campo('Comandos carregados', comandos.toLocaleString('pt-BR')) : null,
                            F.campo('Node.js', process.version)
                        ]
                    },
                    {
                        emoji: '🖥️', titulo: 'Máquina',
                        linhas: [
                            F.campo('Plataforma', `${os.platform()} (${os.arch()})`),
                            F.campo('Núcleos', String(os.cpus().length)),
                            F.campo('Memória livre', F.barra(livreMaquina))
                        ]
                    }
                ],
                dica: 'Memória total do processo subindo sem parar ao longo dos dias costuma indicar vazamento.',
                proximos: [
                    { nome: 'diagmemoria', oque: 'memória em detalhe' },
                    { nome: 'diagcpu', oque: 'uso de processador' },
                    { nome: 'diagvida', oque: 'tempo no ar' }
                ],
                prefix
            }));
        }
};
