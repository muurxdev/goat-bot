/**
 * Comando .urldecode — Decodifica um texto de URL (percent-encoding)
 */
module.exports = {
    name: "urldecode",
    aliases: ["decodeurl","unescapeurl","cmd_urldecode","alt_urldecode","atalho_urldecode","abrev_urldecode","call_urldecode","func_urldecode"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Decodifica um texto de URL (percent-encoding)",
    cooldownMs: 1500,
    execute: async ({ args, text, reply }) => { const t=(text||(args||[]).join(' ')).trim(); if(!t) return reply('🔗 Uso: `.urldecode <texto>`'); try { return reply(decodeURIComponent(t)); } catch(e){ return reply('❌ Texto de URL inválido.'); } }
};
