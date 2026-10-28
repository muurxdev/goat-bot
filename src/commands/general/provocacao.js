/**
 * Comando .provocacao — Manda uma provocação amigável para um rival: .provocacao [nome]
 */
module.exports = {
    name: "provocacao",
    aliases: ["provocacao-cmd","cmd-provocacao"],
    category: "general",
    subcategory: "Interação",
    description: "Manda uma provocação amigável para um rival: .provocacao [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu adversário";
            return reply(`😏 *PROVOCAÇÃO DE COMBATE*\n\nVocê olhou para *${alvo}* e disse: "É só isso o que você tem? Meu aquecimento foi mais difícil!"`);
        }
};
