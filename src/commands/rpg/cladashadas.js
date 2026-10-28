/**
 * Comando .cladashadas — Consulta segredos da Floresta das Fadas: .cladashadas
 */
module.exports = {
    name: "cladashadas",
    aliases: ["cladashadas-cmd","cmd-cladashadas"],
    category: "rpg",
    subcategory: "Lore",
    description: "Consulta segredos da Floresta das Fadas: .cladashadas",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🧚 *CLÃ DAS FADAS (Fairy Clan)*\n\n▫️ *Guardião:* Árvore Sagrada & Fonte da Juventude\n▫️ *Reis Notáveis:* Gloxinia (1º Rei), Dahlia (2º Rei), Harlequin (King - 3º Rei)\n▫️ *Habilidade Chave:* *Disaster* (Controle biológico, venenos, regeneração de plantas)\n▫️ *Natureza:* Nascem de flores e árvores, não mentem e possuem leitura do coração alheio.`);
        }
};
