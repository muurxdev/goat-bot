/**
 * Comando .contarvogais — Conta as vogais e consoantes de um texto
 */
module.exports = {
    name: "contarvogais",
    aliases: ["vogais","countvowels"],
    category: "general",
    subcategory: "Utilidades",
    description: "Conta as vogais e consoantes de um texto",
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => { const t=(text||(args||[]).join(' ')||quotedText||'').trim(); if(!t) return reply('🔤 Uso: `.contarvogais <texto>`'); const base=t.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); const v=(base.match(/[aeiou]/g)||[]).length; const c=(base.match(/[bcdfghjklmnpqrstvwxyz]/g)||[]).length; return reply(`🔤 Vogais: *${v}* | Consoantes: *${c}*`); }
};
