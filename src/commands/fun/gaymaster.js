/**
 * Comando .gaymaster
 * Calcula a porcentagem cômica no medidor gay com barra visual e títulos
 */

module.exports = {
    name: 'gaymaster',
    aliases: ['gay', 'gaymetro', 'viadometro', 'gayometro'],
    category: 'fun',
    description: 'Calcula o nível no medidor GayMaster de um membro ou de você mesmo',
    cooldownMs: 2000,
    execute: async ({ info, sender, reply, quotedSender }) => {
        const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const target = mentioned || quotedSender || sender

        // Gera porcentagem pseudo-aleatória determinística por dia ou dinâmica
        const percent = Math.floor(Math.random() * 101)

        let barra = ''
        const cheios = Math.round(percent / 10)
        for (let i = 0; i < 10; i++) {
            barra += i < cheios ? '🏳️‍🌈' : '⬛'
        }

        let titulo = ''
        if (percent === 0) titulo = '🛡️ 100% Macho Alfa Blindado'
        else if (percent <= 20) titulo = '👀 Hétero com curiosidade leve'
        else if (percent <= 50) titulo = '💃 Gay casual de fim de semana'
        else if (percent <= 80) titulo = '💅 Gay assumido e glamouroso'
        else if (percent < 100) titulo = '🌈 Diva Suprema das Galáxias'
        else titulo = '👑 GAYMASTER SUPREMO DO UNIVERSO 👑'

        let doc = `🏳️‍🌈 *CALCULADORA GAYMASTER* 🏳️‍🌈\n\n`
        doc += `👤 *Alvo:* @${target.split('@')[0]}\n`
        doc += `📊 *Porcentagem:* *${percent}%*\n`
        doc += `📈 *Nível:* [${barra}]\n`
        doc += `🏆 *Classificação:* ${titulo}`

        await reply(doc, [target])
    }
}

