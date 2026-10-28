/**
 * Comando .formatartelefone — Formata um telefone brasileiro e identifica o DDD
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools7`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "formatartelefone",
    aliases: ["fone","arrumartelefone"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Formata um telefone brasileiro e identifica o DDD",
    usage: "<número com DDD>",
    examples: ["11987654321 — celular de São Paulo","3533221100 — fixo com DDD 35"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    let d = (args.join('') || '').replace(/\D/g, '')
    if (!d) return reply(comoUsar(prefix, ''))
    if (d.startsWith('55') && d.length > 11) d = d.slice(2)
    if (d.length < 10 || d.length > 11) return reply(`❌ Número deve ter 10 ou 11 dígitos (com DDD) — recebi ${d.length}.`)
    const ddd = d.slice(0,2), resto = d.slice(2)
    const tipo = resto.length === 9 ? '📱 celular' : '☎️ fixo'
    const fmt = resto.length === 9 ? `${resto.slice(0,5)}-${resto.slice(5)}` : `${resto.slice(0,4)}-${resto.slice(4)}`
    return reply(`📞 *TELEFONE FORMATADO*\n\n✅ \`(${ddd}) ${fmt}\`\n🌎 *Internacional:* \`+55 ${ddd} ${fmt}\`\n📍 *DDD:* ${ddd}\n🏷️ *Tipo:* ${tipo}`)
        } catch (err) {
            logger.error(`[UTIL] .formatartelefone falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}formatartelefone\`.`)
        }
    }
};
