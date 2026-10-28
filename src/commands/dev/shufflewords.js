/**
 * Comando .shufflewords — Embaralha aleatoriamente as palavras de uma frase: .shufflewords <frase>
 */
module.exports = {
    name: "shufflewords",
    aliases: ["shufflewords-cmd","cmd-shufflewords","cmd_shufflewords","alt_shufflewords","atalho_shufflewords","abrev_shufflewords","call_shufflewords","func_shufflewords"],
    category: "dev",
    subcategory: "String",
    description: "Embaralha aleatoriamente as palavras de uma frase: .shufflewords <frase>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const words = args.slice();
            if (!words.length) return reply("Uso: `.shufflewords <frase>`");
            for (let i = words.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [words[i], words[j]] = [words[j], words[i]];
            }
            return reply(`🎲 *Palavras embaralhadas:*\n${words.join(" ")}`);
        }
};
