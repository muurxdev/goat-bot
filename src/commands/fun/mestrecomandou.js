/**
 * Comando .mestrecomandou — O Mestre ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ mandou: .mestrecomandou
 */
const F = require("../../utils/formato");
module.exports = {
    name: "mestrecomandou",
    aliases: ["mestrecomandou-cmd","cmd-mestrecomandou"],
    category: "fun",
    subcategory: "Jogos",
    description: "Sorteia uma ordem do Mestre ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ para o grupo cumprir",
    examples: [" — sorteia uma ordem para o grupo"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const ordens = [
                "O Mestre Mandou: Ficar em silêncio por 2 minutos no grupo!",
                "O Mestre Mandou: Reagir com 🍺 na mensagem anterior!",
                "O Mestre Mandou: Chamar o Guardião de Mestre dos Limpadores!",
                "O Mestre Mandou: Mandar uma figurinha animada agora!"
            ];
            const ordem = ordens[Math.floor(Math.random() * ordens.length)].replace(/^O Mestre Mandou:\s*/, "");
            return reply(F.tela({
                emoji: "👑",
                titulo: "O mestre mandou",
                intro: `*${ordem}*`,
                secoes: [{ emoji: "📜", titulo: "Regras", linhas: [
                    "Quem não cumprir paga uma rodada na taverna (de mentira).",
                    "O último a obedecer escolhe a próxima ordem."
                ] }],
                dica: "Só vale se o mestre mandou. Ordem sem o comando não conta!",
                proximos: [
                    { nome: "mestrecomandou", oque: "nova ordem" },
                    { nome: "desafioaleatorio", oque: "desafio relâmpago" }
                ],
                prefix
            }));
        }
};
