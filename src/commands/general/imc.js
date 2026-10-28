/**
 * Comando .imc — ÍNDICE DE MASSA CORPORAL
 *
 * A conta e as faixas vivem em services/bodyService; aqui só a apresentação.
 *
 * Aceita altura em metros (1,75) ou centímetros (175) — o serviço decide pela
 * ordem de grandeza. Aceita vírgula ou ponto, porque quem digita no celular
 * usa vírgula.
 *
 * A ressalva no fim não é enfeite: o IMC não separa músculo de gordura, e sem
 * essa frase o número vira diagnóstico na cabeça de quem lê.
 */
const B = require('../../services/bodyService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }

const EMOJI = {
    'Abaixo do peso': '🔵',
    'Peso adequado': '🟢',
    'Sobrepeso': '🟡',
    'Obesidade grau I': '🟠',
    'Obesidade grau II': '🔴',
    'Obesidade grau III': '🔴'
}

const br = (v, casas = 1) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

module.exports = {
    name: 'imc',
    aliases: ['bmim', 'pesoideal', 'imdice'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula o Índice de Massa Corporal, a faixa e o peso adequado para sua altura',
    cooldownMs: 3000,
    execute: async ({ args = [], text = '', reply, prefix = '.' }) => {
        const partes = (text && text.trim() ? text.trim() : args.join(' ')).split(/\s+/).filter(Boolean)
        const peso = parseFloat(String(partes[0] || '').replace(',', '.'))
        const altura = parseFloat(String(partes[1] || '').replace(',', '.'))
        const r = B.imc(peso, altura)

        if (!r) {
            let doc = cab('ÍNDICE DE MASSA CORPORAL', '⚖️')
            doc += '📌 Uso: `' + prefix + 'imc <peso kg> <altura>`\n\n'
            doc += '🧮 *Exemplos*\n`' + prefix + 'imc 70 1,75`\n`' + prefix + 'imc 70 175`\n\n'
            doc += '_Altura em metros ou centímetros, tanto faz._'
            return reply(doc)
        }

        let doc = cab('ÍNDICE DE MASSA CORPORAL', '⚖️')
        doc += linha('Peso', br(peso) + ' kg')
        doc += linha('Altura', br(r.altura, 2) + ' m')
        doc += sep()
        doc += (EMOJI[r.faixa] || '⚪') + ' *IMC ' + br(r.valor) + '* — ' + r.faixa + '\n\n'
        doc += '╭━〔 📏 FAIXAS 〕━⬣\n'
        doc += '┃ 🔵 abaixo de 18,5 — abaixo do peso\n'
        doc += '┃ 🟢 18,5 a 24,9 — peso adequado\n'
        doc += '┃ 🟡 25,0 a 29,9 — sobrepeso\n'
        doc += '┃ 🟠 30,0 a 34,9 — obesidade grau I\n'
        doc += '┃ 🔴 35,0 ou mais — obesidade grau II e III\n'
        doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        doc += '🎯 *Faixa adequada para ' + br(r.altura, 2) + ' m*\n'
        doc += br(r.idealMin) + ' kg a ' + br(r.idealMax) + ' kg\n\n'
        doc += '⚠️ *A ressalva que quase ninguém lê*\n'
        doc += 'O IMC não distingue músculo de gordura nem sabe onde ela está. '
        doc += 'Atleta forte cai em "sobrepeso" e pessoa sedentária magra pode ter risco alto. '
        doc += 'É triagem populacional, não diagnóstico individual.\n\n'
        doc += '💧 _Água do dia:_ `' + prefix + 'aguadiaria ' + Math.round(peso) + '`'
        return reply(doc)
    }
}
