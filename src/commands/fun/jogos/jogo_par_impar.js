/**
 * Minigame: jogo_par_impar
 */
module.exports = {
    name: 'jogo_par_impar',
    aliases: ["play_jogo_par_impar"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Duelo rápido de par ou ímpar',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const outcomes = ['Vitória brilhante', 'Derrota honrosa', 'Empate técnico', 'Reviravolta épica'];
        const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
        return reply('🎮 *Duelo rápido de par ou ímpar*\n\nResultado da rodada: **' + chosen + '**!');
    }
};
