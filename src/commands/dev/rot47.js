/**
 * Comando .rot47 — Cifra e decifra texto usando algoritmo ROT47: .rot47 <texto>
 */
module.exports = {
    name: "rot47",
    aliases: ["rot-47","rot-cmd47","cmd_rot47","alt_rot47","atalho_rot47","abrev_rot47","call_rot47","func_rot47"],
    category: "dev",
    subcategory: "Cifra",
    description: "Cifra e decifra texto usando algoritmo ROT47: .rot47 <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.rot47 <texto>`");
            let res = "";
            for (let i = 0; i < t.length; i++) {
                const c = t.charCodeAt(i);
                if (c >= 33 && c <= 126) res += String.fromCharCode(33 + ((c + 14) % 94));
                else res += t[i];
            }
            return reply(`🔒 *ROT47:*\n\`${res}\``);
        }
};
