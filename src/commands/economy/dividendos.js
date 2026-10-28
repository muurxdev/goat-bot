/**
 * Comando .dividendos
 * Coleta diária de dividendos: de 250 a 649 moedas a cada 24 horas.
 */

const dataService = require("../../services/dataService");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const ESPERA_MS = 24 * 60 * 60 * 1000;

module.exports = {
    name: "dividendos",
    aliases: ["coletardividendos","proventos","rendimentomensal","cmd_dividendos","alt_dividendos","atalho_dividendos","abrev_dividendos","call_dividendos","func_dividendos"],
    category: "economy",
    subcategory: "Investimento",
    description: "Colete uma vez por dia os dividendos dos seus investimentos no Reino",
    examples: [" — coleta de 250 a 649 moedas de dividendos, uma vez por dia"],
    cooldownMs: 5000,
    execute: async ({ sender, reply, prefix = "." }) => {
        const user = dataService.initializeUser(sender);

        const agora = Date.now();
        const ultimo = user.lastDividendos || 0;
        if (agora - ultimo < ESPERA_MS) {
            const falta = ESPERA_MS - (agora - ultimo);
            return reply(F.tela({
                emoji: "⏳",
                titulo: "Dividendos já coletados",
                intro: `Você já coletou os dividendos de hoje. Volte em *${F.tempo(falta)}*.`,
                secoes: [{ emoji: "📋", titulo: "Seu próximo", linhas: [
                    F.campo("Libera em", F.dataHora(ultimo + ESPERA_MS)),
                    F.campo("Carteira", moedas(user.coins || 0))
                ] }],
                dica: "Enquanto espera, dá para ganhar moedas trabalhando.",
                proximos: [
                    { nome: "trabalhar", oque: "ganhar moedas agora" },
                    { nome: "impostos", oque: "pedir a restituição do dia" }
                ],
                prefix
            }));
        }

        const valor = Math.floor(Math.random() * 400) + 250;
        const carteiraAntes = user.coins || 0;
        user.coins = carteiraAntes + valor;
        user.lastDividendos = agora;
        dataService.saveUser(user);

        return reply(F.tela({
            emoji: "💵",
            titulo: "Dividendos creditados",
            intro: `${marcar(sender)}, seus investimentos no Reino renderam *${moedas(valor)}* hoje.`,
            secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                F.campo("Dividendos", `+${moedas(valor)}`),
                F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                F.campo("Próximo em", F.tempo(ESPERA_MS))
            ] }],
            dica: "Os dividendos variam de 250 a 649 moedas por dia. Guarde no banco para render mais.",
            proximos: [
                { nome: "banco", args: "depositar tudo", oque: "guardar no banco" },
                { nome: "impostos", oque: "pedir a restituição do dia" }
            ],
            prefix
        }), [sender]);
    }
};
