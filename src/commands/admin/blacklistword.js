/**
 * Comando .blacklistword
 * Filtro de palavras proibidas do grupo — cadastro, remoção, listagem e liga/desliga.
 * A fiscalização roda no messageHandler: apaga a mensagem e advertE o autor
 * (ADMs e Donos são isentos). Comparação sem acento e sem diferenciar maiúsculas.
 */

const dataService = require('../../services/dataService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

module.exports = {
    name: 'blacklistword',
    aliases: ["palavraproibida","banirpalavra","bloquearpalavra","cmd_blacklistword","alt_blacklistword","atalho_blacklistword","abrev_blacklistword","call_blacklistword","func_blacklistword"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Cadastra, remove e lista palavras proibidas no filtro do grupo',
    usage: '[add|del <palavra> | on|off | limpar]',
    examples: [' — mostra o filtro e as palavras', 'add palavrão — proíbe uma palavra', 'on — liga o filtro'],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, prefix = '.' }) => {
        const botName = getBotName()
        const configs = dataService.getConfigsData()
        if (!configs[from]) configs[from] = {}
        if (!Array.isArray(configs[from].blacklistWords)) configs[from].blacklistWords = []

        const lista = configs[from].blacklistWords
        const ativo = configs[from].blacklistWordsEnabled === true
        const sub = (args[0] || '').toLowerCase().trim()
        const termo = args.slice(1).join(' ').trim()

        const painel = () => {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║  🚫 *FILTRO DE PALAVRAS* 🚫  ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `╭━〔 ⚙️ ESTADO 〕━⬣\n`
            doc += `┃ ${ativo ? '🟢' : '🔴'} *Filtro:* ${ativo ? 'ATIVADO' : 'DESATIVADO'}\n`
            doc += `┃ 📋 *Palavras cadastradas:* ${lista.length}\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            if (lista.length) {
                doc += `╭━〔 📋 LISTA 〕━⬣\n`
                lista.slice(0, 30).forEach((p, i) => { doc += `┃ ${i + 1}. ${p}\n` })
                if (lista.length > 30) doc += `┃ _…e mais ${lista.length - 30}_\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            }
            doc += `╭━〔 ⚙️ COMO USAR 〕━⬣\n`
            doc += `┃ ➤ \`${prefix}blacklistword add <palavra>\`\n`
            doc += `┃ ➤ \`${prefix}blacklistword del <palavra>\`\n`
            doc += `┃ ➤ \`${prefix}blacklistword on\` / \`off\`\n`
            doc += `┃ ➤ \`${prefix}blacklistword limpar\` — apaga a lista\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `💡 _Quando alguém usa uma palavra da lista, eu apago a mensagem e advirto. Administradores e donos ficam de fora._\n`
            doc += `👑 *${botName}*`
            return doc.trim()
        }

        try {
            if (!sub || sub === 'list' || sub === 'lista' || sub === 'status') {
                return reply(painel())
            }

            if (sub === 'add' || sub === 'adicionar' || sub === 'por') {
                if (!termo) return reply(`❌ Informe a palavra. Ex.: \`${prefix}blacklistword add palavrão\``)
                if (norm(termo).length < 2) return reply('❌ A palavra precisa ter pelo menos 2 caracteres.')
                if (lista.some(p => norm(p) === norm(termo))) return reply(`⚠️ *"${termo}"* já está na lista.`)
                lista.push(termo)
                configs[from].blacklistWordsEnabled = true
                await dataService.saveConfigsData(configs)
                logger.info(`[BLACKLIST WORD] "${termo}" adicionada em ${from}`)
                return reply(`✅ *"${termo}"* adicionada ao filtro.\n📋 Total: *${lista.length}* palavra(s) | Filtro: 🟢 ATIVADO`)
            }

            if (sub === 'del' || sub === 'remover' || sub === 'rm' || sub === 'tirar') {
                if (!termo) return reply(`❌ Informe a palavra. Ex.: \`${prefix}blacklistword del palavrão\``)
                const idx = lista.findIndex(p => norm(p) === norm(termo))
                if (idx === -1) return reply(`⚠️ *"${termo}"* não está na lista.`)
                lista.splice(idx, 1)
                await dataService.saveConfigsData(configs)
                return reply(`🗑️ *"${termo}"* removida do filtro.\n📋 Restam *${lista.length}* palavra(s).`)
            }

            if (sub === 'on' || sub === 'ativar') {
                configs[from].blacklistWordsEnabled = true
                await dataService.saveConfigsData(configs)
                return reply(`🟢 *Filtro de palavras ATIVADO.*\n📋 ${lista.length} palavra(s) monitorada(s).${lista.length ? '' : `\n💡 Adicione com \`${prefix}blacklistword add <palavra>\`.`}`)
            }

            if (sub === 'off' || sub === 'desativar') {
                configs[from].blacklistWordsEnabled = false
                await dataService.saveConfigsData(configs)
                return reply('🔴 *Filtro de palavras DESATIVADO.* A lista foi preservada.')
            }

            if (sub === 'limpar' || sub === 'clear' || sub === 'resetar') {
                configs[from].blacklistWords = []
                await dataService.saveConfigsData(configs)
                return reply('🧹 *Lista de palavras proibidas apagada.*')
            }

            return reply(`❌ Opção inválida: \`${sub}\`\n\n${painel()}`)
        } catch (err) {
            logger.error('[BLACKLIST WORD ERROR]', err)
            return reply('❌ Não consegui salvar o filtro de palavras agora. Tente de novo em instantes.')
        }
    }
}
