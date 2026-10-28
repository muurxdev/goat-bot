/**
 * Comando .gado
 * Medidor de gado e corno com classificação divertida
 */

module.exports = {
    name: 'gado',
    aliases: ['gadometro', 'corno', 'cornometro'],
    category: 'fun',
    description: 'Calcula o nível de gado / corno de um usuário',
    cooldownMs: 2000,
    execute: async ({ info, sender, reply, quotedSender }) => {
        const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const target = mentioned || quotedSender || sender

        const percent = Math.floor(Math.random() * 101)

        let titulo = ''
        if (percent === 0) titulo = '🗿 Anti-Gado: Foco nos negócios'
        else if (percent <= 25) titulo = '🐮 Manda bom dia mas não se humilha'
        else if (percent <= 50) titulo = '🐂 Paga lanche na esperança de um abraço'
        else if (percent <= 80) titulo = '🦌 Assume filho que nem é dele e agradece'
        else titulo = '👑 REI DO PASTO: Chifre de Ouro com Certificado'

        let doc = `🐂 *MEDIDOR DE GADO & CORNO* 🐂\n\n`
        doc += `👤 *Alvo:* @${target.split('@')[0]}\n`
        doc += `📊 *Porcentagem:* *${percent}%*\n`
        doc += `🏆 *Diagnóstico:* ${titulo}`

        await reply(doc, [target])
    }
}

