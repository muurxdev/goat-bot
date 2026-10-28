/**
 * Comando .campanhacriar — CRIAR CAMPANHA
 *
 * Registra uma campanha de divulgação.
 */

const D = require('../../services/divulgacaoService')

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

function num(v) { return Number(v || 0).toLocaleString('pt-BR') }
function quando(ms) { return ms ? new Date(Number(ms)).toLocaleString('pt-BR').slice(0, 16) : '—' }

/** Escopo da divulgação: o grupo onde o comando foi dado, ou o privado. */
function escopoDe(ctx) {
    return ctx.isGroup ? ctx.from : 'pv:' + String(ctx.sender || '').split('@')[0]
}

function linhaCampanha(c, i) {
    const s = D.SITUACOES[c.situacao] || { emoji: '❔' }
    let t = '┃ ' + (i + 1) + '. ' + s.emoji + ' *' + c.nome + '* _(' + c.formato + ')_\n'
    if (c.envios) t += '┃    ' + c.envios + ' envio(s) · ' + num(c.alcance) + ' pessoas alcançadas\n'
    return t
}
function semCampanhas(prefix) {
    return '_Nenhuma campanha neste ambiente._\n\n📌 Crie a primeira: `' + prefix + 'campanhacriar Lançamento`'
}

module.exports = {
    name: 'campanhacriar',
    aliases: ["novacampanha","cmd_campanhacriar","alt_campanhacriar","atalho_campanhacriar","abrev_campanhacriar","call_campanhacriar","func_campanhacriar"],
    adminOnly: true,
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Registra uma campanha de divulgação',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const bruto = args.join(' ').trim()
    if (!bruto) {
        return reply('➕ 📌 Uso: `' + prefix + 'campanhacriar Lançamento | anuncio | texto da peça`\n\n' +
            'Formatos: ' + Object.keys(D.FORMATOS).join(', '))
    }
    const [nome, formato, ...resto] = bruto.split('|').map(s => s.trim())
    const r = D.criarCampanha(escopo, {
        nome,
        formato: (formato || 'anuncio').toLowerCase(),
        texto: resto.join('|'),
        autor: sender
    })
    if (!r.ok) return reply('❌ ' + r.erro)
    let doc = cab('CRIAR CAMPANHA', '➕')
    doc += linha('Nome', r.campanha.nome)
    doc += linha('Formato', D.FORMATOS[r.campanha.formato].nome)
    doc += linha('Posição', String(r.posicao))
    doc += linha('Situação', '📝 Rascunho')
    doc += '\n💡 _' + D.FORMATOS[r.campanha.formato].dica + '_'
    doc += '\n📌 _Escreva a peça:_ `' + prefix + 'campanhatexto ' + r.posicao + ' | seu texto`'
    return reply(doc)
    }
}
