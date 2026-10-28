/**
 * Comando .termofake — Desafio de adivinhação da palavra secreta: .termofake <palavra>
 */
module.exports = {
    name: "termofake",
    aliases: ["termofake-cmd","cmd-termofake"],
    category: "fun",
    subcategory: "Jogos",
    description: "Desafio de adivinhação da palavra secreta: .termofake <palavra>",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const palpite = (args[0] || "").toUpperCase();
            if (palpite.length !== 5) return reply("🟩 *TERMO SAGA*\nTente adivinhar uma palavra de 5 letras!\nUso: `.termofake PECAR`");
            const secreta = "FADAS";
            let visual = "";
            for (let i = 0; i < 5; i++) {
                if (palpite[i] === secreta[i]) visual += "🟩";
                else if (secreta.includes(palpite[i])) visual += "🟨";
                else visual += "⬛";
            }
            return reply(`🟩 *RESULTADO DO TERMO*\nPalpite: ${palpite}\nFeedback: ${visual}\n\n🟩 = Letra e posição certas\n🟨 = Letra certa, posição errada\n⬛ = Letra não existe na palavra`);
        }
};
