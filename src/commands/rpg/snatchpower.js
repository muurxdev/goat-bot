/**
 * Comando .snatchpower — Usa Snatch para roubar atributos do oponente: .snatchpower
 */
module.exports = {
    name: "snatchpower",
    aliases: ["snatchpower-cmd","cmd-snatchpower"],
    category: "rpg",
    subcategory: "Combate",
    description: "Usa Snatch para roubar atributos do oponente: .snatchpower",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const roubo = Math.floor(Math.random() * 40) + 15;
            return reply(`🦊 *SNATCH (Roubo de Ban)*\n\nUm estalo com os dedos e as forças do inimigo escorrem para você!\n▫️ *Atributo roubado:* ${roubo}% da força física do adversário\n▫️ *Efeito Hunter Fest:* Seus músculos se expandem com o vigor roubado!`);
        }
};
