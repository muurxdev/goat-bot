/**
 * Comando .ship
 * Calcula a compatibilidade amorosa e casal entre dois membros do grupo
 */

module.exports = {
    name: 'ship',
    aliases: ['casal', 'love', 'amor', 'match', 'shippar'],
    category: 'fun',
    description: 'Calcula a compatibilidade de casal entre dois membros marcados',
    groupOnly: true,
    cooldownMs: 2000,
    execute: async ({ info, sender, reply }) => {
        const mentions = info.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

        let user1 = sender
        let user2 = mentions[0]

        if (mentions.length >= 2) {
            user1 = mentions[0]
            user2 = mentions[1]
        } else if (mentions.length === 1) {
            user2 = mentions[0]
        } else {
            return reply('❌ Marque 1 ou 2 pessoas para shippar.\n\n📌 *Exemplo:* `.ship @pessoa1 @pessoa2` ou `.ship @pessoa`')
        }

        const percent = Math.floor(Math.random() * 101)

        let status = ''
        if (percent === 0) status = '💔 Nem se fossem os últimos humanos na Terra'
        else if (percent <= 25) status = '🥀 Amizade frágil, melhor não forçar'
        else if (percent <= 50) status = '✨ Rola um clima se beberem um pouco'
        else if (percent <= 75) status = '💖 Casal com futuro, já podem marcar o date'
        else if (percent <= 99) status = '💍 Alma gêmeas! O casamento é questão de tempo'
        else status = '🔥 100% AMOR ETERNO & DESTINO DAS ESTRELAS 🔥'

        let doc = `💘 *CALCULADORA DE CASAL & SHIP* 💘\n\n`
        doc += `👩‍❤️‍👨 *Casal:* @${user1.split('@')[0]} ❤️ @${user2.split('@')[0]}\n`
        doc += `📊 *Compatibilidade:* *${percent}%*\n`
        doc += `🔮 *Veredito:* ${status}`

        await reply(doc, [user1, user2])
    }
}

