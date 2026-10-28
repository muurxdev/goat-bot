/**
 * Comando .festachapeu — Declara rodada aberta de diversão na taverna: .festachapeu
 */
module.exports = {
    name: "festachapeu",
    aliases: ["festachapeu-cmd","cmd-festachapeu"],
    category: "general",
    subcategory: "Taverna",
    description: "Declara rodada aberta de diversão na taverna: .festachapeu",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply("🎺🎻 *RODADA ABERTA NO BOAR HAT!*\n\nGOAT abriu um novo barril de cidra e o Guardião começou a dançar sapateado em cima do balcão!");
        }
};
