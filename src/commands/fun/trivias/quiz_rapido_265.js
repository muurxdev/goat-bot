/**
 * Desafio Relâmpago de Quiz #265
 */
const { getRandomQuestion, submitAnswer } = require('../../../services/triviaService');
const { adicionarXp, initializeUser } = require('../../../services/xpService');
const dataService = require('../../../services/dataService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'quiz_rapido_265',
    aliases: ["qr_265"],
    category: 'fun',
    subcategory: 'Quiz Relâmpago',
    description: 'Desafio rápido de conhecimento geral #265',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const q = getRandomQuestion();
        const userChoice = args.length > 0 ? args.join(' ').trim() : null;

        if (!userChoice) {
            const optLines = q.opts.map((o, idx) => `${idx + 1}. ${o}`);
            const doc = [
                M.cabecalho('⚡', 'Desafio Relâmpago #265'),
                '🏷️ *Categoria:* ' + q.category.toUpperCase(),
                '❓ *' + q.q + '*',
                M.secao('📋', 'Alternativas', optLines),
                '👉 Envie sua resposta com: `.quiz_rapido_265 <opção>`'
            ].join('\n\n');
            return reply(doc);
        }

        const isCorrect = q.opts.some((opt, idx) => {
            const num = (idx + 1).toString();
            return (userChoice === num || userChoice.toLowerCase() === opt.toLowerCase()) && opt.toLowerCase() === q.a.toLowerCase();
        });

        const prize = { coins: 100, xp: 150 };
        const result = submitAnswer(sender, q.category, isCorrect, prize);

        if (isCorrect) {
            const u = initializeUser(sender, {});
            const { xpGanho } = adicionarXp(u, prize.xp, { source: 'rpg' });
            u.coins = (u.coins || 0) + prize.coins;
            dataService.saveUser(u);

            return reply(
                '✅ *Exato!* Resposta correta: *' + q.a + '*\n' +
                '🎁 + ' + xpGanho + ' XP | + ' + prize.coins + ' moedas! (Streak: ' + result.streak + ')'
            );
        } else {
            return reply('❌ *Incorreto!* A resposta era: *' + q.a + '*');
        }
    }
};
