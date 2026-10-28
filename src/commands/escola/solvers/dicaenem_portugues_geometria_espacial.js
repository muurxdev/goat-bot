module.exports = {
    name: 'dicaenem_portugues_geometria_espacial',
    category: 'escola',
    subcategory: 'Dicas de Prova',
    description: 'Dica estratégica para gabaritar questões de geometria espacial no ENEM',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🎓 *DICA ENEM: GEOMETRIA ESPACIAL* ═══════╗\n\n'
        txt += '🎯 *Estratégia:* Preste muita atenção nas unidades de medida (SI) fornecidas no enunciado antes de calcular.'
        return reply(txt.trim())
    }
}
