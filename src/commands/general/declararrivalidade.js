/**
 * Comando .declararrivalidade — Declara uma rivalidade saudável de crescimento mútuo: .declararrivalidade [nome]
 */
module.exports = {
    name: "declararrivalidade",
    aliases: ["declararrivalidade-cmd","cmd-declararrivalidade"],
    category: "general",
    subcategory: "Social",
    description: "Declara uma rivalidade saudável de crescimento mútuo: .declararrivalidade [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu rival";
            return reply(`⚡🔥 *RIVALIDADE DECLARADA!*\n\n"A partir de hoje, *${alvo}*, nós competiremos para ver quem se torna o cavaleiro mais forte do Reino!"`);
        }
};
