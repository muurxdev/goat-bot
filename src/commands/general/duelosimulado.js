/**
 * Comando .duelosimulado — Simula um sparring de cavalaria sem armas reais: .duelosimulado [nome]
 */
module.exports = {
    name: "duelosimulado",
    aliases: ["duelosimulado-cmd","cmd-duelosimulado"],
    category: "general",
    subcategory: "Combate",
    description: "Simula um sparring de cavalaria sem armas reais: .duelosimulado [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "outro cavaleiro";
            return reply(`⚔️ *SPARRING TÉCNICO*\n\nVocê e *${alvo}* treinaram esquivas e contra-golpes por 15 minutos! Placar técnico: Empate elegante.`);
        }
};
