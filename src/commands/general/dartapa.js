/**
 * Comando .dartapa — Dá um tapa cômico de advertência em alguém: .dartapa [nome]
 */
module.exports = {
    name: "dartapa",
    aliases: ["dartapa-cmd","cmd-dartapa"],
    category: "general",
    subcategory: "Interação",
    description: "Dá um tapa cômico de advertência em alguém: .dartapa [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "alguém folgado";
            return reply(`👋💥 *PLAF!*\n\nVocê deu um tapa estalado nas costas de *${alvo}* como o Guardião faz quando ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ passa dos limites!`);
        }
};
