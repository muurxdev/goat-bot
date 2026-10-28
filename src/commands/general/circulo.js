/**
 * Comando .circulo — Área e perímetro do círculo: .circulo <raio>
 */
module.exports = {
    name: "circulo",
    aliases: ["areacirculo","circle"],
    category: "general",
    subcategory: "Utilidades",
    description: "Área e perímetro do círculo: .circulo <raio>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const r=parseFloat((args[0]||'').replace(',','.')); if(isNaN(r)||r<=0) return reply('⭕ Uso: `.circulo <raio>`'); const area=Math.PI*r*r; const per=2*Math.PI*r; return reply(`⭕ *CÍRCULO* (raio ${r})\n\n📐 Área: *${area.toFixed(2)}*\n📏 Perímetro: *${per.toFixed(2)}*\n⌀ Diâmetro: *${(2*r)}*`); }
};
