/**
 * Comando .comandocount / .totalcomandos / .cmdcount
 * Exibe a contagem exata e dinâmica de todos os comandos e aliases carregados no bot
 */

const { renderCard, formatNumber } = require("../../utils/uiEngine");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "comandocount",
    aliases: ["totalcomandos", "cmdcount", "qtdcomandos", "quantoscomandos", "contagemcomandos"],
    category: "general",
    subcategory: "Informação",
    description: "Conta quantos comandos e atalhos eu tenho, por categoria",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const dispatcher = require("../../handlers/commandDispatcher");
        const totalCmds = dispatcher.commands.size;
        const totalAliases = dispatcher.aliases.size;

        const cats = {};
        for (const [_, cmd] of dispatcher.commands) {
            const cat = (cmd.category || "outros").toUpperCase();
            cats[cat] = (cats[cat] || 0) + 1;
        }

        const catFields = Object.entries(cats).map(([c, count]) => `• *${c}:* ${count} Comandos`);

        const card = renderCard({
            title: "MEUS COMANDOS",
            icon: "⚡",
            subtitle: `📜 *Tudo o que eu, ${getBotName()}, sei fazer*`,
            sections: [
                {
                    title: "MÉTRICAS GERAIS",
                    icon: "📊",
                    fields: [
                        { label: "Comandos", value: `🏆 *${totalCmds} comandos*`, icon: "📜" },
                        { label: "Atalhos", value: `⚡ *${totalAliases} atalhos*`, icon: "🏷️" },
                        { label: "Jeitos de chamar", value: `🌟 *${totalCmds + totalAliases} nomes diferentes*`, icon: "🔥" }
                    ]
                },
                {
                    title: "DISTRIBUIÇÃO POR CATEGORIA",
                    icon: "📂",
                    fields: catFields
                }
            ],
            tip: "Digite .menu all para navegar por todos os comandos catalogados!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

