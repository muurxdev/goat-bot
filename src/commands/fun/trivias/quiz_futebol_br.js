/**
 * Quiz Futebol Brasileiro
 */
const { getRandomQuestion, submitAnswer } = require('../../../services/triviaService');
const { adicionarXp, initializeUser } = require('../../../services/xpService');
const dataService = require('../../../services/dataService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'quiz_futebol_br',
    aliases: ["jogar_quiz_futebol_br"],
    category: 'fun',
    subcategory: 'Trivias & Quizzes',
    description: 'Desafio temático: Quiz Futebol Brasileiro',
    cooldownMs: 4000,
    execute: async ({ reply, sender, args }) => {
        const q = getRandomQuestion('futebol_br');
        const userChoice = args[0] ? args.join(' ').trim() : null;

        if (!userChoice) {
            const optLines = q.opts.map((o, idx) => `${idx + 1}. ${o}`);
            const doc = [
                M.cabecalho('🧠', 'Quiz Futebol Brasileiro'),
                '❓ *' + q.q + '*',
                M.secao('📋', 'Alternativas', optLines),
                '👉 Responda digitando: `.quiz_futebol_br <número ou texto da resposta>`',
                M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Quiz')
            ].join('\n\n');
            return reply(doc);
        }

        const isCorrect = q.opts.some((opt, idx) => {
            const num = (idx + 1).toString();
            return (userChoice === num || userChoice.toLowerCase() === opt.toLowerCase()) && opt.toLowerCase() === q.a.toLowerCase();
        });

        const prize = { coins: 150, xp: 200 };
        const result = submitAnswer(sender, 'futebol_br', isCorrect, prize);

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
                'Sua sequência foi zerada. Tente novamente digitando `.quiz_futebol_br`!'
            );
        }
    }
};
