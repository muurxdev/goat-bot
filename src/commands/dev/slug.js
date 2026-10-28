/**
 * Comando .slug — Transforma texto em slug de URL (ex.: "Olá Mundo" → ola-mundo)
 */
module.exports = {
    name: "slug",
    aliases: ["slugify","urlfriendly","cmd_slug","alt_slug","atalho_slug","abrev_slug","call_slug","func_slug"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Transforma texto em slug de URL (ex.: \"Olá Mundo\" → ola-mundo)",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🔗 Uso: `.slug <texto>`'); return reply('`'+t.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')+'`'); }
};
