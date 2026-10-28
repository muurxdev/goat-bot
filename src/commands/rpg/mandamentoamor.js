/**
 * Comando .mandamentoamor — Testa a maldição do Mandamento do Amor (Titã): .mandamentoamor
 */
module.exports = {
    name: "mandamentoamor",
    aliases: ["mandamentoamor-cmd","cmd-mandamentoamor"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa a maldição do Mandamento do Amor (Titã): .mandamentoamor",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🖤 *MANDAMENTO DO AMOR (Titã)*\n\n"Qualquer um que abrigar ódio em seu coração perderá toda a capacidade de empunhar uma espada ou ferir qualquer ser vivo."\n⚠️ Força física e magia zeradas para quem sentir raiva!`);
        }
};
