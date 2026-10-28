/**
 * Comando .validadortermo — Verifica compatibilidade de letras entre duas palavras: .validadortermo <palavra1> <palavra2>
 */
module.exports = {
    name: "validadortermo",
    aliases: ["validadortermo-cmd","cmd-validadortermo"],
    category: "fun",
    subcategory: "Jogos",
    description: "Verifica compatibilidade de letras entre duas palavras: .validadortermo <palavra1> <palavra2>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("Uso: `.validadortermo <palpite> <resposta>`");
            const [p1, p2] = [args[0].toUpperCase(), args[1].toUpperCase()];
            const comuns = [...new Set(p1.split("").filter(c => p2.includes(c)))];
            return reply(`🔤 *Letras em Comum (${comuns.length}):*\n[ ${comuns.join(", ")} ]`);
        }
};
