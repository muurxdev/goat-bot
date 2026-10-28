/**
 * Comando .sigla — Cria a sigla (acrônimo) de uma frase
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools12`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "sigla",
    aliases: ["acronimo","iniciais"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Cria a sigla (acrônimo) de uma frase",
    usage: "<frase>",
    examples: ["organização das nações unidas — vira ONU"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const txt = args.join(' ').trim()
    if (!txt) return reply(comoUsar(prefix, ''))
    const ignorar = ['de','da','do','das','dos','e','a','o','as','os','em','na','no','para','com']
    const palavras = txt.split(/\s+/).filter(Boolean)
    const relevantes = palavras.filter(p => !ignorar.includes(p.toLowerCase()))
    const sigla = relevantes.map(p=>p[0].toUpperCase()).join('')
    const completa = palavras.map(p=>p[0].toUpperCase()).join('')
    return reply(`🔠 *SIGLA GERADA*\n\n📝 *Frase:* ${txt}\n\n✅ *Sigla:* *${sigla}*\n📋 *Com conectivos:* ${completa}\n\n_Palavras usadas: ${relevantes.length} de ${palavras.length}_`)
        } catch (err) {
            logger.error(`[UTIL] .sigla falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}sigla\`.`)
        }
    }
};
