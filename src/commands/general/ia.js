/**
 * Comando .ia / .gpt / .perguntar / .pesquisar
 * Inteligência Artificial GOAT — Respostas diretas, naturais e sem disclaimers
 */

const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

function cleanSearchQuery(rawText) {
    if (!rawText || typeof rawText !== 'string') return ''
    return rawText
        .replace(/[╔═╚╭━╰┃⬣_—#`🔍📌✨🤖💡💬]/g, ' ')
        .replace(/\b(RESULTADOS DA WEB|RESULTADOS|Pesquisando e processando|Inteligência|Sobre o Bot|Dossiê|Diagnóstico)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

module.exports = {
    name: 'ia',
    aliases: ['goat', 'goatia', 'meli', 'ai', 'perguntar', 'pesquisar', 'busca', 'google', 'gpt'],
    category: 'general',
    // Resposta de IA: explicar "API" ou "servidor" é o conteúdo, não jargão a traduzir.
    loreExempt: true,
    subcategory: 'IA & Pesquisa',
    description: 'Responde dúvidas e realiza pesquisas com inteligência artificial natural',
    cooldownMs: 3000,
    execute: async ({ text, args = [], reply, quotedText, directText }) => {
        let query = directText || ''
        if (!query && quotedText) {
            query = cleanSearchQuery(quotedText)
        }
        if (!query && text) {
            query = cleanSearchQuery(text)
        }
        if (!query && args.length > 0) {
            query = args.join(' ').trim()
        }
        query = (query || '').trim()

        const botName = getBotName()

        if (!query) {
            return reply(`🧠 *Pergunte para mim*\n\nEscreva sua dúvida, conversa ou pesquisa depois do comando que eu respondo.\n\n📌 *Exemplos:*\n• \`.ia quem foi Nikola Tesla?\`\n• \`.gpt como funciona um avião?\`\n• \`.ia como você está?\`\n\n💡 *Dica:* Você também pode responder a qualquer mensagem digitando \`.ia\`!`)
        }

        const iaEngine = require('../../services/iaEngine')
        const intencao = iaEngine.detectarIntencao(query)

        // Consultas factuais mais longas podem avisar brevemente; conversas e contas respondem na hora
        if (intencao === 'factual' && query.length > 25) {
            await reply(`🧠 *Processando:* _"${query.slice(0, 50)}"_...`)
        }

        try {
            const r = await iaEngine.responder(query)
            const M = require('../../utils/moldura')

            // Cada linha da resposta entra na caixa com "┃"; sem isso a moldura
            // abria, a resposta vinha solta e o fechamento ficava perdido.
            const doc = [
                M.cabecalho('🧠', `${botName} responde`),
                `📌 _"${query.slice(0, 80)}"_`,
                M.secao('💡', 'Resposta', [r.texto]),
                M.assinatura(botName)
            ].join('\n\n')

            return reply(doc)
        } catch (err) {
            logger.error('[IA COMMAND ERROR]', err)
            return reply('😕 *Não consegui pesquisar isso agora.*\n\nTente de novo em instantes ou escreva a pergunta com outras palavras.')
        }
    }
}
