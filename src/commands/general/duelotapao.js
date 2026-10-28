/**
 * Comando .duelotapao — Duelo de quem aguenta mais tempo sem rir: .duelotapao [nome]
 */
module.exports = {
    name: "duelotapao",
    aliases: ["duelotapao-cmd","cmd-duelotapao"],
    category: "general",
    subcategory: "Combate",
    description: "Duelo de quem aguenta mais tempo sem rir: .duelotapao [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu rival";
            return reply(`😂👀 *DISPUTA DO OLHO NO OLHO!*\n\nVocê e *${alvo}* ficaram se encarando seriamente por 30 segundos até os dois caírem na gargalhada!`);
        }
};
