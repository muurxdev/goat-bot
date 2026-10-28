/**
 * Comando .parcelamento — Valor da parcela com juros: .parcelamento <valor> <parcelas> [juros%mês]
 */
module.exports = {
    name: "parcelamento",
    aliases: ["parcela","financiamento"],
    category: "general",
    subcategory: "Utilidades",
    description: "Valor da parcela com juros: .parcelamento <valor> <parcelas> [juros%mês]",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const v=parseFloat((args[0]||'').replace(',','.')); const n=parseInt(args[1],10); const i=parseFloat((args[2]||'0').replace(',','.'))/100; if(isNaN(v)||isNaN(n)||n<1) return reply('💳 Uso: `.parcelamento <valor> <parcelas> [juros%mês]`'); let parcela, total; if(i>0){ parcela=v*(i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1); total=parcela*n; } else { parcela=v/n; total=v; } const f=(x)=>'R$ '+x.toFixed(2).replace('.',','); return reply(`💳 *PARCELAMENTO*\n\n🛒 Valor: ${f(v)}\n🔢 Parcelas: ${n}x\n📈 Juros: ${(i*100).toFixed(2)}% a.m.\n\n💵 Parcela: *${f(parcela)}*\n🧾 Total: *${f(total)}*`); }
};
