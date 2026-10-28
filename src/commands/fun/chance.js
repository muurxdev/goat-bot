/**
 * Comando .chance
 * Calcula a probabilidade aleatória de qualquer pergunta ou evento
 */

module.exports = {
    name: 'chance',
    aliases: ['probabilidade', 'qualachance'],
    category: 'fun',
    description: 'Calcula a chance percentual de acontecer algo',
    cooldownMs: 2000,
    execute: async ({ text, reply }) => {
        if (!text) {
            return reply('❌ Faça uma pergunta ou informe o evento.\n\n📌 *Exemplo:* `.chance de eu ficar milionário hoje`')
        }

        const percent = Math.floor(Math.random() * 101)

        let doc = `🎲 *CALCULADORA DE PROBABILIDADE*\n\n`
        doc += `❓ *Pergunta:* _${text.trim()}_\n`
        doc += `📊 *Chance:* *${percent}%*`

        await reply(doc)
    }
}

