/**
 * Comando .jurossimples — Juros simples: .jurossimples <capital> <taxa%> <tempo>
 */
module.exports = {
    name: "jurossimples",
    aliases: ["jsimples","simpleinterest"],
    category: "general",
    subcategory: "Utilidades",
    description: "Juros simples: .jurossimples <capital> <taxa%> <tempo>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const c=parseFloat((args[0]||'').replace(',','.')); const i=parseFloat((args[1]||'').replace(',','.')); const t=parseFloat((args[2]||'').replace(',','.')); if([c,i,t].some(isNaN)) return reply('💰 Uso: `.jurossimples <capital> <taxa%> <tempo>`'); const juros=c*(i/100)*t; const f=(n)=>'R$ '+n.toFixed(2).replace('.',','); return reply(`💰 *JUROS SIMPLES*\n\n🏦 Capital: ${f(c)}\n📈 Taxa: ${i}% por período\n⏳ Tempo: ${t} períodos\n\n💵 Juros: *${f(juros)}*\n✅ Montante: *${f(c+juros)}*`); }
};
