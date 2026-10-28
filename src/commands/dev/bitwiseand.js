/**
 * Comando .bitwiseand — Operação lógica AND bit a bit: .bitwiseand <num1> <num2>
 */
module.exports = {
    name: "bitwiseand",
    aliases: ["bitwiseand-cmd","cmd-bitwiseand","cmd_bitwiseand","alt_bitwiseand","atalho_bitwiseand","abrev_bitwiseand","call_bitwiseand","func_bitwiseand"],
    category: "dev",
    subcategory: "Bits",
    description: "Operação lógica AND bit a bit: .bitwiseand <num1> <num2>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("Uso: `.bitwiseand <num1> <num2>`");
            const a = parseInt(args[0]), b = parseInt(args[1]);
            const res = a & b;
            return reply(`⚡ *Bitwise AND:*\n${a} & ${b} = *${res}* (Binário: ${res.toString(2)})`);
        }
};
