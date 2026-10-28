/**
 * Comando .msgassinatura — ASSINATURA DO GRUPO
 *
 * Rodapé padrão para os avisos oficiais.
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
    name: 'msgassinatura',
    aliases: ["assinaturagrupo","cmd_msgassinatura","alt_msgassinatura","atalho_msgassinatura","abrev_msgassinatura","call_msgassinatura","func_msgassinatura"],
    category: 'admin',
    subcategory: 'Mensagens do Grupo',
    description: 'Rodapé padrão para os avisos oficiais',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, client, user, quotedText, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 As mensagens de grupo só fazem sentido dentro de um grupo.')
        const ctx = { reply, sender, from, isGroup, client, args, prefix, user }
    const dados = await dadosDe(ctx)
    // dadosDe() nunca preencheu "data" — a assinatura saía "📅 undefined".
    const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    return reply(F.tela({
        emoji: '🖋️', titulo: 'Assinatura do grupo', prefix,
        intro: 'Rodapé pronto para colar no fim dos avisos oficiais. Segure a mensagem abaixo, copie e cole.',
        secoes: ['👑 *' + dados.grupo + '*\n📅 ' + hoje + ' · 👥 ' + (dados.membros ?? '?') + ' membros'],
        dica: 'Os modelos de aviso já assinam sozinhos com o nome do grupo.',
        proximos: [
            { nome: 'msgavisotexto', args: 'seu aviso', oque: 'envia um aviso já assinado' },
            { nome: 'msgmodelos', oque: 'todos os modelos do grupo' }
        ]
    }))
    }
}
