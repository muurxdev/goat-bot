/**
 * Canal de sugestões dos usuários.
 *
 * As sugestões ficam isoladas por PERFIL e por ambiente (via profileDataService),
 * então uma ideia mandada num grupo de RPG não se mistura com as de um grupo de
 * divulgação. O dono lê tudo com `.sugestoes`.
 */

const profileData = require('../../services/profileDataService')
const moduleState = require('../../services/moduleStateService')
const logger = require('../../core/logger')

const CHAVE = 'sugestoes'

/** Teto de sugestões guardadas por ambiente, para a lista não crescer sem fim. */
const LIMITE_POR_AMBIENTE = 200

/** Tamanho máximo aceito, evitando que uma mensagem gigante entupa o registro. */
const TAMANHO_MAX = 500

module.exports = {
    name: 'sugerir',
    aliases: ['sugestao', 'sugerircmd', 'ideia'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Manda uma ideia de comando ou melhoria para os meus donos',
    cooldownMs: 30000,
    execute: async ({ sender, reply, args, from, isGroup, pushName }) => {
        const texto = (args || []).join(' ').trim()

        if (!texto) {
            return reply(
                '💡 *ENVIAR SUGESTÃO*\n\n' +
                'Escreva sua ideia depois do comando.\n\n' +
                '📝 *Exemplo:*\n`.sugerir um comando que mostre o ranking semanal`\n\n' +
                '_Sua sugestão vai direto para os meus donos._'
            )
        }

        if (texto.length > TAMANHO_MAX) {
            return reply(`❌ Sugestão muito longa (${texto.length} caracteres).\n\n📏 Máximo: *${TAMANHO_MAX}*. Resuma a ideia e envie de novo.`)
        }

        const scope = moduleState.scopeOf(from, isGroup)

        try {
            const lista = profileData.getData(scope, CHAVE, [])
            const registro = {
                de: sender,
                nome: (pushName || '').trim() || null,
                texto,
                quando: new Date().toISOString()
            }

            // Mantém as mais recentes: corta pela frente ao bater o teto.
            lista.push(registro)
            const cortada = lista.slice(-LIMITE_POR_AMBIENTE)

            const ok = profileData.setData(scope, CHAVE, cortada)
            if (!ok) return reply('❌ Não consegui registrar sua sugestão agora. Tente de novo em instantes.')

            logger.info(`[SUGERIR] Nova sugestão de ${sender} em ${scope} (perfil ${profileData.perfilDe(scope)})`)

            return reply(
                '✅ *SUGESTÃO REGISTRADA!*\n\n' +
                `📝 _"${texto}"_\n\n` +
                `📊 Já são *${cortada.length}* sugestão(ões) neste ambiente.\n` +
                '🙏 Obrigado por me ajudar a melhorar!'
            )
        } catch (err) {
            logger.error('[SUGERIR ERROR]', err)
            return reply('😕 *Não consegui guardar sua sugestão agora.*\n\nTente de novo em instantes. Sua ideia é importante!')
        }
    }
}
