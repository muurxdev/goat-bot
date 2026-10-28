/**
 * Comando .msganiversario — ANIVERSÁRIO
 *
 * Parabeniza um membro do grupo.
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
        nome: ctx.nomeAlvo || ctx.user?.displayNick || ctx.user?.name || 'Cavaleiro',
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
    return ctx.reply(texto, ctx.mencoes)
}

module.exports = {
    name: 'msganiversario',
    aliases: ["modeloaniversario","cmd_msganiversario","alt_msganiversario","atalho_msganiversario","abrev_msganiversario","call_msganiversario","func_msganiversario"],
    category: 'admin',
    subcategory: 'Mensagens do Grupo',
    description: 'Parabeniza um membro do grupo',
    usage: '<@pessoa ou nome>',
    examples: ['@fulano — parabeniza marcando', 'Ana — parabeniza pelo nome'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, client, user, quotedText, mentionedJid = [], quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 As mensagens de grupo só fazem sentido dentro de um grupo.')
        const ctx = { reply, sender, from, isGroup, client, args, prefix, user }
    if (!isAdmin) return reply('🛡️ Só a administração dispara mensagens oficiais.')
    const marcado = mentionedJid[0] || quotedSender || null
    if (!marcado && !args.length) {
        return reply(F.tela({
            emoji: '🎂', titulo: 'Parabenizar um membro', prefix,
            intro: 'Marque o aniversariante e eu mando os parabéns em nome do grupo inteiro.',
            secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'msganiversario', '@pessoa')] }],
            dica: 'Sem marcar, você pode escrever o nome: ' + F.cmd(prefix, 'msganiversario', 'Ana'),
            proximos: [
                { nome: 'msganiversario', args: '@pessoa', oque: 'parabeniza marcando a pessoa' },
                { nome: 'msgdefinir', args: 'aniversario seu texto com {nome}', oque: 'personaliza a mensagem' }
            ]
        }))
    }
    if (marcado) {
        ctx.nomeAlvo = '@' + String(marcado).split('@')[0].split(':')[0]
        ctx.mencoes = [marcado]
    } else if (args.length) {
        ctx.nomeAlvo = args.join(' ')
    }
    return enviarModelo(ctx, 'aniversario')
    }
}
