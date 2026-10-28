/**
 * Comando .invertertexto — inverte um texto (e opcionalmente a ordem das palavras).
 */
module.exports = {
    name: 'invertertexto',
    aliases: ['inverter', 'reverse', 'aoContrario', 'espelhartexto'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Inverte um texto de trás pra frente (ex.: .invertertexto Ola mundo)',
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => {
        const alvo = (text || (args || []).join(' ') || quotedText || '').trim()
        if (!alvo) return reply('🔄 *Inverter* — envie `.invertertexto <texto>` ou responda a uma mensagem.')
        const invertido = [...alvo].reverse().join('')
        const palavrasInvertidas = alvo.split(/\s+/).reverse().join(' ')
        return reply(`🔄 *Texto invertido:*\n${invertido}\n\n🔁 *Palavras ao contrário:*\n${palavrasInvertidas}`)
    }
}
