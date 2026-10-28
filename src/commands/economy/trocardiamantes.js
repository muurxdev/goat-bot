/**
 * Comando .trocardiamantes — cotação de diamantes em moedas de ouro na joalheria Central.
 *
 * Só mostra a cotação (550 moedas por diamante). A versão anterior dizia
 * "Você trocou", mas nunca tirou diamante nem deu moeda: a troca de verdade
 * não existe ainda, e a tela agora diz isso em vez de anunciar um ganho falso.
 */

const F = require("../../utils/formato");

const PRECO = 550;

module.exports = {
    name: "trocardiamantes",
    aliases: ["trocardiamantes-cmd","cmd-trocardiamantes","cmd_trocardiamantes","alt_trocardiamantes","atalho_trocardiamantes","abrev_trocardiamantes","call_trocardiamantes","func_trocardiamantes"],
    category: "economy",
    subcategory: "Mercado",
    description: "Mostra quantas moedas de ouro seus diamantes valem na joalheria",
    usage: "[quantidade]",
    examples: [
        " — cotação de 1 diamante",
        "10 — cotação de 10 diamantes"
    ],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = "." }) => {
        const qtd = Math.max(1, parseInt(args[0]) || 1);
        const ganho = qtd * PRECO;
        const fmt = n => n.toLocaleString("pt-BR");

        return reply(F.tela({
            emoji: "💎",
            titulo: "Cotação da joalheria",
            intro: `Na joalheria Central, *${fmt(qtd)} ${qtd === 1 ? "diamante vale" : "diamantes valem"}* *${fmt(ganho)} moedas de ouro*.`,
            secoes: [{ emoji: "📋", titulo: "A conta", linhas: [
                F.campo("Diamantes", fmt(qtd)),
                F.campo("Preço de cada", `${fmt(PRECO)} moedas`),
                F.campo("Total", `${fmt(ganho)} moedas`)
            ] }],
            dica: "Esta tela só mostra a cotação: nenhum diamante sai do seu inventário e nenhuma moeda entra.",
            proximos: [
                { nome: "trocardiamantes", args: "10", oque: "cotar 10 diamantes" },
                { nome: "minerardiamante", oque: "minerar diamantes" }
            ],
            prefix
        }));
    }
};
