/**
 * Comando .diffdays — Calcula a diferença de dias entre duas datas: .diffdays YYYY-MM-DD YYYY-MM-DD
 */
module.exports = {
    name: "diffdays",
    aliases: ["diffdays-cmd","cmd-diffdays","cmd_diffdays","alt_diffdays","atalho_diffdays","abrev_diffdays","call_diffdays","func_diffdays"],
    category: "dev",
    subcategory: "Data",
    description: "Calcula a diferença de dias entre duas datas: .diffdays YYYY-MM-DD YYYY-MM-DD",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("Uso: `.diffdays <AAAA-MM-DD> <AAAA-MM-DD>`");
            const d1 = new Date(args[0]), d2 = new Date(args[1]);
            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return reply("❌ Datas inválidas.");
            const diff = Math.abs(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
            return reply(`📅 *Diferença entre as datas:* *${diff} dias*`);
        }
};
