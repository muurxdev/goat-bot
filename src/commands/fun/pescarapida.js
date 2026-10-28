/**
 * Comando .pescarapida — Lança a vara de pesca em águas místicas para fisgar algo
 */
const F = require("../../utils/formato");
module.exports = {
    name: "pescarapida",
    aliases: ["jogopesca"],
    category: "fun",
    subcategory: "Jogos",
    description: "Lança a vara de pesca em águas místicas para fisgar algo",
    examples: [" — lança a vara e mostra o que você pescou"],
    cooldownMs: 2000,
    execute: async ({ reply, sender, prefix = "." }) => {
            const catches = [
                { name: '🐟 Tilápia Comum', val: 10 },
                { name: '🐠 Salmão Dourado', val: 50 },
                { name: '🐡 Baiacu Espinhoso', val: 25 },
                { name: '🦐 Camarão Gigante', val: 35 },
                { name: '🦑 Lula das Profundezas', val: 80 },
                { name: '🦈 Pequeno Tubarão Azul', val: 150 },
                { name: '👢 Bota Velha Furada', val: 0 },
                { name: '👑 Baú Afundado Misterioso', val: 300 }
            ];
            const p = catches[Math.floor(Math.random() * catches.length)];
            const raridade = p.val >= 150 ? "🌟 Raríssimo" : p.val >= 50 ? "✨ Raro" : p.val > 0 ? "🐟 Comum" : "🗑️ Lixo";
            return reply(F.tela({
                emoji: "🎣",
                titulo: p.val > 0 ? "Fisgou!" : "Só lixo desta vez",
                intro: `Você puxou a linha e veio *${p.name}*!`,
                secoes: [{ emoji: "📋", titulo: "A pesca", linhas: [
                    F.campo("Raridade", raridade),
                    F.campo("Valor estimado", `${p.val} moedas`)
                ] }],
                dica: "Esta pescaria é só diversão: o valor é estimado e não entra no seu saldo.",
                proximos: [
                    { nome: "pescarapida", oque: "lançar a vara de novo" },
                    { nome: "numerodasorte", oque: "seus números da sorte" }
                ],
                prefix
            }));
        }
};
