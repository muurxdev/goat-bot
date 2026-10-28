/**
 * Comando .msgver — VER MODELO
 *
 * Mostra o texto cru de um modelo.
 */

const S = require('../../services/groupMessageService')

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

/** Dados de substituição das variáveis, a partir do contexto da mensagem. */
async function dadosDe(ctx) {
    let nomeGrupo = 'grupo', membros = null
    if (ctx.isGroup && ctx.client) {
        try {
            const meta = await ctx.client.groupMetadata(ctx.from)
            nomeGrupo = meta?.subject || nomeGrupo
            membros = meta?.participants?.length ?? null
        } catch (err) {
            require('../../core/logger').warn('[MSG] Metadados de ' + ctx.from + ' indisponíveis: ' + err.message)
        }
    }
    return {
        grupo: nomeGrupo,
        membros,
        nome: ctx.user?.displayNick || ctx.user?.name || 'Cavaleiro',
        admin: ctx.user?.displayNick || 'a administração',
        texto: (ctx.args || []).join(' ').trim()
    }
}
/** Envia um modelo já resolvido, registrando no histórico. */
async function enviarModelo(ctx, chave) {
    const todos = S.modelos(ctx.from)
    const modelo = todos[chave]
    if (!modelo) return ctx.reply('❌ O modelo *' + chave + '* não existe. Veja os disponíveis com `' + ctx.prefix + 'msgmodelos`.'.split('`').join(String.fromCharCode(96)))
    const texto = S.resolver(modelo, await dadosDe(ctx))
    S.registrarEnvio(ctx.from, { modelo: chave, autor: ctx.sender, tamanho: texto.length })
    return ctx.reply(texto)
}

module.exports = {
    name: 'msgver',
    aliases: ["vermodelo","cmd_msgver","alt_msgver","atalho_msgver","abrev_msgver","call_msgver","func_msgver"],
    category: 'admin',
    subcategory: 'Mensagens do Grupo',
    description: 'Mostra o texto cru de um modelo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, client, user, quotedText, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 As mensagens de grupo só fazem sentido dentro de um grupo.')
        const ctx = { reply, sender, from, isGroup, client, args, prefix, user }
    const chave = String(args[0] || '').toLowerCase()
    const todos = S.modelos(from)
    if (!chave || !todos[chave]) {
        return reply('👁️ Informe um modelo existente.\n\n📌 Exemplo: `' + prefix + 'msgver regras`\n\nDisponíveis: ' + Object.keys(todos).join(', '))
    }
    let doc = cab('VER MODELO', '👁️')
    doc += linha('Modelo', chave)
    doc += linha('Tipo', S.personalizados(from)[chave] ? '✏️ personalizado' : '📄 padrão')
    doc += '\n```\n' + todos[chave] + '\n```'
    return reply(doc)
    }
}
