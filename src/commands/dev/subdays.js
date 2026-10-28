/**
 * Comando .subdays — Subtrai dias de uma data: .subdays <dias> [YYYY-MM-DD]
 */
module.exports = {
    name: "subdays",
    aliases: ["subdays-cmd","cmd-subdays","cmd_subdays","alt_subdays","atalho_subdays","abrev_subdays","call_subdays","func_subdays"],
    category: "dev",
    subcategory: "Data",
    description: "Subtrai dias de uma data: .subdays <dias> [YYYY-MM-DD]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const dias = parseInt(args[0]);
            if (isNaN(dias)) return reply("Uso: `.subdays <numero_dias> [data]`");
            const base = args[1] ? new Date(args[1]) : new Date();
            // Sem esta checagem, uma data inválida ("teste") fazia o toISOString()
            // abaixo estourar com RangeError: Invalid time value.
            if (isNaN(base.getTime())) {
                return reply("❌ *Data inválida:* `" + args[1] + "`\n\n📌 Use o formato `AAAA-MM-DD`. Ex.: `.subdays 10 2026-09-05`\n💡 Sem data, eu uso a de hoje.");
            }
            base.setDate(base.getDate() - dias);
            return reply(`📅 *Nova data (-${dias} dias):* *${base.toISOString().split("T")[0]}*`);
        }
};
