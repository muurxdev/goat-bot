/**
 * Comando .darabraco — Dá um abraço caloroso em alguém: .darabraco [nome]
 */
module.exports = {
    name: "darabraco",
    aliases: ["darabraco-cmd","cmd-darabraco"],
    category: "general",
    subcategory: "Interação",
    description: "Dá um abraço caloroso em alguém: .darabraco [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "alguém especial";
            return reply(`🤗 *ABRAÇO ACOLHEDOR!*\n\nVocê envolveu *${alvo}* em um abraço caloroso e reconfortante! As energias foram restauradas.`);
        }
};
