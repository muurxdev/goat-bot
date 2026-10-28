/**
 * Comando .conversorbase — Converte números entre bases 2, 8, 10 e 16
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools30`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "conversorbase",
    aliases: ["basenum","numerobase"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Converte números entre bases 2, 8, 10 e 16",
    usage: "<valor> <base de origem> <base de destino>",
    examples: ["255 10 2 — decimal para binário","ff 16 10 — hexadecimal para decimal"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const v=(args[0]||'').trim(), de=parseInt(args[1],10)||10, para=parseInt(args[2],10)||2
    if(!v) return reply(comoUsar(prefix, "Aceito as bases 2, 8, 10 e 16."))
    if(![2,8,10,16].includes(de)||![2,8,10,16].includes(para)) return reply('❌ Bases aceitas: 2, 8, 10, 16.')
    const n=parseInt(v,de)
    if(!Number.isFinite(n)) return reply(`❌ \`${v}\` não é válido na base ${de}.`)
    return reply(`🔢 *CONVERSÃO DE BASE*\n\n📥 ${v} (base ${de}) = *${n}* decimal\n📤 *Base ${para}:* \`${n.toString(para).toUpperCase()}\`\n\n╭━〔 TODAS AS BASES 〕━⬣\n┃ Binário: ${n.toString(2)}\n┃ Octal: ${n.toString(8)}\n┃ Decimal: ${n}\n┃ Hex: ${n.toString(16).toUpperCase()}\n╰━━━━━━━━━━━━━━━━━━⬣`)
        } catch (err) {
            logger.error(`[UTIL] .conversorbase falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}conversorbase\`.`)
        }
    }
};
