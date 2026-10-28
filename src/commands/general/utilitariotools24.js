/**
 * Comando .truncar — Corta um texto no tamanho indicado
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools24`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "truncar",
    aliases: ["limitar"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Corta um texto no tamanho indicado",
    usage: "<tamanho> <texto>",
    examples: ["20 um texto bem comprido para cortar — deixa só 20 letras"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const n=parseInt(args[0],10), t=args.slice(1).join(' ')
    if(!Number.isFinite(n)||!t) return reply(comoUsar(prefix, ''))
    const r=t.length<=n?t:t.slice(0,n).trimEnd()+'…'
    return reply(`✂️ *TEXTO CORTADO*\n\n📤 ${r}\n\n📊 ${t.length} → ${r.length} caracteres`)
        } catch (err) {
            logger.error(`[UTIL] .truncar falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}truncar\`.`)
        }
    }
};
