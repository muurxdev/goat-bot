/**
 * Comando .bitwisenot — Operação lógica NOT bit a bit: .bitwisenot <num>
 */
module.exports = {
    name: "bitwisenot",
    aliases: ["bitwisenot-cmd","cmd-bitwisenot","cmd_bitwisenot","alt_bitwisenot","atalho_bitwisenot","abrev_bitwisenot","call_bitwisenot","func_bitwisenot"],
    category: "dev",
    subcategory: "Bits",
    description: "Operação lógica NOT bit a bit: .bitwisenot <num>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const a = parseInt(args[0]);
            if (isNaN(a)) return reply("Uso: `.bitwisenot <num>`");
            const res = ~a;
            return reply(`⚡ *Bitwise NOT:*\n~${a} = *${res}*`);
        }
};
