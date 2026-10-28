/**
 * Comando .sussurro — Formata seu texto em estilo sussurrado: .sussurro <mensagem>
 */
module.exports = {
    name: "sussurro",
    aliases: ["sussurro-cmd","cmd-sussurro"],
    category: "fun",
    subcategory: "Texto",
    description: "Formata seu texto em estilo sussurrado: .sussurro <mensagem>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const m = args.join(" ");
            if (!m) return reply("Uso: `.sussurro <mensagem>`");
            return reply(`🤫 *sussurrando...*\n_... ${m.toLowerCase()} ..._`);
        }
};
