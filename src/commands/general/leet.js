/**
 * Comando .leet — Converte o texto para leetspeak (1337)
 */
module.exports = {
    name: "leet",
    aliases: ["leetspeak","1337"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte o texto para leetspeak (1337)",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🕶️ Uso: `.leet <texto>`'); const m={a:'4',e:'3',i:'1',o:'0',t:'7',s:'5',b:'8',g:'9'}; return reply(t.toLowerCase().replace(/[aeiotsbg]/g,c=>m[c]||c)); }
};
