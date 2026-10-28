/**
 * Comando .cacatesouro — Escolha entre 3 baús misteriosos (1, 2 ou 3) para ver o que encontra
 */
module.exports = {
    name: "cacatesouro",
    aliases: ["tresbaus"],
    category: "fun",
    subcategory: "Jogos",
    description: "Escolha entre 3 baús misteriosos (1, 2 ou 3) para ver o que encontra",
    cooldownMs: 2000,
    execute: async ({ args, reply }) => {
            const pick = parseInt(args[0], 10);
            if (![1, 2, 3].includes(pick)) {
                return reply('🏴‍☠️ *CAÇA AO TESOURO*\n\nExistem 3 baús à sua frente!\nDigite: `.cacatesouro 1`, `.cacatesouro 2` ou `.cacatesouro 3`');
            }
            const prizeChamber = Math.floor(Math.random() * 3) + 1;
            if (pick === prizeChamber) {
                return reply(`🎁 *BAÚ #${pick} ABERTO!*\n\n✨ 🎉 *INCRÍVEL!* Você encontrou um tesouro com jóias e relíquias de ouro!`);
            }
            return reply(`📦 *BAÚ #${pick} ABERTO!*\n\n💨 *Vazio!* Havia apenas teias de aranha e poeira antiga. O tesouro estava no baú #${prizeChamber}.`);
        }
};
