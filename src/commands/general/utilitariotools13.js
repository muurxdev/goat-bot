/**
 * Comando .raiz — Raiz quadrada, cúbica ou de qualquer índice
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools13`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "raiz",
    aliases: ["sqrt"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Raiz quadrada, cúbica ou de qualquer índice",
    usage: "<número> [índice]",
    examples: ["144 — raiz quadrada","27 3 — raiz cúbica"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const v=Number(String(args[0]||'NaN').replace(',','.')), idx=Number(args[1])||2
    if(!Number.isFinite(v)) return reply(comoUsar(prefix, ''))
    if(v<0&&idx%2===0) return reply('❌ Raiz de índice par não aceita número negativo.')
    const r=v<0?-Math.pow(-v,1/idx):Math.pow(v,1/idx)
    return reply(`√ *RAIZ*\n\n📥 ${v} (índice ${idx})\n📤 *${Number(r.toFixed(8))}*${Number.isInteger(r)?' — exata ✅':''}`)
        } catch (err) {
            logger.error(`[UTIL] .raiz falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}raiz\`.`)
        }
    }
};
