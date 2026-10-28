/**
 * Comando .silabas — Estima a separação silábica de uma palavra
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools27`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "silabas",
    aliases: ["separarsilabas"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Estima a separação silábica de uma palavra",
    usage: "<palavra>",
    examples: ["paralelepípedo — separa as sílabas"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const p=(args[0]||'').toLowerCase()
    if(!p) return reply(comoUsar(prefix, ''))
    const s=p.replace(/([aeiouáéíóúâêôãõ]+)/g,'$1-').replace(/-$/,'').split('-').filter(Boolean)
    return reply(`🔤 *SEPARAÇÃO SILÁBICA*\n\n📥 ${p}\n📤 ${s.join(' · ')}\n\n📊 ${s.length} sílaba(s) _(estimativa)_`)
        } catch (err) {
            logger.error(`[UTIL] .silabas falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}silabas\`.`)
        }
    }
};
