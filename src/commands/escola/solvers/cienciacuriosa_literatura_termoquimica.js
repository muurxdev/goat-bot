module.exports = {
    name: 'cienciacuriosa_literatura_termoquimica',
    category: 'curiosidades',
    subcategory: 'Ciências & Fatos',
    description: 'Curiosidade fascinante da história de termoquimica em literatura',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💡 *CURIOSIDADE CIENTÍFICA: TERMOQUIMICA* ═══════╗\n\n'
        txt += '✨ Você sabia? A descoberta deste princípio revolucionou a forma como a humanidade compreende o universo e a tecnologia moderna.'
        return reply(txt.trim())
    }
}
