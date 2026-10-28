/**
 * Comando .banco / .bank / .extrato / .depositar / .sacar
 * Sistema Bancário Seguro com Extrato em Tempo Real e Persistência SQLite
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { recordTransaction, getUserTransactions } = require("../../database/repositories/transactionRepository");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

/** "DEPÓSITO" / "PIX ENVIADO" gravados no extrato viram "Depósito" / "Pix enviado". */
function tipoLegivel(tipo) {
    const t = String(tipo || "movimentação").toLocaleLowerCase("pt-BR");
    return t.charAt(0).toLocaleUpperCase("pt-BR") + t.slice(1);
}

const ACOES_CONHECIDAS = ["", "banco", "bank", "saldo", "cofrinho", "painel", "ver"];

module.exports = {
    name: "banco",
    aliases: ["bank","depositar","sacar","dep","saque","saldo","extrato","cofrinho","cmd_banco","alt_banco","atalho_banco","abrev_banco","call_banco","func_banco"],
    category: "economy",
    subcategory: "Banco",
    description: "Guarde moedas no cofre, saque quando precisar e veja o extrato",
    usage: "[depositar|sacar|extrato] [valor|tudo]",
    examples: [
        " — mostra carteira, cofre e total",
        "depositar 500 — guarda 500 moedas no cofre, longe de ladrões",
        "sacar tudo — traz todo o cofre de volta para a carteira",
        "extrato — lista as últimas movimentações"
    ],
    cooldownMs: 1500,
    execute: async ({ sender, args, reply, commandName, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        user.bank = Number(user.bank || user.banco || 0);
        user.banco = user.bank;

        let action = (args[0] || commandName || "").toLowerCase().trim();
        let valArg = args[1];

        if (commandName === "depositar" || commandName === "dep") {
            action = "depositar";
            valArg = args[0];
        } else if (commandName === "sacar" || commandName === "saque") {
            action = "sacar";
            valArg = args[0];
        } else if (commandName === "extrato") {
            action = "extrato";
        }

        // 1. EXTRATO FINANCEIRO DETALHADO
        if (action === "extrato" || action === "historico" || action === "transacoes") {
            const txs = getUserTransactions(sender, 8);
            const totalPatrimonio = (user.coins || 0) + user.bank;

            const linhasTx = txs.map(tx => {
                const valor = `${tx.amount >= 0 ? "+" : "−"}${moedas(Math.abs(tx.amount))}`;
                const dateStr = new Date(tx.created_at).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                const desc = tx.description ? `\n   _${tx.description}_` : "";
                return `• *${valor}* · ${tipoLegivel(tx.type)} · ${dateStr}${desc}`;
            });

            return reply(F.tela({
                emoji: "📜",
                titulo: "Seu extrato",
                intro: txs.length
                    ? `${marcar(sender)}, estas são as suas ${txs.length === 1 ? "última movimentação" : `últimas ${txs.length} movimentações`}. Seu total hoje é *${moedas(totalPatrimonio)}*.`
                    : `${marcar(sender)}, ainda não anotei nenhuma movimentação sua. Seu total hoje é *${moedas(totalPatrimonio)}*.`,
                secoes: [
                    { emoji: "💳", titulo: "Resumo", linhas: [
                        F.campo("Carteira", `${moedas(user.coins || 0)} (pode ser roubada)`),
                        F.campo("Cofre", `${moedas(user.bank)} (protegido)`),
                        F.campo("Total", moedas(totalPatrimonio))
                    ] },
                    { emoji: "📊", titulo: "Últimas movimentações", linhas: linhasTx }
                ],
                dica: txs.length
                    ? "Depósitos, saques e transferências com .pay aparecem aqui na hora."
                    : "Guarde ou envie moedas e a movimentação aparece aqui na hora.",
                proximos: [
                    { nome: "banco", args: "depositar <valor>", oque: "proteger moedas da carteira" },
                    { nome: "banco", args: "sacar <valor>", oque: "trazer moedas para a carteira" },
                    { nome: "pay", args: "@pessoa <valor>", oque: "enviar moedas para alguém" }
                ],
                prefix
            }), [sender]);
        }

        // 2. DEPOSITAR COINS NO BANCO
        if (action === "depositar" || action === "dep") {
            const walletCoins = user.coins || 0;
            if (walletCoins <= 0) {
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Carteira vazia",
                    intro: "Não há moedas na sua carteira para guardar no cofre.",
                    secoes: [{ emoji: "💳", titulo: "Seu dinheiro", linhas: [
                        F.campo("Carteira", moedas(0)),
                        F.campo("Cofre", moedas(user.bank))
                    ] }],
                    dica: "Ganhe moedas trabalhando ou coletando o prêmio do dia e volte para guardar.",
                    proximos: [
                        { nome: "trabalhar", oque: "ganhar moedas" },
                        { nome: "premiodiario", oque: "pegar o prêmio do dia" }
                    ],
                    prefix
                }), [sender]);
            }

            let amount = 0;
            if (valArg === "all" || valArg === "tudo" || valArg === "max") {
                amount = walletCoins;
            } else {
                amount = parseInt(valArg, 10);
            }

            if (isNaN(amount) || amount <= 0) {
                return reply(F.tela({
                    emoji: "🏦",
                    titulo: "Quanto quer guardar?",
                    intro: `Diga o valor que vai da carteira para o cofre. Você tem *${moedas(walletCoins)}* na carteira.`,
                    secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "banco", "depositar 500")} — guarda 500 moedas`,
                        `• ${F.cmd(prefix, "banco", "depositar tudo")} — guarda a carteira inteira`,
                        `• ${F.cmd(prefix, "depositar", "1000")} — atalho direto`
                    ] }],
                    dica: "No cofre ninguém consegue roubar com .roubar.",
                    prefix
                }), [sender]);
            }

            if (amount > walletCoins) {
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Valor maior que a carteira",
                    intro: `Você pediu para guardar *${moedas(amount)}*, mas tem *${moedas(walletCoins)}* na carteira.`,
                    dica: "Use \"tudo\" para guardar exatamente o que você tem.",
                    proximos: [
                        { nome: "banco", args: "depositar tudo", oque: `guardar ${moedas(walletCoins)}` }
                    ],
                    prefix
                }), [sender]);
            }

            const carteiraAntes = walletCoins;
            const cofreAntes = user.bank;
            user.coins = walletCoins - amount;
            user.bank = user.bank + amount;
            user.banco = user.bank;
            dataService.saveUser(user);

            // Grava no extrato
            recordTransaction({
                userJid: sender,
                type: "DEPÓSITO",
                amount: amount,
                balanceAfter: user.bank,
                description: `Depósito no cofre bancário central`
            });

            return reply(F.tela({
                emoji: "🏦",
                titulo: "Moedas guardadas no cofre",
                intro: `${marcar(sender)}, você guardou *${moedas(amount)}*. Agora ninguém consegue roubar esse valor.`,
                secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                    F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                    F.campo("Cofre", `${moedas(cofreAntes)} → *${moedas(user.bank)}*`),
                    F.campo("Total", moedas(user.coins + user.bank))
                ] }],
                dica: user.coins > 0
                    ? `Ainda sobraram ${moedas(user.coins)} na carteira, e elas podem ser roubadas.`
                    : "Sua carteira está zerada: não há nada para roubarem de você agora.",
                proximos: [
                    { nome: "banco", args: "sacar <valor>", oque: "tirar moedas quando precisar" },
                    { nome: "banco", args: "extrato", oque: "ver as últimas movimentações" }
                ],
                prefix
            }), [sender]);
        }

        // 3. SACAR COINS DO BANCO
        if (action === "sacar" || action === "saque") {
            const bankCoins = user.bank || 0;
            if (bankCoins <= 0) {
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Cofre vazio",
                    intro: "Não há moedas no seu cofre para sacar.",
                    secoes: [{ emoji: "💳", titulo: "Seu dinheiro", linhas: [
                        F.campo("Carteira", moedas(user.coins || 0)),
                        F.campo("Cofre", moedas(0))
                    ] }],
                    dica: "Guarde moedas no cofre para protegê-las de roubo.",
                    proximos: [
                        { nome: "banco", args: "depositar <valor>", oque: "guardar moedas da carteira" }
                    ],
                    prefix
                }), [sender]);
            }

            let amount = 0;
            if (valArg === "all" || valArg === "tudo" || valArg === "max") {
                amount = bankCoins;
            } else {
                amount = parseInt(valArg, 10);
            }

            if (isNaN(amount) || amount <= 0) {
                return reply(F.tela({
                    emoji: "🏦",
                    titulo: "Quanto quer sacar?",
                    intro: `Diga o valor que sai do cofre para a carteira. Você tem *${moedas(bankCoins)}* no cofre.`,
                    secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "banco", "sacar 500")} — tira 500 moedas`,
                        `• ${F.cmd(prefix, "banco", "sacar tudo")} — tira o cofre inteiro`,
                        `• ${F.cmd(prefix, "sacar", "1000")} — atalho direto`
                    ] }],
                    dica: "Saque só o que vai usar: na carteira o dinheiro pode ser roubado.",
                    prefix
                }), [sender]);
            }

            if (amount > bankCoins) {
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Valor maior que o cofre",
                    intro: `Você pediu para sacar *${moedas(amount)}*, mas tem *${moedas(bankCoins)}* no cofre.`,
                    dica: "Use \"tudo\" para sacar exatamente o que está guardado.",
                    proximos: [
                        { nome: "banco", args: "sacar tudo", oque: `sacar ${moedas(bankCoins)}` }
                    ],
                    prefix
                }), [sender]);
            }

            const carteiraAntes = user.coins || 0;
            const cofreAntes = bankCoins;
            user.bank = bankCoins - amount;
            user.banco = user.bank;
            user.coins = (user.coins || 0) + amount;
            dataService.saveUser(user);

            // Grava no extrato
            recordTransaction({
                userJid: sender,
                type: "SAQUE",
                amount: -amount,
                balanceAfter: user.bank,
                description: `Saque efetuado do cofre bancário`
            });

            return reply(F.tela({
                emoji: "🏦",
                titulo: "Saque feito",
                intro: `${marcar(sender)}, você tirou *${moedas(amount)}* do cofre. Elas já estão na sua carteira.`,
                secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                    F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                    F.campo("Cofre", `${moedas(cofreAntes)} → *${moedas(user.bank)}*`),
                    F.campo("Total", moedas(user.coins + user.bank))
                ] }],
                dica: "Na carteira o dinheiro pode ser roubado com .roubar. Guarde o que sobrar.",
                proximos: [
                    { nome: "banco", args: "depositar <valor>", oque: "guardar de novo o que não usar" },
                    { nome: "banco", args: "extrato", oque: "ver as últimas movimentações" }
                ],
                prefix
            }), [sender]);
        }

        // 4. PAINEL PRINCIPAL DO BANCO
        const totalCoins = (user.coins || 0) + user.bank;
        const acaoDesconhecida = args[0] && !ACOES_CONHECIDAS.includes(action);
        const protegido = totalCoins > 0 ? user.bank / totalCoins : 0;

        return reply(F.tela({
            emoji: "🏦",
            titulo: "Banco Central",
            intro: acaoDesconhecida
                ? `Não conheço a opção "${args[0]}". Aqui está o seu dinheiro e o que dá para fazer.`
                : `${marcar(sender)}, você tem *${moedas(totalCoins)}* ao todo, com *${moedas(user.bank)}* protegidas no cofre.`,
            secoes: [
                { emoji: "💳", titulo: "Seu dinheiro", linhas: [
                    F.campo("Carteira", `${moedas(user.coins || 0)} (pode ser roubada)`),
                    F.campo("Cofre", `${moedas(user.bank)} (protegido)`),
                    F.campo("Total", moedas(totalCoins)),
                    totalCoins > 0 ? F.campo("Protegido", F.barra(protegido)) : null
                ] },
                { emoji: "⚙️", titulo: "O que dá para fazer", linhas: [
                    `• ${F.cmd(prefix, "banco", "depositar <valor|tudo>")} — guardar no cofre`,
                    `• ${F.cmd(prefix, "banco", "sacar <valor|tudo>")} — tirar para a carteira`,
                    `• ${F.cmd(prefix, "banco", "extrato")} — ver as últimas movimentações`
                ] }
            ],
            dica: (user.coins || 0) > 0
                ? `Guarde as ${moedas(user.coins)} da carteira com .banco depositar tudo antes que alguém tente roubar.`
                : "O extrato mostra depósitos, saques e transferências: use .extrato para conferir.",
            proximos: [
                (user.coins || 0) > 0 ? { nome: "banco", args: "depositar tudo", oque: "proteger toda a carteira" } : { nome: "trabalhar", oque: "ganhar moedas" },
                { nome: "extrato", oque: "ver as últimas movimentações" },
                { nome: "pay", args: "@pessoa <valor>", oque: "enviar moedas para alguém" }
            ],
            prefix
        }), [sender]);
    }
};
