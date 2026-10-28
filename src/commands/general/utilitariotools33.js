/**
 * Comando .extrairnumeros — Extrai todos os números de um texto
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools33`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "extrairnumeros",
    aliases: ["sonumeros","pegarnumeros"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Extrai todos os números de um texto",
    usage: "<texto>",
    examples: ["comprei 3 pães por 7,50 — acha os números e soma"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const t=args.join(' ')
    if(!t) return reply(comoUsar(prefix, ''))
    const nums=t.match(/-?\d+(?:[.,]\d+)?/g)||[]
    if(!nums.length) return reply('❌ Nenhum número encontrado no texto.')
    const vals=nums.map(x=>Number(x.replace(',','.'))).filter(Number.isFinite)
    const soma=vals.reduce((a,b)=>a+b,0)
    return reply(`🔢 *NÚMEROS ENCONTRADOS*\n\n${nums.join(', ')}\n\n📊 *Quantidade:* ${nums.length}\n➕ *Soma:* ${soma.toLocaleString('pt-BR',{maximumFractionDigits:4})}\n📈 *Maior:* ${Math.max(...vals)} · *Menor:* ${Math.min(...vals)}`)
        } catch (err) {
            logger.error(`[UTIL] .extrairnumeros falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}extrairnumeros\`.`)
        }
    }
};
