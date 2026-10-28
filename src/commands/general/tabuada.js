/**
 * Comando .tabuada — Mostra a tabuada de um número (1 a 10)
 */
module.exports = {
    name: "tabuada",
    aliases: ["multiplicacao","times"],
    category: "general",
    subcategory: "Utilidades",
    description: "Mostra a tabuada de um número (1 a 10)",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const n=parseInt(args[0],10); if(isNaN(n)) return reply('✖️ Uso: `.tabuada <número>`'); let d='✖️ *TABUADA DO '+n+'*\n\n'; for(let i=1;i<=10;i++) d+=`${n} × ${i} = *${n*i}*\n`; return reply(d.trim()); }
};
