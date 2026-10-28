/**
 * Comando .diasate — Quantos dias faltam para uma data: .diasate DD/MM/AAAA
 */
module.exports = {
    name: "diasate",
    aliases: ["countdowndata","faltamdias"],
    category: "general",
    subcategory: "Utilidades",
    description: "Quantos dias faltam para uma data: .diasate DD/MM/AAAA",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const m=(args[0]||'').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); if(!m) return reply('⏳ Uso: `.diasate DD/MM/AAAA`'); const alvo=new Date(+m[3],+m[2]-1,+m[1]); const hoje=new Date(); hoje.setHours(0,0,0,0); const dias=Math.round((alvo-hoje)/86400000); if(dias<0) return reply(`⏳ Essa data já passou há *${-dias} dias*.`); if(dias===0) return reply('🎉 É *hoje*!'); return reply(`⏳ Faltam *${dias} dias* para ${args[0]}\n(${(dias/7).toFixed(1)} semanas · ${(dias/30).toFixed(1)} meses)`); }
};
