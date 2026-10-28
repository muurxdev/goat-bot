/**
 * Comando .capitalizar — Deixa a primeira letra de cada palavra maiúscula
 */
module.exports = {
    name: "capitalizar",
    aliases: ["titlecase","capitalize"],
    category: "general",
    subcategory: "Utilidades",
    description: "Deixa a primeira letra de cada palavra maiúscula",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🔠 Uso: `.capitalizar <texto>`'); return reply(t.toLowerCase().replace(/(^|\s)\S/g, c=>c.toUpperCase())); }
};
