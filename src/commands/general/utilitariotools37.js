/**
 * Comando .dividirconta — Divide uma conta entre pessoas, com gorjeta
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools37`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "dividirconta",
    aliases: ["contadividida"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Divide uma conta entre pessoas, com gorjeta",
    usage: "<valor> <pessoas> [% gorjeta]",
    examples: ["240 4 — divide entre 4","240 4 10 — com 10% de gorjeta"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const v=Number(String(args[0]||'NaN').replace(',','.')), p=parseInt(args[1],10), g=Number(args[2])||0
    if(!Number.isFinite(v)||!Number.isFinite(p)||p<1) return reply(comoUsar(prefix, ''))
    const tot=v*(1+g/100), cada=tot/p
    return reply(`🍽️ *CONTA DIVIDIDA*\n\n💰 *Conta:* R$ ${v.toFixed(2)}\n${g?`🎁 *Gorjeta ${g}%:* R$ ${(tot-v).toFixed(2)}\n`:''}💵 *Total:* R$ ${tot.toFixed(2)}\n👥 *Pessoas:* ${p}\n\n🎯 *Cada um paga:* *R$ ${cada.toFixed(2)}*`)
        } catch (err) {
            logger.error(`[UTIL] .dividirconta falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}dividirconta\`.`)
        }
    }
};
