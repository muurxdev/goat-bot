/**
 * Comando .porcentagemde — Calcula X% de Y (ex.: .porcentagemde 15 200 → 30)
 */
module.exports = {
    name: "porcentagemde",
    aliases: ["pctde","percentde"],
    category: "general",
    subcategory: "Utilidades",
    description: "Calcula X% de Y (ex.: .porcentagemde 15 200 → 30)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const p=parseFloat((args[0]||'').replace(',','.')); const v=parseFloat((args[1]||'').replace(',','.')); if(isNaN(p)||isNaN(v)) return reply('％ Uso: `.porcentagemde <percentual> <valor>` (ex.: `.porcentagemde 15 200`)'); const r=v*(p/100); return reply(`％ *${p}%* de *${v}* = *${Number.isInteger(r)?r:r.toFixed(2)}*`); }
};
