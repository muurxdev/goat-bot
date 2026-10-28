/**
 * Comando .duelodemagias — Disputa mágica rápida entre dois feitiços: .duelodemagias
 */
module.exports = {
    name: "duelodemagias",
    aliases: ["duelodemagias-cmd","cmd-duelodemagias"],
    category: "fun",
    subcategory: "Jogos",
    description: "Disputa mágica rápida entre dois feitiços: .duelodemagias",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🔮💥 *CONFRONTO DE FEITIÇOS*\n\n[Ark Divino] ⚡ VS ⚡ [Hellblaze Negra]\nAs energias colidiram no centro da arena criando uma onda de choque cegante!");
        }
};
