/**
 * Comando .selaralianca — Sela uma aliança eterna entre dois clãs: .selaralianca [cla1] [cla2]
 */
module.exports = {
    name: "selaralianca",
    aliases: ["selaralianca-cmd","cmd-selaralianca"],
    category: "general",
    subcategory: "Social",
    description: "Sela uma aliança eterna entre dois clãs: .selaralianca [cla1] [cla2]",
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            const c1 = args[0] || "Clã das Fadas", c2 = args[1] || "Clã dos Gigantes";
            return reply(`🤝📜 *TRATADO DE ALIANÇA ETERNA*\n\nOs líderes de *${c1}* e *${c2}* assinaram o pacto de não agressão e socorro mútuo! A paz reinará entre os povos!`);
        }
};
