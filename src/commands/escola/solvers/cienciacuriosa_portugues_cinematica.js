module.exports = {
    name: 'cienciacuriosa_portugues_cinematica',
    category: 'curiosidades',
    subcategory: 'Ciências & Fatos',
    description: 'Curiosidade fascinante da história de cinematica em portugues',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💡 *CURIOSIDADE CIENTÍFICA: CINEMATICA* ═══════╗\n\n'
        txt += '✨ Você sabia? A descoberta deste princípio revolucionou a forma como a humanidade compreende o universo e a tecnologia moderna.'
        return reply(txt.trim())
    }
}
