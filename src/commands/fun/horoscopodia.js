/**
 * Comando .horoscopodia — Previsão astrológica para o seu dia: .horoscopodia
 */
module.exports = {
    name: "horoscopodia",
    aliases: ["horoscopodia-cmd","cmd-horoscopodia"],
    category: "fun",
    subcategory: "Horóscopo",
    description: "Previsão astrológica para o seu dia: .horoscopodia",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("⭐ *PREVISÃO ASTRAL DO DIA*\n\n▫️ *Amor:* Chances elevadas de reencontros inesperados!\n▫️ *Finanças:* Cuidado com gastos por impulso no Javali.\n▫️ *Sorte:* Cor do dia: Dourado solar.\n▫️ *Elemento protetor:* Chama Sagrada.");
        }
};
