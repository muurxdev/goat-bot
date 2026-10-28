/**
 * Comando .desviopadrao — Desvio padrão e variância: .desviopadrao 10 12 23 23 16
 */
module.exports = {
    name: "desviopadrao",
    aliases: ["stddev","desvio"],
    category: "general",
    subcategory: "Utilidades",
    description: "Desvio padrão e variância: .desviopadrao 10 12 23 23 16",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const n=args.map(v=>parseFloat((v||'').replace(',','.'))).filter(v=>!isNaN(v)); if(n.length<2) return reply('📊 Uso: `.desviopadrao <n1> <n2> ...` (≥2 valores)'); const media=n.reduce((a,b)=>a+b,0)/n.length; const varia=n.reduce((a,b)=>a+(b-media)**2,0)/n.length; return reply(`📊 *DESVIO PADRÃO* (${n.length} valores)\n\n📈 Média: *${media.toFixed(2)}*\n📐 Variância: *${varia.toFixed(2)}*\n📊 Desvio padrão: *${Math.sqrt(varia).toFixed(2)}*`); }
};
