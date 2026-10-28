/**
 * Comando .alternado — Escreve em MaIúScUlAs alternadas (deboche)
 */
module.exports = {
    name: "alternado",
    aliases: ["zoeiracase","mockcase"],
    category: "general",
    subcategory: "Utilidades",
    description: "Escreve em MaIúScUlAs alternadas (deboche)",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🙃 Uso: `.alternado <texto>`'); let i=0; return reply([...t].map(c=>/[a-z]/i.test(c)?(i++%2?c.toUpperCase():c.toLowerCase()):c).join('')); }
};
