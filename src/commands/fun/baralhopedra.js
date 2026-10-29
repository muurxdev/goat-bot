/**
 * Comando .baralhopedra — Jogo rápido Pedra, Papel ou Tesoura Elemental: .baralhopedra <fogo/agua/planta>
 */
module.exports = {
    name: "baralhopedra",
    aliases: ["baralhopedra-cmd","cmd-baralhopedra"],
    category: "fun",
    subcategory: "Jogos",
    description: "Jogo rápido Pedra, Papel ou Tesoura Elemental: .baralhopedra <fogo/agua/planta>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const escolhas = ["fogo", "agua", "planta"];
            const p = (args[0] || "").toLowerCase();
            if (!escolhas.includes(p)) return reply("🔥💧🌿 *Duelo Elemental*\nUso: `.baralhopedra <fogo|agua|planta>`\n(Fogo queima Planta, Planta absorve Água, Água apaga Fogo)");
            const bot = escolhas[Math.floor(Math.random() * escolhas.length)];
            let res = `▫️ Você: *${p.toUpperCase()}*\n▫️ ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤: *${bot.toUpperCase()}*\n\n`;
            if (p === bot) {
                res += "🤝 *EMPATE ELEMENTAL!* As energias se anularam.";
            } else if ((p === "fogo" && bot === "planta") || (p === "agua" && bot === "fogo") || (p === "planta" && bot === "agua")) {
                res += "🎉 *VOCÊ VENCEU!* Seu elemento dominou o adversário!";
            } else {
                res += "💀 *➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ VENCEU!* Ele contra-atacou com vantagem elementar!";
            }
            return reply(res);
        }
};
