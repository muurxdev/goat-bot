/**
 * Comando .ferreiro / .desmanchar / .fundir
 * Desmanche itens antigos do inventário e obtenha minérios sagrados e lingotes
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "ferreiro",
    aliases: ["desmanchar", "fundir", "ferraria", "reciclar-item"],
    category: "rpg",
    description: "Desmanche itens e armas obsoletas para recuperar lingotes de ferro e moedas",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.rpg = user.rpg || {};
        user.rpg.minerais = user.rpg.minerais || 0;

        const sub = (args[0] || "").toLowerCase().trim();

        if (!sub || sub === "status" || sub === "ajuda") {
            const card = renderCard({
                title: "OFICINA DO FERREIRO SAGRADO",
                icon: "🔨",
                subtitle: `⚒️ *Mestre Forjador:* @${sender.split("@")[0]}`,
                sections: [
                    {
                        title: "SEUS MATERIAIS DE FORJA",
                        icon: "📦",
                        fields: [
                            { label: "Lingotes / Minerais", value: `${user.rpg.minerais || 0} Unidades`, icon: "🪙" },
                            { label: "Fragmentos Sagrados", value: `${user.rpg.fragmentos || 0} Fragmentos`, icon: "💎" }
                        ]
                    },
                    {
                        title: "OPERAÇÕES DISPONÍVEIS",
                        icon: "⚙️",
                        fields: [
                            "• `.ferreiro sucata` ➔ Converte restos de caça em minérios e moedas",
                            "• `.ferreiro lingote <qtd>` ➔ Funde minérios em lingotes de ferro puro",
                            "• `.forjar upgrade` ➔ Aprimora suas armas com os materiais obtidos"
                        ]
                    }
                ],
                tip: "Use os lingotes obtidos para acelerar a evolução das suas armas!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        if (sub === "sucata" || sub === "desmanchar" || sub === "limpar") {
            const ganhoMinerais = Math.floor(Math.random() * 8) + 3;
            const ganhoCoins = Math.floor(Math.random() * 500) + 200;

            user.rpg.minerais = (user.rpg.minerais || 0) + ganhoMinerais;
            user.coins = (user.coins || 0) + ganhoCoins;

            await dataService.saveXpData(xpData);

            return reply(`🔨 *DESMANCHE REALIZADO COM SUCESSO!*\n\n⚒️ O ferreiro reciclou suas sucatas antigas.\n🪙 *Minerais Obtidos:* +${ganhoMinerais} Lingotes\n💰 *Moedas Recuperadas:* +${formatCoins(ganhoCoins)}`);
        }

        return reply("❌ Opção não reconhecida! Digite `.ferreiro` para ver as opções.");
    }
};

