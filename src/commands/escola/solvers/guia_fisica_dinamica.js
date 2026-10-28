module.exports = {
    name: 'guia_fisica_dinamica',
    category: 'escola',
    subcategory: 'Guias de Estudo',
    description: 'Guia teórico e fórmulas essenciais de dinamica aplicados a fisica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📚 *GUIA: FISICA - DINAMICA* ═══════╗\n\n'
        txt += '📖 *Conceito Fundamental:* Tópico obrigatório nas matrizes curriculares do Ensino Médio e ENEM.\n'
        txt += '⭐ *Importância:* Alta incidência em provas e vestibulares nacionais.\n\n'
        txt += '💡 Revise os conceitos com frequência e pratique exercícios práticos!'
        return reply(txt.trim())
    }
}
