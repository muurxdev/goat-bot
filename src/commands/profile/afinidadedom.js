/**
 * Comando .afinidadedom — Revela qual dom elemental rege a sua essência.
 */
const F = require("../../utils/formato");
const { marcar } = require("../../utils/textoRpg");

const DONS = [
    { emoji: "🔥", nome: "Chama Solar Pura", mestre: "Herói", traco: "o calor da justiça", dica: "Quem tem a chama solar brilha mais quando o sol está alto." },
    { emoji: "⚡", nome: "Relâmpago Cortante", mestre: "Trovão", traco: "a velocidade dos raios", dica: "Quem tem o relâmpago decide rápido e acerta primeiro." },
    { emoji: "❄️", nome: "Neve Eterna", mestre: "os magos do gelo", traco: "a calma que congela o medo", dica: "Quem tem a neve eterna pensa com a cabeça fria na hora do aperto." },
    { emoji: "🌿", nome: "Vida da Terra", mestre: "Guerreira", traco: "a força da rocha e do solo", dica: "Quem tem a vida da terra aguenta firme onde os outros caem." },
    { emoji: "🌑", nome: "Treva Abissal", mestre: "GOAT", traco: "a regeneração sombria", dica: "Quem tem a treva abissal sempre volta mais forte depois de cair." }
];

module.exports = {
    name: "afinidadedom",
    aliases: ["afinidadedom-cmd", "cmd-afinidadedom"],
    category: "profile",
    subcategory: "Status",
    description: "Revela qual dom elemental rege a sua essência",
    examples: [" — sorteia o elemento da sua alma e quem compartilha dele"],
    cooldownMs: 2000,
    execute: async ({ reply, sender, prefix = "." }) => {
        const dom = DONS[Math.floor(Math.random() * DONS.length)];
        return reply(F.tela({
            emoji: "✨",
            titulo: "Elemento da sua alma",
            intro: `${marcar(sender)}, a sua essência responde ao *${dom.emoji} ${dom.nome}*.`,
            secoes: [{ emoji: "🔮", titulo: "O que isso diz", linhas: [
                F.campo("Dom", `${dom.emoji} ${dom.nome}`),
                F.campo("Afinidade com", dom.mestre),
                F.campo("Traço", dom.traco)
            ] }],
            dica: `${dom.dica} É só por diversão: o dom muda a cada consulta.`,
            proximos: [
                { nome: "afinidadedom", oque: "consultar de novo" },
                { nome: "nivelpecado", oque: "ver seu pecado do dia" },
                { nome: "perfil", oque: "ver seu perfil" }
            ],
            prefix
        }), [sender]);
    }
};
