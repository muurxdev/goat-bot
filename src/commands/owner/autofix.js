/**
 * Comando .autofix / .reparar / .selfheal
 * Executa diagnóstico profundo autônomo, corrige falhas e retorna o relatório de saúde
 */

const { runSelfHeal } = require("../../services/selfHealService");
const logger = require("../../core/logger");
const F = require("../../utils/formato");

module.exports = {
    name: "autofix",
    aliases: ["reparar", "selfheal", "fixbot", "verificarbot", "saudebot"],
    category: "owner",
    subcategory: "Infraestrutura",
    description: "Faço uma checagem geral, conserto o que der e digo como estou de saúde",
    examples: [" — checo dados salvos, arquivos temporários, comandos e ferramentas de mídia"],
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply, sender, prefix = "." }) => {
        await reply("🛠️ *Fazendo minha checagem geral...*\n\nVou olhar os dados salvos, arquivos temporários, comandos e ferramentas de mídia. Leva alguns segundos.");

        try {
            const result = await runSelfHeal();
            const { repaired, warnings, stats, allHealthy } = result;

            logger.info(`[AUTOFIX] Diagnóstico executado por ${sender} (Saudável: ${allHealthy})`);

            return reply(F.tela({
                prefix,
                emoji: allHealthy ? "🟢" : "🟡",
                titulo: allHealthy ? "Estou saudável" : `Checagem feita, com ${warnings.length} aviso(s)`,
                intro: allHealthy
                    ? "Não encontrei nenhum problema. O que dava para arrumar, já arrumei."
                    : "Arrumei o que consegui, mas alguns pontos precisam de você. Veja os avisos abaixo.",
                secoes: [
                    {
                        emoji: "⚠️", titulo: "Precisa de atenção",
                        linhas: F.lista(warnings || [])
                    },
                    {
                        emoji: "📊", titulo: "Como estou", linhas: [
                            F.campo("No ar há", stats.uptime),
                            F.campo("Memória em uso", `${stats.rss} (${stats.heapUsed} em dados)`),
                            F.campo("Dados salvos", stats.sqliteIntegrity || "não checados"),
                            F.campo("Comandos", stats.totalCommands !== undefined ? `${stats.totalCommands} (+ ${stats.totalAliases} nomes alternativos)` : null),
                            F.campo("Vídeos dos menus", stats.wallpapers || null),
                            F.campo("Cookies de mídia", stats.cookies)
                        ]
                    },
                    {
                        emoji: "🔧", titulo: "O que eu fiz",
                        linhas: F.lista(repaired || [], "✅")
                    }
                ],
                dica: allHealthy ? "" : "O motivo detalhado de cada aviso fica no log do dia.",
                proximos: [
                    { nome: "auditoria", oque: "ver grupos, aluguel e donos também" },
                    { nome: "falhas", oque: "ver os comandos que mais falharam" }
                ]
            }));
        } catch (err) {
            logger.error("[AUTOFIX ERROR]", err);
            return reply(F.tela({
                prefix,
                emoji: "❌",
                titulo: "A checagem parou no meio",
                intro: "Algo deu errado enquanto eu me checava. Nada foi apagado por causa disso.",
                dica: "O motivo detalhado ficou no log do dia.",
                proximos: [
                    { nome: "autofix", oque: "tentar de novo" },
                    { nome: "auditoria", oque: "ver um diagnóstico sem consertos" }
                ]
            }));
        }
    }
};
