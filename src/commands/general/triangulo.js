/**
 * Comando .triangulo — Área do triângulo: .triangulo <base> <altura>
 */
module.exports = {
    name: "triangulo",
    aliases: ["areatriangulo","triangle"],
    category: "general",
    subcategory: "Utilidades",
    description: "Área do triângulo: .triangulo <base> <altura>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const b=parseFloat((args[0]||'').replace(',','.')); const h=parseFloat((args[1]||'').replace(',','.')); if(isNaN(b)||isNaN(h)) return reply('🔺 Uso: `.triangulo <base> <altura>`'); return reply(`🔺 *TRIÂNGULO*\n\n📐 Área = (${b} × ${h}) / 2 = *${(b*h/2).toFixed(2)}*`); }
};
