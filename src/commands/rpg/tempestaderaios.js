/**
 * Comando .tempestaderaios — Dispara a magia Thunderbolt de Trovão: .tempestaderaios
 */
module.exports = {
    name: "tempestaderaios",
    aliases: ["tempestaderaios-cmd","cmd-tempestaderaios"],
    category: "rpg",
    subcategory: "Magia",
    description: "Dispara a magia Thunderbolt de Trovão: .tempestaderaios",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const dano = Math.floor(Math.random() * 600) + 300;
            return reply(`⚡ *THUNDERBOLT (Trovão Imperial)*\n\nUm raio rasga os céus Central direto na direção do solo!\n⚡ *Dano de Choque:* *${dano} Volts* elétricos\nOponente paralisado por 1 rodada.`);
        }
};
