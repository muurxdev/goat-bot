/**
 * Comando .setcookies — cookie PESSOAL (por usuário).
 *
 * Cada pessoa pode enviar o SEU próprio cookies.txt; ele passa a ser usado nos
 * downloads DELA (tem prioridade sobre o cookie global). O cookie GLOBAL, que
 * vale para todo mundo, é setado só pelo Dono em `.setcookiesglobal`.
 */

const fs = require('fs')
const path = require('path')
const { dataDir } = require('../../config/paths')
const { validateCookiesFile, saveUserCookies, removeUserCookies, getCookieStatus, sanitizeJid } = require('../../services/media/mediaArgs')
const { downloadWhatsAppMedia } = require('../../services/mediaService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

/** Extrai o conteúdo do cookie de um documento anexado/citado ou do texto. */
async function extrairConteudo({ info, from, client, rawText, reply }) {
    const contextInfo = info?.message?.extendedTextMessage?.contextInfo
    const quoted = contextInfo?.quotedMessage
    const isDoc = !!(info?.message?.documentMessage || quoted?.documentMessage)
    if (isDoc) {
        await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')
        const wrapper = info.message?.documentMessage ? info : {
            key: { remoteJid: from, id: contextInfo?.stanzaId, participant: contextInfo?.participant },
            message: quoted
        }
        const buffer = await downloadWhatsAppMedia(wrapper, 'document', client)
        return buffer.toString('utf8')
    }
    return rawText
}

module.exports = {
    name: 'setcookies',
    aliases: ['setcookie', 'meucookie', 'meuscookies', 'addcookies', 'upcookies'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Envia o SEU cookie pessoal do YouTube (usado só nos seus downloads)',
    cooldownMs: 4000,
    execute: async ({ text, info, from, client, reply, sender }) => {
        const botName = getBotName()
        const rawText = (text || '').trim()
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo
        const temDoc = !!(info?.message?.documentMessage || contextInfo?.quotedMessage?.documentMessage)

        // .setcookies remover
        if (/^(remover|remove|delete|apagar)$/i.test(rawText)) {
            return reply(removeUserCookies(sender)
                ? '✅ Apaguei seu cookie. Seus downloads voltam a usar o geral.'
                : '🔍 Você não tinha cookie próprio salvo.')
        }

        // Sem conteúdo: mostra status + instruções
        if (!rawText && !temDoc) {
            const st = getCookieStatus(sender)
            let doc = '🍪 *Seu cookie do YouTube*\n'
            doc += `*Seu:* ${st.user && st.user.ok ? `ok · ${st.user.count} cookies (${st.user.domain})` : 'nenhum'}\n`
            doc += `*Geral:* ${st.global && st.global.ok ? `ok · ${st.global.count} cookies` : 'nenhum'}\n`
            doc += `*Em uso nos seus downloads:* ${st.activeSource === 'user' ? 'o seu' : 'o geral'}\n\n`
            doc += '*Como enviar o seu*\n'
            doc += '• No computador, instale a extensão "Get cookies.txt LOCALLY"\n'
            doc += '• Abra o YouTube já logado e exporte o `cookies.txt`\n'
            doc += '• Mande o arquivo aqui respondendo com `.setcookies` (ou cole: `.setcookies <conteúdo>`)\n'
            doc += '• Para apagar o seu: `.setcookies remover`'
            return reply(doc)
        }

        try {
            const conteudo = await extrairConteudo({ info, from, client, rawText, reply })
            if (!conteudo || conteudo.length < 20) {
                return reply('❌ Esse arquivo não parece um cookies.txt. Exporte de novo pela extensão e mande o arquivo inteiro.')
            }
            if (!saveUserCookies(sender, conteudo)) {
                return reply('❌ Não consegui salvar seu cookie. Tente de novo.')
            }
            const userPath = path.join(dataDir, 'cookies', sanitizeJid(sender) + '.txt')
            const v = validateCookiesFile(userPath)
            if (!v.ok) {
                removeUserCookies(sender)
                logger.warn(`[SETCOOKIES] Cookie de ${sender} recusado: ${v.reason} ${v.detail || ''}`)
                return reply('❌ Não aceitei esse cookie: o arquivo não está no formato que a extensão exporta.\nExporte de novo pelo "Get cookies.txt LOCALLY" e mande outra vez.')
            }
            logger.info(`[SETCOOKIES] ${sender} salvou cookie pessoal (${v.count} linhas, ${v.domain})`)
            return reply(`✅ Salvei seu cookie · ${v.count} cookies (${v.domain}).\nA partir de agora os *seus* downloads usam ele; o geral continua valendo para os outros.`)
        } catch (err) {
            logger.error(`[SETCOOKIES ERROR] ${sender}:`, err)
            return reply('❌ Não consegui ler seu arquivo de cookies. Mande de novo, como documento.')
        }
    }
}
