/**
 * Comando .campominado
 * Campo minado 4x4 interativo no chat
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "campominado",
    aliases: ["minado", "minesweeper", "jogominas"],
    category: "fun",
    description: "Campo minado 4x4 interativo no chat",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const pos = (args[0] || "").toUpperCase().trim();
    if (!pos) {
        const card = renderCard({
            title: "CAMPO MINADO 4x4",
            icon: "💣",
            subtitle: "🎯 *Jogador:* @" + sender.split("@")[0],
            sections: [
                {
                    title: "TABULEIRO DE MINAS",
                    icon: "🗺️",
                    fields: [
                        "    A   B   C   D",
                        "1 [ ❓ ][ ❓ ][ ❓ ][ ❓ ]",
                        "2 [ ❓ ][ ❓ ][ ❓ ][ ❓ ]",
                        "3 [ ❓ ][ ❓ ][ ❓ ][ ❓ ]",
                        "4 [ ❓ ][ ❓ ][ ❓ ][ ❓ ]"
                    ]
                }
            ],
            tip: "Envie .campominado <coordenada> (ex: .campominado B2)!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }

    const explodiu = Math.random() < 0.25;
    if (explodiu) {
        return reply("💥 *BOOOOOOM!* Você pisou em uma mina na casa *" + pos + "*! Fim de jogo!");
    } else {
        return reply("🟢 *CASA SEGURA!* A coordenada *" + pos + "* está livre de minas! +150 Coins!");
    }
}
};
