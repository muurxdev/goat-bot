const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .iqteste — Mede o QI humorístico do usuário ou de alguém marcado
 */
const F = require("../../utils/formato");
module.exports = {
    name: "iqteste",
    aliases: ["mediriq"],
    category: "fun",
    subcategory: "Jogos",
    description: "Mede o QI humorístico do usuário ou de alguém marcado",
    usage: "[@pessoa]",
    examples: [" — mede o seu QI de brincadeira", "@pessoa — mede o QI de alguém"],
    cooldownMs: 2000,
    execute: async ({ sender, info, reply, prefix = "." }) => {
            const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = mentioned || sender;
            const iq = Math.floor(Math.random() * 160) + 40;
            let diag = '';
            if (iq > 140) diag = '🧠 Gênio absoluto nível Mago de Reino!';
            else if (iq > 115) diag = '💡 Inteligência acima da média, raciocínio afiado.';
            else if (iq > 90) diag = '⚖️ Intelecto equilibrado dentro do esperado.';
            else if (iq > 70) diag = '🐷 Nível Guardião: pensa mais em comida do que em contas.';
            else diag = '🪨 Cérebro de pedra rústica.';
            return reply(F.tela({
                emoji: "🧠",
                titulo: `QI ${iq}`,
                intro: `Examinei a cabeça de ${nomeDoMembro(target)} e o resultado foi *${iq}*.`,
                secoes: [{ emoji: "📋", titulo: "Diagnóstico", linhas: [
                    diag,
                    F.campo("Escala", "de 40 a 199 (média humana perto de 100)")
                ] }],
                dica: "É só brincadeira: o número é sorteado a cada teste.",
                proximos: [
                    { nome: "iqteste", args: "@pessoa", oque: "testar alguém do grupo" },
                    { nome: "inteligenciometro", oque: "medidor de inteligência do dia" }
                ],
                prefix
            }), [target]);
        }
};
