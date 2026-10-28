/**
 * Comando .rescisao — RESCISÃO
 *
 * Verbas rescisórias por tipo de saída, verba por verba
 * A conta vive em services/laborService; aqui só a apresentação.
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

module.exports = {
    name: 'rescisao',
    aliases: ["calcularrescisao"],
    category: 'general',
    subcategory: 'Utilidades & Telefonia',
    description: 'Verbas rescisórias por tipo de saída, verba por verba',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', prefix = '.' }) => {
        const partes = (text && text.trim() ? text.trim() : args.join(' ')).split(/\s+/).filter(Boolean)

        const salario = L.lerNumero(partes[0])
        const meses = parseInt(partes[1], 10)
        const tipo = (partes[2] || 'semjustacausa').toLowerCase()
        const diasSaldo = parseInt(partes[3], 10) || 0
        if (!Number.isFinite(salario) || !Number.isFinite(meses) || salario <= 0) {
            let doc = cab('RESCISÃO', '🚪')
            doc += '📌 Uso: `' + prefix + 'rescisao <salário> <meses> [tipo] [dias do mês trabalhados]`\n\n'
            doc += '🧮 *Exemplo*\n`' + prefix + 'rescisao 3000 26 semjustacausa 10`\n\n'
            doc += bloco('🚪 TIPOS', Object.entries(L.TIPOS_RESCISAO).map(([k, t]) => k + ' — ' + t.nome))
            return reply(doc)
        }
        const r = L.rescisao({ salario, meses, tipo, diasSaldo })
        let doc = cab('RESCISÃO', '🚪')
        doc += linha('Tipo', r.tipo.nome)
        doc += linha('Salário', L.moeda(salario))
        doc += linha('Tempo de casa', r.anos + ' ano(s) e ' + r.mesesNoAno + ' mês(es)')
        doc += sep()
        doc += '╭━〔 💰 VERBAS 〕━⬣\n'
        for (const v of r.verbas) doc += '┃ ' + v.nome + ': ' + L.moeda(v.valor) + '\n┃    _' + v.obs + '_\n'
        doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
        if (r.descontos.length) {
            doc += '╭━〔 📉 PODE SER DESCONTADO 〕━⬣\n'
            for (const v of r.descontos) doc += '┃ ' + v.nome + ': ' + L.moeda(v.valor) + '\n┃    _' + v.obs + '_\n'
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
        }
        doc += '\n💵 *A receber: ' + L.moeda(r.total) + '*\n'
        if (r.saqueFgts > 0) doc += '🏦 _Mais o saque do FGTS:_ ' + L.moeda(r.saqueFgts) + ' (' + r.tipo.saqueFgts + '% do saldo)\n'
        doc += (r.tipo.seguro ? '📄 _Dá direito ao seguro-desemprego._\n' : '❌ _Não dá direito ao seguro-desemprego._\n')
        doc += '\n⚠️ _Estimativa bruta, sem INSS e IRRF sobre as verbas tributáveis, e com saldo de FGTS calculado sem rendimento._\n'
        doc += '🚪 _Comparar as saídas:_ `' + prefix + 'tiposrescisao`'
        return reply(doc)
    }
}
