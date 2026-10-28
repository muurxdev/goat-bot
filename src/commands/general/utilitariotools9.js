/**
 * Comando .ordenar — Ordena uma lista (alfabética ou numérica)
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools9`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "ordenar",
    aliases: ["sort","ordem"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Ordena uma lista (alfabética ou numérica)",
    usage: "<itens separados por vírgula>",
    examples: ["banana, abacaxi, maçã — ordem alfabética","10, 3, 7 — ordem numérica"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const txt = args.join(' ')
    if (!txt) return reply(comoUsar(prefix, ''))
    const itens = txt.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean)
    if (itens.length < 2) return reply('❌ Informe pelo menos 2 itens, separados por vírgula.')
    const numerico = itens.every(i => Number.isFinite(Number(i.replace(',','.'))))
    const ord = numerico
      ? [...itens].sort((a,b)=>Number(a.replace(',','.'))-Number(b.replace(',','.')))
      : [...itens].sort((a,b)=>a.localeCompare(b,'pt-BR'))
    return reply(`🔤 *LISTA ORDENADA* (${numerico?'numérica':'alfabética'})\n\n${ord.map((i,x)=>`${x+1}. ${i}`).join('\n')}\n\n📊 ${itens.length} item(ns)`)
        } catch (err) {
            logger.error(`[UTIL] .ordenar falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}ordenar\`.`)
        }
    }
};
