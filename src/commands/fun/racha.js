/**
 * Comando .racha / .dragrace / .corrida
 * Corrida de arrancada com nitro e apostas de coins
 */
const F = require("../../utils/formato");

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "racha",
    aliases: ["dragrace", "corrida", "arrancada", "rachar"],
    category: "fun",
    description: "Dispute um racha de arrancada com nitro valendo moedas",
    usage: "[aposta]",
    examples: [" — corre apostando 200 moedas", "500 — corre apostando 500 moedas"],
    subcategory: "Jogos",
    cooldownMs: 4000,
    execute: async ({ sender, reply, args, prefix = "." }) => {
        // Só inteiro positivo: "-500" passava na checagem de saldo e o
        // "coins -= aposta" SOMAVA 500 moedas.
        const digitado = args[0] !== undefined ? String(args[0]).replace(/\./g, "") : null;
        const aposta = digitado === null ? 200 : Number(digitado);
        if (!Number.isInteger(aposta) || aposta < 1) {
            return reply(F.tela({
                emoji: "🏎️",
                titulo: "Aposta inválida",
                intro: "A aposta do racha precisa ser um número inteiro de moedas, maior que zero.",
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    `• ${F.cmd(prefix, "racha")} — aposta padrão de 200 moedas`,
                    `• ${F.cmd(prefix, "racha", "500")} — aposta 500 moedas`
                ] }],
                prefix
            }));
        }
        const { initializeUser } = require("../../services/xpService");
        const user = initializeUser(sender, dataService.getXpData());

        if ((user.coins || 0) < aposta) {
            return reply(F.tela({
                emoji: "🏎️",
                titulo: "Moedas insuficientes para o racha",
                intro: `Para correr apostando *${formatCoins(aposta)}* você precisa ter esse valor, e hoje tem *${formatCoins(user.coins || 0)}*.`,
                secoes: [{ emoji: "🏁", titulo: "Como funciona", linhas: [
                    F.campo("Aposta padrão", formatCoins(200)),
                    F.campo("Se vencer", "recebe o dobro da aposta"),
                    F.campo("Se perder", "a aposta fica na pista")
                ] }],
                dica: (user.coins || 0) > 0 ? `Aposte menos: ${F.cmd(prefix, "racha", String(Math.max(1, Math.floor((user.coins || 0) / 2))))}` : "Junte moedas nos jogos e no trabalho antes de correr.",
                proximos: [
                    (user.coins || 0) > 0 ? { nome: "racha", args: String(Math.max(1, Math.floor((user.coins || 0) / 2))), oque: "correr com uma aposta menor" } : null,
                    { nome: "daily", oque: "pegar a recompensa diária" },
                    { nome: "charada", oque: "ganhar moedas respondendo" }
                ].filter(Boolean),
                prefix
            }));
        }

        user.coins -= aposta;

        const vitoria = Math.random() > 0.45;
        const tempoSeu = (Math.random() * 2 + 7).toFixed(3);
        const tempoOp = (Math.random() * 2 + 7.2).toFixed(3);

        let premio = 0;
        if (vitoria) {
            premio = aposta * 2;
            user.coins += premio;
        }

        dataService.saveUser(user);

        const card = renderCard({
            title: "RACHA NOTURNO DE REINO",
            icon: "🏎️",
            subtitle: `🏁 *Piloto:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "RESULTADO DA PISTA",
                    icon: "⏱️",
                    fields: [
                        { label: "Seu Tempo", value: `${tempoSeu}s 🔥`, icon: "🏎️" },
                        { label: "Oponente", value: `${tempoOp}s 💨`, icon: "🚗" },
                        { label: "Desfecho", value: vitoria ? "🏆 *CRUZOU A LINHA EM 1º LUGAR!*" : "💥 *DERROTADO NA ARRANCADA!*", icon: "🏁" }
                    ]
                },
                {
                    title: "PREMIAÇÃO DO CIRCUITO",
                    icon: "💰",
                    fields: [
                        { label: "Aposta Feita", value: formatCoins(aposta), icon: "💳" },
                        { label: "Retorno Final", value: vitoria ? `+${formatCoins(premio)}` : "0 Coins", icon: "💎" }
                    ]
                }
            ],
            tip: "Ative o nitro no momento certo para baixar seu tempo para menos de 7 segundos!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

