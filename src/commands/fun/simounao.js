/**
 * Comando .simounao — Responde sua dúvida com Sim, Não ou Talvez: .simounao <pergunta>
 */
const F = require("../../utils/formato");
module.exports = {
    name: "simounao",
    aliases: ["simounao-cmd","cmd-simounao"],
    category: "fun",
    subcategory: "Oráculo",
    description: "O oráculo responde sua dúvida com sim, não ou talvez",
    usage: "<pergunta>",
    examples: ["Devo almoçar agora? — o oráculo responde sim, não ou talvez"],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = "." }) => {
            if (!args.length) {
                return reply(F.tela({
                    emoji: "🔮",
                    titulo: "Oráculo do destino",
                    intro: "Faça uma pergunta de sim ou não e eu consulto os ventos do Reino.",
                    secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                        "• " + F.cmd(prefix, "simounao", "Devo almoçar agora?"),
                        "• " + F.cmd(prefix, "simounao", "Vou ganhar no cassino hoje?"),
                        "• " + F.cmd(prefix, "simounao", "Ela vai responder minha mensagem?")
                    ] }],
                    dica: "Perguntas de sim ou não funcionam melhor que perguntas abertas.",
                    proximos: [{ nome: "moeda2", oque: "decidir no cara ou coroa" }],
                    prefix
                }));
            }
            const r = ["✅ SIM, com certeza absoluta!", "❌ NÃO, de jeito nenhum!", "🔮 TALVEZ, os ventos ainda são incertos...", "👀 Nem GOAT sabe a resposta dessa."];
            return reply(F.tela({
                emoji: "🔮",
                titulo: "O oráculo respondeu",
                intro: `*${r[Math.floor(Math.random() * r.length)]}*`,
                secoes: [{ emoji: "❓", titulo: "Sua pergunta", linhas: [`_${args.join(" ")}_`] }],
                dica: "O oráculo não aceita reclamação. Mas aceita outra pergunta.",
                proximos: [
                    { nome: "simounao", args: "outra pergunta", oque: "perguntar de novo" },
                    { nome: "moeda2", oque: "cara ou coroa" }
                ],
                prefix
            }));
        }
};
