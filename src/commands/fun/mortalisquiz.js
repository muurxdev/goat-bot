/**
 * Comando .mortalisquiz — Enigma mortal dos mandamentos antigos: .mortalisquiz
 */
module.exports = {
    name: "mortalisquiz",
    aliases: ["mortalisquiz-cmd","cmd-mortalisquiz"],
    category: "fun",
    subcategory: "Quiz",
    description: "Enigma mortal dos mandamentos antigos: .mortalisquiz",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("💀 *ENIGMA DO PURGATÓRIO*\n\n\"Eu não tenho voz, mas grito; não tenho asas, mas vôo; não tenho dentes, mas mordo.\"\nQuem sou eu?\n\n▫️ *Resposta:* ||O Vento!||");
        }
};
