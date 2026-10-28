/**
 * Comando .saidaterminocontrato — FIM DE CONTRATO POR PRAZO DETERMINADO
 *
 * Rescisão: Fim de contrato por prazo determinado — o que se recebe.
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
    name: 'saidaterminocontrato',
    aliases: ["demissaoterminocontrato"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Rescisão: Fim de contrato por prazo determinado — o que se recebe',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const t = L.TIPOS_RESCISAO['terminocontrato']
    let doc = cab("FIM DE CONTRATO POR PRAZO DETERMINADO", '🚪')
    doc += linha('Quem pede', t.quemPede)
    doc += sep()
    doc += '📖 *Em resumo*\n' + t.resumo + '\n\n'
    const sim = (b) => b ? '✅' : '❌'
    doc += bloco('📋 O QUE ENTRA NA CONTA', [
        'Saldo de salário: ✅ sempre',
        'Aviso prévio: ' + ({ recebe: '✅ recebe', paga: '❌ paga se não cumprir', metade: '➗ recebe metade', nenhum: '❌ não há' })[t.aviso],
        '13º proporcional: ' + sim(t.decimo),
        'Férias proporcionais + 1/3: ' + sim(t.feriasProp),
        'Multa do FGTS: ' + (t.multaFgts ? '✅ ' + t.multaFgts + '%' : '❌ nenhuma'),
        'Saque do FGTS: ' + (t.saqueFgts ? '✅ ' + t.saqueFgts + '%' : '❌ não pode'),
        'Seguro-desemprego: ' + sim(t.seguro)
    ])
    doc += '\n🧮 _Calcular com os seus números:_ `' + prefix + 'rescisao 3000 26 terminocontrato`\n'
    doc += '🚪 _Comparar as saídas:_ `' + prefix + 'tiposrescisao`'
    return reply(doc)
    }
}
