/**
 * Comando .packsalvar — SALVAR PERFIL
 *
 * Guarda a identidade atual com um apelido.
 */

const S = require('../../services/stickerService')

function cab(titulo, emoji) {
    return emoji + ' *' + titulo + '*\n\n'
}
function linha(rotulo, valor) { return '*' + rotulo + ':* ' + valor + '\n' }
function sep() { return '\n' }
function bloco(titulo, itens) {
    let t = '*' + titulo + '*\n'
    for (const i of itens) t += '• ' + i + '\n'
    return t
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

function semPacote(prefix) {
    return '_Você ainda não definiu a identidade do seu pacote._\n\n📌 Comece com: `' + prefix + 'packnome Meu Pacote`'
}

module.exports = {
    name: 'packsalvar',
    aliases: ["salvarperfilpack"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Guarda a identidade atual com um apelido',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const apelido = String(args[0] || '').trim()
    if (!apelido) return reply('💾 📌 Uso: `' + prefix + 'packsalvar rpg`\n\n_Guarda o nome e o autor atuais com esse apelido._')
    const r = S.salvarPreset(sender, apelido)
    if (!r.ok) return reply('❌ ' + r.erro)
    return reply('💾 Perfil *' + r.apelido + '* salvo: ' + (r.preset.nome || '—') + ' / ' + (r.preset.autor || '—'))
    }
}
