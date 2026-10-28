/**
 * Comando .mediana — Mediana de uma lista de números: .mediana 3 1 4 1 5
 */
module.exports = {
    name: "mediana",
    aliases: ["median","calcmediana"],
    category: "general",
    subcategory: "Utilidades",
    description: "Mediana de uma lista de números: .mediana 3 1 4 1 5",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const n=args.map(v=>parseFloat((v||'').replace(',','.'))).filter(v=>!isNaN(v)).sort((a,b)=>a-b); if(n.length<1) return reply('📊 Uso: `.mediana <n1> <n2> ...`'); const m=n.length%2?n[(n.length-1)/2]:(n[n.length/2-1]+n[n.length/2])/2; return reply(`📊 *MEDIANA* (${n.length} valores)\n\nOrdenado: ${n.join(', ')}\n➡️ Mediana: *${m}*`); }
};
