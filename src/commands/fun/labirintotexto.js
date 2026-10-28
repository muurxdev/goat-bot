/**
 * Comando .labirintotexto — Mini aventura interativa em labirinto: .labirintotexto <esquerda/direita/reto>
 */
module.exports = {
    name: "labirintotexto",
    aliases: ["labirintotexto-cmd","cmd-labirintotexto"],
    category: "fun",
    subcategory: "Jogos",
    description: "Mini aventura interativa em labirinto: .labirintotexto <esquerda/direita/reto>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const dir = (args[0] || "").toLowerCase();
            if (!["esquerda", "direita", "reto"].includes(dir)) return reply("🧭 *Labirinto de Torre*\nEscolha seu caminho: `.labirintotexto <esquerda|direita|reto>`");
            const caminhos = {
                esquerda: "Você encontrou um baú misterioso com ervas medicinais!",
                direita: "Uma parede falsa desabou revelando a saída do andar!",
                reto: "Um monstro de terra surgiu rugindo! Você precisou dar meia-volta."
            };
            return reply(`🧭 *EXPLORAÇÃO:* ${caminhos[dir]}`);
        }
};
