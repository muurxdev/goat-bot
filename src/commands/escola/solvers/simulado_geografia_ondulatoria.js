module.exports = {
    name: 'simulado_geografia_ondulatoria',
    category: 'escola',
    subcategory: 'Simulados & Exercícios',
    description: 'Questão comentada de vestibular sobre ondulatoria em geografia',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📝 *SIMULADO: GEOGRAFIA (ONDULATORIA)* ═══════╗\n\n'
        txt += '📌 *Enunciado:* Analise as propriedades fundamentais deste fenômeno e aplique as relações teóricas.\n\n'
        txt += '✅ *Gabarito Comentado:* A aplicação direta da relação fundamental demonstra a conservação e equilíbrio do sistema.'
        return reply(txt.trim())
    }
}
