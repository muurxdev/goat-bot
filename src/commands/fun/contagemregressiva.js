/**
 * Comando .contagemregressiva — Inicia uma contagem regressiva para duelo: .contagemregressiva
 */
module.exports = {
    name: "contagemregressiva",
    aliases: ["contagemregressiva-cmd","cmd-contagemregressiva"],
    category: "fun",
    subcategory: "Jogos",
    description: "Inicia uma contagem regressiva para duelo: .contagemregressiva",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply("⏳ *CONTAGEM REGRESSIVA PARA O DUELO!*\n\n3️⃣... Armas desembainhadas!\n2️⃣... Magia concentrada!\n1️⃣... Olhos fixos no adversário!\n💥 *QUE O COMBATE COMECE!*");
        }
};
