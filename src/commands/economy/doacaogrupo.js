/**
 * Comando .doacaogrupo
 * Deixa uma chuva de moedas no grupo: a próxima pessoa que mandar mensagem leva.
 * Quem pega é decidido em handlers/messageHandler.js (drop pendente, validade de 1 hora).
 */

const dataService = require("../../services/dataService");
const { dropPendenteAtivo } = require("../../services/economyService");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const VALOR_PADRAO = 1000;

module.exports = {
    name: "doacaogrupo",
    aliases: ["chuvademoedas","droparmoedas","doartodos","cmd_doacaogrupo","alt_doacaogrupo","atalho_doacaogrupo","abrev_doacaogrupo","call_doacaogrupo","func_doacaogrupo"],
    category: "economy",
    subcategory: "Transferência",
    description: "Espalhe uma chuva de moedas: a próxima pessoa que falar no grupo leva",
    usage: "[valor]",
    examples: [
        " — solta 1.000 moedas para o grupo",
        "5000 — solta 5.000 moedas para o grupo"
    ],
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, sender, reply, args = [], prefix = "." }) => {
        const user = dataService.initializeUser(sender);
        const carteira = user.coins || 0;

        // Sem valor → 1.000. Valor inválido, zero ou negativo → tela de uso, sem cobrar.
        // Antes "-1000" passava pela checagem de saldo e SOMAVA moedas a quem doava.
        const semValor = !args[0];
        const digitado = semValor ? "" : String(args[0]).trim();
        const valor = semValor ? VALOR_PADRAO : (/^\d+$/.test(digitado) ? parseInt(digitado, 10) : NaN);

        if (!valor || valor <= 0) {
            return reply(F.tela({
                emoji: "🌧️",
                titulo: "Não entendi o valor",
                intro: `"${digitado.slice(0, 30)}" não é um valor de doação. Use um número inteiro maior que zero. Nada foi cobrado.`,
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    `• ${F.cmd(prefix, "doacaogrupo")} — solta ${moedas(VALOR_PADRAO)}`,
                    `• ${F.cmd(prefix, "doacaogrupo", "5000")} — solta 5.000 moedas`
                ] }],
                dica: `Sua carteira tem ${moedas(carteira)}.`,
                prefix
            }));
        }

        // Já existe chuva pendente: uma nova sobrescreveria a anterior e as
        // moedas de quem doou antes sumiriam. Recusa até alguém pegar ou expirar.
        const pendente = await dropPendenteAtivo(from);
        if (pendente) {
            const doouVoce = pendente.sponsor === sender;
            return reply(F.tela({
                emoji: "🌧️",
                titulo: "Já tem uma chuva de moedas no ar",
                intro: `${doouVoce ? "Você já soltou" : `${marcar(pendente.sponsor)} já soltou`} *${moedas(pendente.amount)}* neste grupo e ninguém pegou ainda. Só cabe uma chuva por vez. Nada foi cobrado.`,
                secoes: [{ emoji: "📋", titulo: "Chuva pendente", linhas: [
                    F.campo("Valor", moedas(pendente.amount)),
                    F.campo("Quem doou", doouVoce ? "você" : marcar(pendente.sponsor)),
                    F.campo("Expira em", F.tempo(pendente.expiraEmMs))
                ] }],
                dica: "Assim que alguém pegar, ou quando ela expirar e as moedas voltarem para quem doou, você pode soltar a sua.",
                prefix
            }), [sender, pendente.sponsor]);
        }

        if (carteira < valor) {
            return reply(F.tela({
                emoji: "🪙",
                titulo: "Moedas insuficientes",
                intro: `A chuva seria de *${moedas(valor)}*, mas você tem *${moedas(carteira)}* na carteira. Nada foi cobrado.`,
                secoes: [{ emoji: "💳", titulo: "Seu dinheiro", linhas: [
                    F.campo("Carteira", moedas(carteira)),
                    F.campo("Banco", moedas(user.bank || 0))
                ] }],
                proximos: [
                    carteira > 0 ? { nome: "doacaogrupo", args: String(carteira), oque: "doar o que tem na carteira" } : { nome: "trabalhar", oque: "ganhar moedas" },
                    (user.bank || 0) > 0 ? { nome: "banco", args: "sacar <valor>", oque: "trazer moedas do banco" } : null
                ].filter(Boolean),
                prefix
            }));
        }

        user.coins = carteira - valor;
        dataService.saveUser(user);

        // Drop pendente no grupo: a próxima pessoa que falar leva.
        const configs = dataService.getConfigsData();
        configs[from] = configs[from] || {};
        configs[from].pendingDrop = {
            amount: valor,
            sponsor: sender,
            createdAt: Date.now()
        };
        await dataService.saveConfigsData(configs);

        return reply(F.tela({
            emoji: "🌧️",
            titulo: "Chuva de moedas no grupo",
            intro: `${marcar(sender)} soltou *${moedas(valor)}* para o grupo! A próxima pessoa que mandar mensagem leva tudo.`,
            secoes: [{ emoji: "📋", titulo: "Como funciona", linhas: [
                F.campo("Valor", moedas(valor)),
                F.campo("Quem leva", "a próxima pessoa que falar, menos quem doou"),
                F.campo("Validade", "1 hora; se ninguém pegar, as moedas voltam para você"),
                F.campo("Sua carteira", `${moedas(carteira)} → *${moedas(user.coins)}*`)
            ] }],
            dica: "Uma chuva de moedas é um bom jeito de agitar o grupo.",
            proximos: [{ nome: "banco", oque: "ver carteira e banco" }],
            prefix
        }), [sender]);
    }
};
