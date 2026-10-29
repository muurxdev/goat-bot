/**
 * Estatísticas Pessoais de Trivia
 */
const { getUserStats } = require('../../../services/triviaService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'trivia_stats',
    aliases: ["meu_trivia","meus_quizzes"],
    category: 'fun',
    subcategory: 'Trivias & Quizzes',
    description: 'Mostra suas estatísticas individuais em quizzes e trivias',
    cooldownMs: 3000,
    execute: async ({ reply, sender }) => {
        const s = getUserStats(sender);
        const taxa = s.total_played > 0 ? Math.round((s.total_correct / s.total_played) * 100) : 0;
        const doc = [
            M.cabecalho('📊', 'Meu Histórico de Conhecimento'),
            '🎯 *Total de Desafios:* ' + s.total_played + '\n' +
            '✅ *Total de Acertos:* ' + s.total_correct + ' (' + taxa + '% de precisão)\n' +
            '🔥 *Sequência Atual:* ' + s.streak + ' acertos seguidos\n' +
            '⭐ *Maior Sequência:* ' + s.max_streak + ' acertos seguidos\n' +
            '🪙 *Moedas Ganhas:* ' + s.total_coins_won + ' moedas\n' +
            '✨ *XP Acumulado:* ' + s.total_xp_won + ' XP',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Academy')
        ].join('\n\n');
        return reply(doc);
    }
};
