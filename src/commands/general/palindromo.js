/**
 * Comando .palindromo — Verifica se uma palavra/número é palíndromo
 */
module.exports = {
    name: "palindromo",
    aliases: ["ehpalindromo","palindrome"],
    category: "general",
    subcategory: "Utilidades",
    description: "Verifica se uma palavra/número é palíndromo",
    cooldownMs: 1500,
    execute: async ({ args, text, reply }) => { const t=(text||(args||[]).join(' ')||'').trim(); if(!t) return reply('🔁 Uso: `.palindromo <palavra ou número>`'); const s=t.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,''); const ok=s.length>0&&s===[...s].reverse().join(''); return reply(ok?`✅ *"${t}"* é um palíndromo!`:`❌ *"${t}"* NÃO é um palíndromo.`); }
};
