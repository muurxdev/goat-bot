/**
 * Comando .trapezio — Área do trapézio: .trapezio <base maior> <base menor> <altura>
 */
module.exports = {
    name: "trapezio",
    aliases: ["areatrapezio","trapezoid"],
    category: "general",
    subcategory: "Utilidades",
    description: "Área do trapézio: .trapezio <base maior> <base menor> <altura>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const B=parseFloat((args[0]||'').replace(',','.')); const b=parseFloat((args[1]||'').replace(',','.')); const h=parseFloat((args[2]||'').replace(',','.')); if([B,b,h].some(isNaN)) return reply('⏢ Uso: `.trapezio <base maior> <base menor> <altura>`'); return reply(`⏢ *TRAPÉZIO*\n\n📐 Área = ((${B} + ${b}) × ${h}) / 2 = *${((B+b)*h/2).toFixed(2)}*`); }
};
