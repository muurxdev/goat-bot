/**
 * Comando .esfera — Volume e área da esfera: .esfera <raio>
 */
module.exports = {
    name: "esfera",
    aliases: ["volumeesfera","sphere"],
    category: "general",
    subcategory: "Utilidades",
    description: "Volume e área da esfera: .esfera <raio>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const r=parseFloat((args[0]||'').replace(',','.')); if(isNaN(r)||r<=0) return reply('🌐 Uso: `.esfera <raio>`'); const vol=(4/3)*Math.PI*r**3; const area=4*Math.PI*r*r; return reply(`🌐 *ESFERA* (raio ${r})\n\n📦 Volume: *${vol.toFixed(2)}*\n📐 Área da superfície: *${area.toFixed(2)}*`); }
};
