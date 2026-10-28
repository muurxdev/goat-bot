/**
 * Minigame: jogo_roleta_russa
 */
module.exports = {
    name: 'jogo_roleta_russa',
    aliases: ["play_jogo_roleta_russa"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Gira o tambor da roleta russa com 6 câmaras',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const outcomes = ['Vitória brilhante', 'Derrota honrosa', 'Empate técnico', 'Reviravolta épica'];
        const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
        return reply('🎮 *Gira o tambor da roleta russa com 6 câmaras*\n\nResultado da rodada: **' + chosen + '**!');
    }
};
