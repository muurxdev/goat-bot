/**
 * Comando .bitwiseor — Operação lógica OR bit a bit: .bitwiseor <num1> <num2>
 */
module.exports = {
    name: "bitwiseor",
    aliases: ["bitwiseor-cmd","cmd-bitwiseor","cmd_bitwiseor","alt_bitwiseor","atalho_bitwiseor","abrev_bitwiseor","call_bitwiseor","func_bitwiseor"],
    category: "dev",
    subcategory: "Bits",
    description: "Operação lógica OR bit a bit: .bitwiseor <num1> <num2>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("Uso: `.bitwiseor <num1> <num2>`");
            const a = parseInt(args[0]), b = parseInt(args[1]);
            const res = a | b;
            return reply(`⚡ *Bitwise OR:*\n${a} | ${b} = *${res}* (Binário: ${res.toString(2)})`);
        }
};
