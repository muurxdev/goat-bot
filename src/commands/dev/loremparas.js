/**
 * Comando .loremparas — Gera N parágrafos de texto Lorem: .loremparas [qtd=2]
 */
module.exports = {
    name: "loremparas",
    aliases: ["loremparas-cmd","cmd-loremparas","cmd_loremparas","alt_loremparas","atalho_loremparas","abrev_loremparas","call_loremparas","func_loremparas"],
    category: "dev",
    subcategory: "Dev",
    description: "Gera N parágrafos de texto Lorem: .loremparas [qtd=2]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const count = Math.min(5, Math.max(1, parseInt(args[0]) || 2));
            const p = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.";
            const paras = [];
            for (let i = 0; i < count; i++) paras.push(`[${i + 1}] ${p}`);
            return reply(`📄 *${count} Parágrafos Lorem:*\n\n${paras.join("\n\n")}`);
        }
};
