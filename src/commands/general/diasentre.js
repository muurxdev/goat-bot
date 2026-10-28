/**
 * Comando .diasentre — Dias entre duas datas: .diasentre DD/MM/AAAA DD/MM/AAAA
 */
module.exports = {
    name: "diasentre",
    aliases: ["datediff","diferencadata"],
    category: "general",
    subcategory: "Utilidades",
    description: "Dias entre duas datas: .diasentre DD/MM/AAAA DD/MM/AAAA",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const parse=(s)=>{const m=(s||'').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m?new Date(+m[3],+m[2]-1,+m[1]):null;}; const d1=parse(args[0]); const d2=parse(args[1]); if(!d1||!d2) return reply('📅 Uso: `.diasentre DD/MM/AAAA DD/MM/AAAA`'); const dias=Math.round(Math.abs(d2-d1)/86400000); return reply(`📅 *DIAS ENTRE DATAS*\n\n${args[0]} ↔ ${args[1]}\n\n🔢 *${dias} dias* (${(dias/365).toFixed(1)} anos · ${Math.round(dias/7)} semanas)`); }
};
