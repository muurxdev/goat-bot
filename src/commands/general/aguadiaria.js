/**
 * Comando .aguadiaria — ÁGUA POR DIA
 *
 * Base de 35 ml por kg mais o acréscimo por tempo de exercício, calculados em
 * services/bodyService.
 *
 * O segundo argumento (minutos de atividade) é opcional: sem ele a resposta é
 * a mesma de antes, com ele a meta sobe.
 */
const B = require('../../services/bodyService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }

const br = (v, casas = 1) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

module.exports = {
    name: 'aguadiaria',
    aliases: ['agua', 'waterintake'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Quanta água beber por dia pelo peso e pelo tempo de exercício',
    cooldownMs: 1500,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        const peso = parseFloat(String(args[0] || '').replace(',', '.'))
        const minutos = parseFloat(String(args[1] || '0').replace(',', '.')) || 0
        const r = B.aguaDiaria(peso, minutos)

        if (!r) {
            let doc = cab('ÁGUA POR DIA', '💧')
            doc += '📌 Uso: `' + prefix + 'aguadiaria <peso kg> [minutos de exercício]`\n\n'
            doc += '🧮 *Exemplos*\n`' + prefix + 'aguadiaria 78`\n`' + prefix + 'aguadiaria 78 60`'
            return reply(doc)
        }

        let doc = cab('ÁGUA POR DIA', '💧')
        doc += linha('Peso', br(peso) + ' kg')
        if (minutos > 0) doc += linha('Exercício', minutos + ' min')
        doc += sep()
        doc += '🥤 *Meta: ' + br(r.total / 1000) + ' litros*\n'
        doc += '_Cerca de ' + r.copos + ' copos de 250 ml._\n\n'
        if (minutos > 0) {
            doc += '╭━〔 🧮 A CONTA 〕━⬣\n'
            doc += '┃ Base (35 ml por kg): ' + br(r.base / 1000) + ' L\n'
            doc += '┃ Pelo exercício: ' + br(r.extra / 1000) + ' L\n'
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        }
        doc += '🔎 *Como saber se está bom*\nUrina clara ao longo do dia. Escura e com cheiro forte é sinal de pouca água.\n\n'
        doc += '⚠️ _Quem tem doença renal ou cardíaca segue a orientação do médico, não a fórmula geral._'
        return reply(doc)
    }
}
