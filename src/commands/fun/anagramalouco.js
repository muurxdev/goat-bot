/**
 * Comando .anagramalouco — Embaralha uma palavra para seus amigos decifrarem: .anagramalouco <palavra>
 */
module.exports = {
    name: "anagramalouco",
    aliases: ["anagramalouco-cmd","cmd-anagramalouco"],
    category: "fun",
    subcategory: "Jogos",
    description: "Embaralha uma palavra para seus amigos decifrarem: .anagramalouco <palavra>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const word = args.join(" ");
            if (!word) return reply("🔤 Uso: `.anagramalouco <palavra>`");
            const arr = word.split("");
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return reply(`🔤 *ANAGRAMA EMBARALHADO*\n\nQuem consegue decifrar esta palavra?\n👉 *${arr.join(" ").toUpperCase()}*`);
        }
};
