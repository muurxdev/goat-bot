/**
 * Comando .trocadeoleo — PRÓXIMA TROCA DE ÓLEO
 *
 * Quantos quilômetros faltam para a próxima troca.
 */

const A = require('../../services/autoService')

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
    name: 'trocadeoleo',
    aliases: ["proximatroca"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Quantos quilômetros faltam para a próxima troca',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const atual = A.lerNumero(args[0])
    const ultima = A.lerNumero(args[1])
    const intervalo = A.lerNumero(args[2]) || 10000
    const r = A.proximaTroca({ kmAtual: atual, kmUltimaTroca: ultima, intervalo })
    if (!r) {
        let doc = cab('PRÓXIMA TROCA DE ÓLEO', '🛢️')
        doc += '📌 Uso: `' + prefix + 'trocadeoleo <km atual> <km da última troca> [intervalo]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'trocadeoleo 47300 41000`\n\n'
        doc += '_Intervalo padrão: 10.000 km. Confira o manual do seu carro._'
        return reply(doc)
    }
    let doc = cab('PRÓXIMA TROCA DE ÓLEO', '🛢️')
    doc += linha('Última troca', A.num(ultima, 0) + ' km')
    doc += linha('Hoje', A.num(atual, 0) + ' km')
    doc += linha('Intervalo', A.num(r.intervalo, 0) + ' km')
    doc += sep()
    doc += barra(r.fracao) + '\n\n'
    if (r.vencido) {
        doc += '🔴 *Passou da hora*\nVocê rodou ' + A.num(r.rodados, 0) + ' km, ' + A.num(-r.faltam, 0) + ' km além do intervalo.\n\n'
    } else {
        doc += '🟢 *Faltam ' + A.num(r.faltam, 0) + ' km*\nA próxima é em ' + A.num(r.proxima, 0) + ' km.\n\n'
    }
    doc += '⏳ _O óleo também vence por tempo: troque ao menos uma vez por ano, mesmo rodando pouco._\n'
    doc += '🔧 _Por que isso importa:_ `' + prefix + 'trocaroleomotor`'
    return reply(doc)
    }
}
