const { renderCard, formatXP, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");

module.exports = {
    name: "desafiootaku",
    aliases: ["quizexpert", "desafioanimepro", "otakuexpert"],
    category: "fun",
    description: "Desafio de quiz otaku avançado para veteranos de animes",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const resp = (args[0] || "").toUpperCase().trim();
        if (!resp) {
            const card = renderCard({
                title: "DESAFIO OTAKU EXPERT",
                icon: "⛩️",
                subtitle: "🧠 *Nível: Mestre dos Animes*",
                sections: [
                    {
                        title: "PERGUNTA DO DESAFIO",
                        icon: "❓",
                        fields: [
                            "📜 Qual o nome do clã original de GOAT antes de liderar os 7 Pecados?",
                            "A) Clã das Deusas",
                            "B) Clã dos Demônios (10 Mandamentos)",
                            "C) Cavaleiros Sagrados",
                            "D) Clã dos Druidas"
                        ]
                    }
                ],
                tip: "Responda com .desafiootaku B!",
                mentions: [sender]
            });
            return reply(card, [sender]);
        }

        if (resp === "B") {
            const xpData = dataService.getXpData();
            const user = initializeUser(sender, xpData);
            const { xpGanho, lvlRes } = adicionarXp(user, 500, { source: "rpg" });
            user.coins = (user.coins || 0) + 800;
            await dataService.saveXpData(xpData);

            const subiu = lvlRes.subiu ? "\n🆙 *Subiu de nível!* Agora nível " + user.level : "";
            return reply("🎉 *RESPOSTA CORRETA!* Letra B!\nGOAT era o temido líder dos 10 Mandamentos!\n🏆 +" + formatXP(xpGanho) + " & +" + formatCoins(800) + "!" + subiu);
        } else {
            return reply("❌ *RESPOSTA INCORRETA!* A resposta correta era a Letra B (Clã dos Demônios).");
        }
    }
};

