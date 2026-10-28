/**
 * Comando .cronexplain — Explica os 5 campos de uma expressão Cron: .cronexplain <min> <hr> <dia> <mes> <semana>
 */
module.exports = {
    name: "cronexplain",
    aliases: ["cronexplain-cmd","cmd-cronexplain","cmd_cronexplain","alt_cronexplain","atalho_cronexplain","abrev_cronexplain","call_cronexplain","func_cronexplain"],
    category: "dev",
    subcategory: "Dev",
    description: "Explica os 5 campos de uma expressão Cron: .cronexplain <min> <hr> <dia> <mes> <semana>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 5) return reply("⏰ Uso: `.cronexplain * * * * *`\n(Campos: minuto, hora, dia_do_mês, mês, dia_da_semana)");
            const [min, hr, dom, mon, dow] = args.slice(0, 5);
            return reply(`⏰ *Expressão Cron:* \`${min} ${hr} ${dom} ${mon} ${dow}\`\n▫️ Minuto: ${min}\n▫️ Hora: ${hr}\n▫️ Dia do Mês: ${dom}\n▫️ Mês: ${mon}\n▫️ Dia da Semana: ${dow}`);
        }
};
