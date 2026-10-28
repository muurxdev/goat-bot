/**
 * Comando .potencia — Eleva um número a uma potência
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools14`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "potencia",
    aliases: ["elevado","pow"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Eleva um número a uma potência",
    usage: "<base> <expoente>",
    examples: ["2 10 — 2 elevado a 10","5 3 — 5 ao cubo"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const b=Number(String(args[0]||'NaN').replace(',','.')), e=Number(String(args[1]||'NaN').replace(',','.'))
    if(!Number.isFinite(b)||!Number.isFinite(e)) return reply(comoUsar(prefix, ''))
    const r=Math.pow(b,e)
    if(!Number.isFinite(r)) return reply('❌ Resultado grande demais para calcular.')
    return reply(`🔢 *POTÊNCIA*\n\n${b}^${e} = *${r.toLocaleString('pt-BR',{maximumFractionDigits:6})}*`)
        } catch (err) {
            logger.error(`[UTIL] .potencia falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}potencia\`.`)
        }
    }
};
