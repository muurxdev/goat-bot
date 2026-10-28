/**
 * Comando .cofre / .poupanca / .investimentocofre
 * Sistema de cofre particular blindado com rendimento diário de juros compostos
 */

const dataService = require("../../services/dataService");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const TAXA_DIARIA = 0.015; // 1.5% ao dia

module.exports = {
    name: "cofre",
    aliases: ["poupanca","investimentocofre","meucofre","guardar-cofre","cmd_cofre","alt_cofre","atalho_cofre","abrev_cofre","call_cofre","func_cofre"],
    category: "economy",
    subcategory: "Banco",
    description: "Guarde moedas no cofre blindado que rende 1.5% ao dia e protege contra roubos",
    usage: "[guardar|retirar] [valor|all]",
    examples: [
        " — mostra o saldo do cofre e quando rende de novo",
        "guardar 1000 — guarda 1.000 moedas da carteira",
        "retirar all — tira tudo do cofre para a carteira"
    ],
    cooldownMs: 3000,
    execute: async ({ sender, reply, args, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender, xpData);
        user.cofre = user.cofre || { saldo: 0, ultimoRendimento: Date.now() };

        const sub = (args[0] || "").toLowerCase().trim();
        const agora = Date.now();
        const umDiaMs = 24 * 60 * 60 * 1000;
        const ehTudo = t => ["all", "tudo"].includes(String(t || "").toLowerCase());

        // Calcular rendimento passivo se passou mais de 24h
        let rendeuAgora = 0;
        let diasRendidos = 0;
        if (user.cofre.saldo > 0 && agora - user.cofre.ultimoRendimento >= umDiaMs) {
            const dias = Math.floor((agora - user.cofre.ultimoRendimento) / umDiaMs);
            const taxa = TAXA_DIARIA;
            const rendimento = Math.floor(user.cofre.saldo * Math.pow(1 + taxa, dias) - user.cofre.saldo);
            user.cofre.saldo += rendimento;
            user.cofre.ultimoRendimento = agora;
            rendeuAgora = rendimento;
            diasRendidos = dias;
            await dataService.saveXpData(xpData);
        }

        const proximoRendimento = Math.max(0, (user.cofre.ultimoRendimento + umDiaMs) - agora);
        const linhaRendimento = rendeuAgora > 0
            ? F.campo("Rendeu desde a última visita", `+${moedas(rendeuAgora)} (${diasRendidos} ${diasRendidos === 1 ? "dia" : "dias"})`)
            : null;

        const painel = (introExtra) => F.tela({
            emoji: "🔐",
            titulo: "Cofre blindado",
            intro: introExtra || `${marcar(sender)}, você tem *${moedas(user.cofre.saldo)}* no cofre, rendendo 1,5% ao dia.`,
            secoes: [
                { emoji: "💎", titulo: "Seu cofre", linhas: [
                    F.campo("Saldo no cofre", moedas(user.cofre.saldo)),
                    linhaRendimento,
                    F.campo("Rendimento", "1,5% ao dia, somando juros sobre juros"),
                    user.cofre.saldo > 0
                        ? F.campo("Próximo rendimento", `em ${F.tempo(proximoRendimento)} (cerca de +${moedas(Math.floor(user.cofre.saldo * TAXA_DIARIA))})`)
                        : F.campo("Próximo rendimento", "guarde moedas para começar a render"),
                    F.campo("Carteira", moedas(user.coins || 0)),
                    F.campo("Proteção", "ninguém consegue roubar o que está aqui")
                ] },
                { emoji: "⚙️", titulo: "O que dá para fazer", linhas: [
                    `• ${F.cmd(prefix, "cofre", "guardar <valor|all>")} — guarda moedas da carteira`,
                    `• ${F.cmd(prefix, "cofre", "retirar <valor|all>")} — tira moedas para a carteira`
                ] }
            ],
            dica: "Guardar moedas reinicia a contagem de 24 h do próximo rendimento.",
            proximos: [
                (user.coins || 0) > 0 ? { nome: "cofre", args: "guardar all", oque: `guardar as ${moedas(user.coins)} da carteira` } : null,
                user.cofre.saldo > 0 ? { nome: "cofre", args: "retirar <valor>", oque: "sacar parte do cofre" } : null,
                { nome: "banco", oque: "ver carteira e banco" }
            ].filter(Boolean),
            prefix
        });

        if (!sub || sub === "saldo" || sub === "status") {
            return reply(painel(), [sender]);
        }

        if (sub === "guardar" || sub === "depositar") {
            let valor = ehTudo(args[1]) ? (user.coins || 0) : parseInt(args[1], 10);
            if (isNaN(valor) || valor <= 0) {
                return reply(F.tela({
                    emoji: "🔐",
                    titulo: (user.coins || 0) <= 0 && ehTudo(args[1]) ? "Carteira vazia" : "Quanto quer guardar?",
                    intro: `Diga quanto vai da carteira para o cofre. Você tem *${moedas(user.coins || 0)}* na carteira.`,
                    secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "cofre", "guardar 1000")} — guarda 1.000 moedas`,
                        `• ${F.cmd(prefix, "cofre", "guardar all")} — guarda a carteira inteira`
                    ] }],
                    dica: "O que está no cofre rende 1,5% ao dia e não pode ser roubado.",
                    prefix
                }), [sender]);
            }

            if ((user.coins || 0) < valor) {
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Valor maior que a carteira",
                    intro: `Você quer guardar *${moedas(valor)}*, mas tem *${moedas(user.coins || 0)}* na carteira.`,
                    proximos: [
                        (user.coins || 0) > 0 ? { nome: "cofre", args: "guardar all", oque: `guardar ${moedas(user.coins)}` } : { nome: "trabalhar", oque: "ganhar moedas" }
                    ],
                    prefix
                }), [sender]);
            }

            const carteiraAntes = user.coins || 0;
            const cofreAntes = user.cofre.saldo;
            user.coins -= valor;
            user.cofre.saldo += valor;
            user.cofre.ultimoRendimento = agora;
            await dataService.saveXpData(xpData);

            return reply(F.tela({
                emoji: "🔐",
                titulo: "Moedas guardadas no cofre",
                intro: `${marcar(sender)}, você guardou *${moedas(valor)}*. Elas já estão rendendo 1,5% ao dia.`,
                secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                    F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                    F.campo("Cofre", `${moedas(cofreAntes)} → *${moedas(user.cofre.saldo)}*`),
                    F.campo("Próximo rendimento", `em ${F.tempo(umDiaMs)} (cerca de +${moedas(Math.floor(user.cofre.saldo * TAXA_DIARIA))})`),
                    linhaRendimento
                ] }],
                dica: "Guardar de novo reinicia a contagem de 24 h. Junte tudo de uma vez para render mais.",
                proximos: [
                    { nome: "cofre", oque: "acompanhar o saldo" },
                    { nome: "cofre", args: "retirar <valor>", oque: "tirar quando precisar" }
                ],
                prefix
            }), [sender]);
        }

        if (sub === "retirar" || sub === "sacar") {
            let valor = ehTudo(args[1]) ? user.cofre.saldo : parseInt(args[1], 10);
            if (isNaN(valor) || valor <= 0) {
                return reply(F.tela({
                    emoji: "🔓",
                    titulo: user.cofre.saldo <= 0 ? "Cofre vazio" : "Quanto quer retirar?",
                    intro: `Diga quanto sai do cofre para a carteira. Você tem *${moedas(user.cofre.saldo)}* no cofre.`,
                    secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "cofre", "retirar 500")} — tira 500 moedas`,
                        `• ${F.cmd(prefix, "cofre", "retirar all")} — tira tudo`
                    ] }],
                    dica: "Na carteira as moedas param de render e podem ser roubadas.",
                    prefix
                }), [sender]);
            }

            if (user.cofre.saldo < valor) {
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Valor maior que o cofre",
                    intro: `Você quer retirar *${moedas(valor)}*, mas tem *${moedas(user.cofre.saldo)}* no cofre.`,
                    proximos: [
                        user.cofre.saldo > 0 ? { nome: "cofre", args: "retirar all", oque: `retirar ${moedas(user.cofre.saldo)}` } : { nome: "cofre", args: "guardar <valor>", oque: "guardar moedas primeiro" }
                    ],
                    prefix
                }), [sender]);
            }

            const carteiraAntes = user.coins || 0;
            const cofreAntes = user.cofre.saldo;
            user.cofre.saldo -= valor;
            user.coins = (user.coins || 0) + valor;
            await dataService.saveXpData(xpData);

            return reply(F.tela({
                emoji: "🔓",
                titulo: "Retirada feita",
                intro: `${marcar(sender)}, você tirou *${moedas(valor)}* do cofre. Elas já estão na carteira.`,
                secoes: [{ emoji: "💳", titulo: "Antes e depois", linhas: [
                    F.campo("Cofre", `${moedas(cofreAntes)} → *${moedas(user.cofre.saldo)}*`),
                    F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                    user.cofre.saldo > 0 ? F.campo("Próximo rendimento", `em ${F.tempo(proximoRendimento)}`) : null,
                    linhaRendimento
                ] }],
                dica: "Na carteira as moedas não rendem e podem ser roubadas. Use só o que precisar.",
                proximos: [
                    { nome: "cofre", args: "guardar <valor>", oque: "devolver o que sobrar" },
                    { nome: "banco", oque: "ver carteira e banco" }
                ],
                prefix
            }), [sender]);
        }

        // Subcomando desconhecido: antes não havia resposta nenhuma.
        return reply(painel(`Não conheço a opção "${args[0]}". Aqui está o seu cofre e o que dá para fazer.`), [sender]);
    }
};
