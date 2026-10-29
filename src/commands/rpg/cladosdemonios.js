/**
 * Comando .cladosdemonios — História e hierarquia do Clã dos Demônios: .cladosdemonios
 */
module.exports = {
    name: "cladosdemonios",
    aliases: ["cladosdemonios-cmd","cmd-cladosdemonios"],
    category: "rpg",
    subcategory: "Lore",
    description: "História e hierarquia do Clã dos Demônios: .cladosdemonios",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`👿 *CLÃ DOS DEMÔNIOS (Demon Clan)*\n\n▫️ *Soberano:* O Rei Demônio\n▫️ *Vanguarda:* Os Dez Preceitos (Cavaleiro, Rainha, Juiz, Feiticeira, etc.)\n▫️ *Líder Antigo:* ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ (O Pecado da Ira)\n▫️ *Traços:* Sete corações independentes, manipulação de Chamas Negras (Hellblaze) e regeneração celular via matéria escura.`);
        }
};
