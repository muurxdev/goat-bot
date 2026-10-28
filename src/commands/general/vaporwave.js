/**
 * Comando .vaporwave — Escreve em letras largas (ｖａｐｏｒｗａｖｅ)
 */
module.exports = {
    name: "vaporwave",
    aliases: ["fullwidth","aesthetic"],
    category: "general",
    subcategory: "Utilidades",
    description: "Escreve em letras largas (ｖａｐｏｒｗａｖｅ)",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🌴 Uso: `.vaporwave <texto>`'); return reply([...t].map(c=>{const code=c.charCodeAt(0); if(code>=33&&code<=126) return String.fromCharCode(code+0xFEE0); if(c===' ') return '　'; return c;}).join('')); }
};
