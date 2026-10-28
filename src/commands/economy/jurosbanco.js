/**
 * Comando .jurosbanco — simula quanto um saldo rende em meses, a 1% ao mês com juros sobre juros.
 * Só faz a conta: não mexe no saldo de ninguém.
 */

const F = require("../../utils/formato");

const TAXA_MENSAL = 0.01;

module.exports = {
    name: "jurosbanco",
    aliases: ["jurosbanco-cmd","cmd-jurosbanco","cmd_jurosbanco","alt_jurosbanco","atalho_jurosbanco","abrev_jurosbanco","call_jurosbanco","func_jurosbanco"],
    category: "economy",
    subcategory: "Banco",
    description: "Simula quanto um saldo rende em alguns meses, a 1% ao mês",
    usage: "[saldo] [meses]",
    examples: [
        " — simula 1.000 moedas por 6 meses",
        "50000 12 — simula 50.000 moedas por 12 meses"
    ],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], prefix = "." }) => {
        const saldo = parseFloat(args[0]) || 1000;
        const meses = parseInt(args[1]) || 6;

        if (saldo <= 0 || meses <= 0 || meses > 600) {
            return reply(F.tela({
                emoji: "📈",
                titulo: "Não consegui simular",
                intro: "Use um saldo maior que zero e de 1 a 600 meses.",
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    `• ${F.cmd(prefix, "jurosbanco", "50000 12")} — 50.000 moedas por 12 meses`,
                    `• ${F.cmd(prefix, "jurosbanco")} — 1.000 moedas por 6 meses`
                ] }],
                prefix
            }));
        }

        const final = saldo * Math.pow(1 + TAXA_MENSAL, meses);
        const rend = final - saldo;
        const fmt = n => Math.round(n).toLocaleString("pt-BR");

        return reply(F.tela({
            emoji: "📈",
            titulo: "Simulação de rendimento",
            intro: `*${fmt(saldo)} moedas* guardadas por ${meses} ${meses === 1 ? "mês" : "meses"} rendem *+${fmt(rend)} moedas*.`,
            secoes: [{ emoji: "📋", titulo: "A conta", linhas: [
                F.campo("Saldo inicial", `${fmt(saldo)} moedas`),
                F.campo("Prazo", `${meses} ${meses === 1 ? "mês" : "meses"}`),
                F.campo("Taxa", "1% ao mês, juros sobre juros"),
                F.campo("Rendimento", `+${fmt(rend)} moedas`),
                F.campo("Saldo final", `${fmt(final)} moedas`)
            ] }],
            dica: "É só uma simulação. O rendimento real do banco aparece no .bancoprojecao.",
            proximos: [
                { nome: "bancoprojecao", oque: "projeção com o seu saldo real" },
                { nome: "jurosbanco", args: `${Math.round(saldo)} ${meses * 2}`, oque: "simular o dobro do prazo" }
            ],
            prefix
        }));
    }
};
