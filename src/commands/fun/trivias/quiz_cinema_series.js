/**
 * Quiz Cinema e Séries
 */
const { getRandomQuestion, submitAnswer } = require('../../../services/triviaService');
const { adicionarXp, initializeUser } = require('../../../services/xpService');
const dataService = require('../../../services/dataService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'quiz_cinema_series',
    aliases: ["jogar_quiz_cinema_series"],
    category: 'fun',
    subcategory: 'Trivias & Quizzes',
    description: 'Desafio temático: Quiz Cinema e Séries',
    cooldownMs: 4000,
    execute: async ({ reply, sender, args }) => {
        const q = getRandomQuestion('cinema_series');
        const userChoice = args[0] ? args.join(' ').trim() : null;

        if (!userChoice) {
            const optLines = q.opts.map((o, idx) => `${idx + 1}. ${o}`);
            const doc = [
                M.cabecalho('🧠', 'Quiz Cinema e Séries'),
                '❓ *' + q.q + '*',
                M.secao('📋', 'Alternativas', optLines),
                '👉 Responda digitando: `.quiz_cinema_series <número ou texto da resposta>`',
                M.assinatura('GOAT Quiz')
            ].join('\n\n');
            return reply(doc);
        }

        const isCorrect = q.opts.some((opt, idx) => {
            const num = (idx + 1).toString();
            return (userChoice === num || userChoice.toLowerCase() === opt.toLowerCase()) && opt.toLowerCase() === q.a.toLowerCase();
        });

        const prize = { coins: 150, xp: 200 };
        const result = submitAnswer(sender, 'cinema_series', isCorrect, prize);

        if (isCorrect) {
            const u = initializeUser(sender, {});
            const { xpGanho } = adicionarXp(u, prize.xp, { source: 'rpg' });
            u.coins = (u.coins || 0) + prize.coins;
            dataService.saveUser(u);

            return reply(
                '🎉 *RESPOSTA CORRETA!*\n\n' +
                'A resposta era mesmo *' + q.a + '*!\n' +
                '🎁 + ' + xpGanho + ' XP | + ' + prize.coins + ' moedas!\n' +
                '🔥 Sequência de acertos: *' + result.streak + '* seguidos!'
            );
        } else {
            return reply(
                '❌ *RESPOSTA INCORRETA!*\n\n' +
                'A resposta correta era: *' + q.a + '*\n' +
                'Sua sequência foi zerada. Tente novamente digitando `.quiz_cinema_series`!'
            );
        }
    }
};
