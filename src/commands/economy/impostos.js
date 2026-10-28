/**
 * Comando .impostos
 * Restituição diária de tributos: de 100 a 399 moedas a cada 24 horas.
 */

const dataService = require("../../services/dataService");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const ESPERA_MS = 24 * 60 * 60 * 1000;

module.exports = {
    name: "impostos",
    aliases: ["tributos","receitafederal","restituicao","cmd_impostos","alt_impostos","atalho_impostos","abrev_impostos","call_impostos","func_impostos"],
    category: "economy",
    subcategory: "Renda",
    description: "Peça uma vez por dia a restituição das taxas que o Reino cobrou",
    examples: [" — recebe de 100 a 399 moedas de restituição, uma vez por dia"],
    cooldownMs: 5000,
    execute: async ({ sender, reply, prefix = "." }) => {
        const user = dataService.initializeUser(sender);

        const agora = Date.now();
        const ultimo = user.lastImpostos || 0;
        if (agora - ultimo < ESPERA_MS) {
            const falta = ESPERA_MS - (agora - ultimo);
            return reply(F.tela({
                emoji: "⏳",
                titulo: "Restituição já pedida",
                intro: `Você já recebeu a restituição de hoje. Volte em *${F.tempo(falta)}*.`,
                secoes: [{ emoji: "📋", titulo: "Seu próximo", linhas: [
                    F.campo("Libera em", F.dataHora(ultimo + ESPERA_MS)),
                    F.campo("Carteira", moedas(user.coins || 0))
                ] }],
                dica: "Enquanto espera, dá para ganhar moedas trabalhando.",
                proximos: [
                    { nome: "trabalhar", oque: "ganhar moedas agora" },
                    { nome: "dividendos", oque: "coletar os dividendos do dia" }
                ],
                prefix
            }));
        }

        const valor = Math.floor(Math.random() * 300) + 100;
        const carteiraAntes = user.coins || 0;
        user.coins = carteiraAntes + valor;
        user.lastImpostos = agora;
        dataService.saveUser(user);

        return reply(F.tela({
            emoji: "🏛️",
            titulo: "Restituição liberada",
            intro: `${marcar(sender)}, o Tesouro Real Central devolveu *${moedas(valor)}* em taxas cobradas.`,
            secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                F.campo("Restituição", `+${moedas(valor)}`),
                F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                F.campo("Próximo em", F.tempo(ESPERA_MS))
            ] }],
            dica: "A restituição varia de 100 a 399 moedas por dia.",
            proximos: [
                { nome: "dividendos", oque: "coletar os dividendos do dia" },
                { nome: "recompensaativa", oque: "pegar o bônus de atividade" }
            ],
            prefix
        }), [sender]);
    }
};
