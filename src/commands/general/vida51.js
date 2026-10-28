/**
 * Comando .listaexercicios — EXERCÍCIOS
 *
 * Todos os exercícios por grupo muscular.
 */

const L = require('../../services/lifestyleService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}


module.exports = {
    name: 'listaexercicios',
    aliases: ["exerciciario"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Todos os exercícios por grupo muscular',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    if (filtro) {
        const achados = L.exerciciosPorGrupo(filtro)
        if (!achados.length) return reply('🏋️ Nenhum exercício para `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'listaexercicios`')
        let doc = cab('EXERCÍCIOS: ' + filtro.toUpperCase(), '🏋️')
        for (const x of achados) doc += '┃ *' + x.nome + '*\n┃    `' + prefix + 'exercicio' + x.chave + '`\n'
        return reply(doc)
    }
    const porGrupo = {}
    for (const [chave, x] of Object.entries(L.EXERCICIOS)) {
        if (!porGrupo[x.grupo]) porGrupo[x.grupo] = []
        porGrupo[x.grupo].push({ chave, ...x })
    }
    let doc = cab('EXERCÍCIOS', '🏋️')
    doc += linha('Exercícios', String(Object.keys(L.EXERCICIOS).length))
    doc += linha('Grupos', String(Object.keys(porGrupo).length)) + '\n'
    for (const [grupo, lista] of Object.entries(porGrupo)) {
        doc += bloco(grupo.toUpperCase(), lista.map(x => x.nome + ' `' + prefix + 'exercicio' + x.chave + '`'))
    }
    doc += '\n💡 _Filtrar:_ `' + prefix + 'listaexercicios pernas`'
    return reply(doc)
    }
}
