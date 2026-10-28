/**
 * Comando .jogodoserros — Encontre o caractere diferente na matriz: .jogodoserros
 */
module.exports = {
    name: "jogodoserros",
    aliases: ["jogodoserros-cmd","cmd-jogodoserros"],
    category: "fun",
    subcategory: "Jogos",
    description: "Encontre o caractere diferente na matriz: .jogodoserros",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply("👀 *JOGO DOS ERROS VISUAIS*\n\nEncontre o emoji diferente em menos de 10 segundos:\n\n🐷🐷🐷🐷🐷\n🐷🐷🐷🐷🐷\n🐷🐷🐗🐷🐷\n🐷🐷🐷🐷🐷\n\nResponda na mente e prove sua atenção de águia!");
        }
};
