/**
 * Comando .conquistastatus — Exibe o painel de conquistas heroicas desbloqueadas: .conquistastatus
 */
module.exports = {
    name: "conquistastatus",
    aliases: ["conquistastatus-cmd","cmd-conquistastatus"],
    category: "profile",
    subcategory: "Conquistas",
    description: "Exibe o painel de conquistas heroicas desbloqueadas: .conquistastatus",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🏆 *PAINEL DE CONQUISTAS DE REINO*\n\n✅ [Veterano da Taverna] — Bebeu 50 canecos no Javali\n✅ [Amigo dos Pecados] — Completou 10 missões de guilda\n🔒 [Matador de Albions] — Derrote 1 Albion em combate\n🔒 [Lenda Viva] — Atinja o Rank Diamante de Cavaleiro Sagrado\n\nProgresso Geral: 50% concluído.");
        }
};
