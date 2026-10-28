module.exports = {
    name: 'dicaenem_sociologia_solucoes',
    category: 'escola',
    subcategory: 'Dicas de Prova',
    description: 'Dica estratégica para gabaritar questões de solucoes no ENEM',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🎓 *DICA ENEM: SOLUCOES* ═══════╗\n\n'
        txt += '🎯 *Estratégia:* Preste muita atenção nas unidades de medida (SI) fornecidas no enunciado antes de calcular.'
        return reply(txt.trim())
    }
}
