/**
 * Comando .nivelperfil — a progressão do tema do ambiente.
 *
 * O card muda conforme o perfil aplicado no grupo: num grupo de RPG aparecem
 * chefes e arena; num de código, comandos e estudo.
 * Antes era o mesmo card em todo lugar, mostrando "bosses derrotados" para
 * quem nunca abriu o RPG.
 *
 * Os temas são independentes: subir de Cavaleiro não sobe Operador.
 */

const nivelService = require('../../services/profileLevelService')
const botProfile = require('../../services/botProfileService')
const moduleState = require('../../services/moduleStateService')
const dataService = require('../../services/dataService')
const { PROFILE_BY_KEY, resolveProfileKey } = require('../../config/botProfiles')

function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    const cheios = Math.round(f * 18)
    return '[' + '█'.repeat(cheios) + '░'.repeat(18 - cheios) + '] ' + (f * 100).toFixed(0) + '%'
}

function formatar(valor) {
    if (typeof valor === 'number') return valor.toLocaleString('pt-BR')
    const t = String(valor)
    // Datas do banco vêm como "2026-09-09 03:41:52"; só o dia interessa aqui.
    const data = t.match(/^(\d{4})-(\d{2})-(\d{2})/)
    return data ? `${data[3]}/${data[2]}/${data[1]}` : t.slice(0, 24)
}

function cartao(prog, nome, ehAtivo, prefix) {
    let doc = `╔══════════════════════════════╗\n`
    doc += `║   ${prog.emoji} *${prog.titulo}*\n`
    doc += `╚══════════════════════════════╝\n\n`
    doc += `👤 *${nome}*\n`
    doc += `🎖️ *Patente:* ${prog.patente}\n`
    doc += `📊 *Nível ${prog.nivel}* · ${prog.xpTotal.toLocaleString('pt-BR')} ${prog.unidade}\n\n`
    doc += barra(prog.progresso) + `\n`
    doc += `_${prog.xpNoNivel.toLocaleString('pt-BR')} / ${prog.xpParaProximo.toLocaleString('pt-BR')} para o nível ${prog.nivel + 1}_\n\n`

    doc += `╭━〔 📈 SEUS NÚMEROS 〕━⬣\n`
    for (const [rotulo, valor] of prog.stats) {
        doc += `┃ *${rotulo}:* ${formatar(valor)}\n`
    }
    doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`

    if (prog.proxima) {
        doc += `\n🎯 _Próxima patente:_ ${prog.proxima.nome} _em ${prog.proxima.faltam} nível(is)._`
    } else {
        doc += `\n👑 _Você chegou ao topo desta escada._`
    }

    if (!ehAtivo) {
        doc += `\n\n💡 _Este não é o tema deste ambiente. Veja o daqui com_ \`${prefix}nivelperfil\`_._`
    }
    return doc
}

module.exports = {
    name: 'nivelperfil',
    aliases: ['meunivel', 'progressao', 'minhaescada'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Mostra sua progressão no tema do ambiente (RPG, Skycode ou completo)',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.', user: ctxUser }) => {
        const user = ctxUser?.jid ? ctxUser : dataService.initializeUser(sender)
        const nome = user.displayNick || user.display_nick || user.name || 'Andarilho'

        const escopo = moduleState.scopeOf(from, isGroup)
        const ativo = botProfile.getActiveProfile(escopo)
        const temaDoAmbiente = ativo?.key && nivelService.TEMAS[ativo.key] ? ativo.key : 'goat'

        const pedido = String(args[0] || '').toLowerCase()

        // `.nivel tudo` → as quatro escadas lado a lado, para comparar.
        if (['tudo', 'todos', 'geral', 'comparar'].includes(pedido)) {
            const todos = nivelService.todosOsTemas(user)
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🎭 *SUAS QUATRO ESCADAS*\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `👤 *${nome}*\n\n`
            for (const p of todos) {
                const marca = p.tema === temaDoAmbiente ? '🟢' : '⚪'
                doc += `${marca} ${p.emoji} *${p.titulo}* — nível ${p.nivel}\n`
                doc += `┃ ${p.patente}\n`
                doc += `┃ ${p.xpTotal.toLocaleString('pt-BR')} ${p.unidade}\n`
                doc += `┃ ${barra(p.progresso)}\n\n`
            }
            doc += `_🟢 é o tema deste ambiente. As escadas são independentes: subir numa não sobe nas outras._\n\n`
            doc += `💡 _Detalhe de uma:_ \`${prefix}nivelperfil rpg\``
            return reply(doc)
        }

        // `.nivel <tema>` → escada específica.
        if (pedido) {
            const chave = resolveProfileKey(pedido)
            if (!chave || !nivelService.TEMAS[chave]) {
                const nomes = Object.keys(nivelService.TEMAS).join(', ')
                return reply(`❓ Não conheço o tema \`${pedido}\`.\n\n📌 Disponíveis: ${nomes}\n💡 Ou use \`${prefix}nivelperfil tudo\` para ver todas.`)
            }
            return reply(cartao(nivelService.progressoDe(user, chave), nome, chave === temaDoAmbiente, prefix))
        }

        // Sem argumento: o tema do ambiente.
        const prog = nivelService.progressoDe(user, temaDoAmbiente)
        let doc = cartao(prog, nome, true, prefix)
        const perfil = PROFILE_BY_KEY[temaDoAmbiente]
        if (perfil) doc += `\n\n🎭 _Tema deste ambiente: ${perfil.emoji} ${perfil.label}._`
        doc += `\n💡 _Ver as quatro:_ \`${prefix}nivelperfil tudo\``
        return reply(doc)
    }
}
