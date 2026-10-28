/**
 * Comando .combustivel — Diz se compensa abastecer com etanol ou gasolina
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools8`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "combustivel",
    aliases: ["alcoolougasolina","etanol"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Diz se compensa abastecer com etanol ou gasolina",
    usage: "<preço etanol> <preço gasolina>",
    examples: ["3.79 5.49 — diz qual compensa mais"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const e = Number(String(args[0]||'NaN').replace(',','.')), g = Number(String(args[1]||'NaN').replace(',','.'))
    if (!Number.isFinite(e) || !Number.isFinite(g) || e<=0 || g<=0) return reply(comoUsar(prefix, ''))
    const razao = e / g
    const vale = razao <= 0.7
    return reply(`⛽ *ETANOL OU GASOLINA?*\n\n🌱 *Etanol:* R$ ${e.toFixed(2)}\n🛢️ *Gasolina:* R$ ${g.toFixed(2)}\n📊 *Proporção:* ${(razao*100).toFixed(1)}%\n\n${vale ? '✅ *Compense com ETANOL* — está abaixo de 70% do preço da gasolina.' : '✅ *Compense com GASOLINA* — o etanol está caro demais (acima de 70%).'}\n\n_Regra dos 70%: o etanol rende cerca de 70% do que a gasolina rende._`)
        } catch (err) {
            logger.error(`[UTIL] .combustivel falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}combustivel\`.`)
        }
    }
};
