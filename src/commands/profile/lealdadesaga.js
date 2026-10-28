/**
 * Comando .lealdadesaga — Verifica seu voto de lealdade ao capitão GOAT: .lealdadesaga
 */
module.exports = {
    name: "lealdadesaga",
    aliases: ["lealdadesaga-cmd","cmd-lealdadesaga"],
    category: "profile",
    subcategory: "Status",
    description: "Verifica seu voto de lealdade ao capitão GOAT: .lealdadesaga",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🐉 *LEALDADE AO PECADO DA IRA*\n\n▫️ Voto selado com sangue de dragão.\n▫️ Enquanto a chama do Reino arder, sua espada defenderá o capitão!");
        }
};
