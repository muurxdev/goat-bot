/**
 * Comando .rodadeteste — Testa a afinidade com um membro ou crush: .rodadeteste [nome]
 */
const F = require("../../utils/formato");
module.exports = {
    name: "rodadeteste",
    aliases: ["rodadeteste-cmd","cmd-rodadeteste"],
    category: "fun",
    subcategory: "Brincadeiras",
    description: "Testa, de brincadeira, a afinidade com um membro ou crush",
    usage: "[nome]",
    examples: [" — testa com alguém misterioso", "Maria — testa a afinidade com Maria"],
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix = "." }) => {
            const nome = args.join(" ") || "Alguém misterioso";
            const pct = Math.floor(Math.random() * 101);
            let frase = "";
            if (pct > 80) frase = "🔥 Amor arrebatador digno de GOAT e Princesa!";
            else if (pct > 50) frase = "✨ Amizade forte e companheirismo leal.";
            else if (pct > 20) frase = "⚠️ Clima tenso... melhor manter a distância de segurança!";
            else frase = "💀 Incompatibilidade total, pior que Ban e King discutindo!";
            return reply(F.tela({
                emoji: "💘",
                titulo: `Afinidade: ${pct}%`,
                intro: `Com *${nome}*: ${frase}`,
                secoes: [{ emoji: "📏", titulo: "Compatibilidade", linhas: [F.barra(pct / 100)] }],
                dica: args.length ? "O número é sorteado a cada teste: é só brincadeira." : "Diga um nome para testar com alguém específico.",
                proximos: [
                    { nome: "rodadeteste", args: "Maria", oque: "testar com um nome" },
                    { nome: "afinidade", args: "@pessoa", oque: "vínculo real pelos gestos do grupo" }
                ],
                prefix
            }));
        }
};
