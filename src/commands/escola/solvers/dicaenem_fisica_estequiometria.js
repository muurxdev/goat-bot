module.exports = {
    name: 'dicaenem_fisica_estequiometria',
    category: 'escola',
    subcategory: 'Dicas de Prova',
    description: 'Dica estratégica para gabaritar questões de estequiometria no ENEM',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🎓 *DICA ENEM: ESTEQUIOMETRIA* ═══════╗\n\n'
        txt += '🎯 *Estratégia:* Preste muita atenção nas unidades de medida (SI) fornecidas no enunciado antes de calcular.'
        return reply(txt.trim())
    }
}
