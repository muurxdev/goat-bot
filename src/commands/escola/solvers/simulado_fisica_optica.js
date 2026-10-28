module.exports = {
    name: 'simulado_fisica_optica',
    category: 'escola',
    subcategory: 'Simulados & Exercícios',
    description: 'Questão comentada de vestibular sobre optica em fisica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📝 *SIMULADO: FISICA (OPTICA)* ═══════╗\n\n'
        txt += '📌 *Enunciado:* Analise as propriedades fundamentais deste fenômeno e aplique as relações teóricas.\n\n'
        txt += '✅ *Gabarito Comentado:* A aplicação direta da relação fundamental demonstra a conservação e equilíbrio do sistema.'
        return reply(txt.trim())
    }
}
