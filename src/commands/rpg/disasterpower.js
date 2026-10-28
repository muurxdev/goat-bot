/**
 * Comando .disasterpower — Invoca a autoridade de Disaster sobre a natureza: .disasterpower
 */
module.exports = {
    name: "disasterpower",
    aliases: ["disasterpower-cmd","cmd-disasterpower"],
    category: "rpg",
    subcategory: "Magia",
    description: "Invoca a autoridade de Disaster sobre a natureza: .disasterpower",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🍃 *DISASTER (Desastre Natural)*\n\n▫️ *Descrição:* O poder inato concedido ao Rei das Fadas.\n▫️ *Efeito:* Transforma um leve arranhão em uma ferida fatal, ou um veneno suave em uma toxina paralisante imediata.`);
        }
};
