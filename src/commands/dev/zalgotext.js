/**
 * Comando .zalgotext — Gera texto demoníaco corrompido com Zalgo: .zalgotext <texto>
 */
module.exports = {
    name: "zalgotext",
    aliases: ["zalgotext-cmd","cmd-zalgotext","cmd_zalgotext","alt_zalgotext","atalho_zalgotext","abrev_zalgotext","call_zalgotext","func_zalgotext"],
    category: "dev",
    subcategory: "Texto",
    description: "Gera texto demoníaco corrompido com Zalgo: .zalgotext <texto>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.zalgotext <texto>`");
            const diacritics = ["\u0300", "\u0301", "\u0302", "\u0303", "\u0304", "\u0305", "\u0334", "\u0335", "\u0336", "\u0337", "\u0338"];
            let res = "";
            for (const char of t) {
                res += char;
                for (let i = 0; i < 3; i++) res += diacritics[Math.floor(Math.random() * diacritics.length)];
            }
            return reply(`🌑 *TEXTO CORROMPIDO:*\n${res}`);
        }
};
