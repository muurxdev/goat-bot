/**
 * Minigame: jogo_adivinhar_naipe
 */
module.exports = {
    name: 'jogo_adivinhar_naipe',
    aliases: ["play_jogo_adivinhar_naipe"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Tenta acertar o naipe da carta secreta do baralho',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const outcomes = ['Vitória brilhante', 'Derrota honrosa', 'Empate técnico', 'Reviravolta épica'];
        const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
        return reply('🎮 *Tenta acertar o naipe da carta secreta do baralho*\n\nResultado da rodada: **' + chosen + '**!');
    }
};
