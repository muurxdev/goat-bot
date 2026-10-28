/**
 * Comando .removeacentos — Remove acentos do texto
 */
module.exports = {
    name: "removeacentos",
    aliases: ["semacentos","noaccents"],
    category: "general",
    subcategory: "Utilidades",
    description: "Remove acentos do texto",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('✂️ Uso: `.removeacentos <texto>`'); return reply(t.normalize('NFD').replace(/[̀-ͯ]/g,'')); }
};
