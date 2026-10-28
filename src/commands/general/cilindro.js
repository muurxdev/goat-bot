/**
 * Comando .cilindro — Volume do cilindro: .cilindro <raio> <altura>
 */
module.exports = {
    name: "cilindro",
    aliases: ["volumecilindro","cylinder"],
    category: "general",
    subcategory: "Utilidades",
    description: "Volume do cilindro: .cilindro <raio> <altura>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const r=parseFloat((args[0]||'').replace(',','.')); const h=parseFloat((args[1]||'').replace(',','.')); if(isNaN(r)||isNaN(h)) return reply('🥫 Uso: `.cilindro <raio> <altura>`'); const vol=Math.PI*r*r*h; return reply(`🥫 *CILINDRO* (raio ${r}, altura ${h})\n\n📦 Volume: *${vol.toFixed(2)}*`); }
};
