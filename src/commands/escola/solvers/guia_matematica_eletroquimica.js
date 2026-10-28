module.exports = {
    name: 'guia_matematica_eletroquimica',
    category: 'escola',
    subcategory: 'Guias de Estudo',
    description: 'Guia teórico e fórmulas essenciais de eletroquimica aplicados a matematica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📚 *GUIA: MATEMATICA - ELETROQUIMICA* ═══════╗\n\n'
        txt += '📖 *Conceito Fundamental:* Tópico obrigatório nas matrizes curriculares do Ensino Médio e ENEM.\n'
        txt += '⭐ *Importância:* Alta incidência em provas e vestibulares nacionais.\n\n'
        txt += '💡 Revise os conceitos com frequência e pratique exercícios práticos!'
        return reply(txt.trim())
    }
}
