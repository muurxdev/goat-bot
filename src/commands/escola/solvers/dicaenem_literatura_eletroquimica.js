module.exports = {
    name: 'dicaenem_literatura_eletroquimica',
    category: 'escola',
    subcategory: 'Dicas de Prova',
    description: 'Dica estratégica para gabaritar questões de eletroquimica no ENEM',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🎓 *DICA ENEM: ELETROQUIMICA* ═══════╗\n\n'
        txt += '🎯 *Estratégia:* Preste muita atenção nas unidades de medida (SI) fornecidas no enunciado antes de calcular.'
        return reply(txt.trim())
    }
}
