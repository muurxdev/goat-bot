/**
 * Comando .packapagar — APAGAR PERFIL
 *
 * Remove uma identidade salva.
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
    name: 'packapagar',
    aliases: ["apagarperfilpack"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Remove uma identidade salva',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const apelido = String(args[0] || '').trim()
    if (!apelido) return reply('🗑️ 📌 Uso: `' + prefix + 'packapagar rpg`')
    const r = S.apagarPreset(sender, apelido)
    if (!r.ok) return reply('❌ ' + r.erro)
    return reply('🗑️ Perfil *' + apelido + '* apagado.')
    }
}
