/**
 * Comando .extrairlinks — Extrai todos os links de um texto
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools35`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "extrairlinks",
    aliases: ["pegarlinks","solinks"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Extrai todos os links de um texto",
    usage: "<texto>",
    examples: ["veja https://a.com e https://b.com — lista os links"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const t=args.join(' ')
    if(!t) return reply(comoUsar(prefix, ''))
    const l=[...new Set(t.match(/https?:\/\/[^\s]+/g)||[])]
    if(!l.length) return reply('❌ Nenhum link encontrado.')
    return reply(`🔗 *LINKS ENCONTRADOS* (${l.length})\n\n${l.map(x=>'• '+x).join('\n')}`)
        } catch (err) {
            logger.error(`[UTIL] .extrairlinks falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}extrairlinks\`.`)
        }
    }
};
