/**
 * Comando .escalafahrenheit — FAHRENHEIT
 *
 * Escala de temperatura: Fahrenheit.
 */

const U = require('../../services/unitsService')

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
    name: 'escalafahrenheit',
    aliases: ["tempf"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Escala de temperatura: Fahrenheit',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const valor = parseFloat(String(args[0] || '25').replace(',', '.'))
    const v = Number.isFinite(valor) ? valor : 25
    let doc = cab('FAHRENHEIT', '🌡️')
    doc += linha('Símbolo', "°F")
    doc += linha('Sobre', "Água congela a 32 e ferve a 212.")
    doc += sep()
    doc += '*' + v + ' °F* equivale a:\n\n'
    for (const outra of ['c', 'f', 'k']) {
        if (outra === 'f') continue
        const r = U.converterTemperatura(v, 'f', outra)
        if (r) doc += '┃ ' + U.formatar(r.valor) + ' ' + r.para.simbolo + ' _(' + r.para.nome + ')_\n'
    }
    doc += '\n_Escalas de temperatura têm zero deslocado: não convertem por multiplicação._'
    return reply(doc)
    }
}
