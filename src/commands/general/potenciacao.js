/**
 * Comando .potenciacao — Calcula potência: .potenciacao <base> <expoente>
 */
module.exports = {
    name: "potenciacao",
    aliases: ["potenciacao-cmd","cmd-potenciacao"],
    category: "general",
    subcategory: "Matemática",
    description: "Calcula potência: .potenciacao <base> <expoente>",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("🔢 *Potência*\nUso: `.potenciacao <base> <expoente>`\nEx: `.potenciacao 2 10`");
            const b = parseFloat(args[0]), e = parseFloat(args[1]);
            if (isNaN(b) || isNaN(e)) return reply("❌ Digite números válidos.");
            const res = Math.pow(b, e);
            return reply(`🔢 *${b}^${e}* = *${res}*`);
        }
};
