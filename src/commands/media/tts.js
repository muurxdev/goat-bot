/**
 * Comando .tts / .voz
 * Converte texto em mensagem de áudio / nota de voz interativa
 */

const fs = require('fs')
const { generateTTS } = require('../../services/aiService')
const logger = require('../../core/logger')
const { paraNotaDeVoz } = require('../../services/media/notaDeVoz')

module.exports = {
    name: 'tts',
    aliases: ['voz', 'falar', 'say', 'fala'],
    category: 'media',
    description: 'Converte texto em áudio / mensagem de voz falada',
    cooldownMs: 2000,
    execute: async ({ text, args = [], client, from, reply, info, quotedText }) => {
        let rawInput = (text || quotedText || args.join(' ')).trim()

        if (!rawInput) {
            return reply('🗣️ *Texto em Voz (TTS & Efeitos)*\n\n' +
                '• `.tts <texto>` — Lê o texto em áudio limpo\n' +
                '• `.tts grave <texto>` — Voz grave/monstro\n' +
                '• `.tts esquilo <texto>` — Voz rápida/esquilo\n' +
                '• `.tts radio <texto>` — Efeito de rádio transmissor\n' +
                '• `.tts eco <texto>` — Efeito de estádio/arena do GOAT\n\n' +
                '💡 _Também funciona respondendo a qualquer mensagem com `.tts`._')
        }

        let effect = null
        const firstWord = (args[0] || '').toLowerCase()
        if (['grave', 'esquilo', 'radio', 'eco', 'goat'].includes(firstWord)) {
            effect = firstWord
            // Remove o efeito se não veio de mensagem citada
            if (!quotedText) {
                rawInput = args.slice(1).join(' ').trim()
            }
        }

        if (!rawInput) {
            return reply(`🗣️ Digite a mensagem após o efeito. Exemplo: \`.tts ${effect || 'grave'} Olá pessoal!\``)
        }

        try {
            const audioPath = await generateTTS(rawInput, effect)
            const voz = await paraNotaDeVoz(fs.readFileSync(audioPath))
            try {
                fs.unlinkSync(audioPath)
            } catch (errApagar) {
                logger.warn(`[TTS] Não apaguei o áudio temporário: ${errApagar.message}`)
            }

            await client.sendMessage(from, {
                audio: voz.buffer,
                mimetype: voz.mimetype,
                ptt: true
            }, { quoted: info })
        } catch (err) {
            logger.error('[TTS ERROR]', err)
            return reply('❌ Não consegui gerar o áudio agora. Tente de novo com um texto mais curto.')
        }
    }
}

