/**
 * Comando .elixirimortal — Examina a taça da Fonte da Juventude: .elixirimortal
 */
module.exports = {
    name: "elixirimortal",
    aliases: ["elixirimortal-cmd","cmd-elixirimortal"],
    category: "rpg",
    subcategory: "Item",
    description: "Examina a taça da Fonte da Juventude: .elixirimortal",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`🍷 *FONTE DA JUVENTUDE (Elixir da Imortalidade)*\n\n▫️ Quem bebe uma única gota ganha 10 anos de vida.\n▫️ Quem bebe a taça inteira torna-se completamente imortal, como Ban!\n▫️ Protegida pela Santa Elaine por centenas de anos nas copas da Floresta das Fadas.`);
        }
};
