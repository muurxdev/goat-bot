/**
 * Minigame: jogo_roleta_premios
 */
module.exports = {
    name: 'jogo_roleta_premios',
    aliases: ["play_jogo_roleta_premios"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Gira a roda da sorte em busca de prêmios',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const outcomes = ['Vitória brilhante', 'Derrota honrosa', 'Empate técnico', 'Reviravolta épica'];
        const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
        return reply('🎮 *Gira a roda da sorte em busca de prêmios*\n\nResultado da rodada: **' + chosen + '**!');
    }
};
