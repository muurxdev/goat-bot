/**
 * Comando .embaralhar — Embaralha uma lista de itens aleatoriamente
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools11`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "embaralhar",
    aliases: ["shuffle","misturar"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Embaralha uma lista de itens aleatoriamente",
    usage: "<itens separados por vírgula>",
    examples: ["Ana, Bia, Caio, Duda — sorteia a ordem de apresentação"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const txt = args.join(' ')
    if (!txt) return reply(comoUsar(prefix, "Serve para sortear a ordem de apresentações, times ou turnos."))
    const itens = txt.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean)
    if (itens.length < 2) return reply('❌ Informe pelo menos 2 itens.')
    const arr = [...itens]
    for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] }
    return reply(`🔀 *ORDEM SORTEADA*\n\n${arr.map((i,x)=>`${x+1}º — ${i}`).join('\n')}\n\n📊 ${arr.length} item(ns)`)
        } catch (err) {
            logger.error(`[UTIL] .embaralhar falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}embaralhar\`.`)
        }
    }
};
