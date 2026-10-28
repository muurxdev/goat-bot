/**
 * Comando .altarceleste — Faz uma prece no Altar Celeste do Clã das Deusas: .altarceleste
 */
module.exports = {
    name: "altarceleste",
    aliases: ["altarceleste-cmd","cmd-altarceleste"],
    category: "rpg",
    subcategory: "Exploração",
    description: "Faz uma prece no Altar Celeste do Clã das Deusas: .altarceleste",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const bencaos = [
                "Bênção da Graça do Oceano (Tarmiel) — Regenera 25% de vida!",
                "Bênção da Graça do Tornado (Sariel) — Aumenta evasão em 30%!",
                "Bênção da Graça do Flash (Anjo) — Velocidade extrema concedida!",
                "Bênção da Graça do Sol (Ardente) — Seu poder de fogo escala ao meio-dia!",
                "Luz Purificadora do Céu — Todos os efeitos de sangramento foram removidos!"
            ];
            const b = bencaos[Math.floor(Math.random() * bencaos.length)];
            return reply(`🕊️ *ALTAR CELESTE DAS DEUSAS*\n\nVocê ajoelha diante da estátua da Suprema Divindade...\nUma luz cálida desce sobre o seu corpo!\n\n✨ *Efeito recebido:* ${b}`);
        }
};
