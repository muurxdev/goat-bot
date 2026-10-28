/**
 * Minigame: jogo_d20
 */
module.exports = {
    name: 'jogo_d20',
    aliases: ["play_jogo_d20"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Rola um dado de RPG de 20 faces (D20)',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const roll = Math.floor(Math.random() * 20) + 1;
        const crit = roll === 20 ? '🔥 *SUCESSO CRÍTICO MÁXIMO!*' : (roll === 1 ? '💀 *FALHA CRÍTICA HUMILHANTE!*' : 'Resultado regular.');
        return reply('🎲 *Rolagem D20:* Tirou **' + roll + '**!\n' + crit);
    }
};
