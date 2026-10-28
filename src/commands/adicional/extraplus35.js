/**
 * Comando .sortearcor — COR DO DIA
 *
 * Sorteia uma cor entre as cores nomeadas.
 */

const F = require('../../services/toolsService')
const Fmt = require('../../utils/formato')

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

function itensDe(args) {
    return (args || []).join(' ').split(/[;,\n]| \| /).map(s => s.trim()).filter(Boolean)
}
function pedeItens(prefix, cmd) {
    return '📋 *Informe as opções separadas por vírgula.*\n\n📌 Exemplo: `' + prefix + cmd + ' pizza, hambúrguer, sushi`'
}
function dataOuHoje(txt) {
    const d = F.lerData(txt)
    return d && !isNaN(d.getTime()) ? d : null
}
function fmt(d) { return d.toLocaleDateString('pt-BR') }

module.exports = {
    name: 'sortearcor',
    aliases: ["coraleatoriasimples","cmd_sortearcor","alt_sortearcor","atalho_sortearcor","abrev_sortearcor","call_sortearcor","func_sortearcor"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Sorteia uma cor entre as cores nomeadas',
    examples: [' — sorteia uma cor com nome'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const cores = [['Vermelho', '#E53935'], ['Azul', '#1E88E5'], ['Verde', '#43A047'], ['Amarelo', '#FDD835'],
        ['Roxo', '#8E24AA'], ['Laranja', '#FB8C00'], ['Rosa', '#D81B60'], ['Ciano', '#00ACC1'],
        ['Marrom', '#6D4C41'], ['Cinza', '#757575'], ['Preto', '#212121'], ['Branco', '#FAFAFA']]
    const [nome, hex] = F.escolher(cores)
    return reply(Fmt.tela({
        emoji: '🌈', titulo: 'Cor sorteada: ' + nome, prefix,
        intro: 'Saiu *' + nome + '* entre 12 cores com nome.',
        secoes: [{ emoji: '🧾', titulo: 'Detalhes', linhas: [Fmt.campo('Cor', nome), Fmt.campo('Código', hex)] }],
        dica: 'Bom para sortear time, tema de foto ou roupa do dia.',
        proximos: [
            { nome: 'sortearcor', oque: 'sorteia de novo' },
            { nome: 'corAleatoria', oque: 'qualquer cor, com códigos' }
        ]
    }))
    }
}
