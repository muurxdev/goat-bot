/**
 * Minigame: jogo_d100
 */
module.exports = {
    name: 'jogo_d100',
    aliases: ["play_jogo_d100"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Rola uma porcentagem ou dado de 100 faces',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const outcomes = ['Vitória brilhante', 'Derrota honrosa', 'Empate técnico', 'Reviravolta épica'];
        const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
        return reply('🎮 *Rola uma porcentagem ou dado de 100 faces*\n\nResultado da rodada: **' + chosen + '**!');
    }
};
