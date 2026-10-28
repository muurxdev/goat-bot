module.exports = {
    name: 'cienciacuriosa_matematica_algebra_linear',
    category: 'curiosidades',
    subcategory: 'Ciências & Fatos',
    description: 'Curiosidade fascinante da história de algebra linear em matematica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💡 *CURIOSIDADE CIENTÍFICA: ALGEBRA LINEAR* ═══════╗\n\n'
        txt += '✨ Você sabia? A descoberta deste princípio revolucionou a forma como a humanidade compreende o universo e a tecnologia moderna.'
        return reply(txt.trim())
    }
}
