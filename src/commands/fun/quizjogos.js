/**
 * Comando .quizjogos — Pergunta sobre videogames clássicos e modernos: .quizjogos
 */
module.exports = {
    name: "quizjogos",
    aliases: ["quizjogos-cmd","cmd-quizjogos"],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta sobre videogames clássicos e modernos: .quizjogos",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const quizes = [
                { q: "Qual é o nome do protagonista da franquia The Legend of Zelda?", a: "Link" },
                { q: "Em que ano foi lançado o clássico Minecraft?", a: "2011" },
                { q: "Qual foi o primeiro console doméstico lançado pela Sony?", a: "PlayStation 1 (1994)" },
                { q: "Qual empresa desenvolveu a franquia Dark Souls?", a: "FromSoftware" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(`🎮 *QUIZ DE VIDEOGAMES*\n\n❓ *Pergunta:* ${q.q}\n▫️ *Resposta oculta:* ||${q.a}||`);
        }
};
