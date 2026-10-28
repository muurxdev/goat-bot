/**
 * Minigame: jogo_jokenpo
 */
module.exports = {
    name: 'jogo_jokenpo',
    aliases: ["play_jogo_jokenpo"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Desafia o bot para uma partida de Pedra, Papel e Tesoura',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const outcomes = ['Vitória brilhante', 'Derrota honrosa', 'Empate técnico', 'Reviravolta épica'];
        const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
        return reply('🎮 *Desafia o bot para uma partida de Pedra, Papel e Tesoura*\n\nResultado da rodada: **' + chosen + '**!');
    }
};
