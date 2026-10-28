/**
 * Comando .qualestrutura — QUAL ESTRUTURA USAR
 *
 * Ajuda a escolher a estrutura pelo caso de uso.
 */

const R = require('../../services/devReferenceService')

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
    name: 'qualestrutura',
    aliases: ["escolherestrutura","cmd_qualestrutura","alt_qualestrutura","atalho_qualestrutura","abrev_qualestrutura","call_qualestrutura","func_qualestrutura"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Ajuda a escolher a estrutura pelo caso de uso',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('QUAL ESTRUTURA USAR', '🤔')
    const guia = [
        ['Buscar por chave', 'hashmap — O(1)'],
        ['Acessar por posição', 'array — O(1)'],
        ['Inserir e remover muito nas pontas', 'lista ligada — O(1)'],
        ['Sempre pegar o maior ou o menor', 'heap — O(log n)'],
        ['Testar se já existe', 'conjunto — O(1)'],
        ['Manter ordenado com busca por faixa', 'árvore binária — O(log n)'],
        ['Autocompletar por prefixo', 'trie — O(m)'],
        ['Último a entrar, primeiro a sair', 'pilha'],
        ['Primeiro a entrar, primeiro a sair', 'fila'],
        ['Relações entre coisas', 'grafo']
    ]
    for (const [caso, resposta] of guia) doc += '┃ *' + caso + '*\n┃    ' + resposta + '\n'
    return reply(doc)
    }
}
