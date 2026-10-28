module.exports = {
    name: 'dicaenem_fisica_algebra_linear',
    category: 'escola',
    subcategory: 'Dicas de Prova',
    description: 'Dica estratégica para gabaritar questões de algebra linear no ENEM',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🎓 *DICA ENEM: ALGEBRA LINEAR* ═══════╗\n\n'
        txt += '🎯 *Estratégia:* Preste muita atenção nas unidades de medida (SI) fornecidas no enunciado antes de calcular.'
        return reply(txt.trim())
    }
}
