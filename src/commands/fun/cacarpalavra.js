/**
 * Comando .cacarpalavra — Gera um mini caça-palavras de 5x5: .cacarpalavra
 */
module.exports = {
    name: "cacarpalavra",
    aliases: ["cacarpalavra-cmd","cmd-cacarpalavra"],
    category: "fun",
    subcategory: "Jogos",
    description: "Gera um mini caça-palavras de 5x5: .cacarpalavra",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let grid = "";
            for (let r = 0; r < 5; r++) {
                let linha = "";
                for (let c = 0; c < 5; c++) {
                    linha += letras[Math.floor(Math.random() * letras.length)] + " ";
                }
                grid += linha + "\n";
            }
            return reply(`🔍 *MINI CAÇA-PALAVRAS*\n\n\`\`\`\n${grid}\`\`\`\nDica: Procure nomes curtos ou iniciais de cavaleiros!`);
        }
};
