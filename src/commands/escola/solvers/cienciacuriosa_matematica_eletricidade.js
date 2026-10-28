module.exports = {
    name: 'cienciacuriosa_matematica_eletricidade',
    category: 'curiosidades',
    subcategory: 'Ciências & Fatos',
    description: 'Curiosidade fascinante da história de eletricidade em matematica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💡 *CURIOSIDADE CIENTÍFICA: ELETRICIDADE* ═══════╗\n\n'
        txt += '✨ Você sabia? A descoberta deste princípio revolucionou a forma como a humanidade compreende o universo e a tecnologia moderna.'
        return reply(txt.trim())
    }
}
