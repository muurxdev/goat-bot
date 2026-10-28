/**
 * Comando .categoria
 * Liga/desliga uma CATEGORIA inteira de comandos no grupo. Quando desligada,
 * nenhum comando daquela categoria funciona (exceto para admins/donos), com aviso
 * para pedir reativação a um admin.
 */

const dataService = require('../../services/dataService')
const moduleState = require('../../services/moduleStateService')
const { getBotName } = require('../../config/botConfig')
const { CATEGORIES, resolveCategoryKey } = require('../../config/categories')

module.exports = {
    name: 'categoria',
    aliases: ["categorias","togglecat","catcmd","cmd_categoria","alt_categoria","atalho_categoria","abrev_categoria","call_categoria","func_categoria"],
    category: 'admin',
    subcategory: 'Configuração',
    description: 'Ativa ou desativa uma categoria inteira de comandos no grupo',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName()
        const configs = dataService.getConfigsData()
        if (!configs[from]) configs[from] = {}
        const disabled = new Set(configs[from].disabledCategories || [])

        const sub = (args[0] || '').toLowerCase().trim()
        const catArg = (args[1] || '').toLowerCase().trim()

        // Painel de status quando sem argumentos
        if (!sub || (sub !== 'on' && sub !== 'off')) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   ⚙️ *CATEGORIAS DO GRUPO* ⚙️   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `╭━〔 📂 STATUS DAS CATEGORIAS 〕━⬣\n`
            for (const c of CATEGORIES) {
                const off = disabled.has(c.key)
                doc += `┃ ${off ? '🔴' : '🟢'} ${c.emoji} *${c.key}* — ${off ? 'Desativada' : 'Ativa'}\n`
            }
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            doc += `📌 *Uso:* \`.categoria off <categoria>\` ou \`.categoria on <categoria>\`\n`
            doc += `💡 _Ex.:_ \`.categoria off fun\` _desliga toda a categoria de diversão._\n`
            doc += `👑 *${botName}*`
            return reply(doc.trim())
        }

        const key = resolveCategoryKey(catArg)
        if (!key) {
            return reply(`❌ Categoria \`${catArg || '(vazio)'}\` não encontrada.\n\n📂 *Válidas:* ${CATEGORIES.map(c => c.key).join(', ')}`)
        }

        if (sub === 'off') {
            disabled.add(key)
            moduleState.setModule(key, false, from)
        } else {
            disabled.delete(key)
            moduleState.setModule(key, true, from)
        }
        configs[from].disabledCategories = [...disabled]
        await dataService.saveConfigsData(configs)

        const meta = CATEGORIES.find(c => c.key === key)
        let doc = `╔══════════════════════════════╗\n`
        doc += `║   ⚙️ *CATEGORIA ATUALIZADA* ⚙️   ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        doc += `${meta.emoji} *Categoria:* ${meta.label} (\`${key}\`)\n`
        doc += `${sub === 'off' ? '🔴' : '🟢'} *Estado:* ${sub === 'off' ? '*DESATIVADA*' : '*ATIVADA*'}\n`
        doc += `👤 *Admin:* @${sender.split('@')[0]}\n\n`
        doc += sub === 'off'
            ? `🔒 _Nenhum comando de *${key}* funcionará até um admin reativar com_ \`.categoria on ${key}\`\n`
            : `✅ _Os comandos de *${key}* voltaram a funcionar normalmente._\n`
        doc += `👑 *${botName}*`
        return reply(doc.trim(), [sender])
    }
}
