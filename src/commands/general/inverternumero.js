/**
 * Comando .inverternumero — Inverte os dígitos de um número
 */
module.exports = {
    name: "inverternumero",
    aliases: ["revnum","numeroinvertido"],
    category: "general",
    subcategory: "Utilidades",
    description: "Inverte os dígitos de um número",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const s=(args[0]||'').replace(/\D/g,''); if(!s) return reply('🔃 Uso: `.inverternumero <número>`'); return reply(`🔃 ${s} → *${[...s].reverse().join('')}*`); }
};
