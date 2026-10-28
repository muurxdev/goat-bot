/**
 * Comando .corridadesapos
 * Aposta na corrida de sapos: 40% de chance de o seu sapo vencer e pagar 3x.
 */

const dataService = require("../../services/dataService");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const APOSTA_PADRAO = 300;
const SAPOS = ["🟢 Saltador Verde", "🔵 Pula-Brejo Azul", "🟡 Coaxador Dourado", "🟣 Rã Mística"];

module.exports = {
    name: "corridadesapos",
    aliases: ["sapocorrida","corridasapo","apostasapo","cmd_corridadesapos","alt_corridadesapos","atalho_corridadesapos","abrev_corridadesapos","call_corridadesapos","func_corridadesapos"],
    category: "economy",
    subcategory: "Jogos",
    description: "Aposte num sapo saltador do Reino; se ele vencer, paga 3x",
    usage: "[valor]",
    examples: [
        " — aposta 300 moedas",
        "1000 — aposta 1.000 moedas"
    ],
    cooldownMs: 4000,
    execute: async ({ sender, reply, args = [], prefix = "." }) => {
        const user = dataService.initializeUser(sender);
        const carteira = user.coins || 0;

        // Sem valor → aposta padrão. Valor digitado inválido, zero ou negativo →
        // tela de uso sem cobrar. Antes "-1000" passava e SOMAVA moedas na derrota.
        const semValor = !args[0];
        const digitado = semValor ? "" : String(args[0]).trim();
        const aposta = semValor ? APOSTA_PADRAO : (/^\d+$/.test(digitado) ? parseInt(digitado, 10) : NaN);

        if (!aposta || aposta <= 0) {
            return reply(F.tela({
                emoji: "🐸",
                titulo: "Não entendi a aposta",
                intro: `"${digitado.slice(0, 30)}" não é um valor de aposta. Use um número inteiro maior que zero. Nada foi cobrado.`,
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    `• ${F.cmd(prefix, "corridadesapos")} — aposta ${moedas(APOSTA_PADRAO)}`,
                    `• ${F.cmd(prefix, "corridadesapos", "1000")} — aposta 1.000 moedas`
                ] }],
                dica: `Sua carteira tem ${moedas(carteira)}.`,
                prefix
            }));
        }

        if (carteira < aposta) {
            return reply(F.tela({
                emoji: "🪙",
                titulo: "Moedas insuficientes",
                intro: `A aposta é de *${moedas(aposta)}*, mas você tem *${moedas(carteira)}* na carteira. Nada foi cobrado.`,
                proximos: [
                    carteira > 0 ? { nome: "corridadesapos", args: String(carteira), oque: "apostar o que tem" } : { nome: "trabalhar", oque: "ganhar moedas" },
                    (user.bank || 0) > 0 ? { nome: "banco", args: "sacar <valor>", oque: "trazer moedas do banco" } : null
                ].filter(Boolean),
                prefix
            }));
        }

        user.coins = carteira - aposta;
        const vitoria = Math.random() > 0.6;
        let premio = 0;
        if (vitoria) {
            premio = aposta * 3;
            user.coins += premio;
        }
        dataService.saveUser(user);

        // Só apresentação: o sapo sorteado para o jogador e o vencedor não mudam a chance.
        const seu = SAPOS[Math.floor(Math.random() * SAPOS.length)];
        const outros = SAPOS.filter(s => s !== seu);
        const vencedor = vitoria ? seu : outros[Math.floor(Math.random() * outros.length)];

        return reply(F.tela({
            emoji: "🐸",
            titulo: vitoria ? "Seu sapo venceu" : "Seu sapo perdeu",
            intro: vitoria
                ? `${marcar(sender)}, o ${seu} cruzou a linha primeiro! Você recebeu *${moedas(premio)}* (3x a aposta).`
                : `${marcar(sender)}, o ${vencedor} chegou antes e a aposta de *${moedas(aposta)}* ficou com a casa.`,
            secoes: [
                { emoji: "🏁", titulo: "Corrida", linhas: [
                    F.campo("Seu sapo", seu),
                    F.campo("Vencedor", vencedor)
                ] },
                { emoji: "💳", titulo: "Sua conta", linhas: [
                    F.campo("Aposta", moedas(aposta) + (semValor ? " (valor padrão)" : "")),
                    F.campo("Resultado", vitoria ? `+${moedas(premio - aposta)}` : `−${moedas(aposta)}`),
                    F.campo("Carteira", `${moedas(carteira)} → *${moedas(user.coins)}*`)
                ] }
            ],
            dica: "Seu sapo vence 4 corridas em cada 10, e a vitória paga 3x a aposta.",
            proximos: [
                user.coins >= aposta ? { nome: "corridadesapos", args: String(aposta), oque: "correr de novo com o mesmo valor" } : null,
                vitoria ? { nome: "banco", args: "depositar tudo", oque: "guardar o prêmio" } : { nome: "trabalhar", oque: "recuperar moedas sem risco" }
            ].filter(Boolean),
            prefix
        }), [sender]);
    }
};
