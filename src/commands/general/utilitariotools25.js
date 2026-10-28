/**
 * Comando .repetir — Repete um texto N vezes
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools25`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "repetir",
    aliases: ["multiplicartexto"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Repete um texto N vezes",
    usage: "<vezes> <texto>",
    examples: ["3 viva o rei — repete a frase 3 vezes"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const n=parseInt(args[0],10), t=args.slice(1).join(' ')
    if(!Number.isFinite(n)||!t) return reply(comoUsar(prefix, ''))
    if(n<1||n>50) return reply('❌ Entre 1 e 50 repetições.')
    const r=Array(n).fill(t).join(' ')
    if(r.length>2000) return reply('❌ Resultado passaria de 2000 caracteres.')
    return reply(`🔁 *REPETIDO ${n}x*\n\n${r}`)
        } catch (err) {
            logger.error(`[UTIL] .repetir falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}repetir\`.`)
        }
    }
};
