const logger = require('../../core/logger')

const MENSAGENS = [
    'deu um abraço tão apertado que quase quebrou uma costela! 🤗',
    'envolveu seus braços com todo carinho e afeto. ❤️',
    'deu um abraço fofo e reconfortante que cura qualquer dia ruim! 💕',
    'abraçou com tanta força que o outro quase desmaiou de felicidade! 🥰',
    'agarrou e não quis mais soltar... que abraço mais gostoso! 🤗✨',
    'mandou um abraço de urso polar — quentinho e impossível de escapar! 🐻'
]

module.exports = {
    name: 'abracar',
    aliases: ['abraçar', 'abraço'],
    category: 'fun',
    subcategory: 'Interação',
    description: 'Dê um abraço carinhoso em alguém do grupo',
    cooldownMs: 3000,
    execute: async ({ sender, reply, mentionedJid, from }) => {
        // mentionedJid é um ARRAY (o dispatcher entrega a lista de marcados).
        // Tratá-lo como string quebrava o comando com "target.split is not a function".
        const target = Array.isArray(mentionedJid) ? mentionedJid[0] : mentionedJid
        if (!target || target === sender) {
            return reply(
                `🤗 @${sender.split('@')[0]} está precisando de um abraço...\n` +
                `Ninguém pra abraçar? Mencione alguém! \`.abracar @user\``
            )
        }

        const frase = MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)]
        const mentions = [sender, target]

        return reply(
            `🤗 @${sender.split('@')[0]} *abraçou* @${target.split('@')[0]}!\n\n` +
            `✨ _${frase}_`,
            mentions
        )
    }
}
