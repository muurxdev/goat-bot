module.exports = {
    name: 'guia_biologia_probabilidade',
    category: 'escola',
    subcategory: 'Guias de Estudo',
    description: 'Guia teórico e fórmulas essenciais de probabilidade aplicados a biologia',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📚 *GUIA: BIOLOGIA - PROBABILIDADE* ═══════╗\n\n'
        txt += '📖 *Conceito Fundamental:* Tópico obrigatório nas matrizes curriculares do Ensino Médio e ENEM.\n'
        txt += '⭐ *Importância:* Alta incidência em provas e vestibulares nacionais.\n\n'
        txt += '💡 Revise os conceitos com frequência e pratique exercícios práticos!'
        return reply(txt.trim())
    }
}
