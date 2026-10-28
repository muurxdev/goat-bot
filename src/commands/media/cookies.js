/**
 * Comando .cookies
 * Gerencia cookies do yt-dlp por usuário e global
 */

const { getCookiesPathFor, validateCookiesFile, saveUserCookies, removeUserCookies, getCookieStatus, COOKIES_FILE } = require('../../services/media/mediaArgs')
const { isOwnerJid } = require('../../config/env')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'cookies',
    aliases: ['cookie', 'managecookies'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Mostra e troca os cookies usados nos seus downloads',
    usage: '[conteúdo do cookies.txt | remover]',
    examples: [' — mostra a situação dos cookies', 'remover — apaga o seu cookie'],
    cooldownMs: 5000,
    execute: async ({ sender, text, reply, info, client, quotedText, prefix = '.' }) => {
        const rawInput = (text || quotedText || '').trim()
        const args = rawInput.toLowerCase()

        // Sem argumentos: mostra status
        if (!args) {
            const status = getCookieStatus(sender)
            const geral = status.global.ok
                ? `🟢 ${status.global.count} cookies (${status.global.resumoDominios || status.global.domain})`
                : `🔴 ${motivoCookie(status.global.reason)}`
            const seu = status.user && status.user.ok
                ? `🟢 ${status.user.count} cookies (${status.user.resumoDominios || status.user.domain})`
                : (status.user ? `🔴 ${motivoCookie(status.user.reason)}` : 'nenhum')
            const algumOk = status.global.ok || (status.user && status.user.ok)

            return reply(F.tela({
                emoji: '🍪',
                titulo: 'Cookies de download',
                intro: algumOk
                    ? `Seus downloads usam *${status.activeSource === 'user' ? 'o seu cookie' : 'o cookie geral'}*.`
                    : 'Não há cookie válido em uso. Vídeos que pedem login (idade, membros) podem falhar.',
                secoes: [
                    { emoji: '📋', titulo: 'Situação', linhas: [
                        F.campo('Geral', geral),
                        F.campo('Seu', seu),
                        F.campo('Em uso', !algumOk ? 'nenhum' : status.activeSource === 'user' ? 'o seu' : 'o geral')
                    ] },
                    { emoji: '📤', titulo: 'Como enviar o seu', linhas: F.lista([
                        'Exporte o cookies.txt com a extensão "Get cookies.txt LOCALLY", logado no YouTube',
                        F.cmd(prefix, 'cookies', '<cole o conteúdo>') + ' ou responda esta mensagem com o texto',
                        F.cmd(prefix, 'cookies', 'remover') + ' — apaga o seu'
                    ]) },
                    isOwnerJid(sender) ? { emoji: '👑', titulo: 'Só para o dono', linhas: [F.cmd(prefix, 'cookies', 'global <conteúdo>') + ' — troca o cookie geral'] } : null
                ],
                dica: 'O cookie é como o seu login: mande de preferência no privado, não no grupo.',
                proximos: [{ nome: 'diagyoutube', oque: 'testar a rota até o YouTube' }],
                prefix
            }))
        }

        // .cookies remover
        if (args === 'remover' || args === 'remove' || args === 'delete') {
            const removed = removeUserCookies(sender)
            if (removed) {
                return reply('✅ Apaguei seu cookie. Seus downloads voltam a usar o geral, se houver.')
            }
            return reply('🔍 Você não tinha cookie próprio salvo.')
        }

        // .cookies status
        if (args === 'status') {
            return module.exports.execute({ sender, text: '', reply, info, client, quotedText: '', prefix })
        }

        // .cookies global <conteúdo> — dono setando cookie global
        if (args.startsWith('global ') && isOwnerJid(sender)) {
            const content = rawInput.slice(7).trim()
            if (!content || content.length < 20) {
                return reply('❌ Esse texto não parece um cookies.txt. Cole o arquivo inteiro, do jeito que a extensão exporta.')
            }
            const fs = require('fs')
            try {
                fs.writeFileSync(COOKIES_FILE, require("../../services/media/mediaArgs").sanitizarCookies(content), "utf8")
                const validation = validateCookiesFile(COOKIES_FILE)
                if (validation.ok) {
                    return reply(`✅ Cookie geral salvo · ${validation.count} cookies (${validation.domain}).`)
                } else {
                    logger.warn(`[COOKIES] Cookie global salvo mas inválido: ${validation.reason} ${validation.detail || ''}`)
                    return reply(`⚠️ Salvei o cookie geral, mas ele não passou na conferência: ${motivoCookie(validation.reason)}.`)
                }
            } catch (err) {
                logger.error(`[COOKIES] Erro ao salvar cookie global: ${err.message}`)
                return reply('❌ Não consegui salvar o cookie geral. Tente de novo.')
            }
        }

        // .cookies <conteúdo> — usuário setando cookie pessoal
        const content = rawInput
        if (content.length < 20) {
            return reply('❌ Esse texto não parece um cookies.txt. Cole o arquivo inteiro, do jeito que a extensão exporta.')
        }

        const saved = saveUserCookies(sender, content)
        if (saved) {
            const userPath = require('path').join(require('../../config/paths').dataDir, 'cookies', sender.replace(/[^a-zA-Z0-9._-]/g, '_') + '.txt')
            const validation = validateCookiesFile(userPath)
            if (validation.ok) {
                return reply(`✅ Salvei seu cookie · ${validation.count} cookies (${validation.domain}).\nA partir de agora seus downloads usam ele.`)
            }
            return reply('✅ Salvei seu cookie. Ele entra em uso nos próximos downloads.')
        }

        return reply('❌ Não consegui salvar seu cookie. Tente de novo.')
    }
}

/** Traduz o código de validação do cookie (mediaArgs) para português simples. */
function motivoCookie(reason) {
    const mapa = {
        AUSENTE: 'nenhum',
        VAZIO: 'arquivo vazio',
        FORMATO_INVALIDO: 'formato não reconhecido',
        ILEGIVEL: 'não consegui ler o arquivo'
    }
    return mapa[reason] || 'com problema'
}
