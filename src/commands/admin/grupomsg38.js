/**
 * Comando .msgevento — EVENTO
 *
 * Anuncia um evento do grupo.
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
    name: 'msgevento',
    aliases: ["modeloevento","cmd_msgevento","alt_msgevento","atalho_msgevento","abrev_msgevento","call_msgevento","func_msgevento"],
    category: 'admin',
    subcategory: 'Mensagens do Grupo',
    description: 'Anuncia um evento do grupo',
    usage: '<texto>',
    examples: ['Torneio de quiz sexta às 21h — envia no modelo do grupo', 'Live especial domingo às 19h — outro exemplo'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, client, user, quotedText, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 As mensagens de grupo só fazem sentido dentro de um grupo.')
        const ctx = { reply, sender, from, isGroup, client, args, prefix, user }
    if (!isAdmin) return reply('🛡️ Só a administração dispara mensagens oficiais.')
    if (!args.length && String(S.modelos(from).evento || '').includes('{texto}')) {
        return reply(F.tela({
            emoji: '🎉', titulo: 'Anunciar evento', prefix,
            intro: 'Anuncio o evento para o grupo com a data de hoje e a contagem de membros.',
            secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'msgevento', '<texto>')] }],
            dica: 'Quer mudar o jeito que a mensagem sai? Edite o modelo "evento".',
            proximos: [
                { nome: 'msgevento', args: 'Torneio de quiz sexta às 21h', oque: 'exemplo pronto' },
                { nome: 'msgtestar', args: 'evento', oque: 'vê como fica antes de enviar' },
                { nome: 'msgdefinir', args: 'evento seu texto com {texto}', oque: 'personaliza o modelo' }
            ]
        }))
    }
    return enviarModelo(ctx, 'evento')
    }
}
