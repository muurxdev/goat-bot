/**
 * Comando .brindebarbeer — Faz um brinde com todos no Javali: .brindebarbeer
 */
module.exports = {
    name: "brindebarbeer",
    aliases: ["brindebarbeer-cmd","cmd-brindebarbeer"],
    category: "general",
    subcategory: "Taverna",
    description: "Faz um brinde com todos no Javali: .brindebarbeer",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🍻 *TIM-TIM! UM BRINDE À VIDA!*\n\nCanecas erguidas para cima! \"À amizade, às vitórias e aos Sete Traços Capitais! Saúde!\"");
        }
};
