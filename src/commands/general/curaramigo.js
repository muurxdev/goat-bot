/**
 * Comando .curaramigo — Usa magia curativa de Princesa em alguém: .curaramigo [nome]
 */
module.exports = {
    name: "curaramigo",
    aliases: ["curaramigo-cmd","cmd-curaramigo"],
    category: "general",
    subcategory: "Cura",
    description: "Usa magia curativa de Princesa em alguém: .curaramigo [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "ferido";
            return reply(`💖✨ *TOQUE CURATIVO DE PRINCESA*\n\nAs feridas e arranhões de *${alvo}* desapareceram sob uma suave luz prateada! +1000 HP restaurados!`);
        }
};
