/**
 * Comando .bolsafam
 * Auxílio emergencial para quem ficou sem nada: carteira, banco e cofres somando até 100 moedas
 */

const dataService = require("../../services/dataService");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const LIMITE_PATRIMONIO = 100;
const AUXILIO = 250;
const COOLDOWN_MS = 60000;

module.exports = {
    name: "bolsafam",
    aliases: ["auxilio","bolsafamilia","esmola","ajudaemergencial","cmd_bolsafam","alt_bolsafam","atalho_bolsafam","abrev_bolsafam","call_bolsafam","func_bolsafam"],
    category: "economy",
    subcategory: "Renda",
    description: "Resgate um auxílio emergencial caso tenha ficado completamente falido",
    examples: [" — recebe 250 moedas se carteira, banco e cofres somarem 100 moedas ou menos"],
    cooldownMs: COOLDOWN_MS,
    execute: async ({ sender, reply, prefix = "." }) => {
        const user = dataService.initializeUser(sender);

        // Conta TODO o dinheiro: carteira, banco, cofre do Reino (vault_coins) e o
        // cofre blindado do .cofre. Antes só carteira + banco entravam, e bastava
        // esconder as moedas num cofre para sacar o auxílio a cada minuto.
        const carteira = Number(user.coins) || 0;
        const banco = Number(user.bank) || 0;
        const cofreReino = Number(user.vaultCoins ?? user.vault_coins) || 0;
        const cofreBlindado = Number(user.cofre && user.cofre.saldo) || 0;
        const totalWealth = carteira + banco + cofreReino + cofreBlindado;

        if (totalWealth > LIMITE_PATRIMONIO) {
            return reply(F.tela({
                emoji: "🚫",
                titulo: "Auxílio negado",
                intro: `O auxílio é só para quem tem até *${moedas(LIMITE_PATRIMONIO)}* somando carteira, banco e cofres. Você tem *${moedas(totalWealth)}*.`,
                secoes: [{ emoji: "💳", titulo: "Seu dinheiro", linhas: [
                    F.campo("Carteira", moedas(carteira)),
                    F.campo("Banco", moedas(banco)),
                    cofreReino > 0 ? F.campo("Cofre do Reino", moedas(cofreReino)) : null,
                    cofreBlindado > 0 ? F.campo("Cofre blindado", moedas(cofreBlindado)) : null,
                    F.campo("Total", moedas(totalWealth)),
                    F.campo("Acima do limite em", moedas(totalWealth - LIMITE_PATRIMONIO))
                ] }],
                dica: "Com moedas no bolso, trabalhar rende mais que o auxílio.",
                proximos: [
                    { nome: "trabalhar", oque: "ganhar moedas" },
                    { nome: "premiodiario", oque: "pegar o prêmio do dia" }
                ],
                prefix
            }));
        }

        const carteiraAntes = carteira;
        const grant = AUXILIO;
        user.coins = (user.coins || 0) + grant;
        dataService.saveUser(user);

        return reply(F.tela({
            emoji: "🍞",
            titulo: "Auxílio recebido",
            intro: `${marcar(sender)}, o Reino Central mandou *${moedas(grant)}* para você recomeçar.`,
            secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                F.campo("Auxílio", `+${moedas(grant)}`),
                F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                F.campo("Pode pedir de novo em", `${F.tempo(COOLDOWN_MS)}, se continuar com até ${moedas(LIMITE_PATRIMONIO)}`)
            ] }],
            dica: "Use o auxílio para voltar a ganhar: trabalhar, pescar e minerar rendem sem risco de perder.",
            proximos: [
                { nome: "trabalhar", oque: "ganhar moedas" },
                { nome: "pescar", oque: "tentar a sorte na pesca" },
                { nome: "minerar", oque: "minerar minérios" }
            ],
            prefix
        }), [sender]);
    }
};
