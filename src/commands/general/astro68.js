/**
 * Comando .distanciaespacial — QUANTO TEMPO ATÉ LÁ
 *
 * Tempo de viagem até cada corpo em diferentes velocidades.
 */

const A = require('../../services/astronomyService')

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
    name: 'distanciaespacial',
    aliases: ["quantotempoate"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Tempo de viagem até cada corpo em diferentes velocidades',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const alvo = String(args[0] || '').toLowerCase()
    if (!alvo) {
        let doc = cab('QUANTO TEMPO ATÉ LÁ', '🛸')
        doc += '📌 Uso: `' + prefix + 'distanciaespacial marte`\n\n'
        doc += bloco('🪐 DESTINOS', Object.keys(A.CORPOS).filter(k => A.CORPOS[k].distancia))
        return reply(doc)
    }
    const c = A.CORPOS[alvo.normalize('NFD').replace(/[^a-z0-9]/gi, '').toLowerCase()]
    if (!c || !c.distancia) return reply('🛸 Destino não catalogado.\n\n📌 Veja: `' + prefix + 'sistemasolar`')
    const km = c.distancia * 1e6
    const modos = [
        ['A pé (5 km/h)', 5], ['De carro (100 km/h)', 100], ['Avião comercial (900 km/h)', 900],
        ['Foguete Saturno V (39.000 km/h)', 39000], ['Parker Solar Probe (692.000 km/h)', 692000],
        ['Velocidade da luz', 1079252849]
    ]
    let doc = cab('ATÉ ' + c.nome.toUpperCase(), '🛸')
    doc += linha('Distância do Sol', c.distancia.toLocaleString('pt-BR') + ' milhões de km')
    doc += sep()
    for (const [nome, v] of modos) {
        const horas = km / v
        let t
        const br = v => Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
        if (horas < 24) t = br(horas) + ' h'
        else if (horas < 24 * 365) t = br(horas / 24) + ' dias'
        else t = br(horas / 24 / 365) + ' anos'
        doc += '┃ ' + nome + ': *' + t + '*\n'
    }
    doc += '\n_Conta em linha reta a partir do Sol. Viagem real usa órbitas, não retas._'
    return reply(doc)
    }
}
