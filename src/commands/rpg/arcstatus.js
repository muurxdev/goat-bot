/**
 * Comando .arcstatus — Manifesta partículas sagradas de Ark: .arcstatus
 */
module.exports = {
    name: "arcstatus",
    aliases: ["arcstatus-cmd","cmd-arcstatus"],
    category: "rpg",
    subcategory: "Magia",
    description: "Manifesta partículas sagradas de Ark: .arcstatus",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`✨ *ARK (Magia Divina das Deusas)*\n\n▫️ *Elemento:* Luz Cósmica\n▫️ *Propriedade:* Desintegração de trevas a nível subatômico\n▫️ *Eficácia:* 200% de dano bônus contra seres demoníacos do submundo.`);
        }
};
