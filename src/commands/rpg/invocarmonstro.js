/**
 * Comando .invocarmonstro — Invoca uma criatura das selvas do Reino: .invocarmonstro
 */
module.exports = {
    name: "invocarmonstro",
    aliases: ["invocarmonstro-cmd","cmd-invocarmonstro"],
    category: "rpg",
    subcategory: "Batalha",
    description: "Invoca uma criatura das selvas do Reino: .invocarmonstro",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const monstros = [
                "Lobo da Floresta Negra (Nível 15)",
                "Cão Tirano das Montanhas (Nível 28)",
                "Salamandra de Fogo de Torre (Nível 35)",
                "Wyvern Menor dos Céus Central (Nível 42)",
                "Tritão do Lago Sagrado (Nível 50)"
            ];
            const m = monstros[Math.floor(Math.random() * monstros.length)];
            return reply(`🐾 *BESTIÁRIO DE REINO*\n\nUm monstro selvagem foi encontrado nos arredores!\n👾 *Criatura:* ${m}\nPrepare suas armas para a batalha!`);
        }
};
