/**
 * Comando .rot13 — Cifra/decifra texto em ROT13
 */
module.exports = {
    name: "rot13",
    aliases: ["cifrarot","rot","cmd_rot13","alt_rot13","atalho_rot13","abrev_rot13","call_rot13","func_rot13"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Cifra/decifra texto em ROT13",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🔐 Uso: `.rot13 <texto>`'); return reply(t.replace(/[a-z]/gi,c=>String.fromCharCode((c.toLowerCase()<='m'?13:-13)+c.charCodeAt(0)))); }
};
