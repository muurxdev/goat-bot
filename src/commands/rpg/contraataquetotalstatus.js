/**
 * Comando .contraataquetotalstatus — Verifica a prontidão do Contra-ataque Total: .contraataquetotalstatus
 */
module.exports = {
    name: "contraataquetotalstatus",
    aliases: ["contraataquetotalstatus-cmd","cmd-contraataquetotalstatus"],
    category: "rpg",
    subcategory: "Combate",
    description: "Verifica a prontidão do Contra-ataque Total: .contraataquetotalstatus",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🗡️ *FULL COUNTER (Reação Total)*\n\n▫️ *➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤:* Reflete qualquer magia de volta com mais que o dobro do impacto!\n▫️ *Titã:* Contra-ataque Total físico — reflete impactos e golpes brutos!\n▫️ *Requisito:* Tempo de reação perfeito e timing exato do projétil.`);
        }
};
