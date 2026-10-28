module.exports = {
    name: 'guia_sociologia_trigonometria',
    category: 'escola',
    subcategory: 'Guias de Estudo',
    description: 'Guia teórico e fórmulas essenciais de trigonometria aplicados a sociologia',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📚 *GUIA: SOCIOLOGIA - TRIGONOMETRIA* ═══════╗\n\n'
        txt += '📖 *Conceito Fundamental:* Tópico obrigatório nas matrizes curriculares do Ensino Médio e ENEM.\n'
        txt += '⭐ *Importância:* Alta incidência em provas e vestibulares nacionais.\n\n'
        txt += '💡 Revise os conceitos com frequência e pratique exercícios práticos!'
        return reply(txt.trim())
    }
}
