/**
 * Comando .testeagilidade — Teste de tempo de reação rápida: .testeagilidade
 */
module.exports = {
    name: "testeagilidade",
    aliases: ["testeagilidade-cmd","cmd-testeagilidade"],
    category: "fun",
    subcategory: "Jogos",
    description: "Teste de tempo de reação rápida: .testeagilidade",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const ms = Math.floor(Math.random() * 250) + 120;
            return reply(`⚡ *TESTE DE REFLEXOS*\n\nVocê esquivou do golpe de Trovão em *${ms} milissegundos*!\nClassificação: *Reflexos de Cavaleiro Sagrado de Diamante!*`);
        }
};
