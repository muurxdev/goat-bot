/**
 * Comando .advinhenumero — Adivinhe o número secreto de 1 a 10: .advinhenumero <palpite>
 */
module.exports = {
    name: "advinhenumero",
    aliases: ["advinhenumero-cmd","cmd-advinhenumero"],
    category: "fun",
    subcategory: "Jogos",
    description: "Adivinhe o número secreto de 1 a 10: .advinhenumero <palpite>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const p = parseInt(args[0]);
            if (isNaN(p) || p < 1 || p > 10) return reply("🔢 Uso: `.advinhenumero <número de 1 a 10>`");
            const segredo = Math.floor(Math.random() * 10) + 1;
            if (p === segredo) return reply(`🎉 *ACERTO EM CHEIO!* O número secreto era exatamente *${segredo}*!`);
            return reply(`❌ Quase! Você escolheu *${p}*, mas o número secreto era *${segredo}*.`);
        }
};
