/**
 * Comando .ping / .pingvps / .vpsping
 * Mostra, em português simples, se estou respondendo e quão rápido.
 */

const { q } = require("../../database/connection");
const logger = require("../../core/logger");
const F = require("../../utils/formato");
const { duracao } = require("../../utils/textoRpg");

/** Como a pessoa deve ler o tempo total de resposta. */
function avaliar(ms) {
    if (ms === null) return { emoji: "🟢", frase: "estou respondendo normalmente" };
    if (ms < 1500) return { emoji: "🟢", frase: "a conexão está rápida" };
    if (ms < 5000) return { emoji: "🟡", frase: "a conexão está um pouco lenta, mas funcionando" };
    return { emoji: "🔴", frase: "a conexão está lenta agora; os pedidos podem demorar" };
}

/** "menos de 1 ms", "35 ms", "1,2 s". */
function ms(valor) {
    if (valor === null || valor === undefined) return "não deu para medir";
    if (valor < 1) return "menos de 1 ms";
    if (valor < 1000) return valor + " ms";
    return (valor / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " s";
}

module.exports = {
    name: "ping",
    aliases: ["p", "latencia", "pingvps", "vpsping", "pong"],
    category: "general",
    subcategory: "Utilidades",
    description: "Mostra se estou respondendo e quanto tempo levo para responder",
    examples: [" — confere se estou online e quão rápido respondo"],
    cooldownMs: 1500,
    execute: async ({ reply, info, prefix = "." }) => {
        const start = Date.now();

        // Tempo para consultar meus registros
        let dbLatency = null;
        try {
            const dbStart = Date.now();
            q("SELECT 1").get();
            dbLatency = Date.now() - dbStart;
        } catch (err) {
            logger.warn(`[PING] Não consegui medir a consulta aos registros: ${err.message}`);
        }

        // Atraso entre a pessoa enviar e a mensagem chegar até mim.
        // O WhatsApp informa a hora de envio em segundos, então é aproximado.
        const msgTimestamp = info?.messageTimestamp ? Number(info.messageTimestamp) * 1000 : null;
        const chegada = msgTimestamp ? Math.max(0, Date.now() - msgTimestamp) : null;

        const memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
        const processamento = Date.now() - start;
        const total = chegada === null ? null : chegada + processamento;
        const nota = avaliar(total);

        const doc = F.tela({
            emoji: "🏓",
            titulo: "Pong! Estou aqui",
            intro: `${nota.emoji} Recebi seu pedido e ${nota.frase}.` +
                (total !== null ? ` Tempo total: *${ms(total)}*.` : ""),
            secoes: [
                {
                    emoji: "⚡",
                    titulo: "Tempo de resposta",
                    linhas: [
                        F.campo("Sua mensagem até mim", chegada === null ? "não deu para medir" : "cerca de " + ms(chegada)),
                        F.campo("Para eu preparar a resposta", ms(processamento)),
                        F.campo("Para consultar meus registros", ms(dbLatency))
                    ]
                },
                {
                    emoji: "🖥️",
                    titulo: "Como estou",
                    linhas: [
                        F.campo("Funcionando sem parar há", duracao(process.uptime() * 1000)),
                        F.campo("Memória em uso", memUsed + " MB")
                    ]
                }
            ],
            dica: "Se o tempo até mim estiver alto, o atraso costuma ser da internet de quem enviou ou do próprio WhatsApp, não dos pedidos.",
            proximos: [
                { nome: "device", oque: "ver os dados da sua conexão e do seu aparelho" },
                { nome: "pingrede", oque: "testar a internet de onde eu estou" },
                { nome: "menu", oque: "ver tudo o que posso fazer" }
            ],
            prefix
        });

        return reply(doc);
    }
};
