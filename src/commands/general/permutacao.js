/**
 * Comando .permutacao — Calcula permutação simples P(n) = n!: .permutacao <n>
 */
module.exports = {
    name: "permutacao",
    aliases: ["permutacao-cmd","cmd-permutacao"],
    category: "general",
    subcategory: "Combinatória",
    description: "Calcula permutação simples P(n) = n!: .permutacao <n>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const n = parseInt(args[0]);
            if (isNaN(n) || n < 0 || n > 20) return reply("❌ Informe n entre 0 e 20.");
            let p = 1n;
            for (let i = 2n; i <= BigInt(n); i++) p *= i;
            return reply(`🔢 *P(${n})* = *${p.toString()}* maneiras`);
        }
};
