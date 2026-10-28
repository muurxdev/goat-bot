/**
 * Comando .extrairemails — Extrai todos os e-mails de um texto
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools34`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "extrairemails",
    aliases: ["pegaremails","soemails"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Extrai todos os e-mails de um texto",
    usage: "<texto>",
    examples: ["fale com ana@x.com ou bia@y.com — lista os e-mails"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const t=args.join(' ')
    if(!t) return reply(comoUsar(prefix, ''))
    const e=[...new Set(t.match(/[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}/g)||[])]
    if(!e.length) return reply('❌ Nenhum e-mail encontrado.')
    return reply(`📧 *E-MAILS ENCONTRADOS* (${e.length})\n\n${e.map(x=>'• '+x).join('\n')}`)
        } catch (err) {
            logger.error(`[UTIL] .extrairemails falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}extrairemails\`.`)
        }
    }
};
