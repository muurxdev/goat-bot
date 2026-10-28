/**
 * Comando .purificacao — Conjura feitiço druídico de purificação: .purificacao
 */
module.exports = {
    name: "purificacao",
    aliases: ["purificacao-cmd","cmd-purificacao"],
    category: "rpg",
    subcategory: "Cura",
    description: "Conjura feitiço druídico de purificação: .purificacao",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`🌿 *PURIFICAÇÃO DRUÍDICA*\n\nOs anciãos de Istar entoam os cânticos antigos...\n▫️ Todas as toxinas e venenos foram purificados.\n▫️ Vida e vigor restaurados em +500 HP!`);
        }
};
