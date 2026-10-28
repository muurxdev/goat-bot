/**
 * Comando .rankherois — Classificação fictícia dos guerreiros mais valentes: .rankherois
 */
module.exports = {
    name: "rankherois",
    aliases: ["rankherois-cmd","cmd-rankherois"],
    category: "fun",
    subcategory: "Status",
    description: "Classificação fictícia dos guerreiros mais valentes: .rankherois",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🏆 *RANKING DOS GUERREIROS CENTRAL*\n\n🥇 1º Lugar: Herói (Poder Absoluto)\n🥈 2º Lugar: GOAT (Modo Assalto)\n🥉 3º Lugar: Ban (Pós-Purgatório)\n4º Lugar: King (Asas Despertadas)\n5º Lugar: Mago (Coração Restaurado)");
        }
};
