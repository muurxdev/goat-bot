/**
 * Comando .gerarcodigo — CÓDIGO GERADO
 *
 * Cria um código curto para convite ou confirmação.
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
    name: 'gerarcodigo',
    aliases: ["codigoaleatorio","cmd_gerarcodigo","alt_gerarcodigo","atalho_gerarcodigo","abrev_gerarcodigo","call_gerarcodigo","func_gerarcodigo"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Cria um código curto para convite ou confirmação',
    usage: '[tamanho]',
    examples: [' — código com 8 caracteres', '12 — código com 12 caracteres'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const tam = Math.min(32, Math.max(4, parseInt(args[0], 10) || 8))
    const codigo = F.gerarCodigo(tam)
    return reply(Fmt.tela({
        emoji: '🎫', titulo: 'Código gerado', prefix,
        intro: '`' + codigo + '`',
        secoes: [{ emoji: '🧾', titulo: 'Detalhes', linhas: [
            Fmt.campo('Tamanho', tam + ' caracteres'),
            'Sem letras e números que se confundem ao ditar (como O e 0).'
        ] }],
        dica: 'Segure a mensagem para copiar. Escolha o tamanho de 4 a 32.',
        proximos: [
            { nome: 'gerarcodigo', args: '12', oque: 'código com 12 caracteres' },
            { nome: 'gerarpin', oque: 'só números' }
        ]
    }))
    }
}
