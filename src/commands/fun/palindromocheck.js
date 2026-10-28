/**
 * Comando .palindromocheck — Verifica se uma palavra ou frase é palíndromo: .palindromocheck <texto>
 */
module.exports = {
    name: "palindromocheck",
    aliases: ["palindromocheck-cmd","cmd-palindromocheck"],
    category: "fun",
    subcategory: "Texto",
    description: "Verifica se uma palavra ou frase é palíndromo: .palindromocheck <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const raw = args.join(" ");
            if (!raw) return reply("Uso: `.palindromocheck <texto>`");
            const clean = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
            const rev = clean.split("").reverse().join("");
            const isPal = clean.length > 1 && clean === rev;
            return reply(isPal ? `✅ *"${raw}"* É um PALÍNDROMO! (Lê igual de trás pra frente)` : `❌ *"${raw}"* NÃO é um palíndromo.`);
        }
};
