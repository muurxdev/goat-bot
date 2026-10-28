/**
 * Comando .diadasemana — Dia da semana de uma data: .diadasemana DD/MM/AAAA
 */
module.exports = {
    name: "diadasemana",
    aliases: ["weekday","quediafoi"],
    category: "general",
    subcategory: "Utilidades",
    description: "Dia da semana de uma data: .diadasemana DD/MM/AAAA",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const m=(args[0]||'').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); if(!m) return reply('📆 Uso: `.diadasemana DD/MM/AAAA`'); const d=new Date(+m[3],+m[2]-1,+m[1]); const dias=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']; return reply(`📆 *${args[0]}* caiu/cairá numa\n\n➡️ *${dias[d.getDay()]}*`); }
};
