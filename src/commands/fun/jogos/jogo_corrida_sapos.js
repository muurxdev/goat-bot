/**
 * Minigame: jogo_corrida_sapos
 */
module.exports = {
    name: 'jogo_corrida_sapos',
    aliases: ["play_jogo_corrida_sapos"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Simula uma corrida hilária de sapos no grupo',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const outcomes = ['Vitória brilhante', 'Derrota honrosa', 'Empate técnico', 'Reviravolta épica'];
        const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
        return reply('🎮 *Simula uma corrida hilária de sapos no grupo*\n\nResultado da rodada: **' + chosen + '**!');
    }
};
