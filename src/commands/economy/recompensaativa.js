/**
 * Comando .recompensaativa
 * Bônus diário fixo de 350 moedas a cada 24 horas.
 */

const dataService = require("../../services/dataService");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const ESPERA_MS = 24 * 60 * 60 * 1000;

module.exports = {
    name: "recompensaativa",
    aliases: ["bonusatividade","recompensa-chat","streakbonus","cmd_recompensaativa","alt_recompensaativa","atalho_recompensaativa","abrev_recompensaativa","call_recompensaativa","func_recompensaativa"],
    category: "economy",
    subcategory: "Renda",
    description: "Receba 350 moedas de bônus por dia por participar do grupo",
    examples: [" — recebe 350 moedas de bônus, uma vez por dia"],
    cooldownMs: 4000,
    execute: async ({ sender, reply, prefix = "." }) => {
        const user = dataService.initializeUser(sender);

        const agora = Date.now();
        const ultimo = user.lastAtividade || 0;
        if (agora - ultimo < ESPERA_MS) {
            const falta = ESPERA_MS - (agora - ultimo);
            return reply(F.tela({
                emoji: "⏳",
                titulo: "Bônus já resgatado",
                intro: `Você já pegou o bônus de atividade de hoje. Volte em *${F.tempo(falta)}*.`,
                secoes: [{ emoji: "📋", titulo: "Seu próximo", linhas: [
                    F.campo("Libera em", F.dataHora(ultimo + ESPERA_MS)),
                    F.campo("Carteira", moedas(user.coins || 0))
                ] }],
                dica: "Enquanto espera, dá para ganhar moedas trabalhando.",
                proximos: [
                    { nome: "trabalhar", oque: "ganhar moedas agora" },
                    { nome: "premiodiario", oque: "girar a roleta do dia" }
                ],
                prefix
            }));
        }

        const valor = 350;
        const carteiraAntes = user.coins || 0;
        user.coins = carteiraAntes + valor;
        user.lastAtividade = agora;
        dataService.saveUser(user);

        return reply(F.tela({
            emoji: "🔥",
            titulo: "Bônus de atividade",
            intro: `${marcar(sender)}, obrigado por movimentar o Reino! Você recebeu *${moedas(valor)}*.`,
            secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                F.campo("Bônus", `+${moedas(valor)}`),
                F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                F.campo("Próximo em", F.tempo(ESPERA_MS))
            ] }],
            dica: "O bônus é de 350 moedas e volta a cada 24 horas.",
            proximos: [
                { nome: "premiodiario", oque: "girar a roleta do dia" },
                { nome: "dividendos", oque: "coletar os dividendos do dia" }
            ],
            prefix
        }), [sender]);
    }
};
