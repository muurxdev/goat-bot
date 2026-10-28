/**
 * Comando .plantapraluz — PLANTA PARA A SUA LUZ
 *
 * Sugere plantas pela luz que o cômodo realmente recebe.
 */

const H = require('../../services/homeLifeService')

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
    name: 'plantapraluz',
    aliases: ["plantaparaomeuquarto"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Sugere plantas pela luz que o cômodo realmente recebe',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const cond = String(args[0] || '').toLowerCase()
    if (!cond) {
        let doc = cab('PLANTA PARA A SUA LUZ', '💡')
        doc += '📌 Uso: `' + prefix + 'plantapraluz <sol|sombra|indireta>`\n\n'
        doc += bloco('🔎 COMO DESCOBRIR A SUA', [
            '*Sol* — bate sol na planta por 4 h ou mais',
            '*Indireta* — cômodo claro, mas o sol não encosta',
            '*Sombra* — janela pequena, corredor, banheiro'
        ])
        doc += '\n💡 _Teste da sombra da mão: sombra nítida é sol, sombra difusa é indireta, quase nenhuma é sombra._'
        return reply(doc)
    }
    const r = H.plantasParaLuz(cond)
    const titulo = { sol: 'SOL DIRETO', sombra: 'MEIA-SOMBRA', indireta: 'LUZ INDIRETA' }[r.condicao]
    let doc = cab('PLANTAS PARA ' + titulo, '💡')
    doc += linha('Opções', String(r.lista.length)) + '\n'
    for (const p of r.lista) {
        doc += (p.toxica ? '⚠️ ' : '✅ ') + '*' + p.nome + '*\n   ' + p.dificuldade + ' · rega ' + p.rega.toLowerCase() + '\n   `' + prefix + 'planta' + p.chave + '`\n'
    }
    doc += '\n✅ segura com pets · ⚠️ tóxica se ingerida\n'
    doc += '🐾 _Só as seguras:_ `' + prefix + 'plantasseguras`'
    return reply(doc)
    }
}
