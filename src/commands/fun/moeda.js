/**
 * Comando .moeda
 * Lança uma moeda com física e resultado de Cara ou Coroa
 */

module.exports = {
    name: "moeda",
    aliases: ["flipcoin", "girarmoeda", "jogarmoeda"],
    category: "fun",
    description: "Jogue uma moeda para cima e veja se cai Cara ou Coroa",
    execute: async ({ reply }) => {
        const isCara = Math.random() < 0.5;
        const result = isCara ? "👑 CARA" : "🪙 COROA";

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║       🪙 *CARA OU COROA* 🪙      ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🌀 *A moeda girou no ar e caiu em:* \n\n`;
        doc += `👉 ✨ *${result}* ✨\n\n`;
        doc += `🎯 _Decisão selada pelos deuses do Reino!_`;

        return reply(doc.trim());
    }
};

