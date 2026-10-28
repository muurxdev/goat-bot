/**
 * Comando .msgrestaurar — RESTAURAR PADRÕES
 *
 * Devolve todos os modelos ao texto original.
 */

const S = require('../../services/groupMessageService')
const F = require('../../utils/formato')

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
    name: 'msgrestaurar',
    aliases: ["restaurarmodelos","cmd_msgrestaurar","alt_msgrestaurar","atalho_msgrestaurar","abrev_msgrestaurar","call_msgrestaurar","func_msgrestaurar"],
    category: 'admin',
    subcategory: 'Mensagens do Grupo',
    description: 'Devolve todos os modelos ao texto original',
    usage: '[confirmar]',
    examples: [' — mostra quantos modelos voltariam ao padrão', 'confirmar — restaura todos'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, client, user, quotedText, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 As mensagens de grupo só fazem sentido dentro de um grupo.')
        const ctx = { reply, sender, from, isGroup, client, args, prefix, user }
    if (!isAdmin) return reply('🛡️ Só a administração restaura os modelos.')
    const meus = S.personalizados(from)
    const qtd = Object.keys(meus).length
    if (!qtd) return reply(F.tela({
        emoji: '♻️', titulo: 'Restaurar modelos', prefix,
        intro: 'Nenhum modelo foi personalizado neste grupo: todos já estão com o texto original.',
        dica: 'Quando o grupo editar algum modelo, este comando devolve todos ao original (peço confirmação antes).',
        proximos: [
            { nome: 'msgmodelos', oque: 'vê os modelos disponíveis' },
            { nome: 'msgdefinir', args: 'aviso ⚠️ {texto}', oque: 'personaliza um modelo' }
        ]
    }))
    if (String(args[0] || '').toLowerCase() !== 'confirmar') {
        return reply('♻️ Isso descarta *' + qtd + '* modelo(s) personalizado(s).\n\nPara confirmar: `' + prefix + 'msgrestaurar confirmar`')
    }
    require('../../services/profileDataService').deleteData(from, 'mensagens_modelos')
    return reply('♻️ ' + qtd + ' modelo(s) voltaram ao padrão.')
    }
}
