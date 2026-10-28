/**
 * Comando .pitagoras — Teorema de Pitágoras: .pitagoras <cateto1> <cateto2>
 */
module.exports = {
    name: "pitagoras",
    aliases: ["hipotenusa","pythagoras"],
    category: "general",
    subcategory: "Utilidades",
    description: "Teorema de Pitágoras: .pitagoras <cateto1> <cateto2>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const a=parseFloat((args[0]||'').replace(',','.')); const b=parseFloat((args[1]||'').replace(',','.')); if(isNaN(a)||isNaN(b)) return reply('📐 Uso: `.pitagoras <cateto1> <cateto2>`'); const c=Math.hypot(a,b); return reply(`📐 *PITÁGORAS*\n\n√(${a}² + ${b}²) = *${c.toFixed(4)}*\n(hipotenusa)`); }
};
