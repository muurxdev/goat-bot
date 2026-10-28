/**
 * Comando .anagramacheck — Verifica se duas palavras são anagramas perfeitos: .anagramacheck <palavra1> <palavra2>
 */
module.exports = {
    name: "anagramacheck",
    aliases: ["anagramacheck-cmd","cmd-anagramacheck"],
    category: "fun",
    subcategory: "Jogos",
    description: "Verifica se duas palavras são anagramas perfeitos: .anagramacheck <palavra1> <palavra2>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("Uso: `.anagramacheck <palavra1> <palavra2>`");
            const clean = s => s.toLowerCase().replace(/[^a-z]/g, "").split("").sort().join("");
            const isAna = clean(args[0]) === clean(args[1]);
            return reply(isAna ? `✅ *"${args[0]}"* e *"${args[1]}"* SÃO ANAGRAMAS PERFEITOS!` : `❌ As palavras NÃO são anagramas.`);
        }
};
