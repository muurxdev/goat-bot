/**
 * Comando .asasdivinas — Abre as asas de luz do Clã das Deusas: .asasdivinas
 */
module.exports = {
    name: "asasdivinas",
    aliases: ["asasdivinas-cmd","cmd-asasdivinas"],
    category: "rpg",
    subcategory: "Poder",
    description: "Abre as asas de luz do Clã das Deusas: .asasdivinas",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`🪽 *ASAS DA GRAÇA DIVINA*\n\nAsas angelicais de pura luz dourada brotam das suas costas!\n▫️ *Velocidade de voo:* Instantânea\n▫️ *Resistência a trevas:* Imunidade temporária a maldições de nível inferior.`);
        }
};
