/**
 * Comando .somadigitos — Soma os dígitos de um número (raiz digital)
 */
module.exports = {
    name: "somadigitos",
    aliases: ["digitsum","somardigitos"],
    category: "general",
    subcategory: "Utilidades",
    description: "Soma os dígitos de um número (raiz digital)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const s=(args[0]||'').replace(/\D/g,''); if(!s) return reply('➕ Uso: `.somadigitos <número>`'); let n=s.split('').reduce((a,b)=>a+ +b,0); let raiz=n; while(raiz>=10) raiz=String(raiz).split('').reduce((a,b)=>a+ +b,0); return reply(`➕ Soma dos dígitos: *${n}*\n🌱 Raiz digital: *${raiz}*`); }
};
