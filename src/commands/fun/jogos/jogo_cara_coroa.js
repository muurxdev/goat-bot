/**
 * Minigame: jogo_cara_coroa
 */
module.exports = {
    name: 'jogo_cara_coroa',
    aliases: ["play_jogo_cara_coroa"],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: 'Lança uma moeda da sorte (Cara ou Coroa)',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        const escolha = (args[0] || '').toLowerCase();
        const sorteio = Math.random() < 0.5 ? 'cara' : 'coroa';
        const moeda = sorteio === 'cara' ? '🪙 CARA' : '👑 COROA';
        if (!escolha) return reply('🪙 *Cara ou Coroa*\n\nEscolha seu lado: `.jogo_cara_coroa cara` ou `.jogo_cara_coroa coroa`');
        const venceu = escolha === sorteio;
        return reply('🪙 *A moeda girou no ar...*\n\nDeu **' + moeda + '**!\n' + (venceu ? '🎉 *Você venceu o palpite!*' : '❌ *Você errou desta vez!*'));
    }
};
