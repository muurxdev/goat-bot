/**
 * Comando .urlencode — Codifica um texto para URL (percent-encoding)
 */
module.exports = {
    name: "urlencode",
    aliases: ["encodeurl","escapeurl","cmd_urlencode","alt_urlencode","atalho_urlencode","abrev_urlencode","call_urlencode","func_urlencode"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Codifica um texto para URL (percent-encoding)",
    cooldownMs: 1500,
    execute: async ({ args, text, reply }) => { const t=(text||(args||[]).join(' ')).trim(); if(!t) return reply('🔗 Uso: `.urlencode <texto>`'); return reply('`'+encodeURIComponent(t)+'`'); }
};
