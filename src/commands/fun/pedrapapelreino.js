/**
 * Comando .pedrapapelreino — Pedra, Papel e Tesoura temático: .pedrapapelreino <espada/escudo/magia>
 */
module.exports = {
    name: "pedrapapelreino",
    aliases: ["pedrapapelreino-cmd","cmd-pedrapapelreino"],
    category: "fun",
    subcategory: "Jogos",
    description: "Pedra, Papel e Tesoura temático: .pedrapapelreino <espada/escudo/magia>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const escolha = (args[0] || "").toLowerCase();
            const valid = ["espada", "escudo", "magia"];
            if (!valid.includes(escolha)) return reply("Uso: `.pedrapapelreino <espada|escudo|magia>`\n(Espada perfura Magia, Magia quebra Escudo, Escudo bloqueia Espada)");
            const bot = valid[Math.floor(Math.random() * valid.length)];
            let res = `▫️ Sua escolha: *${escolha.toUpperCase()}*\n▫️ ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤: *${bot.toUpperCase()}*\n\n`;
            if (escolha === bot) res += "🤝 Empate honrado de guerreiros!";
            else if ((escolha === "espada" && bot === "magia") || (escolha === "magia" && bot === "escudo") || (escolha === "escudo" && bot === "espada")) res += "🎉 *VOCÊ VENCEU A RODADA!*";
            else res += "💀 *➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ VENCEU!* A técnica dele superou a sua.";
            return reply(res);
        }
};
