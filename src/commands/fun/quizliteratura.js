/**
 * Comando .quizliteratura — Pergunta sobre clássicos da literatura universal: .quizliteratura
 */
module.exports = {
    name: "quizliteratura",
    aliases: ["quizliteratura-cmd","cmd-quizliteratura"],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta sobre clássicos da literatura universal: .quizliteratura",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const quizes = [
                { q: "Quem escreveu a obra-prima 'Dom Quixote de la Mancha'?", a: "Miguel de Cervantes" },
                { q: "Qual escritor brasileiro escreveu 'Memórias Póstumas de Brás Cubas'?", a: "Machado de Assis" },
                { q: "Quem é o autor do poema épico 'A Divina Comédia'?", a: "Dante Alighieri" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(`📚 *QUIZ DE LITERATURA*\n\n❓ *Pergunta:* ${q.q}\n▫️ *Resposta:* ||${q.a}||`);
        }
};
