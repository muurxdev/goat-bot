/**
 * Comando .metaeconomia — Quanto guardar por mês para atingir uma meta
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools41`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "metaeconomia",
    aliases: ["juntardinheiro","metagrana"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Quanto guardar por mês para atingir uma meta",
    usage: "<valor> <meses>",
    examples: ["12000 10 — quanto guardar por mês"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const meta=Number(String(args[0]||'NaN').replace(',','.')), meses=parseInt(args[1],10)
    if(!Number.isFinite(meta)||!Number.isFinite(meses)||meses<1) return reply(comoUsar(prefix, ''))
    const mes=meta/meses
    return reply(`🎯 *META DE ECONOMIA*\n\n💰 *Objetivo:* R$ ${meta.toFixed(2)}\n📅 *Prazo:* ${meses} mês(es)\n\n╭━〔 QUANTO GUARDAR 〕━⬣\n┃ *Por mês:* R$ ${mes.toFixed(2)}\n┃ Por semana: R$ ${(mes/4.33).toFixed(2)}\n┃ Por dia: R$ ${(mes/30).toFixed(2)}\n╰━━━━━━━━━━━━━━━━━━⬣`)
        } catch (err) {
            logger.error(`[UTIL] .metaeconomia falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}metaeconomia\`.`)
        }
    }
};
