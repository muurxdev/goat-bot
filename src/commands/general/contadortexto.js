/**
 * Comando .contadortexto — conta caracteres, palavras, linhas de um texto
 * (o texto pode ser passado no comando ou citado numa resposta).
 */
const ui = require('../../utils/ui')

module.exports = {
    name: 'contadortexto',
    aliases: ['contar', 'contador', 'wordcount', 'contarpalavras'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Conta caracteres, palavras e linhas de um texto (ou de uma mensagem citada)',
    cooldownMs: 1500,
    execute: async ({ args, text, reply, quotedText }) => {
        const alvo = (text || (args || []).join(' ') || quotedText || '').trim()
        if (!alvo) return reply('📝 *Contador* — envie `.contadortexto <texto>` ou responda a uma mensagem.')

        const chars = alvo.length
        const charsSemEspaco = alvo.replace(/\s/g, '').length
        const palavras = (alvo.match(/\S+/g) || []).length
        const linhas = alvo.split(/\n/).length
        const frases = (alvo.match(/[.!?]+/g) || []).length || 1

        return reply(ui.screen({
            title: '📝 *CONTADOR DE TEXTO* 📝',
            sections: [{
                title: 'Resultado', icon: '📊', lines: [
                    `🔤 *Caracteres:* ${chars}`,
                    `🔡 *Sem espaços:* ${charsSemEspaco}`,
                    `📖 *Palavras:* ${palavras}`,
                    `📄 *Linhas:* ${linhas}`,
                    `✍️ *Frases (aprox.):* ${frases}`
                ]
            }]
        }))
    }
}
