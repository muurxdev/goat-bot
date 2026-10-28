/**
 * Comando .multiplicador — calcula quanto um valor vira com um multiplicador de evento.
 * Só faz a conta: não mexe no saldo de ninguém.
 */

const F = require("../../utils/formato");

module.exports = {
    name: "multiplicador",
    aliases: ["multiplicador-cmd","cmd-multiplicador","cmd_multiplicador","alt_multiplicador","atalho_multiplicador","abrev_multiplicador","call_multiplicador","func_multiplicador"],
    category: "economy",
    subcategory: "Finanças",
    description: "Calcula quanto um valor vira com um multiplicador de evento",
    usage: "[valor] [fator]",
    examples: [
        " — calcula 100 × 2",
        "1500 3 — calcula 1.500 × 3",
        "800 1.5 — calcula 800 × 1,5"
    ],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], prefix = "." }) => {
        const v = parseFloat(String(args[0] || "").replace(",", ".")) || 100;
        const f = parseFloat(String(args[1] || "").replace(",", ".")) || 2;
        const fmt = n => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
        const resultado = v * f;

        return reply(F.tela({
            emoji: "✖️",
            titulo: `${fmt(v)} × ${fmt(f)} = ${fmt(resultado)}`,
            intro: `Com multiplicador de *${fmt(f)}x*, ${fmt(v)} vira *${fmt(resultado)}*.`,
            secoes: [{ emoji: "📋", titulo: "A conta", linhas: [
                F.campo("Valor", fmt(v)),
                F.campo("Multiplicador", `${fmt(f)}x`),
                F.campo("Resultado", fmt(resultado)),
                F.campo("Diferença", `${resultado >= v ? "+" : ""}${fmt(resultado - v)}`)
            ] }],
            dica: args[0] ? "Use vírgula ou ponto para multiplicadores quebrados, como 1,5." : "Sem números, usei 100 × 2. Informe o valor e o fator para a sua conta.",
            proximos: [{ nome: "multiplicador", args: "1500 3", oque: "calcular outro valor" }],
            prefix
        }));
    }
};
