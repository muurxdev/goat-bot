/**
 * Comando .juroscompostos — Juros compostos: .juroscompostos <capital> <taxa%> <tempo>
 */
module.exports = {
    name: "juroscompostos",
    aliases: ["jcompostos","compoundinterest"],
    category: "general",
    subcategory: "Utilidades",
    description: "Juros compostos: .juroscompostos <capital> <taxa%> <tempo>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const c=parseFloat((args[0]||'').replace(',','.')); const i=parseFloat((args[1]||'').replace(',','.')); const t=parseFloat((args[2]||'').replace(',','.')); if([c,i,t].some(isNaN)) return reply('📈 Uso: `.juroscompostos <capital> <taxa%> <tempo>`'); const m=c*Math.pow(1+i/100,t); const f=(n)=>'R$ '+n.toFixed(2).replace('.',','); return reply(`📈 *JUROS COMPOSTOS*\n\n🏦 Capital: ${f(c)}\n📊 Taxa: ${i}% por período\n⏳ Tempo: ${t} períodos\n\n✅ Montante: *${f(m)}*\n💵 Juros: *${f(m-c)}*`); }
};
