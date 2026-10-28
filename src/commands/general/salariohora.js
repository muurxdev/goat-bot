/**
 * Comando .salariohora — Valor da hora a partir do salário: .salariohora <salário> [horas/semana=44]
 */
module.exports = {
    name: "salariohora",
    aliases: ["valorhora","hourlywage"],
    category: "general",
    subcategory: "Utilidades",
    description: "Valor da hora a partir do salário: .salariohora <salário> [horas/semana=44]",
    cooldownMs: 1500,
    execute: async ({ args, reply }) => { const s=parseFloat((args[0]||'').replace(',','.')); const h=parseFloat((args[1]||'44').replace(',','.'))||44; if(isNaN(s)) return reply('⏰ Uso: `.salariohora <salário mensal> [horas/semana=44]`'); const horasMes=h*(52/12); const vh=s/horasMes; const f=(x)=>'R$ '+x.toFixed(2).replace('.',','); return reply(`⏰ *VALOR DA HORA*\n\n💼 Salário: ${f(s)}/mês\n🕒 Jornada: ${h}h/semana (~${horasMes.toFixed(0)}h/mês)\n\n💵 Hora: *${f(vh)}*\n📅 Dia (8h): *${f(vh*8)}*`); }
};
