const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .pay / .transferir / .pix
 * Transfere Coins com segurança entre usuários com auditoria no SQLite
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { recordTransaction } = require("../../database/repositories/transactionRepository");
const { moedas, marcar } = require("../../utils/textoRpg");
const logger = require("../../core/logger");
const F = require("../../utils/formato");

module.exports = {
    name: "pay",
    aliases: ["pagar","transferir","doar","pixcoins","enviarpix","pix","cmd_pay","alt_pay","atalho_pay","abrev_pay","call_pay","func_pay"],
    category: "economy",
    subcategory: "Transferência",
    description: "Envie moedas da sua carteira para outra pessoa",
    usage: "@pessoa <valor>",
    examples: [
        "@pessoa 500 — envia 500 moedas para quem você marcou",
        "5511999999999 1000 — envia pelo número, sem marcar"
    ],
    cooldownMs: 2000,
    execute: async ({ sender, info, args, reply, mentionedJid, mentions, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const senderProfile = initializeUser(sender, xpData);

        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            || mentionedJid?.[0] || mentions?.[0];
        let targetJid = mentioned;

        let amountArg = null;
        if (mentioned) {
            amountArg = args.find(a => /^[0-9]+$/.test(a));
        } else if (args[0] && args[0].replace(/\D/g, "").length >= 8 && args[1]) {
            targetJid = args[0].replace(/\D/g, "") + "@s.whatsapp.net";
            amountArg = args[1];
        }

        const carteira = senderProfile.coins || 0;

        if (!targetJid || !amountArg) {
            return reply(F.tela({
                emoji: "💸",
                titulo: "Enviar moedas",
                intro: targetJid
                    ? `Faltou dizer quanto enviar para ${marcar(targetJid)}. Você tem *${moedas(carteira)}* na carteira.`
                    : `Diga para quem e quanto. Você tem *${moedas(carteira)}* na carteira para enviar.`,
                secoes: [
                    { emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "pay", "@pessoa 500")} — envia 500 moedas para quem você marcou`,
                        `• ${F.cmd(prefix, "pay", "5511999999999 500")} — envia pelo número`
                    ] },
                    { emoji: "💳", titulo: "Seu dinheiro", linhas: [
                        F.campo("Carteira", moedas(carteira)),
                        F.campo("Cofre", moedas(senderProfile.bank || 0))
                    ] }
                ],
                dica: "Só sai dinheiro da carteira. Se estiver no cofre, saque antes com .banco sacar.",
                proximos: [
                    { nome: "banco", args: "sacar <valor>", oque: "trazer moedas do cofre para a carteira" },
                    { nome: "extrato", oque: "ver as transferências que você já fez" }
                ],
                prefix
            }));
        }

        if (targetJid === sender) {
            return reply(F.tela({
                emoji: "🤔",
                titulo: "Esse destino é você",
                intro: "Não dá para enviar moedas para você mesmo. Marque outra pessoa.",
                proximos: [{ nome: "pay", args: "@pessoa 500", oque: "enviar para outra pessoa" }],
                prefix
            }));
        }

        const amount = parseInt(amountArg, 10);
        if (isNaN(amount) || amount <= 0) {
            return reply(F.tela({
                emoji: "🔢",
                titulo: "Valor não entendido",
                intro: `"${amountArg}" não é um valor que eu consiga enviar. Use um número inteiro maior que zero.`,
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    `• ${F.cmd(prefix, "pay", "@pessoa 500")}`,
                    `• ${F.cmd(prefix, "pay", "5511999999999 1000")}`
                ] }],
                prefix
            }));
        }

        if (carteira < amount) {
            return reply(F.tela({
                emoji: "🪙",
                titulo: "Moedas insuficientes na carteira",
                intro: `Você quer enviar *${moedas(amount)}*, mas tem *${moedas(carteira)}* na carteira.`,
                secoes: [{ emoji: "💳", titulo: "Seu dinheiro", linhas: [
                    F.campo("Carteira", moedas(carteira)),
                    F.campo("Cofre", moedas(senderProfile.bank || 0)),
                    F.campo("Faltam", moedas(amount - carteira))
                ] }],
                dica: (senderProfile.bank || 0) >= amount - carteira
                    ? "O cofre cobre a diferença: saque antes e tente de novo."
                    : "Envie um valor menor ou junte mais moedas antes.",
                proximos: [
                    (senderProfile.bank || 0) >= amount - carteira ? { nome: "banco", args: `sacar ${amount - carteira}`, oque: "sacar exatamente o que falta" } : null,
                    carteira > 0 ? { nome: "pay", args: `${marcar(targetJid)} ${carteira}`, oque: "enviar tudo o que tem na carteira" } : null
                ].filter(Boolean),
                prefix
            }));
        }

        const recipientProfile = initializeUser(targetJid, xpData);

        // Realiza transferência atômica
        senderProfile.coins = (senderProfile.coins || 0) - amount;
        recipientProfile.coins = (recipientProfile.coins || 0) + amount;

        await dataService.saveXpData(xpData);
        logger.info(`[PAY] ${sender} transferiu ${amount} coins para ${targetJid}`);

        // Registra transação para ambos os usuários no SQLite
        recordTransaction({
            userJid: sender,
            targetJid: targetJid,
            type: "PIX ENVIADO",
            amount: -amount,
            balanceAfter: senderProfile.coins,
            description: `Transferência Pix enviada para ${nomeDoMembro(targetJid)}`
        });

        recordTransaction({
            userJid: targetJid,
            targetJid: sender,
            type: "PIX RECEBIDO",
            amount: amount,
            balanceAfter: recipientProfile.coins,
            description: `Transferência Pix recebida de ${nomeDoMembro(sender)}`
        });

        return reply(F.tela({
            emoji: "💸",
            titulo: "Moedas enviadas",
            intro: `${marcar(sender)} enviou *${moedas(amount)}* para ${marcar(targetJid)}.`,
            secoes: [{ emoji: "📋", titulo: "Transferência", linhas: [
                F.campo("Valor", moedas(amount)),
                F.campo("Sua carteira", `${moedas(carteira)} → *${moedas(senderProfile.coins)}*`),
                F.campo("Para", marcar(targetJid))
            ] }],
            dica: "A transferência já aparece no extrato de vocês dois.",
            proximos: [
                { nome: "extrato", oque: "conferir a movimentação" },
                { nome: "banco", args: "depositar tudo", oque: "proteger o que ficou na carteira" }
            ],
            prefix
        }), [sender, targetJid]);
    }
};
