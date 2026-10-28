/**
 * Comando .combinacao — Calcula combinação simples C(n, k): .combinacao <n> <k>
 */
module.exports = {
    name: "combinacao",
    aliases: ["combinacao-cmd","cmd-combinacao"],
    category: "general",
    subcategory: "Combinatória",
    description: "Calcula combinação simples C(n, k): .combinacao <n> <k>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("🔢 *Combinação Simples C(n, k)*\nUso: `.combinacao <n> <k>`");
            const n = parseInt(args[0]), k = parseInt(args[1]);
            if (isNaN(n) || isNaN(k) || n < 0 || k < 0 || k > n || n > 60) return reply("❌ Valores inválidos. (0 <= k <= n <= 60)");
            const fat = (num) => { let res = 1n; for (let i = 2n; i <= BigInt(num); i++) res *= i; return res; };
            const c = fat(n) / (fat(k) * fat(n - k));
            return reply(`🔢 *C(${n}, ${k})* = *${c.toString()}*`);
        }
};
