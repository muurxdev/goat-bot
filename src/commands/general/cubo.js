/**
 * Comando .cubo — Volume e área do cubo: .cubo <lado>
 */
module.exports = {
    name: "cubo",
    aliases: ["volumecubo","cube"],
    category: "general",
    subcategory: "Utilidades",
    description: "Volume e área do cubo: .cubo <lado>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const l=parseFloat((args[0]||'').replace(',','.')); if(isNaN(l)||l<=0) return reply('🧊 Uso: `.cubo <lado>`'); return reply(`🧊 *CUBO* (lado ${l})\n\n📦 Volume: *${(l**3).toFixed(2)}*\n📐 Área total: *${(6*l*l).toFixed(2)}*`); }
};
