/**
 * Comando .fusoesmagicas — Calcula a fusão elemental de dois guerreiros: .fusoesmagicas <guerreiro1> <guerreiro2>
 */
module.exports = {
    name: "fusoesmagicas",
    aliases: ["fusoesmagicas-cmd","cmd-fusoesmagicas"],
    category: "rpg",
    subcategory: "Combate",
    description: "Calcula a fusão elemental de dois guerreiros: .fusoesmagicas <guerreiro1> <guerreiro2>",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const g1 = args[0] || "Guerreiro 1", g2 = args[1] || "Guerreiro 2";
            const fusaoPoder = Math.floor(Math.random() * 50000) + 40000;
            return reply(`⚡🌪️ *FUSÃO DE MAGIAS ELEMENTAIS*\n\n${g1} e ${g2} combinaram suas energias místicas!\n💥 *Técnica Resultante:* Tempestade Divina da Fúria\n🔥 *Poder Combinado:* *${fusaoPoder.toLocaleString('pt-BR')} unidades de combate!*`);
        }
};
