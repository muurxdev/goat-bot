/**
 * Comando .caloriasdiarias — Gasto calórico diário: .caloriasdiarias <tmb> <nível 1-5>
 */
module.exports = {
    name: "caloriasdiarias",
    aliases: ["gastocalorico","tdee"],
    category: "general",
    subcategory: "Utilidades",
    description: "Gasto calórico diário: .caloriasdiarias <tmb> <nível 1-5>",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const tmb=parseFloat((args[0]||'').replace(',','.')); const nivel=parseInt(args[1],10); const fatores={1:1.2,2:1.375,3:1.55,4:1.725,5:1.9}; if(isNaN(tmb)||!fatores[nivel]) return reply('🍽️ Uso: `.caloriasdiarias <tmb> <nível 1-5>`\n1=sedentário 2=leve 3=moderado 4=intenso 5=atleta'); const tdee=tmb*fatores[nivel]; return reply(`🍽️ *GASTO DIÁRIO (TDEE)*\n\n🔥 TMB: ${tmb} · Nível: ${nivel} (×${fatores[nivel]})\n\n📊 Manutenção: *${Math.round(tdee)} kcal*\n📉 Emagrecer: *${Math.round(tdee-500)} kcal*\n📈 Ganhar: *${Math.round(tdee+500)} kcal*`); }
};
