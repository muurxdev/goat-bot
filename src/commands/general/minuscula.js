/**
 * Comando .minuscula — Converte o texto para minúsculas
 */
module.exports = {
    name: "minuscula",
    aliases: ["lower","caixabaixa"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte o texto para minúsculas",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🔡 Uso: `.minuscula <texto>`'); return reply(t.toLowerCase()); }
};
