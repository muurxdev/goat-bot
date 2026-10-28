/**
 * Ranking de Trivia
 */
const { getLeaderboard } = require('../../../services/triviaService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'trivia_ranking',
    aliases: ["top_trivia","rank_quizzes"],
    category: 'fun',
    subcategory: 'Trivias & Quizzes',
    description: 'Exibe o ranking global dos maiores pontuadores em trivias',
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        const leaders = getLeaderboard(10);
        if (!leaders.length) {
            return reply('🏆 *Nenhum jogador pontuou nas trivias ainda.* Participe dos quizzes com `.quiz`!');
        }
        const lines = leaders.map((l, i) => {
            const num = (l.user_jid || '').replace(/@.*/, '').slice(-4);
            return `${i + 1}º • ...${num} — ${l.total_correct} acertos (🔥 streak máx: ${l.max_streak})`;
        });
        const doc = [
            M.cabecalho('🏆', 'Top 10 Mestres do Conhecimento'),
            lines.join('\n'),
            M.assinatura('GOAT Academy')
        ].join('\n\n');
        return reply(doc);
    }
};
