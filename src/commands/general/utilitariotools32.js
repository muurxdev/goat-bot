/**
 * Comando .validarurl — Valida uma URL e separa suas partes
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools32`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "validarurl",
    aliases: ["checarurl","urlvalida"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Valida uma URL e separa suas partes",
    usage: "<link>",
    examples: ["https://exemplo.com/pagina?x=1 — separa as partes do link"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const u2=(args[0]||'').trim()
    if(!u2) return reply(comoUsar(prefix, ''))
    try{ const x=new URL(u2.startsWith('http')?u2:'https://'+u2)
      return reply(`🔗 *URL VÁLIDA*\n\n╭━〔 PARTES 〕━⬣\n┃ *Protocolo:* ${x.protocol.replace(':','')}\n┃ *Domínio:* ${x.hostname}\n┃ *Caminho:* ${x.pathname||'/'}\n${x.search?`┃ *Query:* ${x.search}\n`:''}╰━━━━━━━━━━━━━━━━━━⬣`)
    }catch(e2){ return reply(`❌ *${u2}* não é uma URL válida.`) }
        } catch (err) {
            logger.error(`[UTIL] .validarurl falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}validarurl\`.`)
        }
    }
};
