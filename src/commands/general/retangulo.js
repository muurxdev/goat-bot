/**
 * Comando .retangulo — Área e perímetro do retângulo: .retangulo <base> <altura>
 */
module.exports = {
    name: "retangulo",
    aliases: ["arearetangulo","rectangle"],
    category: "general",
    subcategory: "Utilidades",
    description: "Área e perímetro do retângulo: .retangulo <base> <altura>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const b=parseFloat((args[0]||'').replace(',','.')); const h=parseFloat((args[1]||'').replace(',','.')); if(isNaN(b)||isNaN(h)) return reply('▭ Uso: `.retangulo <base> <altura>`'); return reply(`▭ *RETÂNGULO* (${b} × ${h})\n\n📐 Área: *${(b*h).toFixed(2)}*\n📏 Perímetro: *${(2*(b+h)).toFixed(2)}*`); }
};
