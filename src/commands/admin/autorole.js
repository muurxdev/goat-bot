/**
 * Comando .autorole
 * Cargo automático para quem entra no grupo.
 *
 * O WhatsApp não tem "cargos" de verdade (só admin/membro), e promover a admin
 * automaticamente seria perigoso. Então o autorole atribui um CARGO DO BOT ao
 * novo membro: fica gravado no perfil dele (aparece no `.dossie` dentro deste
 * grupo) e, se quiser, é anunciado na entrada.
 *
 * A atribuição acontece no groupEventsHandler quando alguém entra (action "add").
 */

const dataService = require('../../services/dataService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

const CARGO_PADRAO = 'Novato'
const MAX_CARGO = 30

module.exports = {
    name: 'autorole',
    aliases: ["cargoautomatico","autocargo","setautorole","cmd_autorole","alt_autorole","atalho_autorole","abrev_autorole","call_autorole","func_autorole"],
    category: 'admin',
    subcategory: 'Configuração',
    description: 'Define um cargo automático atribuído a quem entra no grupo',
    usage: '[on|off|set <cargo>|anunciar on|off]',
    examples: [' — mostra a configuração atual', 'on — liga o cargo automático', 'set Novato — muda o cargo dado a quem entra'],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, prefix = '.' }) => {
        const botName = getBotName()
        const configs = dataService.getConfigsData()
        if (!configs[from]) configs[from] = {}
        if (!configs[from].autoRole) {
            configs[from].autoRole = { enabled: false, cargo: CARGO_PADRAO, anunciar: true }
        }

        const cfg = configs[from].autoRole
        const sub = (args[0] || '').toLowerCase().trim()
        const valor = args.slice(1).join(' ').trim()

        const painel = () => {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🎖️ *CARGO AUTOMÁTICO* 🎖️   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += '╭━〔 ⚙️ ESTADO 〕━⬣\n'
            doc += `┃ ${cfg.enabled ? '🟢' : '🔴'} *Autorole:* ${cfg.enabled ? 'ATIVADO' : 'DESATIVADO'}\n`
            doc += `┃ 🎖️ *Cargo dado:* ${cfg.cargo}\n`
            doc += `┃ 📢 *Anunciar na entrada:* ${cfg.anunciar ? 'Sim' : 'Não'}\n`
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '╭━〔 ⚙️ COMO USAR 〕━⬣\n'
            doc += `┃ ➤ \`${prefix}autorole on\` / \`off\`\n`
            doc += `┃ ➤ \`${prefix}autorole set <cargo>\` — muda o título\n`
            doc += `┃ ➤ \`${prefix}autorole anunciar on|off\`\n`
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '💡 _O cargo fica gravado no perfil e aparece no_ `.dossie` _dentro deste grupo._\n'
            doc += '⚠️ _Isto não promove a administrador: é só um título que eu guardo no perfil._\n'
            doc += `👑 *${botName}*`
            return doc.trim()
        }

        try {
            if (!sub || sub === 'status' || sub === 'ver') return reply(painel())

            if (sub === 'on' || sub === 'ativar') {
                cfg.enabled = true
                await dataService.saveConfigsData(configs)
                return reply(`🟢 *Autorole ATIVADO.*\n🎖️ Novos membros receberão o cargo *${cfg.cargo}*.`)
            }

            if (sub === 'off' || sub === 'desativar') {
                cfg.enabled = false
                await dataService.saveConfigsData(configs)
                return reply('🔴 *Autorole DESATIVADO.* Ninguém mais recebe cargo automático.')
            }

            if (sub === 'set' || sub === 'cargo' || sub === 'definir') {
                if (!valor) return reply(`❌ Informe o cargo. Ex.: \`${prefix}autorole set Aprendiz\``)
                if (valor.length > MAX_CARGO) return reply(`❌ O cargo deve ter até ${MAX_CARGO} caracteres.`)
                cfg.cargo = valor
                cfg.enabled = true
                await dataService.saveConfigsData(configs)
                logger.info(`[AUTOROLE] Cargo de ${from} definido como "${valor}"`)
                return reply(`✅ *Cargo automático definido:* *${valor}*\n🟢 Autorole ativado — quem entrar recebe esse cargo.`)
            }

            if (sub === 'anunciar') {
                const v = (args[1] || '').toLowerCase()
                if (v !== 'on' && v !== 'off') return reply(`❌ Uso: \`${prefix}autorole anunciar on\` ou \`off\``)
                cfg.anunciar = v === 'on'
                await dataService.saveConfigsData(configs)
                return reply(`📢 *Anúncio na entrada:* ${cfg.anunciar ? 'ATIVADO' : 'DESATIVADO'}.`)
            }

            return reply(`❌ Opção inválida: \`${sub}\`\n\n${painel()}`)
        } catch (err) {
            logger.error('[AUTOROLE ERROR]', err)
            return reply('❌ Não consegui salvar a configuração do cargo automático agora. Tente de novo em instantes.')
        }
    }
}
