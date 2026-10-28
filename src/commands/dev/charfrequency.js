/**
 * Comando .charfrequency — Conta frequência de cada caractere: .charfrequency <texto>
 */
module.exports = {
    name: "charfrequency",
    aliases: ["charfrequency-cmd","cmd-charfrequency","cmd_charfrequency","alt_charfrequency","atalho_charfrequency","abrev_charfrequency","call_charfrequency","func_charfrequency"],
    category: "dev",
    subcategory: "String",
    description: "Conta frequência de cada caractere: .charfrequency <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ").replace(/\s/g, "");
            if (!t) return reply("Uso: `.charfrequency <texto>`");
            const freq = {};
            for (const c of t) freq[c] = (freq[c] || 0) + 1;
            const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
            return reply(`📊 *Top Caracteres:*\n${top.map(([c, n]) => `▫️ '${c}': ${n}x`).join("\n")}`);
        }
};
