/**
 * Comando .agendarmensagem / .avisoprogramado
 * Agenda um aviso para ser enviado no grupo depois de um tempo. O agendamento
 * fica gravado (services/scheduledMessageService) e sobrevive a reinício do bot.
 */

const scheduledMessageService = require("../../services/scheduledMessageService");
const logger = require("../../core/logger");

const UNIDADES = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
const LIMITE_MS = 7 * UNIDADES.d;

// Comandos são carregados no boot: é aqui que o relógio dos avisos gravados
// antes de um reinício volta a funcionar.
scheduledMessageService.iniciarRelogio();

function horario(ts) {
    return new Date(ts).toLocaleString("pt-BR", {
        timeZone: process.env.BOT_TIMEZONE || "America/Sao_Paulo",
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
    });
}

module.exports = {
    name: "agendarmensagem",
    aliases: ["avisoprogramado","lembretegrupo","agendaraviso","schedulemsg","cmd_agendarmensagem","alt_agendarmensagem","atalho_agendarmensagem","abrev_agendarmensagem","call_agendarmensagem","func_agendarmensagem"],
    category: "admin",
    description: "Programa um aviso para ser enviado automaticamente no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, reply, args = [], sender, prefix = "." }) => {
        const sub = (args[0] || "").toLowerCase();

        if (["lista", "listar", "ver"].includes(sub)) {
            const pendentes = scheduledMessageService.listar(from);
            if (!pendentes.length) return reply("🗓️ Não há avisos agendados neste grupo.");
            const linhas = pendentes.map((p, i) => `${i + 1}. ${horario(p.quando)} — ${p.texto.slice(0, 60)}${p.texto.length > 60 ? "…" : ""}`);
            return reply(`🗓️ *Avisos agendados*\n\n${linhas.join("\n")}\n\nPara cancelar: \`${prefix}agendarmensagem cancelar <número>\``);
        }

        if (["cancelar", "remover", "apagar"].includes(sub)) {
            const removido = await scheduledMessageService.cancelar(from, args[1]);
            if (!removido) return reply(`❓ Diga o número do aviso, como aparece em \`${prefix}agendarmensagem lista\`.`);
            logger.info(`[AGENDAMENTO] ${sender} cancelou ${removido.id} em ${from}`);
            return reply(`✅ Cancelei o aviso de ${horario(removido.quando)}.`);
        }

        const match = sub.match(/^(\d+)(s|m|h|d)$/);
        const texto = args.slice(1).join(" ").trim();

        if (!match || !texto) {
            return reply(
                `📢 *Agendar um aviso*\n\n` +
                `Uso: \`${prefix}agendarmensagem <tempo> <mensagem>\`\n\n` +
                `• \`${prefix}agendarmensagem 10m O evento da guilda começa em 10 minutos!\`\n` +
                `• \`${prefix}agendarmensagem 2h Lembrete: o grupo fecha às 22h\`\n\n` +
                `O tempo vai em \`s\`, \`m\`, \`h\` ou \`d\` (até 7 dias).\n` +
                `Ver os agendados: \`${prefix}agendarmensagem lista\``
            );
        }

        const atrasoMs = parseInt(match[1], 10) * UNIDADES[match[2]];
        if (atrasoMs < 10 * 1000) return reply("⏳ Agende para daqui a pelo menos 10 segundos.");
        if (atrasoMs > LIMITE_MS) return reply("⏳ Consigo agendar para no máximo 7 dias à frente.");

        const quando = Date.now() + atrasoMs;
        const resultado = await scheduledMessageService.agendar(from, { texto, quando, criadoPor: sender });
        if (!resultado.ok) {
            return reply(`⚠️ Este grupo já tem ${scheduledMessageService.MAX_POR_GRUPO} avisos agendados. Cancele algum em \`${prefix}agendarmensagem lista\`.`);
        }

        logger.info(`[AGENDAMENTO] ${sender} agendou ${resultado.item.id} em ${from} para ${new Date(quando).toISOString()}`);
        return reply(`✅ Pronto! Mando o aviso aqui em ${horario(quando)}.`);
    }
};
