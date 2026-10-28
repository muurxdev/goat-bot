/**
 * Comando .unicos — Remove itens repetidos de uma lista
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools10`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "unicos",
    aliases: ["duplicados","dedup"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Remove itens repetidos de uma lista",
    usage: "<itens separados por vírgula>",
    examples: ["ana, bia, ana, carlos — tira os repetidos"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const txt = args.join(' ')
    if (!txt) return reply(comoUsar(prefix, ''))
    const itens = txt.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean)
    const vistos = new Map()
    for (const i of itens) { const k=i.toLowerCase(); vistos.set(k,(vistos.get(k)||0)+1) }
    const unicos = [...new Set(itens.map(i=>i.toLowerCase()))]
    const repetidos = [...vistos.entries()].filter(([,n])=>n>1)
    let doc = `🧹 *ITENS ÚNICOS*\n\n${unicos.join(', ')}\n\n📊 ${itens.length} → *${unicos.length}* (${itens.length-unicos.length} removido(s))`
    if (repetidos.length) doc += `\n\n🔁 *Repetidos:* ${repetidos.map(([k,n])=>`${k} (${n}x)`).join(', ')}`
    return reply(doc)
        } catch (err) {
            logger.error(`[UTIL] .unicos falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}unicos\`.`)
        }
    }
};
