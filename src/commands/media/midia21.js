/**
 * Comando .midiaglossario — GLOSSÁRIO DA MÍDIA
 *
 * O que cada termo de mídia significa.
 */

const M = require('../../services/mediaInfoService')

function cab(titulo, emoji) {
    return emoji + ' *' + titulo + '*\n\n'
}
function linha(rotulo, valor) { return '*' + rotulo + ':* ' + valor + '\n' }
function sep() { return '\n' }
function bloco(titulo, itens) {
    let t = '*' + titulo + '*\n'
    for (const i of itens) t += '• ' + i + '\n'
    return t
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

function segundosDe(txt) {
    const s = M.lerDuracao(txt)
    return s && s > 0 ? s : null
}

module.exports = {
    name: 'midiaglossario',
    aliases: ["termosmidia"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'O que cada termo de mídia significa',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Glossário da mídia', '📚')
    const termos = [
        ['Taxa (kbps)', 'quantos dados por segundo — mais taxa, mais qualidade e peso'],
        ['Resolução', 'quantos pontos formam a imagem, como 1920×1080'],
        ['Proporção', 'a relação entre largura e altura, como 16:9'],
        ['Compressão', 'reduzir o tamanho perdendo um pouco de qualidade'],
        ['Sem perda', 'compressão que preserva o original por inteiro'],
        ['Fila', 'downloads esperando a vez de serem processados']
    ]
    for (const [t, d] of termos) doc += '• *' + t + '* — ' + d + '\n'
    return reply(doc)
    }
}
