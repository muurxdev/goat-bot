/**
 * Comando .calculadorasclt — CALCULADORAS TRABALHISTAS
 *
 * Índice de todas as contas de folha e rescisão.
 */

const L = require('../../services/laborService')

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
    name: 'calculadorasclt',
    aliases: ["menutrabalho"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Índice de todas as contas de folha e rescisão',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('CALCULADORAS TRABALHISTAS', '🧮')
    doc += bloco('💰 TODO MÊS', [
        '`' + prefix + 'salarioliquido 3500 2` — líquido com INSS e IRRF',
        '`' + prefix + 'horaextra 3000 10 4` — extras com reflexo no DSR',
        '`' + prefix + 'adicionalnoturno 3000 60` — noturno e hora reduzida',
        '`' + prefix + 'valetransporte 1800 12,80` — desconto do VT'
    ])
    doc += bloco('📅 UMA VEZ POR ANO', [
        '`' + prefix + 'decimoterceiro 3000 8` — as duas parcelas',
        '`' + prefix + 'ferias 3000 30` — férias com 1/3',
        '`' + prefix + 'calcularfgts 3000 24` — saldo e multa'
    ])
    doc += bloco('🚪 NA SAÍDA', [
        '`' + prefix + 'rescisao 3000 26 semjustacausa` — verba por verba',
        '`' + prefix + 'calcularaviso 5` — dias de aviso prévio',
        '`' + prefix + 'tiposrescisao` — comparar as formas de saída'
    ])
    doc += bloco('📚 ENTENDER', [
        '`' + prefix + 'direitostrabalhistas` — os direitos e a base legal',
        '`' + prefix + 'tabelasclt` — INSS, IRRF e valores vigentes'
    ])
    doc += '\n_Estimativas pela regra geral da CLT, tabelas de ' + L.TABELAS.vigencia + '. Convenção coletiva pode mudar o resultado._'
    return reply(doc)
    }
}
