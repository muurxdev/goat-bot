/**
 * Comando .setcookiesglobal — cookie GLOBAL do bot (vale para TODOS os usuários).
 *
 * Exclusivo do Dono. O cookie pessoal de cada um fica em .setcookies e tem
 * prioridade sobre este. Este aqui é o padrão usado por quem não tem o próprio.
 *
 * Nunca mostra o conteúdo, caminho ou domínio do arquivo na conversa: só se está
 * definido, quantos itens tem e quando foi atualizado.
 */

const fs = require('fs')
const path = require('path')
const { dataDir } = require('../../config/paths')
const { validateCookiesFile, getCookiesFilePath, sanitizarCookies } = require('../../services/media/mediaArgs')
const { downloadWhatsAppMedia } = require('../../services/mediaService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

/** Motivo de recusa em português simples (os códigos vêm do validador). */
const MOTIVOS = {
    AUSENTE: 'ainda não recebi nenhum arquivo',
    VAZIO: 'o arquivo está vazio',
    GRANDE_DEMAIS: 'o arquivo passa de 2 MB',
    ILEGIVEL: 'não consegui ler o arquivo',
    FORMATO_INVALIDO: 'o arquivo não está no formato de exportação esperado (Netscape)',
    SEM_DOMINIOS_SUPORTADOS: 'o arquivo não tem login do YouTube, TikTok ou Instagram'
}

function motivoDe(v) {
    return MOTIVOS[v?.reason] || 'o arquivo não passou na conferência'
}

/** Data da última atualização do arquivo, ou null. */
function atualizadoEm(arquivo) {
    try {
        return fs.statSync(arquivo).mtime.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    } catch (err) {
        logger.warn(`[SETCOOKIESGLOBAL] Não foi possível ler a data do arquivo: ${err.message}`)
        return null
    }
}

module.exports = {
    name: 'setcookiesglobal',
    aliases: ['setcookieglobal', 'cookieglobal', 'globalcookies', 'youtubeauth'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Atualiza o login do YouTube que uso para baixar vídeos para todo mundo',
    usage: '[responda ao arquivo cookies.txt]',
    examples: [
        ' — mostra se o acesso ao YouTube está configurado',
        ' (respondendo ao arquivo cookies.txt) — troca o acesso de todos'
    ],
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ text, info, from, client, reply, sender, prefix = '.' }) => {
        const cookiesPath = getCookiesFilePath()
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo
        const quoted = contextInfo?.quotedMessage
        const rawText = (text || '').trim()
        const temDoc = !!(info?.message?.documentMessage || quoted?.documentMessage)

        // Sem conteúdo: status + instruções
        if (!rawText && !temDoc) {
            const st = validateCookiesFile(cookiesPath)
            const quando = st.ok ? atualizadoEm(cookiesPath) : null
            // Formato certo não é login completo: sem estes o YouTube barra a VPS.
            const faltando = st.ok ? require('../../services/media/mediaArgs').cookiesYoutubeFaltando(cookiesPath) : []
            return reply(F.tela({
                emoji: '🌐',
                titulo: !st.ok ? 'Acesso ao YouTube: vazio' : (faltando.length ? 'Acesso ao YouTube: incompleto' : 'Acesso ao YouTube: definido'),
                intro: st.ok && faltando.length
                    ? `O arquivo existe, mas o login está incompleto (faltam: ${faltando.join(', ')}). O YouTube trata isso como acesso anônimo e barra vídeos — e sem ele não baixo em 4K. Exporte de novo, com a conta logada.`
                    : st.ok
                    ? 'Tenho um login válido para baixar do YouTube em nome de quem não configurou o próprio.'
                    : `Estou baixando sem login, e o YouTube pode barrar vídeos. Motivo: ${motivoDe(st)}.`,
                secoes: [
                    st.ok ? {
                        emoji: '📦',
                        titulo: 'Situação',
                        linhas: [
                            F.campo('Itens de login', st.count),
                            quando ? F.campo('Atualizado em', quando) : null
                        ]
                    } : null,
                    {
                        emoji: '📖',
                        titulo: 'Como atualizar',
                        linhas: [
                            '1. No computador, instale a extensão *Get cookies.txt LOCALLY*',
                            '2. Entre no YouTube com a conta e exporte o arquivo cookies.txt',
                            `3. Mande o arquivo aqui e responda a ele com ${F.cmd(prefix, 'setcookiesglobal')}`
                        ]
                    }
                ],
                dica: 'Faça isso no meu privado: o arquivo dá acesso à conta, não deixe ele num grupo.',
                proximos: [{ nome: 'setcookies', oque: 'cada pessoa configura o próprio acesso (vale antes deste)' }],
                prefix
            }))
        }

        try {
            let conteudo = ''
            if (temDoc) {
                await reply('⏳ *Baixando e conferindo o arquivo…*')
                const wrapper = info.message?.documentMessage ? info : {
                    key: { remoteJid: from, id: contextInfo?.stanzaId, participant: contextInfo?.participant },
                    message: quoted
                }
                const buffer = await downloadWhatsAppMedia(wrapper, 'document', client)
                conteudo = buffer.toString('utf8')
            } else {
                conteudo = rawText
            }

            if (!conteudo || conteudo.length < 20) {
                return reply(F.tela({
                    emoji: '❌',
                    titulo: 'Arquivo vazio',
                    intro: 'O que recebi está vazio ou curto demais para ser um cookies.txt.',
                    dica: `Exporte de novo com a extensão e responda ao arquivo com ${F.cmd(prefix, 'setcookiesglobal')}.`,
                    prefix
                }))
            }

            const tmp = path.join(dataDir, 'cookies.txt.tmp')
            fs.writeFileSync(tmp, sanitizarCookies(conteudo), "utf8")
            const v = validateCookiesFile(tmp)
            if (!v.ok) {
                try {
                    fs.unlinkSync(tmp)
                } catch (err) {
                    logger.warn(`[SETCOOKIESGLOBAL] Não foi possível apagar o temporário: ${err.message}`)
                }
                logger.warn(`[SETCOOKIESGLOBAL] Arquivo recusado de ${sender}: ${v.reason} (${v.detail || ''})`)
                return reply(F.tela({
                    emoji: '❌',
                    titulo: 'Arquivo recusado',
                    intro: `Não troquei o acesso atual: ${motivoDe(v)}.`,
                    dica: 'Use a extensão Get cookies.txt LOCALLY com o YouTube aberto e logado, e mande o arquivo sem editar.',
                    proximos: [{ nome: 'setcookiesglobal', oque: 'vê o passo a passo' }],
                    prefix
                }))
            }
            fs.renameSync(tmp, cookiesPath)
            logger.info(`[COOKIE GLOBAL] ${sender} atualizou o cookie global (${v.count} linhas, ${v.domain})`)

            return reply(F.tela({
                emoji: '✅',
                titulo: 'Acesso ao YouTube atualizado',
                intro: 'Passo a usar esse login para todo mundo que não configurou o próprio.',
                secoes: [{ emoji: '📦', titulo: 'Situação', linhas: [F.campo('Itens de login', v.count)] }],
                dica: 'Se a mensagem com o arquivo ficou num grupo, apague-a: ela dá acesso à conta.',
                proximos: [{ nome: 'setcookiesglobal', oque: 'confere a situação' }],
                prefix
            }))
        } catch (err) {
            logger.error('[SETCOOKIESGLOBAL ERROR]', err)
            return reply(F.tela({
                emoji: '⚠️',
                titulo: 'Não consegui trocar o acesso',
                intro: 'Algo falhou ao baixar ou salvar o arquivo, e o acesso anterior continua valendo. Mande o arquivo de novo e responda a ele com o comando.',
                proximos: [{ nome: 'setcookiesglobal', oque: 'vê o passo a passo' }],
                prefix
            }))
        }
    }
}
