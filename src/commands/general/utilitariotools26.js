/**
 * Comando .mascarar — Oculta parte de um texto (CPF, cartão, telefone)
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools26`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "mascarar",
    aliases: ["ocultar","censurar"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Oculta parte de um texto (CPF, cartão, telefone)",
    usage: "<texto>",
    examples: ["12345678900 — esconde o meio do número"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const t=args.join(' ')
    if(!t) return reply(comoUsar(prefix, "Eu mostro só o começo e o fim, escondendo o meio."))
    if(t.length<=4) return reply('❌ Texto curto demais para mascarar.')
    const vis=Math.max(2,Math.floor(t.length*0.2))
    return reply(`🕶️ *MASCARADO*\n\n📤 ${t.slice(0,vis)}${'*'.repeat(Math.max(3,t.length-vis*2))}${t.slice(-vis)}`)
        } catch (err) {
            logger.error(`[UTIL] .mascarar falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}mascarar\`.`)
        }
    }
};
